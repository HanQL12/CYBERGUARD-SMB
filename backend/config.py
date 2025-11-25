"""
Configuration and Environment Validation
"""

import os
import logging
from typing import Optional
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


class Config:
    """Application Configuration"""
    
    # Flask Configuration
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    PORT = int(os.getenv('PORT', 5000))
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # API Keys
    VIRUSTOTAL_API_KEY_1 = os.getenv('VIRUSTOTAL_API_KEY_1', '')
    VIRUSTOTAL_API_KEY_2 = os.getenv('VIRUSTOTAL_API_KEY_2', '')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
    HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY', '')
    
    # VirusTotal Configuration
    VIRUSTOTAL_BASE_URL = "https://www.virustotal.com/api/v3"
    VIRUSTOTAL_TIMEOUT = int(os.getenv('VIRUSTOTAL_TIMEOUT', 30))
    VIRUSTOTAL_WAIT_TIME = int(os.getenv('VIRUSTOTAL_WAIT_TIME', 15))
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'app.log')
    LOG_MAX_BYTES = int(os.getenv('LOG_MAX_BYTES', 10 * 1024 * 1024))  # 10MB
    LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', 5))
    
    @classmethod
    def validate(cls) -> tuple[bool, list[str]]:
        """
        Validate configuration
        Returns: (is_valid, list_of_warnings)
        """
        warnings = []
        
        # Check required API keys
        if not cls.VIRUSTOTAL_API_KEY_1 and not cls.VIRUSTOTAL_API_KEY_2:
            warnings.append("⚠️ WARNING: No VirusTotal API keys found! URL/file scanning will fail.")
        
        # Check AI API keys (at least one recommended)
        if not cls.GEMINI_API_KEY and not cls.GROQ_API_KEY and not cls.HUGGINGFACE_API_KEY:
            warnings.append("⚠️ WARNING: No AI API keys found! CEO fraud detection will use pattern-based fallback.")
        
        # Validate CORS origins
        if not cls.CORS_ORIGINS or cls.CORS_ORIGINS == ['']:
            warnings.append("⚠️ WARNING: No CORS origins configured. Using default localhost:3000")
        
        # Validate port
        if cls.PORT < 1 or cls.PORT > 65535:
            warnings.append(f"⚠️ WARNING: Invalid port {cls.PORT}. Using default 5000")
            cls.PORT = 5000
        
        # Log warnings
        for warning in warnings:
            logger.warning(warning)
        
        return True, warnings
    
    @classmethod
    def get_cors_origins(cls) -> list[str]:
        """Get CORS origins, ensuring they're valid"""
        origins = []
        for origin in cls.CORS_ORIGINS:
            origin = origin.strip()
            if origin:
                origins.append(origin)
        
        # Default to localhost if empty
        if not origins:
            origins = ['http://localhost:3000']
        
        return origins

