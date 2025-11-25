#!/usr/bin/env python3
"""
Gmail Scanner - Tự động quét email thật từ Gmail
Kết nối với backend API để phân tích
"""

import os
import json
import base64
import requests
import time
from datetime import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Gmail API scopes - Need modify permission to add labels
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'  # For adding labels
]

# Backend API URL
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:5000')

# Labels
PHISHING_LABEL_ID = "Label_8387377442759074354"
SAFE_LABEL_ID = "Label_291990169998442549"


class GmailScanner:
    def __init__(self, credentials_file='credentials.json', token_file='token.json'):
        self.credentials_file = credentials_file
        self.token_file = token_file
        self.service = None
        self.credentials = None
        
    def authenticate(self):
        """Authenticate với Gmail API"""
        creds = None
        
        # Load existing token
        if os.path.exists(self.token_file):
            creds = Credentials.from_authorized_user_file(self.token_file, SCOPES)
            
            # Check if token has all required scopes
            if creds and creds.valid:
                token_scopes = set(creds.scopes or [])
                required_scopes = set(SCOPES)
                
                # If token is missing required scopes, force re-authentication
                if not required_scopes.issubset(token_scopes):
                    logger.warning("⚠️ Token missing required scopes!")
                    logger.warning(f"Required: {SCOPES}")
                    logger.warning(f"Current: {list(token_scopes)}")
                    logger.info("🔄 Forcing re-authentication with new scopes...")
                    # Delete old token to force re-auth
                    os.remove(self.token_file)
                    creds = None
        
        # If no valid credentials, get new ones
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                logger.info("Refreshing credentials...")
                try:
                    creds.refresh(Request())
                except Exception as e:
                    logger.warning(f"Failed to refresh token: {e}")
                    logger.info("🔄 Re-authenticating with new scopes...")
                    # Delete old token if refresh fails
                    if os.path.exists(self.token_file):
                        os.remove(self.token_file)
                    creds = None
            
            if not creds or not creds.valid:
                if not os.path.exists(self.credentials_file):
                    logger.error(f"❌ File {self.credentials_file} not found!")
                    logger.error("Please download credentials.json from Google Cloud Console")
                    logger.error("Guide: https://developers.google.com/gmail/api/quickstart/python")
                    return False
                
                logger.info("🔐 Starting OAuth flow...")
                logger.info("📋 Requested scopes:")
                for scope in SCOPES:
                    logger.info(f"   - {scope}")
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_file, SCOPES)
                # Use port 0 to auto-select available port
                creds = flow.run_local_server(port=0, open_browser=True)
            
            # Save credentials for next run
            with open(self.token_file, 'w') as token:
                token.write(creds.to_json())
            
            logger.info("✅ Credentials saved successfully!")
        
        self.credentials = creds
        self.service = build('gmail', 'v1', credentials=creds)
        logger.info("✅ Gmail API authenticated successfully!")
        logger.info(f"📋 Active scopes: {list(creds.scopes)}")
        return True
    
    def get_unread_emails(self, max_results=10):
        """Lấy danh sách email chưa đọc từ Inbox, bỏ qua Social"""
        try:
            # Query: Chỉ lấy email chưa đọc từ Inbox, bỏ qua Social và Promotions
            # - is:unread: Chưa đọc
            # - in:inbox: Chỉ trong hộp thư đến
            # - -category:social: Bỏ qua Social
            # - -category:promotions: Bỏ qua Promotions (optional)
            query = 'is:unread in:inbox -category:social -category:promotions'
            
            logger.info(f"Searching emails with query: {query}")
            
            # Get unread emails from Inbox only
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            logger.info(f"📧 Found {len(messages)} unread email(s) in Inbox (excluding Social)")
            return messages
            
        except HttpError as error:
            logger.error(f"Error getting emails: {error}")
            return []
    
    def get_email_details(self, message_id):
        """Lấy chi tiết email"""
        try:
            message = self.service.users().messages().get(
                userId='me',
                id=message_id,
                format='full'
            ).execute()
            
            # Extract headers
            headers = message['payload'].get('headers', [])
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), '')
            date = next((h['value'] for h in headers if h['name'] == 'Date'), '')
            
            # Extract body
            body_text = ''
            body_html = ''
            attachments = []
            
            payload = message['payload']
            
            # Get body
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
            
            # Download attachments if needed
            attachment_data = []
            for att in attachments:
                try:
                    att_data = self.service.users().messages().attachments().get(
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
            
            return {
                'id': message_id,
                'subject': subject,
                'sender': sender,
                'date': date,
                'body': body_text,
                'html': body_html,
                'attachments': attachment_data
            }
            
        except HttpError as error:
            logger.error(f"Error getting email details: {error}")
            return None
    
    def analyze_email_with_backend(self, email_data):
        """Gửi email đến backend API để phân tích"""
        try:
            # Prepare request
            payload = {
                'subject': email_data['subject'],
                'body': email_data['body'],
                'html': email_data['html'],
                'attachments': email_data['attachments'],
                'urls': email_data.get('urls', [])  # Extract URLs if available
            }
            
            # Call backend API - use analyze-email endpoint
            response = requests.post(
                f"{BACKEND_API_URL}/analyze-email",
                json=payload,
                timeout=120  # 2 minutes timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Backend API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error calling backend API: {e}")
            return None
    
    def label_email(self, message_id, label_id):
        """Gán label cho email"""
        try:
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'addLabelIds': [label_id]}
            ).execute()
            logger.info(f"✅ Labeled email {message_id}")
            return True
        except HttpError as error:
            logger.error(f"Error labeling email: {error}")
            return False
    
    def mark_as_read(self, message_id):
        """Đánh dấu email đã đọc"""
        try:
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
            return True
        except HttpError as error:
            logger.error(f"Error marking as read: {error}")
            return False
    
    def scan_emails(self, max_emails=10):
        """Quét và phân tích emails từ Inbox (bỏ qua Social)"""
        logger.info("=" * 60)
        logger.info("🔍 Starting Gmail Scan (Inbox only, excluding Social)...")
        logger.info("=" * 60)
        
        # Authenticate
        if not self.authenticate():
            return
        
        # Get unread emails
        messages = self.get_unread_emails(max_results=max_emails)
        
        if not messages:
            logger.info("✅ No unread emails found")
            return
        
        # Process each email
        for i, msg in enumerate(messages, 1):
            message_id = msg['id']
            logger.info(f"\n📧 Processing email {i}/{len(messages)}: {message_id}")
            
            # Get email details
            email_data = self.get_email_details(message_id)
            if not email_data:
                continue
            
            logger.info(f"Subject: {email_data['subject']}")
            logger.info(f"From: {email_data['sender']}")
            logger.info(f"Attachments: {len(email_data['attachments'])}")
            
            # Analyze with backend
            logger.info("🔍 Analyzing with backend API...")
            result = self.analyze_email_with_backend(email_data)
            
            if result:
                is_phishing = result.get('is_phishing', False)
                threats = result.get('threats', [])
                label = result.get('label', SAFE_LABEL_ID)
                
                logger.info(f"Result: {'🚨 PHISHING' if is_phishing else '✅ SAFE'}")
                if threats:
                    logger.info(f"Threats: {', '.join(threats)}")
                
                # Label email
                if label:
                    self.label_email(message_id, label)
                
                # Mark as read
                self.mark_as_read(message_id)
            else:
                logger.warning("⚠️ Could not analyze email (backend API error)")
            
            # Small delay to avoid rate limiting
            time.sleep(1)
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ Scan completed!")
        logger.info("=" * 60)


def main():
    """Main function"""
    scanner = GmailScanner()
    
    # Check if backend is running
    try:
        response = requests.get(f"{BACKEND_API_URL}/health", timeout=5)
        if response.status_code == 200:
            logger.info(f"✅ Backend API is running at {BACKEND_API_URL}")
        else:
            logger.error(f"❌ Backend API returned error: {response.status_code}")
            logger.error("Please start the backend server first: python app.py")
            return
    except requests.exceptions.ConnectionError:
        logger.error(f"❌ Cannot connect to backend API at {BACKEND_API_URL}")
        logger.error("Please start the backend server first: python app.py")
        return
    
    # Scan emails
    scanner.scan_emails(max_emails=10)


if __name__ == '__main__':
    main()

