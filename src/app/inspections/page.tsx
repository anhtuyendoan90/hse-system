"use client";
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';

export default function InspectionsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/inspections').then(res => res.json()).then(data => { if (data.success) setItems(data.data); });
  }, []);

  return (
    <MainLayout>
      <div className="page-header"><h1 className="page-title">Kiểm tra HSE</h1></div>
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Mã</th><th>Tên đợt kiểm tra</th><th>Ngày</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.code}</strong></td><td>{item.title}</td>
                  <td>{new Date(item.inspectionDate).toLocaleDateString('vi-VN')}</td>
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
