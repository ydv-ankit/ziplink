import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ShortUrlRedirect() {
	const { short } = useParams<{ short: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!short) {
			navigate("/");
			return;
		}

		// Validate that it looks like a short URL (7 alphanumeric characters)
		// This prevents matching routes like /api, /login, etc.
		if (!/^[a-zA-Z0-9]{7}$/.test(short)) {
			navigate("/");
			return;
		}

		let isMounted = true;

		const resolveUrl = async () => {
			const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
			
			// First, try to get the redirect location using fetch with manual redirect
			try {
				setLoading(true);
				const response = await fetch(`${API_BASE_URL}/${short}`, {
					method: "GET",
					credentials: "include",
					redirect: "manual", // Don't follow redirects automatically to avoid CORS
				});

				// Check if component is still mounted
				if (!isMounted) return;

				// Check for redirect status codes (301, 302, 307, 308)
				if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
					const location = response.headers.get("Location");
					if (location) {
						// Redirect to the long URL
						window.location.href = location;
						return;
					}
				}

				// Check for error status codes
				if (response.status === 404) {
					if (isMounted) {
						setError("URL not found");
						setLoading(false);
					}
					return;
				}

				if (response.status === 410) {
					if (isMounted) {
						setError("URL has expired");
						setLoading(false);
					}
					return;
				}

				// If status is 0 or other error, it might be CORS or network issue
				// In this case, redirect directly to API endpoint and let server handle it
				if (response.status === 0 || response.status >= 400) {
					// Redirect directly to API - server will handle the redirect
					// This bypasses CORS issues
					window.location.href = `${API_BASE_URL}/${short}`;
					return;
				}

				// Try to parse JSON error response for other status codes
				if (isMounted) {
					try {
						const errorData = await response.json();
						setError(errorData.message || "Failed to resolve URL");
						setLoading(false);
					} catch {
						setError(`Failed to resolve URL (Status: ${response.status})`);
						setLoading(false);
					}
				}
			} catch (err) {
				// If fetch fails (network error, CORS, etc.), redirect directly to API
				// The server will handle the redirect, bypassing CORS
				if (isMounted) {
					// Redirect to API endpoint - let the server handle the redirect
					window.location.href = `${API_BASE_URL}/${short}`;
				}
			}
		};

		resolveUrl();

		// Cleanup function to mark component as unmounted
		return () => {
			isMounted = false;
		};
	}, [short, navigate]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
					<p className="text-gray-600">Redirecting...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center max-w-md p-8 bg-white rounded-lg shadow">
					<svg
						className="mx-auto h-12 w-12 text-red-400 mb-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						{error}
					</h2>
					<button
						onClick={() => navigate("/")}
						className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition"
					>
						Go to Dashboard
					</button>
				</div>
			</div>
		);
	}

	return null;
}

