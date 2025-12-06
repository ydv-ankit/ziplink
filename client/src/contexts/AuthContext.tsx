import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api, ApiError } from "../services/api";
import type { User, LoginRequest, RegisterRequest } from "../types";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (data: LoginRequest) => Promise<void>;
	register: (data: RegisterRequest) => Promise<void>;
	logout: () => Promise<void>;
	error: string | null;
	clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "url_shortener_user";

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(() => {
		// Load user from localStorage on init
		const stored = localStorage.getItem(USER_STORAGE_KEY);
		return stored ? JSON.parse(stored) : null;
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Check if user is already logged in on mount
	useEffect(() => {
		checkAuth();
	}, []);

	// Save user to localStorage whenever it changes
	useEffect(() => {
		if (user) {
			localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
		} else {
			localStorage.removeItem(USER_STORAGE_KEY);
		}
	}, [user]);

	const checkAuth = async () => {
		// If we have user in localStorage, verify the session is still valid
		if (user) {
			try {
				await api.getUrls();
				// Session is valid, keep user
			} catch (error) {
				// Session expired or invalid
				if (error instanceof ApiError && error.status === 401) {
					setUser(null);
					localStorage.removeItem(USER_STORAGE_KEY);
				}
			}
		}
		setLoading(false);
	};

	const login = async (data: LoginRequest) => {
		try {
			setError(null);
			const response = await api.login(data);
			if (response.success && response.data) {
				setUser(response.data);
			}
		} catch (err) {
			const message =
				err instanceof ApiError
					? err.message
					: "Login failed. Please try again.";
			setError(message);
			throw err;
		}
	};

	const register = async (data: RegisterRequest) => {
		try {
			setError(null);
			const response = await api.register(data);
			if (response.success && response.data) {
				setUser(response.data);
			}
		} catch (err) {
			const message =
				err instanceof ApiError
					? err.message
					: "Registration failed. Please try again.";
			setError(message);
			throw err;
		}
	};

	const logout = async () => {
		try {
			await api.logout();
			setUser(null);
		} catch (err) {
			// Even if logout fails, clear user state
			setUser(null);
		}
	};

	const clearError = () => {
		setError(null);
	};

	return (
		<AuthContext.Provider
			value={{ user, loading, login, register, logout, error, clearError }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

