import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { inspections } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const data = await db.select().from(inspections).all();
    return successResponse(data);
  } catch (error) {
    return errorResponse('Lỗi hệ thống', 500);
  }
}
