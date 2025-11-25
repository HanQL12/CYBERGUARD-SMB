"""
Input Validation Module
Basic validation for API endpoints
"""

import re
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)


def validate_url(url: str) -> bool:
    """Validate URL format"""
    if not url or not isinstance(url, str):
        return False
    
    url = url.strip()
    if not url:
        return False
    
    # Basic URL pattern
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    return bool(url_pattern.match(url))


def validate_email_id(email_id: str) -> bool:
    """Validate Gmail email ID format"""
    if not email_id or not isinstance(email_id, str):
        return False
    
    # Gmail message IDs are alphanumeric strings
    return bool(re.match(r'^[a-zA-Z0-9_-]+$', email_id))


def validate_email_ids(email_ids: List[str]) -> bool:
    """Validate list of email IDs"""
    if not isinstance(email_ids, list):
        return False
    
    if len(email_ids) == 0:
        return False
    
    if len(email_ids) > 100:  # Limit batch size
        return False
    
    return all(validate_email_id(email_id) for email_id in email_ids)


def validate_email_data(data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Validate email analysis request data
    Returns: (is_valid, error_message)
    """
    if not isinstance(data, dict):
        return False, "Request body must be a JSON object"
    
    # Subject, body, html are optional but should be strings if provided
    if 'subject' in data and not isinstance(data['subject'], str):
        return False, "Subject must be a string"
    
    if 'body' in data and not isinstance(data['body'], str):
        return False, "Body must be a string"
    
    if 'html' in data and not isinstance(data['html'], str):
        return False, "HTML must be a string"
    
    # Validate attachments if provided
    if 'attachments' in data:
        if not isinstance(data['attachments'], list):
            return False, "Attachments must be a list"
        
        if len(data['attachments']) > 10:  # Limit number of attachments
            return False, "Maximum 10 attachments allowed"
        
        for attachment in data['attachments']:
            if not isinstance(attachment, dict):
                return False, "Each attachment must be an object"
            
            if 'filename' not in attachment or not isinstance(attachment['filename'], str):
                return False, "Attachment must have a filename (string)"
            
            if 'data' not in attachment or not isinstance(attachment['data'], str):
                return False, "Attachment must have data (base64 string)"
            
            # Validate base64 format (basic check)
            if len(attachment['data']) > 50 * 1024 * 1024:  # 50MB limit
                return False, "Attachment size exceeds 50MB limit"
    
    # Validate URLs if provided
    if 'urls' in data:
        if not isinstance(data['urls'], list):
            return False, "URLs must be a list"
        
        if len(data['urls']) > 50:  # Limit number of URLs
            return False, "Maximum 50 URLs allowed"
        
        for url in data['urls']:
            if not isinstance(url, str):
                return False, "Each URL must be a string"
            
            if not validate_url(url):
                return False, f"Invalid URL format: {url}"
    
    return True, None


def sanitize_string(value: str, max_length: int = 10000) -> str:
    """Sanitize string input to prevent injection attacks"""
    if not isinstance(value, str):
        return ""
    
    # Truncate if too long
    if len(value) > max_length:
        value = value[:max_length]
        logger.warning(f"String truncated to {max_length} characters")
    
    # Remove null bytes
    value = value.replace('\x00', '')
    
    return value.strip()


def validate_scan_url_request(data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """Validate scan URL request"""
    if not isinstance(data, dict):
        return False, "Request body must be a JSON object"
    
    if 'url' not in data:
        return False, "URL is required"
    
    url = data['url']
    if not isinstance(url, str):
        return False, "URL must be a string"
    
    url = url.strip()
    if not url:
        return False, "URL cannot be empty"
    
    if not validate_url(url):
        # Try to fix common issues
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
            if validate_url(url):
                data['url'] = url  # Update the data
                return True, None
        
        return False, f"Invalid URL format: {url}"
    
    return True, None

