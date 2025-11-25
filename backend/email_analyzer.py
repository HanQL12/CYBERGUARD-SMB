"""
Email Analysis Module
Handles file, URL, and CEO fraud detection
"""

import logging
from constants import CEO_FRAUD_CONFIDENCE_THRESHOLD

logger = logging.getLogger(__name__)


def analyze_email_logic_full(data, analyze_files_func, analyze_urls_func, detect_ceo_fraud_func):
    """
    Full email analysis logic
    Priority: File > URL > CEO Fraud
    """
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
        file_result = analyze_files_func(attachments)
        details['file_analysis'] = file_result
        
        if file_result['is_malicious']:
            threats.append('malicious_file')
            logger.warning(f"🚨 MALICIOUS FILE DETECTED: {file_result['total_malicious']} detections")
            return {
                "is_phishing": True,
                "threats": threats,
                "details": details,
                "analysis_order": "file"
            }
    
    # STEP 2: URL Analysis (Priority 2)
    urls = pre_extracted_urls or extract_urls(subject, body, html)
    if urls:
        logger.info(f"Analyzing {len(urls)} URL(s)...")
        url_result = analyze_urls_func(urls)
        details['url_analysis'] = url_result
        
        if url_result['is_malicious']:
            threats.append('malicious_url')
            logger.warning(f"🚨 MALICIOUS URL DETECTED: {url_result['total_malicious']} detections")
            return {
                "is_phishing": True,
                "threats": threats,
                "details": details,
                "analysis_order": "url"
            }
    
    # STEP 3: CEO Fraud Detection (Priority 3)
    logger.info("Analyzing CEO fraud...")
    ceo_result = detect_ceo_fraud_func(subject, body, html)
    details['ceo_fraud'] = ceo_result
    
    ceo_confidence = ceo_result.get('confidence', 0)
    ceo_detected = ceo_result.get('detected', False)
    
    if ceo_detected and ceo_confidence >= CEO_FRAUD_CONFIDENCE_THRESHOLD:
        threats.append('ceo_fraud')
        logger.warning(f"🚨 CEO FRAUD DETECTED: Confidence {ceo_confidence}%")
        return {
            "is_phishing": True,
            "threats": threats,
            "details": details,
            "analysis_order": "ceo_fraud"
        }
    
    # All checks passed - SAFE
    logger.info("✅ Email is SAFE - All checks passed")
    return {
        "is_phishing": False,
        "threats": [],
        "details": details,
        "analysis_order": "all_safe"
    }


def extract_urls(subject, body, html):
    """Extract URLs from email content"""
    import re
    text = f"{subject} {body} {html}"
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    urls = re.findall(url_pattern, text, re.IGNORECASE)
    return list(set(urls))


# Import extract_urls for use in app.py
__all__ = ['analyze_email_logic_full', 'extract_urls']

