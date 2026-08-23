import { NextRequest } from 'next/server';
import { verifyCredentials, createSession, SESSION_COOKIE } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { errorResponse, successResponse } from '@/lib/utils';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return errorResponse('Vui lòng nhập tên đăng nhập và mật khẩu');
    }

    const user = await verifyCredentials(username, password);
    if (!user) {
      return errorResponse('Tên đăng nhập hoặc mật khẩu không đúng', 401);
    }

    // Create session
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';
    const token = await createSession(user.id, ip, ua);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    // Audit log
    createAuditLog({
      userId: user.id,
      username: user.username,
      action: 'login',
      module: 'auth',
      ipAddress: ip,
      userAgent: ua,
    });

    return successResponse({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      mustChangePassword: user.mustChangePassword,
    }, 'Đăng nhập thành công');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Lỗi hệ thống', 500);
  }
}
