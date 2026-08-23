import { getCurrentUser } from '@/lib/auth';
import { successResponse, unauthorizedResponse } from '@/lib/utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    return successResponse(user);
  } catch (error) {
    console.error('Auth check error:', error);
    return unauthorizedResponse();
  }
}
