import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../services/api";

export default function Login() {
	const { login, error, clearError } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [localError, setLocalError] = useState<string | null>(null);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setLocalError(null);
		clearError();

		try {
			await login({ email, password });
			navigate("/");
		} catch (err) {
			if (err instanceof ApiError) {
				setLocalError(err.message);
			} else {
				setLocalError("An unexpected error occurred");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
				<h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
					Welcome Back
				</h2>
				<p className="text-gray-600 text-center mb-8">
					Sign in to manage your shortened URLs
				</p>

				{(error || localError) && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-sm text-red-600">{error || localError}</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Email
						</label>
						<input
							id="email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
							placeholder="you@example.com"
						/>
					</div>

					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Password
						</label>
						<input
							id="password"
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
							placeholder="••••••••"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
					>
						{loading ? "Signing in..." : "Sign In"}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-gray-600">
					Don't have an account?{" "}
					<Link
						to="/register"
						className="text-indigo-600 hover:text-indigo-700 font-medium"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}

