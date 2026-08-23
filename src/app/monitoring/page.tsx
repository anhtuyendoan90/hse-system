"use client";
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';

export default function MonitoringPage() {
  const [data, setData] = useState<any>({ campaigns: [], results: [] });
  
  useEffect(() => {
    fetch('/api/monitoring').then(res => res.json()).then(res => { if (res.success) setData(res.data); });
  }, []);

  return (
    <MainLayout>
      <div className="page-header"><h1 className="page-title">Quan trắc Môi trường Lao động</h1></div>
      
      <div className="card mb-4">
        <h3>Các đợt quan trắc</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Mã đợt</th><th>Tên đợt</th><th>Năm</th><th>Ngày đo</th><th>Đơn vị thực hiện</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {data.campaigns.map((camp: any) => (
                <tr key={camp.id}>
                  <td><strong>{camp.code}</strong></td><td>{camp.name}</td>
                  <td>{camp.year}</td><td>{new Date(camp.monitoringDate).toLocaleDateString('vi-VN')}</td>
                  <td>{camp.contractor}</td>
                  <td><Badge variant="success">{camp.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Kết quả đo đạc chi tiết</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Vị trí</th>
                <th>Nhóm yếu tố</th>
                <th>Tên yếu tố</th>
                <th>Kết quả</th>
                <th>Giới hạn</th>
                <th>Đơn vị</th>
                <th>Đánh giá</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((res: any) => (
                <tr key={res.id}>
                  <td>{res.location}</td>
                  <td>{res.factorGroup}</td>
                  <td><strong>{res.factorName}</strong></td>
                  <td>{res.resultValue}</td>
                  <td>{res.limitValue || '-'}</td>
                  <td>{res.unit}</td>
                  <td>
                    <Badge variant={res.status === 'pass' ? 'success' : 'danger'}>
                      {res.status === 'pass' ? 'Đạt' : 'Vượt giới hạn'}
                    </Badge>
                  </td>
                  <td>{res.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
