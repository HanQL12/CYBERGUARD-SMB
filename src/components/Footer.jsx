import React from 'react';

const Footer = () => {
  return (
    <footer style={{ background: '#0f1a2e', borderTop: '1px solid #1a3a52' }} className="mt-12 p-6">
      <div className="max-w-7xl mx-auto text-center">
        <p style={{ color: '#7a8a99' }} className="font-mono text-xs">
          © 2025 SECUREML PLATFORM | BẢO MẬT AI DOANH NGHIỆP CHO SMB | PHIÊN BẢN 2.1 (ML ENGINE) | 
          TRẠNG THÁI API: <span style={{ color: '#44ff44' }}>HOẠT ĐỘNG</span> | 
          MODEL: <span style={{ color: '#00d9ff' }}>PHISHING-DEFENDER V2.1</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
