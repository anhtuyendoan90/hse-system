import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { certificates, employees } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const results = await db
      .select({
        id: certificates.id,
        name: certificates.name,
        type: certificates.type,
        issueDate: certificates.issueDate,
        expiryDate: certificates.expiryDate,
        issuer: certificates.issuer,
        documentUrl: certificates.documentUrl,
        employeeName: employees.fullName,
      })
      .from(certificates)
      .leftJoin(employees, eq(certificates.employeeId, employees.id));
      
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch certificates' }, { status: 500 });
  }
}
