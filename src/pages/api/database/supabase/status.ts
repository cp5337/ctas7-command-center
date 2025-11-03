import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

interface TableInfo {
  name: string;
  count: number;
  lastModified: string;
  schema: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (healthError) {
      throw new Error(`Connection failed: ${healthError.message}`);
    }

    // Get table information
    const tables: TableInfo[] = [];

    // Ground nodes
    try {
      const { count: groundNodesCount } = await supabase
        .from('ground_nodes')
        .select('*', { count: 'exact', head: true });

      const { data: latestGroundNode } = await supabase
        .from('ground_nodes')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);

      tables.push({
        name: 'ground_nodes',
        count: groundNodesCount || 0,
        lastModified: latestGroundNode?.[0]?.updated_at || 'Unknown',
        schema: 'public.ground_nodes',
      });
    } catch (error) {
      tables.push({
        name: 'ground_nodes',
        count: 0,
        lastModified: 'Error',
        schema: 'Table not found',
      });
    }

    // Satellites
    try {
      const { count: satellitesCount } = await supabase
        .from('satellites')
        .select('*', { count: 'exact', head: true });

      const { data: latestSatellite } = await supabase
        .from('satellites')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);

      tables.push({
        name: 'satellites',
        count: satellitesCount || 0,
        lastModified: latestSatellite?.[0]?.updated_at || 'Unknown',
        schema: 'public.satellites',
      });
    } catch (error) {
      tables.push({
        name: 'satellites',
        count: 0,
        lastModified: 'Error',
        schema: 'Table not found',
      });
    }

    // QKD Metrics
    try {
      const { count: qkdCount } = await supabase
        .from('qkd_metrics')
        .select('*', { count: 'exact', head: true });

      const { data: latestQkd } = await supabase
        .from('qkd_metrics')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1);

      tables.push({
        name: 'qkd_metrics',
        count: qkdCount || 0,
        lastModified: latestQkd?.[0]?.timestamp || 'Unknown',
        schema: 'public.qkd_metrics',
      });
    } catch (error) {
      tables.push({
        name: 'qkd_metrics',
        count: 0,
        lastModified: 'Error',
        schema: 'Table not found',
      });
    }

    // Agent status (if exists)
    try {
      const { count: agentCount } = await supabase
        .from('agent_status')
        .select('*', { count: 'exact', head: true });

      tables.push({
        name: 'agent_status',
        count: agentCount || 0,
        lastModified: new Date().toISOString(),
        schema: 'public.agent_status',
      });
    } catch (error) {
      tables.push({
        name: 'agent_status',
        count: 0,
        lastModified: 'Table not found',
        schema: 'Table not found',
      });
    }

    // Tasks (if exists)
    try {
      const { count: tasksCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });

      tables.push({
        name: 'tasks',
        count: tasksCount || 0,
        lastModified: new Date().toISOString(),
        schema: 'public.tasks',
      });
    } catch (error) {
      tables.push({
        name: 'tasks',
        count: 0,
        lastModified: 'Table not found',
        schema: 'Table not found',
      });
    }

    res.status(200).json({
      connected: true,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured',
      tables,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Supabase status check failed:', error);
    res.status(500).json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tables: [],
      timestamp: new Date().toISOString(),
    });
  }
}