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
} from 'n8n-workflow';

import { Buffer } from 'buffer';

export interface IDirectusCredentials {
	url: string;
	authMethod: 'staticToken' | 'credentials';
	staticToken?: string;
	email?: string;
	password?: string;
}

export async function directusApiRequest(
	this: IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: string,
	endpoint: string,
	body: any = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = (await this.getCredentials('directusApi')) as IDirectusCredentials;
	
	if (!credentials) {
		throw new Error('No credentials configured');
	}

	const baseUrl = credentials.url.replace(/\/$/, '');
	const url = `${baseUrl}/${endpoint.replace(/^\//, '')}`;
	
	const options: IHttpRequestOptions = {
		method: method.toUpperCase() as any,
		url,
		body,
		qs,
		json: true,
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'n8n-nodes-directus',
		},
	};

	// Add authentication
	if (credentials.authMethod === 'staticToken' && credentials.staticToken) {
		options.headers!['Authorization'] = `Bearer ${credentials.staticToken}`;
	}

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'directusApi', options);
		return response;
	} catch (error: any) {
		Logger.error('Directus API Error:', error);
		throw new Error(`Directus API Error: ${error.message || error}`);
	}
}

export function validateJSON(json: string | undefined): any {
	if (!json) return undefined;
	
	try {
		return JSON.parse(json);
	} catch (exception) {
		return undefined;
	}
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
