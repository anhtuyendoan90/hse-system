// Employment status options
export const EMPLOYMENT_STATUSES = [
  { value: 'working', label: 'Đang làm việc', color: 'success' },
  { value: 'resigned', label: 'Đã nghỉ việc', color: 'danger' },
  { value: 'suspended', label: 'Tạm nghỉ', color: 'warning' },
  { value: 'maternity_leave', label: 'Nghỉ thai sản', color: 'info' },
] as const;

// Contract types
export const CONTRACT_TYPES = [
  { value: 'indefinite', label: 'HĐLĐ không xác định thời hạn' },
  { value: 'definite', label: 'HĐLĐ xác định thời hạn' },
  { value: 'seasonal', label: 'HĐLĐ thời vụ' },
  { value: 'probation', label: 'Thử việc' },
  { value: 'contractor', label: 'Nhà thầu' },
  { value: 'other', label: 'Khác' },
] as const;

// Training groups per NĐ 44/2016/NĐ-CP
export const TRAINING_GROUPS = [
  { value: 'Nhóm 1', label: 'Nhóm 1 - Người quản lý', description: 'Người đứng đầu đơn vị, phụ trách ATVSLĐ' },
  { value: 'Nhóm 2', label: 'Nhóm 2 - Cán bộ chuyên trách', description: 'Cán bộ chuyên trách, bán chuyên trách ATVSLĐ' },
  { value: 'Nhóm 3', label: 'Nhóm 3 - Người lao động', description: 'Người lao động làm công việc có yêu cầu nghiêm ngặt' },
  { value: 'Nhóm 4', label: 'Nhóm 4 - Người lao động', description: 'Người lao động không thuộc nhóm 1,2,3,5,6' },
  { value: 'Nhóm 5', label: 'Nhóm 5 - Y tế', description: 'Người làm công tác y tế' },
  { value: 'Nhóm 6', label: 'Nhóm 6 - ATVSV', description: 'An toàn vệ sinh viên' },
] as const;

// Gender options
export const GENDERS = [
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' },
] as const;

// Notification severity
export const NOTIFICATION_SEVERITIES = [
  { value: 'critical', label: 'Khẩn cấp', color: 'danger', icon: '🔴' },
  { value: 'warning', label: 'Quan trọng', color: 'warning', icon: '🟠' },
  { value: 'info', label: 'Thông tin', color: 'info', icon: '🟡' },
  { value: 'success', label: 'Hoàn thành', color: 'success', icon: '🟢' },
] as const;

// Sidebar menu items
export const SIDEBAR_MENU = [
  { group: 'TỔNG QUAN', items: [
    { key: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
  ]},
  { group: 'NHÂN SỰ', items: [
    { key: 'employees', label: 'Quản lý người lao động', icon: '👥', href: '/employees' },
    { key: 'training', label: 'Huấn luyện HSE', icon: '📚', href: '/training' },
    { key: 'certificates', label: 'Chứng chỉ & Giấy phép', icon: '📜', href: '/certificates' },
  ]},
  { group: 'TÀI SẢN', items: [
    { key: 'ppe', label: 'PPE – PTBVCN', icon: '🦺', href: '/ppe' },
    { key: 'equipment', label: 'Máy móc, Thiết bị', icon: '⚙️', href: '/equipment' },
    { key: 'vehicles', label: 'Xe & Phương tiện', icon: '🚛', href: '/vehicles' },
  ]},
  { group: 'SỨC KHỎE', items: [
    { key: 'health', label: 'Khám sức khỏe', icon: '🏥', href: '/health' },
    { key: 'occupational_diseases', label: 'Bệnh nghề nghiệp', icon: '🩺', href: '/occupational-diseases' },
  ]},
  { group: 'AN TOÀN', items: [
    { key: 'incidents', label: 'Sự cố & Tai nạn', icon: '⚠️', href: '/incidents' },
    { key: 'fire_safety', label: 'PCCC', icon: '🧯', href: '/fire-safety' },
    { key: 'inspections', label: 'Kiểm tra HSE', icon: '🔍', href: '/inspections' },
    { key: 'environment', label: 'Môi trường', icon: '🌿', href: '/environment' },
    { key: 'monitoring', label: 'Quan trắc MTLĐ', icon: '🔬', href: '/monitoring' },
    { key: 'permits', label: 'Permit to Work', icon: '📋', href: '/permits' },
    { key: 'capa', label: 'CAPA', icon: '✅', href: '/capa' },
    { key: 'risks', label: 'Quản lý rủi ro', icon: '⚡', href: '/risks' },
  ]},
  { group: 'BÁO CÁO & AI', items: [
    { key: 'legal', label: 'Văn bản pháp luật', icon: '📖', href: '/legal' },
    { key: 'reports', label: 'Báo cáo HSE', icon: '📊', href: '/reports' },
    { key: 'ai_assistant', label: 'AI HSE Assistant', icon: '🤖', href: '/ai-assistant' },
    { key: 'documents', label: 'Kho tài liệu HSE', icon: '📁', href: '/documents' },
  ]},
  { group: 'HỆ THỐNG', items: [
    { key: 'notifications', label: 'Thông báo', icon: '🔔', href: '/notifications' },
    { key: 'settings', label: 'Cài đặt hệ thống', icon: '⚙️', href: '/settings' },
  ]},
] as const;

// Modules list for permissions
export const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'employees', label: 'Quản lý người lao động' },
  { key: 'training', label: 'Huấn luyện HSE' },
  { key: 'certificates', label: 'Chứng chỉ & Giấy phép' },
  { key: 'ppe', label: 'PPE – PTBVCN' },
  { key: 'equipment', label: 'Máy móc, Thiết bị' },
  { key: 'vehicles', label: 'Xe & Phương tiện' },
  { key: 'health', label: 'Khám sức khỏe' },
  { key: 'occupational_diseases', label: 'Bệnh nghề nghiệp' },
  { key: 'incidents', label: 'Sự cố & Tai nạn' },
  { key: 'inspections', label: 'Kiểm tra HSE' },
  { key: 'capa', label: 'CAPA' },
  { key: 'fire_safety', label: 'PCCC' },
  { key: 'environment', label: 'Môi trường' },
  { key: 'permits', label: 'Permit to Work' },
  { key: 'risks', label: 'Quản lý rủi ro' },
  { key: 'legal', label: 'Văn bản pháp luật' },
  { key: 'documents', label: 'Kho tài liệu' },
  { key: 'reports', label: 'Báo cáo HSE' },
  { key: 'ai_assistant', label: 'AI HSE Assistant' },
  { key: 'settings', label: 'Cài đặt hệ thống' },
  { key: 'users', label: 'Quản lý người dùng' },
  { key: 'audit_log', label: 'Nhật ký kiểm toán' },
] as const;
