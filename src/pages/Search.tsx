import React, { useState } from 'react';
import { useIndexes, useSearchDocuments } from '../hooks/useElasticsearch';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Search as SearchIcon, Database, FileText } from 'lucide-react';

export function Search() {
  const { data: indexes, isLoading: isLoadingIndexes } = useIndexes();
  const [selectedIndex, setSelectedIndex] = useState<string>('*');
  const [searchQuery, setSearchQuery] = useState('');
  const [queryType, setQueryType] = useState<'simple' | 'advanced'>('simple');
  const [advancedQuery, setAdvancedQuery] = useState('{\n  "query": {\n    "match_all": {}\n  }\n}');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const query = queryType === 'simple' && searchQuery
    ? {
        query: {
          query_string: {
            query: searchQuery,
            default_field: '*',
          },
        },
      }
    : queryType === 'advanced'
    ? (() => {
        try {
          return JSON.parse(advancedQuery);
        } catch {
          return null;
        }
      })()
    : undefined;

  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    refetch,
  } = useSearchDocuments(
    selectedIndex,
    query,
    currentPage * pageSize,
    pageSize,
    !!query || selectedIndex === '*'
  );

  const handleSearch = () => {
    setCurrentPage(0);
    refetch();
  };

  const totalHits = searchResults?.hits.total.value || 0;
  const totalPages = Math.ceil(totalHits / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Search</h2>
        <p className="mt-1 text-gray-600">
          Search across your Elasticsearch indexes
        </p>
      </div>

      {/* Search Configuration */}
      <Card title="Search Configuration">
        <div className="space-y-4">
          {/* Index Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Index
            </label>
            <select
              value={selectedIndex}
              onChange={(e) => {
                setSelectedIndex(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoadingIndexes}
            >
              <option value="*">All Indexes</option>
              {indexes?.map((index) => (
                <option key={index.index} value={index.index}>
                  {index.index}
                </option>
              ))}
            </select>
          </div>

          {/* Query Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Query Type
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setQueryType('simple')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  queryType === 'simple'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Simple Query
              </button>
              <button
                onClick={() => setQueryType('advanced')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  queryType === 'advanced'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Advanced Query (JSON)
              </button>
            </div>
          </div>

          {/* Query Input */}
          {queryType === 'simple' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Query
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Enter search query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Use Lucene query syntax (e.g., field:value, wildcards with *, AND/OR operators)
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JSON Query
              </label>
              <textarea
                value={advancedQuery}
                onChange={(e) => setAdvancedQuery(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder='{"query": {"match_all": {}}}'
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter a valid Elasticsearch query in JSON format
              </p>
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </Card>

      {/* Search Results */}
      {searchError && <ErrorMessage error={searchError} retry={refetch} />}

      {searchResults && (
        <Card
          title={`Search Results (${totalHits} hits)`}
          description={`Query took ${searchResults.took}ms`}
        >
          {isSearching ? (
            <LoadingSpinner message="Searching..." />
          ) : searchResults.hits.hits.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">No results found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Results List */}
              <div className="space-y-3">
                {searchResults.hits.hits.map((hit, index) => (
                  <div
                    key={`${hit._index}-${hit._id}-${index}`}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                          <Database className="h-4 w-4" />
                          <span className="font-medium">{hit._index}</span>
                          <span>•</span>
                          <span>ID: {hit._id}</span>
                          {hit._score !== null && (
                            <>
                              <span>•</span>
                              <span>Score: {hit._score.toFixed(3)}</span>
                            </>
                          )}
                        </div>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                          {JSON.stringify(hit._source, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage + 1} of {totalPages} (Showing {currentPage * pageSize + 1}-
                    {Math.min((currentPage + 1) * pageSize, totalHits)} of {totalHits})
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}