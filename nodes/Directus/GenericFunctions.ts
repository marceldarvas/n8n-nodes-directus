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
