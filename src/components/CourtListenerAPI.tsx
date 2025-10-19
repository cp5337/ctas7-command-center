import React, { useState, useEffect } from 'react';
import {
  Scale,
  Gavel,
  FileText,
  Calendar,
  MapPin,
  Users,
  Search,
  Download,
  ExternalLink,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive,
  BookOpen,
  ScrollText,
  Eye
} from 'lucide-react';

interface CourtOpinion {
  id: number;
  resource_uri: string;
  absolute_url: string;
  cluster: string;
  author: string | null;
  per_curiam: boolean;
  joined_by: string[];
  type: 'Lead Opinion' | 'Concurrence' | 'Dissent';
  sha1: string;
  page_count: number;
  download_url: string;
  local_path: string;
  plain_text: string;
  html: string;
  html_lawbox: string;
  html_columbia: string;
  html_anon_2020: string;
  xml_harvard: string;
  html_with_citations: string;
  extracted_by_ocr: boolean;
  date_created: string;
  date_modified: string;
}

interface OpinionCluster {
  id: number;
  resource_uri: string;
  absolute_url: string;
  panel: string[];
  non_participating_judges: string[];
  case_name: string;
  case_name_short: string;
  case_name_full: string;
  scdb_id: string;
  scdb_decision_direction: number | null;
  scdb_votes_majority: number | null;
  scdb_votes_minority: number | null;
  source: string;
  procedural_history: string;
  attorneys: string;
  nature_of_suit: string;
  posture: string;
  syllabus: string;
  headnotes: string;
  summary: string;
  disposition: string;
  history: string;
  other_dates: string;
  cross_reference: string;
  correction: string;
  citation_count: number;
  precedential_status: string;
  date_blocked: string | null;
  blocked: boolean;
  date_filed: string;
  date_filed_is_approximate: boolean;
  slug: string;
  citation_id: number;
  docket: string;
  sub_opinions: CourtOpinion[];
  tags: string[];
}

interface Docket {
  id: number;
  resource_uri: string;
  absolute_url: string;
  court: string;
  audio_files: string[];
  clusters: string[];
  assigned_to: string | null;
  assigned_to_str: string;
  referred_to: string | null;
  referred_to_str: string;
  date_created: string;
  date_modified: string;
  date_cert_granted: string | null;
  date_cert_denied: string | null;
  date_argued: string | null;
  date_reargued: string | null;
  date_reargument_denied: string | null;
  date_filed: string;
  date_terminated: string | null;
  date_last_filing: string | null;
  case_name: string;
  case_name_short: string;
  case_name_full: string;
  slug: string;
  docket_number: string;
  docket_number_core: string;
  pacer_case_id: string | null;
  cause: string;
  nature_of_suit: string;
  jury_demand: string;
  jurisdiction_type: string;
  appellate_fee_status: string;
  appellate_case_type_information: string;
  mdl_status: string;
  filepath_local: string;
  filepath_ia: string;
  filepath_ia_json: string;
  ia_upload_failure_count: number | null;
  ia_needs_upload: boolean | null;
  ia_date_first_change: string | null;
  view_count: number;
  date_blocked: string | null;
  blocked: boolean;
  appeal_from: string | null;
  appeal_from_str: string;
  panel_str: string;
  tags: string[];
}

interface Court {
  id: string;
  resource_uri: string;
  url: string;
  full_name: string;
  short_name: string;
  position: number;
  in_use: boolean;
  has_opinion_scraper: boolean;
  has_oral_argument_scraper: boolean;
  start_date: string;
  end_date: string | null;
  jurisdiction: string;
}

interface SearchFilters {
  query: string;
  court?: string;
  filed_after?: string;
  filed_before?: string;
  citation?: string;
  case_name?: string;
  judge?: string;
  precedential_status?: string;
  type?: 'o' | 'd' | 'oa'; // opinions, dockets, oral arguments
}

export const CourtListenerAPI: React.FC = () => {
  const [searchResults, setSearchResults] = useState<OpinionCluster[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    type: 'o'
  });
  const [selectedOpinion, setSelectedOpinion] = useState<OpinionCluster | null>(null);
  const [recentCases, setRecentCases] = useState<OpinionCluster[]>([]);

  const API_BASE = 'https://www.courtlistener.com/api/rest/v3';

  useEffect(() => {
    loadCourts();
    loadRecentCases();
  }, []);

  const loadCourts = async () => {
    try {
      // Simulate court data - in production would use actual API
      const courtData: Court[] = [
        {
          id: 'scotus',
          resource_uri: '/api/rest/v3/courts/scotus/',
          url: 'https://www.courtlistener.com/scotus/',
          full_name: 'Supreme Court of the United States',
          short_name: 'SCOTUS',
          position: 1,
          in_use: true,
          has_opinion_scraper: true,
          has_oral_argument_scraper: true,
          start_date: '1789-09-26',
          end_date: null,
          jurisdiction: 'F'
        },
        {
          id: 'ca1',
          resource_uri: '/api/rest/v3/courts/ca1/',
          url: 'https://www.courtlistener.com/ca1/',
          full_name: 'United States Court of Appeals for the First Circuit',
          short_name: '1st Cir.',
          position: 2,
          in_use: true,
          has_opinion_scraper: true,
          has_oral_argument_scraper: false,
          start_date: '1891-06-16',
          end_date: null,
          jurisdiction: 'F'
        },
        {
          id: 'cadc',
          resource_uri: '/api/rest/v3/courts/cadc/',
          url: 'https://www.courtlistener.com/cadc/',
          full_name: 'United States Court of Appeals for the District of Columbia Circuit',
          short_name: 'D.C. Cir.',
          position: 3,
          in_use: true,
          has_opinion_scraper: true,
          has_oral_argument_scraper: true,
          start_date: '1893-02-09',
          end_date: null,
          jurisdiction: 'F'
        }
      ];
      setCourts(courtData);
    } catch (error) {
      console.error('Failed to load courts:', error);
    }
  };

  const loadRecentCases = async () => {
    try {
      // Simulate recent cybersecurity-related cases
      const recentData: OpinionCluster[] = [
        {
          id: 12345,
          resource_uri: '/api/rest/v3/clusters/12345/',
          absolute_url: '/opinion/12345/example-v-cybersecurity-case/',
          panel: ['Judge Smith', 'Judge Johnson', 'Judge Williams'],
          non_participating_judges: [],
          case_name: 'Example Corp. v. Cybersecurity Research Institute',
          case_name_short: 'Example Corp. v. Cybersec. Research',
          case_name_full: 'Example Corporation v. Cybersecurity Research Institute et al.',
          scdb_id: '',
          scdb_decision_direction: null,
          scdb_votes_majority: null,
          scdb_votes_minority: null,
          source: 'C',
          procedural_history: 'Appeal from District Court ruling on data breach liability',
          attorneys: 'John Doe for Plaintiff, Jane Smith for Defendant',
          nature_of_suit: 'Data Privacy and Cybersecurity',
          posture: 'Appeal',
          syllabus: 'Court addresses liability standards for cybersecurity breaches in corporate environments.',
          headnotes: 'Cybersecurity; Data Breach; Corporate Liability; Standards of Care',
          summary: 'Landmark case establishing cybersecurity due diligence standards for corporations.',
          disposition: 'Affirmed in part, reversed in part',
          history: 'District court granted summary judgment for defendant',
          other_dates: '',
          cross_reference: '',
          correction: '',
          citation_count: 42,
          precedential_status: 'Published',
          date_blocked: null,
          blocked: false,
          date_filed: '2023-03-15',
          date_filed_is_approximate: false,
          slug: 'example-corp-v-cybersecurity-research',
          citation_id: 123,
          docket: '/api/rest/v3/dockets/456/',
          sub_opinions: [],
          tags: ['cybersecurity', 'data-breach', 'corporate-liability']
        },
        {
          id: 12346,
          resource_uri: '/api/rest/v3/clusters/12346/',
          absolute_url: '/opinion/12346/ai-ethics-case/',
          panel: ['Judge Davis', 'Judge Brown', 'Judge Wilson'],
          non_participating_judges: [],
          case_name: 'State v. AI Development Corp.',
          case_name_short: 'State v. AI Dev. Corp.',
          case_name_full: 'State of California v. AI Development Corporation',
          scdb_id: '',
          scdb_decision_direction: null,
          scdb_votes_majority: null,
          scdb_votes_minority: null,
          source: 'C',
          procedural_history: 'State enforcement action regarding AI algorithm transparency',
          attorneys: 'State Attorney General for Plaintiff, Corporate Counsel for Defendant',
          nature_of_suit: 'AI Ethics and Transparency',
          posture: 'Original jurisdiction',
          syllabus: 'Court examines state authority to regulate AI algorithm transparency requirements.',
          headnotes: 'Artificial Intelligence; Algorithm Transparency; State Regulation; Due Process',
          summary: 'First major ruling on state authority to require AI algorithm disclosures.',
          disposition: 'Motion to dismiss denied',
          history: 'Ongoing litigation',
          other_dates: '',
          cross_reference: '',
          correction: '',
          citation_count: 18,
          precedential_status: 'Published',
          date_blocked: null,
          blocked: false,
          date_filed: '2023-06-20',
          date_filed_is_approximate: false,
          slug: 'state-v-ai-development',
          citation_id: 124,
          docket: '/api/rest/v3/dockets/457/',
          sub_opinions: [],
          tags: ['artificial-intelligence', 'algorithm-transparency', 'state-regulation']
        }
      ];
      setRecentCases(recentData);
    } catch (error) {
      console.error('Failed to load recent cases:', error);
    }
  };

  const searchOpinions = async () => {
    if (!searchFilters.query.trim()) return;

    setIsLoading(true);
    try {
      // Simulate search results based on query
      let results: OpinionCluster[] = [];

      if (searchFilters.query.toLowerCase().includes('cyber')) {
        results = recentCases.filter(case_ =>
          case_.case_name.toLowerCase().includes('cyber') ||
          case_.nature_of_suit.toLowerCase().includes('cyber') ||
          case_.tags.some(tag => tag.includes('cyber'))
        );
      } else if (searchFilters.query.toLowerCase().includes('ai')) {
        results = recentCases.filter(case_ =>
          case_.case_name.toLowerCase().includes('ai') ||
          case_.nature_of_suit.toLowerCase().includes('ai') ||
          case_.tags.some(tag => tag.includes('ai'))
        );
      } else {
        results = recentCases;
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToAcademicBlockchain = async (opinion: OpinionCluster) => {
    try {
      const academicData = {
        title: `${opinion.case_name} - ${opinion.date_filed}`,
        authors: opinion.panel.length > 0 ? opinion.panel : ['Court Opinion'],
        venue: `CourtListener - ${opinion.precedential_status} Opinion`,
        submissionDate: opinion.date_filed,
        doi: null,
        overleafProjectId: null,
        paperId: `CL_${opinion.id}`,
        source: 'court_listener',
        external_url: `https://www.courtlistener.com${opinion.absolute_url}`,
        metadata: {
          case_name: opinion.case_name,
          case_name_full: opinion.case_name_full,
          court: opinion.docket,
          precedential_status: opinion.precedential_status,
          citation_count: opinion.citation_count,
          nature_of_suit: opinion.nature_of_suit,
          disposition: opinion.disposition,
          panel: opinion.panel,
          tags: opinion.tags,
          summary: opinion.summary,
          headnotes: opinion.headnotes,
          date_filed: opinion.date_filed
        }
      };

      const response = await fetch('/api/academic-blockchain/import-external', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(academicData)
      });

      if (response.ok) {
        console.log('Successfully exported to Academic Blockchain:', opinion.case_name);
      }
    } catch (error) {
      console.error('Failed to export to Academic Blockchain:', error);
    }
  };

  const getPrecedentialStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'text-green-400 bg-green-400/10';
      case 'unpublished': return 'text-yellow-400 bg-yellow-400/10';
      case 'errata': return 'text-orange-400 bg-orange-400/10';
      case 'separate': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getCourtIcon = (courtId: string) => {
    if (courtId === 'scotus') return <Scale className="w-4 h-4" />;
    if (courtId.startsWith('ca')) return <Building className="w-4 h-4" />;
    return <Gavel className="w-4 h-4" />;
  };

  const searchTypes = [
    { id: 'o', label: 'Opinions', icon: ScrollText },
    { id: 'd', label: 'Dockets', icon: FileText },
    { id: 'oa', label: 'Oral Arguments', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-purple-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Scale className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-slate-100">CourtListener API</h2>
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-400/10 text-purple-400">
              <Gavel className="w-3 h-3" />
              <span className="text-sm">Federal Court Records</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-400">
              {courts.length} courts • Millions of opinions
            </span>
          </div>
        </div>

        <p className="text-slate-400 text-sm">
          Access millions of federal court opinions, dockets, and oral arguments from CourtListener's
          comprehensive legal database for academic research and citation.
        </p>
      </div>

      {/* Search Interface */}
      <div className="bg-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Search Court Records</h3>

        {/* Search Type Selection */}
        <div className="flex space-x-2 mb-4">
          {searchTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSearchFilters(prev => ({ ...prev, type: type.id as any }))}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  searchFilters.type === type.id
                    ? 'border-purple-400 bg-purple-400/10 text-purple-400'
                    : 'border-slate-600 bg-slate-600 text-slate-300 hover:border-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{type.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilters.query}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && searchOpinions()}
                placeholder="Search court opinions, case names, or legal topics..."
                className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 focus:border-purple-400 focus:outline-none"
              />
            </div>

            <button
              onClick={searchOpinions}
              disabled={isLoading || !searchFilters.query.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-md transition-colors"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Court</label>
              <select
                value={searchFilters.court || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, court: e.target.value }))}
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm focus:border-purple-400 focus:outline-none"
              >
                <option value="">All Courts</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.short_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Filed After</label>
              <input
                type="date"
                value={searchFilters.filed_after || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, filed_after: e.target.value }))}
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Filed Before</label>
              <input
                type="date"
                value={searchFilters.filed_before || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, filed_before: e.target.value }))}
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={searchFilters.precedential_status || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, precedential_status: e.target.value }))}
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm focus:border-purple-400 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="Published">Published</option>
                <option value="Unpublished">Unpublished</option>
                <option value="Errata">Errata</option>
                <option value="Separate">Separate Opinion</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Search Results ({searchResults.length} cases)
          </h3>

          <div className="space-y-4">
            {searchResults.map((opinion) => (
              <div key={opinion.id} className="bg-slate-600 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Scale className="w-4 h-4 text-purple-400" />
                      <h4 className="text-slate-100 font-medium text-sm">
                        {opinion.case_name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${getPrecedentialStatusColor(opinion.precedential_status)}`}>
                        {opinion.precedential_status}
                      </span>
                    </div>

                    {opinion.summary && (
                      <p className="text-slate-300 text-sm mb-2 line-clamp-2">
                        {opinion.summary}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-slate-400 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{opinion.date_filed}</span>
                      </div>
                      {opinion.panel.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{opinion.panel.slice(0, 2).join(', ')}</span>
                          {opinion.panel.length > 2 && <span>+{opinion.panel.length - 2}</span>}
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{opinion.citation_count} citations</span>
                      </div>
                    </div>

                    {opinion.nature_of_suit && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-purple-400/10 text-purple-400 px-2 py-0.5 rounded text-xs">
                          {opinion.nature_of_suit}
                        </span>
                      </div>
                    )}

                    {opinion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {opinion.tags.slice(0, 4).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-slate-500 text-slate-300 px-2 py-0.5 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {opinion.tags.length > 4 && (
                          <span className="text-slate-400 text-xs">+{opinion.tags.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <a
                      href={`https://www.courtlistener.com${opinion.absolute_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Opinion</span>
                    </a>

                    <button
                      onClick={() => exportToAcademicBlockchain(opinion)}
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

      {/* Recent Cases */}
      <div className="bg-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Recent Technology Cases</h3>

        <div className="space-y-3">
          {recentCases.map((case_) => (
            <div key={case_.id} className="bg-slate-600 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Scale className="w-4 h-4 text-purple-400" />
                    <h4 className="text-slate-100 font-medium text-sm">{case_.case_name}</h4>
                  </div>

                  <p className="text-slate-300 text-sm mb-2">{case_.summary}</p>

                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span>{case_.date_filed}</span>
                    <span>{case_.nature_of_suit}</span>
                    <span>{case_.citation_count} citations</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <a
                    href={`https://www.courtlistener.com${case_.absolute_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                  >
                    View
                  </a>
                  <button
                    onClick={() => exportToAcademicBlockchain(case_)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Court Directory */}
      <div className="bg-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Federal Courts Directory</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courts.map((court) => (
            <div key={court.id} className="bg-slate-600 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                {getCourtIcon(court.id)}
                <div className="flex-1">
                  <h4 className="text-slate-100 font-medium text-sm mb-1">{court.short_name}</h4>
                  <p className="text-slate-300 text-xs mb-2 line-clamp-2">{court.full_name}</p>

                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    {court.has_opinion_scraper && (
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Opinions</span>
                      </span>
                    )}
                    {court.has_oral_argument_scraper && (
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-blue-400" />
                        <span>Audio</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-slate-800 border border-green-400/20 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Archive className="w-5 h-5 text-green-400" />
          <div>
            <h4 className="text-slate-100 font-medium">Legal Precedent Integration</h4>
            <p className="text-slate-400 text-sm">
              All CourtListener opinions can be imported into your Academic Blockchain with full legal
              citation metadata, precedential status, and court authority verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};