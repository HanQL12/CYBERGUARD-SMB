#!/usr/bin/env python3
"""
Email Security Analyzer Backend API
Sequential Analysis: File > URL > CEO Fraud
"""


from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import hashlib
import re
import time
import os
import unicodedata
from logging.handlers import RotatingFileHandler
from datetime import datetime
from functools import lru_cache
from typing import Dict, Any, Optional

from gmail_helper import GmailHelper
from constants import (
    PHISHING_LABEL, SAFE_LABEL, VIRUSTOTAL_TIMEOUT,
    VIRUSTOTAL_WAIT_TIME, CEO_FRAUD_CONFIDENCE_THRESHOLD
)
from email_analyzer import extract_urls
from config import Config
from error_handlers import (
    register_error_handlers, ValidationError, NotFoundError, ExternalAPIError
)
from validators import (
    validate_email_data, validate_scan_url_request,
    validate_email_id, validate_email_ids, sanitize_string
)

# Configure logging with rotation
import logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL.upper(), logging.INFO),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        RotatingFileHandler(
            Config.LOG_FILE,
            maxBytes=Config.LOG_MAX_BYTES,
            backupCount=Config.LOG_BACKUP_COUNT,
            encoding='utf-8'
        )
    ]
)
logger = logging.getLogger(__name__)

# Create a session with connection pooling and retry strategy
def create_session():
    session = requests.Session()
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "POST"]
    )
    adapter = HTTPAdapter(
        max_retries=retry_strategy,
        pool_connections=10,
        pool_maxsize=20
    )
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

# Global session for reuse
http_session = create_session()

# Validate configuration
is_valid, warnings = Config.validate()
if warnings:
    for warning in warnings:
        logger.warning(warning)

app = Flask(__name__)

# Configure CORS with specific origins
cors_origins = Config.get_cors_origins()
CORS(app, origins=cors_origins, supports_credentials=True)
logger.info(f"CORS configured for origins: {', '.join(cors_origins)}")

# Register error handlers
register_error_handlers(app)

# Import VirusTotal Manager
from virustotal_manager import VirusTotalKeyManager

# Initialize VirusTotal Key Manager
vt_key_manager = VirusTotalKeyManager(
    Config.VIRUSTOTAL_API_KEY_1,
    Config.VIRUSTOTAL_API_KEY_2
)

# Initialize Gmail Helper
gmail_helper = GmailHelper()

# API Keys for CEO Fraud Detection
GEMINI_API_KEY = Config.GEMINI_API_KEY
GROQ_API_KEY = Config.GROQ_API_KEY
HUGGINGFACE_API_KEY = Config.HUGGINGFACE_API_KEY
VIRUSTOTAL_BASE_URL = Config.VIRUSTOTAL_BASE_URL


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Email Security Analyzer"
    })


# Internal endpoint - used by gmail_scanner.py, not directly by frontend
@app.route('/analyze-email', methods=['POST'])
def analyze_email():
    """
    Main endpoint: Analyze email sequentially
    Priority: File > URL > CEO Fraud
    
    Request body:
    {
        "subject": "Email subject",
        "body": "Email body text",
        "html": "Email HTML content",
        "attachments": [
            {
                "filename": "file.pdf",
                "data": "base64_encoded_file_data",
                "mimeType": "application/pdf"
            }
        ],
        "urls": ["https://example.com"]  # Optional: pre-extracted URLs
    }
    """
    try:
        data = request.get_json()
        if not data:
            raise ValidationError("Request body is required")
        
        # Validate input
        is_valid, error_msg = validate_email_data(data)
        if not is_valid:
            raise ValidationError(error_msg or "Invalid request data")
        
        logger.info(f"Received email analysis request: {data.get('subject', 'No subject')}")
        
        # Extract and sanitize data
        subject = sanitize_string(data.get('subject', ''), max_length=500)
        body = sanitize_string(data.get('body', ''), max_length=50000)
        html = sanitize_string(data.get('html', ''), max_length=100000)
        attachments = data.get('attachments', [])
        pre_extracted_urls = data.get('urls', [])
        
        # Use shared analysis logic
        result = _perform_email_analysis(
            subject, body, html, attachments, pre_extracted_urls, include_label=True
        )
        
        return jsonify(result)
        
    except ValidationError:
        raise  # Re-raise validation errors (handled by error handler)
    except Exception as e:
        logger.error(f"Error analyzing email: {str(e)}", exc_info=True)
        raise  # Let error handler catch it


# Removed unused endpoints: /analyze-url, /analyze-file, /detect-ceo-fraud
# These are only used internally, not by frontend


@app.route('/dashboard-data', methods=['GET'])
def dashboard_data():
    """
    Get dashboard data (statistics and emails)
    Replaces n8n /dashboard-data endpoint
    """
    try:
        # Check if cache refresh is requested
        use_cache = request.args.get('refresh', 'false').lower() != 'true'
        
        data = gmail_helper.get_dashboard_data(max_emails=100, use_cache=use_cache)
        
        # Set last_updated timestamp
        data['statistics']['last_updated'] = datetime.now().isoformat()
        
        return jsonify(data)
        
    except Exception as e:
        logger.error(f"Error getting dashboard data: {str(e)}", exc_info=True)
        return jsonify({
            'statistics': {
                'total_emails_scanned': 0,
                'phishing_detected': 0,
                'safe_emails': 0,
                'workflow_status': 'error',
                'last_updated': datetime.now().isoformat(),
                'phishing_rate': '0%'
            },
            'emails': {'emails': []}
        }), 500


@app.route('/reports-data', methods=['GET'])
def reports_data():
    """
    Get reports data (daily trends, threat types, summary)
    """
    try:
        # Get days parameter (default 7)
        days = int(request.args.get('days', 7))
        use_cache = request.args.get('refresh', 'false').lower() != 'true'
        
        data = gmail_helper.get_reports_data(days=days, use_cache=use_cache)
        
        return jsonify(data)
        
    except Exception as e:
        logger.error(f"Error getting reports data: {str(e)}", exc_info=True)
        return jsonify({
            'summary': {
                'total_emails': 0,
                'threats_detected': 0,
                'detection_rate': '0%',
                'avg_analysis_time': '0.0s'
            },
            'daily_trends': [],
            'threat_types': []
        }), 500


@app.route('/tasks-data', methods=['GET'])
def tasks_data():
    """
    Get processed and unprocessed emails for tasks tab
    """
    try:
        use_cache = request.args.get('refresh', 'false').lower() != 'true'
        
        # Authenticate if needed
        if not gmail_helper.service:
            if not gmail_helper.authenticate():
                return jsonify({
                    'processed': [],
                    'unprocessed': []
                }), 500
        
        # Get processed emails (emails with labels)
        phishing_messages = gmail_helper.get_emails_by_label(PHISHING_LABEL, max_results=100)
        safe_messages = gmail_helper.get_emails_by_label(SAFE_LABEL, max_results=100)
        
        # Format processed emails
        processed = []
        for msg in phishing_messages:
            email_details = gmail_helper.get_email_details(msg['id'])
            if email_details:
                processed.append({
                    'id': email_details['id'],
                    'subject': email_details['subject'],
                    'sender': email_details['sender'],
                    'date': email_details['date'],
                    'is_phishing': True,
                    'is_processed': True,
                    'status': 'blocked',
                    'url_count': email_details.get('url_count', 0)
                })
        
        for msg in safe_messages:
            email_details = gmail_helper.get_email_details(msg['id'])
            if email_details:
                processed.append({
                    'id': email_details['id'],
                    'subject': email_details['subject'],
                    'sender': email_details['sender'],
                    'date': email_details['date'],
                    'is_phishing': False,
                    'is_processed': True,
                    'status': 'verified',
                    'url_count': email_details.get('url_count', 0)
                })
        
        # Get unprocessed emails (unread emails without labels)
        try:
            # Get unread emails excluding those with our labels
            unprocessed_messages = gmail_helper.get_unread_emails(
                max_results=50,
                exclude_labels=[PHISHING_LABEL, SAFE_LABEL]
            )
            
            # Format unprocessed emails
            unprocessed = []
            processed_ids = {p['id'] for p in processed}
            
            for msg in unprocessed_messages:
                if msg['id'] not in processed_ids:
                    email_details = gmail_helper.get_email_details(msg['id'])
                    if email_details:
                        unprocessed.append({
                            'id': email_details['id'],
                            'subject': email_details['subject'],
                            'sender': email_details['sender'],
                            'date': email_details['date'],
                            'is_phishing': False,
                            'is_processed': False,
                            'status': 'pending',
                            'url_count': email_details.get('url_count', 0)
                        })
        except Exception as e:
            logger.error(f"Error getting unprocessed emails: {str(e)}")
            unprocessed = []
        
        # Sort by date (newest first)
        processed.sort(key=lambda x: x.get('date', ''), reverse=True)
        unprocessed.sort(key=lambda x: x.get('date', ''), reverse=True)
        
        return jsonify({
            'processed': processed,
            'unprocessed': unprocessed
        })
        
    except Exception as e:
        logger.error(f"Error getting tasks data: {str(e)}", exc_info=True)
        return jsonify({
            'processed': [],
            'unprocessed': []
        }), 500


@app.route('/scan-email-urgent', methods=['POST'])
def scan_email_urgent():
    """
    Scan a single email urgently - Full analysis with file, URL, and CEO fraud detection
    """
    try:
        data = request.get_json()
        if not data:
            raise ValidationError("Request body is required")
        
        email_id = data.get('email_id')
        if not email_id:
            raise ValidationError("email_id is required")
        
        if not validate_email_id(email_id):
            raise ValidationError("Invalid email_id format")
        
        logger.info(f"🔍 Urgent scan requested for email: {email_id}")
        
        # Authenticate if needed
        if not gmail_helper.service:
            if not gmail_helper.authenticate():
                return jsonify({"error": "Authentication failed"}), 500
        
        # Get full email details including attachments
        email_details = gmail_helper.get_email_details_with_attachments(email_id)
        if not email_details:
            raise NotFoundError("Email not found")
        
        logger.info(f"📧 Email subject: {email_details.get('subject', 'No subject')}")
        
        # Prepare payload for full analysis
        payload = {
            'subject': email_details.get('subject', ''),
            'body': email_details.get('body', ''),
            'html': email_details.get('html', ''),
            'urls': email_details.get('urls', []),
            'attachments': email_details.get('attachments', [])
        }
        
        # Analyze email with full logic
        result_data = analyze_email_logic_full(payload)
        
        is_phishing = result_data.get('is_phishing', False)
        threats = result_data.get('threats', [])
        
        # Label email based on result
        if is_phishing:
            label_id = PHISHING_LABEL
            logger.warning(f"🚨 PHISHING detected: {email_id} - Threats: {threats}")
        else:
            label_id = SAFE_LABEL
            logger.info(f"✅ Email is SAFE: {email_id}")
        
        # Add label to email
        try:
            gmail_helper.service.users().messages().modify(
                userId='me',
                id=email_id,
                body={'addLabelIds': [label_id]}
            ).execute()
            logger.info(f"✅ Labeled email {email_id} with {label_id}")
            
            # Mark as read
            gmail_helper.service.users().messages().modify(
                userId='me',
                id=email_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
            logger.info(f"✅ Marked email {email_id} as read")
        except Exception as e:
            logger.warning(f"Could not label/mark email: {str(e)}")
        
        return jsonify({
            'success': True,
            'email_id': email_id,
            'is_phishing': is_phishing,
            'threats': threats,
            'subject': email_details.get('subject', '')
        })
        
    except (ValidationError, NotFoundError):
        raise  # Re-raise (handled by error handler)
    except Exception as e:
        logger.error(f"Error scanning email urgently: {str(e)}", exc_info=True)
        raise  # Let error handler catch it


@app.route('/scan-emails-urgent', methods=['POST'])
def scan_emails_urgent():
    """
    Scan multiple emails urgently - Parallel processing with dual API keys
    Each API key processes one email simultaneously
    """
    try:
        data = request.get_json()
        if not data:
            raise ValidationError("Request body is required")
        
        email_ids = data.get('email_ids', [])
        if not email_ids:
            raise ValidationError("email_ids is required")
        
        if not validate_email_ids(email_ids):
            raise ValidationError("Invalid email_ids format or too many emails (max 100)")
        
        logger.info(f"🔍 Urgent parallel batch scan requested for {len(email_ids)} emails")
        
        if not gmail_helper.service:
            if not gmail_helper.authenticate():
                return jsonify({"error": "Authentication failed"}), 500
        
        # Use parallel processing if we have multiple emails and multiple API keys
        if len(email_ids) > 1 and len(vt_key_manager.keys) > 1:
            return scan_emails_parallel(email_ids)
        
        # Fallback to sequential processing
        processed_count = 0
        phishing_count = 0
        safe_count = 0
        errors = []
        
        for idx, email_id in enumerate(email_ids, 1):
            try:
                logger.info(f"Processing email {idx}/{len(email_ids)}: {email_id}")
                
                result = process_single_email(email_id)
                if result:
                    processed_count += 1
                    if result['is_phishing']:
                        phishing_count += 1
                    else:
                        safe_count += 1
                else:
                    errors.append(f"Email {email_id}: Processing failed")
                
            except Exception as e:
                logger.error(f"Error processing email {email_id}: {str(e)}")
                errors.append(f"Email {email_id}: {str(e)}")
                continue
        
        logger.info(f"✅ Batch scan completed: {processed_count}/{len(email_ids)} processed ({phishing_count} phishing, {safe_count} safe)")
        
        return jsonify({
            'success': True,
            'processed_count': processed_count,
            'phishing_count': phishing_count,
            'safe_count': safe_count,
            'total': len(email_ids),
            'errors': errors if errors else None
        })
        
    except ValidationError:
        raise  # Re-raise (handled by error handler)
    except Exception as e:
        logger.error(f"Error scanning emails urgently: {str(e)}", exc_info=True)
        raise  # Let error handler catch it


def process_single_email(email_id):
    """Process a single email - extracted for parallel processing"""
    try:
        # Use thread-safe Gmail service for parallel processing
        thread_safe_service = gmail_helper.get_thread_safe_service()
        if not thread_safe_service:
            logger.error("Unable to build Gmail service for thread-safe processing")
            return None

        # Get full email details with attachments
        email_details = gmail_helper.get_email_details_with_attachments(
            email_id,
            service=thread_safe_service
        )
        if not email_details:
            logger.warning(f"Email {email_id} not found")
            return None
        
        # Analyze email with full logic
        payload = {
            'subject': email_details.get('subject', ''),
            'body': email_details.get('body', ''),
            'html': email_details.get('html', ''),
            'urls': email_details.get('urls', []),
            'attachments': email_details.get('attachments', [])
        }
        
        result = analyze_email_logic_full(payload)
        is_phishing = result.get('is_phishing', False)
        
        # Label email
        if is_phishing:
            label_id = PHISHING_LABEL
            logger.warning(f"🚨 PHISHING detected: {email_id}")
        else:
            label_id = SAFE_LABEL
            logger.info(f"✅ Email is SAFE: {email_id}")
        
        # Add label
        thread_safe_service.users().messages().modify(
            userId='me',
            id=email_id,
            body={'addLabelIds': [label_id]}
        ).execute()
        
        # Mark as read
        thread_safe_service.users().messages().modify(
            userId='me',
            id=email_id,
            body={'removeLabelIds': ['UNREAD']}
        ).execute()
        
        return {
            'email_id': email_id,
            'is_phishing': is_phishing,
            'subject': email_details.get('subject', '')
        }
        
    except Exception as e:
        logger.error(f"Error processing email {email_id}: {str(e)}")
        return None


def scan_emails_parallel(email_ids):
    """Scan multiple emails in parallel using dual API keys"""
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    processed_count = 0
    phishing_count = 0
    safe_count = 0
    errors = []
    
    # Determine number of workers (max 2 for 2 API keys)
    max_workers = min(len(vt_key_manager.keys), len(email_ids), 2)
    
    logger.info(f"🚀 Starting parallel scan: {len(email_ids)} emails with {max_workers} workers (API keys)")
    
    def process_email_with_key(email_id, worker_id):
        """Process email with specific worker/API key assignment"""
        try:
            logger.info(f"Worker {worker_id} processing email: {email_id}")
            result = process_single_email(email_id)
            return {
                'success': result is not None,
                'result': result,
                'email_id': email_id,
                'worker_id': worker_id
            }
        except Exception as e:
            logger.error(f"Worker {worker_id} error processing {email_id}: {str(e)}")
            return {
                'success': False,
                'result': None,
                'email_id': email_id,
                'worker_id': worker_id,
                'error': str(e)
            }
    
    # Use ThreadPoolExecutor for parallel processing
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all emails for processing
        # Distribute emails to workers (round-robin assignment)
        futures = []
        for idx, email_id in enumerate(email_ids):
            worker_id = idx % max_workers
            future = executor.submit(process_email_with_key, email_id, worker_id)
            futures.append(future)
        
        # Collect results as they complete
        for future in as_completed(futures):
            try:
                result_data = future.result()
                if result_data['success'] and result_data['result']:
                    processed_count += 1
                    if result_data['result']['is_phishing']:
                        phishing_count += 1
                    else:
                        safe_count += 1
                else:
                    errors.append(f"Email {result_data['email_id']}: {result_data.get('error', 'Processing failed')}")
            except Exception as e:
                logger.error(f"Error getting result from future: {str(e)}")
                errors.append(f"Unknown error: {str(e)}")
    
    logger.info(f"✅ Parallel batch scan completed: {processed_count}/{len(email_ids)} processed ({phishing_count} phishing, {safe_count} safe)")
    
    return jsonify({
        'success': True,
        'processed_count': processed_count,
        'phishing_count': phishing_count,
        'safe_count': safe_count,
        'total': len(email_ids),
        'errors': errors if errors else None,
        'method': 'parallel',
        'workers': max_workers
    })


def _perform_email_analysis(
    subject: str,
    body: str,
    html: str,
    attachments: list,
    pre_extracted_urls: Optional[list] = None,
    include_label: bool = False
) -> Dict[str, Any]:
    """
    Core email analysis logic (shared by analyze_email and analyze_email_logic_full)
    Priority: File > URL > CEO Fraud
    
    Args:
        subject: Email subject
        body: Email body text
        html: Email HTML content
        attachments: List of attachments
        pre_extracted_urls: Pre-extracted URLs (optional)
        include_label: Whether to include label in response
    
    Returns:
        Analysis result dictionary
    """
    threats = []
    details = {}
    
    # STEP 1: File Analysis (Priority 1)
    if attachments:
        logger.info(f"Analyzing {len(attachments)} file(s)...")
        file_result = analyze_files(attachments)
        details['file_analysis'] = file_result
        
        if file_result['is_malicious']:
            threats.append('malicious_file')
            logger.warning(f"🚨 MALICIOUS FILE DETECTED: {file_result['total_malicious']} detections")
            result = {
                "is_phishing": True,
                "threats": threats,
                "details": details,
                "analysis_order": "file"
            }
            if include_label:
                result["label"] = PHISHING_LABEL
            return result
    
    # STEP 2: URL Analysis (Priority 2)
    urls = pre_extracted_urls or extract_urls(subject, body, html)
    if urls:
        logger.info(f"Analyzing {len(urls)} URL(s)...")
        url_result = analyze_urls(urls)
        details['url_analysis'] = url_result
        
        if url_result['is_malicious']:
            threats.append('malicious_url')
            logger.warning(f"🚨 MALICIOUS URL DETECTED: {url_result['total_malicious']} detections")
            result = {
                "is_phishing": True,
                "threats": threats,
                "details": details,
                "analysis_order": "url"
            }
            if include_label:
                result["label"] = PHISHING_LABEL
            return result
    
    # STEP 3: CEO Fraud Detection (Priority 3)
    logger.info("Analyzing CEO fraud...")
    url_analysis = details.get('url_analysis', {})
    file_analysis = details.get('file_analysis', {})
    
    ceo_result = detect_ceo_fraud_with_chatbot(
        subject,
        body,
        html,
        url_analysis,
        file_analysis
    ) or {}
    
    ceo_confidence = ceo_result.get('confidence', 0) or 0
    ceo_detected = ceo_result.get('detected', False)
    
    details['ceo_fraud'] = ceo_result
    
    if ceo_detected and ceo_confidence >= CEO_FRAUD_CONFIDENCE_THRESHOLD:
        threats.append('ceo_fraud')
        logger.warning(f"🚨 CEO FRAUD DETECTED: Confidence {ceo_confidence}%")
        result = {
            "is_phishing": True,
            "threats": threats,
            "details": details,
            "analysis_order": "ceo_fraud"
        }
        if include_label:
            result["label"] = PHISHING_LABEL
        return result
    
    # All checks passed - SAFE
    logger.info("✅ Email is SAFE - All checks passed")
    result = {
        "is_phishing": False,
        "threats": [],
        "details": details,
        "analysis_order": "all_safe"
    }
    if include_label:
        result["label"] = SAFE_LABEL
    return result


def analyze_email_logic_full(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Full email analysis logic (used by urgent scan endpoints)
    Priority: File > URL > CEO Fraud
    """
    subject = data.get('subject', '')
    body = data.get('body', '')
    html = data.get('html', '')
    attachments = data.get('attachments', [])
    pre_extracted_urls = data.get('urls', [])
    
    return _perform_email_analysis(
        subject, body, html, attachments, pre_extracted_urls, include_label=False
    )


@app.route('/scan-url', methods=['POST'])
def scan_url():
    """
    Scan URL for threats using VirusTotal API
    Returns detailed analysis results from VirusTotal
    """
    try:
        data = request.get_json()
        if not data:
            raise ValidationError("Request body is required")
        
        # Validate URL
        is_valid, error_msg = validate_scan_url_request(data)
        if not is_valid:
            raise ValidationError(error_msg or "Invalid URL")
        
        url = data.get('url', '').strip()
        logger.info(f"🔍 Scanning URL with VirusTotal: {url}")
        
        # Use VirusTotal URL analysis
        url_results = analyze_urls([url])
        
        if url_results['url_results']:
            result = url_results['url_results'][0]
            is_malicious = result.get('is_malicious', False)
            malicious_count = result.get('malicious', 0)
            suspicious_count = result.get('suspicious', 0)
            harmless_count = result.get('harmless', 0)
            total_engines = malicious_count + suspicious_count + harmless_count
            
            # Determine risk level based on VirusTotal results
            if malicious_count > 0:
                risk_level = 'HIGH'
                threat_type = 'Phishing' if malicious_count >= 5 else 'Malware'
                confidence = min(95, 50 + (malicious_count * 3))
                categories = ['phishing', 'malware']
            elif suspicious_count > 0:
                risk_level = 'MEDIUM'
                threat_type = 'Suspicious'
                confidence = 30 + (suspicious_count * 2)
                categories = ['suspicious']
            else:
                risk_level = 'LOW'
                threat_type = 'Safe'
                confidence = max(5, min(20, harmless_count))
                categories = ['safe']
            
            return jsonify({
                'url': url,
                'is_malicious': is_malicious,
                'malicious': malicious_count,
                'suspicious': suspicious_count,
                'harmless': harmless_count,
                'total_engines': total_engines,
                'risk_level': risk_level,
                'threat_type': threat_type,
                'confidence': min(95, max(5, confidence)),
                'vendors': f"{malicious_count}/{total_engines if total_engines > 0 else 90}",
                'categories': categories,
                'timestamp': datetime.now().isoformat(),
                'source': 'VirusTotal',
                'scan_id': result.get('scan_id')
            })
        else:
            # Fallback if no results
            logger.warning(f"No results from VirusTotal for URL: {url}")
            return jsonify({
                'url': url,
                'is_malicious': False,
                'malicious': 0,
                'suspicious': 0,
                'harmless': 0,
                'total_engines': 0,
                'risk_level': 'LOW',
                'threat_type': 'Safe',
                'confidence': 5,
                'vendors': '0/90',
                'categories': ['safe'],
                'timestamp': datetime.now().isoformat(),
                'source': 'VirusTotal',
                'error': 'No results available'
            })
        
    except ValidationError:
        raise  # Re-raise (handled by error handler)
    except Exception as e:
        logger.error(f"Error scanning URL: {str(e)}", exc_info=True)
        raise ExternalAPIError(str(e), service="VirusTotal")


# Helper Functions

def analyze_files(attachments: list) -> Dict[str, Any]:
    """Analyze file attachments using VirusTotal"""
    total_malicious = 0
    file_results = []
    
    for attachment in attachments:
        filename = attachment.get('filename', 'unknown')
        file_data = attachment.get('data')  # Base64 encoded
        
        if not file_data:
            continue
        
        try:
            # Decode base64
            import base64
            file_bytes = base64.b64decode(file_data)
            
            # Calculate SHA256 hash
            file_hash = hashlib.sha256(file_bytes).hexdigest()
            
            # Check VirusTotal
            result = check_virustotal_file(file_hash)
            
            file_results.append({
                "filename": filename,
                "hash": file_hash,
                "malicious": result['malicious'],
                "suspicious": result.get('suspicious', 0),
                "harmless": result.get('harmless', 0)
            })
            
            total_malicious += result['malicious']
            
        except Exception as e:
            logger.error(f"Error analyzing file {filename}: {str(e)}")
            continue
    
    return {
        "is_malicious": total_malicious > 0,
        "total_malicious": total_malicious,
        "total_files": len(attachments),
        "file_results": file_results
    }


def analyze_urls(urls: list) -> Dict[str, Any]:
    """Analyze URLs using VirusTotal with parallel processing and dual API keys"""
    total_malicious = 0
    url_results = []
    
    # Use parallel processing for multiple URLs with dual API keys
    if len(urls) > 1 and len(vt_key_manager.keys) > 1:
        return analyze_urls_parallel(urls)
    
    # Sequential processing for single URL or single API key
    for url in urls:
        try:
            # Submit URL to VirusTotal
            submit_response = submit_url_to_virustotal(url)
            if not submit_response or 'id' not in submit_response:
                logger.warning(f"Failed to submit URL: {url}")
                url_results.append({
                    "url": url,
                    "malicious": 0,
                    "suspicious": 0,
                    "harmless": 0,
                    "is_malicious": False,
                    "error": "Failed to submit to VirusTotal"
                })
                continue
            
            scan_id = submit_response['id']
            logger.info(f"URL submitted to VirusTotal, scan_id: {scan_id}, waiting {VIRUSTOTAL_WAIT_TIME} seconds...")
            
            # Wait for VirusTotal to process
            time.sleep(VIRUSTOTAL_WAIT_TIME)
            
            # Get results
            result = get_virustotal_url_results(scan_id)
            
            malicious = result.get('malicious', 0)
            suspicious = result.get('suspicious', 0)
            harmless = result.get('harmless', 0)
            is_malicious = malicious > 0
            
            url_results.append({
                "url": url,
                "malicious": malicious,
                "suspicious": suspicious,
                "harmless": harmless,
                "is_malicious": is_malicious,
                "scan_id": scan_id
            })
            
            if is_malicious:
                total_malicious += malicious
                logger.warning(f"🚨 Malicious URL detected: {url} ({malicious} detections)")
            else:
                logger.info(f"✅ URL is safe: {url} (harmless: {harmless}, suspicious: {suspicious})")
            
        except Exception as e:
            logger.error(f"Error analyzing URL {url}: {str(e)}")
            url_results.append({
                "url": url,
                "malicious": 0,
                "suspicious": 0,
                "harmless": 0,
                "is_malicious": False,
                "error": str(e)
            })
            continue
    
    return {
        "is_malicious": total_malicious > 0,
        "total_malicious": total_malicious,
        "total_urls": len(urls),
        "url_results": url_results
    }


def analyze_urls_parallel(urls: list) -> Dict[str, Any]:
    """Analyze multiple URLs in parallel using dual API keys"""
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    total_malicious = 0
    url_results = []
    
    def analyze_single_url(url):
        """Analyze a single URL"""
        try:
            # Submit URL to VirusTotal
            submit_response = submit_url_to_virustotal(url)
            if not submit_response or 'id' not in submit_response:
                return {
                    "url": url,
                    "malicious": 0,
                    "suspicious": 0,
                    "harmless": 0,
                    "is_malicious": False,
                    "error": "Failed to submit to VirusTotal"
                }
            
            scan_id = submit_response['id']
            logger.info(f"URL submitted to VirusTotal, scan_id: {scan_id}, waiting {VIRUSTOTAL_WAIT_TIME} seconds...")
            
            # Wait for VirusTotal to process
            time.sleep(VIRUSTOTAL_WAIT_TIME)
            
            # Get results
            result = get_virustotal_url_results(scan_id)
            
            malicious = result.get('malicious', 0)
            suspicious = result.get('suspicious', 0)
            harmless = result.get('harmless', 0)
            is_malicious = malicious > 0
            
            if is_malicious:
                logger.warning(f"🚨 Malicious URL detected: {url} ({malicious} detections)")
            else:
                logger.info(f"✅ URL is safe: {url} (harmless: {harmless}, suspicious: {suspicious})")
            
            return {
                "url": url,
                "malicious": malicious,
                "suspicious": suspicious,
                "harmless": harmless,
                "is_malicious": is_malicious,
                "scan_id": scan_id
            }
        except Exception as e:
            logger.error(f"Error analyzing URL {url}: {str(e)}")
            return {
                "url": url,
                "malicious": 0,
                "suspicious": 0,
                "harmless": 0,
                "is_malicious": False,
                "error": str(e)
            }
    
    # Use ThreadPoolExecutor for parallel processing
    # Max workers = number of API keys (2) to avoid rate limits
    max_workers = min(len(vt_key_manager.keys), len(urls), 2)
    
    logger.info(f"Analyzing {len(urls)} URLs in parallel using {max_workers} API keys...")
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all URLs for analysis
        future_to_url = {executor.submit(analyze_single_url, url): url for url in urls}
        
        # Collect results as they complete
        for future in as_completed(future_to_url):
            result = future.result()
            url_results.append(result)
            if result.get('is_malicious'):
                total_malicious += result.get('malicious', 0)
    
    return {
        "is_malicious": total_malicious > 0,
        "total_malicious": total_malicious,
        "total_urls": len(urls),
        "url_results": url_results
    }


# Import CEO Fraud Detector
from ceo_fraud_detector import detect_ceo_fraud_with_chatbot as detect_ceo_fraud_detector

def detect_ceo_fraud_with_chatbot(subject, body, html, url_analysis=None, file_analysis=None):
    """Wrapper to pass API keys, session, and context to CEO fraud detector"""
    return detect_ceo_fraud_detector(
        subject,
        body,
        html,
        GEMINI_API_KEY,
        GROQ_API_KEY,
        HUGGINGFACE_API_KEY,
        http_session,
        url_analysis=url_analysis,
        file_analysis=file_analysis
    )


def submit_url_to_virustotal(url: str, api_key: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Submit URL to VirusTotal with connection pooling and dual API key support"""
    if not api_key:
        api_key = vt_key_manager.get_next_key()
    
    if not api_key:
        logger.error("No VirusTotal API key available")
        return None
    
    headers = {"x-apikey": api_key}
    data = {"url": url}
    
    try:
        response = http_session.post(
            f"{VIRUSTOTAL_BASE_URL}/urls",
            headers=headers,
            data=data,
            timeout=VIRUSTOTAL_TIMEOUT
        )
        
        if response.status_code == 200:
            return response.json().get('data', {})
        elif response.status_code == 429:
            logger.warning(f"VirusTotal rate limit exceeded for key, trying next key...")
            vt_key_manager.mark_rate_limited(api_key)
            # Try with next key
            next_key = vt_key_manager.get_next_key()
            if next_key and next_key != api_key:
                logger.info("Retrying with next API key...")
                return submit_url_to_virustotal(url, next_key)
            time.sleep(2)
            return None
        else:
            logger.error(f"VirusTotal submit error: {response.status_code} - {response.text[:200]}")
            return None
            
    except requests.exceptions.Timeout:
        logger.error("VirusTotal request timeout")
        return None
    except Exception as e:
        logger.error(f"Error submitting URL to VirusTotal: {str(e)}")
        return None


def get_virustotal_url_results(scan_id: str, api_key: Optional[str] = None) -> Dict[str, int]:
    """Get URL scan results with connection pooling and dual API key support"""
    if not api_key:
        api_key = vt_key_manager.get_next_key()
    
    if not api_key:
        logger.error("No VirusTotal API key available")
        return {"malicious": 0, "suspicious": 0, "harmless": 0}
    
    headers = {"x-apikey": api_key}
    
    try:
        response = http_session.get(
            f"{VIRUSTOTAL_BASE_URL}/analyses/{scan_id}",
            headers=headers,
            timeout=VIRUSTOTAL_TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json().get('data', {}).get('attributes', {}).get('stats', {})
            return {
                "malicious": data.get('malicious', 0),
                "suspicious": data.get('suspicious', 0),
                "harmless": data.get('harmless', 0)
            }
        elif response.status_code == 429:
            logger.warning(f"VirusTotal rate limit exceeded for key, trying next key...")
            vt_key_manager.mark_rate_limited(api_key)
            # Try with next key
            next_key = vt_key_manager.get_next_key()
            if next_key and next_key != api_key:
                logger.info("Retrying with next API key...")
                return get_virustotal_url_results(scan_id, next_key)
            return {"malicious": 0, "suspicious": 0, "harmless": 0}
        else:
            logger.error(f"VirusTotal get results error: {response.status_code}")
            return {"malicious": 0, "suspicious": 0, "harmless": 0}
            
    except requests.exceptions.Timeout:
        logger.error("VirusTotal request timeout")
        return {"malicious": 0, "suspicious": 0, "harmless": 0}
    except Exception as e:
        logger.error(f"Error getting VirusTotal results: {str(e)}")
        return {"malicious": 0, "suspicious": 0, "harmless": 0}


def check_virustotal_file(file_hash: str, api_key: Optional[str] = None) -> Dict[str, int]:
    """Check file hash in VirusTotal with connection pooling and dual API key support"""
    if not api_key:
        api_key = vt_key_manager.get_next_key()
    
    if not api_key:
        logger.error("No VirusTotal API key available")
        return {"malicious": 0, "suspicious": 0, "harmless": 0}
    
    headers = {"x-apikey": api_key}
    
    try:
        response = http_session.get(
            f"{VIRUSTOTAL_BASE_URL}/files/{file_hash}",
            headers=headers,
            timeout=VIRUSTOTAL_TIMEOUT
        )
        
        if response.status_code == 200:
            stats = response.json().get('data', {}).get('attributes', {}).get('last_analysis_stats', {})
            return {
                "malicious": stats.get('malicious', 0),
                "suspicious": stats.get('suspicious', 0),
                "harmless": stats.get('harmless', 0)
            }
        elif response.status_code == 429:
            logger.warning(f"VirusTotal rate limit exceeded for key, trying next key...")
            vt_key_manager.mark_rate_limited(api_key)
            # Try with next key
            next_key = vt_key_manager.get_next_key()
            if next_key and next_key != api_key:
                logger.info("Retrying with next API key...")
                return check_virustotal_file(file_hash, next_key)
            return {"malicious": 0, "suspicious": 0, "harmless": 0}
        else:
            logger.warning(f"File not found in VirusTotal: {response.status_code}")
            return {"malicious": 0, "suspicious": 0, "harmless": 0}
            
    except requests.exceptions.Timeout:
        logger.error("VirusTotal request timeout")
        return {"malicious": 0, "suspicious": 0, "harmless": 0}
    except Exception as e:
        logger.error(f"Error checking file in VirusTotal: {str(e)}")
        return {"malicious": 0, "suspicious": 0, "harmless": 0}


if __name__ == '__main__':
    logger.info(f"Starting Email Security Analyzer API on port {Config.PORT}")
    logger.info(f"Debug mode: {Config.FLASK_DEBUG}")
    logger.info(f"Environment: {Config.FLASK_ENV}")
    
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.FLASK_DEBUG)

