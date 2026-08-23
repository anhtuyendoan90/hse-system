"use client";

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(data.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">HSE</div>
          <div className="login-brand-text">
            <span className="login-brand-title">HSE MANAGEMENT SYSTEM</span>
            <span className="login-brand-subtitle">Hệ thống quản lý An toàn, Sức khỏe & Môi trường</span>
          </div>
        </div>
        
        <h1 className="login-hero-title">Số hóa toàn diện<br/>công tác quản lý HSE</h1>
        <p className="login-hero-subtitle">
          Giải pháp công nghệ giúp doanh nghiệp quản lý hiệu quả rủi ro, tuân thủ pháp luật và xây dựng văn hóa an toàn.
        </p>
        
        <div className="login-features">
          <div className="login-feature">
            <div className="login-feature-icon">🛡️</div>
            <span>Quản lý an toàn và sự cố toàn diện</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">📊</div>
            <span>Dashboard phân tích tự động bằng AI</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">🔔</div>
            <span>Hệ thống cảnh báo thông minh</span>
          </div>
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-card-title">Đăng nhập</h2>
          <p className="login-card-subtitle">Vui lòng đăng nhập để tiếp tục vào hệ thống</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label form-required">Tên đăng nhập</label>
              <input 
                type="text" 
                className="form-input" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label form-required">Mật khẩu</label>
              <input 
                type="password" 
                className="form-input" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />
            </div>
            
            {error && <div className="form-error" style={{ marginBottom: '16px' }}>{error}</div>}
            
            <Button 
              type="submit" 
              variant="primary" 
              className="login-submit"
              loading={loading}
              disabled={loading}
            >
              Đăng nhập
            </Button>
          </form>
          
          <div className="login-footer">
            &copy; 2026 HSE Management System. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <LoginContent />
    </Suspense>
  );
}
