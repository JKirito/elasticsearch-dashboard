import React from 'react';
import { useClusterHealth, useClusterInfo, useIndexes } from '../hooks/useElasticsearch';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Activity, Database, Server, HardDrive } from 'lucide-react';

export function Overview() {
  const { data: clusterHealth, isLoading: isLoadingHealth, error: healthError } = useClusterHealth();
  const { data: clusterInfo, isLoading: isLoadingInfo, error: infoError } = useClusterInfo();
  const { data: indexes, isLoading: isLoadingIndexes, error: indexesError } = useIndexes();

  if (isLoadingHealth || isLoadingInfo || isLoadingIndexes) {
    return <LoadingSpinner message="Loading cluster information..." />;
  }

  if (healthError || infoError || indexesError) {
    return <ErrorMessage error={healthError || infoError || indexesError || 'Unknown error'} />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'text-green-600 bg-green-100';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-100';
      case 'red':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const totalDocs = indexes?.reduce((sum, index) => {
    return sum + parseInt(index['docs.count'] || '0', 10);
  }, 0) || 0;

  const totalSize = indexes?.reduce((sum, index) => {
    const sizeStr = index['store.size'] || '0b';
    return sum + parseSize(sizeStr);
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cluster Overview</h2>
        <p className="mt-1 text-gray-600">
          Monitor your Elasticsearch cluster health and performance
        </p>
      </div>

      {/* Cluster Info */}
      <Card title="Cluster Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Cluster Name</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {clusterInfo?.cluster_name || 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Version</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {clusterInfo?.version?.number || 'Unknown'}
            </p>
          </div>
        </div>
      </Card>

      {/* Health Status */}
      <Card title="Cluster Health">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <div className="mt-2 flex items-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  clusterHealth?.status || ''
                )}`}
              >
                <Activity className="w-4 h-4 mr-1" />
                {clusterHealth?.status?.toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Nodes</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {clusterHealth?.number_of_nodes || 0}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Data Nodes</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {clusterHealth?.number_of_data_nodes || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Shard Information */}
      <Card title="Shard Information">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Primary</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {clusterHealth?.active_primary_shards || 0}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Shards</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {clusterHealth?.active_shards || 0}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Relocating</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {clusterHealth?.relocating_shards || 0}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Unassigned</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {clusterHealth?.unassigned_shards || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Index Statistics */}
      <Card title="Index Statistics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <Database className="h-12 w-12 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Indexes</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {indexes?.length || 0}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Server className="h-12 w-12 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Documents</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {totalDocs.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <HardDrive className="h-12 w-12 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Size</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatBytes(totalSize)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper functions
function parseSize(sizeStr: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
    tb: 1024 * 1024 * 1024 * 1024,
  };

  const match = sizeStr.toLowerCase().match(/^([\d.]+)(\w+)$/);
  if (!match) return 0;

  const [, value, unit] = match;
  return parseFloat(value) * (units[unit] || 1);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}