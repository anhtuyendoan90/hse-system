import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ppeItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const items = await db.select().from(ppeItems).where(eq(ppeItems.isActive, true)).all();
    return successResponse(items);
  } catch (error) {
    return errorResponse('Lỗi hệ thống', 500);
  }
}
