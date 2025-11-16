#!/usr/bin/env python3
"""
Email Security Analyzer Backend API
Sequential Analysis: File > URL > CEO Fraud
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import hashlib
import re
import time
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
from gmail_helper import GmailHelper

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Configuration
VIRUSTOTAL_API_KEY = os.getenv('VIRUSTOTAL_API_KEY', 'fc8fef0c12df79ad7d5cae8d649eb6a0d2c7474503915f775c181c7288a7102d')
# Chatbot API Options (Free):
# 1. Google Gemini (Free tier - Recommended)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
# 2. Hugging Face Chat (Free)
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY', '')
# 3. Groq (Free, very fast)
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')

VIRUSTOTAL_BASE_URL = "https://www.virustotal.com/api/v3"

# Labels
PHISHING_LABEL = "Label_8387377442759074354"
SAFE_LABEL = "Label_291990169998442549"

# Initialize Gmail Helper
gmail_helper = GmailHelper()


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Email Security Analyzer"
    })


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
        logger.info(f"Received email analysis request: {data.get('subject', 'No subject')}")
        
        # Extract data
        subject = data.get('subject', '')
        body = data.get('body', '')
        html = data.get('html', '')
        attachments = data.get('attachments', [])
        pre_extracted_urls = data.get('urls', [])
        
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
                return jsonify({
                    "is_phishing": True,
                    "threats": threats,
                    "label": PHISHING_LABEL,
                    "details": details,
                    "analysis_order": "file"
                })
        
        # STEP 2: URL Analysis (Priority 2)
        urls = pre_extracted_urls or extract_urls(subject, body, html)
        if urls:
            logger.info(f"Analyzing {len(urls)} URL(s)...")
            url_result = analyze_urls(urls)
            details['url_analysis'] = url_result
            
            if url_result['is_malicious']:
                threats.append('malicious_url')
                logger.warning(f"🚨 MALICIOUS URL DETECTED: {url_result['total_malicious']} detections")
                return jsonify({
                    "is_phishing": True,
                    "threats": threats,
                    "label": PHISHING_LABEL,
                    "details": details,
                    "analysis_order": "url"
                })
        
        # STEP 3: CEO Fraud Detection (Priority 3) - Using Chatbot API
        logger.info("Analyzing CEO fraud using chatbot API...")
        ceo_result = detect_ceo_fraud_with_chatbot(subject, body, html)
        details['ceo_fraud'] = ceo_result
        
        # CEO fraud detection: Lower threshold for better sensitivity
        # Trust AI analysis more than pattern matching
        ceo_confidence = ceo_result.get('confidence', 0)
        ceo_detected = ceo_result.get('detected', False)
        
        # If Gemini/Groq detected with confidence >= 30%, consider it fraud
        # This is more sensitive than pattern-based (which requires multiple keywords)
        if ceo_detected and ceo_confidence >= 30:
            threats.append('ceo_fraud')
            logger.warning(f"🚨 CEO FRAUD DETECTED: Confidence {ceo_confidence}% - {ceo_result.get('reason', '')}")
            return jsonify({
                "is_phishing": True,
                "threats": threats,
                "label": PHISHING_LABEL,
                "details": details,
                "analysis_order": "ceo_fraud"
            })
        
        # All checks passed - SAFE
        logger.info("✅ Email is SAFE - All checks passed")
        return jsonify({
            "is_phishing": False,
            "threats": [],
            "label": SAFE_LABEL,
            "details": details,
            "analysis_order": "all_safe"
        })
        
    except Exception as e:
        logger.error(f"Error analyzing email: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500


@app.route('/analyze-url', methods=['POST'])
def analyze_url():
    """
    Analyze single URL using VirusTotal
    
    Request body:
    {
        "url": "https://example.com"
    }
    """
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({"error": "URL is required"}), 400
        
        logger.info(f"Analyzing URL: {url}")
        result = analyze_urls([url])
        
        return jsonify({
            "url": url,
            "is_malicious": result['is_malicious'],
            "total_malicious": result['total_malicious'],
            "details": result
        })
        
    except Exception as e:
        logger.error(f"Error analyzing URL: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route('/analyze-file', methods=['POST'])
def analyze_file():
    """
    Analyze file using VirusTotal
    
    Request body:
    {
        "filename": "file.pdf",
        "data": "base64_encoded_file_data",
        "mimeType": "application/pdf"
    }
    """
    try:
        data = request.get_json()
        file_data = data.get('data')  # Base64 encoded
        filename = data.get('filename', 'unknown')
        
        if not file_data:
            return jsonify({"error": "File data is required"}), 400
        
        logger.info(f"Analyzing file: {filename}")
        
        # Decode base64
        import base64
        file_bytes = base64.b64decode(file_data)
        
        # Calculate hash
        file_hash = hashlib.sha256(file_bytes).hexdigest()
        
        # Check VirusTotal
        result = check_virustotal_file(file_hash)
        
        return jsonify({
            "filename": filename,
            "hash": file_hash,
            "is_malicious": result['malicious'] > 0,
            "total_malicious": result['malicious'],
            "details": result
        })
        
    except Exception as e:
        logger.error(f"Error analyzing file: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route('/detect-ceo-fraud', methods=['POST'])
def detect_ceo_fraud():
    """
    Detect CEO fraud using Chatbot API
    
    Request body:
    {
        "subject": "Email subject",
        "body": "Email body",
        "html": "Email HTML"
    }
    """
    try:
        data = request.get_json()
        subject = data.get('subject', '')
        body = data.get('body', '')
        html = data.get('html', '')
        
        logger.info("Detecting CEO fraud with chatbot API...")
        result = detect_ceo_fraud_with_chatbot(subject, body, html)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error detecting CEO fraud: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


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


@app.route('/scan-url', methods=['POST'])
def scan_url():
    """
    Scan URL for threats
    Replaces n8n /scan-url endpoint
    """
    try:
        data = request.get_json()
        url = data.get('url', '')
        
        if not url:
            return jsonify({"error": "URL is required"}), 400
        
        logger.info(f"Scanning URL: {url}")
        
        # Use existing URL analysis logic
        url_results = analyze_urls([url])
        
        if url_results['url_results']:
            result = url_results['url_results'][0]
            is_malicious = result.get('is_malicious', False)
            malicious_count = result.get('malicious', 0)
            
            return jsonify({
                'url': url,
                'is_malicious': is_malicious,
                'malicious': malicious_count,
                'suspicious': result.get('suspicious', 0),
                'harmless': result.get('harmless', 0),
                'risk_level': 'HIGH' if is_malicious else 'LOW',
                'threat_type': 'Phishing' if is_malicious else 'Safe',
                'confidence': min(95, malicious_count * 5) if is_malicious else 5,
                'vendors': f"{malicious_count}/90",
                'categories': ['phishing', 'malware'] if is_malicious else ['safe'],
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'url': url,
                'is_malicious': False,
                'malicious': 0,
                'risk_level': 'LOW',
                'threat_type': 'Safe',
                'confidence': 5,
                'vendors': '0/90',
                'categories': ['safe'],
                'timestamp': datetime.now().isoformat()
            })
        
    except Exception as e:
        logger.error(f"Error scanning URL: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


# Helper Functions

def analyze_files(attachments):
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


def analyze_urls(urls):
    """Analyze URLs using VirusTotal (Check Mail.json logic)"""
    total_malicious = 0
    url_results = []
    
    for url in urls:
        try:
            # Submit URL to VirusTotal
            submit_response = submit_url_to_virustotal(url)
            if not submit_response or 'id' not in submit_response:
                logger.warning(f"Failed to submit URL: {url}")
                continue
            
            scan_id = submit_response['id']
            logger.info(f"URL submitted, scan_id: {scan_id}, waiting 15 seconds...")
            
            # Wait 15 seconds (Check Mail.json logic)
            time.sleep(15)
            
            # Get results
            result = get_virustotal_url_results(scan_id)
            
            # Check Mail.json logic: malicious > 0 = unsafe
            malicious = result.get('malicious', 0)
            
            url_results.append({
                "url": url,
                "malicious": malicious,
                "suspicious": result.get('suspicious', 0),
                "harmless": result.get('harmless', 0)
            })
            
            if malicious > 0:
                total_malicious += malicious
                logger.warning(f"🚨 Malicious URL detected: {url} ({malicious} detections)")
            
        except Exception as e:
            logger.error(f"Error analyzing URL {url}: {str(e)}")
            continue
    
    return {
        "is_malicious": total_malicious > 0,
        "total_malicious": total_malicious,
        "total_urls": len(urls),
        "url_results": url_results
    }


def detect_ceo_fraud_with_chatbot(subject, body, html):
    """
    Detect CEO fraud using Chatbot API (Free)
    No whitelist/blacklist - Let chatbot analyze naturally
    
    Priority: Gemini > Groq > Hugging Face > Pattern-based
    """
    # Combine all text
    full_text = f"{subject} {body} {html}"
    
    # Clean HTML tags
    import re
    text = re.sub(r'<[^>]+>', '', full_text)
    text = text.strip()
    
    if not text:
        return {
            "detected": False,
            "confidence": 0,
            "reason": "No text content"
        }
    
    try:
        # Try Google Gemini first (Free, best for Vietnamese)
        if GEMINI_API_KEY:
            logger.info("Using Google Gemini API for CEO fraud detection")
            result = analyze_with_gemini(text)
            if result and result.get('method') == 'gemini_api':
                return result
        
        # Try Groq (Free, very fast)
        if GROQ_API_KEY:
            logger.info("Using Groq API for CEO fraud detection")
            result = analyze_with_groq(text)
            if result and result.get('method') == 'groq_api':
                return result
        
        # Try Hugging Face Chat
        if HUGGINGFACE_API_KEY:
            logger.info("Using Hugging Face Chat API for CEO fraud detection")
            result = analyze_with_huggingface_chat(text)
            if result and result.get('method') == 'huggingface_chat':
                return result
        
        # Fallback: Use pattern-based detection if no API key
        logger.warning("No chatbot API key found, using pattern-based fallback")
        result = analyze_with_patterns(text)
        return result
        
    except Exception as e:
        logger.error(f"Error in CEO fraud detection: {str(e)}")
        # Fallback to pattern-based
        return analyze_with_patterns(text)


def analyze_with_gemini(text):
    """
    Analyze text using Google Gemini API (Free)
    Best for Vietnamese text analysis
    Improved prompt with few-shot examples and better context
    """
    try:
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        # Enhanced prompt with few-shot examples and detailed analysis instructions
        prompt = f"""Bạn là chuyên gia bảo mật email chuyên phát hiện CEO fraud (Business Email Compromise - BEC) trong bối cảnh doanh nghiệp Việt Nam.

NHIỆM VỤ: Phân tích email và xác định xem có phải là CEO fraud - một hình thức lừa đảo mà kẻ tấn công giả mạo CEO/Giám đốc để yêu cầu nhân viên chuyển tiền.

CÁCH PHÂN TÍCH:
Bạn là hệ thống phân tích BEC (Business Email Compromise). 
Hãy đánh giá email dựa trên các tiêu chí sau:

1. Yêu cầu chuyển tiền hoặc thay đổi tài khoản ngân hàng bất ngờ.
2. Giọng văn bất thường, không chuyên nghiệp, giống chat nội bộ chứ không phải email công ty.
3. Giả mạo sếp hoặc đồng nghiệp bằng email cá nhân.
4. Không có quy trình, hóa đơn, lý do rõ ràng.
5. Áp lực thời gian hoặc yêu cầu làm gấp.
6. Tài khoản ngân hàng lạ hoặc không liên quan đến công ty.
7. Email không chứa chữ ký hoặc định dạng theo chuẩn doanh nghiệp.
8. Phân tích ngữ cảnh và ý định thực sự của email
9. Tìm các dấu hiệu hành vi đáng ngờ (không phải từ khóa cụ thể)
10. Xem xét mối quan hệ giữa các yếu tố: ngữ điệu, yêu cầu, bối cảnh
11. Phân tích tính hợp lý của yêu cầu trong bối cảnh doanh nghiệp

Nếu bất kỳ tiêu chí nào đúng → phân loại: "malicious".
Nếu không có dấu hiệu đáng ngờ → phân loại: "safe".

VÍ DỤ PHÁT HIỆN CEO FRAUD:
- Email yêu cầu chuyển tiền với lý do khẩn cấp nhưng không giải thích rõ
- Yêu cầu giữ bí mật hoặc không liên lạc qua kênh khác
- Yêu cầu chuyển tiền đến tài khoản lạ, không phải tài khoản công ty
- Ngữ điệu gấp gáp, ép buộc, không phù hợp với phong cách giao tiếp thông thường
- Yêu cầu bất thường so với quy trình công ty

VÍ DỤ EMAIL AN TOÀN:
- Email yêu cầu chuyển tiền nhưng có giải thích rõ ràng, hợp lý
- Có thông tin xác minh, số hợp đồng, hóa đơn
- Yêu cầu phù hợp với quy trình và vai trò
- Ngữ điệu chuyên nghiệp, không ép buộc

EMAIL CẦN PHÂN TÍCH:
{text[:3000]}

Hãy phân tích kỹ lưỡng và trả lời CHỈ bằng JSON (không có text khác):
{{
    "detected": true/false,
    "confidence": 0-100,
    "reason": "Giải thích chi tiết tại sao phát hiện hoặc không phát hiện CEO fraud",
    "indicators": ["dấu hiệu hành vi 1", "dấu hiệu hành vi 2"],
    "analysis": "Phân tích ngữ cảnh và ý định của email"
}}

Lưu ý: 
- "detected": true nếu email có dấu hiệu CEO fraud
- "confidence": 0-100 dựa trên mức độ chắc chắn (100 = rất chắc chắn)
- Phân tích dựa trên hành vi và ngữ cảnh, không chỉ từ khóa"""
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.2,  # Lower temperature for more consistent analysis
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            }
        }
        
        response = requests.post(api_url, json=payload, timeout=45)
        
        if response.status_code == 200:
            result = response.json()
            content = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            
            logger.info(f"Gemini response: {content[:200]}...")
            
            # Parse JSON from response
            import json
            try:
                # Try to find JSON in response (handle markdown code blocks)
                json_match = re.search(r'\{[\s\S]*\}', content)
                if json_match:
                    json_str = json_match.group()
                    parsed = json.loads(json_str)
                    
                    detected = parsed.get('detected', False)
                    confidence = int(parsed.get('confidence', 0))
                    reason = parsed.get('reason', '')
                    indicators = parsed.get('indicators', [])
                    analysis = parsed.get('analysis', '')
                    
                    # Validate confidence range
                    confidence = max(0, min(100, confidence))
                    
                    # If detected but confidence is too low, might be false positive
                    # But trust Gemini's judgment
                    logger.info(f"Gemini analysis: detected={detected}, confidence={confidence}%")
                    
                    return {
                        "detected": detected,
                        "confidence": confidence,
                        "method": "gemini_api",
                        "reason": reason or analysis or "Phân tích bằng AI",
                        "indicators": indicators if isinstance(indicators, list) else [],
                        "analysis": analysis
                    }
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse Gemini JSON response: {e}")
                logger.warning(f"Response content: {content[:500]}")
            except Exception as e:
                logger.warning(f"Error parsing Gemini response: {e}")
            
            # Fallback: Analyze response text semantically
            content_lower = content.lower()
            
            # Look for semantic indicators, not just keywords
            fraud_indicators = [
                'lừa đảo', 'fraud', 'scam', 'giả mạo',
                'phát hiện', 'detected', 'có dấu hiệu',
                'đáng ngờ', 'suspicious', 'bất thường'
            ]
            
            safe_indicators = [
                'an toàn', 'safe', 'hợp lệ', 'legitimate',
                'không phát hiện', 'not detected'
            ]
            
            fraud_score = sum(1 for ind in fraud_indicators if ind in content_lower)
            safe_score = sum(1 for ind in safe_indicators if ind in content_lower)
            
            # If response clearly indicates fraud
            if fraud_score > safe_score and fraud_score > 0:
                # Try to extract confidence from text
                confidence_match = re.search(r'(\d+)%', content)
                confidence = int(confidence_match.group(1)) if confidence_match else 70
                
                return {
                    "detected": True,
                    "confidence": min(confidence, 95),
                    "method": "gemini_api",
                    "reason": "AI phát hiện dấu hiệu CEO fraud từ phân tích ngữ cảnh",
                    "indicators": ["Phân tích ngữ cảnh cho thấy dấu hiệu lừa đảo"]
                }
        
        elif response.status_code == 429:
            logger.warning("Gemini API rate limit exceeded")
            return None
        else:
            logger.error(f"Gemini API error: {response.status_code} - {response.text[:200]}")
            return None
        
    except requests.exceptions.Timeout:
        logger.error("Gemini API timeout")
        return None
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}", exc_info=True)
        return None


def analyze_with_groq(text):
    """
    Analyze text using Groq API (Free, very fast)
    """
    try:
        api_url = "https://api.groq.com/openai/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""Bạn là chuyên gia bảo mật email chuyên phát hiện CEO fraud (Business Email Compromise - BEC) trong bối cảnh doanh nghiệp Việt Nam.

NHIỆM VỤ: Phân tích email và xác định xem có phải là CEO fraud - một hình thức lừa đảo mà kẻ tấn công giả mạo CEO/Giám đốc để yêu cầu nhân viên chuyển tiền.

CÁCH PHÂN TÍCH:
1. Phân tích ngữ cảnh và ý định thực sự của email
2. Tìm các dấu hiệu hành vi đáng ngờ (không phải từ khóa cụ thể)
3. Xem xét mối quan hệ giữa các yếu tố: ngữ điệu, yêu cầu, bối cảnh
4. Phân tích tính hợp lý của yêu cầu trong bối cảnh doanh nghiệp

VÍ DỤ PHÁT HIỆN CEO FRAUD:
- Email yêu cầu chuyển tiền với lý do khẩn cấp nhưng không giải thích rõ
- Yêu cầu giữ bí mật hoặc không liên lạc qua kênh khác
- Yêu cầu chuyển tiền đến tài khoản lạ, không phải tài khoản công ty
- Ngữ điệu gấp gáp, ép buộc, không phù hợp với phong cách giao tiếp thông thường
- Yêu cầu bất thường so với quy trình công ty

EMAIL CẦN PHÂN TÍCH:
{text[:3000]}

Trả lời CHỈ bằng JSON:
{{
    "detected": true/false,
    "confidence": 0-100,
    "reason": "Giải thích chi tiết tại sao phát hiện hoặc không phát hiện CEO fraud",
    "indicators": ["dấu hiệu hành vi 1", "dấu hiệu hành vi 2"],
    "analysis": "Phân tích ngữ cảnh và ý định của email"
}}"""
        
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": "You are a cybersecurity expert specializing in CEO fraud detection for Vietnamese businesses. Analyze emails based on behavioral patterns and context, not just keywords."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"}
        }
        
        response = requests.post(api_url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            content = result.get('choices', [{}])[0].get('message', {}).get('content', '')
            
            import json
            try:
                parsed = json.loads(content)
                return {
                    "detected": parsed.get('detected', False),
                    "confidence": parsed.get('confidence', 0),
                    "method": "groq_api",
                    "reason": parsed.get('reason', '')
                }
            except:
                pass
        
        return None
        
    except Exception as e:
        logger.error(f"Groq API error: {str(e)}")
        return None


def analyze_with_huggingface_chat(text):
    """
    Analyze text using Hugging Face Chat API (Free)
    """
    try:
        # Use Hugging Face Inference API with a chat model
        api_url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large"
        
        headers = {
            "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""Analyze this email for CEO fraud (lừa đảo chuyển tiền) in Vietnamese context: {text[:1000]}

Is this CEO fraud? Answer with JSON: {{"detected": true/false, "confidence": 0-100}}"""
        
        payload = {"inputs": prompt}
        
        response = requests.post(api_url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            # Parse response (format depends on model)
            # For now, use pattern-based as fallback
            return None
        
        return None
        
    except Exception as e:
        logger.error(f"HuggingFace Chat API error: {str(e)}")
        return None


def analyze_with_patterns(text):
    """
    Fallback pattern-based detection
    (Used when chatbot API is unavailable)
    """
    text_lower = text.lower()
    
    urgency_keywords = ['gấp', 'urgent', 'khẩn cấp', 'ngay lập tức', 'cấp bách']
    money_keywords = ['chuyển tiền', 'transfer money', 'triệu', 'tỷ', '100tr', '500tr', 'stk', 'số tài khoản']
    account_keywords = ['stk', 'số tài khoản', 'tài khoản', 'account', '012345', 'bank', 'tech']
    suspicious_patterns = ['đừng gọi', 'đang họp', 'không gọi', 'tech em', 'tech anh']
    
    has_urgency = any(kw in text_lower for kw in urgency_keywords)
    has_money = any(kw in text_lower for kw in money_keywords)
    has_account = any(kw in text_lower for kw in account_keywords)
    has_suspicious = any(kw in text_lower for kw in suspicious_patterns)
    
    # CEO fraud if: (urgency + money) OR (money + account) OR (urgency + account + suspicious)
    detected = (has_urgency and has_money) or (has_money and has_account) or (has_urgency and has_account and has_suspicious)
    
    # Calculate confidence
    confidence = 0
    if has_urgency: confidence += 30
    if has_money: confidence += 40
    if has_account: confidence += 20
    if has_suspicious: confidence += 10
    confidence = min(confidence, 100)
    
    return {
        "detected": detected,
        "confidence": confidence,
        "method": "pattern_based",
        "indicators": {
            "has_urgency": has_urgency,
            "has_money": has_money,
            "has_account": has_account,
            "has_suspicious": has_suspicious
        }
    }


def extract_urls(subject, body, html):
    """Extract URLs from email (Check Mail.json regex)"""
    text = f"{subject} {body} {html}"
    url_pattern = r'(https?://[^\s<>"\'\)\]]+)'
    urls = re.findall(url_pattern, text, re.IGNORECASE)
    return list(set(urls))


def submit_url_to_virustotal(url):
    """Submit URL to VirusTotal"""
    headers = {"x-apikey": VIRUSTOTAL_API_KEY}
    data = {"url": url}
    
    try:
        response = requests.post(
            f"{VIRUSTOTAL_BASE_URL}/urls",
            headers=headers,
            data=data,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json().get('data', {})
        else:
            logger.error(f"VirusTotal submit error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Error submitting URL to VirusTotal: {str(e)}")
        return None


def get_virustotal_url_results(scan_id):
    """Get URL scan results (Check Mail.json logic)"""
    headers = {"x-apikey": VIRUSTOTAL_API_KEY}
    
    try:
        response = requests.get(
            f"{VIRUSTOTAL_BASE_URL}/analyses/{scan_id}",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json().get('data', {}).get('attributes', {}).get('stats', {})
            return {
                "malicious": data.get('malicious', 0),
                "suspicious": data.get('suspicious', 0),
                "harmless": data.get('harmless', 0)
            }
        else:
            logger.error(f"VirusTotal get results error: {response.status_code}")
            return {"malicious": 0, "suspicious": 0, "harmless": 0}
            
    except Exception as e:
        logger.error(f"Error getting VirusTotal results: {str(e)}")
        return {"malicious": 0, "suspicious": 0, "harmless": 0}


def check_virustotal_file(file_hash):
    """Check file hash in VirusTotal"""
    headers = {"x-apikey": VIRUSTOTAL_API_KEY}
    
    try:
        response = requests.get(
            f"{VIRUSTOTAL_BASE_URL}/files/{file_hash}",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            stats = response.json().get('data', {}).get('attributes', {}).get('last_analysis_stats', {})
            return {
                "malicious": stats.get('malicious', 0),
                "suspicious": stats.get('suspicious', 0),
                "harmless": stats.get('harmless', 0)
            }
        else:
            logger.warning(f"File not found in VirusTotal: {response.status_code}")
            return {"malicious": 0, "suspicious": 0, "harmless": 0}
            
    except Exception as e:
        logger.error(f"Error checking file in VirusTotal: {str(e)}")
        return {"malicious": 0, "suspicious": 0, "harmless": 0}


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    logger.info(f"Starting Email Security Analyzer API on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)

