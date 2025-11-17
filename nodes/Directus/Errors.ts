/**
 * Custom error classes for Directus API errors
 */

export class DirectusApiError extends Error {
	constructor(
		message: string,
		public statusCode: number,
		public errors?: any[],
		public endpoint?: string,
	) {
		super(message);
		this.name = 'DirectusApiError';
		Error.captureStackTrace(this, this.constructor);
	}
}

export class DirectusRateLimitError extends DirectusApiError {
	constructor(
		message: string,
		public retryAfter?: number,
		endpoint?: string,
	) {
		super(message, 429, undefined, endpoint);
		this.name = 'DirectusRateLimitError';
	}
}

export class DirectusAuthenticationError extends DirectusApiError {
	constructor(message: string, endpoint?: string) {
		super(message, 401, undefined, endpoint);
		this.name = 'DirectusAuthenticationError';
	}
}

export class DirectusPermissionError extends DirectusApiError {
	constructor(message: string, endpoint?: string) {
		super(message, 403, undefined, endpoint);
	this.name = 'DirectusPermissionError';
	}
}

export class DirectusValidationError extends DirectusApiError {
	constructor(
		message: string,
		public errors: any[],
		endpoint?: string,
	) {
		super(message, 400, errors, endpoint);
		this.name = 'DirectusValidationError';
	}
}

export class DirectusNetworkError extends Error {
	constructor(
		message: string,
		public originalError?: any,
	) {
		super(message);
		this.name = 'DirectusNetworkError';
		Error.captureStackTrace(this, this.constructor);
	}
}

export class DirectusTimeoutError extends DirectusNetworkError {
	constructor(message: string, public timeout: number) {
		super(message);
		this.name = 'DirectusTimeoutError';
	}
}
