import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Satellite,
  AlertTriangle,
  Globe,
  Target,
  Trash2,
  Merge,
  Eye,
  MapPin,
  Filter
} from 'lucide-react';

interface DuplicateSatellite {
  id: string;
  name: string;
  position: [number, number, number]; // lat, lon, alt
  duplicateGroup: string;
  duplicateCount: number;
  confidence: number; // 0-1, how confident we are it's a duplicate
  originalId?: string;
  type: 'exact_duplicate' | 'near_duplicate' | 'name_duplicate' | 'position_duplicate';
}

interface DuplicateGroup {
  groupId: string;
  baseName: string;
  satellites: DuplicateSatellite[];
  recommendedAction: 'merge' | 'keep_all' | 'remove_duplicates';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function DuplicateDetectionOverlay() {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [showEarthBackground, setShowEarthBackground] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [totalDuplicates, setTotalDuplicates] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  useEffect(() => {
    // Simulate detecting duplicates from the current satellite constellation
    detectDuplicateSatellites();
  }, []);

  const detectDuplicateSatellites = () => {
    // Simulating the duplicate satellites we can see in the current view
    const mockDuplicateGroups: DuplicateGroup[] = [
      {
        groupId: 'SAT_ETA_GROUP',
        baseName: 'SAT-ETA',
        satellites: [
          {
            id: 'SAT-ETA-1',
            name: 'SAT-ETA',
            position: [45.2, -120.5, 550],
            duplicateGroup: 'SAT_ETA_GROUP',
            duplicateCount: 4,
            confidence: 0.95,
            type: 'exact_duplicate'
          },
          {
            id: 'SAT-ETA-2',
            name: 'SAT-ETA',
            position: [45.3, -120.4, 551],
            duplicateGroup: 'SAT_ETA_GROUP',
            duplicateCount: 4,
            confidence: 0.92,
            type: 'near_duplicate'
          },
          {
            id: 'SAT-ETA-3',
            name: 'SAT-ETA',
            position: [45.1, -120.6, 549],
            duplicateGroup: 'SAT_ETA_GROUP',
            duplicateCount: 4,
            confidence: 0.89,
            type: 'position_duplicate'
          },
          {
            id: 'SAT-ETA-4',
            name: 'SAT-ETA',
            position: [45.2, -120.5, 550],
            duplicateGroup: 'SAT_ETA_GROUP',
            duplicateCount: 4,
            confidence: 0.98,
            type: 'exact_duplicate'
          }
        ],
        recommendedAction: 'remove_duplicates',
        severity: 'critical'
      },
      {
        groupId: 'SAT_DELTA_GROUP',
        baseName: 'SAT-DELTA',
        satellites: [
          {
            id: 'SAT-DELTA-1',
            name: 'SAT-DELTA',
            position: [32.1, 15.2, 580],
            duplicateGroup: 'SAT_DELTA_GROUP',
            duplicateCount: 3,
            confidence: 0.91,
            type: 'exact_duplicate'
          },
          {
            id: 'SAT-DELTA-2',
            name: 'SAT-DELTA',
            position: [32.2, 15.1, 579],
            duplicateGroup: 'SAT_DELTA_GROUP',
            duplicateCount: 3,
            confidence: 0.87,
            type: 'near_duplicate'
          },
          {
            id: 'SAT-DELTA-3',
            name: 'SAT-DELTA',
            position: [32.0, 15.3, 581],
            duplicateGroup: 'SAT_DELTA_GROUP',
            duplicateCount: 3,
            confidence: 0.94,
            type: 'position_duplicate'
          }
        ],
        recommendedAction: 'merge',
        severity: 'high'
      },
      {
        groupId: 'SAT_LAMBDA_GROUP',
        baseName: 'SAT-LAMBDA',
        satellites: [
          {
            id: 'SAT-LAMBDA-1',
            name: 'SAT-LAMBDA',
            position: [-15.5, 45.8, 600],
            duplicateGroup: 'SAT_LAMBDA_GROUP',
            duplicateCount: 2,
            confidence: 0.85,
            type: 'name_duplicate'
          },
          {
            id: 'SAT-LAMBDA-2',
            name: 'SAT-LAMBDA',
            position: [-15.4, 45.9, 602],
            duplicateGroup: 'SAT_LAMBDA_GROUP',
            duplicateCount: 2,
            confidence: 0.83,
            type: 'position_duplicate'
          }
        ],
        recommendedAction: 'keep_all',
        severity: 'medium'
      },
      {
        groupId: 'MEO_GAMMA_GROUP',
        baseName: 'MEO-GAMMA',
        satellites: [
          {
            id: 'MEO-GAMMA-1',
            name: 'MEO-GAMMA-05',
            position: [12.3, -85.2, 12000],
            duplicateGroup: 'MEO_GAMMA_GROUP',
            duplicateCount: 2,
            confidence: 0.76,
            type: 'name_duplicate'
          },
          {
            id: 'MEO-GAMMA-2',
            name: 'SAT-GAMMA',
            position: [12.4, -85.1, 12001],
            duplicateGroup: 'MEO_GAMMA_GROUP',
            duplicateCount: 2,
            confidence: 0.72,
            type: 'near_duplicate'
          }
        ],
        recommendedAction: 'merge',
        severity: 'low'
      }
    ];

    setDuplicateGroups(mockDuplicateGroups);

    const total = mockDuplicateGroups.reduce((sum, group) => sum + group.satellites.length, 0);
    setTotalDuplicates(total);
  };

  const resolveDuplicateGroup = (groupId: string, action: 'merge' | 'remove_duplicates' | 'keep_all') => {
    setDuplicateGroups(prev => prev.filter(group => group.groupId !== groupId));
    setResolvedCount(prev => prev + 1);

    // In a real implementation, this would communicate with the Cesium viewer
    // to actually remove/merge the satellite entities
    console.log(`🛰️ Resolved duplicate group ${groupId} with action: ${action}`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200';
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-500 bg-blue-50 border-blue-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exact_duplicate': return '🔴';
      case 'near_duplicate': return '🟡';
      case 'name_duplicate': return '🔵';
      case 'position_duplicate': return '🟢';
      default: return '⚪';
    }
  };

  const filteredGroups = filterSeverity === 'all'
    ? duplicateGroups
    : duplicateGroups.filter(group => group.severity === filterSeverity);

  return (
    <div className="fixed top-20 right-4 w-96 max-h-[80vh] overflow-y-auto z-50 space-y-4">
      {/* Earth Background Control */}
      <Card className="bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5" />
            Earth View Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Earth Background:</span>
            <Button
              variant={showEarthBackground ? "default" : "outline"}
              size="sm"
              onClick={() => setShowEarthBackground(!showEarthBackground)}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              {showEarthBackground ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {!showEarthBackground && (
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-yellow-700">
                Enable Earth background for better geographic context of ground stations and satellites.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Duplicate Detection Summary */}
      <Card className="bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Duplicate Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-red-500">{totalDuplicates}</div>
              <div className="text-xs text-gray-500">Total Duplicates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{resolvedCount}</div>
              <div className="text-xs text-gray-500">Resolved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">{duplicateGroups.length}</div>
              <div className="text-xs text-gray-500">Groups</div>
            </div>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Only</option>
            </select>
          </div>

          {/* Global Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                duplicateGroups.forEach(group => {
                  if (group.severity === 'critical') {
                    resolveDuplicateGroup(group.groupId, 'remove_duplicates');
                  }
                });
              }}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-3 w-3" />
              Auto-Fix Critical
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // In real implementation, would refresh satellite data
                detectDuplicateSatellites();
              }}
              className="flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              Re-scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Duplicate Groups */}
      <div className="space-y-3">
        {filteredGroups.map(group => (
          <Card key={group.groupId} className={`bg-white/95 backdrop-blur-sm border-2 ${getSeverityColor(group.severity)}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm font-medium">{group.baseName}</CardTitle>
                  <div className="text-xs text-gray-500">
                    {group.satellites.length} duplicates found
                  </div>
                </div>
                <Badge variant={group.severity === 'critical' ? 'destructive' : 'default'}>
                  {group.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Satellite List */}
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {group.satellites.map(satellite => (
                  <div key={satellite.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <span>{getTypeIcon(satellite.type)}</span>
                      <div>
                        <div className="font-medium">{satellite.name}</div>
                        <div className="text-gray-500">
                          {satellite.position[0].toFixed(1)}°, {satellite.position[1].toFixed(1)}°
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{(satellite.confidence * 100).toFixed(0)}%</div>
                      <div className="text-gray-400">confidence</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Action */}
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-xs font-medium text-blue-700 mb-1">Recommended Action:</div>
                <div className="text-xs text-blue-600">
                  {group.recommendedAction === 'merge' && '🔄 Merge satellites into one'}
                  {group.recommendedAction === 'remove_duplicates' && '🗑️ Remove duplicate satellites'}
                  {group.recommendedAction === 'keep_all' && '✅ Keep all (different satellites)'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => resolveDuplicateGroup(group.groupId, 'remove_duplicates')}
                  className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-xs"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </Button>
                <Button
                  size="sm"
                  onClick={() => resolveDuplicateGroup(group.groupId, 'merge')}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-xs"
                >
                  <Merge className="h-3 w-3" />
                  Merge
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resolveDuplicateGroup(group.groupId, 'keep_all')}
                  className="flex items-center gap-1 text-xs"
                >
                  <Eye className="h-3 w-3" />
                  Keep All
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardContent className="text-center py-8">
            <div className="text-green-500 mb-2">✅</div>
            <div className="text-sm text-gray-600">
              {filterSeverity === 'all'
                ? 'No duplicates detected'
                : `No ${filterSeverity} severity duplicates found`
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-white/95 backdrop-blur-sm">
        <CardContent className="text-xs text-gray-600 space-y-2 pt-4">
          <div><strong>Duplicate Types:</strong></div>
          <div>🔴 Exact duplicate - Same name & position</div>
          <div>🟡 Near duplicate - Similar position</div>
          <div>🔵 Name duplicate - Same name, different position</div>
          <div>🟢 Position duplicate - Same position, different name</div>
        </CardContent>
      </Card>
    </div>
  );
}