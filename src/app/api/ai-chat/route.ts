import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils';
import { db } from '@/lib/db';
import { incidents, monitoringCampaigns } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    
    const { prompt } = await request.json();
    if (!prompt) return errorResponse('Prompt is required');

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get some stats to make the fake AI smart
    const totalIncidentsRes = db.select({ count: sql<number>`count(*)` }).from(incidents).get();
    const totalCampsRes = db.select({ count: sql<number>`count(*)` }).from(monitoringCampaigns).get();
    const incidentCount = totalIncidentsRes?.count || 0;
    const campCount = totalCampsRes?.count || 0;

    let responseMarkdown = '';
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('sự cố') || lowerPrompt.includes('tai nạn') || lowerPrompt.includes('incident')) {
      responseMarkdown = `### Phân tích Sự cố & Tai nạn\n\nHệ thống ghi nhận tổng cộng **${incidentCount} sự cố** đã xảy ra.\n\n* **Xu hướng:** Phần lớn các sự cố liên quan đến trượt ngã và thiết bị máy móc.\n* **Đề xuất:** Cần tăng cường tuần tra HSE tại khu vực Xưởng Sản Xuất và kiểm tra lại quy trình LOTO (Lockout-Tagout).`;
    } else if (lowerPrompt.includes('quan trắc') || lowerPrompt.includes('môi trường') || lowerPrompt.includes('environment')) {
      responseMarkdown = `### Báo cáo Quan trắc Môi trường\n\nChúng ta đã thực hiện **${campCount} đợt quan trắc**.\n\n* **Điểm nóng:** Khu vực *Xưởng Cơ Khí* đang có mức độ bức xạ nhiệt vượt ngưỡng (1.2 > 1.0).\n* **Khí độc:** Hàm lượng Clo (Cl) tại *Khu vực Xử lý nước* đạt 2.1 mg/m3, vượt quá tiêu chuẩn cho phép (1.0 mg/m3).\n* **Hành động khắc phục (CAPA):** Cần lắp đặt thêm hệ thống quạt thông gió và cấp phát mặt nạ phòng độc chuyên dụng.`;
    } else if (lowerPrompt.includes('xin chào') || lowerPrompt.includes('hello')) {
      responseMarkdown = `Chào bạn, **${user.fullName}**! Tôi là **HSE AI Assistant**.\n\nTôi có thể giúp bạn:\n- Tổng hợp báo cáo sự cố an toàn.\n- Phân tích xu hướng rủi ro từ dữ liệu quan trắc.\n- Tra cứu văn bản pháp luật về ATVSLĐ.\n\nBạn muốn hỏi gì hôm nay?`;
    } else {
      responseMarkdown = `Dựa trên dữ liệu hiện tại của hệ thống, tôi nhận thấy:\n\n1. **Tình hình chung:** Mức độ tuân thủ HSE đang ở mức ổn định, tuy nhiên vẫn cần chú ý đến các khu vực sản xuất có rủi ro cao.\n2. **Khuyến nghị:** Vui lòng kiểm tra mục CAPA (Hành động khắc phục - phòng ngừa) đang mở để đóng các rủi ro kịp thời.\n\nBạn có muốn tôi trích xuất dữ liệu cụ thể nào không?`;
    }

    return successResponse({ response: responseMarkdown });
  } catch (error) {
    return errorResponse('Lỗi hệ thống', 500);
  }
}
