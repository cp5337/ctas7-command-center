import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { table, page = '1', limit = '50', search = '' } = req.query;

  if (!table || typeof table !== 'string') {
    return res.status(400).json({ error: 'Table parameter is required' });
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  try {
    // Sled KVS operates via HTTP API on port 50059
    const sledUrl = 'http://localhost:50059';

    // Test connection
    const healthResponse = await fetch(`${sledUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }).catch(() => null);

    if (!healthResponse?.ok) {
      // Return mock Sled data if service is unavailable
      const mockData = getMockSledData(table, pageNum, limitNum, search);
      mockData.alert = {
        level: 'WARNING',
        message: `Sled KVS service unavailable. Showing mock data for ${table}.`,
        action: 'Check Sled KVS service status on port 50059'
      };
      return res.status(503).json(mockData);
    }

    // Query Sled KVS
    const queryPayload = {
      operation: 'scan',
      table,
      pagination: {
        page: pageNum,
        limit: limitNum,
        offset,
      },
      search,
      include_metadata: true,
    };

    const dataResponse = await fetch(`${sledUrl}/api/v1/kv-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(queryPayload),
    });

    if (!dataResponse.ok) {
      throw new Error(`Sled KVS query failed: ${dataResponse.status}`);
    }

    const result = await dataResponse.json();

    // Transform KV pairs into table format
    const records = (result.entries || []).map((entry: any) => ({
      key: entry.key,
      value: entry.value,
      hash: entry.metadata?.hash || 'N/A',
      compression: entry.metadata?.compression || 'none',
      created_at: entry.metadata?.created_at || new Date().toISOString(),
      size_bytes: entry.metadata?.size_bytes || 0,
      access_count: entry.metadata?.access_count || 0,
      last_accessed: entry.metadata?.last_accessed || 'Never',
    }));

    const fields = [
      { name: 'key', type: 'string', nullable: false },
      { name: 'value', type: 'json', nullable: true },
      { name: 'hash', type: 'string', nullable: false },
      { name: 'compression', type: 'string', nullable: false },
      { name: 'created_at', type: 'datetime', nullable: false },
      { name: 'size_bytes', type: 'int', nullable: false },
      { name: 'access_count', type: 'int', nullable: false },
      { name: 'last_accessed', type: 'datetime', nullable: true },
    ];

    // Check if this is a critical KVS table
    const criticalTables = ['hash_index', 'compressed_unicode', 'trivariate_hash', 'ctas_metadata'];
    const isCritical = criticalTables.includes(table);
    const isEmpty = (result.totalCount || 0) === 0;

    const response = {
      fields,
      records,
      totalCount: result.totalCount || 0,
      page: pageNum,
      pageSize: limitNum,
      hasMore: (result.totalCount || 0) > offset + limitNum,
      critical: isCritical,
      empty: isEmpty,
      alert: isCritical && isEmpty ? {
        level: 'CRITICAL',
        message: `CRITICAL: Sled KVS ${table} is empty! Hash operations and compression will fail.`,
        action: 'Immediate KVS initialization required'
      } : null,
      kvs_metrics: result.metrics || {
        total_keys: 0,
        total_size_bytes: 0,
        compression_ratio: 0,
        fragmentation: 0
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error(`Error fetching Sled KVS data from ${table}:`, error);

    // Return mock data on error
    const mockData = getMockSledData(table, pageNum, limitNum, search);
    mockData.alert = {
      level: 'ERROR',
      message: `Failed to connect to Sled KVS: ${error instanceof Error ? error.message : 'Unknown error'}`,
      action: 'Check Sled KVS service and configuration'
    };

    res.status(500).json(mockData);
  }
}

function getMockSledData(table: string, page: number, limit: number, search: string) {
  const mockTables: Record<string, any> = {
    hash_index: {
      records: [
        {
          key: 'hash:sch:tactical:001',
          value: { type: 'tactical_data', size: 2048, references: ['sat_001', 'ground_002'] },
          hash: 'sch_a1b2c3d4e5f6',
          compression: 'lz4',
          created_at: new Date().toISOString(),
          size_bytes: 512,
          access_count: 147,
          last_accessed: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          key: 'hash:cuid:cognitive:002',
          value: { type: 'cognitive_state', neural_activity: 0.85, decision_confidence: 0.92 },
          hash: 'cuid_x7y8z9w0v1u2',
          compression: 'zstd',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          size_bytes: 256,
          access_count: 89,
          last_accessed: new Date(Date.now() - 1800000).toISOString(),
        }
      ],
      totalCount: 2,
    },
    compressed_unicode: {
      records: [
        {
          key: 'unicode:assembly:E000',
          value: '🔬⚡🛰️💫',
          hash: 'unicode_e000_compressed',
          compression: 'unicode_lz',
          created_at: new Date().toISOString(),
          size_bytes: 64,
          access_count: 1247,
          last_accessed: new Date(Date.now() - 900000).toISOString(),
        }
      ],
      totalCount: 1,
    },
    trivariate_hash: {
      records: [],
      totalCount: 0,
    },
    ctas_metadata: {
      records: [],
      totalCount: 0,
    }
  };

  const tableData = mockTables[table] || {
    records: [],
    totalCount: 0,
  };

  const fields = [
    { name: 'key', type: 'string', nullable: false },
    { name: 'value', type: 'json', nullable: true },
    { name: 'hash', type: 'string', nullable: false },
    { name: 'compression', type: 'string', nullable: false },
    { name: 'created_at', type: 'datetime', nullable: false },
    { name: 'size_bytes', type: 'int', nullable: false },
    { name: 'access_count', type: 'int', nullable: false },
    { name: 'last_accessed', type: 'datetime', nullable: true },
  ];

  const criticalTables = ['hash_index', 'compressed_unicode', 'trivariate_hash', 'ctas_metadata'];
  const isCritical = criticalTables.includes(table);
  const isEmpty = tableData.totalCount === 0;

  return {
    fields,
    records: tableData.records,
    totalCount: tableData.totalCount,
    page,
    pageSize: limit,
    hasMore: false,
    critical: isCritical,
    empty: isEmpty,
    kvs_metrics: {
      total_keys: tableData.totalCount,
      total_size_bytes: tableData.records.reduce((sum: number, r: any) => sum + (r.size_bytes || 0), 0),
      compression_ratio: 0.65,
      fragmentation: 0.12
    },
    alert: isEmpty && isCritical ? {
      level: 'CRITICAL',
      message: `CRITICAL: Sled KVS ${table} is empty! Hash operations and compression will fail.`,
      action: 'Immediate KVS initialization required'
    } : null
  };
}