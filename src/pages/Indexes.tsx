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
				return "bg-emerald-50";
			case "yellow":
				return "bg-amber-50";
			case "red":
				return "bg-red-50";
			default:
				return "bg-slate-50";
		}
	};

	const getHealthTextColor = (health: string) => {
		switch (health) {
			case "green":
				return "text-emerald-700";
			case "yellow":
				return "text-amber-700";
			case "red":
				return "text-red-700";
			default:
				return "text-slate-700";
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
					<h2 className="text-2xl font-bold text-slate-900">Indexes</h2>
					<p className="mt-1 text-slate-600">
						Browse and manage your Elasticsearch indexes
					</p>
				</div>
				<div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
					{filteredIndexes.length} indexes found
				</div>
			</div>

			{/* Search Bar */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
				<input
					type="text"
					placeholder="Search indexes..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
				/>
			</div>

			{/* Indexes List */}
			<div className="space-y-3">
				{filteredIndexes.length === 0 ? (
					<Card>
						<div className="text-center py-12">
							<Database className="mx-auto h-16 w-16 text-slate-300" />
							<p className="mt-4 text-slate-500 text-lg">No indexes found</p>
							<p className="mt-1 text-slate-400">
								Try adjusting your search terms
							</p>
						</div>
					</Card>
				) : (
					filteredIndexes.map((index) => (
						<Card
							key={index.index}
							className="hover:shadow-lg transition-all duration-200 border-slate-200"
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
												className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors"
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
											<div className="bg-slate-50 p-3 rounded-lg">
												<div className="font-medium text-slate-700">
													Documents
												</div>
												<div className="text-slate-900 font-semibold">
													{formatNumber(index["docs.count"])}
												</div>
											</div>
											<div className="bg-slate-50 p-3 rounded-lg">
												<div className="font-medium text-slate-700">Size</div>
												<div className="text-slate-900 font-semibold">
													{formatSize(index["store.size"])}
												</div>
											</div>
											<div className="bg-slate-50 p-3 rounded-lg">
												<div className="font-medium text-slate-700">
													Primary Shards
												</div>
												<div className="text-slate-900 font-semibold">
													{index.pri}
												</div>
											</div>
											<div className="bg-slate-50 p-3 rounded-lg">
												<div className="font-medium text-slate-700">
													Replicas
												</div>
												<div className="text-slate-900 font-semibold">
													{index.rep}
												</div>
											</div>
										</div>
									</div>
								</div>
								<Link
									to={`/indexes/${encodeURIComponent(index.index)}`}
									className="ml-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
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
				className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200"
			>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200">
						<div className="h-4 w-4 rounded-full bg-emerald-500 shadow-sm" />
						<div>
							<span className="text-sm font-semibold text-slate-900">
								Green
							</span>
							<p className="text-xs text-slate-600">
								All primary and replica shards are active
							</p>
						</div>
					</div>
					<div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200">
						<div className="h-4 w-4 rounded-full bg-amber-500 shadow-sm" />
						<div>
							<span className="text-sm font-semibold text-slate-900">
								Yellow
							</span>
							<p className="text-xs text-slate-600">
								All primary shards are active, but not all replicas
							</p>
						</div>
					</div>
					<div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200">
						<div className="h-4 w-4 rounded-full bg-red-500 shadow-sm" />
						<div>
							<span className="text-sm font-semibold text-slate-900">Red</span>
							<p className="text-xs text-slate-600">
								Some primary shards are not active
							</p>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
