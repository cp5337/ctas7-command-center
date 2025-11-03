import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Database,
  Edit3,
  Save,
  X,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Users,
  FileText,
  Link,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Archive,
  Calendar,
  MapPin,
  Award,
  ExternalLink,
  Copy,
  Trash2,
  Eye,
  GitBranch
} from 'lucide-react';

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  affiliation?: string;
  orcid?: string;
}

interface ResearchPaper {
  id: string;
  title: string;
  authors: Author[];
  abstract: string;
  venue: string;
  submissionDate: Date;
  publicationDate?: Date;
  doi?: string;
  url?: string;
  overleafProjectId?: string;
  zoteroItemId?: string;
  blockchainHash?: string;
  status: 'draft' | 'submitted' | 'under-review' | 'accepted' | 'published';
  keywords: string[];
  citations: number;
  category: string;
  version: number;
  lastModified: Date;
  beforeAfterMetrics?: {
    codeReusability: { before: number; after: number };
    maintenanceComplexity: { before: number; after: number };
    bugDiscoveryRate: { before: number; after: number };
    documentationCoverage: { before: number; after: number };
  };
}

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  multiline?: boolean;
  placeholder?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChange,
  isEditing,
  multiline = false,
  placeholder
}) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      {isEditing ? (
        multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
            rows={3}
            placeholder={placeholder}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            placeholder={placeholder}
          />
        )
      ) : (
        <div className="p-2 bg-slate-900/50 rounded-md min-h-[40px] flex items-center">
          <span className="text-slate-100">{value || <span className="text-slate-500 italic">Not set</span>}</span>
        </div>
      )}
    </div>
  );
};

interface AuthorEditorProps {
  authors: Author[];
  onChange: (authors: Author[]) => void;
  isEditing: boolean;
}

const AuthorEditor: React.FC<AuthorEditorProps> = ({ authors, onChange, isEditing }) => {
  const addAuthor = () => {
    const newAuthor: Author = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      email: '',
      affiliation: '',
      orcid: ''
    };
    onChange([...authors, newAuthor]);
  };

  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    const updatedAuthors = authors.map((author, i) =>
      i === index ? { ...author, [field]: value } : author
    );
    onChange(updatedAuthors);
  };

  const removeAuthor = (index: number) => {
    onChange(authors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-300">Authors</label>
        {isEditing && (
          <button
            onClick={addAuthor}
            className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors"
          >
            <Plus size={12} />
            Add Author
          </button>
        )}
      </div>

      <div className="space-y-2">
        {authors.map((author, index) => (
          <div key={author.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={author.firstName}
                    onChange={(e) => updateAuthor(index, 'firstName', e.target.value)}
                    placeholder="First Name"
                    className="flex-1 p-2 bg-slate-800 border border-slate-600 rounded text-slate-100 text-sm focus:border-blue-400"
                  />
                  <input
                    type="text"
                    value={author.lastName}
                    onChange={(e) => updateAuthor(index, 'lastName', e.target.value)}
                    placeholder="Last Name"
                    className="flex-1 p-2 bg-slate-800 border border-slate-600 rounded text-slate-100 text-sm focus:border-blue-400"
                  />
                  <button
                    onClick={() => removeAuthor(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    value={author.email || ''}
                    onChange={(e) => updateAuthor(index, 'email', e.target.value)}
                    placeholder="Email"
                    className="p-2 bg-slate-800 border border-slate-600 rounded text-slate-100 text-sm focus:border-blue-400"
                  />
                  <input
                    type="text"
                    value={author.affiliation || ''}
                    onChange={(e) => updateAuthor(index, 'affiliation', e.target.value)}
                    placeholder="Affiliation"
                    className="p-2 bg-slate-800 border border-slate-600 rounded text-slate-100 text-sm focus:border-blue-400"
                  />
                </div>
                <input
                  type="text"
                  value={author.orcid || ''}
                  onChange={(e) => updateAuthor(index, 'orcid', e.target.value)}
                  placeholder="ORCID ID (optional)"
                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-slate-100 text-sm focus:border-blue-400"
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-100">
                    {author.firstName} {author.lastName}
                  </h4>
                  {author.orcid && (
                    <a
                      href={`https://orcid.org/${author.orcid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 text-xs"
                    >
                      ORCID
                    </a>
                  )}
                </div>
                {author.email && (
                  <p className="text-sm text-slate-400">{author.email}</p>
                )}
                {author.affiliation && (
                  <p className="text-sm text-slate-500">{author.affiliation}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ResearchPapersDashboard: React.FC = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPaper, setEditedPaper] = useState<ResearchPaper | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showZoteroPanel, setShowZoteroPanel] = useState(true);
  const [showBlockchainPanel, setShowBlockchainPanel] = useState(true);

  // Initialize with the Atomic Clipboard paper and sample data
  useEffect(() => {
    const samplePapers: ResearchPaper[] = [
      {
        id: 'atomic-clipboard-2025',
        title: 'Atomic Clipboard Intelligence: An Enterprise Framework for Human-AI Code Quality Assurance in High-Reliability Verticals',
        authors: [
          {
            id: '1',
            firstName: 'Charlie',
            lastName: 'Payne',
            email: 'charlie.payne@cognetix.mil',
            affiliation: 'CTAS-7 Research Division, Cognetix Intelligence Systems',
            orcid: '0000-0000-0000-0000'
          }
        ],
        abstract: 'We present Atomic Clipboard Intelligence (ACI), a novel framework for preventing catastrophic failures in human-AI collaborative software development within high-reliability verticals including aerospace, cybersecurity, and financial systems. Our approach integrates real-time excitement gap detection, primitive-based code recycling, and structured comment discipline (NVNN) to prevent documented failure patterns that have resulted in multi-million dollar losses.',
        venue: 'CTAS-7 Research Division',
        submissionDate: new Date('2025-01-24'),
        status: 'published',
        keywords: ['Human-AI collaboration', 'Code quality assurance', 'Aerospace software', 'Cybersecurity', 'Prompt engineering'],
        citations: 0,
        category: 'Computer Science',
        version: 1,
        lastModified: new Date(),
        blockchainHash: 'blake3:a7b2c4d8e9f1...',
        overleafProjectId: 'atomic-clipboard-2025',
        zoteroItemId: 'ZOTERO_001',
        beforeAfterMetrics: {
          codeReusability: { before: 23.4, after: 87.6 },
          maintenanceComplexity: { before: 8.7, after: 4.2 },
          bugDiscoveryRate: { before: 2.3, after: 0.7 },
          documentationCoverage: { before: 31.2, after: 91.8 }
        }
      },
      {
        id: 'sample-paper-2',
        title: 'Advanced Threat Intelligence Automation for Maritime Operations',
        authors: [
          {
            id: '2',
            firstName: 'Natasha',
            lastName: 'Volkov',
            email: 'n.volkov@ctas.mil',
            affiliation: 'CTAS-7 Cyber Operations Division'
          }
        ],
        abstract: 'This paper presents novel approaches to automated threat intelligence gathering and analysis specifically designed for maritime operational environments.',
        venue: 'IEEE Military Communications Conference (MILCOM)',
        submissionDate: new Date('2024-12-15'),
        status: 'under-review',
        keywords: ['Threat Intelligence', 'Maritime Security', 'Automation'],
        citations: 0,
        category: 'Cybersecurity',
        version: 2,
        lastModified: new Date('2025-01-20'),
        blockchainHash: 'blake3:b8c3d9e0f2g4...',
      }
    ];

    setPapers(samplePapers);
    setSelectedPaper(samplePapers[0]); // Select the Atomic Clipboard paper by default
  }, []);

  const startEditing = () => {
    if (selectedPaper) {
      setEditedPaper({ ...selectedPaper });
      setIsEditing(true);
    }
  };

  const saveChanges = () => {
    if (editedPaper) {
      const updatedPapers = papers.map(paper =>
        paper.id === editedPaper.id ? { ...editedPaper, lastModified: new Date() } : paper
      );
      setPapers(updatedPapers);
      setSelectedPaper(editedPaper);
      setIsEditing(false);
      setEditedPaper(null);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedPaper(null);
  };

  const updateField = (field: keyof ResearchPaper, value: any) => {
    if (editedPaper) {
      setEditedPaper({ ...editedPaper, [field]: value });
    }
  };

  const getStatusColor = (status: ResearchPaper['status']) => {
    switch (status) {
      case 'published':
        return 'from-green-900/20 to-green-800/20 border-green-500/20 text-green-400';
      case 'accepted':
        return 'from-blue-900/20 to-blue-800/20 border-blue-500/20 text-blue-400';
      case 'under-review':
        return 'from-yellow-900/20 to-yellow-800/20 border-yellow-500/20 text-yellow-400';
      case 'submitted':
        return 'from-purple-900/20 to-purple-800/20 border-purple-500/20 text-purple-400';
      default:
        return 'from-slate-900/20 to-slate-800/20 border-slate-500/20 text-slate-400';
    }
  };

  const currentPaper = isEditing ? editedPaper : selectedPaper;

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.authors.some(author =>
                           `${author.firstName} ${author.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesFilter = filterStatus === 'all' || paper.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="container mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              🔬 Research Papers
            </h1>
            <p className="text-slate-400 mt-1">Academic Publishing & Blockchain Verification System</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25">
              <Plus size={16} />
              New Paper
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25">
              <RefreshCw size={16} />
              Sync Zotero
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
              <Archive size={16} />
              Blockchain
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg p-4 border border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Published Papers</p>
                <p className="text-2xl font-bold text-blue-300">
                  {papers.filter(p => p.status === 'published').length}
                </p>
              </div>
              <BookOpen className="text-blue-400" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg p-4 border border-green-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Citations</p>
                <p className="text-2xl font-bold text-green-300">
                  {papers.reduce((sum, paper) => sum + paper.citations, 0)}
                </p>
              </div>
              <Award className="text-green-400" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded-lg p-4 border border-purple-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Blockchain Verified</p>
                <p className="text-2xl font-bold text-purple-300">
                  {papers.filter(p => p.blockchainHash).length}/{papers.length}
                </p>
              </div>
              <GitBranch className="text-purple-400" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-900/20 to-cyan-800/20 rounded-lg p-4 border border-cyan-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-400 text-sm font-medium">Zotero Synced</p>
                <p className="text-2xl font-bold text-cyan-300">
                  {papers.filter(p => p.zoteroItemId).length}
                </p>
              </div>
              <Database className="text-cyan-400" size={24} />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search papers by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:border-blue-400 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under-review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Papers List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">Papers ({filteredPapers.length})</h2>

            <div className="space-y-3">
              {filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  onClick={() => setSelectedPaper(paper)}
                  className={`cursor-pointer p-4 rounded-lg border backdrop-blur-sm transition-all duration-200 hover:shadow-lg ${
                    selectedPaper?.id === paper.id
                      ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-blue-500/40 shadow-blue-500/20'
                      : 'bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-100 line-clamp-2 flex-1 mr-4">
                      {paper.title}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs bg-gradient-to-r ${getStatusColor(paper.status)} border backdrop-blur-sm`}>
                      {paper.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 mb-2">
                    {paper.authors.map(author => `${author.firstName} ${author.lastName}`).join(', ')}
                  </p>

                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {paper.abstract}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {paper.submissionDate.toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {paper.venue}
                      </span>
                      {paper.citations > 0 && (
                        <span className="flex items-center gap-1">
                          <Award size={12} />
                          {paper.citations} citations
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {paper.blockchainHash && (
                        <div className="w-2 h-2 bg-green-400 rounded-full" title="Blockchain Verified" />
                      )}
                      {paper.zoteroItemId && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full" title="In Zotero" />
                      )}
                      {paper.overleafProjectId && (
                        <div className="w-2 h-2 bg-purple-400 rounded-full" title="Overleaf Project" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paper Details */}
          <div className="space-y-4">
            {currentPaper ? (
              <>
                {/* Paper Details Header */}
                <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-lg p-4 border border-slate-700/50 backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-slate-200">Paper Details</h2>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveChanges}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                          >
                            <Save size={14} />
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                          >
                            <X size={14} />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={startEditing}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <EditableField
                      label="Title"
                      value={currentPaper.title}
                      onChange={(value) => updateField('title', value)}
                      isEditing={isEditing}
                      placeholder="Enter paper title"
                    />

                    <AuthorEditor
                      authors={currentPaper.authors}
                      onChange={(authors) => updateField('authors', authors)}
                      isEditing={isEditing}
                    />

                    <EditableField
                      label="Abstract"
                      value={currentPaper.abstract}
                      onChange={(value) => updateField('abstract', value)}
                      isEditing={isEditing}
                      multiline={true}
                      placeholder="Enter paper abstract"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <EditableField
                        label="Venue"
                        value={currentPaper.venue}
                        onChange={(value) => updateField('venue', value)}
                        isEditing={isEditing}
                        placeholder="Conference/Journal"
                      />

                      <EditableField
                        label="Category"
                        value={currentPaper.category}
                        onChange={(value) => updateField('category', value)}
                        isEditing={isEditing}
                        placeholder="Research category"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <EditableField
                        label="DOI"
                        value={currentPaper.doi || ''}
                        onChange={(value) => updateField('doi', value)}
                        isEditing={isEditing}
                        placeholder="10.1000/xyz123"
                      />

                      <EditableField
                        label="URL"
                        value={currentPaper.url || ''}
                        onChange={(value) => updateField('url', value)}
                        isEditing={isEditing}
                        placeholder="https://..."
                      />
                    </div>

                    {/* Status and Integration Info */}
                    <div className="pt-4 border-t border-slate-700">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-slate-400">Status</label>
                          <p className="text-slate-200 capitalize">{currentPaper.status}</p>
                        </div>
                        <div>
                          <label className="text-slate-400">Citations</label>
                          <p className="text-slate-200">{currentPaper.citations}</p>
                        </div>
                        <div>
                          <label className="text-slate-400">Version</label>
                          <p className="text-slate-200">v{currentPaper.version}</p>
                        </div>
                        <div>
                          <label className="text-slate-400">Modified</label>
                          <p className="text-slate-200">{currentPaper.lastModified.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Integration Status */}
                    <div className="pt-4 border-t border-slate-700">
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Integration Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Blockchain</span>
                          <div className="flex items-center gap-2">
                            {currentPaper.blockchainHash ? (
                              <>
                                <CheckCircle size={14} className="text-green-400" />
                                <span className="text-xs font-mono text-green-400">
                                  {currentPaper.blockchainHash.substring(0, 16)}...
                                </span>
                              </>
                            ) : (
                              <AlertCircle size={14} className="text-yellow-400" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Zotero</span>
                          <div className="flex items-center gap-2">
                            {currentPaper.zoteroItemId ? (
                              <>
                                <CheckCircle size={14} className="text-green-400" />
                                <span className="text-xs text-green-400">Synced</span>
                              </>
                            ) : (
                              <AlertCircle size={14} className="text-yellow-400" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Overleaf</span>
                          <div className="flex items-center gap-2">
                            {currentPaper.overleafProjectId ? (
                              <>
                                <CheckCircle size={14} className="text-green-400" />
                                <ExternalLink size={14} className="text-blue-400 cursor-pointer" />
                              </>
                            ) : (
                              <AlertCircle size={14} className="text-yellow-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Before/After Metrics */}
                    {currentPaper.beforeAfterMetrics && (
                      <div className="pt-4 border-t border-slate-700">
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Performance Metrics</h4>
                        <div className="space-y-3">
                          {Object.entries(currentPaper.beforeAfterMetrics).map(([key, values]) => (
                            <div key={key} className="bg-slate-800/50 p-3 rounded">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-400 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="text-xs font-bold text-green-400">
                                  +{Math.round(((values.after - values.before) / values.before) * 100)}%
                                </span>
                              </div>
                              <div className="flex gap-4 text-xs">
                                <span className="text-red-400">Before: {values.before}%</span>
                                <span className="text-green-400">After: {values.after}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-lg p-8 border border-slate-700/50 backdrop-blur-sm text-center">
                <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">No Paper Selected</h3>
                <p className="text-slate-500">Select a paper from the list to view and edit details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};