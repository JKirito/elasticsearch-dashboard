import { AlertCircle, ChevronRight, Database, Search } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useIndexes } from "../hooks/useElasticsearch";

export function Indexes() {
	const { data: indexes, isLoading, error, refetch } = useIndexes();
	const [searchTerm, setSearchTerm] = useState("");

	if (isLoading) {
		return <LoadingSpinner message="Loading indexes..." />;
	}

	if (error) {
		return <ErrorMessage error={error} retry={refetch} />;
	}

	const filteredIndexes =
		indexes?.filter((index) =>
			index.index.toLowerCase().includes(searchTerm.toLowerCase()),
		) || [];

	const getHealthColor = (health: string) => {
		switch (health) {
			case "green":
				return "bg-emerald-500";
			case "yellow":
				return "bg-amber-500";
			case "red":
				return "bg-red-500";
			default:
				return "bg-slate-400";
		}
	};

	const getHealthBgColor = (health: string) => {
		switch (health) {
			case "green":
				return "bg-emerald-50 dark:bg-catppuccin-green/20";
			case "yellow":
				return "bg-amber-50 dark:bg-catppuccin-yellow/20";
			case "red":
				return "bg-red-50 dark:bg-catppuccin-red/20";
			default:
				return "bg-gray-50 dark:bg-catppuccin-surface0";
		}
	};

	const getHealthTextColor = (health: string) => {
		switch (health) {
			case "green":
				return "text-emerald-700 dark:text-catppuccin-green";
			case "yellow":
				return "text-amber-700 dark:text-catppuccin-yellow";
			case "red":
				return "text-red-700 dark:text-catppuccin-red";
			default:
				return "text-gray-700 dark:text-catppuccin-text";
		}
	};

	const formatSize = (size: string): string => {
		if (!size) return "0 B";
		return size;
	};

	const formatNumber = (num: string): string => {
		if (!num) return "0";
		return parseInt(num, 10).toLocaleString();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-catppuccin-text text-left">Indexes</h2>
					<p className="mt-1 text-gray-600 dark:text-catppuccin-subtext1">
						Browse and manage your Elasticsearch indexes
					</p>
				</div>
				<div className="text-sm text-gray-500 dark:text-catppuccin-white bg-gray-100 dark:bg-catppuccin-surface0 px-3 py-1 rounded-full">
					{filteredIndexes.length} indexes found
				</div>
			</div>

			{/* Search Bar */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-catppuccin-overlay1 h-5 w-5" />
				<input
					type="text"
					placeholder="Search indexes..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-catppuccin-surface2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-catppuccin-surface0 text-gray-900 dark:text-catppuccin-text shadow-sm"
				/>
			</div>

			{/* Indexes List */}
			<div className="space-y-3">
				{filteredIndexes.length === 0 ? (
					<Card>
						<div className="text-center py-12">
							<Database className="mx-auto h-16 w-16 text-gray-300 dark:text-catppuccin-overlay0" />
							<p className="mt-4 text-gray-500 dark:text-catppuccin-subtext1 text-lg">No indexes found</p>
							<p className="mt-1 text-gray-400 dark:text-catppuccin-subtext0">
								Try adjusting your search terms
							</p>
						</div>
					</Card>
				) : (
					filteredIndexes.map((index) => (
						<Card
							key={index.index}
							className="hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-catppuccin-surface1"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-4 flex-1">
									<div
										className={`h-4 w-4 rounded-full ${getHealthColor(index.health)} shadow-sm`}
									/>
									<div className="flex-1">
										<div className="flex items-center space-x-3">
											<Link
												to={`/indexes/${encodeURIComponent(index.index)}`}
												className="text-lg font-semibold text-gray-900 dark:text-catppuccin-text hover:text-blue-600 dark:hover:text-catppuccin-blue transition-colors"
											>
												{index.index}
											</Link>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthBgColor(index.health)} ${getHealthTextColor(index.health)}`}
											>
												{index.health}
											</span>
										</div>
										<div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
											<div className="bg-gray-50 dark:bg-catppuccin-surface1 p-3 rounded-lg">
												<div className="font-medium text-gray-700 dark:text-catppuccin-subtext1">
													Documents
												</div>
												<div className="text-gray-900 dark:text-catppuccin-text font-semibold">
													{formatNumber(index["docs.count"])}
												</div>
											</div>
											<div className="bg-gray-50 dark:bg-catppuccin-surface1 p-3 rounded-lg">
												<div className="font-medium text-gray-700 dark:text-catppuccin-subtext1">Size</div>
												<div className="text-gray-900 dark:text-catppuccin-text font-semibold">
													{formatSize(index["store.size"])}
												</div>
											</div>
											<div className="bg-gray-50 dark:bg-catppuccin-surface1 p-3 rounded-lg">
												<div className="font-medium text-gray-700 dark:text-catppuccin-subtext1">
													Primary Shards
												</div>
												<div className="text-gray-900 dark:text-catppuccin-text font-semibold">
													{index.pri}
												</div>
											</div>
											<div className="bg-gray-50 dark:bg-catppuccin-surface1 p-3 rounded-lg">
												<div className="font-medium text-gray-700 dark:text-catppuccin-subtext1">
													Replicas
												</div>
												<div className="text-gray-900 dark:text-catppuccin-text font-semibold">
													{index.rep}
												</div>
											</div>
										</div>
									</div>
								</div>
								<Link
									to={`/indexes/${encodeURIComponent(index.index)}`}
									className="ml-4 p-2 text-gray-400 dark:text-catppuccin-overlay1 hover:text-blue-600 dark:hover:text-catppuccin-blue hover:bg-blue-50 dark:hover:bg-catppuccin-surface0 rounded-lg transition-all duration-200"
								>
									<ChevronRight className="h-5 w-5" />
								</Link>
							</div>
						</Card>
					))
				)}
			</div>

			{/* Index Health Legend */}
			<Card
				title="Index Health Legend"
				className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-catppuccin-surface0 dark:to-catppuccin-surface1 border-gray-200 dark:border-catppuccin-surface1"
			>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="flex items-center space-x-3 p-3 bg-white dark:bg-catppuccin-surface0 rounded-lg border border-gray-200 dark:border-catppuccin-surface1">
						<div className="h-4 w-4 rounded-full bg-emerald-500 shadow-sm" />
						<div>
							<span className="text-sm font-semibold text-gray-900 dark:text-catppuccin-text">
								Green
							</span>
							<p className="text-xs text-gray-600 dark:text-catppuccin-subtext1">
								All primary and replica shards are active
							</p>
						</div>
					</div>
					<div className="flex items-center space-x-3 p-3 bg-white dark:bg-catppuccin-surface0 rounded-lg border border-gray-200 dark:border-catppuccin-surface1">
						<div className="h-4 w-4 rounded-full bg-amber-500 shadow-sm" />
						<div>
							<span className="text-sm font-semibold text-gray-900 dark:text-catppuccin-text">
								Yellow
							</span>
							<p className="text-xs text-gray-600 dark:text-catppuccin-subtext1">
								All primary shards are active, but not all replicas
							</p>
						</div>
					</div>
					<div className="flex items-center space-x-3 p-3 bg-white dark:bg-catppuccin-surface0 rounded-lg border border-gray-200 dark:border-catppuccin-surface1">
						<div className="h-4 w-4 rounded-full bg-red-500 shadow-sm" />
						<div>
							<span className="text-sm font-semibold text-gray-900 dark:text-catppuccin-text">Red</span>
							<p className="text-xs text-gray-600 dark:text-catppuccin-subtext1">
								Some primary shards are not active
							</p>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
