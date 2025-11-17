import {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
	Icon,
} from 'n8n-workflow';

export class DirectusOAuth2Api implements ICredentialType {
	name = 'directusOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'Directus OAuth2 API';
	documentationUrl = 'https://docs.directus.io/self-hosted/sso/';
	icon: Icon = 'file:directus.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'Directus Instance URL',
			name: 'instanceUrl',
			type: 'string',
			default: '',
			placeholder: 'https://your-directus-instance.com',
			description: 'The complete URL of your Directus instance (without trailing slash)',
			required: true,
		},
		{
			displayName: 'SSO Provider',
			name: 'provider',
			type: 'options',
			options: [
				{
					name: 'Google',
					value: 'google',
				},
				{
					name: 'GitHub',
					value: 'github',
				},
				{
					name: 'Azure AD',
					value: 'azure',
				},
				{
					name: 'OAuth2',
					value: 'oauth2',
				},
				{
					name: 'OpenID',
					value: 'openid',
				},
				{
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'oauth2',
			description: 'The SSO provider configured in your Directus instance. This is used for documentation and endpoint configuration.',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'string',
			default: '',
			placeholder: 'https://your-directus-instance.com/auth/login/oauth2',
			description: 'OAuth2 authorization endpoint. For Directus SSO: {instanceUrl}/auth/login/{provider}',
			required: true,
			displayOptions: {
				show: {
					grantType: ['authorizationCode'],
				},
			},
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'string',
			default: '',
			placeholder: 'https://your-directus-instance.com/auth/token',
			description: 'OAuth2 token endpoint. For Directus: {instanceUrl}/auth/token or use provider\'s token URL',
			required: true,
			displayOptions: {
				show: {
					grantType: ['authorizationCode'],
				},
			},
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'string',
			default: 'openid email profile',
			description: 'OAuth2 scopes to request. Common scopes: openid, email, profile. Separate multiple scopes with spaces.',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
			description: 'Additional query parameters for authorization URL (format: key1=value1&key2=value2)',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
			description: 'How to send credentials (header or body)',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.instanceUrl}}',
			url: '/users/me',
			method: 'GET',
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'data.id',
					value: '/.+/',
					message: 'OAuth2 authentication successful! User ID retrieved.',
				},
			},
		],
	};
}
