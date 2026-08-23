import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { occupationalDiseases, employees } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db
      .select({
        id: occupationalDiseases.id,
        diseaseName: occupationalDiseases.diseaseName,
        diagnosisDate: occupationalDiseases.diagnosisDate,
        treatmentFacility: occupationalDiseases.treatmentFacility,
        status: occupationalDiseases.status,
        notes: occupationalDiseases.notes,
        employeeName: employees.fullName,
      })
      .from(occupationalDiseases)
      .leftJoin(employees, eq(occupationalDiseases.employeeId, employees.id));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching occupational diseases:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
