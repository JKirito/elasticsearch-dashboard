import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type {
	ElasticsearchClusterHealth,
	ElasticsearchIndex,
	ElasticsearchIndexMapping,
	ElasticsearchStats,
	SearchResponse,
} from "../services/elasticsearch";
import { elasticsearchService } from "../services/elasticsearch";

// Query keys
const queryKeys = {
	all: ["elasticsearch"] as const,
	clusterHealth: () => [...queryKeys.all, "cluster-health"] as const,
	indexes: () => [...queryKeys.all, "indexes"] as const,
	indexMapping: (indexName: string) =>
		[...queryKeys.all, "index-mapping", indexName] as const,
	searchDocuments: (
		indexName: string,
		query?: any,
		from?: number,
		size?: number,
	) => [...queryKeys.all, "search", indexName, query, from, size] as const,
	indexStats: (indexName: string) =>
		[...queryKeys.all, "index-stats", indexName] as const,
	documentCount: (indexName: string, query?: any) =>
		[...queryKeys.all, "count", indexName, query] as const,
	clusterStats: () => [...queryKeys.all, "cluster-stats"] as const,
	clusterInfo: () => [...queryKeys.all, "cluster-info"] as const,
};

// Custom hooks
export function useClusterHealth(): UseQueryResult<
	ElasticsearchClusterHealth,
	Error
> {
	return useQuery({
		queryKey: queryKeys.clusterHealth(),
		queryFn: () => elasticsearchService.getClusterHealth(),
		refetchInterval: 30000, // Refresh every 30 seconds
	});
}

export function useIndexes(): UseQueryResult<ElasticsearchIndex[], Error> {
	return useQuery({
		queryKey: queryKeys.indexes(),
		queryFn: () => elasticsearchService.getIndexes(),
		refetchInterval: 60000, // Refresh every minute
	});
}

export function useIndexMapping(
	indexName: string,
	enabled = true,
): UseQueryResult<ElasticsearchIndexMapping, Error> {
	return useQuery({
		queryKey: queryKeys.indexMapping(indexName),
		queryFn: () => elasticsearchService.getIndexMapping(indexName),
		enabled: enabled && !!indexName,
	});
}

export function useSearchDocuments(
	indexName: string,
	query?: any,
	from = 0,
	size = 10,
	enabled = true,
): UseQueryResult<SearchResponse, Error> {
	return useQuery({
		queryKey: queryKeys.searchDocuments(indexName, query, from, size),
		queryFn: () =>
			elasticsearchService.searchDocuments(indexName, query, from, size),
		enabled: enabled && !!indexName,
	});
}

export function useIndexStats(
	indexName: string,
	enabled = true,
): UseQueryResult<any, Error> {
	return useQuery({
		queryKey: queryKeys.indexStats(indexName),
		queryFn: () => elasticsearchService.getIndexStats(indexName),
		enabled: enabled && !!indexName,
		refetchInterval: 30000,
	});
}

export function useDocumentCount(
	indexName: string,
	query?: any,
	enabled = true,
): UseQueryResult<number, Error> {
	return useQuery({
		queryKey: queryKeys.documentCount(indexName, query),
		queryFn: () => elasticsearchService.countDocuments(indexName, query),
		enabled: enabled && !!indexName,
	});
}

export function useClusterStats(): UseQueryResult<ElasticsearchStats, Error> {
	return useQuery({
		queryKey: queryKeys.clusterStats(),
		queryFn: () => elasticsearchService.getClusterStats(),
		refetchInterval: 30000,
	});
}

export function useClusterInfo(): UseQueryResult<any, Error> {
	return useQuery({
		queryKey: queryKeys.clusterInfo(),
		queryFn: () => elasticsearchService.getClusterInfo(),
	});
}

export function useConnectionTest(): UseQueryResult<boolean, Error> {
	return useQuery({
		queryKey: [...queryKeys.all, "connection-test"],
		queryFn: () => elasticsearchService.testConnection(),
		retry: 1,
	});
}
