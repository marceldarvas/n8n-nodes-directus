import {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class DirectusApi implements ICredentialType {
	name = 'directusApi';
	displayName = 'Directus API';
	documentationUrl = 'https://docs.directus.io/reference/introduction/';
	icon: Icon = 'file:directus.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'Directus Instance URL',
			name: 'url',
			type: 'string',
			default: '',
			placeholder: 'https://your-directus-instance.com',
			description: 'The complete URL of your Directus instance',
			required: true,
		},
		{
			displayName: 'Authentication Method',
			name: 'authMethod',
			type: 'options',
			options: [
				{
					name: 'Static Token',
					value: 'staticToken',
				},
				{
					name: 'Email & Password',
					value: 'credentials',
				},
			],
			default: 'staticToken',
			description: 'Method to use for authentication',
		},
		{
			displayName: 'Static Token',
			name: 'staticToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'your-directus-static-token',
			description: 'Static token for API authentication',
			displayOptions: {
				show: {
					authMethod: ['staticToken'],
				},
			},
			required: true,
		},
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			default: '',
			placeholder: 'admin@example.com',
			description: 'Email address for authentication',
			displayOptions: {
				show: {
					authMethod: ['credentials'],
				},
			},
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Password for authentication',
			displayOptions: {
				show: {
					authMethod: ['credentials'],
				},
			},
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Authorization': '={{"Bearer " + $credentials.staticToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.url}}',
			url: '/server/info',
			method: 'GET',
		},
	};
}
