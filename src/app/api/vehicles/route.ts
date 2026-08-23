import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vehicles } from '@/lib/db/schema';

export async function GET() {
  try {
    const results = await db.select().from(vehicles);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}
