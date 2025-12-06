import type {
	ApiResponse,
	User,
	Url,
	LoginRequest,
	RegisterRequest,
	ShortenUrlRequest,
	DeleteUrlRequest,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiError extends Error {
	status: number;
	error?: string;

	constructor(status: number, message: string, error?: string) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.error = error;
	}
}

async function fetchApi<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	const url = `${API_BASE_URL}${endpoint}`;

	const defaultOptions: RequestInit = {
		credentials: "include", // Important for cookies
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		...options,
	};

	try {
		const response = await fetch(url, defaultOptions);

		// Check if API is available
		if (!response.ok && response.status >= 500) {
			throw new ApiError(
				response.status,
				"API server is unavailable. Please try again later.",
				"Server error"
			);
		}

		const data: ApiResponse<T> = await response.json();

		if (!data.success) {
			throw new ApiError(
				response.status,
				data.message || "An error occurred",
				data.error
			);
		}

		return data;
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}

		// Network error or API unavailable
		if (error instanceof TypeError && error.message.includes("fetch")) {
			throw new ApiError(
				0,
				"Unable to connect to the API server. Please check if the server is running.",
				"Network error"
			);
		}

		throw new ApiError(500, "An unexpected error occurred", String(error));
	}
}

export const api = {
	// Auth endpoints
	async register(data: RegisterRequest): Promise<ApiResponse<User>> {
		return fetchApi<User>("/api/v1/create-user", {
			method: "POST",
			body: JSON.stringify(data),
			credentials: "include",
		});
	},

	async login(data: LoginRequest): Promise<ApiResponse<User>> {
		const response = await fetchApi<{ userId: string; name: string; email: string }>(
			"/api/v1/login",
			{
				method: "POST",
				body: JSON.stringify(data),
				credentials: "include",
			}
		);
		// Normalize userId to id
		if (response.data) {
			return {
				...response,
				data: {
					id: response.data.userId,
					name: response.data.name,
					email: response.data.email,
				},
			} as ApiResponse<User>;
		}
		return { ...response, data: undefined } as ApiResponse<User>;
	},

	async logout(): Promise<ApiResponse> {
		return fetchApi("/api/v1/logout", {
			method: "POST",
			credentials: "include",
		});
	},

	// URL endpoints
	async getUrls(): Promise<ApiResponse<Url[]>> {
		return fetchApi<Url[]>("/api/v1/urls", {
			method: "GET",
			credentials: "include",
		});
	},

	async shortenUrl(data: ShortenUrlRequest): Promise<ApiResponse<Url>> {
		return fetchApi<Url>("/api/v1/shorten", {
			method: "POST",
			body: JSON.stringify(data),
			credentials: "include",
		});
	},

	async deleteUrl(data: DeleteUrlRequest): Promise<ApiResponse> {
		return fetchApi("/api/v1/delete", {
			method: "DELETE",
			body: JSON.stringify(data),
			credentials: "include",
		});
	},
};

export { ApiError };

