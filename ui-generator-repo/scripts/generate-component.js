#!/usr/bin/env node

/**
 * Enhanced Component Generator for CTAS-7 shadcn/ui Components
 * Parses comments and generates components based on the shadcn specification
 */

const fs = require('fs');
const path = require('path');

// Component templates based on CTAS-7 shadcn specification
const componentTemplates = {
  AgentCard: {
    template: `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Agent {
  id: string;
  name: string;
  crate: string;
  ea_code: string;
  xsd_symbol: string;
  port: number;
  status: 'ONLINE' | 'STAGING' | 'RETROFIT-NEEDED';
  role: 'claude_sub_agent' | 'codex_sub_agent' | 'gpt_core_orchestrator';
}

interface AgentCardProps {
  agent: Agent;
  onHealthCheck?: (agent: Agent) => void;
  onConfigure?: (agent: Agent) => void;
  showPortInfo?: boolean;
  showXSDInfo?: boolean;
}

export function AgentCard({
  agent,
  onHealthCheck,
  onConfigure,
  showPortInfo = true,
  showXSDInfo = true
}: AgentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-500';
      case 'STAGING': return 'bg-yellow-500';
      case 'RETROFIT-NEEDED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'claude_sub_agent': return '🧠';
      case 'codex_sub_agent': return '🔧';
      case 'gpt_core_orchestrator': return '🎯';
      default: return '🤖';
    }
  };

  return (
    <Card className="w-full max-w-sm bg-gray-900 border-gray-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getRoleIcon(agent.role)} {agent.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={\`\${getStatusColor(agent.status)} text-white border-none\`}
          >
            {agent.status}
          </Badge>
          {showXSDInfo && (
            <span className="text-sm text-gray-400">{agent.xsd_symbol}</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-400">EA Code:</span>
            <div className="font-mono">{agent.ea_code}</div>
          </div>
          <div>
            <span className="text-gray-400">Crate:</span>
            <div className="font-mono text-xs">{agent.crate}</div>
          </div>
        </div>

        {showPortInfo && (
          <div className="text-sm">
            <span className="text-gray-400">Port:</span>
            <span className="ml-2 font-mono">{agent.port}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onHealthCheck?.(agent)}
            className="flex-1 text-xs"
          >
            Health
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onConfigure?.(agent)}
            className="flex-1 text-xs"
          >
            Config
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}`,
    dependencies: ['@/components/ui/card', '@/components/ui/badge', '@/components/ui/button']
  },

  Dashboard: {
    template: `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SystemMetrics {
  agentsOnline: number;
  agentsStaging: number;
  agentsRetrofit: number;
  deploymentSuccess: number;
  testPassRate: number;
}

interface DashboardProps {
  metrics: SystemMetrics;
  onQuickAction?: (action: string) => void;
}

export function Dashboard({ metrics, onQuickAction }: DashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-950 min-h-screen">
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-400">Online Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{metrics.agentsOnline}</div>
          <div className="text-gray-400 text-sm">Ready for deployment</div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-yellow-400">Staging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{metrics.agentsStaging}</div>
          <div className="text-gray-400 text-sm">In development</div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-red-400">Retrofit Needed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{metrics.agentsRetrofit}</div>
          <div className="text-gray-400 text-sm">Requires updates</div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-400">System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{metrics.testPassRate}%</div>
          <div className="text-gray-400 text-sm">Test pass rate</div>
        </CardContent>
      </Card>
    </div>
  );
}`,
    dependencies: ['@/components/ui/card']
  },

  PortManagement: {
    template: `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PortRange {
  name: string;
  start: number;
  end: number;
  description: string;
  assignedCount: number;
  availableCount: number;
}

interface PortManagementProps {
  portRanges: PortRange[];
  onAssignPort?: (port: number, agentId: string) => void;
}

export function PortManagement({ portRanges }: PortManagementProps) {
  return (
    <div className="space-y-4 p-6 bg-gray-950">
      <h2 className="text-2xl font-bold text-white">Port Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portRanges.map((range) => (
          <Card key={range.name} className="bg-gray-900 border-gray-700 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                {range.name}
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  {range.start}-{range.end}
                </Badge>
              </CardTitle>
              <div className="text-sm text-gray-400">{range.description}</div>
            </CardHeader>

            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-green-400 font-semibold">
                    {range.assignedCount} assigned
                  </div>
                  <div className="text-gray-400 text-sm">
                    {range.availableCount} available
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{
                        width: \`\${(range.assignedCount / (range.assignedCount + range.availableCount)) * 100}%\`
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}`,
    dependencies: ['@/components/ui/card', '@/components/ui/badge']
  }
};

function parseComment(commentBody) {
  // Extract component type from comment
  const componentTypes = Object.keys(componentTemplates);
  let detectedComponent = null;

  for (const type of componentTypes) {
    if (commentBody.toLowerCase().includes(type.toLowerCase())) {
      detectedComponent = type;
      break;
    }
  }

  // Default to Dashboard if no specific component detected
  return detectedComponent || 'Dashboard';
}

function generateComponent(componentType, outputDir) {
  const template = componentTemplates[componentType];
  if (!template) {
    throw new Error(`Unknown component type: ${componentType}`);
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write component file
  const filePath = path.join(outputDir, `${componentType}.tsx`);
  fs.writeFileSync(filePath, template.template);

  return {
    component: componentType,
    path: filePath,
    dependencies: template.dependencies
  };
}

// Main execution
function main() {
  const commentBody = process.env.COMMENT_BODY || process.argv[2] || '';
  const outputDir = process.env.OUTPUT_DIR || 'generated/components';

  console.log('Parsing comment for UI generation...');
  const componentType = parseComment(commentBody);

  console.log(`Generating ${componentType} component...`);
  const result = generateComponent(componentType, outputDir);

  console.log(`✅ Generated: ${result.path}`);
  console.log(`📦 Dependencies: ${result.dependencies.join(', ')}`);

  // Create manifest for GitHub Actions
  const manifest = {
    generated: new Date().toISOString(),
    comment: commentBody,
    result: result
  };

  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { parseComment, generateComponent, componentTemplates };