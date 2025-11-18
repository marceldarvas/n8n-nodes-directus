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
	// Try to get OAuth2 credentials first, fallback to regular credentials
	let credentials: IDirectusCredentials | null = null;
	let credentialType: 'directusApi' | 'directusOAuth2Api' = 'directusApi';
	let baseUrl = '';

	try {
		const oAuth2Credentials = await this.getCredentials('directusOAuth2Api');
		if (oAuth2Credentials) {
			credentialType = 'directusOAuth2Api';
			baseUrl = (oAuth2Credentials.instanceUrl as string).replace(/\/$/, '');
		}
	} catch (error) {
		// OAuth2 credentials not available, try regular credentials
	}

	if (!baseUrl) {
		credentials = (await this.getCredentials('directusApi')) as IDirectusCredentials;
		if (!credentials) {
			throw new DirectusAuthenticationError('No credentials configured');
		}
		baseUrl = credentials.url.replace(/\/$/, '');
	}

	const url = `${baseUrl}/${endpoint.replace(/^\//, '')}`;

	// Merge retry config with defaults
	const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

	const options: IHttpRequestOptions = {
		method: method.toUpperCase() as any,
		url,
		body,
		qs,
		json: true,
		timeout: credentials?.timeout || 30000,
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'n8n-nodes-directus',
		},
	};

	// Add authentication for regular credentials (OAuth2 is handled automatically by httpRequestWithAuthentication)
	if (credentialType === 'directusApi' && credentials) {
		if (credentials.authMethod === 'staticToken' && credentials.staticToken) {
			options.headers!['Authorization'] = `Bearer ${credentials.staticToken}`;
		}
	}

	// Retry logic with exponential backoff
	let lastError: any;
	for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				credentialType,
				options,
			);

			// Success - return response
			return response;
		} catch (error: any) {
			lastError = error;
			const statusCode = error.response?.status || error.statusCode || 0;

			// For OAuth2, 401 errors are automatically handled by n8n (token refresh)
			// But we still want to retry once if it's the first attempt
			if (credentialType === 'directusOAuth2Api' && statusCode === 401 && attempt === 0) {
				Logger.warn(`OAuth2 token may be expired, attempting refresh and retry...`);
				await sleep(config.retryDelay);
				continue;
			}

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
					credentialType,
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
	// Try to get OAuth2 credentials first, fallback to regular credentials
	let credentials: IDirectusCredentials | null = null;
	let credentialType: 'directusApi' | 'directusOAuth2Api' = 'directusApi';
	let baseUrl = '';

	try {
		const oAuth2Credentials = await this.getCredentials('directusOAuth2Api');
		if (oAuth2Credentials) {
			credentialType = 'directusOAuth2Api';
			baseUrl = (oAuth2Credentials.instanceUrl as string).replace(/\/$/, '');
		}
	} catch (error) {
		// OAuth2 credentials not available, try regular credentials
	}

	if (!baseUrl) {
		credentials = (await this.getCredentials('directusApi')) as IDirectusCredentials;
		if (!credentials) {
			throw new Error('No credentials configured');
		}
		baseUrl = credentials.url.replace(/\/$/, '');
	}

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

		if (credentialType === 'directusApi' && credentials?.authMethod === 'staticToken' && credentials.staticToken) {
			fileOptions.headers!['Authorization'] = `Bearer ${credentials.staticToken}`;
		}

		const fileResponse = await this.helpers.httpRequestWithAuthentication.call(this, credentialType, fileOptions);
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

		if (credentialType === 'directusApi' && credentials?.authMethod === 'staticToken' && credentials.staticToken) {
			assetOptions.headers!['Authorization'] = `Bearer ${credentials.staticToken}`;
		}

		const assetResponse = await this.helpers.httpRequestWithAuthentication.call(this, credentialType, assetOptions);
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
	// Try to get OAuth2 credentials first, fallback to regular credentials
	let credentials: IDirectusCredentials | null = null;
	let credentialType: 'directusApi' | 'directusOAuth2Api' = 'directusApi';
	let baseUrl = '';

	try {
		const oAuth2Credentials = await this.getCredentials('directusOAuth2Api');
		if (oAuth2Credentials) {
			credentialType = 'directusOAuth2Api';
			baseUrl = (oAuth2Credentials.instanceUrl as string).replace(/\/$/, '');
		}
	} catch (error) {
		// OAuth2 credentials not available, try regular credentials
	}

	if (!baseUrl) {
		credentials = (await this.getCredentials('directusApi')) as IDirectusCredentials;
		if (!credentials) {
			throw new Error('No credentials configured');
		}
		baseUrl = credentials.url.replace(/\/$/, '');
	}

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

			if (credentialType === 'directusApi' && credentials?.authMethod === 'staticToken' && credentials.staticToken) {
				options.headers!['Authorization'] = `Bearer ${credentials.staticToken}`;
			}

			const response = await this.helpers.httpRequestWithAuthentication.call(this, credentialType, options);
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

				if (credentialType === 'directusApi' && credentials?.authMethod === 'staticToken' && credentials.staticToken) {
					formOptions.headers!['Authorization'] = `Bearer ${credentials.staticToken}`;
				}

				const formResponse = await this.helpers.httpRequestWithAuthentication.call(this, credentialType, formOptions);
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
	// Try to get OAuth2 credentials first, fallback to regular credentials
	let baseUrl = '';

	try {
		const oAuth2Credentials = await this.getCredentials('directusOAuth2Api');
		if (oAuth2Credentials) {
			baseUrl = (oAuth2Credentials.instanceUrl as string).replace(/\/$/, '');
		}
	} catch (error) {
		// OAuth2 credentials not available, try regular credentials
	}

	if (!baseUrl) {
		const credentials = (await this.getCredentials('directusApi')) as IDirectusCredentials;
		if (!credentials) {
			throw new DirectusAuthenticationError('No credentials configured');
		}
		baseUrl = credentials.url.replace(/\/$/, '');
	}

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

/**
 * Transform data between flows based on pass data strategy
 */
export function transformFlowData(
	previousResult: any,
	allResults: any[],
	passDataStrategy: string = 'all',
	customMapping?: any,
): any {
	switch (passDataStrategy) {
		case 'result':
			// Pass only the result from the previous flow
			return previousResult;
		case 'custom':
			// Apply custom mapping if provided
			if (customMapping) {
				return customMapping;
			}
			return previousResult;
		case 'all':
		default:
			// Pass all accumulated results
			return {
				previousResult,
				allResults,
			};
	}
}

/**
 * Chain multiple flows with data passing
 */
export async function chainFlows(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	flowChain: Array<{ flowId: string; passDataStrategy?: string; customMapping?: any }>,
	initialPayload: any,
	options: IDataObject = {},
): Promise<any> {
	const executionMode = options.executionMode || 'sequential';
	const errorHandling = options.errorHandling || 'stop';
	const delayBetweenFlows = (options.delayBetweenFlows as number) || 0;
	const maxWaitTime = ((options.maxWaitTime as number) || 60) * 1000; // Convert to ms
	const collectResults = options.collectResults !== false;

	const results: any[] = [];
	const errors: any[] = [];

	if (executionMode === 'parallel') {
		// Execute all flows in parallel
		const promises = flowChain.map(async (flowConfig, index) => {
			try {
				// For parallel, each flow gets the initial payload
				const response = await triggerFlow.call(
					this,
					flowConfig.flowId,
					initialPayload,
				);

				// Wait for completion if sync-like behavior is needed
				const executionId = response.executionId || response.data?.executionId;
				if (executionId) {
					const pollResult = await pollFlowExecution.call(
						this,
						executionId,
						maxWaitTime,
					);
					return { index, result: pollResult, error: null };
				}

				return { index, result: response, error: null };
			} catch (error: any) {
				if (errorHandling === 'stop') {
					throw error;
				}
				return { index, result: null, error: error.message };
			}
		});

		const parallelResults = await Promise.all(promises);

		// Sort results by index and collect them
		parallelResults.sort((a, b) => a.index - b.index);
		parallelResults.forEach((item) => {
			if (item.error) {
				errors.push({ flowIndex: item.index, error: item.error });
			}
			if (collectResults) {
				results.push(item.result);
			}
		});
	} else {
		// Sequential execution
		let currentPayload = initialPayload;

		for (let i = 0; i < flowChain.length; i++) {
			const flowConfig = flowChain[i];

			try {
				// Apply delay if configured (except for first flow)
				if (i > 0 && delayBetweenFlows > 0) {
					await sleep(delayBetweenFlows);
				}

				// Trigger the flow with current payload
				const response = await triggerFlow.call(
					this,
					flowConfig.flowId,
					currentPayload,
				);

				// Wait for completion
				const executionId = response.executionId || response.data?.executionId;
				let flowResult = response;

				if (executionId) {
					const pollResult = await pollFlowExecution.call(
						this,
						executionId,
						maxWaitTime,
					);
					flowResult = pollResult;
				}

				// Collect result if configured
				if (collectResults) {
					results.push(flowResult);
				}

				// Transform data for next flow
				const passDataStrategy = flowConfig.passDataStrategy || 'all';
				currentPayload = transformFlowData(
					flowResult,
					results,
					passDataStrategy,
					flowConfig.customMapping,
				);
			} catch (error: any) {
				const errorInfo = {
					flowIndex: i,
					flowId: flowConfig.flowId,
					error: error.message,
				};
				errors.push(errorInfo);

				if (errorHandling === 'stop') {
					throw new DirectusApiError(
						`Flow chain failed at step ${i + 1}: ${error.message}`,
						500,
						errors,
						`flows/chain/${flowConfig.flowId}`,
					);
				}
			}
		}
	}

	return {
		success: errors.length === 0,
		totalFlows: flowChain.length,
		completedFlows: results.length,
		failedFlows: errors.length,
		results: collectResults ? results : undefined,
		errors: errors.length > 0 ? errors : undefined,
	};
}

/**
 * Get flow activity with specific filters
 */
export async function getFlowActivity(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	filters: IDataObject = {},
): Promise<any> {
	// Build filter conditions for flow-specific activity
	const filterConditions: any[] = [];

	// Always filter for directus_flows collection
	filterConditions.push({ collection: { _eq: 'directus_flows' } });

	// Add flow ID filter if provided
	if (filters.flowId) {
		filterConditions.push({ item: { _eq: filters.flowId } });
	}

	// Add flow execution ID filter if provided
	if (filters.flowExecutionId) {
		filterConditions.push({ comment: { _contains: filters.flowExecutionId } });
	}

	// Add operation type filter if provided
	if (filters.flowOperationType) {
		filterConditions.push({ action: { _eq: filters.flowOperationType } });
	}

	// Build query string
	const qs: IDataObject = {
		filter: JSON.stringify({ _and: filterConditions }),
		sort: filters.sort || '-timestamp',
	};

	// Add limit
	if (filters.returnAll) {
		qs.limit = -1;
	} else {
		qs.limit = filters.limit || 100;
	}

	// Add fields if provided
	if (filters.fields) {
		qs.fields = filters.fields;
	}

	// Query the activity endpoint
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
 * Calculate performance metrics for flow activities
 */
export function calculateFlowPerformanceMetrics(activities: any[]): any {
	if (!activities || activities.length === 0) {
		return {
			totalExecutions: 0,
			successCount: 0,
			failedCount: 0,
			runningCount: 0,
			averageExecutionTime: 0,
			minExecutionTime: 0,
			maxExecutionTime: 0,
			successRate: 0,
			failureRate: 0,
		};
	}

	let successCount = 0;
	let failedCount = 0;
	let runningCount = 0;
	const executionTimes: number[] = [];

	// Analyze each activity
	activities.forEach((activity) => {
		const comment = activity.comment || '';
		const action = activity.action || '';

		// Determine status from comment or action
		if (
			comment.includes('completed') ||
			comment.includes('success') ||
			action === 'completed'
		) {
			successCount++;
		} else if (
			comment.includes('failed') ||
			comment.includes('error') ||
			action === 'failed'
		) {
			failedCount++;
		} else if (
			comment.includes('running') ||
			comment.includes('started') ||
			action === 'run'
		) {
			runningCount++;
		}

		// Extract execution time if available (from revisions or metadata)
		const revisions = activity.revisions || [];
		if (revisions.length > 0 && revisions[0].data) {
			const executionTime = revisions[0].data.executionTime || revisions[0].data.duration;
			if (executionTime && typeof executionTime === 'number') {
				executionTimes.push(executionTime);
			}
		}

		// Alternative: calculate from timestamp if we have start/end info
		if (activity.timestamp && activity.metadata?.endTime) {
			const start = new Date(activity.timestamp).getTime();
			const end = new Date(activity.metadata.endTime).getTime();
			const duration = end - start;
			if (duration > 0) {
				executionTimes.push(duration);
			}
		}
	});

	// Calculate execution time statistics
	let averageExecutionTime = 0;
	let minExecutionTime = 0;
	let maxExecutionTime = 0;

	if (executionTimes.length > 0) {
		averageExecutionTime =
			executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
		minExecutionTime = Math.min(...executionTimes);
		maxExecutionTime = Math.max(...executionTimes);
	}

	// Calculate rates
	const totalExecutions = activities.length;
	const successRate = totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0;
	const failureRate = totalExecutions > 0 ? (failedCount / totalExecutions) * 100 : 0;

	return {
		totalExecutions,
		successCount,
		failedCount,
		runningCount,
		averageExecutionTime: Math.round(averageExecutionTime),
		minExecutionTime,
		maxExecutionTime,
		successRate: Math.round(successRate * 100) / 100, // Round to 2 decimal places
		failureRate: Math.round(failureRate * 100) / 100,
		executionTimeUnit: 'milliseconds',
		activities: activities.length,
		hasExecutionTimeData: executionTimes.length > 0,
	};
}

/**
 * Loop through data array and trigger flow for each item
 */
export async function loopFlows(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	flowId: string,
	dataArray: any[],
	options: IDataObject = {},
): Promise<any> {
	const executionMode = options.executionMode || 'sequential';
	const concurrencyLimit = (options.concurrencyLimit as number) || 5;
	const delayBetweenIterations = (options.delayBetweenIterations as number) || 0;
	const maxWaitTime = ((options.maxWaitTime as number) || 60) * 1000; // Convert to ms
	const collectResults = options.collectResults !== false;
	const stopOnError = options.stopOnError !== false;

	const results: any[] = [];
	const errors: any[] = [];

	if (executionMode === 'parallel') {
		// Execute flows in parallel with concurrency limit
		const executeWithConcurrency = async (items: any[], limit: number) => {
			const executing: Promise<any>[] = [];

			for (let i = 0; i < items.length; i++) {
				const item = items[i];

				const promise = (async (index: number, data: any) => {
					try {
						// Apply delay if configured (for rate limiting)
						if (index > 0 && delayBetweenIterations > 0) {
							await sleep(delayBetweenIterations);
						}

						// Trigger the flow with current data item
						const response = await triggerFlow.call(
							this,
							flowId,
							data,
						);

						// Wait for completion
						const executionId = response.executionId || response.data?.executionId;
						let flowResult = response;

						if (executionId) {
							const pollResult = await pollFlowExecution.call(
								this,
								executionId,
								maxWaitTime,
							);
							flowResult = pollResult;
						}

						return { index, result: flowResult, error: null };
					} catch (error: any) {
						if (stopOnError) {
							throw error;
						}
						return { index, result: null, error: error.message };
					}
				})(i, item);

				executing.push(promise);

				// If we've reached the concurrency limit, wait for one to complete
				if (executing.length >= limit) {
					await Promise.race(executing).then((result) => {
						// Remove completed promise
						const idx = executing.indexOf(Promise.resolve(result));
						if (idx > -1) {
							executing.splice(idx, 1);
						}

						// Store result
						if (result.error) {
							errors.push({ itemIndex: result.index, error: result.error });
						}
						if (collectResults) {
							results[result.index] = result.result;
						}
					});
				}
			}

			// Wait for remaining promises
			const remainingResults = await Promise.all(executing);
			remainingResults.forEach((result) => {
				if (result.error) {
					errors.push({ itemIndex: result.index, error: result.error });
				}
				if (collectResults) {
					results[result.index] = result.result;
				}
			});
		};

		await executeWithConcurrency(dataArray, concurrencyLimit);
	} else {
		// Sequential execution
		for (let i = 0; i < dataArray.length; i++) {
			const item = dataArray[i];

			try {
				// Apply delay if configured (except for first item)
				if (i > 0 && delayBetweenIterations > 0) {
					await sleep(delayBetweenIterations);
				}

				// Trigger the flow with current data item
				const response = await triggerFlow.call(
					this,
					flowId,
					item,
				);

				// Wait for completion
				const executionId = response.executionId || response.data?.executionId;
				let flowResult = response;

				if (executionId) {
					const pollResult = await pollFlowExecution.call(
						this,
						executionId,
						maxWaitTime,
					);
					flowResult = pollResult;
				}

				// Collect result if configured
				if (collectResults) {
					results.push(flowResult);
				}
			} catch (error: any) {
				const errorInfo = {
					itemIndex: i,
					item,
					error: error.message,
				};
				errors.push(errorInfo);

				if (stopOnError) {
					throw new DirectusApiError(
						`Flow loop failed at item ${i + 1}: ${error.message}`,
						500,
						errors,
						`flows/loop/${flowId}`,
					);
				}
			}
		}
	}

	return {
		success: errors.length === 0,
		totalItems: dataArray.length,
		completedItems: results.length,
		failedItems: errors.length,
		results: collectResults ? results : undefined,
		errors: errors.length > 0 ? errors : undefined,
	};
}

/**
 * Role name to UUID cache for performance
 * Maps role name to role UUID
 */
const roleCache = new Map<string, string>();

/**
 * Check if a string is a valid UUID
 * UUID pattern: 8-4-4-4-12 hex characters (e.g., c86c2761-65d3-43c3-897f-6f74ad6a5bd7)
 */
export function isUUID(value: string): boolean {
	if (!value || typeof value !== 'string') {
		return false;
	}

	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidRegex.test(value);
}

/**
 * Get role UUID by role name
 * Queries the roles endpoint and returns the UUID for a given role name
 * Results are cached to avoid repeated lookups
 */
export async function getRoleIdByName(
	this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	roleName: string,
): Promise<string> {
	// Check cache first
	if (roleCache.has(roleName)) {
		return roleCache.get(roleName)!;
	}

	try {
		const response = await directusApiRequest.call(
			this,
			'GET',
			'roles',
			{},
			{
				filter: JSON.stringify({ name: { _eq: roleName } }),
				limit: 1,
			},
		);

		const roles = response.data || response;

		if (!roles || roles.length === 0) {
			throw new DirectusApiError(
				`Role "${roleName}" not found. Please check the role name and ensure it exists in Directus.`,
				404,
				[],
				'roles',
			);
		}

		const roleId = roles[0].id;

		// Cache the result
		roleCache.set(roleName, roleId);

		return roleId;
	} catch (error: any) {
		if (error instanceof DirectusApiError) {
			throw error;
		}
		throw new DirectusApiError(
			`Failed to lookup role "${roleName}": ${error.message}`,
			500,
			[],
			'roles',
		);
	}
}

/**
 * Parse CSV data to JSON array
 * Converts CSV string to array of objects using first row as headers
 */
export function parseCSV(csvData: string): any[] {
	if (!csvData || typeof csvData !== 'string') {
		throw new Error('CSV data must be a non-empty string');
	}

	const lines = csvData.trim().split('\n');
	if (lines.length < 2) {
		throw new Error('CSV must have at least a header row and one data row');
	}

	// Parse header row
	const headers = lines[0].split(',').map((h) => h.trim());

	// Parse data rows
	const result: any[] = [];
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue; // Skip empty lines

		const values = line.split(',').map((v) => v.trim());
		const obj: any = {};

		headers.forEach((header, index) => {
			if (index < values.length) {
				obj[header] = values[index];
			}
		});

		result.push(obj);
	}

	return result;
}

/**
 * Create multiple users via POST /users with array
 * Handles role name resolution and provides detailed error reporting
 */
export async function bulkCreateUsers(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	users: any[],
	errorHandling: 'stop' | 'continue' = 'stop',
): Promise<{ success: boolean; created: any[]; failed: any[]; stats: any }> {
	const created: any[] = [];
	const failed: any[] = [];

	if (errorHandling === 'continue') {
		// Process each user individually for granular error handling
		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			try {
				// Handle role name resolution
				if (user.role && typeof user.role === 'string' && !isUUID(user.role)) {
					user.role = await getRoleIdByName.call(this, user.role);
				}

				const response = await directusApiRequest.call(
					this,
					'POST',
					'users',
					user,
					{},
				);

				const userData = response.data || response;
				created.push(userData);
			} catch (error: any) {
				failed.push({
					index: i,
					user,
					error: error.message || 'Unknown error',
				});
			}
		}
	} else {
		// Process all users in bulk (stop on first error)
		try {
			// Handle role name resolution for all users
			for (const user of users) {
				if (user.role && typeof user.role === 'string' && !isUUID(user.role)) {
					user.role = await getRoleIdByName.call(this, user.role);
				}
			}

			const response = await directusApiRequest.call(
				this,
				'POST',
				'users',
				users,
				{},
			);

			const userData = response.data || response;
			if (Array.isArray(userData)) {
				created.push(...userData);
			} else {
				created.push(userData);
			}
		} catch (error: any) {
			throw new DirectusApiError(
				`Bulk user creation failed: ${error.message}`,
				error.statusCode || 500,
				error.errors || [],
				'users',
			);
		}
	}

	return {
		success: failed.length === 0,
		created,
		failed,
		stats: {
			total: users.length,
			created: created.length,
			failed: failed.length,
		},
	};
}

/**
 * Update multiple users via PATCH /users with array
 * Handles partial failures and provides detailed error reporting
 */
export async function bulkUpdateUsers(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	updates: { keys: string[]; data: any },
	errorHandling: 'stop' | 'continue' = 'stop',
): Promise<{ success: boolean; updated: any[]; failed: any[]; stats: any }> {
	const updated: any[] = [];
	const failed: any[] = [];

	if (errorHandling === 'continue') {
		// Process each user individually for granular error handling
		for (let i = 0; i < updates.keys.length; i++) {
			const userId = updates.keys[i];
			try {
				const response = await directusApiRequest.call(
					this,
					'PATCH',
					`users/${userId}`,
					updates.data,
					{},
				);

				const userData = response.data || response;
				updated.push(userData);
			} catch (error: any) {
				failed.push({
					index: i,
					userId,
					error: error.message || 'Unknown error',
				});
			}
		}
	} else {
		// Process all users in bulk (stop on first error)
		try {
			const response = await directusApiRequest.call(
				this,
				'PATCH',
				'users',
				updates,
				{},
			);

			const userData = response.data || response;
			if (Array.isArray(userData)) {
				updated.push(...userData);
			} else {
				updated.push(userData);
			}
		} catch (error: any) {
			throw new DirectusApiError(
				`Bulk user update failed: ${error.message}`,
				error.statusCode || 500,
				error.errors || [],
				'users',
			);
		}
	}

	return {
		success: failed.length === 0,
		updated,
		failed,
		stats: {
			total: updates.keys.length,
			updated: updated.length,
			failed: failed.length,
		},
	};
}

/**
 * Delete multiple users via DELETE /users
 * Handles partial failures and provides detailed error reporting
 */
export async function bulkDeleteUsers(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	userIds: string[],
	errorHandling: 'stop' | 'continue' = 'stop',
): Promise<{ success: boolean; deleted: string[]; failed: any[]; stats: any }> {
	const deleted: string[] = [];
	const failed: any[] = [];

	if (errorHandling === 'continue') {
		// Process each user individually for granular error handling
		for (let i = 0; i < userIds.length; i++) {
			const userId = userIds[i];
			try {
				await directusApiRequest.call(
					this,
					'DELETE',
					`users/${userId}`,
					{},
					{},
				);

				deleted.push(userId);
			} catch (error: any) {
				failed.push({
					index: i,
					userId,
					error: error.message || 'Unknown error',
				});
			}
		}
	} else {
		// Process all users in bulk (stop on first error)
		try {
			await directusApiRequest.call(
				this,
				'DELETE',
				'users',
				userIds,
				{},
			);

			deleted.push(...userIds);
		} catch (error: any) {
			throw new DirectusApiError(
				`Bulk user deletion failed: ${error.message}`,
				error.statusCode || 500,
				error.errors || [],
				'users',
			);
		}
	}

	return {
		success: failed.length === 0,
		deleted,
		failed,
		stats: {
			total: userIds.length,
			deleted: deleted.length,
			failed: failed.length,
		},
	};
}

/**
 * List user invitations with status filter
 * Filters users by status (invited, active) to show pending/accepted invitations
 */
export async function listUserInvitations(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	filters: {
		status?: string;
		returnAll?: boolean;
		limit?: number;
	} = {},
): Promise<any[]> {
	const qs: IDataObject = {};
	
	// Build filter based on status
	const filterConditions: any = {};
	
	if (filters.status === 'pending') {
		filterConditions.status = { _eq: 'invited' };
	} else if (filters.status === 'accepted') {
		filterConditions.status = { _eq: 'active' };
	}
	// 'all' or undefined means no status filter
	
	if (Object.keys(filterConditions).length > 0) {
		qs.filter = JSON.stringify(filterConditions);
	}
	
	// Handle limit
	if (filters.returnAll) {
		qs.limit = -1;
	} else {
		qs.limit = filters.limit || 100;
	}
	
	const response = await directusApiRequest.call(
		this,
		'GET',
		'users',
		{},
		qs,
	);
	
	return response.data || response;
}

/**
 * Resend invitation to a user
 * Uses POST /users/invite with the user's email
 */
export async function resendUserInvitation(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	userId: string,
	options: {
		emailSubject?: string;
		emailMessage?: string;
		inviteUrl?: string;
	} = {},
): Promise<any> {
	// First get the user's email
	const userResponse = await directusApiRequest.call(
		this,
		'GET',
		`users/${userId}`,
		{},
		{},
	);
	
	const user = userResponse.data || userResponse;
	
	if (!user || !user.email) {
		throw new DirectusApiError(
			`User with ID ${userId} not found or has no email`,
			404,
			[],
			`users/${userId}`,
		);
	}
	
	// Prepare invitation body
	const body: IDataObject = {
		email: user.email,
		role: user.role,
	};
	
	// Add optional fields
	if (options.emailSubject) {
		body.emailSubject = options.emailSubject;
	}
	if (options.emailMessage) {
		body.emailMessage = options.emailMessage;
	}
	if (options.inviteUrl) {
		body.inviteUrl = options.inviteUrl;
	}
	
	// Resend invitation
	const response = await directusApiRequest.call(
		this,
		'POST',
		'users/invite',
		body,
		{},
	);
	
	return response.data || response;
}

/**
 * Invite multiple users at once
 * Supports bulk invitations with custom email templates
 */
export async function bulkInviteUsers(
	this: IExecuteFunctions | IExecuteSingleFunctions,
	invitations: Array<{ email: string; role: string; [key: string]: any }>,
	options: {
		emailSubject?: string;
		emailMessage?: string;
		inviteUrl?: string;
		errorHandling?: 'stop' | 'continue';
	} = {},
): Promise<{ success: boolean; invited: any[]; failed: any[]; stats: any }> {
	const invited: any[] = [];
	const failed: any[] = [];
	const errorHandling = options.errorHandling || 'stop';
	
	for (let i = 0; i < invitations.length; i++) {
		const invitation = invitations[i];
		
		try {
			// Handle role name resolution
			let role = invitation.role;
			if (role && typeof role === 'string' && !isUUID(role)) {
				role = await getRoleIdByName.call(this, role);
			}
			
			// Prepare invitation body
			const body: IDataObject = {
				email: invitation.email,
				role: role,
			};
			
			// Add custom fields from invitation object
			Object.keys(invitation).forEach(key => {
				if (key !== 'email' && key !== 'role') {
					body[key] = invitation[key];
				}
			});
			
			// Add global options
			if (options.emailSubject) {
				body.emailSubject = options.emailSubject;
			}
			if (options.emailMessage) {
				// Support variable substitution
				let message = options.emailMessage;
				message = message.replace(/\{\{email\}\}/g, invitation.email);
				message = message.replace(/\{\{role\}\}/g, role);
				if (invitation.first_name) {
					message = message.replace(/\{\{first_name\}\}/g, invitation.first_name);
				}
				if (invitation.last_name) {
					message = message.replace(/\{\{last_name\}\}/g, invitation.last_name);
				}
				body.emailMessage = message;
			}
			if (options.inviteUrl) {
				body.inviteUrl = options.inviteUrl;
			}
			
			// Send invitation
			const response = await directusApiRequest.call(
				this,
				'POST',
				'users/invite',
				body,
				{},
			);
			
			const userData = response.data || response;
			invited.push(userData);
		} catch (error: any) {
			const errorInfo = {
				index: i,
				email: invitation.email,
				error: error.message || 'Unknown error',
			};
			failed.push(errorInfo);
			
			if (errorHandling === 'stop') {
				throw new DirectusApiError(
					`Bulk invitation failed at index ${i} (${invitation.email}): ${error.message}`,
					error.statusCode || 500,
					failed,
					'users/invite',
				);
			}
		}
	}
	
	return {
		success: failed.length === 0,
		invited,
		failed,
		stats: {
			total: invitations.length,
			invited: invited.length,
			failed: failed.length,
		},
	};
}

// ========================================
// Activity Aggregation Functions
// ========================================

/**
 * Aggregate activity logs by user
 */
export async function aggregateActivityByUser(
	this: IExecuteFunctions,
	dateRange?: { from?: string; to?: string },
	includeUserDetails = true,
	groupByAction = true,
): Promise<any[]> {
	const filter: IDataObject = {};

	if (dateRange?.from || dateRange?.to) {
		const timestampFilter: IDataObject = {};
		if (dateRange.from) {
			timestampFilter._gte = dateRange.from;
		}
		if (dateRange.to) {
			timestampFilter._lte = dateRange.to;
		}
		filter.timestamp = timestampFilter;
	}

	// Fetch all activity logs
	const response = await directusApiRequest.call(
		this,
		'GET',
		'/activity',
		{},
		{
			filter,
			limit: -1,
			fields: includeUserDetails ? ['user.id', 'user.email', 'user.first_name', 'user.last_name', 'action', 'collection', 'timestamp'] : ['user', 'action', 'collection', 'timestamp'],
		},
	);

	const activities = response.data || response;

	// Group by user
	const userStats: Record<string, any> = {};

	for (const activity of activities) {
		const userId = activity.user?.id || activity.user || 'anonymous';

		if (!userStats[userId]) {
			userStats[userId] = {
				user: userId,
				totalActions: 0,
				actions: {},
			};

			// Include user details if available
			if (includeUserDetails && activity.user) {
				userStats[userId].email = activity.user.email;
				userStats[userId].firstName = activity.user.first_name;
				userStats[userId].lastName = activity.user.last_name;
			}
		}

		userStats[userId].totalActions++;

		if (groupByAction && activity.action) {
			const actionKey = activity.action;
			if (!userStats[userId].actions[actionKey]) {
				userStats[userId].actions[actionKey] = 0;
			}
			userStats[userId].actions[actionKey]++;
		}
	}

	return Object.values(userStats);
}

/**
 * Aggregate activity logs by collection
 */
export async function aggregateActivityByCollection(
	this: IExecuteFunctions,
	dateRange?: { from?: string; to?: string },
	groupByAction = true,
): Promise<any[]> {
	const filter: IDataObject = {};

	if (dateRange?.from || dateRange?.to) {
		const timestampFilter: IDataObject = {};
		if (dateRange.from) {
			timestampFilter._gte = dateRange.from;
		}
		if (dateRange.to) {
			timestampFilter._lte = dateRange.to;
		}
		filter.timestamp = timestampFilter;
	}

	// Fetch all activity logs
	const response = await directusApiRequest.call(
		this,
		'GET',
		'/activity',
		{},
		{
			filter,
			limit: -1,
			fields: ['collection', 'action', 'timestamp'],
		},
	);

	const activities = response.data || response;

	// Group by collection
	const collectionStats: Record<string, any> = {};

	for (const activity of activities) {
		const collection = activity.collection || 'unknown';

		if (!collectionStats[collection]) {
			collectionStats[collection] = {
				collection,
				totalActions: 0,
				actions: {},
			};
		}

		collectionStats[collection].totalActions++;

		if (groupByAction && activity.action) {
			const actionKey = activity.action;
			if (!collectionStats[collection].actions[actionKey]) {
				collectionStats[collection].actions[actionKey] = 0;
			}
			collectionStats[collection].actions[actionKey]++;
		}
	}

	return Object.values(collectionStats);
}

/**
 * Aggregate errors by type and collection
 */
export async function aggregateErrorsByType(
	this: IExecuteFunctions,
	dateRange?: { from?: string; to?: string },
	includeSuccessRate = true,
): Promise<any> {
	const filter: IDataObject = {};

	if (dateRange?.from || dateRange?.to) {
		const timestampFilter: IDataObject = {};
		if (dateRange.from) {
			timestampFilter._gte = dateRange.from;
		}
		if (dateRange.to) {
			timestampFilter._lte = dateRange.to;
		}
		filter.timestamp = timestampFilter;
	}

	// Fetch all activity logs
	const response = await directusApiRequest.call(
		this,
		'GET',
		'/activity',
		{},
		{
			filter,
			limit: -1,
			fields: ['action', 'collection', 'comment', 'timestamp'],
		},
	);

	const activities = response.data || response;

	let totalActions = 0;
	let totalErrors = 0;
	const errorsByCollection: Record<string, any> = {};
	const errorsByType: Record<string, number> = {};

	for (const activity of activities) {
		totalActions++;

		// Identify errors (typically comment field contains error messages or action is 'comment' with error context)
		const isError = activity.comment && (
			activity.comment.toLowerCase().includes('error') ||
			activity.comment.toLowerCase().includes('failed') ||
			activity.comment.toLowerCase().includes('exception')
		);

		if (isError) {
			totalErrors++;

			const collection = activity.collection || 'unknown';

			// Error by collection
			if (!errorsByCollection[collection]) {
				errorsByCollection[collection] = {
					collection,
					errorCount: 0,
					errors: [],
				};
			}
			errorsByCollection[collection].errorCount++;

			// Try to extract error type from comment
			const errorType = extractErrorType(activity.comment);
			if (!errorsByType[errorType]) {
				errorsByType[errorType] = 0;
			}
			errorsByType[errorType]++;

			// Store sample error
			if (errorsByCollection[collection].errors.length < 5) {
				errorsByCollection[collection].errors.push({
					timestamp: activity.timestamp,
					message: activity.comment,
				});
			}
		}
	}

	const result: any = {
		summary: {
			totalActions,
			totalErrors,
			errorRate: totalActions > 0 ? (totalErrors / totalActions * 100).toFixed(2) + '%' : '0%',
		},
		errorsByCollection: Object.values(errorsByCollection),
		errorsByType: Object.entries(errorsByType).map(([type, count]) => ({
			type,
			count,
		})),
	};

	if (includeSuccessRate) {
		result.summary.successfulActions = totalActions - totalErrors;
		result.summary.successRate = totalActions > 0 ? ((totalActions - totalErrors) / totalActions * 100).toFixed(2) + '%' : '100%';
	}

	return result;
}

/**
 * Extract error type from error message
 */
function extractErrorType(message: string): string {
	if (!message) return 'Unknown';

	const lowerMessage = message.toLowerCase();

	if (lowerMessage.includes('authentication') || lowerMessage.includes('auth')) return 'Authentication';
	if (lowerMessage.includes('permission') || lowerMessage.includes('forbidden')) return 'Permission';
	if (lowerMessage.includes('validation')) return 'Validation';
	if (lowerMessage.includes('not found') || lowerMessage.includes('404')) return 'NotFound';
	if (lowerMessage.includes('timeout')) return 'Timeout';
	if (lowerMessage.includes('network')) return 'Network';
	if (lowerMessage.includes('database') || lowerMessage.includes('sql')) return 'Database';

	return 'General';
}

/**
 * Analyze peak usage times
 */
export async function analyzePeakUsageTimes(
	this: IExecuteFunctions,
	dateRange?: { from?: string; to?: string },
	granularity: 'hour' | 'day' | 'both' = 'both',
): Promise<any> {
	const filter: IDataObject = {};

	if (dateRange?.from || dateRange?.to) {
		const timestampFilter: IDataObject = {};
		if (dateRange.from) {
			timestampFilter._gte = dateRange.from;
		}
		if (dateRange.to) {
			timestampFilter._lte = dateRange.to;
		}
		filter.timestamp = timestampFilter;
	}

	// Fetch all activity logs
	const response = await directusApiRequest.call(
		this,
		'GET',
		'/activity',
		{},
		{
			filter,
			limit: -1,
			fields: ['timestamp'],
		},
	);

	const activities = response.data || response;

	const hourStats: Record<number, number> = {};
	const dayStats: Record<number, number> = {};

	for (const activity of activities) {
		if (!activity.timestamp) continue;

		const date = new Date(activity.timestamp);
		const hour = date.getUTCHours();
		const day = date.getUTCDay(); // 0 = Sunday, 6 = Saturday

		if (granularity === 'hour' || granularity === 'both') {
			if (!hourStats[hour]) {
				hourStats[hour] = 0;
			}
			hourStats[hour]++;
		}

		if (granularity === 'day' || granularity === 'both') {
			if (!dayStats[day]) {
				dayStats[day] = 0;
			}
			dayStats[day]++;
		}
	}

	const result: any = {
		totalActivities: activities.length,
	};

	if (granularity === 'hour' || granularity === 'both') {
		result.byHour = Object.entries(hourStats)
			.map(([hour, count]) => ({
				hour: parseInt(hour),
				hourFormatted: `${hour.toString().padStart(2, '0')}:00 UTC`,
				count,
			}))
			.sort((a, b) => b.count - a.count);

		if (result.byHour.length > 0) {
			result.peakHour = result.byHour[0];
		}
	}

	if (granularity === 'day' || granularity === 'both') {
		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		result.byDay = Object.entries(dayStats)
			.map(([day, count]) => ({
				day: parseInt(day),
				dayName: dayNames[parseInt(day)],
				count,
			}))
			.sort((a, b) => b.count - a.count);

		if (result.byDay.length > 0) {
			result.peakDay = result.byDay[0];
		}
	}

	return result;
}

/**
 * Convert aggregation results to CSV format
 */
export function convertToCSV(data: any, type: string): string {
	if (!data) {
		return '';
	}

	let headers: string[] = [];
	let rows: string[][] = [];

	switch (type) {
		case 'user':
		case 'collection':
			// Handle array data
			if (!Array.isArray(data) || data.length === 0) {
				return '';
			}

			if (type === 'user') {
				headers = ['User ID', 'Email', 'First Name', 'Last Name', 'Total Actions'];
				if (data[0]?.actions) {
					const actionKeys = Object.keys(data[0].actions);
					headers.push(...actionKeys.map(k => k.charAt(0).toUpperCase() + k.slice(1)));
				}

				rows = data.map(item => {
					const row = [
						item.user || '',
						item.email || '',
						item.firstName || '',
						item.lastName || '',
						item.totalActions?.toString() || '0',
					];
					if (item.actions) {
						Object.values(item.actions).forEach((count: any) => {
							row.push(count?.toString() || '0');
						});
					}
					return row;
				});
			} else {
				headers = ['Collection', 'Total Actions'];
				if (data[0]?.actions) {
					const actionKeys = Object.keys(data[0].actions);
					headers.push(...actionKeys.map(k => k.charAt(0).toUpperCase() + k.slice(1)));
				}

				rows = data.map(item => {
					const row = [
						item.collection || '',
						item.totalActions?.toString() || '0',
					];
					if (item.actions) {
						Object.values(item.actions).forEach((count: any) => {
							row.push(count?.toString() || '0');
						});
					}
					return row;
				});
			}
			break;

		case 'error':
			// Handle complex error structure - data is not an array here
			if (Array.isArray(data)) {
				headers = ['Type', 'Count'];
				rows = data.map(item => [item.type || '', item.count?.toString() || '0']);
			} else if (data.summary) {
				headers = ['Metric', 'Value'];
				rows = Object.entries(data.summary).map(([key, value]) => [key, String(value)]);
			}
			break;

		case 'peak':
			// Handle peak usage structure - data is not an array here
			if (data.byHour && Array.isArray(data.byHour)) {
				headers = ['Hour', 'Count'];
				rows = data.byHour.map((item: any) => [item.hourFormatted || '', item.count?.toString() || '0']);
			} else if (data.byDay && Array.isArray(data.byDay)) {
				headers = ['Day', 'Count'];
				rows = data.byDay.map((item: any) => [item.dayName || '', item.count?.toString() || '0']);
			}
			break;
	}

	// Build CSV string
	const csvRows = [headers.join(',')];
	for (const row of rows) {
		csvRows.push(row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
	}

	return csvRows.join('\n');
}
