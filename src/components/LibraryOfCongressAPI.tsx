import React, { useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  BookOpen,
  FileText,
  Calendar,
  Users,
  MapPin,
  Search,
  Download,
  ExternalLink,
  Archive,
  Scale,
  Landmark,
  Flag,
  Camera,
  Music,
  Video,
  Image as ImageIcon,
  Newspaper,
  ScrollText
} from 'lucide-react';

interface LocItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  creators?: string[];
  subjects?: string[];
  formats?: string[];
  url: string;
  thumbnail?: string;
  collection?: string;
  location?: string;
  rights?: string;
  source: 'congress' | 'chronicling-america' | 'american-memory' | 'web-archives' | 'prints-photos';
}

interface LocCollection {
  id: string;
  title: string;
  description: string;
  items_count: number;
  url: string;
  subjects: string[];
  formats: string[];
}

interface SearchFilters {
  query: string;
  collection?: string;
  format?: string;
  subject?: string;
  dateStart?: string;
  dateEnd?: string;
  location?: string;
}

export const LibraryOfCongressAPI: React.FC = () => {
  const [items, setItems] = useState<LocItem[]>([]);
  const [collections, setCollections] = useState<LocCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: ''
  });
  const [selectedItem, setSelectedItem] = useState<LocItem | null>(null);
  const [activeAPI, setActiveAPI] = useState<'congress' | 'chronicling' | 'memory' | 'photos'>('congress');

  const API_ENDPOINTS = {
    congress: 'https://api.congress.gov/v3',
    libraryItems: 'https://www.loc.gov/collections',
    search: 'https://www.loc.gov/search',
    chronicling: 'https://chroniclingamerica.loc.gov/search/pages/results',
    photos: 'https://www.loc.gov/photos'
  };

  useEffect(() => {
    loadFeaturedCollections();
  }, []);

  const loadFeaturedCollections = async () => {
    setIsLoading(true);
    try {
      // Simulate featured collections from LoC
      const featuredCollections: LocCollection[] = [
        {
          id: 'american-memory',
          title: 'American Memory',
          description: 'Historical collections documenting American history and culture',
          items_count: 15000000,
          url: 'https://memory.loc.gov',
          subjects: ['History', 'Culture', 'Government', 'Technology'],
          formats: ['Photographs', 'Documents', 'Maps', 'Audio', 'Video']
        },
        {
          id: 'chronicling-america',
          title: 'Chronicling America',
          description: 'Historic American newspapers from 1777-1963',
          items_count: 16000000,
          url: 'https://chroniclingamerica.loc.gov',
          subjects: ['Newspapers', 'History', 'Local News', 'Politics'],
          formats: ['Newspaper Pages', 'OCR Text']
        },
        {
          id: 'congress-gov',
          title: 'Congress.gov',
          description: 'Legislative information from the U.S. Congress',
          items_count: 500000,
          url: 'https://congress.gov',
          subjects: ['Legislation', 'Congressional Records', 'Bills', 'Votes'],
          formats: ['Bills', 'Resolutions', 'Reports', 'Hearings']
        },
        {
          id: 'prints-photos',
          title: 'Prints and Photographs Division',
          description: 'Visual materials documenting American life and history',
          items_count: 14000000,
          url: 'https://www.loc.gov/pictures',
          subjects: ['Photography', 'Art', 'Architecture', 'Historical Events'],
          formats: ['Photographs', 'Prints', 'Drawings', 'Posters']
        },
        {
          id: 'web-archives',
          title: 'Web Archives',
          description: 'Archived websites of cultural and historical significance',
          items_count: 1000000,
          url: 'https://www.loc.gov/webarchiving',
          subjects: ['Digital Culture', 'Government Websites', 'Social Media'],
          formats: ['Web Pages', 'Social Media', 'Digital Documents']
        }
      ];

      setCollections(featuredCollections);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchItems = async () => {
    if (!searchFilters.query.trim()) return;

    setIsLoading(true);
    try {
      let searchResults: LocItem[] = [];

      switch (activeAPI) {
        case 'congress':
          searchResults = await searchCongressGov();
          break;
        case 'chronicling':
          searchResults = await searchChroniclingAmerica();
          break;
        case 'memory':
          searchResults = await searchAmericanMemory();
          break;
        case 'photos':
          searchResults = await searchPrintsPhotos();
          break;
      }

      setItems(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchCongressGov = async (): Promise<LocItem[]> => {
    // Simulate Congress.gov API search
    // In production, this would use the actual API with authentication
    return [
      {
        id: 'hr1234-117',
        title: `H.R.1234 - Cybersecurity Enhancement Act of 2023`,
        description: 'A bill to enhance cybersecurity measures for federal agencies and critical infrastructure.',
        date: '2023-03-15',
        creators: ['House Committee on Homeland Security'],
        subjects: ['Cybersecurity', 'Federal Agencies', 'Critical Infrastructure'],
        formats: ['Bill Text', 'Committee Report'],
        url: 'https://congress.gov/bill/117th-congress/house-bill/1234',
        collection: 'Congressional Bills',
        source: 'congress'
      },
      {
        id: 's567-117',
        title: 'S.567 - Artificial Intelligence Research and Development Act',
        description: 'Legislation promoting AI research and development in government applications.',
        date: '2023-02-20',
        creators: ['Senate Committee on Commerce, Science, and Transportation'],
        subjects: ['Artificial Intelligence', 'Research', 'Technology Policy'],
        formats: ['Bill Text', 'Senate Report'],
        url: 'https://congress.gov/bill/117th-congress/senate-bill/567',
        collection: 'Congressional Bills',
        source: 'congress'
      }
    ];
  };

  const searchChroniclingAmerica = async (): Promise<LocItem[]> => {
    // Simulate Chronicling America newspaper search
    return [
      {
        id: 'washington-post-1945-08-15',
        title: 'Victory in Japan Announced',
        description: 'Historic newspaper coverage of Japan\'s surrender ending World War II.',
        date: '1945-08-15',
        creators: ['The Washington Post'],
        subjects: ['World War II', 'Japan', 'Victory', 'History'],
        formats: ['Newspaper Page', 'OCR Text'],
        url: 'https://chroniclingamerica.loc.gov/lccn/sn83030313/1945-08-15/ed-1/seq-1/',
        collection: 'Chronicling America',
        location: 'Washington, D.C.',
        source: 'chronicling-america'
      }
    ];
  };

  const searchAmericanMemory = async (): Promise<LocItem[]> => {
    // Simulate American Memory collection search
    return [
      {
        id: 'coolidge-papers-001',
        title: 'Presidential Papers of Calvin Coolidge',
        description: 'Official correspondence and documents from the Coolidge administration.',
        date: '1923-1929',
        creators: ['Calvin Coolidge'],
        subjects: ['Presidents', 'Government', '1920s', 'Politics'],
        formats: ['Manuscripts', 'Letters', 'Official Documents'],
        url: 'https://memory.loc.gov/ammem/coolhtml/coolhome.html',
        collection: 'Presidential Papers',
        source: 'american-memory'
      }
    ];
  };

  const searchPrintsPhotos = async (): Promise<LocItem[]> => {
    // Simulate Prints & Photographs search
    return [
      {
        id: 'fsa-8b29516',
        title: 'Farm Security Administration Photographs',
        description: 'Depression-era photographs documenting rural American life.',
        date: '1935-1942',
        creators: ['Walker Evans', 'Dorothea Lange', 'Gordon Parks'],
        subjects: ['Great Depression', 'Rural Life', 'Photography', 'Social History'],
        formats: ['Photographs', 'Negatives'],
        url: 'https://www.loc.gov/pictures/collection/fsa/',
        collection: 'Farm Security Administration',
        thumbnail: 'https://tile.loc.gov/image-services/iiif/service:pnp:fsa:8b29000:8b29516/full/150,/0/default.jpg',
        source: 'prints-photos'
      }
    ];
  };

  const exportToAcademicBlockchain = async (item: LocItem) => {
    try {
      // Convert LoC item to Academic Blockchain format
      const academicData = {
        title: item.title,
        authors: item.creators || ['Library of Congress'],
        venue: `Library of Congress - ${item.collection}`,
        submissionDate: item.date || new Date().toISOString(),
        doi: null,
        overleafProjectId: null,
        paperId: `LOC_${item.id.toUpperCase()}`,
        source: 'library_of_congress',
        external_url: item.url,
        metadata: {
          collection: item.collection,
          subjects: item.subjects,
          formats: item.formats,
          location: item.location,
          rights: item.rights,
          description: item.description
        }
      };

      // Send to Academic Blockchain
      const response = await fetch('/api/academic-blockchain/import-external', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(academicData)
      });

      if (response.ok) {
        console.log('Successfully exported to Academic Blockchain:', item.title);
      }
    } catch (error) {
      console.error('Failed to export to Academic Blockchain:', error);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'congress': return <Landmark className="w-4 h-4" />;
      case 'chronicling-america': return <Newspaper className="w-4 h-4" />;
      case 'american-memory': return <Archive className="w-4 h-4" />;
      case 'prints-photos': return <Camera className="w-4 h-4" />;
      case 'web-archives': return <Globe className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getFormatIcon = (format: string) => {
    if (format.toLowerCase().includes('photo')) return <ImageIcon className="w-3 h-3" />;
    if (format.toLowerCase().includes('audio')) return <Music className="w-3 h-3" />;
    if (format.toLowerCase().includes('video')) return <Video className="w-3 h-3" />;
    if (format.toLowerCase().includes('newspaper')) return <Newspaper className="w-3 h-3" />;
    return <FileText className="w-3 h-3" />;
  };

  const apiOptions = [
    { id: 'congress', label: 'Congress.gov', icon: Landmark },
    { id: 'chronicling', label: 'Chronicling America', icon: Newspaper },
    { id: 'memory', label: 'American Memory', icon: Archive },
    { id: 'photos', label: 'Prints & Photos', icon: Camera }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-blue-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Building2 className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-slate-100">Library of Congress API</h2>
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-400/10 text-blue-400">
              <Flag className="w-3 h-3" />
              <span className="text-sm">Official U.S. Government Data</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-400">
              {collections.reduce((sum, col) => sum + col.items_count, 0).toLocaleString()} items available
            </span>
          </div>
        </div>

        <p className="text-slate-400 text-sm">
          Access millions of historical documents, photographs, newspapers, and legislative records from the
          U.S. Library of Congress for academic research and blockchain verification.
        </p>
      </div>

      {/* API Selection */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Data Sources</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {apiOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setActiveAPI(option.id as any)}
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                  activeAPI === option.id
                    ? 'border-blue-400 bg-blue-400/10 text-blue-400'
                    : 'border-slate-600 bg-slate-600 text-slate-300 hover:border-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Interface */}
      <div className="bg-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Search Government Archives</h3>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilters.query}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && searchItems()}
                placeholder={`Search ${apiOptions.find(opt => opt.id === activeAPI)?.label}...`}
                className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <button
              onClick={searchItems}
              disabled={isLoading || !searchFilters.query.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-md transition-colors"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={searchFilters.dateStart || ''}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, dateStart: e.target.value }))}
                  className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm focus:border-blue-400 focus:outline-none"
                />
                <input
                  type="date"
                  value={searchFilters.dateEnd || ''}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, dateEnd: e.target.value }))}
                  className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
              <select
                value={searchFilters.subject || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="">All Subjects</option>
                <option value="History">History</option>
                <option value="Government">Government</option>
                <option value="Politics">Politics</option>
                <option value="Technology">Technology</option>
                <option value="Culture">Culture</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Format</label>
              <select
                value={searchFilters.format || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, format: e.target.value }))}
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="">All Formats</option>
                <option value="Photographs">Photographs</option>
                <option value="Documents">Documents</option>
                <option value="Newspapers">Newspapers</option>
                <option value="Audio">Audio</option>
                <option value="Video">Video</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <input
                type="text"
                value={searchFilters.location || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State"
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {items.length > 0 && (
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Search Results ({items.length} items)
          </h3>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-slate-600 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getSourceIcon(item.source)}
                        <h4 className="text-slate-100 font-medium text-sm leading-tight">
                          {item.title}
                        </h4>
                      </div>

                      {item.description && (
                        <p className="text-slate-300 text-sm mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-slate-400 mb-2">
                        {item.date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.date}</span>
                          </div>
                        )}
                        {item.creators && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{item.creators.slice(0, 2).join(', ')}</span>
                          </div>
                        )}
                        {item.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>

                      {item.formats && item.formats.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.formats.slice(0, 3).map((format, index) => (
                            <span
                              key={index}
                              className="flex items-center space-x-1 bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded text-xs"
                            >
                              {getFormatIcon(format)}
                              <span>{format}</span>
                            </span>
                          ))}
                          {item.formats.length > 3 && (
                            <span className="text-slate-400 text-xs">+{item.formats.length - 3}</span>
                          )}
                        </div>
                      )}

                      {item.subjects && item.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.subjects.slice(0, 4).map((subject, index) => (
                            <span
                              key={index}
                              className="bg-slate-500 text-slate-300 px-2 py-0.5 rounded text-xs"
                            >
                              {subject}
                            </span>
                          ))}
                          {item.subjects.length > 4 && (
                            <span className="text-slate-400 text-xs">+{item.subjects.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Original</span>
                    </a>

                    <button
                      onClick={() => exportToAcademicBlockchain(item)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Add to Blockchain</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Collections */}
      <div className="bg-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Featured Collections</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <div key={collection.id} className="bg-slate-600 rounded-lg p-4">
              <h4 className="text-slate-100 font-medium mb-2">{collection.title}</h4>
              <p className="text-slate-300 text-sm mb-3 line-clamp-2">{collection.description}</p>

              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span>{collection.items_count.toLocaleString()} items</span>
                <span>{collection.formats.length} formats</span>
              </div>

              <div className="flex space-x-2">
                <a
                  href={collection.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs text-center transition-colors"
                >
                  Explore Collection
                </a>
                <button
                  onClick={() => setSearchFilters(prev => ({ ...prev, collection: collection.id }))}
                  className="px-3 py-2 bg-slate-500 hover:bg-slate-400 text-white rounded text-xs transition-colors"
                >
                  <Search className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-slate-800 border border-green-400/20 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Scale className="w-5 h-5 text-green-400" />
          <div>
            <h4 className="text-slate-100 font-medium">Government Data Integration</h4>
            <p className="text-slate-400 text-sm">
              All Library of Congress items can be automatically imported into your Academic Blockchain
              with full metadata preservation and government source verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};