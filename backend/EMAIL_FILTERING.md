# 📧 Email Filtering Configuration

## ✅ Đã cấu hình:

Scanner hiện tại chỉ quét:
- ✅ **Inbox** (Hộp thư đến)
- ❌ **Bỏ qua Social** (Mạng xã hội)
- ❌ **Bỏ qua Promotions** (Quảng cáo)

## 🔍 Query được sử dụng:

```
is:unread in:inbox -category:social -category:promotions
```

**Giải thích:**
- `is:unread`: Chỉ lấy email chưa đọc
- `in:inbox`: Chỉ trong hộp thư đến
- `-category:social`: Bỏ qua Social
- `-category:promotions`: Bỏ qua Promotions

## ⚙️ Tùy chỉnh Filter:

Nếu muốn thay đổi filter, sửa trong `gmail_scanner.py`:

```python
# Chỉ Inbox, bỏ Social
query = 'is:unread in:inbox -category:social'

# Chỉ Inbox, bỏ Social và Promotions
query = 'is:unread in:inbox -category:social -category:promotions'

# Chỉ Inbox, bỏ Social, Promotions, Updates
query = 'is:unread in:inbox -category:social -category:promotions -category:updates'

# Chỉ Inbox, bỏ tất cả categories ngoài Primary
query = 'is:unread in:inbox category:primary'
```

## 📋 Gmail Categories:

- `category:primary` - Email chính
- `category:social` - Mạng xã hội (Facebook, Twitter, etc.)
- `category:promotions` - Quảng cáo
- `category:updates` - Cập nhật (bills, receipts)
- `category:forums` - Diễn đàn

## ✅ Kết quả:

Scanner sẽ chỉ quét emails quan trọng trong Inbox, bỏ qua spam và mạng xã hội.

