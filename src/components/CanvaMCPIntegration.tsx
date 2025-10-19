import React, { useState, useEffect } from 'react';
import {
  Palette,
  Image,
  FileImage,
  Download,
  Share2,
  Wand2,
  Network,
  BarChart3,
  FileText,
  Presentation,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CanvaDesign {
  id: string;
  title: string;
  type: 'poster' | 'presentation' | 'infographic' | 'chart' | 'network';
  thumbnail_url: string;
  edit_url: string;
  export_url: string;
  created_at: string;
  data_source: 'academic_blockchain' | 'citation_network' | 'performance_metrics';
}

interface AcademicVisualizationRequest {
  type: 'citation_network' | 'research_timeline' | 'performance_chart' | 'poster' | 'presentation';
  paper_ids: string[];
  template_preference: 'academic' | 'conference' | 'journal' | 'poster';
  auto_generate: boolean;
}

interface CanvaMCPIntegrationProps {
  academicBlockchainData?: any;
  onDesignCreated?: (design: CanvaDesign) => void;
}

export const CanvaMCPIntegration: React.FC<CanvaMCPIntegrationProps> = ({
  academicBlockchainData,
  onDesignCreated
}) => {
  const [designs, setDesigns] = useState<CanvaDesign[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AcademicVisualizationRequest | null>(null);
  const [mcpStatus, setMcpStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  useEffect(() => {
    connectToCanvaMCP();
    loadExistingDesigns();
  }, []);

  const connectToCanvaMCP = async () => {
    setMcpStatus('connecting');
    try {
      // Connect to Canva MCP server
      const response = await fetch('http://localhost:3001/mcp/canva/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.REACT_APP_CANVA_API_KEY,
          team_id: process.env.REACT_APP_CANVA_TEAM_ID,
          integration_type: 'academic_blockchain'
        })
      });

      if (response.ok) {
        setIsConnected(true);
        setMcpStatus('connected');
      } else {
        setMcpStatus('error');
      }
    } catch (error) {
      console.error('Failed to connect to Canva MCP:', error);
      setMcpStatus('error');
    }
  };

  const loadExistingDesigns = async () => {
    try {
      const response = await fetch('http://localhost:3001/mcp/canva/designs', {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_CANVA_API_KEY}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDesigns(data.designs || []);
      }
    } catch (error) {
      console.error('Failed to load designs:', error);
    }
  };

  const generateAcademicVisualization = async (request: AcademicVisualizationRequest) => {
    setIsGenerating(true);
    setSelectedRequest(request);

    try {
      // Prepare data from Academic Blockchain
      const visualizationData = {
        type: request.type,
        academic_data: {
          papers: academicBlockchainData?.papers || [],
          citations: academicBlockchainData?.citations || [],
          performance_metrics: academicBlockchainData?.performance || {},
          blockchain_verification: academicBlockchainData?.blockchain_hashes || []
        },
        template_config: {
          style: request.template_preference,
          branding: 'ctas7_academic',
          color_scheme: 'professional_blue',
          include_blockchain_verification: true
        }
      };

      // Send to Canva MCP server for design generation
      const response = await fetch('http://localhost:3001/mcp/canva/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_CANVA_API_KEY}`
        },
        body: JSON.stringify({
          design_request: visualizationData,
          auto_publish: request.auto_generate,
          callback_url: 'http://localhost:3000/canva-webhook'
        })
      });

      if (response.ok) {
        const result = await response.json();
        const newDesign: CanvaDesign = {
          id: result.design_id,
          title: `Academic ${request.type} - ${new Date().toLocaleDateString()}`,
          type: request.type as any,
          thumbnail_url: result.thumbnail_url,
          edit_url: result.edit_url,
          export_url: result.export_url,
          created_at: new Date().toISOString(),
          data_source: 'academic_blockchain'
        };

        setDesigns(prev => [newDesign, ...prev]);
        onDesignCreated?.(newDesign);
      }
    } catch (error) {
      console.error('Failed to generate visualization:', error);
    } finally {
      setIsGenerating(false);
      setSelectedRequest(null);
    }
  };

  const exportDesign = async (designId: string, format: 'png' | 'pdf' | 'jpg') => {
    try {
      const response = await fetch(`http://localhost:3001/mcp/canva/export/${designId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_CANVA_API_KEY}`
        },
        body: JSON.stringify({
          format: format,
          quality: 'high',
          include_metadata: true
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `academic-visualization-${designId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export design:', error);
    }
  };

  const getStatusIcon = () => {
    switch (mcpStatus) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'connecting': return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'citation_network': return <Network className="w-5 h-5" />;
      case 'research_timeline': return <BarChart3 className="w-5 h-5" />;
      case 'performance_chart': return <BarChart3 className="w-5 h-5" />;
      case 'poster': return <FileImage className="w-5 h-5" />;
      case 'presentation': return <Presentation className="w-5 h-5" />;
      default: return <Image className="w-5 h-5" />;
    }
  };

  const visualizationTypes = [
    {
      type: 'citation_network' as const,
      title: 'Citation Network Graph',
      description: 'Visual network of paper citations and relationships',
      icon: Network
    },
    {
      type: 'research_timeline' as const,
      title: 'Research Timeline',
      description: 'Chronological visualization of research progress',
      icon: BarChart3
    },
    {
      type: 'performance_chart' as const,
      title: 'Performance Metrics',
      description: 'Charts showing system performance improvements',
      icon: BarChart3
    },
    {
      type: 'poster' as const,
      title: 'Academic Poster',
      description: 'Conference-ready research poster',
      icon: FileImage
    },
    {
      type: 'presentation' as const,
      title: 'Research Presentation',
      description: 'Slide deck for research presentations',
      icon: Presentation
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Palette className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-slate-100">Canva MCP Integration</h2>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-sm text-slate-300">
                {mcpStatus === 'connected' ? 'Connected' :
                 mcpStatus === 'connecting' ? 'Connecting...' :
                 mcpStatus === 'error' ? 'Connection Error' : 'Disconnected'}
              </span>
            </div>
          </div>

          <button
            onClick={connectToCanvaMCP}
            disabled={mcpStatus === 'connecting'}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white rounded-md transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${mcpStatus === 'connecting' ? 'animate-spin' : ''}`} />
            <span>Reconnect</span>
          </button>
        </div>

        <p className="text-slate-400 text-sm">
          Generate academic visualizations from your blockchain-verified research data using Canva's MCP server integration.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visualizationTypes.map((viz) => {
          const Icon = viz.icon;
          return (
            <div
              key={viz.type}
              className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:border-cyan-400/50 transition-colors cursor-pointer"
              onClick={() => generateAcademicVisualization({
                type: viz.type,
                paper_ids: academicBlockchainData?.papers?.map((p: any) => p.id) || [],
                template_preference: 'academic',
                auto_generate: true
              })}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-slate-100 font-medium">{viz.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{viz.description}</p>

                  {isGenerating && selectedRequest?.type === viz.type && (
                    <div className="flex items-center space-x-2 mt-2">
                      <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                      <span className="text-cyan-400 text-xs">Generating...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generated Designs */}
      {designs.length > 0 && (
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Generated Academic Visualizations</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {designs.map((design) => (
              <div key={design.id} className="bg-slate-600 rounded-lg p-4">
                <div className="aspect-video bg-slate-500 rounded mb-3 flex items-center justify-center">
                  {design.thumbnail_url ? (
                    <img
                      src={design.thumbnail_url}
                      alt={design.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="flex items-center justify-center">
                      {getTypeIcon(design.type)}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-slate-100 font-medium text-sm">{design.title}</h4>
                    <p className="text-slate-400 text-xs">{design.type.replace('_', ' ')}</p>
                    <p className="text-slate-400 text-xs">
                      Created: {new Date(design.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <a
                      href={design.edit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs text-center transition-colors"
                    >
                      Edit in Canva
                    </a>
                    <button
                      onClick={() => exportDesign(design.id, 'png')}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Command Integration */}
      <div className="bg-slate-800 border border-purple-400/20 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Wand2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-100">Voice Commands for Canva</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-slate-300 font-medium text-sm">Academic Visualization Commands:</p>
            <div className="space-y-1 text-xs text-slate-400">
              <p>• "Generate citation network for my blockchain papers"</p>
              <p>• "Create conference poster from current research"</p>
              <p>• "Make performance chart showing 9x improvement"</p>
              <p>• "Design research timeline visualization"</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-slate-300 font-medium text-sm">Export Commands:</p>
            <div className="space-y-1 text-xs text-slate-400">
              <p>• "Export latest poster as high-res PNG"</p>
              <p>• "Share citation network to presentation slides"</p>
              <p>• "Download all academic visualizations"</p>
              <p>• "Sync designs to Overleaf project"</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-purple-400/10 rounded border border-purple-400/20">
          <p className="text-purple-300 text-sm">
            <strong>Voice Integration:</strong> Say "Hey CTAS, create citation network" to automatically generate
            academic visualizations from your blockchain-verified research data.
          </p>
        </div>
      </div>
    </div>
  );
};