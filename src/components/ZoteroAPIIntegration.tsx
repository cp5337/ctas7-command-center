import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Database,
  Download,
  Upload,
  Sync,
  Users,
  Key,
  Globe,
  FileText,
  Link,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Plus,
  Search,
  Filter,
  Archive
} from 'lucide-react';

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
  abstractNote?: string;
  publicationTitle?: string;
  date?: string;
  DOI?: string;
  url?: string;
  tags: Array<{
    tag: string;
    type?: number;
  }>;
  collections: string[];
  relations: Record<string, any>;
  dateAdded: string;
  dateModified: string;
}

interface ZoteroCollection {
  key: string;
  version: number;
  name: string;
  parentCollection?: string;
  relations: Record<string, any>;
}

interface ZoteroGroup {
  id: number;
  version: number;
  name: string;
  description: string;
  url: string;
  type: 'Private' | 'PublicOpen' | 'PublicClosed';
  libraryEditing: 'members' | 'admins';
  fileEditing: 'none' | 'members' | 'admins';
}

interface ZoteroConfig {
  userId?: string;
  apiKey: string;
  selectedLibrary: 'user' | 'group';
  selectedGroupId?: number;
  autoSync: boolean;
  syncInterval: number; // minutes
  exportFormat: 'bibtex' | 'ris' | 'json' | 'csl-json';
}

export const ZoteroAPIIntegration: React.FC = () => {
  const [config, setConfig] = useState<ZoteroConfig>({
    userId: '',
    apiKey: '',
    selectedLibrary: 'user',
    autoSync: true,
    syncInterval: 15,
    exportFormat: 'bibtex'
  });

  const [items, setItems] = useState<ZoteroItem[]>([]);
  const [collections, setCollections] = useState<ZoteroCollection[]>([]);
  const [groups, setGroups] = useState<ZoteroGroup[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (config.apiKey) {
      connectToZotero();
    }
  }, [config.apiKey]);

  useEffect(() => {
    if (isConnected && config.autoSync) {
      const interval = setInterval(() => {
        syncWithAcademicBlockchain();
      }, config.syncInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [isConnected, config.autoSync, config.syncInterval]);

  const connectToZotero = async () => {
    if (!config.apiKey) return;

    setIsLoading(true);
    try {
      // Test API connection by getting user info
      const userResponse = await fetch('https://api.zotero.org/keys/current', {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Zotero-API-Version': '3'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setConfig(prev => ({ ...prev, userId: userData.userID }));
        setIsConnected(true);

        // Load user's groups
        await loadGroups();

        // Load initial data
        await loadCollections();
        await loadItems();
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      console.error('Failed to connect to Zotero:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroups = async () => {
    if (!config.userId || !config.apiKey) return;

    try {
      const response = await fetch(`https://api.zotero.org/users/${config.userId}/groups`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Zotero-API-Version': '3'
        }
      });

      if (response.ok) {
        const groupsData = await response.json();
        setGroups(groupsData);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const loadCollections = async () => {
    if (!config.apiKey) return;

    try {
      const libraryPath = config.selectedLibrary === 'user'
        ? `users/${config.userId}`
        : `groups/${config.selectedGroupId}`;

      const response = await fetch(`https://api.zotero.org/${libraryPath}/collections`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Zotero-API-Version': '3'
        }
      });

      if (response.ok) {
        const collectionsData = await response.json();
        setCollections(collectionsData.map((item: any) => item.data));
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const loadItems = async (collectionKey?: string) => {
    if (!config.apiKey) return;

    setIsLoading(true);
    try {
      const libraryPath = config.selectedLibrary === 'user'
        ? `users/${config.userId}`
        : `groups/${config.selectedGroupId}`;

      let url = `https://api.zotero.org/${libraryPath}/items`;

      const params = new URLSearchParams({
        'format': 'json',
        'include': 'data,meta',
        'limit': '100'
      });

      if (collectionKey) {
        params.append('collectionKey', collectionKey);
      }

      if (searchTerm) {
        params.append('q', searchTerm);
      }

      url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Zotero-API-Version': '3'
        }
      });

      if (response.ok) {
        const itemsData = await response.json();
        setItems(itemsData.map((item: any) => item.data));
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createItemFromAcademicBlockchain = async (paperData: any) => {
    if (!config.apiKey) return;

    try {
      const libraryPath = config.selectedLibrary === 'user'
        ? `users/${config.userId}`
        : `groups/${config.selectedGroupId}`;

      const zoteroItem = {
        itemType: getZoteroItemType(paperData.venue),
        title: paperData.title,
        creators: paperData.authors.map((author: string) => ({
          creatorType: 'author',
          lastName: author.split(' ').pop(),
          firstName: author.split(' ').slice(0, -1).join(' ')
        })),
        publicationTitle: paperData.venue,
        date: paperData.submissionDate,
        DOI: paperData.doi,
        url: paperData.overleafProjectId ? `https://overleaf.com/project/${paperData.overleafProjectId}` : undefined,
        abstractNote: `CTAS-7 Academic Blockchain Paper\nPaper ID: ${paperData.paperId}\nBlockchain Hash: ${paperData.blockchainHash}\nUSIM CUID: ${paperData.usimCuid}`,
        tags: [
          { tag: 'CTAS-7' },
          { tag: 'Academic Blockchain' },
          { tag: 'Research Publication' },
          { tag: 'Blockchain Verified' }
        ],
        extra: `CTAS-7 Integration Data:\nPaper ID: ${paperData.paperId}\nBlockchain Hash: ${paperData.blockchainHash}\nMining Nonce: ${paperData.nonce}\nValidation Status: ${paperData.isValid ? 'VERIFIED' : 'INVALID'}`
      };

      const response = await fetch(`https://api.zotero.org/${libraryPath}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Zotero-API-Version': '3',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([zoteroItem])
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Successfully created Zotero item:', result);
        await loadItems(); // Refresh the list
        return result;
      }
    } catch (error) {
      console.error('Failed to create Zotero item:', error);
    }
  };

  const syncWithAcademicBlockchain = async () => {
    setSyncStatus('syncing');
    try {
      // Get papers from Academic Blockchain
      const blockchainResponse = await fetch('/api/academic-blockchain/papers');
      if (blockchainResponse.ok) {
        const papers = await blockchainResponse.json();

        for (const paper of papers) {
          // Check if item already exists in Zotero
          const existingItem = items.find(item =>
            item.abstractNote?.includes(paper.paperId)
          );

          if (!existingItem) {
            await createItemFromAcademicBlockchain(paper);
          }
        }
      }

      setLastSync(new Date());
      setSyncStatus('success');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }

    // Reset status after 3 seconds
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const exportBibliography = async (format: string = config.exportFormat) => {
    if (!config.apiKey) return;

    try {
      const libraryPath = config.selectedLibrary === 'user'
        ? `users/${config.userId}`
        : `groups/${config.selectedGroupId}`;

      const itemKeys = items.map(item => item.key).join(',');

      const response = await fetch(`https://api.zotero.org/${libraryPath}/items`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Zotero-API-Version': '3',
          'format': format === 'bibtex' ? 'bibtex' : format,
          'itemKey': itemKeys
        }
      });

      if (response.ok) {
        const bibliography = await response.text();

        // Download as file
        const blob = new Blob([bibliography], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ctas7-bibliography.${format === 'bibtex' ? 'bib' : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export bibliography:', error);
    }
  };

  const getZoteroItemType = (venue: string): string => {
    if (venue.toLowerCase().includes('conference')) return 'conferencePaper';
    if (venue.toLowerCase().includes('journal')) return 'journalArticle';
    if (venue.toLowerCase().includes('workshop')) return 'conferencePaper';
    if (venue.toLowerCase().includes('symposium')) return 'conferencePaper';
    return 'journalArticle'; // default
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'journalArticle': return <FileText className="w-4 h-4" />;
      case 'conferencePaper': return <Users className="w-4 h-4" />;
      case 'book': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Database className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-orange-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-semibold text-slate-100">Zotero API Integration</h2>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isConnected ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={syncWithAcademicBlockchain}
              disabled={!isConnected || syncStatus === 'syncing'}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-md transition-colors"
            >
              {getSyncStatusIcon()}
              <span>Sync Blockchain</span>
            </button>
            <button
              onClick={() => exportBibliography()}
              disabled={!isConnected}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Configuration */}
        {!isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Zotero API Key
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your Zotero API key"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:border-orange-400 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                Get your API key from <a href="https://www.zotero.org/settings/keys" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Zotero Settings</a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Library Type
              </label>
              <select
                value={config.selectedLibrary}
                onChange={(e) => setConfig(prev => ({ ...prev, selectedLibrary: e.target.value as 'user' | 'group' }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:border-orange-400 focus:outline-none"
              >
                <option value="user">Personal Library</option>
                <option value="group">Group Library</option>
              </select>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center space-x-4">
              <span>User ID: {config.userId}</span>
              <span>Items: {items.length}</span>
              <span>Collections: {collections.length}</span>
              {lastSync && (
                <span>Last Sync: {lastSync.toLocaleTimeString()}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span>Auto-sync:</span>
              <button
                onClick={() => setConfig(prev => ({ ...prev, autoSync: !prev.autoSync }))}
                className={`w-10 h-5 rounded-full transition-colors ${
                  config.autoSync ? 'bg-orange-600' : 'bg-slate-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  config.autoSync ? 'translate-x-5' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
          </div>
        )}
      </div>

      {isConnected && (
        <>
          {/* Search and Filters */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadItems(selectedCollection)}
                  placeholder="Search Zotero library..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 focus:border-orange-400 focus:outline-none"
                />
              </div>

              <select
                value={selectedCollection}
                onChange={(e) => {
                  setSelectedCollection(e.target.value);
                  loadItems(e.target.value || undefined);
                }}
                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 focus:border-orange-400 focus:outline-none"
              >
                <option value="">All Collections</option>
                {collections.map((collection) => (
                  <option key={collection.key} value={collection.key}>
                    {collection.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => loadItems(selectedCollection)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Library Items</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">{items.length} items</span>
                {isLoading && <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />}
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={item.key} className="bg-slate-600 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getItemIcon(item.itemType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-slate-100 font-medium text-sm leading-tight">
                          {item.title}
                        </h4>
                        {item.creators.length > 0 && (
                          <p className="text-slate-300 text-sm mt-1">
                            {item.creators.map(c => `${c.firstName || ''} ${c.lastName}`).join(', ')}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
                          <span>{item.itemType}</span>
                          {item.publicationTitle && <span>{item.publicationTitle}</span>}
                          {item.date && <span>{item.date}</span>}
                          {item.DOI && (
                            <a
                              href={`https://doi.org/${item.DOI}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-orange-400 hover:underline"
                            >
                              <Link className="w-3 h-3" />
                              <span>DOI</span>
                            </a>
                          )}
                        </div>
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.slice(0, 5).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-orange-400/10 text-orange-400 px-2 py-0.5 rounded text-xs"
                              >
                                {tag.tag}
                              </span>
                            ))}
                            {item.tags.length > 5 && (
                              <span className="text-slate-400 text-xs">+{item.tags.length - 5}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => exportBibliography('bibtex')}
              className="flex items-center justify-center space-x-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>Export BibTeX</span>
            </button>

            <button
              onClick={() => exportBibliography('ris')}
              className="flex items-center justify-center space-x-2 p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Archive className="w-5 h-5" />
              <span>Export RIS</span>
            </button>

            <button
              onClick={syncWithAcademicBlockchain}
              className="flex items-center justify-center space-x-2 p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <Sync className="w-5 h-5" />
              <span>Sync with Blockchain</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};