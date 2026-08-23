"use client";

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function VehiclesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
      })
      .catch(err => console.error("Failed to fetch vehicles", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Quản lý Phương tiện & Bảo hiểm</h1>
          <p className="page-subtitle">Theo dõi tình trạng kiểm định, bảo hiểm của các phương tiện</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" icon="➕">Thêm phương tiện</Button>
        </div>
      </div>

      <div className="card">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Biển số</th>
                <th>Loại xe</th>
                <th>Thương hiệu</th>
                <th>Số khung</th>
                <th>Số máy</th>
                <th>Hạn đăng kiểm</th>
                <th>Hạn kiểm định AT</th>
                <th>BH Bắt buộc</th>
                <th>BH Dân sự & Hành khách</th>
                <th>BH Tự nguyện</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center" style={{ padding: '32px' }}>Đang tải dữ liệu...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center" style={{ padding: '32px' }}>Không có dữ liệu phương tiện</td>
                </tr>
              ) : (
                data.map((item, i) => {
                  let badgeVariant = 'success';
                  if (item.status === 'maintenance') badgeVariant = 'warning';
                  if (item.status === 'inactive') badgeVariant = 'danger';

                  return (
                    <tr key={i}>
                      <td><strong>{item.plateNumber}</strong></td>
                      <td>{item.vehicleType}</td>
                      <td>{item.brand || '—'}</td>
                      <td>{item.chassisNumber || '—'}</td>
                      <td>{item.engineNumber || '—'}</td>
                      <td>{item.registrationExpiry || '—'}</td>
                      <td>{item.inspectionExpiry || '—'}</td>
                      <td>
                        {item.compulsoryInsuranceProvider ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontWeight: 500 }}>{item.compulsoryInsuranceProvider}</span>
                            <span className="text-muted" style={{ fontSize: '11px' }}>Hết hạn: {item.compulsoryInsuranceExpiry || '—'}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td>
                        {item.civilLiabilityInsuranceProvider ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontWeight: 500 }}>{item.civilLiabilityInsuranceProvider}</span>
                            <span className="text-muted" style={{ fontSize: '11px' }}>Hết hạn: {item.civilLiabilityInsuranceExpiry || '—'}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td>
                        {item.voluntaryInsuranceProvider ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontWeight: 500 }}>{item.voluntaryInsuranceProvider}</span>
                            <span className="text-muted" style={{ fontSize: '11px' }}>Hết hạn: {item.voluntaryInsuranceExpiry || '—'}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td>
                        <Badge variant={badgeVariant as any}>{
                          item.status === 'active' ? 'Hoạt động' :
                          item.status === 'maintenance' ? 'Bảo dưỡng' : 'Ngưng HĐ'
                        }</Badge>
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
