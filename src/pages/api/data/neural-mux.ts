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
    // Neural-Mux operates on gRPC ports 50051-50058
    const neuralMuxUrl = 'http://localhost:50051';

    // Test connection via HTTP/gRPC-Web proxy
    const healthResponse = await fetch(`${neuralMuxUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).catch(() => null);

    if (!healthResponse?.ok) {
      // Fallback to local neural-mux data if service is not running
      const mockData = getMockNeuralMuxData(table, pageNum, limitNum, search);
      return res.status(200).json(mockData);
    }

    // Query neural network multiplexer data
    const queryPayload = {
      table,
      pagination: {
        page: pageNum,
        limit: limitNum,
        offset,
      },
      search,
      include_schema: true,
    };

    const dataResponse = await fetch(`${neuralMuxUrl}/api/v1/neural-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(queryPayload),
    });

    if (!dataResponse.ok) {
      throw new Error(`Neural-Mux query failed: ${dataResponse.status}`);
    }

    const result = await dataResponse.json();

    // Check if this is a critical neural table
    const criticalTables = ['neural_pathways', 'axon_connections', 'cognitive_state', 'neural_clusters'];
    const isCritical = criticalTables.includes(table);
    const isEmpty = (result.totalCount || 0) === 0;

    const response = {
      fields: result.schema || [],
      records: result.data || [],
      totalCount: result.totalCount || 0,
      page: pageNum,
      pageSize: limitNum,
      hasMore: (result.totalCount || 0) > offset + limitNum,
      critical: isCritical,
      empty: isEmpty,
      alert: isCritical && isEmpty ? {
        level: 'CRITICAL',
        message: `CRITICAL: Neural-Mux ${table} is empty! Neural processing will be degraded.`,
        action: 'Neural pathway initialization required'
      } : null,
      neural_metrics: result.metrics || {
        processing_efficiency: 0,
        pathway_health: 'UNKNOWN',
        cluster_status: 'OFFLINE'
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error(`Error fetching Neural-Mux data from ${table}:`, error);

    // Return mock data if service is unavailable
    const mockData = getMockNeuralMuxData(table, pageNum, limitNum, search);
    mockData.alert = {
      level: 'WARNING',
      message: `Neural-Mux service unavailable. Showing mock data for ${table}.`,
      action: 'Check Neural-Mux service status'
    };

    res.status(503).json(mockData);
  }
}

function getMockNeuralMuxData(table: string, page: number, limit: number, search: string) {
  const mockTables: Record<string, any> = {
    neural_pathways: {
      fields: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'pathway_name', type: 'string', nullable: false },
        { name: 'source_node', type: 'string', nullable: false },
        { name: 'target_node', type: 'string', nullable: false },
        { name: 'weight', type: 'float', nullable: false },
        { name: 'activation_threshold', type: 'float', nullable: false },
        { name: 'last_activation', type: 'datetime', nullable: true },
        { name: 'pathway_type', type: 'string', nullable: false },
        { name: 'efficiency_score', type: 'float', nullable: false },
      ],
      records: [
        {
          id: 'np_001',
          pathway_name: 'Tactical_Analysis_Primary',
          source_node: 'sensor_input_01',
          target_node: 'decision_engine_alpha',
          weight: 0.85,
          activation_threshold: 0.7,
          last_activation: new Date().toISOString(),
          pathway_type: 'CRITICAL',
          efficiency_score: 0.92,
        },
        {
          id: 'np_002',
          pathway_name: 'Threat_Assessment_Secondary',
          source_node: 'radar_correlator',
          target_node: 'threat_classifier',
          weight: 0.73,
          activation_threshold: 0.6,
          last_activation: new Date(Date.now() - 5000).toISOString(),
          pathway_type: 'STANDARD',
          efficiency_score: 0.78,
        }
      ],
      totalCount: 2,
    },
    axon_connections: {
      fields: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'connection_id', type: 'string', nullable: false },
        { name: 'pre_synaptic', type: 'string', nullable: false },
        { name: 'post_synaptic', type: 'string', nullable: false },
        { name: 'connection_strength', type: 'float', nullable: false },
        { name: 'latency_ms', type: 'int', nullable: false },
        { name: 'packet_loss', type: 'float', nullable: false },
        { name: 'bandwidth_mbps', type: 'float', nullable: false },
      ],
      records: [
        {
          id: 'axon_001',
          connection_id: 'tactical_bridge_alpha',
          pre_synaptic: 'ground_station_001',
          post_synaptic: 'neural_cluster_001',
          connection_strength: 0.95,
          latency_ms: 2,
          packet_loss: 0.001,
          bandwidth_mbps: 1000.0,
        }
      ],
      totalCount: 1,
    },
    cognitive_state: {
      fields: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'state_name', type: 'string', nullable: false },
        { name: 'activation_level', type: 'float', nullable: false },
        { name: 'confidence_score', type: 'float', nullable: false },
        { name: 'processing_load', type: 'float', nullable: false },
        { name: 'last_update', type: 'datetime', nullable: false },
      ],
      records: [],
      totalCount: 0,
    }
  };

  const tableData = mockTables[table] || {
    fields: [
      { name: 'id', type: 'string', nullable: false },
      { name: 'name', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: false },
    ],
    records: [],
    totalCount: 0,
  };

  const criticalTables = ['neural_pathways', 'axon_connections', 'cognitive_state', 'neural_clusters'];
  const isCritical = criticalTables.includes(table);
  const isEmpty = tableData.totalCount === 0;

  return {
    fields: tableData.fields,
    records: tableData.records,
    totalCount: tableData.totalCount,
    page,
    pageSize: limit,
    hasMore: false,
    critical: isCritical,
    empty: isEmpty,
    neural_metrics: {
      processing_efficiency: 0.75,
      pathway_health: 'DEGRADED',
      cluster_status: 'MOCK_DATA'
    },
    alert: isEmpty && isCritical ? {
      level: 'CRITICAL',
      message: `CRITICAL: Neural-Mux ${table} is empty! Neural processing will be degraded.`,
      action: 'Neural pathway initialization required'
    } : null
  };
}