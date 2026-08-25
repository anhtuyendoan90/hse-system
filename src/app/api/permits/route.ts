import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { permitsToWork, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    const data = await db.select({
      id: permitsToWork.id,
      code: permitsToWork.code,
      permitType: permitsToWork.permitType,
      description: permitsToWork.description,
      location: permitsToWork.location,
      status: permitsToWork.status,
      startTime: permitsToWork.startTime,
      applicantName: users.fullName,
    }).from(permitsToWork).innerJoin(users, eq(permitsToWork.applicantId, users.id)).all();
    return successResponse(data);
  } catch (error) {
    return errorResponse('Lỗi hệ thống', 500);
  }
}
