import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  Database,
  Eye,
  AlertCircle
} from 'lucide-react';

interface DataViewerProps {
  database: string;
  table: string;
  title?: string;
  maxRows?: number;
}

interface FieldInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: any;
  description?: string;
}

interface DataRecord {
  [key: string]: any;
}

interface DataResult {
  fields: FieldInfo[];
  records: DataRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export function DataViewer({ database, table, title, maxRows = 50 }: DataViewerProps) {
  const [data, setData] = useState<DataResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<DataRecord | null>(null);
  const [showSchema, setShowSchema] = useState(false);

  const fetchData = async (pageNum: number = 1, search: string = '') => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        table,
        page: pageNum.toString(),
        limit: maxRows.toString(),
        search,
      });

      const response = await fetch(`/api/data/${database}?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, searchTerm);
  }, [database, table, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    fetchData(newPage, searchTerm);
  };

  const formatValue = (value: any, fieldType: string) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }

    if (typeof value === 'boolean') {
      return <Badge variant={value ? "default" : "secondary"}>{value.toString()}</Badge>;
    }

    if (fieldType.includes('json') || fieldType.includes('object')) {
      return (
        <details className="cursor-pointer">
          <summary className="text-blue-600 hover:text-blue-800">JSON</summary>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 max-w-xs overflow-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        </details>
      );
    }

    if (fieldType.includes('timestamp') || fieldType.includes('datetime')) {
      try {
        return new Date(value).toLocaleString();
      } catch {
        return value.toString();
      }
    }

    if (typeof value === 'string' && value.length > 100) {
      return (
        <details className="cursor-pointer">
          <summary className="text-blue-600 hover:text-blue-800">
            {value.substring(0, 50)}...
          </summary>
          <div className="max-w-md bg-gray-100 p-2 rounded mt-1 text-xs">
            {value}
          </div>
        </details>
      );
    }

    return value.toString();
  };

  const getFieldTypeColor = (type: string) => {
    if (type.includes('int') || type.includes('number')) return 'bg-blue-100 text-blue-800';
    if (type.includes('string') || type.includes('text')) return 'bg-green-100 text-green-800';
    if (type.includes('bool')) return 'bg-purple-100 text-purple-800';
    if (type.includes('date') || type.includes('time')) return 'bg-orange-100 text-orange-800';
    if (type.includes('json') || type.includes('object')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading {title || `${database}.${table}`}...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="flex items-center p-6">
          <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
          <div>
            <h3 className="font-semibold text-red-700">Error loading data</h3>
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(page, searchTerm)}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Database className="w-6 h-6 text-gray-400 mr-2" />
          No data available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>{title || `${database}.${table}`}</span>
              <Badge variant="outline">{data.totalCount.toLocaleString()} records</Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSchema(!showSchema)}
              >
                {showSchema ? 'Hide Schema' : 'Show Schema'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData(page, searchTerm)}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Search */}
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>

          {/* Schema View */}
          {showSchema && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Schema Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.fields.map((field) => (
                    <div key={field.name} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{field.name}</span>
                        <Badge className={getFieldTypeColor(field.type)}>
                          {field.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {field.nullable && <span className="text-orange-600">nullable</span>}
                        {field.defaultValue && (
                          <div>Default: <code className="bg-gray-100 px-1 rounded">{field.defaultValue}</code></div>
                        )}
                        {field.description && (
                          <div className="mt-1 italic">{field.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {data.fields.map((field) => (
                    <TableHead key={field.name} className="whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span>{field.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {field.type.split('(')[0]}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((record, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    {data.fields.map((field) => (
                      <TableCell key={field.name} className="max-w-xs">
                        {formatValue(record[field.name], field.type)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * maxRows) + 1} to {Math.min(page * maxRows, data.totalCount)} of {data.totalCount.toLocaleString()} records
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm px-2">
                Page {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={!data.hasMore}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <Card className="fixed inset-4 z-50 bg-white shadow-2xl overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Record Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRecord(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.fields.map((field) => (
                <div key={field.name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium">{field.name}</label>
                    <Badge className={getFieldTypeColor(field.type)}>
                      {field.type}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    {selectedRecord[field.name] === null || selectedRecord[field.name] === undefined ? (
                      <span className="text-gray-400 italic">null</span>
                    ) : typeof selectedRecord[field.name] === 'object' ? (
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(selectedRecord[field.name], null, 2)}
                      </pre>
                    ) : (
                      <span className="font-mono text-sm">
                        {selectedRecord[field.name].toString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}