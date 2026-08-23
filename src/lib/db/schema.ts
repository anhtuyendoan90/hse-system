/**
 * HSE Management System - Database Schema
 * Định nghĩa cấu trúc cơ sở dữ liệu cho hệ thống quản lý HSE
 * 
 * Sử dụng Drizzle ORM với SQLite (better-sqlite3)
 */

import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================================
// BẢNG VAI TRÒ (Roles)
// Quản lý các vai trò trong hệ thống RBAC
// ============================================================
export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  isSystem: integer('is_system', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================
// BẢNG QUYỀN HẠN (Permissions)
// Định nghĩa các quyền truy cập theo module và hành động
// ============================================================
export const permissions = sqliteTable('permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  module: text('module').notNull(),
  action: text('action').notNull(),
  description: text('description'),
}, (table) => [
  uniqueIndex('idx_perm_module_action').on(table.module, table.action),
]);

// ============================================================
// BẢNG PHÂN QUYỀN THEO VAI TRÒ (Role Permissions)
// Liên kết vai trò với quyền hạn
// ============================================================
export const rolePermissions = sqliteTable('role_permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (table) => [
  uniqueIndex('idx_role_perm').on(table.roleId, table.permissionId),
]);

// ============================================================
// BẢNG NGƯỜI DÙNG (Users)
// Tài khoản đăng nhập hệ thống
// ============================================================
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email'),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  roleId: integer('role_id').references(() => roles.id),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  avatar: text('avatar'),
  lastLogin: text('last_login'),
  mustChangePassword: integer('must_change_password', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  createdBy: integer('created_by'),
}, (table) => [
  index('idx_users_role').on(table.roleId),
  index('idx_users_active').on(table.isActive),
]);

// ============================================================
// BẢNG PHÒNG BAN (Departments)
// Quản lý cơ cấu tổ chức: phòng ban, bộ phận, đội
// ============================================================
export const departments = sqliteTable('departments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  parentId: integer('parent_id'),
  location: text('location'),
  managerName: text('manager_name'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================
// BẢNG NGƯỜI LAO ĐỘNG (Employees)
// Hồ sơ nhân sự HSE - thông tin chi tiết của người lao động
// ============================================================
export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeCode: text('employee_code').notNull().unique(),
  fullName: text('full_name').notNull(),
  dateOfBirth: text('date_of_birth'),
  gender: text('gender'), // Nam, Nữ
  idCard: text('id_card'), // Số CCCD/CMND
  departmentId: integer('department_id').references(() => departments.id),
  position: text('position'), // Chức danh
  jobTitle: text('job_title'), // Công việc
  hireDate: text('hire_date'), // Ngày vào làm
  contractType: text('contract_type'), // Loại hợp đồng: HĐLĐ, CTV, Thử việc, Thời vụ
  managerId: integer('manager_id'), // Người quản lý trực tiếp
  workArea: text('work_area'), // Khu vực làm việc
  hasHazardousWork: integer('has_hazardous_work', { mode: 'boolean' }).default(false),
  trainingGroup: text('training_group'), // Nhóm 1-6 theo NĐ 44/2016
  employmentStatus: text('employment_status').default('working'), // working, resigned, suspended, maternity_leave
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  emergencyContact: text('emergency_contact'),
  emergencyPhone: text('emergency_phone'),
  notes: text('notes'),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by'),
}, (table) => [
  index('idx_emp_dept').on(table.departmentId),
  index('idx_emp_status').on(table.employmentStatus),
  index('idx_emp_deleted').on(table.isDeleted),
  index('idx_emp_name').on(table.fullName),
  index('idx_emp_code').on(table.employeeCode),
]);

// ============================================================
// BẢNG THÔNG BÁO (Notifications)
// Quản lý cảnh báo và thông báo trong hệ thống
// ============================================================
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(), // certificate_expiry, training_expiry, equipment_inspection, etc.
  severity: text('severity').notNull(), // critical, warning, info, success
  title: text('title').notNull(),
  message: text('message').notNull(),
  module: text('module'),
  referenceId: integer('reference_id'),
  referenceType: text('reference_type'),
  userId: integer('user_id').references(() => users.id),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  readAt: text('read_at'),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_notif_user').on(table.userId),
  index('idx_notif_read').on(table.isRead),
  index('idx_notif_type').on(table.type),
  index('idx_notif_severity').on(table.severity),
]);

// ============================================================
// BẢNG CẤU HÌNH CẢNH BÁO (Alert Configs)
// Cấu hình thời gian và cách thức cảnh báo cho từng module
// ============================================================
export const alertConfigs = sqliteTable('alert_configs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  module: text('module').notNull(),
  alertType: text('alert_type').notNull(),
  daysBefore: integer('days_before').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  notifyRoles: text('notify_roles'), // JSON array of role codes
  sendEmail: integer('send_email', { mode: 'boolean' }).default(false),
  sendInApp: integer('send_in_app', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  createdBy: integer('created_by'),
}, (table) => [
  index('idx_alert_module').on(table.module),
]);

// ============================================================
// BẢNG CÀI ĐẶT HỆ THỐNG (System Settings)
// Lưu trữ các cấu hình chung của hệ thống
// ============================================================
export const systemSettings = sqliteTable('system_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value'),
  category: text('category').notNull(),
  description: text('description'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  updatedBy: integer('updated_by'),
});

// ============================================================
// BẢNG NHẬT KÝ KIỂM TOÁN (Audit Logs)
// Ghi nhận toàn bộ lịch sử thao tác trên hệ thống
// ============================================================
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  username: text('username'),
  action: text('action').notNull(), // create, update, delete, login, logout, import, export, approve, reject
  module: text('module').notNull(),
  entityType: text('entity_type'),
  entityId: integer('entity_id'),
  oldValues: text('old_values'), // JSON string
  newValues: text('new_values'), // JSON string
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_audit_user').on(table.userId),
  index('idx_audit_module').on(table.module),
  index('idx_audit_action').on(table.action),
  index('idx_audit_date').on(table.createdAt),
]);

// ============================================================
// BẢNG PHIÊN ĐĂNG NHẬP (Sessions)
// Quản lý phiên làm việc của người dùng
// ============================================================
export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_session_user').on(table.userId),
  index('idx_session_token').on(table.token),
  index('idx_session_expires').on(table.expiresAt),
]);

// ============================================================
// TypeScript Types - Xuất các kiểu dữ liệu cho sử dụng trong ứng dụng
// ============================================================
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type AlertConfig = typeof alertConfigs.$inferSelect;
export type NewAlertConfig = typeof alertConfigs.$inferInsert;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

// ============================================================
// BẢNG KHÓA HUẤN LUYỆN (Training Courses)
// NĐ 44/2016
// ============================================================
export const trainingCourses = sqliteTable('training_courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  trainingGroup: text('training_group').notNull(), // Nhóm 1, 2, 3, 4, 5, 6
  durationHours: integer('duration_hours'),
  provider: text('provider'),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================
// BẢNG HỒ SƠ HUẤN LUYỆN (Training Records)
// ============================================================
export const trainingRecords = sqliteTable('training_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeId: integer('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  courseId: integer('course_id').notNull().references(() => trainingCourses.id),
  completionDate: text('completion_date').notNull(),
  expiryDate: text('expiry_date'),
  status: text('status').default('valid'), // valid, expired, expiring_soon
  certificateNumber: text('certificate_number'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  createdBy: integer('created_by'),
}, (table) => [
  index('idx_training_emp').on(table.employeeId),
  index('idx_training_expiry').on(table.expiryDate),
]);

// ============================================================
// BẢNG CHỨNG CHỈ (Certificates)
// Chứng chỉ nghề, giấy phép vận hành...
// ============================================================
export const certificates = sqliteTable('certificates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeId: integer('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type'), // Vận hành xe nâng, Thợ hàn, Sơ cấp cứu...
  issueDate: text('issue_date'),
  expiryDate: text('expiry_date'),
  issuer: text('issuer'),
  documentUrl: text('document_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_cert_emp').on(table.employeeId),
  index('idx_cert_expiry').on(table.expiryDate),
]);

// ============================================================
// BẢNG DANH MỤC PPE (PPE Items)
// ============================================================
export const ppeItems = sqliteTable('ppe_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category'), // Đầu, Mắt, Tay, Chân, Toàn thân...
  unit: text('unit').default('Cái'),
  stockQuantity: integer('stock_quantity').default(0),
  minQuantity: integer('min_quantity').default(10),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================
// BẢNG CẤP PHÁT PPE (PPE Issuances)
// ============================================================
export const ppeIssuances = sqliteTable('ppe_issuances', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeId: integer('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  ppeId: integer('ppe_id').notNull().references(() => ppeItems.id),
  quantity: integer('quantity').notNull().default(1),
  issueDate: text('issue_date').notNull(),
  nextIssueDate: text('next_issue_date'), // Ngày dự kiến cấp lại
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  createdBy: integer('created_by'),
}, (table) => [
  index('idx_ppe_iss_emp').on(table.employeeId),
  index('idx_ppe_iss_next').on(table.nextIssueDate),
]);

// ============================================================
// BẢNG MÁY MÓC THIẾT BỊ (Equipments)
// Máy móc yêu cầu nghiêm ngặt (cẩu trục, nồi hơi...)
// ============================================================
export const equipments = sqliteTable('equipments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category'), // Thiết bị nâng, Thiết bị áp lực, Phanh hãm...
  location: text('location'), // Vị trí xưởng/nhà máy
  status: text('status').default('active'), // active, maintenance, retired
  lastInspectionDate: text('last_inspection_date'),
  nextInspectionDate: text('next_inspection_date'),
  departmentId: integer('department_id').references(() => departments.id),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_equip_next_insp').on(table.nextInspectionDate),
  index('idx_equip_status').on(table.status),
]);

// Thêm các types xuất ra
export type TrainingCourse = typeof trainingCourses.$inferSelect;
export type TrainingRecord = typeof trainingRecords.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type PpeItem = typeof ppeItems.$inferSelect;
export type PpeIssuance = typeof ppeIssuances.$inferSelect;
export type Equipment = typeof equipments.$inferSelect;

// ============================================================
// BẢNG KHÁM SỨC KHỎE (Health Records)
// ============================================================
export const healthRecords = sqliteTable('health_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeId: integer('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  checkDate: text('check_date').notNull(),
  nextCheckDate: text('next_check_date'),
  healthType: text('health_type'), // Loại 1, Loại 2, Loại 3, Loại 4, Loại 5
  bloodPressure: text('blood_pressure'),
  heartRate: integer('heart_rate'),
  vision: text('vision'),
  hearing: text('hearing'),
  doctor: text('doctor'),
  hospital: text('hospital'),
  note: text('note'),
  documentUrl: text('document_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  createdBy: integer('created_by'),
}, (table) => [
  index('idx_health_emp').on(table.employeeId),
  index('idx_health_next').on(table.nextCheckDate),
]);

// ============================================================
// BẢNG BỆNH NGHỀ NGHIỆP (Occupational Diseases)
// ============================================================
export const occupationalDiseases = sqliteTable('occupational_diseases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeId: integer('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  diseaseName: text('disease_name').notNull(),
  diagnosisDate: text('diagnosis_date').notNull(),
  treatmentFacility: text('treatment_facility'),
  status: text('status').default('active'), // active, cured, monitoring
  notes: text('notes'),
  documentUrl: text('document_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_disease_emp').on(table.employeeId),
]);

// ============================================================
// BẢNG SỰ CỐ & TAI NẠN (Incidents)
// ============================================================
export const incidents = sqliteTable('incidents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // IN-2023-001
  title: text('title').notNull(),
  description: text('description').notNull(),
  incidentDate: text('incident_date').notNull(),
  location: text('location'),
  departmentId: integer('department_id').references(() => departments.id),
  severity: text('severity').notNull(), // near_miss, minor, major, fatal
  status: text('status').default('open'), // open, investigating, action_required, closed
  reportedBy: integer('reported_by').references(() => users.id),
  investigatorId: integer('investigator_id').references(() => users.id),
  rootCause: text('root_cause'),
  immediateAction: text('immediate_action'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_incident_date').on(table.incidentDate),
  index('idx_incident_severity').on(table.severity),
  index('idx_incident_status').on(table.status),
]);

// ============================================================
// BẢNG NGƯỜI BỊ NẠN (Incident Victims)
// ============================================================
export const incidentVictims = sqliteTable('incident_victims', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  incidentId: integer('incident_id').notNull().references(() => incidents.id, { onDelete: 'cascade' }),
  employeeId: integer('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  injuryType: text('injury_type'),
  daysLost: integer('days_lost').default(0), // Số ngày nghỉ việc do tai nạn
  medicalCost: integer('medical_cost').default(0),
  notes: text('notes'),
}, (table) => [
  index('idx_victim_inc').on(table.incidentId),
  index('idx_victim_emp').on(table.employeeId),
]);

// ============================================================
// BẢNG KIỂM TRA HSE (Inspections)
// ============================================================
export const inspections = sqliteTable('inspections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // CHK-2023-001
  title: text('title').notNull(),
  inspectionDate: text('inspection_date').notNull(),
  location: text('location'),
  departmentId: integer('department_id').references(() => departments.id),
  inspectorName: text('inspector_name'),
  inspectorId: integer('inspector_id').references(() => users.id),
  status: text('status').default('planned'), // planned, in_progress, completed
  score: integer('score'), // Điểm đánh giá (nếu có)
  findings: text('findings'),
  documentUrl: text('document_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_insp_date').on(table.inspectionDate),
]);

// ============================================================
// BẢNG HÀNH ĐỘNG KHẮC PHỤC (CAPA)
// ============================================================
export const capas = sqliteTable('capas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // CAPA-2023-001
  title: text('title').notNull(),
  description: text('description').notNull(),
  sourceType: text('source_type'), // incident, inspection, audit, external
  sourceId: integer('source_id'), // ID của incident hoặc inspection tương ứng
  actionType: text('action_type').notNull(), // corrective (khắc phục), preventive (phòng ngừa)
  rootCause: text('root_cause'),
  actionPlan: text('action_plan').notNull(),
  assigneeId: integer('assignee_id').references(() => users.id), // Người phụ trách xử lý
  departmentId: integer('department_id').references(() => departments.id),
  deadline: text('deadline').notNull(),
  completionDate: text('completion_date'),
  status: text('status').default('open'), // open, in_progress, closed, verified
  verifierId: integer('verifier_id').references(() => users.id),
  verifyDate: text('verify_date'),
  verifyNotes: text('verify_notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  createdBy: integer('created_by').references(() => users.id),
}, (table) => [
  index('idx_capa_status').on(table.status),
  index('idx_capa_deadline').on(table.deadline),
  index('idx_capa_assignee').on(table.assigneeId),
]);

export type HealthRecord = typeof healthRecords.$inferSelect;
export type OccupationalDisease = typeof occupationalDiseases.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
export type IncidentVictim = typeof incidentVictims.$inferSelect;
export type Inspection = typeof inspections.$inferSelect;
export type Capa = typeof capas.$inferSelect;

// ============================================================
// BẢNG PCCC (Fire Safety Equipments)
// ============================================================
export const fireEquipments = sqliteTable('fire_equipments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // extinguisher, alarm, hose, pump
  location: text('location').notNull(),
  departmentId: integer('department_id').references(() => departments.id),
  installationDate: text('installation_date'),
  lastInspectionDate: text('last_inspection_date'),
  nextInspectionDate: text('next_inspection_date'),
  status: text('status').default('active'), // active, inactive, maintenance, expired
  notes: text('notes'),
}, (table) => [
  index('idx_fire_type').on(table.type),
  index('idx_fire_next_insp').on(table.nextInspectionDate),
]);

// ============================================================
// BẢNG HỒ SƠ RÁC THẢI (Waste Records)
// ============================================================
export const wasteRecords = sqliteTable('waste_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  wasteType: text('waste_type').notNull(), // hazardous, industrial, domestic, recyclable
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(), // kg, ton, liter
  generationDate: text('generation_date').notNull(),
  disposalDate: text('disposal_date'),
  disposalMethod: text('disposal_method'),
  contractor: text('contractor'),
  manifestNumber: text('manifest_number'), // Số chứng từ từ nhà thầu
  status: text('status').default('stored'), // stored, disposed
}, (table) => [
  index('idx_waste_type').on(table.wasteType),
  index('idx_waste_status').on(table.status),
]);

// ============================================================
// BẢNG CHỈ SỐ MÔI TRƯỜNG (Environmental Metrics)
// ============================================================
export const environmentalMetrics = sqliteTable('environmental_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  metricName: text('metric_name').notNull(), // wastewater_ph, dust, noise, cod, bod
  value: real('value').notNull(),
  unit: text('unit').notNull(), // mg/l, dBA, ug/m3
  location: text('location'),
  measureDate: text('measure_date').notNull(),
  legalLimit: real('legal_limit'), // Giới hạn cho phép theo quy chuẩn
  status: text('status').notNull(), // pass, fail
  notes: text('notes'),
}, (table) => [
  index('idx_env_metric').on(table.metricName),
  index('idx_env_date').on(table.measureDate),
]);

// ============================================================
// BẢNG ĐÁNH GIÁ RỦI RO (Risk Assessments)
// ============================================================
export const riskAssessments = sqliteTable('risk_assessments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // RA-2023-001
  activity: text('activity').notNull(), // Công việc được đánh giá
  location: text('location'),
  departmentId: integer('department_id').references(() => departments.id),
  hazard: text('hazard').notNull(), // Mối nguy
  consequence: text('consequence'), // Hậu quả
  severity: integer('severity').notNull(), // 1 to 5
  likelihood: integer('likelihood').notNull(), // 1 to 5
  riskScore: integer('risk_score').notNull(), // severity * likelihood
  riskLevel: text('risk_level').notNull(), // low, medium, high, extreme
  controlMeasures: text('control_measures').notNull(), // Biện pháp kiểm soát
  residualSeverity: integer('residual_severity'),
  residualLikelihood: integer('residual_likelihood'),
  residualRiskScore: integer('residual_risk_score'),
  residualRiskLevel: text('residual_risk_level'),
  assessorId: integer('assessor_id').references(() => users.id),
  assessmentDate: text('assessment_date').notNull(),
  nextReviewDate: text('next_review_date'),
  status: text('status').default('active'), // draft, active, archived
}, (table) => [
  index('idx_risk_level').on(table.riskLevel),
  index('idx_risk_dept').on(table.departmentId),
]);

// ============================================================
// BẢNG GIẤY PHÉP LÀM VIỆC (Permits to Work)
// ============================================================
export const permitsToWork = sqliteTable('permits_to_work', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // PTW-2023-001
  permitType: text('permit_type').notNull(), // hot_work, confined_space, height, electrical
  description: text('description').notNull(),
  location: text('location').notNull(),
  applicantId: integer('applicant_id').notNull().references(() => users.id),
  contractorName: text('contractor_name'), // Nếu làm bởi nhà thầu ngoài
  approverId: integer('approver_id').references(() => users.id),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  status: text('status').default('pending'), // pending, approved, active, closed, cancelled
  isolationRequired: integer('isolation_required', { mode: 'boolean' }).default(false), // LOTO requirement
  gasTestingRequired: integer('gas_testing_required', { mode: 'boolean' }).default(false),
  gasTestResults: text('gas_test_results'),
  closeoutNotes: text('closeout_notes'),
  closedAt: text('closed_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_ptw_status').on(table.status),
  index('idx_ptw_type').on(table.permitType),
  index('idx_ptw_dates').on(table.startTime),
]);

export type FireEquipment = typeof fireEquipments.$inferSelect;
export type WasteRecord = typeof wasteRecords.$inferSelect;
export type EnvironmentalMetric = typeof environmentalMetrics.$inferSelect;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type PermitToWork = typeof permitsToWork.$inferSelect;

// ============================================================
// BẢNG ĐỢT QUAN TRẮC MÔI TRƯỜNG LAO ĐỘNG (Monitoring Campaigns)
// ============================================================
export const monitoringCampaigns = sqliteTable('monitoring_campaigns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // QT-2023-01
  name: text('name').notNull(),
  year: integer('year').notNull(),
  monitoringDate: text('monitoring_date').notNull(),
  contractor: text('contractor'), // Đơn vị thực hiện
  documentUrl: text('document_url'), // Link báo cáo
  status: text('status').default('planned'), // planned, in_progress, completed
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_mon_camp_year').on(table.year),
]);

// ============================================================
// BẢNG KẾT QUẢ QUAN TRẮC MÔI TRƯỜNG LAO ĐỘNG (Monitoring Results)
// ============================================================
export const monitoringResults = sqliteTable('monitoring_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  campaignId: integer('campaign_id').notNull().references(() => monitoringCampaigns.id, { onDelete: 'cascade' }),
  location: text('location').notNull(), // Vị trí đo
  factorGroup: text('factor_group').notNull(), // Vi khí hậu, Bụi, Ánh sáng, Tiếng ồn, Khí độc, Tâm sinh lý...
  factorName: text('factor_name').notNull(), // Nhiệt độ, Độ ẩm, Bụi toàn phần...
  resultValue: real('result_value').notNull(),
  limitValue: real('limit_value'), // Tiêu chuẩn cho phép
  unit: text('unit').notNull(), // mg/m3, dBA, Lux...
  status: text('status').notNull(), // pass, fail
  notes: text('notes'),
}, (table) => [
  index('idx_mon_res_camp').on(table.campaignId),
  index('idx_mon_res_group').on(table.factorGroup),
]);

export type MonitoringCampaign = typeof monitoringCampaigns.$inferSelect;
export type MonitoringResult = typeof monitoringResults.$inferSelect;

// ============================================================
// BẢNG XE & PHƯƠNG TIỆN (Vehicles)
// ============================================================
export const vehicles = sqliteTable('vehicles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  plateNumber: text('plate_number').notNull().unique(),
  vehicleType: text('vehicle_type').notNull(),
  brand: text('brand'),
  chassisNumber: text('chassis_number'),
  engineNumber: text('engine_number'),
  registrationExpiry: text('registration_expiry'), // Hạn đăng kiểm
  inspectionExpiry: text('inspection_expiry'), // Hạn kiểm định an toàn
  
  compulsoryInsuranceProvider: text('compulsory_insurance_provider'), // Cty cấp BH Bắt buộc
  compulsoryInsuranceExpiry: text('compulsory_insurance_expiry'), // Hạn bảo hiểm bắt buộc
  
  civilLiabilityInsuranceProvider: text('civil_liability_insurance_provider'), // Cty cấp BH Dân sự
  civilLiabilityInsuranceExpiry: text('civil_liability_insurance_expiry'), // Hạn bảo hiểm trách nhiệm dân sự
  
  voluntaryInsuranceProvider: text('voluntary_insurance_provider'), // Cty cấp BH Tự nguyện
  voluntaryInsuranceExpiry: text('voluntary_insurance_expiry'), // Hạn bảo hiểm tự nguyện
  
  status: text('status').notNull(), // active, maintenance, inactive
});

// ============================================================
// BẢNG VĂN BẢN PHÁP LUẬT (Legal Documents)
// ============================================================
export const legalDocuments = sqliteTable('legal_documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  documentNumber: text('document_number').notNull().unique(), // Số hiệu văn bản
  title: text('title').notNull(),
  documentType: text('document_type').notNull(), // Nghị định, Thông tư...
  issueDate: text('issue_date').notNull(),
  effectiveDate: text('effective_date'),
  issuingAgency: text('issuing_agency'), // Cơ quan ban hành
  status: text('status').notNull(), // active, expired
  fileUrl: text('file_url'),
});

// ============================================================
// BẢNG KHO TÀI LIỆU HSE (HSE Documents)
// ============================================================
export const hseDocuments = sqliteTable('hse_documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  category: text('category').notNull(), // Quy trình, Hướng dẫn, Biểu mẫu
  version: text('version'),
  uploadDate: text('upload_date').default(sql`CURRENT_TIMESTAMP`),
  author: text('author'),
  fileUrl: text('file_url'),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type LegalDocument = typeof legalDocuments.$inferSelect;
export type HseDocument = typeof hseDocuments.$inferSelect;
