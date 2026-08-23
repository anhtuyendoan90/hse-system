"use client";

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function CertificatesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/certificates')
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
      })
      .catch(err => console.error("Failed to fetch certificates", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Quản lý Chứng chỉ & Giấy phép</h1>
          <p className="page-subtitle">Theo dõi giấy phép, chứng chỉ an toàn của nhân viên và nhà thầu</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" icon="➕">Thêm chứng chỉ</Button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Người lao động</th>
                <th>Tên chứng chỉ</th>
                <th>Loại</th>
                <th>Ngày cấp</th>
                <th>Ngày hết hạn</th>
                <th>Nơi cấp</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: '32px' }}>Đang tải dữ liệu...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: '32px' }}>Không có dữ liệu chứng chỉ</td>
                </tr>
              ) : (
                data.map((item, i) => {
                  let status = 'Hợp lệ';
                  let badgeVariant = 'success';
                  
                  if (item.expiryDate) {
                    const today = new Date();
                    const expiry = new Date(item.expiryDate);
                    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
                    
                    if (diffDays < 0) {
                      status = 'Hết hạn';
                      badgeVariant = 'danger';
                    } else if (diffDays <= 30) {
                      status = 'Sắp hết hạn';
                      badgeVariant = 'warning';
                    }
                  }

                  return (
                    <tr key={i}>
                      <td><strong>{item.employeeName}</strong></td>
                      <td>{item.name}</td>
                      <td>{item.type}</td>
                      <td>{item.issueDate || '—'}</td>
                      <td>{item.expiryDate || '—'}</td>
                      <td>{item.issuer || '—'}</td>
                      <td>
                        <Badge variant={badgeVariant as any}>{status}</Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
