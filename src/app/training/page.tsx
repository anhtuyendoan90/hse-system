"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function TrainingPage() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/training/courses')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCourses(data.data);
      });
  }, []);

  return (
    <MainLayout>
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Huấn luyện HSE</h1>
          <p className="page-subtitle">Quản lý các khóa học và chứng nhận an toàn (NĐ 44/2016)</p>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Danh sách khóa học</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên khóa học</th>
                <th>Nhóm đối tượng</th>
                <th>Thời lượng</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td><strong>{course.code}</strong></td>
                  <td>{course.name}</td>
                  <td><Badge variant="info">{course.trainingGroup}</Badge></td>
                  <td>{course.durationHours} giờ</td>
                  <td className="text-right">
                    <Button variant="ghost" size="sm">Chi tiết</Button>
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
