import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Database, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';

interface DatabaseStatus {
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  url: string;
  recordCount: number;
  lastUpdated: string;
  tables: TableStatus[];
  health: number; // 0-100
  issues: string[];
}

interface TableStatus {
  name: string;
  recordCount: number;
  lastModified: string;
  schema: string;
  populated: boolean;
  critical: boolean;
}

const EXPECTED_TABLES = {
  supabase: [
    { name: 'ground_nodes', critical: true, minRecords: 100 },
    { name: 'satellites', critical: true, minRecords: 12 },
    { name: 'qkd_metrics', critical: false, minRecords: 0 },
    { name: 'agent_status', critical: true, minRecords: 24 },
    { name: 'tasks', critical: false, minRecords: 0 },
  ],
  surrealdb: [
    { name: 'ground_station', critical: true, minRecords: 257 },
    { name: 'satellite', critical: true, minRecords: 12 },
    { name: 'network_edge', critical: true, minRecords: 500 },
    { name: 'legion_slot', critical: true, minRecords: 10 },
    { name: 'slot_graph_task', critical: false, minRecords: 0 },
    { name: 'threat_intelligence', critical: false, minRecords: 0 },
  ],
  neural_mux: [
    { name: 'vector_embeddings', critical: false, minRecords: 0 },
    { name: 'cognitive_atoms', critical: false, minRecords: 0 },
    { name: 'neural_pathways', critical: false, minRecords: 0 },
  ],
  sled: [
    { name: 'session_cache', critical: false, minRecords: 0 },
    { name: 'trivariate_hashes', critical: false, minRecords: 0 },
    { name: 'unicode_operations', critical: false, minRecords: 0 },
  ]
};

export function DatabaseMonitor() {
  const [databases, setDatabases] = useState<DatabaseStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDb, setSelectedDb] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDatabaseStatus = async () => {
    setLoading(true);
    try {
      // Fetch status for each database
      const dbStatuses = await Promise.all([
        fetchSupabaseStatus(),
        fetchSurrealDBStatus(),
        fetchNeuralMuxStatus(),
        fetchSledStatus(),
      ]);
      setDatabases(dbStatuses);
    } catch (error) {
      console.error('Failed to fetch database status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupabaseStatus = async (): Promise<DatabaseStatus> => {
    try {
      // Check Supabase connection and tables
      const response = await fetch('/api/database/supabase/status');
      const data = await response.json();

      const tables: TableStatus[] = EXPECTED_TABLES.supabase.map(expected => {
        const actual = data.tables?.find((t: any) => t.name === expected.name);
        return {
          name: expected.name,
          recordCount: actual?.count || 0,
          lastModified: actual?.lastModified || 'Unknown',
          schema: actual?.schema || 'Unknown',
          populated: (actual?.count || 0) >= expected.minRecords,
          critical: expected.critical,
        };
      });

      const issues = tables
        .filter(t => t.critical && !t.populated)
        .map(t => `${t.name} has insufficient records (${t.recordCount})`);

      return {
        name: 'Supabase',
        type: 'PostgreSQL',
        status: response.ok ? 'connected' : 'error',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured',
        recordCount: tables.reduce((sum, t) => sum + t.recordCount, 0),
        lastUpdated: new Date().toISOString(),
        tables,
        health: Math.round((tables.filter(t => t.populated).length / tables.length) * 100),
        issues,
      };
    } catch (error) {
      return {
        name: 'Supabase',
        type: 'PostgreSQL',
        status: 'disconnected',
        url: 'Connection failed',
        recordCount: 0,
        lastUpdated: new Date().toISOString(),
        tables: [],
        health: 0,
        issues: ['Connection failed'],
      };
    }
  };

  const fetchSurrealDBStatus = async (): Promise<DatabaseStatus> => {
    try {
      const response = await fetch('/api/database/surrealdb/status');
      const data = await response.json();

      const tables: TableStatus[] = EXPECTED_TABLES.surrealdb.map(expected => {
        const actual = data.tables?.find((t: any) => t.name === expected.name);
        return {
          name: expected.name,
          recordCount: actual?.count || 0,
          lastModified: actual?.lastModified || 'Unknown',
          schema: actual?.schema || 'Unknown',
          populated: (actual?.count || 0) >= expected.minRecords,
          critical: expected.critical,
        };
      });

      const issues = tables
        .filter(t => t.critical && !t.populated)
        .map(t => `${t.name} has insufficient records (${t.recordCount})`);

      return {
        name: 'SurrealDB',
        type: 'Graph Database',
        status: response.ok ? 'connected' : 'error',
        url: 'ws://localhost:58471',
        recordCount: tables.reduce((sum, t) => sum + t.recordCount, 0),
        lastUpdated: new Date().toISOString(),
        tables,
        health: Math.round((tables.filter(t => t.populated).length / tables.length) * 100),
        issues,
      };
    } catch (error) {
      return {
        name: 'SurrealDB',
        type: 'Graph Database',
        status: 'disconnected',
        url: 'Connection failed',
        recordCount: 0,
        lastUpdated: new Date().toISOString(),
        tables: [],
        health: 0,
        issues: ['Connection failed'],
      };
    }
  };

  const fetchNeuralMuxStatus = async (): Promise<DatabaseStatus> => {
    try {
      const response = await fetch('/api/database/neural-mux/status');
      const data = await response.json();

      const tables: TableStatus[] = EXPECTED_TABLES.neural_mux.map(expected => {
        const actual = data.collections?.find((c: any) => c.name === expected.name);
        return {
          name: expected.name,
          recordCount: actual?.count || 0,
          lastModified: actual?.lastModified || 'Unknown',
          schema: actual?.schema || 'Vector Store',
          populated: true, // Neural Mux tables can be empty initially
          critical: expected.critical,
        };
      });

      return {
        name: 'Neural Mux',
        type: 'Vector Store',
        status: response.ok ? 'connected' : 'error',
        url: 'grpc://localhost:50051',
        recordCount: tables.reduce((sum, t) => sum + t.recordCount, 0),
        lastUpdated: new Date().toISOString(),
        tables,
        health: response.ok ? 100 : 0,
        issues: [],
      };
    } catch (error) {
      return {
        name: 'Neural Mux',
        type: 'Vector Store',
        status: 'disconnected',
        url: 'Connection failed',
        recordCount: 0,
        lastUpdated: new Date().toISOString(),
        tables: [],
        health: 0,
        issues: ['gRPC connection failed'],
      };
    }
  };

  const fetchSledStatus = async (): Promise<DatabaseStatus> => {
    try {
      const response = await fetch('/api/database/sled/status');
      const data = await response.json();

      const tables: TableStatus[] = EXPECTED_TABLES.sled.map(expected => {
        const actual = data.trees?.find((t: any) => t.name === expected.name);
        return {
          name: expected.name,
          recordCount: actual?.count || 0,
          lastModified: actual?.lastModified || 'Unknown',
          schema: actual?.schema || 'KVS',
          populated: true, // Sled can be empty initially
          critical: expected.critical,
        };
      });

      return {
        name: 'Sled KVS',
        type: 'Key-Value Store',
        status: response.ok ? 'connected' : 'error',
        url: './data/sled.db',
        recordCount: tables.reduce((sum, t) => sum + t.recordCount, 0),
        lastUpdated: new Date().toISOString(),
        tables,
        health: response.ok ? 100 : 0,
        issues: [],
      };
    } catch (error) {
      return {
        name: 'Sled KVS',
        type: 'Key-Value Store',
        status: 'disconnected',
        url: 'File system error',
        recordCount: 0,
        lastUpdated: new Date().toISOString(),
        tables: [],
        health: 0,
        issues: ['Local file system error'],
      };
    }
  };

  useEffect(() => {
    fetchDatabaseStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchDatabaseStatus, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const criticalIssues = databases.flatMap(db =>
    db.issues.map(issue => ({ database: db.name, issue }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Database Monitor</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDatabaseStatus}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Critical Database Issues ({criticalIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalIssues.map((issue, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Badge variant="destructive">{issue.database}</Badge>
                  <span>{issue.issue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {databases.map((db) => (
          <Card key={db.name} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedDb(db.name)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{db.name}</CardTitle>
                {getStatusIcon(db.status)}
              </div>
              <p className="text-sm text-gray-600">{db.type}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Health</span>
                  <span className={`text-sm font-bold ${getHealthColor(db.health)}`}>
                    {db.health}%
                  </span>
                </div>
                <Progress value={db.health} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Records</span>
                  <span className="text-sm font-bold">{db.recordCount.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Tables</span>
                  <span className="text-sm font-bold">
                    {db.tables.filter(t => t.populated).length}/{db.tables.length}
                  </span>
                </div>

                {db.issues.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {db.issues.length} issue{db.issues.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Database View */}
      {selectedDb && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {databases.find(db => db.name === selectedDb)?.name} Details
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDb('')}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tables">
              <TabsList>
                <TabsTrigger value="tables">Tables/Collections</TabsTrigger>
                <TabsTrigger value="connection">Connection Info</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
              </TabsList>

              <TabsContent value="tables" className="mt-4">
                <div className="space-y-4">
                  {databases.find(db => db.name === selectedDb)?.tables.map((table) => (
                    <Card key={table.name}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{table.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            {table.critical && (
                              <Badge variant="secondary">Critical</Badge>
                            )}
                            <Badge variant={table.populated ? "default" : "destructive"}>
                              {table.populated ? "Populated" : "Empty"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Records:</span>
                            <p>{table.recordCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="font-medium">Last Modified:</span>
                            <p>{table.lastModified}</p>
                          </div>
                          <div>
                            <span className="font-medium">Schema:</span>
                            <p>{table.schema}</p>
                          </div>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {/* TODO: Open table viewer */}}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Data
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="connection" className="mt-4">
                {databases.find(db => db.name === selectedDb) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium">Connection URL:</label>
                        <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                          {databases.find(db => db.name === selectedDb)?.url}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium">Database Type:</label>
                        <p className="text-sm">
                          {databases.find(db => db.name === selectedDb)?.type}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium">Status:</label>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(databases.find(db => db.name === selectedDb)?.status || '')}
                          <span className="text-sm capitalize">
                            {databases.find(db => db.name === selectedDb)?.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="font-medium">Last Updated:</label>
                        <p className="text-sm">
                          {new Date(databases.find(db => db.name === selectedDb)?.lastUpdated || '').toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="issues" className="mt-4">
                <div className="space-y-2">
                  {databases.find(db => db.name === selectedDb)?.issues.map((issue, index) => (
                    <Card key={index} className="border-yellow-200 bg-yellow-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm">{issue}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )) || <p className="text-sm text-gray-600">No issues detected</p>}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}