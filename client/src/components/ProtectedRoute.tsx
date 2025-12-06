import { type ReactNode, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
	children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { user, loading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!loading && !user) {
			navigate("/login");
		}
	}, [user, loading, navigate]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return <>{children}</>;
}

