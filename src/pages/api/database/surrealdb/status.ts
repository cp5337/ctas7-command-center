import type { NextApiRequest, NextApiResponse } from 'next'

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
    const surrealUrl = 'http://localhost:58471';

    // Test basic connection
    const healthResponse = await fetch(`${surrealUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!healthResponse.ok) {
      throw new Error(`SurrealDB health check failed: ${healthResponse.status}`);
    }

    // Connect to SurrealDB and query tables
    const connectResponse = await fetch(`${surrealUrl}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'NS': 'ctas7',
        'DB': 'geo',
      },
      body: JSON.stringify({
        query: `
          USE NS ctas7 DB geo;

          SELECT count() FROM ground_station GROUP ALL;
          SELECT count() FROM satellite GROUP ALL;
          SELECT count() FROM network_edge GROUP ALL;
          SELECT count() FROM legion_slot GROUP ALL;
          SELECT count() FROM slot_graph_task GROUP ALL;
          SELECT count() FROM threat_intelligence GROUP ALL;

          SELECT VALUE name FROM (INFO FOR DB).tables;
        `
      }),
    });

    const tables: TableInfo[] = [];

    if (connectResponse.ok) {
      const data = await connectResponse.json();

      // Parse the results - SurrealDB returns an array of results
      const results = data.result || [];

      // Expected table counts from queries
      const tableCounts = {
        'ground_station': results[0]?.result?.[0]?.count || 0,
        'satellite': results[1]?.result?.[0]?.count || 0,
        'network_edge': results[2]?.result?.[0]?.count || 0,
        'legion_slot': results[3]?.result?.[0]?.count || 0,
        'slot_graph_task': results[4]?.result?.[0]?.count || 0,
        'threat_intelligence': results[5]?.result?.[0]?.count || 0,
      };

      // Available tables from info query
      const availableTables = results[6]?.result || [];

      // Build table info
      Object.entries(tableCounts).forEach(([tableName, count]) => {
        tables.push({
          name: tableName,
          count: count as number,
          lastModified: new Date().toISOString(),
          schema: `ctas7.geo.${tableName}`,
        });
      });

      // Add any additional tables that exist but weren't in our query
      availableTables.forEach((tableName: string) => {
        if (!tableCounts.hasOwnProperty(tableName)) {
          tables.push({
            name: tableName,
            count: 0,
            lastModified: 'Unknown',
            schema: `ctas7.geo.${tableName}`,
          });
        }
      });

    } else {
      // If SQL query failed, still try to provide basic table structure
      const expectedTables = [
        'ground_station', 'satellite', 'network_edge',
        'legion_slot', 'slot_graph_task', 'threat_intelligence'
      ];

      expectedTables.forEach(tableName => {
        tables.push({
          name: tableName,
          count: 0,
          lastModified: 'Query failed',
          schema: `ctas7.geo.${tableName}`,
        });
      });
    }

    res.status(200).json({
      connected: true,
      url: surrealUrl,
      tables,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('SurrealDB status check failed:', error);

    // Return basic structure even on failure
    const expectedTables = [
      'ground_station', 'satellite', 'network_edge',
      'legion_slot', 'slot_graph_task', 'threat_intelligence'
    ];

    const tables = expectedTables.map(name => ({
      name,
      count: 0,
      lastModified: 'Connection failed',
      schema: `ctas7.geo.${name}`,
    }));

    res.status(500).json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tables,
      timestamp: new Date().toISOString(),
    });
  }
}