import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hseDocuments } from '@/lib/db/schema';

export async function GET() {
  try {
    const data = await db.select().from(hseDocuments);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching HSE documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
