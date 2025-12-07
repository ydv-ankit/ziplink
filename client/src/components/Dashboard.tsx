import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, ApiError } from "../services/api";
import type { Url } from "../types";
import CreateUrlModal from "./CreateUrlModal";
import Toast from "./Toast";
import ConfirmModal from "./ConfirmModal";

export default function Dashboard() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [urls, setUrls] = useState<Url[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<{
		isOpen: boolean;
		urlId: string | null;
	}>({ isOpen: false, urlId: null });
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const fetchUrls = async (isBackgroundRefresh = false) => {
		if (!isBackgroundRefresh) {
			setLoading(true);
		}
		setError(null);

		try {
			const response = await api.getUrls();
			if (response.success && response.data) {
				setUrls(response.data);
			}
		} catch (err) {
			// Only show error on initial load, not on background refreshes
			if (!isBackgroundRefresh) {
				if (err instanceof ApiError) {
					setError(err.message);
				} else {
					setError("Failed to load URLs. Please try again.");
				}
			}
		} finally {
			if (!isBackgroundRefresh) {
				setLoading(false);
			}
		}
	};

	useEffect(() => {
		// Initial fetch
		fetchUrls(false);

		// Set up interval to refresh every 10 seconds
		intervalRef.current = setInterval(() => {
			fetchUrls(true);
		}, 10000);

		// Cleanup interval on unmount
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
		} catch (err) {
			// Even if logout fails, navigate to login
			navigate("/login");
		}
	};

	const handleDeleteClick = (id: string) => {
		setConfirmDelete({ isOpen: true, urlId: id });
	};

	const handleDeleteConfirm = async () => {
		if (!confirmDelete.urlId) return;

		const id = confirmDelete.urlId;
		setDeletingId(id);
		try {
			await api.deleteUrl({ id });
			setUrls(urls.filter((url) => url.id !== id));
		} catch (err) {
			if (err instanceof ApiError) {
				alert(err.message);
			} else {
				alert("Failed to delete URL. Please try again.");
			}
		} finally {
			setDeletingId(null);
			setConfirmDelete({ isOpen: false, urlId: null });
		}
	};

	const handleUrlCreated = (newUrl: Url) => {
		setUrls([newUrl, ...urls]);
	};

	const copyToClipboard = async (text: string) => {
		const shortUrl = `${window.location.origin}/${text}`;
		try {
			await navigator.clipboard.writeText(shortUrl);
			setToastMessage("URL copied to clipboard!");
		} catch (err) {
			// Fallback for older browsers
			const textArea = document.createElement("textarea");
			textArea.value = shortUrl;
			document.body.appendChild(textArea);
			textArea.select();
			try {
				document.execCommand("copy");
				setToastMessage("URL copied to clipboard!");
			} catch (e) {
				setToastMessage("Failed to copy URL");
			}
			document.body.removeChild(textArea);
		}
	};

	const formatDate = (dateString: string) => {
		// Handle zero date values from GORM
		if (!dateString || dateString === "0001-01-01T00:00:00Z") {
			return "N/A";
		}
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatExpiryDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const isExpired = (expiryString: string) => {
		return new Date(expiryString) < new Date();
	};

	const isExpiringSoon = (expiryString: string) => {
		const expiryDate = new Date(expiryString);
		const now = new Date();
		const daysUntilExpiry = Math.ceil(
			(expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
		);
		return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								ZipLink
							</h1>
							{user && (
								<p className="text-sm text-gray-600 mt-1">
									Welcome, {user.name}
								</p>
							)}
						</div>
						<button
							onClick={handleLogout}
							className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition"
						>
							Logout
						</button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Action Bar */}
				<div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h2 className="text-xl font-semibold text-gray-900">
							Your Shortened URLs
						</h2>
						<p className="text-sm text-gray-600 mt-1">
							Manage and track all your shortened links
						</p>
					</div>
					<button
						onClick={() => setIsModalOpen(true)}
						className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer transition"
					>
						+ Create New URL
					</button>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-sm text-red-600">{error}</p>
					</div>
				)}

				{/* URLs Table */}
				{loading ? (
					<div className="bg-white rounded-lg shadow p-8 text-center">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
						<p className="mt-4 text-gray-600">Loading URLs...</p>
					</div>
				) : urls.length === 0 ? (
					<div className="bg-white rounded-lg shadow p-12 text-center">
						<svg
							className="mx-auto h-12 w-12 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
							/>
						</svg>
						<h3 className="mt-4 text-lg font-medium text-gray-900">
							No URLs yet
						</h3>
						<p className="mt-2 text-sm text-gray-600">
							Get started by creating your first shortened URL.
						</p>
						<button
							onClick={() => setIsModalOpen(true)}
							className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 cursor-pointer transition"
						>
							Create Your First URL
						</button>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Short URL
										</th>
										<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
											Original URL
										</th>
										<th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
											Clicks
										</th>
										<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
											Created
										</th>
										<th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
											Expires
										</th>
										<th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{urls.map((url) => {
										const shortUrl = `${window.location.origin}/${url.short}`;
										const expired = isExpired(url.expiry);
										const expiringSoon = isExpiringSoon(url.expiry);
										return (
											<tr
												key={url.id}
												className={`hover:bg-gray-50 transition ${
													expired ? "opacity-60" : ""
												}`}
											>
												<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
													<div className="flex items-center gap-2">
														<a
															href={shortUrl}
															target="_blank"
															rel="noopener noreferrer"
															className={`font-mono text-sm break-all ${
																expired
																	? "text-gray-400 line-through"
																	: "text-indigo-600 hover:text-indigo-700"
															}`}
														>
															/{url.short}
														</a>
														<button
															onClick={() => copyToClipboard(url.short)}
															className="text-gray-400 hover:text-gray-600 cursor-pointer transition"
															title="Copy to clipboard"
														>
															<svg
																className="w-4 h-4"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
																/>
															</svg>
														</button>
													</div>
													<div className="md:hidden mt-1 space-y-1">
														<a
															href={url.long}
															target="_blank"
															rel="noopener noreferrer"
															className="text-xs text-gray-500 truncate block max-w-xs"
														>
															{url.long}
														</a>
														<div className="flex items-center gap-2">
															<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
																{url.clicks || 0} clicks
															</span>
															<div className="xl:hidden">
																{expired ? (
																	<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
																		Expired
																	</span>
																) : expiringSoon ? (
																	<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
																		Expires: {formatExpiryDate(url.expiry)}
																	</span>
																) : (
																	<span className="text-xs text-gray-500">
																		Expires: {formatExpiryDate(url.expiry)}
																	</span>
																)}
															</div>
														</div>
													</div>
												</td>
												<td className="px-4 sm:px-6 py-4 hidden md:table-cell">
													<a
														href={url.long}
														target="_blank"
														rel="noopener noreferrer"
														className="text-sm text-gray-900 hover:text-indigo-600 truncate max-w-md block"
													>
														{url.long}
													</a>
												</td>
												<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
														{url.clicks || 0}
													</span>
												</td>
												<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
													{formatDate(url.CreatedAt)}
												</td>
												<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm hidden xl:table-cell">
													{expired ? (
														<span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
															Expired
														</span>
													) : expiringSoon ? (
														<div className="flex flex-col">
															<span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 w-fit mb-1">
																Expiring Soon
															</span>
															<span className="text-gray-500 text-xs">
																{formatExpiryDate(url.expiry)}
															</span>
														</div>
													) : (
														<span className="text-gray-500">
															{formatExpiryDate(url.expiry)}
														</span>
													)}
												</td>
												<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
													<button
														onClick={() => handleDeleteClick(url.id)}
														disabled={deletingId === url.id}
														className="text-red-600 disabled:opacity-50 border border-red-600 rounded-md px-2 py-1 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed cursor-pointer transition"
													>
														{deletingId === url.id ? (
															<div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
														) : (
															"Delete"
														)}
													</button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</main>

			{/* Create URL Modal */}
			<CreateUrlModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={handleUrlCreated}
			/>

			{/* Toast Notification */}
			<Toast
				message={toastMessage || ""}
				isVisible={!!toastMessage}
				onClose={() => setToastMessage(null)}
			/>

			{/* Confirm Delete Modal */}
			<ConfirmModal
				isOpen={confirmDelete.isOpen}
				onClose={() => setConfirmDelete({ isOpen: false, urlId: null })}
				onConfirm={handleDeleteConfirm}
				title="Delete URL"
				message="Are you sure you want to delete this URL? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
			/>
		</div>
	);
}
