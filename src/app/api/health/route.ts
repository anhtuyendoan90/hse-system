import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { healthRecords, employees } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const records = db.select({
      id: healthRecords.id,
      employeeName: employees.fullName,
      checkDate: healthRecords.checkDate,
      healthType: healthRecords.healthType,
      note: healthRecords.note,
    })
    .from(healthRecords)
    .innerJoin(employees, eq(healthRecords.employeeId, employees.id))
    .all();

    return successResponse(records);
  } catch (error) {
    return errorResponse('Lỗi hệ thống', 500);
  }
}
