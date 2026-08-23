import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { legalDocuments } from '@/lib/db/schema';

export async function GET() {
  try {
    const data = await db.select().from(legalDocuments);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching legal documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
