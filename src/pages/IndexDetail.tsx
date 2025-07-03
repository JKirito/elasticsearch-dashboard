import { ArrowLeft, FileText, Filter, Search, Settings, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { ErrorMessage } from "../components/ErrorMessage";
import { JsonViewer } from "../components/JsonViewer";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
	useDocumentCount,
	useIndexMapping,
	useIndexStats,
	useSearchDocuments,
} from "../hooks/useElasticsearch";

interface SearchFilters {
	file_size?: {
		min?: number;
		max?: number;
	};
	file_type?: string;
	project_code?: string;
}

export function IndexDetail() {
	const { indexName = "" } = useParams<{ indexName: string }>();
	const decodedIndexName = decodeURIComponent(indexName);
	const [activeTab, setActiveTab] = useState<
		"documents" | "mapping" | "settings"
	>("documents");
	const [currentPage, setCurrentPage] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeSearchQuery, setActiveSearchQuery] = useState("");
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
	const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
	const [activeSearchFilters, setActiveSearchFilters] = useState<SearchFilters>(
		{},
	);
	const pageSize = 10;

	const {
		data: mapping,
		isLoading: isLoadingMapping,
		error: mappingError,
	} = useIndexMapping(decodedIndexName);
	const {
		data: stats,
		isLoading: isLoadingStats,
		error: statsError,
	} = useIndexStats(decodedIndexName);
	const { data: totalCount } = useDocumentCount(decodedIndexName);

	const buildQuery = () => {
		const mustClauses: any[] = [];
		const filterClauses: any[] = [];

		// Text search
		if (activeSearchQuery) {
			mustClauses.push({
				query_string: {
					query: activeSearchQuery,
				},
			});
		}

		// File size filter
		if (activeSearchFilters.file_size) {
			const sizeFilter: any = { range: { file_size: {} } };
			if (activeSearchFilters.file_size.min !== undefined) {
				sizeFilter.range.file_size.gte = activeSearchFilters.file_size.min;
			}
			if (activeSearchFilters.file_size.max !== undefined) {
				sizeFilter.range.file_size.lte = activeSearchFilters.file_size.max;
			}
			filterClauses.push(sizeFilter);
		}

		// File type filter
		if (activeSearchFilters.file_type) {
			filterClauses.push({
				term: {
					file_type: activeSearchFilters.file_type,
				},
			});
		}

		// Project code filter
		if (activeSearchFilters.project_code) {
			filterClauses.push({
				term: {
					project_code: activeSearchFilters.project_code,
				},
			});
		}

		// Build final query
		if (mustClauses.length === 0 && filterClauses.length === 0) {
			return undefined;
		}

		return {
			query: {
				bool: {
					...(mustClauses.length > 0 && { must: mustClauses }),
					...(filterClauses.length > 0 && { filter: filterClauses }),
				},
			},
		};
	};

	const query = buildQuery();

	const {
		data: searchResults,
		isLoading: isLoadingSearch,
		error: searchError,
	} = useSearchDocuments(
		decodedIndexName,
		query,
		currentPage * pageSize,
		pageSize,
	);

	const handleSearch = () => {
		setActiveSearchQuery(searchQuery);
		setActiveSearchFilters(searchFilters);
		setCurrentPage(0);
	};

	const handleClearSearch = () => {
		setSearchQuery("");
		setActiveSearchQuery("");
		setSearchFilters({});
		setActiveSearchFilters({});
		setCurrentPage(0);
	};

	const updateFilter = (key: keyof SearchFilters, value: any) => {
		setSearchFilters((prev) => ({ ...prev, [key]: value }));
	};

	const clearFilter = (key: keyof SearchFilters) => {
		setSearchFilters((prev) => {
			const newFilters = { ...prev };
			delete newFilters[key];
			return newFilters;
		});
	};

	const hasActiveFilters = Object.keys(activeSearchFilters).length > 0;

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	if (isLoadingMapping || isLoadingStats) {
		return <LoadingSpinner message="Loading index details..." />;
	}

	if (mappingError || statsError) {
		return (
			<ErrorMessage error={mappingError || statsError || "Unknown error"} />
		);
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
				<div className="space-y-4">
					<div className="flex gap-2">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
							<input
								type="text"
								placeholder="Search documents (e.g., field:value)..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={handleKeyDown}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-catppuccin-surface2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-catppuccin-surface0 text-gray-900 dark:text-catppuccin-text"
							/>
						</div>
						<button
							type="button"
							onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
							className={`px-4 py-2 rounded-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-catppuccin-base transition-colors duration-150 flex items-center gap-2 ${
								showAdvancedFilters
									? "bg-gray-600 dark:bg-catppuccin-overlay1 text-white hover:bg-gray-700 dark:hover:bg-catppuccin-overlay2 focus:ring-gray-500"
									: "bg-gray-500 dark:bg-catppuccin-overlay0 text-white hover:bg-gray-600 dark:hover:bg-catppuccin-overlay1 focus:ring-gray-500"
							}`}
						>
							<Filter className="h-4 w-4" />
							Filters
						</button>
						<button
							type="button"
							onClick={handleSearch}
							className="px-4 py-2 bg-blue-600 dark:bg-catppuccin-blue text-white rounded-lg hover:bg-blue-700 dark:hover:bg-catppuccin-sapphire focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-catppuccin-base transition-colors duration-150 flex items-center gap-2"
						>
							<Search className="h-4 w-4" />
							Search
						</button>
						{(activeSearchQuery || hasActiveFilters) && (
							<button
								type="button"
								onClick={handleClearSearch}
								className="px-4 py-2 bg-gray-500 dark:bg-catppuccin-overlay1 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-catppuccin-overlay2 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-catppuccin-base transition-colors duration-150"
							>
								Clear
							</button>
						)}
					</div>

					{/* Advanced Filters */}
					{showAdvancedFilters && (
						<div className="bg-gray-50 dark:bg-catppuccin-surface0 border border-gray-200 dark:border-catppuccin-surface1 rounded-lg p-4">
							<h4 className="text-sm font-medium text-gray-900 dark:text-catppuccin-text mb-3">
								Advanced Filters
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{/* File Size Filter */}
								<div className="space-y-2">
									<label
										htmlFor="fileSizeMin"
										className="block text-sm font-medium text-gray-700 dark:text-catppuccin-subtext1"
									>
										File Size (bytes)
									</label>
									<div className="flex gap-2">
										<div className="flex items-center gap-1 flex-1 px-3 py-2 border border-gray-300 dark:border-catppuccin-surface2 rounded-md bg-white dark:bg-catppuccin-surface0 min-w-0">
											<input
												type="number"
												placeholder="Min"
												value={searchFilters.file_size?.min || ""}
												onChange={(e) => {
													const value = e.target.value
														? Number(e.target.value)
														: undefined;
													updateFilter("file_size", {
														...searchFilters.file_size,
														min: value,
													});
												}}
												className="flex-1 min-w-0 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-catppuccin-text p-0"
											/>
											<span className="text-xs text-gray-500 dark:text-catppuccin-subtext0 flex-shrink-0 px-1">
												-
											</span>
											<input
												type="number"
												placeholder="Max"
												value={searchFilters.file_size?.max || ""}
												onChange={(e) => {
													const value = e.target.value
														? Number(e.target.value)
														: undefined;
													updateFilter("file_size", {
														...searchFilters.file_size,
														max: value,
													});
												}}
												className="flex-1 min-w-0 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-catppuccin-text p-0"
											/>
										</div>
										{searchFilters.file_size && (
											<button
												type="button"
												onClick={() => clearFilter("file_size")}
												className="px-2 py-2 text-gray-500 dark:text-catppuccin-subtext0 hover:text-gray-700 dark:hover:text-catppuccin-text"
											>
												<X className="h-4 w-4" />
											</button>
										)}
									</div>
								</div>

								{/* File Type Filter */}
								<div className="space-y-2">
									<label
										htmlFor="fileType"
										className="block text-sm font-medium text-gray-700 dark:text-catppuccin-subtext1"
									>
										File Type
									</label>
									<div className="flex gap-2">
										<input
											type="text"
											placeholder="e.g., pdf, docx, txt"
											value={searchFilters.file_type || ""}
											onChange={(e) =>
												updateFilter("file_type", e.target.value || undefined)
											}
											className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-catppuccin-surface2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-catppuccin-surface0 text-gray-900 dark:text-catppuccin-text"
										/>
										{searchFilters.file_type && (
											<button
												type="button"
												onClick={() => clearFilter("file_type")}
												className="px-2 py-2 text-gray-500 dark:text-catppuccin-subtext0 hover:text-gray-700 dark:hover:text-catppuccin-text"
											>
												<X className="h-4 w-4" />
											</button>
										)}
									</div>
								</div>

								{/* Project Code Filter */}
								<div className="space-y-2">
									<label
										htmlFor="projectCode"
										className="block text-sm font-medium text-gray-700 dark:text-catppuccin-subtext1"
									>
										Project Code
									</label>
									<div className="flex gap-2">
										<input
											type="text"
											placeholder="e.g., PROJ-001"
											value={searchFilters.project_code || ""}
											onChange={(e) =>
												updateFilter(
													"project_code",
													e.target.value || undefined,
												)
											}
											className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-catppuccin-surface2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-catppuccin-surface0 text-gray-900 dark:text-catppuccin-text"
										/>
										{searchFilters.project_code && (
											<button
												type="button"
												onClick={() => clearFilter("project_code")}
												className="px-2 py-2 text-gray-500 dark:text-catppuccin-subtext0 hover:text-gray-700 dark:hover:text-catppuccin-text"
											>
												<X className="h-4 w-4" />
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Search Status */}
				{(activeSearchQuery || hasActiveFilters) && (
					<div className="bg-blue-50 dark:bg-catppuccin-surface0 border border-blue-200 dark:border-catppuccin-surface1 rounded-lg p-3">
						<div className="flex items-center gap-2 flex-wrap">
							<Search className="h-4 w-4 text-blue-600 dark:text-catppuccin-blue" />
							{activeSearchQuery && (
								<span className="text-sm text-blue-800 dark:text-catppuccin-text">
									Searching for:{" "}
									<span className="font-semibold">"{activeSearchQuery}"</span>
								</span>
							)}
							{/* Active Filters */}
							{activeSearchFilters.file_size && (
								<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-catppuccin-surface1 text-blue-800 dark:text-catppuccin-text">
									File Size:{" "}
									{activeSearchFilters.file_size.min &&
										`≥${activeSearchFilters.file_size.min}`}
									{activeSearchFilters.file_size.min &&
										activeSearchFilters.file_size.max &&
										" "}
									{activeSearchFilters.file_size.max &&
										`≤${activeSearchFilters.file_size.max}`}
								</span>
							)}
							{activeSearchFilters.file_type && (
								<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-catppuccin-surface1 text-blue-800 dark:text-catppuccin-text">
									File Type: {activeSearchFilters.file_type}
								</span>
							)}
							{activeSearchFilters.project_code && (
								<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-catppuccin-surface1 text-blue-800 dark:text-catppuccin-text">
									Project: {activeSearchFilters.project_code}
								</span>
							)}
							<span className="text-sm text-blue-600 dark:text-catppuccin-subtext1">
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
							<p className="text-gray-500 dark:text-catppuccin-subtext1 font-medium">
								No documents found
							</p>
							<p className="text-sm text-gray-400 dark:text-catppuccin-subtext0 mt-1">
								Try adjusting your search query
							</p>
						</div>
					) : (
						searchResults?.hits.hits.map((doc) => (
							<div
								key={doc._id}
								className="border border-gray-200 dark:border-catppuccin-surface1 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-catppuccin-surface0 transition-colors duration-150"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="mb-3 flex items-center justify-between">
											<div>
												<span className="text-sm font-medium text-gray-500 dark:text-catppuccin-subtext0">
													Document ID:
												</span>
												<span className="ml-2 text-sm font-semibold text-gray-900 dark:text-catppuccin-text">
													{doc._id}
												</span>
											</div>
											{doc._score && (
												<span className="text-xs text-gray-500 dark:text-catppuccin-subtext0">
													Score: {doc._score.toFixed(4)}
												</span>
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
							type="button"
							onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
							disabled={currentPage === 0}
							className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-catppuccin-subtext1 bg-white dark:bg-catppuccin-surface0 border border-gray-300 dark:border-catppuccin-surface2 rounded-md hover:bg-gray-50 dark:hover:bg-catppuccin-surface1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
						>
							Previous
						</button>
						<span className="text-sm text-gray-700 dark:text-catppuccin-text">
							Page {currentPage + 1} of {totalPages}
						</span>
						<button
							type="button"
							onClick={() =>
								setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
							}
							disabled={currentPage === totalPages - 1}
							className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-catppuccin-subtext1 bg-white dark:bg-catppuccin-surface0 border border-gray-300 dark:border-catppuccin-surface2 rounded-md hover:bg-gray-50 dark:hover:bg-catppuccin-surface1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
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
				<h3 className="text-lg font-medium text-gray-900 dark:text-catppuccin-text">
					Field Mappings
				</h3>
				<JsonViewer data={properties} />
			</div>
		);
	};

	const renderSettings = () => {
		const settings = indexInfo?.settings?.index || {};

		return (
			<div className="space-y-4">
				<h3 className="text-lg font-medium text-gray-900 dark:text-catppuccin-text">
					Index Settings
				</h3>
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
					className="p-2 text-gray-600 dark:text-catppuccin-subtext1 hover:text-gray-900 dark:hover:text-catppuccin-text hover:bg-gray-100 dark:hover:bg-catppuccin-surface0 rounded-lg"
				>
					<ArrowLeft className="h-5 w-5" />
				</Link>
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-catppuccin-text">
						{decodedIndexName}
					</h2>
					<p className="mt-1 text-gray-600 dark:text-catppuccin-subtext1">
						Index details and document browser
					</p>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card className="bg-white">
					<div className="text-center">
						<p className="text-sm font-medium text-gray-500 dark:text-catppuccin-subtext0">
							Total Documents
						</p>
						<p className="mt-1 text-2xl font-bold text-gray-900 dark:text-catppuccin-text">
							{indexStats?.primaries?.docs?.count?.toLocaleString() || 0}
						</p>
					</div>
				</Card>
				<Card className="bg-white">
					<div className="text-center">
						<p className="text-sm font-medium text-gray-500 dark:text-catppuccin-subtext0">
							Primary Size
						</p>
						<p className="mt-1 text-2xl font-bold text-gray-900 dark:text-catppuccin-text">
							{formatBytes(indexStats?.primaries?.store?.size_in_bytes || 0)}
						</p>
					</div>
				</Card>
				<Card className="bg-white">
					<div className="text-center">
						<p className="text-sm font-medium text-gray-500 dark:text-catppuccin-subtext0">
							Total Size
						</p>
						<p className="mt-1 text-2xl font-bold text-gray-900 dark:text-catppuccin-text">
							{formatBytes(indexStats?.total?.store?.size_in_bytes || 0)}
						</p>
					</div>
				</Card>
				<Card className="bg-white">
					<div className="text-center">
						<p className="text-sm font-medium text-gray-500 dark:text-catppuccin-subtext0">
							Segments
						</p>
						<p className="mt-1 text-2xl font-bold text-gray-900 dark:text-catppuccin-text">
							{indexStats?.primaries?.segments?.count || 0}
						</p>
					</div>
				</Card>
			</div>

			{/* Tabs */}
			<div className="border-b border-gray-200 dark:border-catppuccin-surface1">
				<nav className="-mb-px flex space-x-8">
					<button
						type="button"
						onClick={() => setActiveTab("documents")}
						className={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === "documents"
								? "border-blue-500 text-blue-600 dark:text-catppuccin-blue"
								: "border-transparent text-gray-500 dark:text-catppuccin-subtext0 hover:text-gray-700 dark:hover:text-catppuccin-text hover:border-gray-300 dark:hover:border-catppuccin-surface2"
						}`}
					>
						<FileText className="inline-block h-5 w-5 mr-1" />
						Documents
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("mapping")}
						className={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === "mapping"
								? "border-blue-500 text-blue-600 dark:text-catppuccin-blue"
								: "border-transparent text-gray-500 dark:text-catppuccin-subtext0 hover:text-gray-700 dark:hover:text-catppuccin-text hover:border-gray-300 dark:hover:border-catppuccin-surface2"
						}`}
					>
						<Settings className="inline-block h-5 w-5 mr-1" />
						Mapping
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("settings")}
						className={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === "settings"
								? "border-blue-500 text-blue-600 dark:text-catppuccin-blue"
								: "border-transparent text-gray-500 dark:text-catppuccin-subtext0 hover:text-gray-700 dark:hover:text-catppuccin-text hover:border-gray-300 dark:hover:border-catppuccin-surface2"
						}`}
					>
						<Settings className="inline-block h-5 w-5 mr-1" />
						Settings
					</button>
				</nav>
			</div>

			{/* Tab Content */}
			<Card className="bg-white min-h-[400px]">
				{activeTab === "documents" && renderDocuments()}
				{activeTab === "mapping" && renderMapping()}
				{activeTab === "settings" && renderSettings()}
			</Card>
		</div>
	);
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}
