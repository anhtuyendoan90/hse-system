"use client";
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ReportsPage() {
  const [data, setData] = useState<any>({ 
    incidents: [], inspections: [], health: [], 
    certificates: [], vehicles: [], legalDocs: [], 
    environment: [], training: [] 
  });

  useEffect(() => {
    fetch('/api/reports').then(res => res.json()).then(d => { if (d.success) setData(d.data); });
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

  return (
    <MainLayout>
      <div className="page-header"><h1 className="page-title">Báo cáo HSE Tổng quát</h1></div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Sự cố */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Thống kê Sự cố (Theo Quý)</h3></div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.incidents} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Số sự cố" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kiểm tra an toàn */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Thống kê Kiểm tra An toàn</h3></div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data.inspections} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Lượt kiểm tra" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sức khỏe */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Phân loại Sức khỏe Người lao động</h3></div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.health} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {data.health?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chứng chỉ */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Tình trạng Chứng chỉ & Giấy phép</h3></div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.certificates} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Xe & Phương tiện */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Tình trạng Xe & Phương tiện</h3></div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.vehicles} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Văn bản pháp luật */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Cập nhật Văn bản Pháp luật HSE</h3></div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.legalDocs} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Số lượng VB" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Môi trường */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Tỷ lệ Đạt Quan trắc Môi trường (%)</h3></div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.environment} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pass" stackId="a" name="Đạt" fill="#10b981" />
                <Bar dataKey="fail" stackId="a" name="Không đạt" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Đào tạo */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Huấn luyện An toàn (Theo nhóm)</h3></div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data.training} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Tỷ lệ hoàn thành (%)" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
