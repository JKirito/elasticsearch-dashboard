import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useIndexMapping,
  useSearchDocuments,
  useIndexStats,
  useDocumentCount,
} from '../hooks/useElasticsearch';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { JsonViewer } from '../components/JsonViewer';
import { ArrowLeft, FileText, Settings, Search } from 'lucide-react';

export function IndexDetail() {
  const { indexName = '' } = useParams<{ indexName: string }>();
  const decodedIndexName = decodeURIComponent(indexName);
  const [activeTab, setActiveTab] = useState<'documents' | 'mapping' | 'settings'>('documents');
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const pageSize = 10;

  const { data: mapping, isLoading: isLoadingMapping, error: mappingError } = useIndexMapping(decodedIndexName);
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useIndexStats(decodedIndexName);
  const { data: totalCount } = useDocumentCount(decodedIndexName);

  const query = activeSearchQuery
    ? {
        query: {
          query_string: {
            query: activeSearchQuery,
          },
        },
      }
    : undefined;

  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    error: searchError,
  } = useSearchDocuments(decodedIndexName, query, currentPage * pageSize, pageSize);

  const handleSearch = () => {
    setActiveSearchQuery(searchQuery);
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearchQuery('');
    setCurrentPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (isLoadingMapping || isLoadingStats) {
    return <LoadingSpinner message="Loading index details..." />;
  }

  if (mappingError || statsError) {
    return <ErrorMessage error={mappingError || statsError || 'Unknown error'} />;
  }

  const indexInfo = mapping?.[decodedIndexName];
  const indexStats = stats?.indices?.[decodedIndexName];

  const totalPages = Math.ceil((totalCount || 0) / pageSize);

  const renderDocuments = () => {
    if (isLoadingSearch) {
      return <LoadingSpinner message="Loading documents..." />;
    }

    if (searchError) {
      return <ErrorMessage error={searchError} />;
    }

    return (
      <div className="space-y-4">
        {/* Search Box */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search documents (e.g., field:value)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
          {activeSearchQuery && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-150"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Status */}
        {activeSearchQuery && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Searching for: <span className="font-semibold">"{activeSearchQuery}"</span>
              </span>
              <span className="text-sm text-blue-600">
                ({searchResults?.hits.total.value || 0} results)
              </span>
            </div>
          </div>
        )}

        {/* Documents List */}
        <div className="space-y-3">
          {searchResults?.hits.hits.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No documents found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search query</p>
            </div>
          ) : (
            searchResults?.hits.hits.map((doc) => (
              <div
                key={doc._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Document ID:</span>
                        <span className="ml-2 text-sm font-semibold text-gray-900">{doc._id}</span>
                      </div>
                      {doc._score && (
                        <span className="text-xs text-gray-500">Score: {doc._score.toFixed(4)}</span>
                      )}
                    </div>
                    <JsonViewer data={doc._source} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderMapping = () => {
    const properties = indexInfo?.mappings?.properties || {};
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Field Mappings</h3>
        <JsonViewer data={properties} />
      </div>
    );
  };

  const renderSettings = () => {
    const settings = indexInfo?.settings?.index || {};
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Index Settings</h3>
        <JsonViewer data={settings} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/indexes"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{decodedIndexName}</h2>
          <p className="mt-1 text-gray-600">
            Index details and document browser
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Total Documents</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {indexStats?.primaries?.docs?.count?.toLocaleString() || 0}
            </p>
          </div>
        </Card>
        <Card className="bg-white">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Primary Size</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatBytes(indexStats?.primaries?.store?.size_in_bytes || 0)}
            </p>
          </div>
        </Card>
        <Card className="bg-white">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Total Size</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatBytes(indexStats?.total?.store?.size_in_bytes || 0)}
            </p>
          </div>
        </Card>
        <Card className="bg-white">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Segments</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {indexStats?.primaries?.segments?.count || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="inline-block h-5 w-5 mr-1" />
            Documents
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mapping'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="inline-block h-5 w-5 mr-1" />
            Mapping
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="inline-block h-5 w-5 mr-1" />
            Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <Card className="bg-white min-h-[400px]">
        {activeTab === 'documents' && renderDocuments()}
        {activeTab === 'mapping' && renderMapping()}
        {activeTab === 'settings' && renderSettings()}
      </Card>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}