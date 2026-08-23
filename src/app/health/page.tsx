"use client";
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';

export default function HealthPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/health').then(res => res.json()).then(data => { if (data.success) setItems(data.data); });
  }, []);

  return (
    <MainLayout>
      <div className="page-header">
        <h1 className="page-title">Sức khỏe Nghề nghiệp</h1>
      </div>
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Nhân viên</th><th>Ngày khám</th><th>Phân loại</th><th>Ghi chú</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.employeeName}</td><td>{new Date(item.checkDate).toLocaleDateString('vi-VN')}</td>
                  <td><Badge variant="info">{item.healthType}</Badge></td><td>{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
