"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    employees: 0,
    incidents: 0,
    trainings: 0,
    inspections: 0
  });

  return (
    <MainLayout>
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Tổng quan hệ thống</h1>
          <p className="page-subtitle">Theo dõi tình hình An toàn, Sức khỏe và Môi trường</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-title">Tổng nhân sự</div>
          <div className="stat-card-value">1,245</div>
          <div className="stat-card-trend trend-up">↑ 12% so với tháng trước</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-title">Sự cố trong tháng</div>
          <div className="stat-card-value">2</div>
          <div className="stat-card-trend trend-down">↓ 50% so với tháng trước</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Tỷ lệ tuân thủ đào tạo</div>
          <div className="stat-card-value">94.5%</div>
          <div className="stat-card-trend trend-up">↑ 2.1% so với tháng trước</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Hành động khắc phục (CAPA)</div>
          <div className="stat-card-value">8</div>
          <div className="stat-card-trend trend-warning">⚠ 3 hành động quá hạn</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Cảnh báo & Cần chú ý</h3>
          </div>
          <div className="card-body">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Giấy phép PCCC nhà máy B sắp hết hạn</span>
                <Badge variant="danger">Còn 5 ngày</Badge>
              </li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span>15 nhân viên nhóm 3 chưa huấn luyện định kỳ</span>
                <Badge variant="warning">Cần xử lý</Badge>
              </li>
              <li style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Cần kiểm tra định kỳ 5 máy nâng hạ</span>
                <Badge variant="info">Trong tuần</Badge>
              </li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Hoạt động gần đây</h3>
          </div>
          <div className="card-body">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                <div>
                  <div style={{ fontWeight: 500 }}>Đã duyệt kết quả khám sức khỏe đợt 1</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Bởi Admin • 2 giờ trước</div>
                </div>
              </li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></div>
                <div>
                  <div style={{ fontWeight: 500 }}>Báo cáo sự cố tràn hóa chất nhẹ</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Phân xưởng 3 • 5 giờ trước</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
