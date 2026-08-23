"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';

export default function PpePage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/ppe/items')
      .then(res => res.json())
      .then(data => {
        if (data.success) setItems(data.data);
      });
  }, []);

  return (
    <MainLayout>
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Quản lý kho PPE</h1>
          <p className="page-subtitle">Trang thiết bị bảo vệ cá nhân</p>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Danh mục vật tư</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên thiết bị</th>
                <th>Danh mục</th>
                <th>Tồn kho</th>
                <th>Đơn vị</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.code}</strong></td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>
                    {item.stockQuantity < item.minQuantity ? (
                      <Badge variant="danger">{item.stockQuantity}</Badge>
                    ) : (
                      <Badge variant="success">{item.stockQuantity}</Badge>
                    )}
                  </td>
                  <td>{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
