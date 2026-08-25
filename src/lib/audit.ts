import { db } from './db';
import { auditLogs } from './db/schema';

export interface AuditLogEntry {
  userId?: number;
  username?: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'import' | 'export' | 'approve' | 'reject';
  module: string;
  entityType?: string;
  entityId?: number;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(entry: AuditLogEntry) {
  await db.insert(auditLogs).values({
    userId: entry.userId,
    username: entry.username,
    action: entry.action,
    module: entry.module,
    entityType: entry.entityType,
    entityId: entry.entityId,
    oldValues: entry.oldValues ? JSON.stringify(entry.oldValues) : null,
    newValues: entry.newValues ? JSON.stringify(entry.newValues) : null,
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
  }).run();
}
