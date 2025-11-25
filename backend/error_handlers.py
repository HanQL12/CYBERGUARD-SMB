"""
Centralized Error Handling
Custom exceptions and error handlers
"""

import logging
from typing import Dict, Any
from flask import jsonify, request
from werkzeug.exceptions import HTTPException

logger = logging.getLogger(__name__)


class APIError(Exception):
    """Base API Error"""
    def __init__(self, message: str, status_code: int = 400, error_code: str = None):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or "API_ERROR"
        super().__init__(self.message)


class ValidationError(APIError):
    """Validation Error"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400, error_code="VALIDATION_ERROR")


class NotFoundError(APIError):
    """Not Found Error"""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404, error_code="NOT_FOUND")


class ExternalAPIError(APIError):
    """External API Error"""
    def __init__(self, message: str, service: str = "external"):
        super().__init__(
            f"{service} API error: {message}",
            status_code=502,
            error_code=f"{service.upper()}_API_ERROR"
        )


def register_error_handlers(app):
    """Register error handlers for Flask app"""
    
    @app.errorhandler(APIError)
    def handle_api_error(error: APIError):
        """Handle custom API errors"""
        logger.warning(f"API Error: {error.message} (Code: {error.error_code})")
        return jsonify({
            "error": True,
            "error_code": error.error_code,
            "message": error.message,
            "status_code": error.status_code
        }), error.status_code
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(error: ValidationError):
        """Handle validation errors"""
        logger.warning(f"Validation Error: {error.message}")
        return jsonify({
            "error": True,
            "error_code": "VALIDATION_ERROR",
            "message": error.message,
            "status_code": 400
        }), 400
    
    @app.errorhandler(404)
    def handle_not_found(error):
        """Handle 404 errors"""
        logger.warning(f"404 Not Found: {request.path}")
        return jsonify({
            "error": True,
            "error_code": "NOT_FOUND",
            "message": "Endpoint not found",
            "status_code": 404
        }), 404
    
    @app.errorhandler(405)
    def handle_method_not_allowed(error):
        """Handle 405 errors"""
        logger.warning(f"405 Method Not Allowed: {request.method} {request.path}")
        return jsonify({
            "error": True,
            "error_code": "METHOD_NOT_ALLOWED",
            "message": f"Method {request.method} not allowed for this endpoint",
            "status_code": 405
        }), 405
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        """Handle 500 errors"""
        logger.error(f"Internal Server Error: {str(error)}", exc_info=True)
        return jsonify({
            "error": True,
            "error_code": "INTERNAL_ERROR",
            "message": "Internal server error. Please try again later.",
            "status_code": 500
        }), 500
    
    @app.errorhandler(Exception)
    def handle_generic_error(error: Exception):
        """Handle all other exceptions"""
        # Don't log HTTPExceptions (they're expected)
        if isinstance(error, HTTPException):
            return error
        
        logger.error(f"Unhandled Exception: {str(error)}", exc_info=True)
        return jsonify({
            "error": True,
            "error_code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred",
            "status_code": 500
        }), 500

