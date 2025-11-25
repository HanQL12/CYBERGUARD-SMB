"""
Gmail Helper Module
Lấy emails từ Gmail và format cho dashboard
"""

import os
import base64
import time
from datetime import datetime, timedelta
from email.utils import parsedate_to_datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import logging

logger = logging.getLogger(__name__)

# Gmail API scopes - Need modify scope to label emails and mark as read
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
]

# Import constants
from constants import (
    PHISHING_LABEL, SAFE_LABEL, CACHE_TIMEOUT,
    EMAIL_CACHE_TIMEOUT, CACHE_MAX_SIZE,
    MAX_EMAILS_DASHBOARD, MAX_EMAILS_DISPLAY, MAX_EMAILS_REPORTS
)


class GmailHelper:
    def __init__(self):
        self.service = None
        self.credentials = None
        self._cache = {}  # Simple cache for email data
        self._cache_timeout = CACHE_TIMEOUT
        self._email_details_cache = {}  # Cache for individual email details
        self._email_cache_timeout = EMAIL_CACHE_TIMEOUT
    
    def authenticate(self):
        """Authenticate with Gmail API"""
        creds = None
        token_path = os.path.join(os.path.dirname(__file__), 'token.json')
        credentials_path = os.path.join(os.path.dirname(__file__), 'credentials.json')
        
        # Load existing token
        if os.path.exists(token_path):
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        
        # If no valid credentials, authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(credentials_path):
                    logger.error("credentials.json not found!")
                    return False
                flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save credentials
            with open(token_path, 'w') as token:
                token.write(creds.to_json())
        
        self.credentials = creds
        self.service = build('gmail', 'v1', credentials=creds)
        return True

    def get_thread_safe_service(self):
        """
        Create a fresh Gmail service instance for thread-safe operations.
        Gmail's default HTTP client (httplib2) is not thread-safe, so we build
        a new service per worker.
        """
        if not self.credentials or (self.credentials and not self.credentials.valid):
            if not self.authenticate():
                return None
        else:
            # Refresh credentials if expired
            if self.credentials.expired and self.credentials.refresh_token:
                try:
                    self.credentials.refresh(Request())
                except Exception as exc:
                    logger.error(f"Failed to refresh Gmail credentials: {exc}")
                    if not self.authenticate():
                        return None

        try:
            return build('gmail', 'v1', credentials=self.credentials)
        except Exception as exc:
            logger.error(f"Failed to build Gmail service for thread: {exc}")
            return None
    
    def get_emails_by_label(self, label_id, max_results=500):
        """Lấy emails theo label"""
        try:
            if not self.service:
                if not self.authenticate():
                    return []
            
            results = self.service.users().messages().list(
                userId='me',
                labelIds=[label_id],
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            return messages
            
        except HttpError as error:
            logger.error(f"Error getting emails by label {label_id}: {error}")
            return []
    
    def get_unread_emails(self, max_results=50, exclude_labels=None):
        """Lấy emails chưa đọc (unprocessed)"""
        try:
            if not self.service:
                if not self.authenticate():
                    return []
            
            # Query for unread emails in inbox
            query = 'is:unread in:inbox -category:social -category:promotions'
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            
            # Filter out emails that have our labels if exclude_labels is provided
            if exclude_labels:
                filtered_messages = []
                for msg in messages:
                    # Get message to check labels
                    try:
                        message = self.service.users().messages().get(
                            userId='me',
                            id=msg['id'],
                            format='metadata',
                            metadataHeaders=['Labels']
                        ).execute()
                        
                        label_ids = message.get('labelIds', [])
                        # Only include if doesn't have exclude labels
                        if not any(label_id in label_ids for label_id in exclude_labels):
                            filtered_messages.append(msg)
                    except:
                        # If can't get message, include it
                        filtered_messages.append(msg)
                
                return filtered_messages
            
            return messages
            
        except HttpError as error:
            logger.error(f"Error getting unread emails: {error}")
            return []
    
    def get_email_details(self, message_id):
        """Lấy chi tiết email với caching"""
        try:
            # Check cache first
            if message_id in self._email_details_cache:
                cached_data, cached_time = self._email_details_cache[message_id]
                if time.time() - cached_time < self._email_cache_timeout:
                    return cached_data
            
            if not self.service:
                if not self.authenticate():
                    return None
            
            message = self.service.users().messages().get(
                userId='me',
                id=message_id,
                format='full'
            ).execute()
            
            # Extract headers
            headers = message['payload'].get('headers', [])
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
            date = next((h['value'] for h in headers if h['name'] == 'Date'), '')
            
            # Extract body
            body_text = ''
            body_html = ''
            
            payload = message['payload']
            
            if 'parts' in payload:
                for part in payload['parts']:
                    mime_type = part.get('mimeType', '')
                    body = part.get('body', {})
                    data = body.get('data', '')
                    
                    if mime_type == 'text/plain' and data:
                        body_text = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                    elif mime_type == 'text/html' and data:
                        body_html = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
            else:
                body = payload.get('body', {})
                data = body.get('data', '')
                if data:
                    if payload.get('mimeType') == 'text/html':
                        body_html = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                    else:
                        body_text = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
            
            # Extract URLs from body
            import re
            urls = []
            full_text = body_text + ' ' + body_html
            url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
            found_urls = re.findall(url_pattern, full_text)
            urls = list(set(found_urls))  # Remove duplicates
            
            result = {
                'id': message_id,
                'subject': subject,
                'sender': sender,
                'date': date,
                'body': body_text,
                'html': body_html,
                'urls': urls,
                'url_count': len(urls)
            }
            
            # Cache result
            self._email_details_cache[message_id] = (result, time.time())
            
            # Limit cache size to prevent memory issues
            if len(self._email_details_cache) > CACHE_MAX_SIZE:
                # Remove oldest entries (20% of cache)
                sorted_cache = sorted(self._email_details_cache.items(), key=lambda x: x[1][1])
                remove_count = CACHE_MAX_SIZE // 5
                for key, _ in sorted_cache[:remove_count]:
                    del self._email_details_cache[key]
            
            return result
            
        except HttpError as error:
            logger.error(f"Error getting email details: {error}")
            return None
    
    def get_email_details_with_attachments(self, message_id, service=None):
        """Lấy chi tiết email bao gồm cả attachments (for urgent scanning)"""
        try:
            svc = service
            if not svc:
                if not self.service:
                    if not self.authenticate():
                        return None
                svc = self.service
            
            message = svc.users().messages().get(
                userId='me',
                id=message_id,
                format='full'
            ).execute()
            
            # Extract headers
            headers = message['payload'].get('headers', [])
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
            date = next((h['value'] for h in headers if h['name'] == 'Date'), '')
            
            # Extract body
            body_text = ''
            body_html = ''
            attachments = []
            
            payload = message['payload']
            
            if 'parts' in payload:
                for part in payload['parts']:
                    mime_type = part.get('mimeType', '')
                    body = part.get('body', {})
                    data = body.get('data', '')
                    
                    if mime_type == 'text/plain' and data:
                        body_text = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                    elif mime_type == 'text/html' and data:
                        body_html = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                    elif 'attachmentId' in body:
                        # Get attachment info
                        attachments.append({
                            'filename': part.get('filename', 'unknown'),
                            'mimeType': mime_type,
                            'attachmentId': body['attachmentId'],
                            'size': body.get('size', 0)
                        })
            else:
                # Single part message
                body = payload.get('body', {})
                data = body.get('data', '')
                if data:
                    if payload.get('mimeType') == 'text/html':
                        body_html = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                    else:
                        body_text = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
            
            # Download attachments if needed (for urgent scan, we'll get attachment data)
            attachment_data = []
            for att in attachments:
                try:
                    att_data = svc.users().messages().attachments().get(
                        userId='me',
                        messageId=message_id,
                        id=att['attachmentId']
                    ).execute()
                    
                    # Decode attachment
                    file_data = base64.urlsafe_b64decode(att_data['data'])
                    file_base64 = base64.b64encode(file_data).decode('utf-8')
                    
                    attachment_data.append({
                        'filename': att['filename'],
                        'data': file_base64,
                        'mimeType': att['mimeType']
                    })
                except Exception as e:
                    logger.warning(f"Could not download attachment {att['filename']}: {e}")
                    # Still include attachment info even if can't download
                    attachment_data.append({
                        'filename': att['filename'],
                        'data': None,  # Will skip file analysis if no data
                        'mimeType': att['mimeType']
                    })
            
            # Extract URLs from body
            import re
            urls = []
            full_text = body_text + ' ' + body_html
            url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
            found_urls = re.findall(url_pattern, full_text)
            urls = list(set(found_urls))  # Remove duplicates
            
            result = {
                'id': message_id,
                'subject': subject,
                'sender': sender,
                'date': date,
                'body': body_text,
                'html': body_html,
                'urls': urls,
                'url_count': len(urls),
                'attachments': attachment_data
            }
            
            return result
            
        except HttpError as error:
            logger.error(f"Error getting email details with attachments: {error}")
            return None
    
    def get_dashboard_data(self, max_emails=100, use_cache=True):
        """Lấy dữ liệu cho dashboard với caching"""
        try:
            # Check cache
            cache_key = 'dashboard_data'
            if use_cache and cache_key in self._cache:
                cached_data, cached_time = self._cache[cache_key]
                if time.time() - cached_time < self._cache_timeout:
                    return cached_data
            
            # Authenticate if needed
            if not self.service:
                if not self.authenticate():
                    return self._get_error_response()
            
            # Get phishing emails
            phishing_messages = self.get_emails_by_label(PHISHING_LABEL, max_results=max_emails)
            phishing_count = len(phishing_messages)
            
            # Get safe emails
            safe_messages = self.get_emails_by_label(SAFE_LABEL, max_results=max_emails)
            safe_count = len(safe_messages)
            
            total_scanned = phishing_count + safe_count
            phishing_rate = f"{(phishing_count / total_scanned * 100):.2f}%" if total_scanned > 0 else "0%"
            
            # Format emails for dashboard (limit for performance)
            formatted_emails = []
            
            # Format phishing emails
            for msg in phishing_messages[:MAX_EMAILS_DISPLAY]:
                email_details = self.get_email_details(msg['id'])
                if email_details:
                    formatted_emails.append({
                        'id': email_details['id'],
                        'subject': email_details['subject'],
                        'sender': email_details['sender'],
                        'date': email_details['date'],
                        'is_phishing': True,
                        'urls': email_details.get('urls', []),
                        'url_count': email_details.get('url_count', 0),
                        'risk': 'high',
                        'status': 'blocked'
                    })
            
            # Format safe emails
            for msg in safe_messages[:MAX_EMAILS_DISPLAY]:
                email_details = self.get_email_details(msg['id'])
                if email_details:
                    formatted_emails.append({
                        'id': email_details['id'],
                        'subject': email_details['subject'],
                        'sender': email_details['sender'],
                        'date': email_details['date'],
                        'is_phishing': False,
                        'urls': email_details.get('urls', []),
                        'url_count': email_details.get('url_count', 0),
                        'risk': 'low',
                        'status': 'verified'
                    })
            
            # Sort by date (newest first)
            formatted_emails.sort(key=lambda x: x.get('date', ''), reverse=True)
            
            result = {
                'statistics': {
                    'total_emails_scanned': total_scanned,
                    'phishing_detected': phishing_count,
                    'safe_emails': safe_count,
                    'workflow_status': 'active',
                    'last_updated': None,  # Will be set by endpoint
                    'phishing_rate': phishing_rate
                },
                'emails': {
                    'emails': formatted_emails
                }
            }
            
            # Cache result
            if use_cache:
                self._cache[cache_key] = (result, time.time())
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting dashboard data: {e}", exc_info=True)
            return self._get_error_response()
    
    def get_reports_data(self, days=7, use_cache=True):
        """Lấy dữ liệu báo cáo với daily trends và threat types"""
        try:
            # Check cache
            cache_key = f'reports_data_{days}'
            if use_cache and cache_key in self._cache:
                cached_data, cached_time = self._cache[cache_key]
                if time.time() - cached_time < self._cache_timeout:
                    return cached_data
            
            # Authenticate if needed
            if not self.service:
                if not self.authenticate():
                    return self._get_reports_error_response()
            
            # Get all emails (phishing + safe)
            phishing_messages = self.get_emails_by_label(PHISHING_LABEL, max_results=MAX_EMAILS_REPORTS)
            safe_messages = self.get_emails_by_label(SAFE_LABEL, max_results=MAX_EMAILS_REPORTS)
            
            # Get email details for analysis
            all_emails = []
            
            # Process phishing emails
            for msg in phishing_messages:
                email_details = self.get_email_details(msg['id'])
                if email_details:
                    all_emails.append({
                        'id': email_details['id'],
                        'date': email_details.get('date', ''),
                        'is_phishing': True,
                        'urls': email_details.get('urls', []),
                        'url_count': email_details.get('url_count', 0),
                        'subject': email_details.get('subject', ''),
                        'body': email_details.get('body', ''),
                        'html': email_details.get('html', '')
                    })
            
            # Process safe emails
            for msg in safe_messages:
                email_details = self.get_email_details(msg['id'])
                if email_details:
                    all_emails.append({
                        'id': email_details['id'],
                        'date': email_details.get('date', ''),
                        'is_phishing': False,
                        'urls': email_details.get('urls', []),
                        'url_count': email_details.get('url_count', 0),
                        'subject': email_details.get('subject', ''),
                        'body': email_details.get('body', ''),
                        'html': email_details.get('html', '')
                    })
            
            # Calculate daily trends
            daily_data = {}
            
            # Initialize last N days
            today = datetime.now()
            for i in range(days):
                date = today - timedelta(days=i)
                date_str = date.strftime('%d/%m')
                daily_data[date_str] = {
                    'date': date_str,
                    'threats': 0,
                    'safe': 0,
                    'blocked': 0
                }
            
            # Group emails by date
            for email in all_emails:
                try:
                    # Parse email date
                    email_date_str = email.get('date', '')
                    if email_date_str:
                        # Try to parse various date formats
                        try:
                            email_date = parsedate_to_datetime(email_date_str)
                            # Remove timezone for comparison
                            if email_date.tzinfo:
                                email_date = email_date.replace(tzinfo=None)
                        except:
                            # Fallback: use current date if parsing fails
                            email_date = today
                        
                        # Check if email is within last N days
                        days_diff = (today - email_date).days
                        if 0 <= days_diff < days:
                            date_str = email_date.strftime('%d/%m')
                            
                            if date_str in daily_data:
                                if email.get('is_phishing'):
                                    daily_data[date_str]['threats'] += 1
                                    daily_data[date_str]['blocked'] += 1
                                else:
                                    daily_data[date_str]['safe'] += 1
                except Exception as e:
                    logger.warning(f"Error parsing email date: {e}")
                    continue
            
            # Convert to list sorted by date
            daily_trends = sorted([daily_data[d] for d in daily_data.keys()], key=lambda x: x['date'])
            
            # Calculate threat types
            # Một email có thể có nhiều loại threat, nhưng ưu tiên: CEO Fraud > URL > File
            url_threats = 0
            file_threats = 0
            ceo_fraud = 0
            
            for email in all_emails:
                if email.get('is_phishing'):
                    text = f"{email.get('subject', '')} {email.get('body', '')} {email.get('html', '')}".lower()
                    
                    # Check CEO fraud first (highest priority)
                    ceo_keywords = ['chuyển', 'tiền', 'stk', 'số tài khoản', '100tr', 'triệu', 'tech em', 'tech anh', 'đừng gọi', 'đang họp']
                    has_ceo_pattern = any(kw in text for kw in ceo_keywords)
                    
                    # Check URL threats
                    has_url = email.get('url_count', 0) > 0
                    
                    # Priority: CEO Fraud > URL > File
                    if has_ceo_pattern:
                        ceo_fraud += 1
                    elif has_url:
                        url_threats += 1
                    else:
                        # If no URL and no CEO pattern, likely file threat
                        file_threats += 1
            
            total_threats = url_threats + file_threats + ceo_fraud
            if total_threats == 0:
                total_threats = 1  # Avoid division by zero
            
            threat_type_data = [
                {
                    'type': 'URL Độc Hại',
                    'count': url_threats,
                    'percentage': int((url_threats / total_threats) * 100) if total_threats > 0 else 0
                },
                {
                    'type': 'File Đính Kèm',
                    'count': file_threats,
                    'percentage': int((file_threats / total_threats) * 100) if total_threats > 0 else 0
                },
                {
                    'type': 'CEO Fraud',
                    'count': ceo_fraud,
                    'percentage': int((ceo_fraud / total_threats) * 100) if total_threats > 0 else 0
                }
            ]
            
            # Calculate summary stats
            total_emails = len(all_emails)
            total_threats_detected = sum(1 for e in all_emails if e.get('is_phishing'))
            detection_rate = 100.0 if total_threats_detected > 0 else 0.0
            
            result = {
                'summary': {
                    'total_emails': total_emails,
                    'threats_detected': total_threats_detected,
                    'detection_rate': f"{detection_rate:.0f}%",
                    'avg_analysis_time': '0.8s'
                },
                'daily_trends': daily_trends,
                'threat_types': threat_type_data
            }
            
            # Cache result
            if use_cache:
                self._cache[cache_key] = (result, time.time())
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting reports data: {e}", exc_info=True)
            return self._get_reports_error_response()
    
    def _get_reports_error_response(self):
        """Helper method for error response in reports"""
        return {
            'summary': {
                'total_emails': 0,
                'threats_detected': 0,
                'detection_rate': '0%',
                'avg_analysis_time': '0.0s'
            },
            'daily_trends': [],
            'threat_types': []
        }
    
    def _get_error_response(self):
        """Helper method for error response"""
        return {
            'statistics': {
                'total_emails_scanned': 0,
                'phishing_detected': 0,
                'safe_emails': 0,
                'workflow_status': 'error',
                'last_updated': None,
                'phishing_rate': '0%'
            },
            'emails': {'emails': []}
        }

