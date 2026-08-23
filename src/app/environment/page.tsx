"use client";
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';

export default function EnvironmentPage() {
  const [data, setData] = useState<any>({ wastes: [], metrics: [] });
  useEffect(() => {
    fetch('/api/environment').then(res => res.json()).then(res => { if (res.success) setData(res.data); });
  }, []);

  return (
    <MainLayout>
      <div className="page-header"><h1 className="page-title">Quản lý Môi trường</h1></div>
      <div className="card">
        <h3>Quản lý rác thải</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Loại</th><th>Số lượng</th><th>Đơn vị</th><th>Ngày phát sinh</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {data.wastes.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.wasteType}</td><td>{item.quantity}</td><td>{item.unit}</td>
                  <td>{new Date(item.generationDate).toLocaleDateString('vi-VN')}</td>
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
