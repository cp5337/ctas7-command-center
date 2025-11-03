import React, { useState, useEffect } from 'react';
import { Shield, Check, Clock, AlertTriangle, Hash, FileText, Users, Calendar } from 'lucide-react';

interface PaperBlock {
  id: string;
  paperTitle: string;
  authors: string[];
  submissionDate: string;
  hash: string;
  previousHash: string;
  citationCount: number;
  verificationStatus: 'verified' | 'pending' | 'failed';
  blockHeight: number;
  merkleRoot: string;
  metadata: {
    doi?: string;
    venue?: string;
    category?: string;
    keywords?: string[];
  };
}

interface AcademicBlockchainViewerProps {
  paperId?: string;
  showFullChain?: boolean;
}

const AcademicBlockchainViewer: React.FC<AcademicBlockchainViewerProps> = ({
  paperId,
  showFullChain = false
}) => {
  const [blocks, setBlocks] = useState<PaperBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<PaperBlock | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [chainIntegrity, setChainIntegrity] = useState<'valid' | 'invalid' | 'checking'>('checking');

  // Sample blockchain data for the atomic clipboard paper
  useEffect(() => {
    const sampleBlocks: PaperBlock[] = [
      {
        id: 'block_001',
        paperTitle: 'Atomic Clipboard Intelligence: Advanced Copy-Paste Operations in High-Performance Computing Environments',
        authors: ['Dr. Sarah Chen', 'Dr. Marcus Rodriguez', 'Dr. Emily Watson'],
        submissionDate: '2024-10-15T14:30:00Z',
        hash: 'blake3_a7f3d8e9c2b1a5f8e3d7c9b2a4f6e8d1c3b5a7f9e2d4c6b8a1f3e5d7c9b2a4f6',
        previousHash: 'blake3_0000000000000000000000000000000000000000000000000000000000000000',
        citationCount: 0,
        verificationStatus: 'verified',
        blockHeight: 1,
        merkleRoot: 'blake3_f8e3d7c9b2a4f6e8d1c3b5a7f9e2d4c6b8a1f3e5d7c9b2a4f6e8d1c3b5a7f9',
        metadata: {
          doi: '10.1000/182',
          venue: 'Journal of Advanced Computing Systems',
          category: 'Computer Science',
          keywords: ['clipboard', 'intelligence', 'HPC', 'automation', 'performance']
        }
      },
      {
        id: 'block_002',
        paperTitle: 'Enhanced Neural Networks for Real-Time Data Processing',
        authors: ['Dr. Alex Kim', 'Dr. Jennifer Lee'],
        submissionDate: '2024-10-10T09:15:00Z',
        hash: 'blake3_b8f4e9d0c3b2a6f9e4d8c0b3a5f7e9d2c4b6a8f0e3d5c7b9a2f4e6d8c0b3a5f7',
        previousHash: 'blake3_a7f3d8e9c2b1a5f8e3d7c9b2a4f6e8d1c3b5a7f9e2d4c6b8a1f3e5d7c9b2a4f6',
        citationCount: 3,
        verificationStatus: 'verified',
        blockHeight: 2,
        merkleRoot: 'blake3_e9d4c8b3a6f0e4d8c1b4a7f0e3d6c9b2a5f8e1d4c7b0a3f6e9d2c5b8a1f4e7d0',
        metadata: {
          venue: 'IEEE Transactions on Neural Networks',
          category: 'Artificial Intelligence'
        }
      }
    ];

    setBlocks(sampleBlocks);
    if (paperId) {
      const block = sampleBlocks.find(b => b.id === paperId);
      setSelectedBlock(block || null);
    }

    // Simulate blockchain integrity verification
    setTimeout(() => {
      setChainIntegrity('valid');
    }, 1500);
  }, [paperId]);

  const verifyBlock = async (block: PaperBlock) => {
    setIsVerifying(true);
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsVerifying(false);

    // Update block status
    setBlocks(prev => prev.map(b =>
      b.id === block.id
        ? { ...b, verificationStatus: 'verified' }
        : b
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700';
      case 'failed':
        return 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700';
      default:
        return 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600';
    }
  };

  const formatHash = (hash: string) => {
    return hash.length > 20 ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}` : hash;
  };

  return (
    <div className="space-y-6">
      {/* Chain Integrity Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Academic Blockchain Integrity
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {chainIntegrity === 'checking' && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            )}
            {chainIntegrity === 'valid' && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <Check className="w-5 h-5" />
                <span className="font-medium">Chain Valid</span>
              </div>
            )}
            {chainIntegrity === 'invalid' && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Chain Compromised</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Total Blocks:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">{blocks.length}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Verified Papers:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {blocks.filter(b => b.verificationStatus === 'verified').length}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Hash Algorithm:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">Blake3</span>
          </div>
        </div>
      </div>

      {/* Blockchain Visualization */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Hash className="w-5 h-5 mr-2" />
          Academic Paper Blockchain
        </h4>

        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={`border-2 rounded-lg p-6 transition-all duration-200 cursor-pointer hover:shadow-md ${
              selectedBlock?.id === block.id
                ? 'ring-2 ring-blue-500 border-blue-300'
                : getStatusColor(block.verificationStatus)
            }`}
            onClick={() => setSelectedBlock(selectedBlock?.id === block.id ? null : block)}
          >
            {/* Block Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(block.verificationStatus)}
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Block #{block.blockHeight}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(block.submissionDate).toLocaleDateString()}
                  </span>
                </div>

                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {block.paperTitle}
                </h5>

                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{block.authors.length} authors</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{block.citationCount} citations</span>
                  </div>
                  {block.metadata.venue && (
                    <div className="truncate">
                      {block.metadata.venue}
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-4 text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hash</div>
                <div className="font-mono text-sm text-gray-700 dark:text-gray-300">
                  {formatHash(block.hash)}
                </div>
                {block.verificationStatus === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      verifyBlock(block);
                    }}
                    disabled={isVerifying}
                    className="mt-2 px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </button>
                )}
              </div>
            </div>

            {/* Connection Line to Next Block */}
            {index < blocks.length - 1 && (
              <div className="flex justify-center mt-4 mb-2">
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              </div>
            )}

            {/* Expanded Block Details */}
            {selectedBlock?.id === block.id && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h6 className="font-semibold text-gray-900 dark:text-white mb-2">Authors</h6>
                    <ul className="space-y-1">
                      {block.authors.map((author, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                          {author}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h6 className="font-semibold text-gray-900 dark:text-white mb-2">Metadata</h6>
                    <div className="space-y-1 text-sm">
                      {block.metadata.doi && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">DOI:</span>
                          <span className="ml-2 text-gray-700 dark:text-gray-300">{block.metadata.doi}</span>
                        </div>
                      )}
                      {block.metadata.category && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Category:</span>
                          <span className="ml-2 text-gray-700 dark:text-gray-300">{block.metadata.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h6 className="font-semibold text-gray-900 dark:text-white mb-2">Cryptographic Details</h6>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 font-mono text-xs space-y-2">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Block Hash:</span>
                      <div className="text-gray-700 dark:text-gray-300 break-all">{block.hash}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Previous Hash:</span>
                      <div className="text-gray-700 dark:text-gray-300 break-all">{block.previousHash}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Merkle Root:</span>
                      <div className="text-gray-700 dark:text-gray-300 break-all">{block.merkleRoot}</div>
                    </div>
                  </div>
                </div>

                {block.metadata.keywords && (
                  <div>
                    <h6 className="font-semibold text-gray-900 dark:text-white mb-2">Keywords</h6>
                    <div className="flex flex-wrap gap-2">
                      {block.metadata.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcademicBlockchainViewer;