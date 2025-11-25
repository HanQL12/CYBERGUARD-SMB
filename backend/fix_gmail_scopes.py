"""
Script to fix Gmail API scopes
This will delete the old token and re-authenticate with modify scope
"""

import os
import sys

# Fix encoding for Windows console
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

def main():
    token_path = os.path.join(os.path.dirname(__file__), 'token.json')
    credentials_path = os.path.join(os.path.dirname(__file__), 'credentials.json')
    
    print("=" * 60)
    print("Gmail API Scope Fix")
    print("=" * 60)
    print()
    
    # Check if credentials.json exists
    if not os.path.exists(credentials_path):
        print("[ERROR] credentials.json not found!")
        print("Please download it from Google Cloud Console first.")
        return False
    
    # Delete old token if exists
    if os.path.exists(token_path):
        print("[INFO] Found old token.json")
        print("[INFO] Deleting old token to re-authenticate with modify scope...")
        try:
            os.remove(token_path)
            print("[OK] Deleted old token.json")
        except Exception as e:
            print(f"[ERROR] Could not delete token: {e}")
            return False
    else:
        print("[INFO] No existing token found. Will create new one.")
    
    print()
    print("[INFO] Re-authenticating with Gmail API...")
    print("       This will open a browser window for authentication.")
    print()
    
    # Import and authenticate
    try:
        from gmail_helper import GmailHelper
        
        gmail = GmailHelper()
        if gmail.authenticate():
            print()
            print("[SUCCESS] Authentication successful!")
            print("[SUCCESS] New token.json created with modify scope")
            print()
            print("You can now use the urgent scan feature!")
            return True
        else:
            print()
            print("[ERROR] Authentication failed!")
            return False
            
    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

