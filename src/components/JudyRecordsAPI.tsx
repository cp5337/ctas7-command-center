import React, { useState, useEffect } from 'react';
import {
  Scale,
  Search,
  Database,
  Clock,
  MapPin,
  User,
  FileText,
  Gavel,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Filter,
  Download,
  Eye
} from 'lucide-react';

interface JudyCase {
  case_id: string;
  case_number: string;
  case_title: string;
  court_name: string;
  court_type: 'federal' | 'state' | 'local';
  jurisdiction: string;
  filing_date: string;
  case_type: string;
  case_status: string;
  parties: {
    plaintiff: string[];
    defendant: string[];
  };
  docket_entries: number;
  last_activity: string;
  estimated_value?: string;
  attorneys: {
    name: string;
    firm: string;
    type: 'plaintiff' | 'defendant' | 'court_appointed';
  }[];
  keywords_matched: string[];
  usim_classification: string;
}

interface JudySearchParams {
  keywords: string[];
  jurisdictions: string[];
  case_types: string[];
  date_range: {
    start: string;
    end: string;
  };
  court_levels: string[];
  real_time: boolean;
}

interface JudyRecordsAPIProps {
  onCaseFound?: (case_data: JudyCase) => void;
  watchKeywords?: string[];
}

export const JudyRecordsAPI: React.FC<JudyRecordsAPIProps> = ({
  onCaseFound,
  watchKeywords = ['cyber', 'cartel', 'terrorism', 'corruption', 'national security']
}) => {
  const [apiStatus, setApiStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [searchResults, setSearchResults] = useState<JudyCase[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState<JudySearchParams>({
    keywords: watchKeywords,
    jurisdictions: ['federal', 'state'],
    case_types: ['criminal', 'civil', 'administrative'],
    date_range: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    court_levels: ['district', 'circuit', 'supreme', 'state_supreme'],
    real_time: true
  });
  const [statistics, setStatistics] = useState({
    total_cases_scanned: 0,
    keyword_matches: 0,
    unique_courts: 0,
    federal_cases: 0,
    state_cases: 0,
    recent_activity: 0
  });

  useEffect(() => {
    connectToJudyRecords();
    if (searchParams.real_time) {
      startRealTimeMonitoring();
    }
  }, []);

  const connectToJudyRecords = async () => {
    setApiStatus('connecting');
    try {
      const response = await fetch('http://localhost:3001/api/judyrecords/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.REACT_APP_JUDY_RECORDS_API_KEY,
          contact_email: 'research@ctas7.dev',
          use_case: 'academic_research_court_monitoring',
          rate_limit_tier: 'professional'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setApiStatus('connected');
        setStatistics(prev => ({
          ...prev,
          total_cases_scanned: data.total_available_cases || 750000000
        }));
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      console.error('Failed to connect to JudyRecords API:', error);
      setApiStatus('error');
    }
  };

  const startRealTimeMonitoring = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/judyrecords/monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monitoring_config: {
            keywords: searchParams.keywords,
            jurisdictions: searchParams.jurisdictions,
            poll_interval_minutes: 5,
            max_results_per_poll: 100,
            notification_threshold: 'immediate',
            ephemeral_storage: true,
            ttl_hours: 24
          }
        })
      });

      if (response.ok) {
        // Set up Server-Sent Events for real-time updates
        const eventSource = new EventSource('http://localhost:3001/api/judyrecords/stream');

        eventSource.onmessage = (event) => {
          const caseData = JSON.parse(event.data);
          handleNewCase(caseData);
        };

        eventSource.onerror = () => {
          console.error('JudyRecords stream error');
        };
      }
    } catch (error) {
      console.error('Failed to start real-time monitoring:', error);
    }
  };

  const handleNewCase = (rawData: any) => {
    const judyCase: JudyCase = {
      case_id: rawData.case_id,
      case_number: rawData.case_number,
      case_title: rawData.case_title,
      court_name: rawData.court_name,
      court_type: determineCourtType(rawData.court_name),
      jurisdiction: rawData.jurisdiction,
      filing_date: rawData.filing_date,
      case_type: rawData.case_type,
      case_status: rawData.case_status,
      parties: {
        plaintiff: rawData.parties?.plaintiff || [],
        defendant: rawData.parties?.defendant || []
      },
      docket_entries: rawData.docket_entries || 0,
      last_activity: rawData.last_activity,
      estimated_value: rawData.estimated_value,
      attorneys: rawData.attorneys || [],
      keywords_matched: rawData.keywords_matched || [],
      usim_classification: generateUSIMClassification(rawData)
    };

    setSearchResults(prev => [judyCase, ...prev.slice(0, 19)]);
    updateStatistics(judyCase);
    onCaseFound?.(judyCase);
  };

  const determineCourtType = (courtName: string): 'federal' | 'state' | 'local' => {
    if (courtName.includes('U.S.') || courtName.includes('Federal') || courtName.includes('Supreme Court of the United States')) {
      return 'federal';
    } else if (courtName.includes('County') || courtName.includes('Municipal') || courtName.includes('City')) {
      return 'local';
    }
    return 'state';
  };

  const generateUSIMClassification = (rawData: any): string => {
    const priorities = {
      'terrorism': 'PRIORITY_1_NATIONAL_SECURITY',
      'cyber': 'PRIORITY_2_CYBER_THREAT',
      'cartel': 'PRIORITY_2_ORGANIZED_CRIME',
      'corruption': 'PRIORITY_3_GOVERNMENT_INTEGRITY',
      'national security': 'PRIORITY_1_NATIONAL_SECURITY'
    };

    for (const [keyword, classification] of Object.entries(priorities)) {
      if (rawData.keywords_matched?.some((k: string) => k.toLowerCase().includes(keyword))) {
        return classification;
      }
    }

    return 'STANDARD_MONITORING';
  };

  const updateStatistics = (newCase: JudyCase) => {
    setStatistics(prev => ({
      total_cases_scanned: prev.total_cases_scanned + 1,
      keyword_matches: prev.keyword_matches + newCase.keywords_matched.length,
      unique_courts: prev.unique_courts + (searchResults.some(c => c.court_name === newCase.court_name) ? 0 : 1),
      federal_cases: prev.federal_cases + (newCase.court_type === 'federal' ? 1 : 0),
      state_cases: prev.state_cases + (newCase.court_type === 'state' ? 1 : 0),
      recent_activity: prev.recent_activity + 1
    }));
  };

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch('http://localhost:3001/api/judyrecords/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_parameters: searchParams,
          response_format: 'structured',
          include_docket: false,
          include_parties: true,
          include_attorneys: true,
          max_results: 500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const cases = data.cases.map((c: any) => ({
          ...c,
          usim_classification: generateUSIMClassification(c)
        }));
        setSearchResults(cases);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const exportToEphemeralStorage = async (judyCase: JudyCase) => {
    try {
      await fetch('http://localhost:3001/ephemeral/judy/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_data: judyCase,
          ttl_hours: 24,
          auto_cleanup: true,
          notification_channels: ['slack', 'ios']
        })
      });
    } catch (error) {
      console.error('Failed to export to ephemeral storage:', error);
    }
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'connecting': return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCourtTypeColor = (type: string) => {
    switch (type) {
      case 'federal': return 'bg-red-600';
      case 'state': return 'bg-blue-600';
      case 'local': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getPriorityColor = (classification: string) => {
    if (classification.includes('PRIORITY_1')) return 'text-red-400';
    if (classification.includes('PRIORITY_2')) return 'text-orange-400';
    if (classification.includes('PRIORITY_3')) return 'text-yellow-400';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Scale className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-slate-100">JudyRecords API Integration</h2>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-sm text-slate-300">
                {apiStatus === 'connected' ? 'Connected' :
                 apiStatus === 'connecting' ? 'Connecting...' :
                 apiStatus === 'error' ? 'Connection Error' : 'Disconnected'}
              </span>
            </div>
          </div>

          <button
            onClick={performSearch}
            disabled={isSearching}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white rounded-md transition-colors"
          >
            <Search className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'Searching...' : 'Search'}</span>
          </button>
        </div>

        <p className="text-slate-400 text-sm">
          Access to 750M+ US court cases with real-time monitoring and ephemeral storage for CTAS-7 threat intelligence.
        </p>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{statistics.total_cases_scanned.toLocaleString()}</div>
          <div className="text-slate-400 text-sm">Total Cases</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{statistics.keyword_matches}</div>
          <div className="text-slate-400 text-sm">Keyword Hits</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{statistics.unique_courts}</div>
          <div className="text-slate-400 text-sm">Courts</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{statistics.federal_cases}</div>
          <div className="text-slate-400 text-sm">Federal</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{statistics.state_cases}</div>
          <div className="text-slate-400 text-sm">State</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{statistics.recent_activity}</div>
          <div className="text-slate-400 text-sm">Recent</div>
        </div>
      </div>

      {/* Search Configuration */}
      <div className="bg-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Search Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Keywords</label>
            <div className="flex flex-wrap gap-2">
              {searchParams.keywords.map((keyword, index) => (
                <span key={index} className="bg-cyan-600 px-2 py-1 rounded text-xs text-white">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Jurisdictions</label>
            <div className="flex flex-wrap gap-2">
              {searchParams.jurisdictions.map((jurisdiction, index) => (
                <span key={index} className="bg-blue-600 px-2 py-1 rounded text-xs text-white">
                  {jurisdiction}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Case Types</label>
            <div className="flex flex-wrap gap-2">
              {searchParams.case_types.map((type, index) => (
                <span key={index} className="bg-green-600 px-2 py-1 rounded text-xs text-white">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Recent Case Matches</h3>
          <div className="space-y-4">
            {searchResults.map((judyCase) => (
              <div key={judyCase.case_id} className="bg-slate-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs text-white ${getCourtTypeColor(judyCase.court_type)}`}>
                        {judyCase.court_type}
                      </span>
                      <span className="text-slate-400 text-sm">{judyCase.case_number}</span>
                      <span className={`text-sm font-medium ${getPriorityColor(judyCase.usim_classification)}`}>
                        {judyCase.usim_classification.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className="text-slate-100 font-medium mb-1">{judyCase.case_title}</h4>
                    <p className="text-slate-300 text-sm mb-2">{judyCase.court_name}</p>
                    <div className="flex items-center space-x-4 text-slate-400 text-xs">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Filed: {new Date(judyCase.filing_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>{judyCase.docket_entries} entries</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{judyCase.jurisdiction}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => exportToEphemeralStorage(judyCase)}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Keywords Matched */}
                {judyCase.keywords_matched.length > 0 && (
                  <div className="mb-3">
                    <span className="text-slate-400 text-xs">Keywords: </span>
                    {judyCase.keywords_matched.map((keyword, index) => (
                      <span key={index} className="bg-orange-600 px-2 py-1 rounded text-xs text-white mr-2">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}

                {/* Parties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Plaintiff(s): </span>
                    <span className="text-slate-300">{judyCase.parties.plaintiff.join(', ') || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Defendant(s): </span>
                    <span className="text-slate-300">{judyCase.parties.defendant.join(', ') || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Status */}
      <div className="bg-slate-800 border border-purple-400/20 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-100">Integration Status</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">750M+</div>
            <div className="text-slate-400 text-sm">Available Cases</div>
            <div className="text-slate-500 text-xs">JudyRecords Database</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-cyan-400">Real-time</div>
            <div className="text-slate-400 text-sm">Monitoring Active</div>
            <div className="text-slate-500 text-xs">5-minute polls</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-400">24h TTL</div>
            <div className="text-slate-400 text-sm">Ephemeral Storage</div>
            <div className="text-slate-500 text-xs">Auto-cleanup</div>
          </div>
        </div>
      </div>
    </div>
  );
};