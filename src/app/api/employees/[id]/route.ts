import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { employees, departments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!hasPermission(user, 'employees', 'view')) return forbiddenResponse();

    const { id } = await context.params;
    const empId = parseInt(id);
    
    const employee = db.select({
      id: employees.id,
      employeeCode: employees.employeeCode,
      fullName: employees.fullName,
      dateOfBirth: employees.dateOfBirth,
      gender: employees.gender,
      idCard: employees.idCard,
      departmentId: employees.departmentId,
      departmentName: departments.name,
      position: employees.position,
      jobTitle: employees.jobTitle,
      hireDate: employees.hireDate,
      contractType: employees.contractType,
      managerId: employees.managerId,
      workArea: employees.workArea,
      hasHazardousWork: employees.hasHazardousWork,
      trainingGroup: employees.trainingGroup,
      employmentStatus: employees.employmentStatus,
      phone: employees.phone,
      email: employees.email,
      address: employees.address,
      emergencyContact: employees.emergencyContact,
      emergencyPhone: employees.emergencyPhone,
      notes: employees.notes,
      createdAt: employees.createdAt,
      updatedAt: employees.updatedAt,
    })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .where(eq(employees.id, empId))
      .get();

    if (!employee) return notFoundResponse('Không tìm thấy nhân viên');

    return successResponse(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    return errorResponse('Lỗi khi tải thông tin nhân viên', 500);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!hasPermission(user, 'employees', 'edit')) return forbiddenResponse();

    const { id } = await context.params;
    const empId = parseInt(id);
    const body = await request.json();

    // Check exists
    const existing = db.select().from(employees).where(eq(employees.id, empId)).get();
    if (!existing) return notFoundResponse('Không tìm thấy nhân viên');

    // Check duplicate code if changed
    if (body.employeeCode && body.employeeCode !== existing.employeeCode) {
      const duplicate = db.select().from(employees).where(eq(employees.employeeCode, body.employeeCode)).get();
      if (duplicate) return errorResponse(`Mã nhân viên ${body.employeeCode} đã tồn tại`);
    }

    const now = new Date().toISOString();
    db.update(employees).set({
      employeeCode: body.employeeCode ?? existing.employeeCode,
      fullName: body.fullName ?? existing.fullName,
      dateOfBirth: body.dateOfBirth ?? existing.dateOfBirth,
      gender: body.gender ?? existing.gender,
      idCard: body.idCard ?? existing.idCard,
      departmentId: body.departmentId !== undefined ? (body.departmentId ? parseInt(body.departmentId) : null) : existing.departmentId,
      position: body.position ?? existing.position,
      jobTitle: body.jobTitle ?? existing.jobTitle,
      hireDate: body.hireDate ?? existing.hireDate,
      contractType: body.contractType ?? existing.contractType,
      workArea: body.workArea ?? existing.workArea,
      hasHazardousWork: body.hasHazardousWork ?? existing.hasHazardousWork,
      trainingGroup: body.trainingGroup ?? existing.trainingGroup,
      employmentStatus: body.employmentStatus ?? existing.employmentStatus,
      phone: body.phone ?? existing.phone,
      email: body.email ?? existing.email,
      address: body.address ?? existing.address,
      emergencyContact: body.emergencyContact ?? existing.emergencyContact,
      emergencyPhone: body.emergencyPhone ?? existing.emergencyPhone,
      notes: body.notes ?? existing.notes,
      updatedAt: now,
      updatedBy: user.id,
    }).where(eq(employees.id, empId)).run();

    createAuditLog({
      userId: user.id,
      username: user.username,
      action: 'update',
      module: 'employees',
      entityType: 'employee',
      entityId: empId,
      oldValues: existing as unknown as Record<string, unknown>,
      newValues: body,
    });

    return successResponse({ id: empId }, 'Cập nhật nhân viên thành công');
  } catch (error) {
    console.error('Update employee error:', error);
    return errorResponse('Lỗi khi cập nhật nhân viên', 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!hasPermission(user, 'employees', 'delete')) return forbiddenResponse();

    const { id } = await context.params;
    const empId = parseInt(id);

    const existing = db.select().from(employees).where(eq(employees.id, empId)).get();
    if (!existing) return notFoundResponse('Không tìm thấy nhân viên');

    // Soft delete
    db.update(employees).set({
      isDeleted: true,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    }).where(eq(employees.id, empId)).run();

    createAuditLog({
      userId: user.id,
      username: user.username,
      action: 'delete',
      module: 'employees',
      entityType: 'employee',
      entityId: empId,
      oldValues: { fullName: existing.fullName, employeeCode: existing.employeeCode },
    });

    return successResponse(null, 'Xóa nhân viên thành công');
  } catch (error) {
    console.error('Delete employee error:', error);
    return errorResponse('Lỗi khi xóa nhân viên', 500);
  }
}
