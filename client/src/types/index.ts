export interface User {
	id: string;
	name: string;
	email: string;
}

export interface Url {
	ID: number;
	CreatedAt: string;
	UpdatedAt: string;
	DeletedAt: string | null;
	id: string;
	userId: string;
	long: string;
	short: string;
	expiry: string;
}

export interface ApiResponse<T = any> {
	message: string;
	success: boolean;
	data?: T;
	error?: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
}

export interface ShortenUrlRequest {
	long: string;
}

export interface DeleteUrlRequest {
	id: string;
}

