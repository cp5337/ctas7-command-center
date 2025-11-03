import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

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
    // First, get the table schema
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_table_schema', { table_name: table });

    if (schemaError && !schemaData) {
      // Fallback: try to get column info from information_schema
      const { data: columnInfo } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', table)
        .eq('table_schema', 'public');

      const fields = columnInfo?.map((col: any) => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
        defaultValue: col.column_default,
      })) || [];

      if (fields.length === 0) {
        return res.status(404).json({ error: `Table '${table}' not found or no access` });
      }
    }

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return res.status(500).json({ error: `Failed to count records: ${countError.message}` });
    }

    // Build query with search
    let query = supabase.from(table).select('*');

    // Add search functionality (basic text search across all fields)
    if (search) {
      // This is a simplified search - in production you'd want more sophisticated search
      query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Add pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: records, error: dataError } = await query;

    if (dataError) {
      return res.status(500).json({ error: `Failed to fetch data: ${dataError.message}` });
    }

    // Generate field info from the actual data if schema query failed
    let fields: any[] = [];
    if (records && records.length > 0) {
      const sampleRecord = records[0];
      fields = Object.keys(sampleRecord).map(key => {
        const value = sampleRecord[key];
        let type = 'text';

        if (typeof value === 'number') {
          type = Number.isInteger(value) ? 'integer' : 'numeric';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
          type = 'timestamp';
        } else if (typeof value === 'object' && value !== null) {
          type = 'json';
        }

        return {
          name: key,
          type,
          nullable: value === null,
          defaultValue: null,
        };
      });
    }

    // Check if this is a critical table that should never be empty
    const criticalTables = ['ground_nodes', 'satellites', 'agent_status'];
    const isCritical = criticalTables.includes(table);
    const isEmpty = (totalCount || 0) === 0;

    const result = {
      fields,
      records: records || [],
      totalCount: totalCount || 0,
      page: pageNum,
      pageSize: limitNum,
      hasMore: (totalCount || 0) > offset + limitNum,
      critical: isCritical,
      empty: isEmpty,
      alert: isCritical && isEmpty ? {
        level: 'CRITICAL',
        message: `CRITICAL: ${table} table is empty! This will break system functionality.`,
        action: 'Immediate data population required'
      } : null
    };

    res.status(200).json(result);

  } catch (error) {
    console.error(`Error fetching data from ${table}:`, error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      table,
      timestamp: new Date().toISOString(),
    });
  }
}