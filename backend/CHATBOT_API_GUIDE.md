# 🤖 Chatbot API Guide - CEO Fraud Detection

## 📋 Hiện tại đang dùng:

**Code hiện tại:** Hugging Face Inference API (model classification) - **KHÔNG PHẢI CHATBOT**

## ✅ Đề xuất: Dùng Chatbot API Free thực sự

### **Option 1: Google Gemini (Khuyến nghị)** ⭐

**Ưu điểm:**
- ✅ Free tier: 15 requests/minute
- ✅ Tốt cho tiếng Việt
- ✅ Không có whitelist/blacklist
- ✅ Phân tích tự nhiên như chatbot

**Lấy API Key:**
1. Vào: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy key vào `.env`: `GEMINI_API_KEY=your_key_here`

---

### **Option 2: Groq (Rất nhanh)** ⚡

**Ưu điểm:**
- ✅ Free: 14,400 requests/day
- ✅ Rất nhanh (LLaMA models)
- ✅ Không có whitelist/blacklist
- ✅ JSON response format

**Lấy API Key:**
1. Vào: https://console.groq.com/keys
2. Đăng ký (free)
3. Tạo API key
4. Copy vào `.env`: `GROQ_API_KEY=your_key_here`

---

### **Option 3: Hugging Face Chat** (Backup)

**Ưu điểm:**
- ✅ Free
- ✅ Nhiều models

**Lấy API Key:**
1. Vào: https://huggingface.co/settings/tokens
2. Tạo token (Read permission)
3. Copy vào `.env`: `HUGGINGFACE_API_KEY=your_key_here`

---

## 🚀 Priority Order:

Code sẽ thử theo thứ tự:
1. **Gemini** (nếu có key)
2. **Groq** (nếu có key)
3. **Hugging Face** (nếu có key)
4. **Pattern-based** (fallback nếu không có key nào)

## 📝 Cấu hình:

Thêm vào file `.env`:

```bash
# Chọn 1 trong 3 (hoặc dùng cả 3, code sẽ tự chọn)
GEMINI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
HUGGINGFACE_API_KEY=your_key_here
```

## ✅ Sau khi thêm API key:

1. Restart backend server
2. Test với email CEO fraud
3. Check logs để xem đang dùng API nào

## 🎯 Khuyến nghị:

**Dùng Google Gemini** vì:
- Free và đủ cho demo
- Tốt nhất cho tiếng Việt
- Không có whitelist/blacklist
- Phân tích tự nhiên như chatbot thật

