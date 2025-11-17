import {
	IBinaryData,
	IBinaryKeyData,
	IDataObject,
	IHttpRequestOptions,
	INodeExecutionData,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	IPollFunctions,
	LoggerProxy as Logger,
	NodeApiError,
} from 'n8n-workflow';

import { Buffer } from 'buffer';

import {
	DirectusApiError,
	DirectusRateLimitError,
	DirectusAuthenticationError,
	DirectusPermissionError,
	DirectusValidationError,
	DirectusNetworkError,
	DirectusTimeoutError,
} from './Errors';

export interface IDirectusCredentials {
	url: string;
	authMethod: 'staticToken' | 'credentials';
	staticToken?: string;
	email?: string;
	password?: string;
	timeout?: number;
}

// Retry configuration
interface IRetryConfig {
	maxRetries: number;
	retryDelay: number;
	backoffMultiplier: number;
	retryableStatusCodes: number[];
}

const DEFAULT_RETRY_CONFIG: IRetryConfig = {
	maxRetries: 3,
	retryDelay: 1000,
	backoffMultiplier: 2,
	retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse error response and create appropriate error object
 */
function parseDirectusError(error: any, endpoint: string): Error {
	const statusCode = error.response?.status || error.statusCode || 0;
	const errorBody = error.response?.data || error.response?.body || {};
	const errorMessage = errorBody.errors?.[0]?.message || errorBody.message || error.message || 'Unknown error';

	// Handle specific error codes
	switch (statusCode) {
		case 401:
			return new DirectusAuthenticationError(
				`Authentication failed: ${errorMessage}. Check your API token or credentials.`,
				endpoint,
			);
		case 403:
			return new DirectusPermissionError(
				`Permission denied: ${errorMessage}. Check your user role has access to this resource.`,
				endpoint,
			);
		case 404:
			return new DirectusApiError(
				`Resource not found: ${errorMessage}. Endpoint: ${endpoint}`,
				404,
				errorBody.errors,
				endpoint,
			);
		case 429:
			const retryAfter = error.response?.headers?.['retry-after'];
			return new DirectusRateLimitError(
				`Rate limit exceeded: ${errorMessage}. ${retryAfter ? `Retry after ${retryAfter} seconds.` : ''}`,
				retryAfter ? parseInt(retryAfter, 10) : undefined,
				endpoint,
			);
		case 400:
		case 422:
			return new DirectusValidationError(
				`Validation error: ${errorMessage}`,
				errorBody.errors || [],
				endpoint,
			);
		default:
			if (statusCode >= 500) {
				return new DirectusApiError(
					`Server error: ${errorMessage}. Endpoint: ${endpoint}`,
					statusCode,
					errorBody.errors,
					endpoint,
				);
			}
			if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
				return new DirectusTimeoutError(
					`Request timeout: ${errorMessage}`,
					error.timeout || 30000,
				);
			}
			if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
				return new DirectusNetworkError(
					`Network error: Cannot connect to Directus instance. ${errorMessage}`,
					error,
				);
			}
			return new DirectusApiError(
				`Directus API Error: ${errorMessage}`,
				statusCode,
				errorBody.errors,
				endpoint,
			);
	}
}

export async function directusApiRequest(
	this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: string,
	endpoint: string,
	body: any = {},
	qs: IDataObject = {},
	retryConfig: Partial<IRetryConfig> = {},
): Promise<any> {
	const credentials = (await this.getCredentials('directusApi')) as IDirectusCredentials;

	if (!credentials) {
		throw new DirectusAuthenticationError('No credentials configured');
	}

	const baseUrl = credentials.url.replace(/\/$/, '');
	const url = `${baseUrl}/${endpoint.replace(/^\//, '')}`;

	// Merge retry config with defaults
	const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

	const options: IHttpRequestOptions = {
		method: method.toUpperCase() as any,
		url,
		body,
		qs,
		json: true,
		timeout: credentials.timeout || 30000,
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'n8n-nodes-directus',
		},
	};

	// Add authentication
	if (credentials.authMethod === 'staticToken' && credentials.staticToken) {
		options.headers!['Authorization'] = `Bearer ${credentials.staticToken}`;
	}

	// Retry logic with exponential backoff
	let lastError: any;
	for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'directusApi',
				options,
			);

			// Success - return response
			return response;
		} catch (error: any) {
			lastError = error;
			const statusCode = error.response?.status || error.statusCode || 0;

			// Check if error is retryable
			const isRetryable = config.retryableStatusCodes.includes(statusCode);
			const isLastAttempt = attempt >= config.maxRetries;

			if (!isRetryable || isLastAttempt) {
				// Non-retryable error or max retries reached - throw immediately
				const parsedError = parseDirectusError(error, endpoint);
				Logger.error(`Directus API Error [${method} ${endpoint}]:`, {
					statusCode,
					message: parsedError.message,
					attempt: attempt + 1,
				});
				throw parsedError;
			}

			// Calculate retry delay
			let retryDelay = config.retryDelay * Math.pow(config.backoffMultiplier, attempt);

			// Handle rate limit with Retry-After header
			if (statusCode === 429) {
				const retryAfter = error.response?.headers?.['retry-after'];
				if (retryAfter) {
					retryDelay = parseInt(retryAfter, 10) * 1000; // Convert to ms
				}
			}

			Logger.warn(`Directus API Error [${method} ${endpoint}]: Retrying in ${retryDelay}ms (attempt ${attempt + 1}/${config.maxRetries})`, {
				statusCode,
				retryDelay,
			});

			// Wait before retrying
			await sleep(retryDelay);
		}
	}

	// Should never reach here, but just in case
	throw parseDirectusError(lastError, endpoint);
}

export function validateJSON(json: string | undefined): any {
	if (!json) return undefined;

	try {
		return JSON.parse(json);
	} catch (exception) {
		return undefined;
	}
}

/**
 * Trigger a Directus Flow via webhook
 */
export async function triggerFlow(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	flowId: string,
	payload?: any,
	queryParams?: IDataObject,
): Promise<any> {
	const method = payload && Object.keys(payload).length > 0 ? 'POST' : 'GET';
	const endpoint = `flows/trigger/${flowId}`;

	const response = await directusApiRequest.call(
		this,
		method,
		endpoint,
		payload || {},
		queryParams || {},
	);

	return response;
}

/**
 * Get flow ID by name
 */
export async function getFlowIdByName(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	flowName: string,
): Promise<string> {
	const response = await directusApiRequest.call(
		this,
		'GET',
		'flows',
		{},
		{
			filter: JSON.stringify({ name: { _eq: flowName } }),
			limit: 1,
		},
	);

	const flows = response.data || response;

	if (!flows || flows.length === 0) {
		throw new Error(`Flow "${flowName}" not found`);
	}

	return flows[0].id;
}

/**
 * Poll flow execution until complete (for sync mode)
 */
export async function pollFlowExecution(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	executionId: string,
	maxWaitMs: number = 60000,
	intervalMs: number = 1000,
): Promise<any> {
	const startTime = Date.now();

	while (Date.now() - startTime < maxWaitMs) {
		try {
			// Query activity logs for this execution
			const response = await directusApiRequest.call(
				this,
				'GET',
				'activity',
				{},
				{
					filter: JSON.stringify({
						_and: [
							{ action: { _eq: 'run' } },
							{ collection: { _eq: 'directus_flows' } },
							{ comment: { _contains: executionId } },
						],
					}),
					sort: '-timestamp',
					limit: 1,
				},
			);

			const activities = response.data || response;

			if (activities && activities.length > 0) {
				const activity = activities[0];
				const status = activity.revisions?.[0]?.data?.status;

				if (status === 'completed' || status === 'failed') {
					return {
						executionId,
						status,
						activity,
						timestamp: activity.timestamp,
						user: activity.user,
						duration: Date.now() - startTime,
					};
				}
			}
		} catch (error) {
			Logger.warn(`Error polling flow execution: ${error}`);
		}

		await sleep(intervalMs);
	}

	throw new DirectusTimeoutError(
		`Flow execution ${executionId} timed out after ${maxWaitMs}ms`,
		maxWaitMs,
	);
}

export async function directusApiAssetRequest(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	method: string,
	path: string,
	ID: string,
	dataPropertyName: string,
	qs: IDataObject = {},
): Promise<any> {
	const credentials = (await this.getCredentials('directusApi')) as IDirectusCredentials;
	
	if (!credentials) {
		throw new Error('No credentials configured');
	}

	const baseUrl = credentials.url.replace(/\/$/, '');
	
	try {
		// Get file info first
		const fileOptions: IHttpRequestOptions = {
			method: 'GET',
			url: `${baseUrl}/files/${ID}`,
			qs,
			json: true,
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'n8n-nodes-directus',
			},
		};

		if (credentials.authMethod === 'staticToken' && credentials.staticToken) {
			fileOptions.headers!['Authorization'] = `Bearer ${credentials.staticToken}`;
		}

		const fileResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'directusApi', fileOptions);
		const file = fileResponse.data || fileResponse;
		
		// Get asset binary data
		const assetOptions: IHttpRequestOptions = {
			method: 'GET',
			url: `${baseUrl}/assets/${ID}`,
			qs,
			encoding: 'arraybuffer',
			headers: {
				'User-Agent': 'n8n-nodes-directus',
			},
		};

		if (credentials.authMethod === 'staticToken' && credentials.staticToken) {
			assetOptions.headers!['Authorization'] = `Bearer ${credentials.staticToken}`;
		}

		const assetResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'directusApi', assetOptions);
		const binaryData = Buffer.from(assetResponse as ArrayBuffer);
		
		const binary: IBinaryKeyData = {};
		binary[dataPropertyName] = await this.helpers.prepareBinaryData(
			binaryData,
			file.filename_download || file.filename_disk || 'file',
			file.type || 'application/octet-stream',
		);

		const json = { file };
		const result: INodeExecutionData = {
			json,
			binary,
		};
		
		return result;
	} catch (error: any) {
		Logger.error('Directus Asset Error:', error);
		throw new Error(`Directus Asset Error: ${error.message || error}`);
	}
}

export async function directusApiFileRequest(
	this: IExecuteFunctions | IExecuteSingleFunctions | IWebhookFunctions,
	method: string,
	path: string,
	formData: any = {},
	body: any = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = (await this.getCredentials('directusApi')) as IDirectusCredentials;

	if (!credentials) {
		throw new Error('No credentials configured');
	}

	const baseUrl = credentials.url.replace(/\/$/, '');

	try {
		Logger.info('Processing file request');

		if (method === 'POST') {
			// Upload file
			const options: IHttpRequestOptions = {
				method: 'POST',
				url: `${baseUrl}/${path}`,
				body: formData,
				qs,
				headers: {
					'User-Agent': 'n8n-nodes-directus',
				},
			};

			if (credentials.authMethod === 'staticToken' && credentials.staticToken) {
				options.headers!['Authorization'] = `Bearer ${credentials.staticToken}`;
			}

			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'directusApi', options);
			const file = response.data || response;

			// Update file metadata if body provided
			if (Object.keys(body).length > 0) {
				const updateResponse = await directusApiRequest.call(this, 'PATCH', `files/${file.id}`, body);
				return updateResponse.data || updateResponse;
			}

			return file;
		} else if (method === 'PATCH') {
			// Update file
			const hasFormData = Object.keys(formData).length > 0;
			const hasBody = Object.keys(body).length > 0;

			let result: any = {};

			if (hasFormData) {
				const formOptions: IHttpRequestOptions = {
					method: 'PATCH',
					url: `${baseUrl}/${path}`,
					body: formData,
					qs,
					headers: {
						'User-Agent': 'n8n-nodes-directus',
					},
				};

				if (credentials.authMethod === 'staticToken' && credentials.staticToken) {
					formOptions.headers!['Authorization'] = `Bearer ${credentials.staticToken}`;
				}

				const formResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'directusApi', formOptions);
				result = formResponse.data || formResponse;
			}

			if (hasBody) {
				const bodyResponse = await directusApiRequest.call(this, 'PATCH', path, body);
				result = { ...result, ...(bodyResponse.data || bodyResponse) };
			}

			return result;
		}

		return {};
	} catch (error: any) {
		Logger.error('Directus File Error:', error);
		throw new Error(`Directus File Error: ${error.message || error}`);
	}
}

/**
 * Create a flow with webhook configuration
 */
export async function createFlow(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	flowData: IDataObject,
): Promise<any> {
	const response = await directusApiRequest.call(
		this,
		'POST',
		'flows',
		flowData,
		{},
	);

	return response.data || response;
}

/**
 * Update a flow
 */
export async function updateFlow(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	flowId: string,
	flowData: IDataObject,
): Promise<any> {
	const response = await directusApiRequest.call(
		this,
		'PATCH',
		`flows/${flowId}`,
		flowData,
		{},
	);

	return response.data || response;
}

/**
 * Delete a flow
 */
export async function deleteFlow(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	flowId: string,
): Promise<any> {
	const response = await directusApiRequest.call(
		this,
		'DELETE',
		`flows/${flowId}`,
		{},
		{},
	);

	return response;
}

/**
 * Generate full webhook URL for a flow
 */
export async function getFlowWebhookUrl(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	flowId: string,
): Promise<string> {
	const credentials = (await this.getCredentials('directusApi')) as IDirectusCredentials;

	if (!credentials) {
		throw new DirectusAuthenticationError('No credentials configured');
	}

	const baseUrl = credentials.url.replace(/\/$/, '');
	return `${baseUrl}/flows/trigger/${flowId}`;
}

/**
 * Get flow execution details from activity logs
 */
export async function getFlowExecution(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	executionId: string,
	fields?: string,
): Promise<any> {
	const qs: IDataObject = {
		filter: JSON.stringify({
			_and: [
				{ action: { _eq: 'run' } },
				{ collection: { _eq: 'directus_flows' } },
				{ comment: { _contains: executionId } },
			],
		}),
		sort: '-timestamp',
		limit: 1,
	};

	if (fields) {
		qs.fields = fields;
	}

	const response = await directusApiRequest.call(
		this,
		'GET',
		'activity',
		{},
		qs,
	);

	const activities = response.data || response;

	if (!activities || activities.length === 0) {
		throw new DirectusApiError(
			`Execution with ID ${executionId} not found`,
			404,
			[],
			'activity',
		);
	}

	return activities[0];
}

/**
 * List flow executions with filtering support
 */
export async function listFlowExecutions(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	filters: IDataObject = {},
	options: IDataObject = {},
): Promise<any> {
	// Build filter conditions
	const filterConditions: any[] = [
		{ action: { _eq: 'run' } },
		{ collection: { _eq: 'directus_flows' } },
	];

	// Add flow ID filter if provided
	if (filters.flowId) {
		filterConditions.push({ item: { _eq: filters.flowId } });
	}

	// Add status filter if provided and not 'all'
	if (filters.status && filters.status !== 'all') {
		// Map status to appropriate filter
		// Note: This is a simplified mapping - you may need to adjust based on actual Directus activity structure
		if (filters.status === 'success') {
			filterConditions.push({
				_or: [
					{ comment: { _contains: 'completed' } },
					{ comment: { _contains: 'success' } },
				],
			});
		} else if (filters.status === 'failed') {
			filterConditions.push({
				_or: [
					{ comment: { _contains: 'failed' } },
					{ comment: { _contains: 'error' } },
				],
			});
		} else if (filters.status === 'running') {
			filterConditions.push({
				_or: [
					{ comment: { _contains: 'running' } },
					{ comment: { _contains: 'started' } },
				],
			});
		}
	}

	// Add date range filters if provided
	if (filters.dateFrom) {
		filterConditions.push({ timestamp: { _gte: filters.dateFrom } });
	}

	if (filters.dateTo) {
		filterConditions.push({ timestamp: { _lte: filters.dateTo } });
	}

	// Add user ID filter if provided
	if (filters.userId) {
		filterConditions.push({ user: { _eq: filters.userId } });
	}

	// Build query string
	const qs: IDataObject = {
		filter: JSON.stringify({ _and: filterConditions }),
		sort: options.sort || '-timestamp',
	};

	// Add limit
	if (filters.returnAll) {
		qs.limit = -1;
	} else {
		qs.limit = filters.limit || 100;
	}

	// Add pagination if page is specified
	if (options.page && typeof options.page === 'number' && options.page > 1) {
		const limit = typeof filters.limit === 'number' ? filters.limit : 100;
		qs.offset = (options.page - 1) * limit;
	}

	// Add fields if provided
	if (options.fields) {
		qs.fields = options.fields;
	}

	const response = await directusApiRequest.call(
		this,
		'GET',
		'activity',
		{},
		qs,
	);

	return response.data || response;
}

/**
 * Get detailed operation logs for a flow execution
 */
export async function getFlowExecutionLogs(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	executionId: string,
	options: IDataObject = {},
): Promise<any> {
	const qs: IDataObject = {
		filter: JSON.stringify({
			_and: [
				{ action: { _eq: 'run' } },
				{ collection: { _eq: 'directus_flows' } },
				{ comment: { _contains: executionId } },
			],
		}),
		sort: '-timestamp',
		limit: options.limit || 100,
	};

	// Add fields if provided
	if (options.fields) {
		qs.fields = options.fields;
	}

	const response = await directusApiRequest.call(
		this,
		'GET',
		'activity',
		{},
		qs,
	);

	const activities = response.data || response;

	if (!activities || activities.length === 0) {
		throw new DirectusApiError(
			`No logs found for execution ID ${executionId}`,
			404,
			[],
			'activity',
		);
	}

	return activities;
}
