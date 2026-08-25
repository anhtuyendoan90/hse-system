import { db } from './db';
import { users, roles, sessions, rolePermissions, permissions } from './db/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'hse_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  fullName: string;
  roleId: number | null;
  roleName: string;
  roleCode: string;
  isActive: boolean;
  mustChangePassword: boolean;
  permissions: { module: string; action: string }[];
}

// Verify credentials and return user or null
export async function verifyCredentials(username: string, password: string) {
  const user = await db.select().from(users).where(eq(users.username, username)).get();
  if (!user || !user.isActive) return null;
  
  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) return null;
  
  return user;
}

// Create a new session
export async function createSession(userId: number, ip?: string, ua?: string): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();
  
  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
    ipAddress: ip || null,
    userAgent: ua || null,
  }).run();
  
  // Update last login
  await db.update(users).set({ lastLogin: new Date().toISOString() }).where(eq(users.id, userId)).run();
  
  return token;
}

// Get current authenticated user from session cookie
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionToken) return null;
    
    const session = await db.select().from(sessions)
      .where(and(
        eq(sessions.token, sessionToken),
        gt(sessions.expiresAt, new Date().toISOString())
      )).get();
    
    if (!session) return null;
    
    const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
    if (!user || !user.isActive) return null;
    
    const role = user.roleId ? await db.select().from(roles).where(eq(roles.id, user.roleId)).get() : null;
    
    // Get permissions for user's role
    const userPermissions: { module: string; action: string }[] = [];
    if (user.roleId) {
      const rps = await db.select({
        module: permissions.module,
        action: permissions.action,
      }).from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, user.roleId))
        .all();
      userPermissions.push(...rps);
    }
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      roleId: user.roleId,
      roleName: role?.name || 'Unknown',
      roleCode: role?.code || 'unknown',
      isActive: user.isActive ?? true,
      mustChangePassword: user.mustChangePassword ?? false,
      permissions: userPermissions,
    };
  } catch {
    return null;
  }
}

// Delete session
export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token)).run();
}

// Check if user has permission
export function hasPermission(user: AuthUser, module: string, action: string): boolean {
  if (user.roleCode === 'super_admin') return true;
  return user.permissions.some(p => p.module === module && p.action === action);
}

// Check multiple permissions
export function hasAnyPermission(user: AuthUser, module: string, actions: string[]): boolean {
  if (user.roleCode === 'super_admin') return true;
  return actions.some(action => hasPermission(user, module, action));
}

export { SESSION_COOKIE };
