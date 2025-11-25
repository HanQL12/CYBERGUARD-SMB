"""
Application Constants
"""

# Gmail Labels
PHISHING_LABEL = "Label_8387377442759074354"
SAFE_LABEL = "Label_291990169998442549"

# Cache Timeouts (in seconds)
CACHE_TIMEOUT = 60  # 1 minute for dashboard data
EMAIL_CACHE_TIMEOUT = 300  # 5 minutes for email details
CACHE_MAX_SIZE = 1000  # Maximum cache entries

# API Timeouts (in seconds)
VIRUSTOTAL_TIMEOUT = 30
GEMINI_TIMEOUT = 45
GROQ_TIMEOUT = 30
HUGGINGFACE_TIMEOUT = 30

# Retry Configuration
MAX_RETRIES = 3
RETRY_DELAY = 1  # seconds
BACKOFF_FACTOR = 2

# Connection Pooling
POOL_CONNECTIONS = 10
POOL_MAXSIZE = 20

# Email Processing Limits
MAX_EMAILS_DASHBOARD = 100
MAX_EMAILS_DISPLAY = 50
MAX_EMAILS_REPORTS = 500

# CEO Fraud Detection Threshold
CEO_FRAUD_CONFIDENCE_THRESHOLD = 30  # Minimum confidence percentage

# VirusTotal Rate Limiting
VIRUSTOTAL_WAIT_TIME = 15  # seconds to wait after URL submission

