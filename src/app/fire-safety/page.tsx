"use client";
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';

export default function FireSafetyPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/fire-safety').then(res => res.json()).then(data => { if (data.success) setItems(data.data); });
  }, []);

  return (
    <MainLayout>
      <div className="page-header"><h1 className="page-title">Phòng cháy chữa cháy</h1></div>
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Mã</th><th>Tên thiết bị</th><th>Loại</th><th>Vị trí</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.code}</strong></td><td>{item.name}</td>
                  <td>{item.type}</td><td>{item.location}</td>
                  <td><Badge variant="success">{item.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
