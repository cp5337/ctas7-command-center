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
    const surrealUrl = 'http://localhost:58471';

    // Test basic connection
    const healthResponse = await fetch(`${surrealUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!healthResponse.ok) {
      throw new Error(`SurrealDB connection failed: ${healthResponse.status}`);
    }

    // Get table schema and data
    const queryResponse = await fetch(`${surrealUrl}/sql`, {
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

          -- Get total count
          SELECT count() FROM ${table} GROUP ALL;

          -- Get paginated data with search
          ${search ?
            `SELECT * FROM ${table} WHERE string::contains(string::lowercase(string::concat(name, " ", title, " ", description)), "${search.toLowerCase()}") LIMIT ${limitNum} START ${offset};` :
            `SELECT * FROM ${table} LIMIT ${limitNum} START ${offset};`
          }

          -- Get table info
          INFO FOR TABLE ${table};
        `
      }),
    });

    if (!queryResponse.ok) {
      throw new Error(`SurrealDB query failed: ${queryResponse.status}`);
    }

    const data = await queryResponse.json();
    const results = data.result || [];

    // Extract results
    const totalCountResult = results[0]?.result?.[0]?.count || 0;
    const records = results[1]?.result || [];
    const tableInfo = results[2]?.result || {};

    // Generate field info from actual data or table schema
    let fields: any[] = [];
    if (records && records.length > 0) {
      const sampleRecord = records[0];
      fields = Object.keys(sampleRecord).map(key => {
        const value = sampleRecord[key];
        let type = 'string';

        if (typeof value === 'number') {
          type = Number.isInteger(value) ? 'int' : 'float';
        } else if (typeof value === 'boolean') {
          type = 'bool';
        } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
          type = 'datetime';
        } else if (typeof value === 'object' && value !== null) {
          type = 'object';
        } else if (typeof value === 'string') {
          type = 'string';
        }

        return {
          name: key,
          type,
          nullable: value === null,
          defaultValue: null,
        };
      });
    } else if (tableInfo.fd) {
      // Use schema info if available
      fields = Object.entries(tableInfo.fd).map(([fieldName, fieldDef]: [string, any]) => ({
        name: fieldName,
        type: fieldDef.kind || 'string',
        nullable: !fieldDef.assert,
        defaultValue: fieldDef.default || null,
      }));
    }

    // Check if this is a critical table that should never be empty
    const criticalTables = ['ground_station', 'satellite', 'network_edge', 'legion_slot'];
    const isCritical = criticalTables.includes(table);
    const isEmpty = totalCountResult === 0;

    const result = {
      fields,
      records: records || [],
      totalCount: totalCountResult,
      page: pageNum,
      pageSize: limitNum,
      hasMore: totalCountResult > offset + limitNum,
      critical: isCritical,
      empty: isEmpty,
      alert: isCritical && isEmpty ? {
        level: 'CRITICAL',
        message: `CRITICAL: ${table} table is empty! This will break CTAS-7 system functionality.`,
        action: 'Immediate data population required'
      } : null
    };

    res.status(200).json(result);

  } catch (error) {
    console.error(`Error fetching SurrealDB data from ${table}:`, error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      table,
      database: 'surrealdb',
      timestamp: new Date().toISOString(),
    });
  }
}