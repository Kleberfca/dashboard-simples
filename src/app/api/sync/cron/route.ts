import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSyncService } from '@/lib/integrations/sync-service';

// Vercel Cron configuration (add to vercel.json):
// {
//   "crons": [{
//     "path": "/api/sync/cron",
//     "schedule": "0 * * * *"  // Every hour
//   }]
// }

interface Company {
  id: string;
}

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (for Vercel Cron)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const syncService = getSyncService();

    // Get all active companies
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }

    if (!companies || companies.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        errors: 0,
        timestamp: new Date().toISOString()
      });
    }

    // Process companies in batches to avoid timeout
    const batchSize = 10;
    const batches: Company[][] = [];
    
    for (let i = 0; i < companies.length; i += batchSize) {
      batches.push(companies.slice(i, i + batchSize));
    }

    let totalProcessed = 0;
    const errors: Array<{ companyId: string; error: string }> = [];

    for (const batch of batches) {
      const syncPromises = batch.map((company: Company) => 
        syncService.syncCompanyIntegrations(company.id)
          .then(() => {
            totalProcessed++;
          })
          .catch((error: Error) => {
            errors.push({
              companyId: company.id,
              error: error.message
            });
          })
      );

      await Promise.allSettled(syncPromises);
    }

    // Log summary
    console.log(`Sync completed: ${totalProcessed} companies processed, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      processed: totalProcessed,
      errors: errors.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Manual sync endpoint
export async function POST(req: NextRequest) {
  try {
    const { companyId, integrationId } = await req.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const syncService = getSyncService();

    if (integrationId) {
      // Sync specific integration
      const supabase = await createClient();
      const { data: integration, error } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('id', integrationId)
        .eq('company_id', companyId)
        .single();

      if (error || !integration) {
        return NextResponse.json(
          { error: 'Integration not found' },
          { status: 404 }
        );
      }

      await syncService.syncIntegration(integration);
    } else {
      // Sync all integrations for company
      await syncService.syncCompanyIntegrations(companyId);
    }

    return NextResponse.json({
      success: true,
      message: 'Sync initiated successfully'
    });

  } catch (error) {
    console.error('Manual sync error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate sync' },
      { status: 500 }
    );
  }
}