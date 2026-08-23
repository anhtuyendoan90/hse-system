"use client";
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';

export default function PermitsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/permits').then(res => res.json()).then(data => { if (data.success) setItems(data.data); });
  }, []);

  return (
    <MainLayout>
      <div className="page-header"><h1 className="page-title">Permit to Work (PTW)</h1></div>
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Mã PTW</th><th>Loại công việc</th><th>Vị trí</th><th>Người xin phép</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.code}</strong></td><td>{item.permitType}</td>
                  <td>{item.location}</td><td>{item.applicantName}</td>
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
