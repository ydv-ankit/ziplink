import { useState, type FormEvent } from "react";
import { api, ApiError } from "../services/api";
import type { Url } from "../types";

interface CreateUrlModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (url: Url) => void;
}

export default function CreateUrlModal({
	isOpen,
	onClose,
	onSuccess,
}: CreateUrlModalProps) {
	const [longUrl, setLongUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const response = await api.shortenUrl({ long: longUrl });
			if (response.success && response.data) {
				onSuccess(response.data);
				setLongUrl("");
				onClose();
			}
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message);
			} else {
				setError("Failed to create short URL. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setLongUrl("");
		setError(null);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 bg-opacity-50">
			<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-2xl font-bold text-gray-900">
						Create Short URL
					</h3>
					<button
						onClick={handleClose}
						className="text-gray-400 hover:text-gray-600 cursor-pointer transition"
						aria-label="Close"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{error && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-sm text-red-600">{error}</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="longUrl"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Long URL
						</label>
						<input
							id="longUrl"
							type="url"
							required
							value={longUrl}
							onChange={(e) => setLongUrl(e.target.value)}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
							placeholder="https://example.com/very/long/url"
						/>
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={handleClose}
							className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer transition"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
						>
							{loading ? "Creating..." : "Create"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

