import React, { useState, useEffect } from 'react';
import {
  Database,
  Sync,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  ExternalLink,
  BookOpen,
  Users,
  Clock,
  Activity,
  Globe,
  Key,
  Filter,
  Search,
  Archive,
  FileText,
  Link as LinkIcon
} from 'lucide-react';

interface ZoteroConfig {
  apiKey: string;
  userId: string;
  libraryType: 'user' | 'group';
  libraryId: string;
  collections: string[];
  autoSync: boolean;
  syncInterval: number; // minutes
}

interface ZoteroLibraryStats {
  totalItems: number;
  recentItems: number;
  collections: number;
  attachments: number;
  lastSyncTime: Date;
  syncStatus: 'synced' | 'syncing' | 'error' | 'never';
  apiQuotaUsed: number;
  apiQuotaRemaining: number;
}

interface ZoteroItem {
  key: string;
  version: number;
  itemType: string;
  title: string;
  creators: Array<{
    creatorType: string;
    firstName?: string;
    lastName: string;
  }>;
  publicationTitle?: string;
  date?: string;
  DOI?: string;
  url?: string;
  abstractNote?: string;
  tags: Array<{ tag: string }>;
  dateAdded: string;
  dateModified: string;
  collections: string[];
  numChildren?: number;
}

export const ZoteroIntegrationPanel: React.FC = () => {
  const [config, setConfig] = useState<ZoteroConfig>({
    apiKey: '',
    userId: '',
    libraryType: 'user',
    libraryId: '',
    collections: [],
    autoSync: true,
    syncInterval: 30
  });

  const [stats, setStats] = useState<ZoteroLibraryStats>({
    totalItems: 0,
    recentItems: 0,
    collections: 0,
    attachments: 0,
    lastSyncTime: new Date(),
    syncStatus: 'never',
    apiQuotaUsed: 0,
    apiQuotaRemaining: 1000
  });

  const [recentItems, setRecentItems] = useState<ZoteroItem[]>([]);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showRecentItems, setShowRecentItems] = useState(true);

  // Load configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('zotero-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);

        // Load sample data for demonstration
        loadSampleData();
      } catch (error) {
        console.error('Failed to parse Zotero config:', error);
      }
    } else {
      loadSampleData();
    }
  }, []);

  const loadSampleData = () => {
    // Sample data for demonstration
    setStats({
      totalItems: 89,
      recentItems: 12,
      collections: 8,
      attachments: 156,
      lastSyncTime: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      syncStatus: 'synced',
      apiQuotaUsed: 234,
      apiQuotaRemaining: 766
    });

    setRecentItems([
      {
        key: 'ZOTERO_001',
        version: 1,
        itemType: 'journalArticle',
        title: 'Atomic Clipboard Intelligence: Enterprise Framework for Human-AI Code Quality',
        creators: [
          { creatorType: 'author', firstName: 'Charlie', lastName: 'Payne' }
        ],
        publicationTitle: 'CTAS-7 Research Division',
        date: '2025-01-24',
        DOI: '10.1000/ctas7.atomic.2025',
        abstractNote: 'Novel framework for preventing catastrophic failures in human-AI collaborative software development...',
        tags: [
          { tag: 'CTAS-7' },
          { tag: 'Atomic Clipboard' },
          { tag: 'AI Safety' },
          { tag: 'Blockchain Verified' }
        ],
        dateAdded: '2025-01-24T10:30:00Z',
        dateModified: '2025-01-24T15:45:00Z',
        collections: ['research-papers', 'ctas-publications'],
        numChildren: 2
      },
      {
        key: 'ZOTERO_002',
        version: 1,
        itemType: 'conferencePaper',
        title: 'Advanced Threat Intelligence Automation for Maritime Operations',
        creators: [
          { creatorType: 'author', firstName: 'Natasha', lastName: 'Volkov' }
        ],
        publicationTitle: 'IEEE MILCOM 2024',
        date: '2024-12-15',
        abstractNote: 'Automated threat intelligence gathering and analysis for maritime environments...',
        tags: [
          { tag: 'Threat Intelligence' },
          { tag: 'Maritime Security' },
          { tag: 'Automation' }
        ],
        dateAdded: '2024-12-15T14:22:00Z',
        dateModified: '2024-12-16T09:15:00Z',
        collections: ['cybersecurity', 'maritime-ops'],
        numChildren: 1
      }
    ]);
  };

  const saveConfiguration = () => {
    localStorage.setItem('zotero-config', JSON.stringify(config));
    setIsConfiguring(false);
  };

  const syncWithZotero = async () => {
    setIsSyncing(true);
    setSyncProgress(0);

    // Simulate sync progress
    const progressInterval = setInterval(() => {
      setSyncProgress(prev => {
        const newProgress = prev + 15;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setIsSyncing(false);
          setStats(prev => ({
            ...prev,
            lastSyncTime: new Date(),
            syncStatus: 'synced',
            totalItems: prev.totalItems + Math.floor(Math.random() * 3),
            recentItems: prev.recentItems + Math.floor(Math.random() * 2)
          }));
          return 100;
        }
        return newProgress;
      });
    }, 200);
  };

  const exportToBibTeX = () => {
    // Generate BibTeX for recent items
    const bibtex = recentItems.map(item => {
      const authors = item.creators
        .filter(c => c.creatorType === 'author')
        .map(c => `${c.lastName}, ${c.firstName || ''}`)
        .join(' and ');

      return `@article{${item.key},
  title={${item.title}},
  author={${authors}},
  journal={${item.publicationTitle || ''}},
  year={${item.date?.split('-')[0] || ''}},
  doi={${item.DOI || ''}},
  note={Zotero Key: ${item.key}}
}`;
    }).join('\n\n');

    // Create download
    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ctas7-research.bib';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSyncStatusIcon = () => {
    switch (stats.syncStatus) {
      case 'synced':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'syncing':
        return <RefreshCw size={16} className="text-blue-400 animate-spin" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-400" />;
      default:
        return <AlertCircle size={16} className="text-yellow-400" />;
    }
  };

  const getQuotaColor = () => {
    const percentUsed = (stats.apiQuotaUsed / (stats.apiQuotaUsed + stats.apiQuotaRemaining)) * 100;
    if (percentUsed > 80) return 'text-red-400';
    if (percentUsed > 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-4">

      {/* Main Zotero Panel */}
      <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-lg p-4 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Database className="text-cyan-400" size={20} />
            <h3 className="font-semibold text-slate-200">Zotero Integration</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsConfiguring(!isConfiguring)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={syncWithZotero}
              disabled={isSyncing}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded text-sm transition-colors"
            >
              {isSyncing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Sync size={14} />
                  Sync
                </>
              )}
            </button>
          </div>
        </div>

        {/* Configuration Panel */}
        {isConfiguring && (
          <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
            <h4 className="font-medium text-slate-200 mb-3">Zotero Configuration</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-400">API Key</label>
                  <input
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-slate-100 text-sm focus:border-blue-400"
                    placeholder="Enter Zotero API key"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">User ID</label>
                  <input
                    type="text"
                    value={config.userId}
                    onChange={(e) => setConfig(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-slate-100 text-sm focus:border-blue-400"
                    placeholder="Your Zotero user ID"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-400">Library Type</label>
                  <select
                    value={config.libraryType}
                    onChange={(e) => setConfig(prev => ({ ...prev, libraryType: e.target.value as 'user' | 'group' }))}
                    className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-slate-100 text-sm focus:border-blue-400"
                  >
                    <option value="user">Personal Library</option>
                    <option value="group">Group Library</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Sync Interval (minutes)</label>
                  <input
                    type="number"
                    value={config.syncInterval}
                    onChange={(e) => setConfig(prev => ({ ...prev, syncInterval: parseInt(e.target.value) || 30 }))}
                    className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-slate-100 text-sm focus:border-blue-400"
                    min="5"
                    max="1440"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsConfiguring(false)}
                  className="px-3 py-1 text-slate-400 hover:text-slate-200 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveConfiguration}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                >
                  Save Config
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sync Progress */}
        {isSyncing && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-slate-400 mb-1">
              <span>Syncing with Zotero...</span>
              <span>{syncProgress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-cyan-400">{stats.totalItems}</div>
            <div className="text-xs text-slate-400">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{stats.collections}</div>
            <div className="text-xs text-slate-400">Collections</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">{stats.attachments}</div>
            <div className="text-xs text-slate-400">Attachments</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">{stats.recentItems}</div>
            <div className="text-xs text-slate-400">Recent</div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-sm border-t border-slate-700 pt-3">
          <div className="flex items-center gap-2">
            {getSyncStatusIcon()}
            <span className="text-slate-400">
              Last sync: {formatTimeAgo(stats.lastSyncTime)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1 ${getQuotaColor()}`}>
              <Activity size={14} />
              <span className="text-xs">
                {stats.apiQuotaUsed}/{stats.apiQuotaUsed + stats.apiQuotaRemaining} API calls
              </span>
            </div>

            <button
              onClick={exportToBibTeX}
              className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors"
            >
              <Download size={12} />
              Export BibTeX
            </button>
          </div>
        </div>
      </div>

      {/* Recent Items */}
      {showRecentItems && (
        <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-lg p-4 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-slate-200">Recent Zotero Items</h4>
            <button
              onClick={() => setShowRecentItems(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Archive size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {recentItems.map((item) => (
              <div
                key={item.key}
                className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-slate-100 text-sm line-clamp-2 flex-1 mr-3">
                    {item.title}
                  </h5>
                  <div className="flex items-center gap-2">
                    {item.DOI && (
                      <a
                        href={`https://doi.org/${item.DOI}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                        title="View DOI"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {item.numChildren && item.numChildren > 0 && (
                      <span className="text-xs text-slate-400" title="Has attachments">
                        📎 {item.numChildren}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-400 mb-2">
                  {item.creators
                    .filter(c => c.creatorType === 'author')
                    .map(c => `${c.firstName || ''} ${c.lastName}`)
                    .join(', ')}
                </div>

                {item.abstractNote && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                    {item.abstractNote}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-700 text-xs text-slate-300 rounded"
                      >
                        {tag.tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 bg-slate-700 text-xs text-slate-400 rounded">
                        +{item.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500">
                    {new Date(item.dateAdded).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-center">
            <a
              href="https://www.zotero.org/cp5337/library"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Globe size={14} />
              View Full Library
            </a>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-lg p-4 border border-slate-700/50 backdrop-blur-sm">
        <h4 className="font-medium text-slate-200 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center gap-2 p-2 bg-slate-700/50 hover:bg-slate-700 rounded text-sm text-slate-300 transition-colors">
            <Upload size={14} />
            Import Papers
          </button>
          <button className="flex items-center gap-2 p-2 bg-slate-700/50 hover:bg-slate-700 rounded text-sm text-slate-300 transition-colors">
            <BookOpen size={14} />
            Create Collection
          </button>
          <button className="flex items-center gap-2 p-2 bg-slate-700/50 hover:bg-slate-700 rounded text-sm text-slate-300 transition-colors">
            <Users size={14} />
            Share Library
          </button>
          <button className="flex items-center gap-2 p-2 bg-slate-700/50 hover:bg-slate-700 rounded text-sm text-slate-300 transition-colors">
            <LinkIcon size={14} />
            Generate Links
          </button>
        </div>
      </div>
    </div>
  );
};