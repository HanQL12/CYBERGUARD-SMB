#!/usr/bin/env python3
"""
Test script for Email Security Analyzer API
"""

import requests
import json
import base64

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing /health...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

def test_analyze_email_ceo_fraud():
    """Test CEO fraud detection"""
    print("🔍 Testing /analyze-email (CEO Fraud)...")
    
    data = {
        "subject": "Khẩn cấp chuyển gấp 100tr",
        "body": "Chuyển gấp cho anh 100tr đến stk 01234567988 tech em nhé, đừng gọi cho a, a đang họp",
        "html": "",
        "attachments": []
    }
    
    response = requests.post(f"{BASE_URL}/analyze-email", json=data)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
    print(f"✅ Is Phishing: {result.get('is_phishing')}")
    print(f"✅ Threats: {result.get('threats')}")
    print()

def test_analyze_email_safe():
    """Test safe email"""
    print("🔍 Testing /analyze-email (Safe Email)...")
    
    data = {
        "subject": "Meeting tomorrow",
        "body": "Hi, let's have a meeting tomorrow at 2pm.",
        "html": "",
        "attachments": []
    }
    
    response = requests.post(f"{BASE_URL}/analyze-email", json=data)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
    print(f"✅ Is Phishing: {result.get('is_phishing')}")
    print()

def test_analyze_url():
    """Test URL analysis"""
    print("🔍 Testing /analyze-url...")
    
    data = {
        "url": "https://www.google.com"
    }
    
    response = requests.post(f"{BASE_URL}/analyze-url", json=data)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
    print()

def test_detect_ceo_fraud():
    """Test CEO fraud detection endpoint"""
    print("🔍 Testing /detect-ceo-fraud...")
    
    data = {
        "subject": "Urgent: Transfer money",
        "body": "Please transfer 100 million VND to account 0123456789 immediately. Don't call me, I'm in a meeting.",
        "html": ""
    }
    
    response = requests.post(f"{BASE_URL}/detect-ceo-fraud", json=data)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
    print()

if __name__ == "__main__":
    print("=" * 50)
    print("Email Security Analyzer API - Test Suite")
    print("=" * 50)
    print()
    
    try:
        test_health()
        test_analyze_email_ceo_fraud()
        test_analyze_email_safe()
        # test_analyze_url()  # Uncomment to test URL (takes 15+ seconds)
        test_detect_ceo_fraud()
        
        print("=" * 50)
        print("✅ All tests completed!")
        print("=" * 50)
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to server!")
        print("Make sure the server is running: python app.py")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

