"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge, StatusIndicator } from '@/components/ui/Badge';

export default function EquipmentPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/equipment')
      .then(res => res.json())
      .then(data => {
        if (data.success) setItems(data.data);
      });
  }, []);

  return (
    <MainLayout>
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Máy móc & Thiết bị</h1>
          <p className="page-subtitle">Quản lý kiểm định an toàn máy móc yêu cầu nghiêm ngặt</p>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Danh sách thiết bị</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên thiết bị</th>
                <th>Loại</th>
                <th>Vị trí</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.code}</strong></td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.location}</td>
                  <td>
                    <StatusIndicator 
                      status={item.status === 'active' ? 'active' : item.status === 'maintenance' ? 'warning' : 'inactive'} 
                      label={item.status === 'active' ? 'Hoạt động' : item.status === 'maintenance' ? 'Bảo dưỡng' : 'Ngưng HĐ'} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
