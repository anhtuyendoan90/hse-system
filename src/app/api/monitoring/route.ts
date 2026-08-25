import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { monitoringCampaigns, monitoringResults } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    
    // Get all campaigns
    const campaigns = await db.select().from(monitoringCampaigns).all();
    
    // Get all results
    const results = await db.select({
      id: monitoringResults.id,
      campaignId: monitoringResults.campaignId,
      location: monitoringResults.location,
      factorGroup: monitoringResults.factorGroup,
      factorName: monitoringResults.factorName,
      resultValue: monitoringResults.resultValue,
      limitValue: monitoringResults.limitValue,
      unit: monitoringResults.unit,
      status: monitoringResults.status,
      notes: monitoringResults.notes,
      campaignName: monitoringCampaigns.name,
      monitoringDate: monitoringCampaigns.monitoringDate,
    })
    .from(monitoringResults)
    .innerJoin(monitoringCampaigns, eq(monitoringResults.campaignId, monitoringCampaigns.id))
    .all();

    return successResponse({ campaigns, results });
  } catch (error) {
    return errorResponse('Lỗi hệ thống', 500);
  }
}
