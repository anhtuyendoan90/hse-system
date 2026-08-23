"use client";

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EMPLOYMENT_STATUSES } from '@/lib/constants';

interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  departmentName: string | null;
  jobTitle: string | null;
  employmentStatus: string;
  phone: string | null;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const exportToExcel = () => {
    if (employees.length === 0) return;
    const exportData = employees.map((emp: any) => ({
      'Mã NV': emp.employeeCode,
      'Họ và tên': emp.fullName,
      'Email': emp.email || '',
      'Số điện thoại': emp.phone || '',
      'Phòng ban': emp.departmentName || '',
      'Chức vụ': emp.jobTitle || '',
      'Trạng thái': emp.employmentStatus === 'working' ? 'Đang làm việc' : emp.employmentStatus,
      'Ngày sinh': emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString('vi-VN') : '',
      'Ngày vào làm': emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('vi-VN') : '',
      'Nhóm ATVSLĐ': emp.trainingGroup || '',
      'Ký HĐLĐ': emp.contractType || ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachNhanVien");
    
    XLSX.writeFile(workbook, "DanhSachNhanVien_HSE.xlsx");
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees?search=${search}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data.items);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const getStatusBadge = (status: string) => {
    const s = EMPLOYMENT_STATUSES.find(x => x.value === status);
    if (!s) return <Badge>Unknown</Badge>;
    return <Badge variant={s.color as any}>{s.label}</Badge>;
  };

  return (
    <MainLayout>
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Quản lý người lao động</h1>
          <p className="page-subtitle">Danh sách nhân sự và thông tin liên quan</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" icon="⬇️" onClick={exportToExcel}>Xuất Excel</Button>
          <Button variant="primary" icon="➕">Thêm nhân sự mới</Button>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Input 
            placeholder="Tìm theo tên, mã NV..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="mb-0"
            style={{ width: '300px' }}
          />
          <Select 
            options={[{value: 'all', label: 'Tất cả trạng thái'}, ...EMPLOYMENT_STATUSES]}
            containerClassName="mb-0"
            style={{ width: '200px' }}
          />
        </div>
        
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ và tên</th>
                <th>Phòng ban</th>
                <th>Chức danh</th>
                <th>SĐT</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: '32px' }}>Đang tải dữ liệu...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: '32px' }}>Không có dữ liệu</td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id}>
                    <td><strong>{emp.employeeCode}</strong></td>
                    <td>{emp.fullName}</td>
                    <td>{emp.departmentName || '—'}</td>
                    <td>{emp.jobTitle || '—'}</td>
                    <td>{emp.phone || '—'}</td>
                    <td>{getStatusBadge(emp.employmentStatus)}</td>
                    <td className="text-right">
                      <Button variant="ghost" size="sm">Sửa</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
