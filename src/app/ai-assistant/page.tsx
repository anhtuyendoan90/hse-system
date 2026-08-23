"use client";
import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import ReactMarkdown from 'react-markdown';

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'ai', content: 'Xin chào! Tôi là Trợ lý ảo HSE. Bạn cần hỗ trợ phân tích dữ liệu hay tạo báo cáo an toàn nào?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', content: data.data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'Xin lỗi, đã có lỗi xảy ra.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Không thể kết nối đến máy chủ.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="page-header"><h1 className="page-title">AI HSE Assistant</h1></div>
      
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: '#f9fafb' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ 
                maxWidth: '75%', 
                padding: '1rem', 
                borderRadius: '0.5rem',
                backgroundColor: m.role === 'user' ? 'var(--primary)' : 'white',
                color: m.role === 'user' ? 'white' : 'var(--text)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                border: m.role === 'ai' ? '1px solid var(--border)' : 'none'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                  {m.role === 'user' ? 'Bạn' : 'HSE AI'}
                </div>
                <div style={{ lineHeight: 1.6 }} className={m.role === 'user' ? '' : 'markdown-body'}>
                  {m.role === 'user' ? m.content : <ReactMarkdown>{m.content}</ReactMarkdown>}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'white', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="dot-pulse">.</span><span className="dot-pulse delay-1">.</span><span className="dot-pulse delay-2">.</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div style={{ padding: '1rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nhập câu hỏi (vd: Hãy phân tích các sự cố gần đây...)" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={isLoading || !input.trim()}>
              Gửi tin nhắn
            </button>
          </form>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .markdown-body ul { padding-left: 1.5rem; margin-bottom: 1rem; }
        .markdown-body li { margin-bottom: 0.5rem; }
        .markdown-body p { margin-bottom: 1rem; }
        .markdown-body strong { font-weight: 600; }
        .dot-pulse { animation: pulse 1.5s infinite; opacity: 0.3; font-weight: bold; font-size: 1.5rem; line-height: 0.5; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}} />
    </MainLayout>
  );
}
