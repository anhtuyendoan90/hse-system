"use client";
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';

export default function IncidentsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/incidents').then(res => res.json()).then(data => { if (data.success) setItems(data.data); });
  }, []);

  return (
    <MainLayout>
      <div className="page-header"><h1 className="page-title">Sự cố & Tai nạn</h1></div>
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Mã</th><th>Tiêu đề</th><th>Mức độ</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.code}</strong></td><td>{item.title}</td>
                  <td><Badge variant={item.severity === 'major' ? 'danger' : 'warning'}>{item.severity}</Badge></td>
                  <td><Badge variant="info">{item.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
