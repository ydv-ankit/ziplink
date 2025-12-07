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

		(async()=>{
			try {
				setLoading(true);
				setError(null);
				const response = await fetch(`${import.meta.env.VITE_API_URL}/${short}`, {
					method: "GET",
					credentials: "include",
				});
				if (response.ok) {
					const data = await response.text();
					window.location.href = data;
				} else {
					throw new Error("Failed to resolve URL");
				}
			} catch (error) {
				setError(error instanceof Error ? error.message : "Failed to resolve URL");
			} finally {
				setLoading(false);
			}
		})()
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

