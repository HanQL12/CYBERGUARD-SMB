"""
CEO Fraud Detection Module
Uses AI chatbots (Gemini, Groq, Hugging Face) and pattern-based fallback
"""

import re
import requests
import logging
from constants import CEO_FRAUD_CONFIDENCE_THRESHOLD

logger = logging.getLogger(__name__)


def detect_ceo_fraud_with_chatbot(subject, body, html, gemini_key, groq_key, huggingface_key, http_session):
    """
    Detect CEO fraud using Chatbot API (Free)
    Currently only uses Google Gemini responses
    """
    # Combine all text
    full_text = f"{subject} {body} {html}"
    
    # Clean HTML tags
    text = re.sub(r'<[^>]+>', '', full_text)
    text = text.strip()
    
    if not text:
        return {
            "detected": False,
            "confidence": 0,
            "reason": "No text content"
        }
    
    if not gemini_key:
        logger.warning("Gemini API key is missing. Skipping CEO fraud detection.")
        return {
            "detected": False,
            "confidence": 0,
            "reason": "Gemini API key is missing",
            "indicators": [],
            "method": "gemini_api"
        }
    
    try:
        logger.info("Using Google Gemini API for CEO fraud detection")
        result = analyze_with_gemini(text, gemini_key, http_session)
        if result and result.get('method') == 'gemini_api':
            return result
        
        logger.warning("Gemini API did not return a valid result.")
        return {
            "detected": False,
            "confidence": 0,
            "reason": "Gemini API did not return a valid result",
            "indicators": [],
            "method": "gemini_api"
        }
    except Exception as e:
        logger.error(f"Error in CEO fraud detection: {str(e)}")
        return {
            "detected": False,
            "confidence": 0,
            "reason": "Gemini API error",
            "indicators": [],
            "method": "gemini_api"
        }


def analyze_with_gemini(text, api_key, http_session):
    """Analyze text using Google Gemini API (Gemini 2.0 default)"""
    try:
        # Prefer Gemini 2.0 models, then fall back to 1.5/legacy variants
        models_to_try = [
            "gemini-2.0-flash",    # Stable 2.0 Flash (default)
            "gemini-2.0-pro",      # Stable 2.0 Pro for deeper reasoning
            "gemini-1.5-pro",      # Fallback: Most accurate pre-2.0 model
            "gemini-1.5-flash",    # Fallback: Faster alternative
            "gemini-pro"           # Legacy fallback
        ]
        
        api_url = None
        for model in models_to_try:
            api_version = "v1beta" if model.startswith("gemini-2.0") else "v1"
            api_url = f"https://generativelanguage.googleapis.com/{api_version}/models/{model}:generateContent?key={api_key}"
            break
        
        if not api_url:
            # Default to latest stable model
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        
        # Optimized prompt with structured analysis framework
        prompt = f"""Bạn là hệ thống AI chuyên phát hiện CEO Fraud (Business Email Compromise - BEC) cho doanh nghiệp Việt Nam. Nhiệm vụ của bạn là phân tích email và xác định xem có phải là lừa đảo giả mạo CEO/Giám đốc để yêu cầu chuyển tiền.

## KHUNG PHÂN TÍCH (Phân tích theo thứ tự):

### 1. PHÂN TÍCH YÊU CẦU TÀI CHÍNH
- Có yêu cầu chuyển tiền/thanh toán không?
- Số tiền có bất thường so với quy mô công ty không?
- Tài khoản ngân hàng có phải tài khoản công ty không?
- Có thông tin hợp đồng/hóa đơn/chứng từ hợp lệ không?

### 2. PHÂN TÍCH NGỮ ĐIỆU VÀ PHONG CÁCH
- Ngữ điệu có gấp gáp, ép buộc không?
- Có yêu cầu giữ bí mật, không liên lạc qua kênh khác không?
- Phong cách viết có phù hợp với email công ty chuyên nghiệp không?
- Có dấu hiệu giống chat cá nhân hơn là email công việc không?

### 3. PHÂN TÍCH BỐI CẢNH VÀ QUY TRÌNH
- Yêu cầu có phù hợp với quy trình công ty không?
- Có giải thích rõ ràng lý do chuyển tiền không?
- Có thông tin xác minh (số hợp đồng, mã đơn hàng, etc.) không?
- Có dấu hiệu bất thường so với giao dịch thông thường không?

### 4. PHÂN TÍCH KỸ THUẬT
- Email có chữ ký điện tử/chữ ký công ty không?
- Định dạng email có theo chuẩn doanh nghiệp không?
- Địa chỉ email người gửi có phải email công ty không?

## EMAIL CẦN PHÂN TÍCH:
{text[:4000]}

## YÊU CẦU PHÂN TÍCH:

Hãy phân tích email trên theo khung phân tích 4 bước và trả lời CHỈ bằng JSON (không có text, markdown, hoặc giải thích khác):

{{
    "detected": true/false,
    "confidence": 0-100,
    "reason": "Giải thích ngắn gọn tại sao phát hiện/không phát hiện CEO fraud (2-3 câu)",
    "indicators": ["dấu hiệu 1", "dấu hiệu 2", "dấu hiệu 3"],
    "analysis": {{
        "financial_request": "Phân tích yêu cầu tài chính",
        "tone_style": "Phân tích ngữ điệu và phong cách",
        "context_process": "Phân tích bối cảnh và quy trình",
        "technical": "Phân tích kỹ thuật"
    }},
    "risk_score": 0-100
}}

QUAN TRỌNG:
- "detected": true chỉ khi có NHIỀU dấu hiệu rõ ràng (tránh false positive)
- "confidence": Dựa trên số lượng và mức độ nghiêm trọng của indicators
- "risk_score": Tổng hợp rủi ro từ tất cả phân tích (0-100)
- Phân tích dựa trên HÀNH VI và NGỮ CẢNH, không chỉ từ khóa
- Ưu tiên phát hiện chính xác hơn là phát hiện nhiều (giảm false positive)"""
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "topK": 20,
                "topP": 0.8,
                "maxOutputTokens": 2048
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_NONE"
                }
            ]
        }
        
        response = http_session.post(api_url, json=payload, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            content = None
            try:
                if 'text' in result:
                    content = result['text']
                elif 'candidates' in result and len(result['candidates']) > 0:
                    candidate = result['candidates'][0]
                    if 'content' in candidate and 'parts' in candidate['content']:
                        parts = candidate['content']['parts']
                        if parts and 'text' in parts[0]:
                            content = parts[0]['text']
            except:
                pass
            
            if not content:
                logger.warning("No content in Gemini response")
                return None
            
            import json
            try:
                try:
                    parsed = json.loads(content)
                except:
                    json_match = re.search(r'\{[\s\S]*\}', content)
                    if json_match:
                        json_str = json_match.group().replace('```json', '').replace('```', '').strip()
                        parsed = json.loads(json_str)
                    else:
                        raise ValueError("No JSON found in response")
                
                detected = parsed.get('detected', False)
                confidence = int(parsed.get('confidence', 0))
                reason = parsed.get('reason', '')
                indicators = parsed.get('indicators', [])
                
                if isinstance(parsed.get('analysis'), dict):
                    analysis = parsed['analysis']
                    analysis_text = f"Tài chính: {analysis.get('financial_request', 'N/A')}; "
                    analysis_text += f"Ngữ điệu: {analysis.get('tone_style', 'N/A')}; "
                    analysis_text += f"Bối cảnh: {analysis.get('context_process', 'N/A')}; "
                    analysis_text += f"Kỹ thuật: {analysis.get('technical', 'N/A')}"
                else:
                    analysis_text = parsed.get('analysis', '')
                
                risk_score = parsed.get('risk_score', confidence)
                confidence = max(0, min(100, confidence))
                risk_score = max(0, min(100, risk_score))
                final_confidence = risk_score if risk_score > 0 else confidence
                
                logger.info(f"Gemini analysis: detected={detected}, confidence={final_confidence}%, risk_score={risk_score}")
                if indicators:
                    logger.info(f"Indicators: {', '.join(indicators[:3])}")
                
                return {
                    "detected": detected,
                    "confidence": final_confidence,
                    "method": "gemini_api",
                    "reason": reason or analysis_text or "Phân tích bằng AI Gemini",
                    "indicators": indicators if isinstance(indicators, list) else [],
                    "analysis": analysis_text,
                    "risk_score": risk_score
                }
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse Gemini JSON response: {e}")
                return analyze_gemini_response_semantically(content)
            except Exception as e:
                logger.warning(f"Error parsing Gemini response: {e}")
                return analyze_gemini_response_semantically(content)
            
        elif response.status_code == 404:
            logger.warning(f"Model not found, trying fallback models...")
            # Try fallback to 1.5 Flash if 2.0 models not available
            fallback_url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={api_key}"
            fallback_response = http_session.post(fallback_url, json=payload, timeout=60)
            if fallback_response.status_code == 200:
                fallback_result = fallback_response.json()
                fallback_content = fallback_result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                if fallback_content:
                    import json
                    try:
                        json_match = re.search(r'\{[\s\S]*\}', fallback_content)
                        if json_match:
                            json_str = json_match.group().replace('```json', '').replace('```', '').strip()
                            parsed = json.loads(json_str)
                            detected = parsed.get('detected', False)
                            confidence = int(parsed.get('confidence', 0))
                            return {
                                "detected": detected,
                                "confidence": max(0, min(100, confidence)),
                                "method": "gemini_api",
                                "reason": parsed.get('reason', ''),
                                "indicators": parsed.get('indicators', []),
                                "analysis": parsed.get('analysis', '')
                            }
                    except:
                        return analyze_gemini_response_semantically(fallback_content)
            logger.error(f"Gemini API error: {response.status_code} - {response.text}")
            return None
        elif response.status_code == 429:
            logger.warning("Gemini API rate limit exceeded")
            return None
        else:
            logger.error(f"Gemini API error: {response.status_code} - {response.text[:200]}")
            return None
            
    except requests.exceptions.Timeout:
        logger.error("Gemini API timeout")
        return None
    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        return None


def analyze_gemini_response_semantically(content):
    """Fallback semantic analysis when JSON parsing fails"""
    try:
        content_lower = content.lower()
        
        fraud_indicators = [
            'lừa đảo', 'fraud', 'scam', 'giả mạo', 'phishing',
            'phát hiện', 'detected', 'có dấu hiệu', 'dấu hiệu',
            'đáng ngờ', 'suspicious', 'bất thường', 'nguy hiểm',
            'true', 'có', 'yes', 'malicious'
        ]
        
        safe_indicators = [
            'an toàn', 'safe', 'hợp lệ', 'legitimate', 'hợp pháp',
            'không phát hiện', 'not detected', 'false', 'không',
            'no', 'benign', 'normal'
        ]
        
        fraud_score = sum(1 for ind in fraud_indicators if ind in content_lower)
        safe_score = sum(1 for ind in safe_indicators if ind in content_lower)
        
        confidence_match = re.search(r'["\']?confidence["\']?\s*[:=]\s*(\d+)', content_lower)
        confidence = int(confidence_match.group(1)) if confidence_match else 0
        
        if confidence == 0:
            if fraud_score > safe_score and fraud_score > 0:
                confidence = min(70, 50 + (fraud_score * 5))
            elif safe_score > fraud_score:
                confidence = max(10, 30 - (safe_score * 3))
            else:
                confidence = 50
        
        detected = fraud_score > safe_score and fraud_score > 0
        
        return {
            "detected": detected,
            "confidence": min(confidence, 95),
            "method": "gemini_api",
            "reason": "AI phát hiện dấu hiệu CEO fraud từ phân tích ngữ cảnh",
            "indicators": ["Phân tích ngữ cảnh cho thấy dấu hiệu lừa đảo"],
            "analysis": content[:200]
        }
    except Exception as e:
        logger.warning(f"Error in semantic analysis: {e}")
        return {
            "detected": False,
            "confidence": 50,
            "method": "gemini_api",
            "reason": "Không thể phân tích response",
            "indicators": [],
            "analysis": ""
        }


