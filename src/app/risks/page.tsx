"use client";
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';

export default function RisksPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/risks').then(res => res.json()).then(data => { if (data.success) setItems(data.data); });
  }, []);

  return (
    <MainLayout>
      <div className="page-header"><h1 className="page-title">Quản lý Rủi ro</h1></div>
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Mã</th><th>Công việc</th><th>Mối nguy</th><th>Mức độ rủi ro</th><th>Biện pháp KS</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.code}</strong></td><td>{item.activity}</td>
                  <td>{item.hazard}</td>
                  <td><Badge variant="danger">{item.riskLevel}</Badge></td>
                  <td>{item.controlMeasures}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
