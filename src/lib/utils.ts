// Format date to Vietnamese format
export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return date;
  }
}

// Format datetime
export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—';
  try {
    const d = new Date(date);
    return d.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return date;
  }
}

// Calculate days until a date
export function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  try {
    const target = new Date(date);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

// Get status color based on days remaining
export function getExpiryStatus(daysRemaining: number | null): 'success' | 'warning' | 'danger' | 'secondary' {
  if (daysRemaining === null) return 'secondary';
  if (daysRemaining <= 0) return 'danger';
  if (daysRemaining <= 30) return 'warning';
  return 'success';
}

// Get Vietnamese expiry text
export function getExpiryText(daysRemaining: number | null): string {
  if (daysRemaining === null) return 'Không xác định';
  if (daysRemaining < 0) return `Quá hạn ${Math.abs(daysRemaining)} ngày`;
  if (daysRemaining === 0) return 'Hết hạn hôm nay';
  if (daysRemaining <= 30) return `Còn ${daysRemaining} ngày`;
  return `Còn ${daysRemaining} ngày`;
}

// Generate employee code
export function generateEmployeeCode(prefix: string = 'NV', lastNumber: number = 0): string {
  return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
}

// Slugify text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Truncate text
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// API response helpers
export function successResponse(data: unknown, message?: string) {
  return Response.json({ success: true, data, message }, { status: 200 });
}

export function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function notFoundResponse(message: string = 'Không tìm thấy') {
  return Response.json({ success: false, error: message }, { status: 404 });
}

export function unauthorizedResponse(message: string = 'Không có quyền truy cập') {
  return Response.json({ success: false, error: message }, { status: 401 });
}

export function forbiddenResponse(message: string = 'Không đủ quyền hạn') {
  return Response.json({ success: false, error: message }, { status: 403 });
}

// Parse pagination params
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// Create pagination meta
export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}
