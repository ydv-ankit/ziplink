import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ShortUrlRedirect from "./components/ShortUrlRedirect";

function AppRoutes() {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	return (
		<Routes>
			<Route
				path="/login"
				element={user ? <Navigate to="/" replace /> : <Login />}
			/>
			<Route
				path="/register"
				element={user ? <Navigate to="/" replace /> : <Register />}
			/>
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<Dashboard />
					</ProtectedRoute>
				}
			/>
			{/* Route for short URLs - must be after root route */}
			<Route
				path="/:short"
				element={<ShortUrlRedirect />}
			/>
		</Routes>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</BrowserRouter>
	);
}
