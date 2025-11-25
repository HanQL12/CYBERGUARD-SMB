"""
VirusTotal API Manager
Handles dual API key management, load balancing, and rate limiting
"""

import time
import logging

logger = logging.getLogger(__name__)


class VirusTotalKeyManager:
    """Manages multiple VirusTotal API keys with round-robin and rate limit tracking"""
    def __init__(self, api_key_1, api_key_2):
        self.keys = []
        self.current_index = 0
        self.key_usage = {}
        self.key_rate_limits = {}
        
        # Add API keys
        if api_key_1:
            self.keys.append(api_key_1)
            self.key_usage[api_key_1] = 0
            self.key_rate_limits[api_key_1] = {'last_reset': time.time(), 'requests': 0}
        
        if api_key_2:
            self.keys.append(api_key_2)
            self.key_usage[api_key_2] = 0
            self.key_rate_limits[api_key_2] = {'last_reset': time.time(), 'requests': 0}
        
        if not self.keys:
            logger.warning("No VirusTotal API keys configured!")
    
    def get_next_key(self):
        """Get next available API key using round-robin"""
        if not self.keys:
            return None
        
        # Reset rate limit counters every minute
        current_time = time.time()
        for key in self.keys:
            if current_time - self.key_rate_limits[key]['last_reset'] >= 60:
                self.key_rate_limits[key]['last_reset'] = current_time
                self.key_rate_limits[key]['requests'] = 0
        
        # Find available key (not rate limited and under 4 requests/min)
        available_keys = [
            key for key in self.keys 
            if self.key_rate_limits[key]['requests'] < 4
        ]
        
        if not available_keys:
            # All keys rate limited, wait and use first key
            logger.warning("All VirusTotal API keys rate limited, waiting...")
            time.sleep(15)
            for key in self.keys:
                self.key_rate_limits[key]['requests'] = 0
            available_keys = self.keys
        
        # Round-robin selection
        if available_keys:
            selected_key = available_keys[self.current_index % len(available_keys)]
            self.current_index = (self.current_index + 1) % len(available_keys)
            self.key_usage[selected_key] += 1
            self.key_rate_limits[selected_key]['requests'] += 1
            return selected_key
        
        return self.keys[0] if self.keys else None
    
    def mark_rate_limited(self, key):
        """Mark a key as rate limited"""
        if key in self.key_rate_limits:
            self.key_rate_limits[key]['requests'] = 4
    
    def get_stats(self):
        """Get usage statistics"""
        return {
            'total_keys': len(self.keys),
            'key_usage': self.key_usage.copy(),
            'rate_limits': {k: v['requests'] for k, v in self.key_rate_limits.items()}
        }

