import {
	INodeProperties,
} from 'n8n-workflow';

export const authOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'auth',
				],
			},
		},
		options: [
			{
				name: 'List',
				value: 'list',
				description: 'List configured OAuth providers',
				action: 'List an auth',
			},
			{
				name: 'Login',
				value: 'login',
				description: 'Retrieve a Temporary Access Token',
				action: 'Login an auth',
			},
			{
				name: 'Log Out',
				value: 'logout',
			},
			{
				name: 'Refresh Token',
				value: 'refreshToken',
				description: 'Refresh a Temporary Access Token',
				action: 'Refresh Token an auth',
			},
			{
				name: 'Request Password Reset',
				value: 'requestReset',
				description: 'Request a reset password email to be send',
				action: 'Request Password Reset an auth',
			},
			{
				name: 'Reset Password',
				value: 'resetPassword',
				description: 'The request a password reset endpoint sends an email with a link to the admin app which in turn uses this endpoint to allow the user to reset their password',
				action: 'Reset Password an auth',
			},
			{
				name: 'Start OAuth Flow',
				value: 'startOauthFlow',
				description: 'Start OAuth flow using the specified provider',
				action: 'Start OAuth Flow an auth',
			},
		],
		default: 'list',
	},
];

export const authFields: INodeProperties[] = [
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		typeOptions: { password: true },
		displayOptions: {
			show: {
				operation: [
					'login',
				],
				resource: [
					'auth',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		placeholder: 'password',
		default: '',
		description: 'Password of the user.',
		required: true,
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'login',
				],
				resource: [
					'auth',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		placeholder: 'admin@example.com',
		default: '',
		description: 'Email address of the user you\'re retrieving the access token for.',
		required: true,
	},
	{
		displayName: 'JSON/RAW Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: [
					'login',
				],
				resource: [
					'auth',
				],
			},
		},
		placeholder: '',
		default: false,
		required: true,
	},
	{
		displayName: 'Body Parameters',
		name: 'bodyParametersJson',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				operation: [
					'login',
				],
				resource: [
					'auth',
				],
				jsonParameters: [
					true,
				],
			},
		},
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		description: 'Body parameters as JSON or RAW',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				operation: [
					'login',
				],
				resource: [
					'auth',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		options: [
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				placeholder: 'Select an option',
				default: 'cookie',
				description: 'Choose between retrieving the token as a string, or setting it as a cookie.',
				options: [
					{
						name: 'Cookie',
						value: 'cookie',
					},
					{
						name: 'JSON',
						value: 'json',
					},
				],
			},
			{
				displayName: 'OTP',
				name: 'otp',
				type: 'string',
				placeholder: '',
				default: '',
				description: 'If 2FA is enabled, you need to pass the one time password.',
			},
		],
	},
	{
		displayName: 'Refresh Token',
		name: 'refreshToken',
		type: 'string',
		typeOptions: { password: true },
		displayOptions: {
			show: {
				operation: [
					'refreshToken',
				],
				resource: [
					'auth',
				],
			},
		},
		placeholder: 'eyJ0eXAiOiJKV...',
		default: '',
		description: 'JWT access token you want to refresh. This token can\'t be expired.',
		required: true,
	},
	{
		displayName: 'Refresh Token',
		name: 'refreshToken',
		type: 'string',
		typeOptions: { password: true },
		displayOptions: {
			show: {
				operation: [
					'logout',
				],
				resource: [
					'auth',
				],
			},
		},
		placeholder: 'eyJ0eXAiOiJKV...',
		default: '',
		description: 'JWT access token you want to logout.',
		required: true,
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'requestReset',
				],
				resource: [
					'auth',
				],
			},
		},
		placeholder: 'admin@example.com',
		default: '',
		description: 'Email address of the user you\'re requesting a reset for.',
		required: true,
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				operation: [
					'requestReset',
				],
				resource: [
					'auth',
				],
			},
		},
		options: [
			{
				displayName: 'Reset URL',
				name: 'resetUrl',
				type: 'string',
				placeholder: '',
				default: '',
				description: 'Provide a custom reset URL which the link in the email will lead to. The reset token will be passed as a parameter. Note: You need to configure the [`PASSWORD_RESET_URL_ALLOW_LIST` environment variable](https://docs.directus.io/reference/environment-variables/#security) to enable this feature.',
			},
		],
	},
	{
		displayName: 'Token',
		name: 'token',
		type: 'string',
		typeOptions: { password: true },
		displayOptions: {
			show: {
				operation: [
					'resetPassword',
				],
				resource: [
					'auth',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		placeholder: 'eyJ0eXAiOiJKV1Qi...',
		default: '',
		description: 'One-time use JWT token that is used to verify the user.',
		required: true,
	},
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		typeOptions: { password: true },
		displayOptions: {
			show: {
				operation: [
					'resetPassword',
				],
				resource: [
					'auth',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		placeholder: 'password',
		default: '',
		description: 'New password for the user.',
		required: true,
	},
	{
		displayName: 'JSON/RAW Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: [
					'resetPassword',
				],
				resource: [
					'auth',
				],
			},
		},
		placeholder: '',
		default: false,
		required: true,
	},
	{
		displayName: 'Body Parameters',
		name: 'bodyParametersJson',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				operation: [
					'resetPassword',
				],
				resource: [
					'auth',
				],
				jsonParameters: [
					true,
				],
			},
		},
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		description: 'Body parameters as JSON or RAW',
	},
	{
		displayName: 'Split Into Items',
		name: 'splitIntoItems',
		type: 'boolean',
		default: false,
		description: 'Outputs each element of an array as own item',
		required: true,
		displayOptions: {
			show: {
				operation: [
					'list',
				],
				resource: [
					'auth',
				],
			},
		},
	},
	{
		displayName: 'Provider',
		name: 'provider',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'startOauthFlow',
				],
				resource: [
					'auth',
				],
			},
		},
		placeholder: '',
		default: '',
		description: 'Key of the activated OAuth provider.',
		required: true,
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				operation: [
					'startOauthFlow',
				],
				resource: [
					'auth',
				],
			},
		},
		options: [
			{
				displayName: 'Redirect',
				name: 'redirect',
				type: 'string',
				placeholder: '',
				default: '',
				description: 'Where to redirect on successful login.If set the authentication details are set inside cookies otherwise a JSON is returned.',
			},
		],
	},
];

