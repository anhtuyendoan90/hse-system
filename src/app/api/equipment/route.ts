import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { equipments } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const eqs = await db.select().from(equipments).all();
    return successResponse(eqs);
  } catch (error) {
    return errorResponse('Lỗi hệ thống', 500);
  }
}
