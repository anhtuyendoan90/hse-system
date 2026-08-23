import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { employees, departments } from '@/lib/db/schema';
import { eq, and, like, or, sql, desc, asc, count } from 'drizzle-orm';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, parsePagination, paginationMeta } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!hasPermission(user, 'employees', 'view')) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = parsePagination(searchParams);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const departmentId = searchParams.get('department_id') || '';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Build conditions
    const conditions = [eq(employees.isDeleted, false)];
    
    if (search) {
      conditions.push(
        or(
          like(employees.fullName, `%${search}%`),
          like(employees.employeeCode, `%${search}%`),
          like(employees.phone, `%${search}%`),
          like(employees.email, `%${search}%`),
          like(employees.idCard, `%${search}%`)
        )!
      );
    }
    
    if (status) {
      conditions.push(eq(employees.employmentStatus, status));
    }
    
    if (departmentId) {
      conditions.push(eq(employees.departmentId, parseInt(departmentId)));
    }

    const where = and(...conditions);
    
    // Get total count
    const totalResult = db.select({ count: count() }).from(employees).where(where).get();
    const total = totalResult?.count || 0;

    // Sort mapping
    const sortColumn = {
      'employee_code': employees.employeeCode,
      'full_name': employees.fullName,
      'hire_date': employees.hireDate,
      'created_at': employees.createdAt,
      'department_id': employees.departmentId,
    }[sortBy] || employees.createdAt;

    const orderFn = sortOrder === 'asc' ? asc : desc;

    // Fetch employees with department name
    const results = db.select({
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
      workArea: employees.workArea,
      hasHazardousWork: employees.hasHazardousWork,
      trainingGroup: employees.trainingGroup,
      employmentStatus: employees.employmentStatus,
      phone: employees.phone,
      email: employees.email,
    })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .where(where)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset)
      .all();

    return successResponse({
      items: results,
      pagination: paginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error('List employees error:', error);
    return errorResponse('Lỗi khi tải danh sách nhân viên', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!hasPermission(user, 'employees', 'create')) return forbiddenResponse();

    const body = await request.json();

    // Validate required fields
    if (!body.employeeCode || !body.fullName) {
      return errorResponse('Mã nhân viên và họ tên là bắt buộc');
    }

    // Check duplicate employee code
    const existing = db.select().from(employees).where(eq(employees.employeeCode, body.employeeCode)).get();
    if (existing) {
      return errorResponse(`Mã nhân viên ${body.employeeCode} đã tồn tại`);
    }

    const now = new Date().toISOString();
    const result = db.insert(employees).values({
      employeeCode: body.employeeCode,
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth || null,
      gender: body.gender || null,
      idCard: body.idCard || null,
      departmentId: body.departmentId ? parseInt(body.departmentId) : null,
      position: body.position || null,
      jobTitle: body.jobTitle || null,
      hireDate: body.hireDate || null,
      contractType: body.contractType || null,
      workArea: body.workArea || null,
      hasHazardousWork: body.hasHazardousWork || false,
      trainingGroup: body.trainingGroup || null,
      employmentStatus: body.employmentStatus || 'working',
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
      emergencyContact: body.emergencyContact || null,
      emergencyPhone: body.emergencyPhone || null,
      notes: body.notes || null,
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
    }).run();

    createAuditLog({
      userId: user.id,
      username: user.username,
      action: 'create',
      module: 'employees',
      entityType: 'employee',
      entityId: Number(result.lastInsertRowid),
      newValues: body,
    });

    return successResponse({ id: Number(result.lastInsertRowid) }, 'Thêm nhân viên thành công');
  } catch (error) {
    console.error('Create employee error:', error);
    return errorResponse('Lỗi khi thêm nhân viên', 500);
  }
}
