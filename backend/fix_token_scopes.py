#!/usr/bin/env python3
"""
Script để fix token.json - Xóa token cũ và yêu cầu re-authentication với scope mới
"""

import os
import sys

def main():
    token_file = 'token.json'
    
    if os.path.exists(token_file):
        print("⚠️  Phát hiện token.json cũ với scope không đủ")
        print("📋 Token hiện tại chỉ có scope: gmail.readonly")
        print("📋 Cần scope: gmail.readonly + gmail.modify")
        print()
        
        response = input("Bạn có muốn xóa token.json và re-authenticate? (y/n): ")
        
        if response.lower() == 'y':
            os.remove(token_file)
            print("✅ Đã xóa token.json")
            print()
            print("🔄 Bây giờ chạy lại gmail_scanner.py để authenticate với scope mới:")
            print("   python gmail_scanner.py")
        else:
            print("❌ Hủy bỏ. Token.json vẫn giữ nguyên.")
            print("   Lưu ý: Bạn sẽ gặp lỗi 403 khi label email nếu không re-authenticate.")
    else:
        print("✅ Không tìm thấy token.json")
        print("   Chạy gmail_scanner.py để authenticate lần đầu:")

if __name__ == '__main__':
    main()

