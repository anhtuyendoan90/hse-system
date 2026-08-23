import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  // Mock aggregated data for all features
  
  const incidents = [
    { name: 'Q1', value: 2 },
    { name: 'Q2', value: 5 },
    { name: 'Q3', value: 1 },
    { name: 'Q4', value: 3 }
  ];
  
  const inspections = [
    { name: 'Q1', value: 10 },
    { name: 'Q2', value: 15 },
    { name: 'Q3', value: 8 },
    { name: 'Q4', value: 12 }
  ];

  const health = [
    { name: 'Loại I', value: 45 },
    { name: 'Loại II', value: 35 },
    { name: 'Loại III', value: 15 },
    { name: 'Loại IV', value: 4 },
    { name: 'Loại V', value: 1 }
  ];

  const certificates = [
    { name: 'Còn hạn', value: 120 },
    { name: 'Sắp hết hạn', value: 15 },
    { name: 'Đã hết hạn', value: 5 }
  ];

  const vehicles = [
    { name: 'Đang hoạt động', value: 40 },
    { name: 'Bảo dưỡng', value: 8 },
    { name: 'Hỏng hóc', value: 2 }
  ];

  const legalDocs = [
    { name: 'Luật', value: 10 },
    { name: 'Nghị định', value: 25 },
    { name: 'Thông tư', value: 45 },
    { name: 'Quy chuẩn', value: 30 }
  ];

  const environment = [
    { name: 'Vi khí hậu', pass: 95, fail: 5 },
    { name: 'Ánh sáng', pass: 90, fail: 10 },
    { name: 'Tiếng ồn', pass: 85, fail: 15 },
    { name: 'Bụi', pass: 92, fail: 8 },
    { name: 'Khí độc', pass: 98, fail: 2 }
  ];
  
  const training = [
    { name: 'Nhóm 1', value: 100 },
    { name: 'Nhóm 2', value: 85 },
    { name: 'Nhóm 3', value: 95 },
    { name: 'Nhóm 4', value: 92 },
    { name: 'Nhóm 5', value: 88 },
    { name: 'Nhóm 6', value: 90 }
  ];

  return successResponse({
    incidents,
    inspections,
    health,
    certificates,
    vehicles,
    legalDocs,
    environment,
    training
  });
}
