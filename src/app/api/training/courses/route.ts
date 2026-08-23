import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { trainingCourses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const courses = db.select().from(trainingCourses).where(eq(trainingCourses.isActive, true)).all();
    return successResponse(courses);
  } catch (error) {
    return errorResponse('Lỗi hệ thống', 500);
  }
}
