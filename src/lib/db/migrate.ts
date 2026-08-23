/**
 * HSE Management System - Database Migration & Initialization
 * Khởi tạo cơ sở dữ liệu: tạo bảng, seed dữ liệu mặc định
 * 
 * Script này an toàn khi chạy nhiều lần (idempotent)
 */

import { db, sqlite } from './index';
import { 
  roles, permissions, rolePermissions, users, departments, employees,
  systemSettings, alertConfigs, trainingCourses, ppeItems, equipments,
  healthRecords, incidents, incidentVictims, inspections, capas,
  fireEquipments, wasteRecords, environmentalMetrics, riskAssessments, permitsToWork,
  monitoringCampaigns, monitoringResults,
  certificates, vehicles, occupationalDiseases, legalDocuments, hseDocuments
} from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// ============================================================
// TẠO BẢNG (DDL)
// ============================================================
const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_system INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_perm_module_action ON permissions(module, action);

  CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_role_perm ON role_permissions(role_id, permission_id);

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_active INTEGER DEFAULT 1,
    avatar TEXT,
    last_login TEXT,
    must_change_password INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
  CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    parent_id INTEGER,
    location TEXT,
    manager_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    date_of_birth TEXT,
    gender TEXT,
    id_card TEXT,
    department_id INTEGER REFERENCES departments(id),
    position TEXT,
    job_title TEXT,
    hire_date TEXT,
    contract_type TEXT,
    manager_id INTEGER,
    work_area TEXT,
    has_hazardous_work INTEGER DEFAULT 0,
    training_group TEXT,
    employment_status TEXT DEFAULT 'working',
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    notes TEXT,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_emp_dept ON employees(department_id);
  CREATE INDEX IF NOT EXISTS idx_emp_status ON employees(employment_status);
  CREATE INDEX IF NOT EXISTS idx_emp_deleted ON employees(is_deleted);
  CREATE INDEX IF NOT EXISTS idx_emp_name ON employees(full_name);
  CREATE INDEX IF NOT EXISTS idx_emp_code ON employees(employee_code);

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    module TEXT,
    reference_id INTEGER,
    reference_type TEXT,
    user_id INTEGER REFERENCES users(id),
    is_read INTEGER DEFAULT 0,
    read_at TEXT,
    expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications(is_read);
  CREATE INDEX IF NOT EXISTS idx_notif_type ON notifications(type);

  CREATE TABLE IF NOT EXISTS alert_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    days_before INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    notify_roles TEXT,
    send_email INTEGER DEFAULT 0,
    send_in_app INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_alert_module ON alert_configs(module);

  CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    category TEXT NOT NULL,
    description TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    username TEXT,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs(module);
  CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
  CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_logs(created_at);

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_session_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_session_token ON sessions(token);
  CREATE INDEX IF NOT EXISTS idx_session_expires ON sessions(expires_at);

  CREATE TABLE IF NOT EXISTS training_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    training_group TEXT NOT NULL,
    duration_hours INTEGER,
    provider TEXT,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS training_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES training_courses(id),
    completion_date TEXT NOT NULL,
    expiry_date TEXT,
    status TEXT DEFAULT 'valid',
    certificate_number TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_training_emp ON training_records(employee_id);
  CREATE INDEX IF NOT EXISTS idx_training_expiry ON training_records(expiry_date);

  CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    issue_date TEXT,
    expiry_date TEXT,
    issuer TEXT,
    document_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_cert_emp ON certificates(employee_id);
  CREATE INDEX IF NOT EXISTS idx_cert_expiry ON certificates(expiry_date);

  CREATE TABLE IF NOT EXISTS ppe_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT DEFAULT 'Cái',
    stock_quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 10,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ppe_issuances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    ppe_id INTEGER NOT NULL REFERENCES ppe_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    issue_date TEXT NOT NULL,
    next_issue_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_ppe_iss_emp ON ppe_issuances(employee_id);
  CREATE INDEX IF NOT EXISTS idx_ppe_iss_next ON ppe_issuances(next_issue_date);

  CREATE TABLE IF NOT EXISTS equipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    location TEXT,
    status TEXT DEFAULT 'active',
    last_inspection_date TEXT,
    next_inspection_date TEXT,
    department_id INTEGER REFERENCES departments(id),
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_equip_next_insp ON equipments(next_inspection_date);
  CREATE INDEX IF NOT EXISTS idx_equip_status ON equipments(status);

  CREATE TABLE IF NOT EXISTS health_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    check_date TEXT NOT NULL,
    next_check_date TEXT,
    health_type TEXT,
    blood_pressure TEXT,
    heart_rate INTEGER,
    vision TEXT,
    hearing TEXT,
    doctor TEXT,
    hospital TEXT,
    note TEXT,
    document_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_health_emp ON health_records(employee_id);
  CREATE INDEX IF NOT EXISTS idx_health_next ON health_records(next_check_date);

  CREATE TABLE IF NOT EXISTS occupational_diseases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    disease_name TEXT NOT NULL,
    diagnosis_date TEXT NOT NULL,
    treatment_facility TEXT,
    status TEXT DEFAULT 'active',
    notes TEXT,
    document_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_disease_emp ON occupational_diseases(employee_id);

  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    incident_date TEXT NOT NULL,
    location TEXT,
    department_id INTEGER REFERENCES departments(id),
    severity TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    reported_by INTEGER REFERENCES users(id),
    investigator_id INTEGER REFERENCES users(id),
    root_cause TEXT,
    immediate_action TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_incident_date ON incidents(incident_date);
  CREATE INDEX IF NOT EXISTS idx_incident_severity ON incidents(severity);
  CREATE INDEX IF NOT EXISTS idx_incident_status ON incidents(status);

  CREATE TABLE IF NOT EXISTS incident_victims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    injury_type TEXT,
    days_lost INTEGER DEFAULT 0,
    medical_cost INTEGER DEFAULT 0,
    notes TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_victim_inc ON incident_victims(incident_id);
  CREATE INDEX IF NOT EXISTS idx_victim_emp ON incident_victims(employee_id);

  CREATE TABLE IF NOT EXISTS inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    inspection_date TEXT NOT NULL,
    location TEXT,
    department_id INTEGER REFERENCES departments(id),
    inspector_name TEXT,
    inspector_id INTEGER REFERENCES users(id),
    status TEXT DEFAULT 'planned',
    score INTEGER,
    findings TEXT,
    document_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_insp_date ON inspections(inspection_date);

  CREATE TABLE IF NOT EXISTS capas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source_type TEXT,
    source_id INTEGER,
    action_type TEXT NOT NULL,
    root_cause TEXT,
    action_plan TEXT NOT NULL,
    assignee_id INTEGER REFERENCES users(id),
    department_id INTEGER REFERENCES departments(id),
    deadline TEXT NOT NULL,
    completion_date TEXT,
    status TEXT DEFAULT 'open',
    verifier_id INTEGER REFERENCES users(id),
    verify_date TEXT,
    verify_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
  );
  CREATE INDEX IF NOT EXISTS idx_capa_status ON capas(status);
  CREATE INDEX IF NOT EXISTS idx_capa_deadline ON capas(deadline);
  CREATE INDEX IF NOT EXISTS idx_capa_assignee ON capas(assignee_id);

  CREATE TABLE IF NOT EXISTS fire_equipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    installation_date TEXT,
    last_inspection_date TEXT,
    next_inspection_date TEXT,
    status TEXT DEFAULT 'active',
    notes TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_fire_type ON fire_equipments(type);
  CREATE INDEX IF NOT EXISTS idx_fire_next_insp ON fire_equipments(next_inspection_date);

  CREATE TABLE IF NOT EXISTS waste_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waste_type TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    generation_date TEXT NOT NULL,
    disposal_date TEXT,
    disposal_method TEXT,
    contractor TEXT,
    manifest_number TEXT,
    status TEXT DEFAULT 'stored'
  );
  CREATE INDEX IF NOT EXISTS idx_waste_type ON waste_records(waste_type);
  CREATE INDEX IF NOT EXISTS idx_waste_status ON waste_records(status);

  CREATE TABLE IF NOT EXISTS environmental_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    location TEXT,
    measure_date TEXT NOT NULL,
    legal_limit REAL,
    status TEXT NOT NULL,
    notes TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_env_metric ON environmental_metrics(metric_name);
  CREATE INDEX IF NOT EXISTS idx_env_date ON environmental_metrics(measure_date);

  CREATE TABLE IF NOT EXISTS risk_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    activity TEXT NOT NULL,
    location TEXT,
    department_id INTEGER REFERENCES departments(id),
    hazard TEXT NOT NULL,
    consequence TEXT,
    severity INTEGER NOT NULL,
    likelihood INTEGER NOT NULL,
    risk_score INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    control_measures TEXT NOT NULL,
    residual_severity INTEGER,
    residual_likelihood INTEGER,
    residual_risk_score INTEGER,
    residual_risk_level TEXT,
    assessor_id INTEGER REFERENCES users(id),
    assessment_date TEXT NOT NULL,
    next_review_date TEXT,
    status TEXT DEFAULT 'active'
  );
  CREATE INDEX IF NOT EXISTS idx_risk_level ON risk_assessments(risk_level);
  CREATE INDEX IF NOT EXISTS idx_risk_dept ON risk_assessments(department_id);

  CREATE TABLE IF NOT EXISTS permits_to_work (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    permit_type TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    applicant_id INTEGER NOT NULL REFERENCES users(id),
    contractor_name TEXT,
    approver_id INTEGER REFERENCES users(id),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    isolation_required BOOLEAN DEFAULT 0,
    gas_testing_required BOOLEAN DEFAULT 0,
    gas_test_results TEXT,
    closeout_notes TEXT,
    closed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_ptw_status ON permits_to_work(status);
  CREATE INDEX IF NOT EXISTS idx_ptw_type ON permits_to_work(permit_type);
  CREATE INDEX IF NOT EXISTS idx_ptw_dates ON permits_to_work(start_time);

  CREATE TABLE IF NOT EXISTS monitoring_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    monitoring_date TEXT NOT NULL,
    contractor TEXT,
    document_url TEXT,
    status TEXT DEFAULT 'planned',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_mon_camp_year ON monitoring_campaigns(year);

  CREATE TABLE IF NOT EXISTS monitoring_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL REFERENCES monitoring_campaigns(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    factor_group TEXT NOT NULL,
    factor_name TEXT NOT NULL,
    result_value REAL NOT NULL,
    limit_value REAL,
    unit TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_mon_res_camp ON monitoring_results(campaign_id);
  CREATE INDEX IF NOT EXISTS idx_mon_res_group ON monitoring_results(factor_group);
  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plate_number TEXT NOT NULL UNIQUE,
    vehicle_type TEXT NOT NULL,
    brand TEXT,
    chassis_number TEXT,
    engine_number TEXT,
    registration_expiry TEXT,
    inspection_expiry TEXT,
    compulsory_insurance_provider TEXT,
    compulsory_insurance_expiry TEXT,
    civil_liability_insurance_provider TEXT,
    civil_liability_insurance_expiry TEXT,
    voluntary_insurance_provider TEXT,
    voluntary_insurance_expiry TEXT,
    status TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS legal_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    effective_date TEXT,
    issuing_agency TEXT,
    status TEXT NOT NULL,
    file_url TEXT
  );

  CREATE TABLE IF NOT EXISTS hse_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    version TEXT,
    upload_date TEXT DEFAULT CURRENT_TIMESTAMP,
    author TEXT,
    file_url TEXT
  );
`;

// ============================================================
// DỮ LIỆU MẶC ĐỊNH
// ============================================================

// Danh sách vai trò mặc định
const defaultRoles = [
  { code: 'super_admin', name: 'Super Admin', description: 'Toàn quyền hệ thống', isSystem: true },
  { code: 'hse_manager', name: 'HSE Manager', description: 'Quản lý toàn bộ HSE', isSystem: true },
  { code: 'hse_officer', name: 'HSE Officer', description: 'Nhập liệu, kiểm tra, xử lý hồ sơ HSE', isSystem: true },
  { code: 'hr', name: 'HR', description: 'Quản lý nhân sự và sức khỏe', isSystem: true },
  { code: 'maintenance', name: 'Maintenance', description: 'Quản lý máy móc thiết bị', isSystem: true },
  { code: 'warehouse', name: 'Warehouse', description: 'Quản lý PPE và kho', isSystem: true },
  { code: 'fleet', name: 'Fleet', description: 'Quản lý xe và phương tiện', isSystem: true },
  { code: 'fire_safety', name: 'PCCC', description: 'Quản lý phòng cháy chữa cháy', isSystem: true },
  { code: 'manager', name: 'Manager', description: 'Xem dashboard và phê duyệt', isSystem: true },
  { code: 'employee', name: 'Employee', description: 'Xem thông tin cá nhân', isSystem: true },
];

// Danh sách module
const modules = [
  'dashboard', 'employees', 'training', 'certificates', 'ppe', 'equipment',
  'vehicles', 'health', 'occupational_diseases', 'incidents', 'inspections',
  'capa', 'fire_safety', 'environment', 'permits', 'risks', 'legal',
  'documents', 'reports', 'ai_assistant', 'settings', 'users', 'audit_log',
  'notifications', 'chemicals',
];

// Danh sách hành động
const actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

// Ma trận phân quyền: role_code -> { module: [actions] }
const permissionMatrix: Record<string, Record<string, string[]>> = {
  super_admin: Object.fromEntries(modules.map(m => [m, actions])), // Toàn quyền
  hse_manager: Object.fromEntries(modules.map(m => [m, actions])),
  hse_officer: Object.fromEntries(
    modules.filter(m => !['settings', 'users', 'audit_log'].includes(m))
      .map(m => [m, ['view', 'create', 'edit', 'export']])
  ),
  hr: {
    dashboard: ['view'],
    employees: ['view', 'create', 'edit', 'delete', 'export'],
    training: ['view', 'create', 'edit', 'export'],
    certificates: ['view', 'create', 'edit', 'export'],
    health: ['view', 'create', 'edit', 'export'],
    occupational_diseases: ['view', 'create', 'edit', 'export'],
    reports: ['view', 'export'],
    notifications: ['view'],
  },
  maintenance: {
    dashboard: ['view'],
    equipment: ['view', 'create', 'edit', 'export'],
    vehicles: ['view'],
    inspections: ['view', 'create', 'edit'],
    capa: ['view', 'create', 'edit'],
    notifications: ['view'],
  },
  warehouse: {
    dashboard: ['view'],
    ppe: ['view', 'create', 'edit', 'export'],
    notifications: ['view'],
  },
  fleet: {
    dashboard: ['view'],
    vehicles: ['view', 'create', 'edit', 'export'],
    notifications: ['view'],
  },
  fire_safety: {
    dashboard: ['view'],
    fire_safety: ['view', 'create', 'edit', 'export'],
    training: ['view'],
    inspections: ['view', 'create', 'edit'],
    notifications: ['view'],
  },
  manager: {
    dashboard: ['view', 'export'],
    employees: ['view', 'export'],
    training: ['view', 'approve', 'export'],
    certificates: ['view', 'export'],
    ppe: ['view', 'approve', 'export'],
    equipment: ['view', 'export'],
    vehicles: ['view', 'export'],
    health: ['view', 'export'],
    incidents: ['view', 'approve', 'export'],
    inspections: ['view', 'approve', 'export'],
    capa: ['view', 'approve', 'export'],
    fire_safety: ['view', 'export'],
    reports: ['view', 'export'],
    permits: ['view', 'approve', 'export'],
    notifications: ['view'],
  },
  employee: {
    dashboard: ['view'],
    notifications: ['view'],
  },
};

// Cài đặt hệ thống mặc định
const defaultSettings = [
  { key: 'company_name', value: '', category: 'company', description: 'Tên công ty' },
  { key: 'company_address', value: '', category: 'company', description: 'Địa chỉ công ty' },
  { key: 'company_phone', value: '', category: 'company', description: 'Số điện thoại' },
  { key: 'company_email', value: '', category: 'company', description: 'Email công ty' },
  { key: 'company_tax_code', value: '', category: 'company', description: 'Mã số thuế' },
  { key: 'company_logo', value: '', category: 'company', description: 'Logo công ty' },
  { key: 'company_representative', value: '', category: 'company', description: 'Người đại diện' },
  { key: 'hse_manager_name', value: '', category: 'company', description: 'Cán bộ HSE phụ trách' },
  { key: 'gemini_api_key', value: '', category: 'ai', description: 'Gemini API Key (mã hóa)' },
  { key: 'email_smtp_host', value: '', category: 'email', description: 'SMTP Host' },
  { key: 'email_smtp_port', value: '587', category: 'email', description: 'SMTP Port' },
  { key: 'email_smtp_user', value: '', category: 'email', description: 'SMTP Username' },
  { key: 'email_smtp_password', value: '', category: 'email', description: 'SMTP Password (mã hóa)' },
  { key: 'email_from', value: '', category: 'email', description: 'Email gửi thông báo' },
  { key: 'date_format', value: 'DD/MM/YYYY', category: 'general', description: 'Định dạng ngày' },
  { key: 'language', value: 'vi', category: 'general', description: 'Ngôn ngữ' },
  { key: 'timezone', value: 'Asia/Ho_Chi_Minh', category: 'general', description: 'Múi giờ' },
];

// Cấu hình cảnh báo mặc định
const defaultAlertConfigs = [
  { module: 'training', alertType: 'training_expiry', daysBefore: 90 },
  { module: 'training', alertType: 'training_expiry', daysBefore: 60 },
  { module: 'training', alertType: 'training_expiry', daysBefore: 30 },
  { module: 'training', alertType: 'training_expiry', daysBefore: 15 },
  { module: 'training', alertType: 'training_expiry', daysBefore: 7 },
  { module: 'certificates', alertType: 'certificate_expiry', daysBefore: 90 },
  { module: 'certificates', alertType: 'certificate_expiry', daysBefore: 30 },
  { module: 'equipment', alertType: 'equipment_inspection', daysBefore: 60 },
  { module: 'equipment', alertType: 'equipment_inspection', daysBefore: 30 },
  { module: 'vehicles', alertType: 'registration_expiry', daysBefore: 60 },
  { module: 'vehicles', alertType: 'registration_expiry', daysBefore: 30 },
  { module: 'vehicles', alertType: 'insurance_expiry', daysBefore: 60 },
  { module: 'vehicles', alertType: 'insurance_expiry', daysBefore: 30 },
  { module: 'ppe', alertType: 'ppe_low_stock', daysBefore: 0 },
  { module: 'ppe', alertType: 'ppe_replacement', daysBefore: 30 },
  { module: 'health', alertType: 'health_check_due', daysBefore: 30 },
  { module: 'capa', alertType: 'capa_overdue', daysBefore: 0 },
  { module: 'fire_safety', alertType: 'fire_equipment_due', daysBefore: 30 },
  { module: 'permits', alertType: 'permit_expiry', daysBefore: 1 },
];

// Phòng ban mặc định
const defaultDepartments = [
  { code: 'BGD', name: 'Ban Giám đốc', location: 'Văn phòng chính' },
  { code: 'HSE', name: 'Phòng HSE', location: 'Văn phòng chính' },
  { code: 'HR', name: 'Phòng Nhân sự', location: 'Văn phòng chính' },
  { code: 'SX', name: 'Phòng Sản xuất', location: 'Nhà máy' },
  { code: 'KT', name: 'Phòng Kỹ thuật', location: 'Nhà máy' },
  { code: 'BD', name: 'Phòng Bảo dưỡng', location: 'Nhà máy' },
  { code: 'KHO', name: 'Phòng Kho vận', location: 'Kho' },
  { code: 'QC', name: 'Phòng Kiểm tra chất lượng', location: 'Nhà máy' },
  { code: 'KD', name: 'Phòng Kinh doanh', location: 'Văn phòng chính' },
  { code: 'HC', name: 'Phòng Hành chính', location: 'Văn phòng chính' },
];

// ============================================================
// HÀM KHỞI TẠO DATABASE
// ============================================================
export async function initializeDatabase() {
  console.log('🚀 Bắt đầu khởi tạo cơ sở dữ liệu HSE...');

  // Bước 1: Tạo bảng
  console.log('📋 Tạo bảng dữ liệu...');
  sqlite.exec(createTablesSQL);
  console.log('  ✅ Đã tạo tất cả các bảng');

  // Bước 2: Seed vai trò
  console.log('👤 Khởi tạo vai trò...');
  for (const role of defaultRoles) {
    const existing = db.select().from(roles).where(eq(roles.code, role.code)).get();
    if (!existing) {
      db.insert(roles).values(role).run();
      console.log(`  ✅ Tạo vai trò: ${role.name}`);
    }
  }

  // Bước 3: Seed quyền hạn
  console.log('🔑 Khởi tạo quyền hạn...');
  for (const module of modules) {
    for (const action of actions) {
      const existing = db.select().from(permissions)
        .where(eq(permissions.module, module))
        .all()
        .find(p => p.action === action);
      
      if (!existing) {
        db.insert(permissions).values({
          module,
          action,
          description: `${action} ${module}`,
        }).run();
      }
    }
  }
  console.log(`  ✅ Đã tạo ${modules.length * actions.length} quyền hạn`);

  // Bước 4: Gán quyền cho vai trò
  console.log('🔗 Phân quyền cho các vai trò...');
  const allRoles = db.select().from(roles).all();
  const allPerms = db.select().from(permissions).all();
  
  for (const [roleCode, modulePerms] of Object.entries(permissionMatrix)) {
    const role = allRoles.find(r => r.code === roleCode);
    if (!role) continue;

    for (const [module, actionsArr] of Object.entries(modulePerms)) {
      for (const action of actionsArr) {
        const perm = allPerms.find(p => p.module === module && p.action === action);
        if (!perm) continue;

        const existing = db.select().from(rolePermissions)
          .where(eq(rolePermissions.roleId, role.id))
          .all()
          .find(rp => rp.permissionId === perm.id);

        if (!existing) {
          db.insert(rolePermissions).values({
            roleId: role.id,
            permissionId: perm.id,
          }).run();
        }
      }
    }
  }
  console.log('  ✅ Đã phân quyền cho tất cả vai trò');

  // Bước 5: Tạo tài khoản admin mặc định
  console.log('👨‍💼 Tạo tài khoản admin...');
  const adminExists = db.select().from(users).where(eq(users.username, 'admin')).get();
  if (!adminExists) {
    const adminRole = allRoles.find(r => r.code === 'super_admin');
    const hashedPassword = bcrypt.hashSync('Admin@123456', 12);
    db.insert(users).values({
      username: 'admin',
      email: 'admin@hse-system.local',
      passwordHash: hashedPassword,
      fullName: 'System Administrator',
      roleId: adminRole?.id,
      isActive: true,
      mustChangePassword: true,
    }).run();
    console.log('  ✅ Tạo tài khoản admin (admin / Admin@123456)');
  } else {
    console.log('  ℹ️ Tài khoản admin đã tồn tại');
  }

  // Bước 6: Seed phòng ban
  console.log('🏢 Khởi tạo phòng ban...');
  for (const dept of defaultDepartments) {
    const existing = db.select().from(departments).where(eq(departments.code, dept.code)).get();
    if (!existing) {
      db.insert(departments).values(dept).run();
      console.log(`  ✅ Tạo phòng ban: ${dept.name}`);
    }
  }

  // Bước 7: Seed cài đặt hệ thống
  console.log('⚙️ Khởi tạo cài đặt hệ thống...');
  for (const setting of defaultSettings) {
    const existing = db.select().from(systemSettings).where(eq(systemSettings.key, setting.key)).get();
    if (!existing) {
      db.insert(systemSettings).values(setting).run();
    }
  }
  console.log('  ✅ Đã tạo cài đặt mặc định');

  // Bước 8: Seed cấu hình cảnh báo
  console.log('🔔 Khởi tạo cấu hình cảnh báo...');
  const existingAlerts = db.select().from(alertConfigs).all();
  if (existingAlerts.length === 0) {
    for (const config of defaultAlertConfigs) {
      db.insert(alertConfigs).values({
        ...config,
        isActive: true,
        notifyRoles: JSON.stringify(['super_admin', 'hse_manager', 'hse_officer']),
        sendEmail: false,
        sendInApp: true,
      }).run();
    }
    console.log(`  ✅ Đã tạo ${defaultAlertConfigs.length} cấu hình cảnh báo`);
  }

    // 8. Seed Training Courses
    console.log('📚 Khởi tạo khóa huấn luyện...');
    const courses = [
      { code: 'TR-G1', name: 'Huấn luyện An toàn Nhóm 1', trainingGroup: 'Nhóm 1', durationHours: 16 },
      { code: 'TR-G2', name: 'Huấn luyện An toàn Nhóm 2', trainingGroup: 'Nhóm 2', durationHours: 48 },
      { code: 'TR-G3', name: 'Huấn luyện An toàn Nhóm 3', trainingGroup: 'Nhóm 3', durationHours: 24 },
      { code: 'TR-G4', name: 'Huấn luyện An toàn Nhóm 4', trainingGroup: 'Nhóm 4', durationHours: 16 },
      { code: 'TR-G5', name: 'Huấn luyện An toàn Nhóm 5', trainingGroup: 'Nhóm 5', durationHours: 16 },
      { code: 'TR-G6', name: 'Huấn luyện An toàn Nhóm 6', trainingGroup: 'Nhóm 6', durationHours: 4 },
      { code: 'TR-FA', name: 'Sơ cấp cứu cơ bản', trainingGroup: 'Khác', durationHours: 8 },
      { code: 'TR-FIRE', name: 'Phòng cháy chữa cháy', trainingGroup: 'Khác', durationHours: 8 },
    ];
    for (const course of courses) {
      db.insert(trainingCourses).values(course).onConflictDoNothing().run();
      console.log(`  ✅ Tạo khóa học: ${course.name}`);
    }

    // 9. Seed PPE Items
    console.log('🦺 Khởi tạo danh mục PPE...');
    const ppes = [
      { code: 'PPE-001', name: 'Mũ bảo hộ công nhân', category: 'Đầu', unit: 'Cái', stockQuantity: 150 },
      { code: 'PPE-002', name: 'Mũ bảo hộ kỹ sư', category: 'Đầu', unit: 'Cái', stockQuantity: 50 },
      { code: 'PPE-003', name: 'Kính bảo hộ chống tia UV', category: 'Mắt', unit: 'Cái', stockQuantity: 200 },
      { code: 'PPE-004', name: 'Giày bảo hộ chống đinh', category: 'Chân', unit: 'Đôi', stockQuantity: 100 },
      { code: 'PPE-005', name: 'Găng tay sợi', category: 'Tay', unit: 'Đôi', stockQuantity: 500 },
      { code: 'PPE-006', name: 'Áo phản quang', category: 'Toàn thân', unit: 'Cái', stockQuantity: 300 },
      { code: 'PPE-007', name: 'Khẩu trang lọc bụi N95', category: 'Hô hấp', unit: 'Hộp', stockQuantity: 50 },
    ];
    for (const ppe of ppes) {
      db.insert(ppeItems).values(ppe).onConflictDoNothing().run();
      console.log(`  ✅ Tạo PPE: ${ppe.name}`);
    }

    // 10. Seed Equipment
    console.log('⚙️ Khởi tạo danh mục thiết bị...');
    const eqs = [
      { code: 'EQ-001', name: 'Cầu trục phân xưởng 1', category: 'Thiết bị nâng', location: 'Phân xưởng 1', status: 'active' },
      { code: 'EQ-002', name: 'Xe nâng hàng 3 tấn', category: 'Thiết bị nâng', location: 'Kho vận', status: 'active' },
      { code: 'EQ-003', name: 'Nồi hơi số 1', category: 'Thiết bị áp lực', location: 'Phân xưởng 2', status: 'maintenance' },
      { code: 'EQ-004', name: 'Máy nén khí trung tâm', category: 'Thiết bị áp lực', location: 'Trạm khí nén', status: 'active' },
    ];
    for (const eq of eqs) {
      db.insert(equipments).values(eq).onConflictDoNothing().run();
      console.log(`  ✅ Tạo thiết bị: ${eq.name}`);
    }

    // 11. Seed Health & Safety Incidents
    console.log('⚠️ Khởi tạo sự cố và kiểm tra an toàn...');
    const incs = [
      { code: 'IN-2023-001', title: 'Trượt ngã tại xưởng 1', description: 'Nhân viên trượt ngã do rò rỉ dầu', incidentDate: new Date().toISOString(), severity: 'minor', status: 'investigating' },
      { code: 'IN-2023-002', title: 'Sự cố chập điện', description: 'Chập điện tại tủ điện chính', incidentDate: new Date().toISOString(), severity: 'major', status: 'open' },
    ];
    for (const inc of incs) {
      db.insert(incidents).values(inc).onConflictDoNothing().run();
      console.log(`  ✅ Tạo sự cố: ${inc.code}`);
    }

    const insps = [
      { code: 'CHK-2023-001', title: 'Kiểm tra PCCC định kỳ', inspectionDate: new Date().toISOString(), location: 'Toàn nhà máy', status: 'planned' },
    ];
    for (const insp of insps) {
      db.insert(inspections).values(insp).onConflictDoNothing().run();
      console.log(`  ✅ Tạo lượt kiểm tra: ${insp.code}`);
    }

    const cps = [
      { code: 'CAPA-2023-001', title: 'Sửa chữa rò rỉ dầu', description: 'Thay gioăng phớt máy ép', actionType: 'corrective', actionPlan: 'Mua gioăng mới và thay thế', deadline: new Date().toISOString(), status: 'open' },
    ];
    for (const cp of cps) {
      db.insert(capas).values(cp).onConflictDoNothing().run();
      console.log(`  ✅ Tạo CAPA: ${cp.code}`);
    }

    // 12. Seed Phase 4 Data
    console.log('🧯 Khởi tạo PCCC, Môi trường, PTW, Risk...');
    const fires = [
      { code: 'FE-001', name: 'Bình bột ABC 4kg', type: 'extinguisher', location: 'Cửa kho 1', status: 'active' },
      { code: 'FE-002', name: 'Bình CO2 3kg', type: 'extinguisher', location: 'Phòng Server', status: 'active' },
    ];
    for (const fe of fires) {
      db.insert(fireEquipments).values(fe).onConflictDoNothing().run();
      console.log(`  ✅ Tạo thiết bị PCCC: ${fe.code}`);
    }

    const wastes = [
      { wasteType: 'hazardous', quantity: 150.5, unit: 'kg', generationDate: new Date().toISOString(), status: 'stored' },
    ];
    for (const w of wastes) {
      db.insert(wasteRecords).values(w).run();
      console.log(`  ✅ Tạo bản ghi rác thải`);
    }

    const envs = [
      { metricName: 'noise', value: 82.5, unit: 'dBA', measureDate: new Date().toISOString(), legalLimit: 85, status: 'pass' },
    ];
    for (const env of envs) {
      db.insert(environmentalMetrics).values(env).run();
      console.log(`  ✅ Tạo chỉ số môi trường`);
    }

    const ras = [
      { code: 'RA-2023-001', activity: 'Hàn cắt kim loại', hazard: 'Cháy nổ, bỏng', severity: 4, likelihood: 3, riskScore: 12, riskLevel: 'high', controlMeasures: 'Sử dụng màn chắn tia lửa, dọn dẹp vật liệu dễ cháy', assessmentDate: new Date().toISOString(), status: 'active' },
    ];
    for (const ra of ras) {
      db.insert(riskAssessments).values(ra).onConflictDoNothing().run();
      console.log(`  ✅ Tạo đánh giá rủi ro: ${ra.code}`);
    }

    // Default admin id is 1
    const ptws = [
      { code: 'PTW-2023-001', permitType: 'hot_work', description: 'Hàn ống nước tản nhiệt', location: 'Mái xưởng 1', applicantId: 1, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), status: 'pending' },
    ];
    for (const ptw of ptws) {
      db.insert(permitsToWork).values(ptw).onConflictDoNothing().run();
      console.log(`  ✅ Tạo Permit to Work: ${ptw.code}`);
    }

    // 13. Seed Monitoring Data
    console.log('🔬 Khởi tạo dữ liệu Quan trắc môi trường lao động...');
    
    // Tạo 1 đợt quan trắc
    const campResult = db.insert(monitoringCampaigns).values({
      code: 'QT-2023-01',
      name: 'Quan trắc MTLĐ định kỳ 2023',
      year: 2023,
      monitoringDate: new Date('2023-10-15').toISOString(),
      contractor: 'Viện Sức khỏe Nghề nghiệp',
      status: 'completed'
    }).returning({ id: monitoringCampaigns.id }).get();
    
    const campId = campResult.id;
    console.log(`  ✅ Tạo đợt quan trắc: QT-2023-01 (ID: ${campId})`);

    const monResults = [
      // Vi khí hậu
      { campaignId: campId, location: 'Xưởng Sản Xuất 1', factorGroup: 'Vi khí hậu', factorName: 'Nhiệt độ', resultValue: 33.5, limitValue: 32, unit: '°C', status: 'fail' },
      { campaignId: campId, location: 'Xưởng Sản Xuất 1', factorGroup: 'Vi khí hậu', factorName: 'Độ ẩm', resultValue: 75, limitValue: 80, unit: '%', status: 'pass' },
      { campaignId: campId, location: 'Xưởng Sản Xuất 1', factorGroup: 'Vi khí hậu', factorName: 'Tốc độ gió', resultValue: 0.5, limitValue: 1.5, unit: 'm/s', status: 'pass' },
      { campaignId: campId, location: 'Xưởng Cơ Khí', factorGroup: 'Vi khí hậu', factorName: 'Bức xạ nhiệt', resultValue: 1.2, limitValue: 1.0, unit: 'cal/cm2.phút', status: 'fail' },
      
      // Ánh sáng & Tiếng ồn
      { campaignId: campId, location: 'Xưởng Lắp Ráp', factorGroup: 'Ánh sáng', factorName: 'Độ rọi', resultValue: 450, limitValue: 300, unit: 'Lux', status: 'pass' },
      { campaignId: campId, location: 'Xưởng Đột Dập', factorGroup: 'Tiếng ồn chung', factorName: 'Tiếng ồn', resultValue: 88, limitValue: 85, unit: 'dBA', status: 'fail' },
      
      // Bụi
      { campaignId: campId, location: 'Xưởng Gỗ', factorGroup: 'Bụi', factorName: 'Bụi toàn phần', resultValue: 8.5, limitValue: 10, unit: 'mg/m3', status: 'pass' },
      { campaignId: campId, location: 'Xưởng Hàn', factorGroup: 'Bụi', factorName: 'Bụi hô hấp', resultValue: 3.2, limitValue: 5, unit: 'mg/m3', status: 'pass' },
      
      // Khí độc
      { campaignId: campId, location: 'Khu vực Lò nung', factorGroup: 'Khí độc', factorName: 'CO', resultValue: 15, limitValue: 20, unit: 'mg/m3', status: 'pass' },
      { campaignId: campId, location: 'Khu vực Lò nung', factorGroup: 'Khí độc', factorName: 'CO2', resultValue: 1500, limitValue: 9000, unit: 'mg/m3', status: 'pass' },
      { campaignId: campId, location: 'Khu vực Hàn', factorGroup: 'Khí độc', factorName: 'NO2', resultValue: 1.5, limitValue: 5, unit: 'mg/m3', status: 'pass' },
      { campaignId: campId, location: 'Khu vực Xử lý nước', factorGroup: 'Khí độc', factorName: 'Cl', resultValue: 2.1, limitValue: 1, unit: 'mg/m3', status: 'fail' },
      { campaignId: campId, location: 'Khu vực Bể phốt', factorGroup: 'Khí độc', factorName: 'H2S', resultValue: 5, limitValue: 10, unit: 'mg/m3', status: 'pass' },
      { campaignId: campId, location: 'Khu vực Bể phốt', factorGroup: 'Khí độc', factorName: 'NH3', resultValue: 10, limitValue: 17, unit: 'mg/m3', status: 'pass' },

      // Tâm sinh lý
      { campaignId: campId, location: 'Dây chuyền Đóng gói', factorGroup: 'Tâm sinh lý', factorName: 'Đánh giá gánh nặng lao động', resultValue: 2, limitValue: 3, unit: 'Mức độ', status: 'pass', notes: 'Mức trung bình' },
      { campaignId: campId, location: 'Phòng KCS', factorGroup: 'Tâm sinh lý', factorName: 'Ergonomi', resultValue: 4, limitValue: 3, unit: 'Mức độ rủi ro', status: 'fail', notes: 'Tư thế ngồi không đúng, cần trang bị ghế chuẩn Ergonomic' },
    ];
    
    for (const res of monResults) {
      db.insert(monitoringResults).values(res).run();
    }
    console.log(`  ✅ Đã tạo ${monResults.length} kết quả đo đạc`);

    // 14. Seed Phase 6 Data
    console.log('🚀 Khởi tạo dữ liệu Giai đoạn 6...');
    
    const admin = db.select().from(users).where(eq(users.username, 'admin')).get() || { id: 1 };
    
    // Tạo nhân viên mẫu để thoả mãn Foreign Key constraint
    const empResult = db.insert(employees).values({
      employeeCode: 'NV-2023-001',
      fullName: 'Nguyễn Văn A',
      departmentId: 2, // Phòng HSE
      hireDate: '2020-01-01',
      employmentStatus: 'working',
    }).returning({ id: employees.id }).get();
    
    db.insert(certificates).values({ employeeId: empResult.id, name: 'Huấn luyện An toàn Nhóm 1', type: 'ATVSLĐ', issueDate: '2023-01-10', expiryDate: '2025-01-10', issuer: 'Cục An Toàn' }).run();
    
    db.insert(vehicles).values({ 
      plateNumber: '29H-12345', 
      vehicleType: 'Xe tải 5 tấn', 
      brand: 'Hino', 
      chassisNumber: '123456789X', 
      engineNumber: 'ENG-987654', 
      registrationExpiry: '2024-12-30', 
      inspectionExpiry: '2024-12-30',
      compulsoryInsuranceProvider: 'Bảo Việt',
      compulsoryInsuranceExpiry: '2024-12-30', 
      civilLiabilityInsuranceProvider: 'PVI',
      civilLiabilityInsuranceExpiry: '2024-12-30', 
      voluntaryInsuranceProvider: 'MIC',
      voluntaryInsuranceExpiry: '2024-12-30', 
      status: 'active' 
    }).run();
    
    db.insert(occupationalDiseases).values({ employeeId: empResult.id, diseaseName: 'Điếc nghề nghiệp', diagnosisDate: '2022-05-15', treatmentFacility: 'BV Bạch Mai', status: 'active', notes: 'Trang bị nút bịt tai' }).run();
    
    db.insert(legalDocuments).values([
      { documentNumber: '44/2016/NĐ-CP', title: 'Quy định chi tiết một số điều của Luật ATVSLĐ', documentType: 'Nghị định', issueDate: '2016-05-15', effectiveDate: '2016-07-01', issuingAgency: 'Chính phủ', status: 'active' },
      { documentNumber: '84/2015/NĐ-CP', title: 'Luật An toàn, vệ sinh lao động', documentType: 'Luật', issueDate: '2015-06-25', effectiveDate: '2016-07-01', issuingAgency: 'Quốc hội', status: 'active' }
    ]).run();

    db.insert(hseDocuments).values([
      { title: 'Quy trình Ứng phó Khẩn cấp', category: 'Quy trình', version: 'v1.0', author: 'Phòng HSE' },
      { title: 'Hướng dẫn LOTO', category: 'Hướng dẫn', version: 'v2.1', author: 'Phòng Kỹ thuật' }
    ]).run();

  console.log('\n✨ Khởi tạo cơ sở dữ liệu hoàn tất!');
  console.log('📌 Tài khoản đăng nhập mặc định:');
  console.log('   Username: admin');
  console.log('   Password: Admin@123456');
  console.log('   ⚠️ Vui lòng đổi mật khẩu sau lần đăng nhập đầu tiên.\n');
}
