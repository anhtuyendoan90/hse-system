import { NextRequest } from 'next/server';
import { deleteSession, getCurrentUser, SESSION_COOKIE } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { successResponse, errorResponse } from '@/lib/utils';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
      await deleteSession(token);
    }

    cookieStore.delete(SESSION_COOKIE);

    if (user) {
      createAuditLog({
        userId: user.id,
        username: user.username,
        action: 'logout',
        module: 'auth',
      });
    }

    return successResponse(null, 'Đăng xuất thành công');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('Lỗi hệ thống', 500);
  }
}
