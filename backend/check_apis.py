#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check API Configuration
Kiểm tra các API keys đã được cấu hình chưa
"""

import os
import sys
from dotenv import load_dotenv

# Fix encoding for Windows console
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Load .env from current directory
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(env_path)

print("=" * 60)
print("Checking API Configuration...")
print("=" * 60)
print()

# Check VirusTotal API
virustotal_key = os.getenv('VIRUSTOTAL_API_KEY', '')
if virustotal_key and virustotal_key != 'your_virustotal_api_key_here':
    print("[OK] VirusTotal API Key: CONFIGURED")
    print(f"     Key: {virustotal_key[:20]}...{virustotal_key[-10:]}")
else:
    print("[ERROR] VirusTotal API Key: NOT CONFIGURED")
    print("        Please add VIRUSTOTAL_API_KEY to .env file")
print()

# Check Hugging Face API
huggingface_key = os.getenv('HUGGINGFACE_API_KEY', '')
if huggingface_key and huggingface_key != 'your_huggingface_api_key_here':
    print("[OK] Hugging Face API Key: CONFIGURED")
    print(f"     Key: {huggingface_key[:20]}...{huggingface_key[-10:]}")
else:
    print("[WARN] Hugging Face API Key: NOT CONFIGURED (Optional)")
    print("       System will use pattern-based fallback")
    print("       Get free key at: https://huggingface.co/settings/tokens")
print()

# Check Gmail Credentials
if os.path.exists('credentials.json'):
    print("[OK] Gmail credentials.json: FOUND")
else:
    print("[ERROR] Gmail credentials.json: NOT FOUND")
    print("        Please download from Google Cloud Console")
    print("        See: GMAIL_SETUP_GUIDE.md")
print()

if os.path.exists('token.json'):
    print("[OK] Gmail token.json: FOUND (Already authenticated)")
else:
    print("[WARN] Gmail token.json: NOT FOUND")
    print("       Will be created on first run")
print()

print("=" * 60)
print("Summary:")
print("=" * 60)

required_apis = []
if not virustotal_key or virustotal_key == 'your_virustotal_api_key_here':
    required_apis.append("VirusTotal API Key")

if not os.path.exists('credentials.json'):
    required_apis.append("Gmail credentials.json")

if required_apis:
    print("[ERROR] Missing required APIs:")
    for api in required_apis:
        print(f"        - {api}")
    print()
    print("Please configure these before running the scanner!")
else:
    print("[OK] All required APIs are configured!")
    print("[OK] Ready to scan emails!")

print()

