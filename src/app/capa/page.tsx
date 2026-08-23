"use client";
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';

export default function CapaPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/capa').then(res => res.json()).then(data => { if (data.success) setItems(data.data); });
  }, []);

  return (
    <MainLayout>
      <div className="page-header"><h1 className="page-title">Quản lý CAPA</h1></div>
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Mã</th><th>Tiêu đề</th><th>Loại</th><th>Hạn chót</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.code}</strong></td><td>{item.title}</td>
                  <td>{item.actionType}</td>
                  <td>{new Date(item.deadline).toLocaleDateString('vi-VN')}</td>
                  <td><Badge variant="warning">{item.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
