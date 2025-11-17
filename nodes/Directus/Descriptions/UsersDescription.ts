import {
	INodeProperties,
} from 'n8n-workflow';

export const usersOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'users',
				],
			},
		},
		options: [
			{
				name: 'Accept User Invite',
				value: 'acceptUserInvite',
				description: 'Accepts and enables an invited user using a JWT invitation token',
				action: 'Accept user invite a users',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new user',
				action: 'Create a users',
			},
			{
				name: 'Create Multiple',
				value: 'createMultiple',
				description: 'Create Multiple Users',
				action: 'Create multiple a users',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an existing user',
				action: 'Delete a users',
			},
			{
				name: 'Delete Multiple',
				value: 'deleteMultiple',
				description: 'Delete Multiple Users',
				action: 'Delete multiple a users',
			},
			{
				name: 'Disable 2FA',
				value: 'disable2FA',
				description: 'Disables two-factor authentication for the currently authenticated user',
				action: 'Disable 2FA a users',
			},
			{
				name: 'Enable 2FA',
				value: 'enable2FA',
				description: 'Enables two-factor authentication for the currently authenticated user',
				action: 'Enable 2FA a users',
			},
			{
				name: 'Generate 2FA',
				value: 'generate2FA',
				description: 'Generate 2FA Secret',
				action: 'Generate 2FA a users',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a single user by unique identifier',
				action: 'Get a users',
			},
			{
				name: 'Get Current',
				value: 'getCurrent',
				description: 'Retrieve the currently authenticated user',
				action: 'Get current a users',
			},
			{
				name: 'Invite User',
				value: 'inviteUser',
				description: 'Invites one or more users to this project. It creates a user with an invited status, and then sends an email to the user with instructions on how to activate their account.',
				action: 'Invite user a users',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List the users',
				action: 'List a users',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing user',
				action: 'Update a users',
			},
			{
				name: 'Update Me',
				value: 'updateMe',
				description: 'Update the currently authenticated user',
				action: 'Update me a users',
			},
			{
				name: 'Update Multiple',
				value: 'updateMultiple',
				description: 'Update Multiple Users',
				action: 'Update multiple a users',
			},
		],
		default: 'list',
	},
];

export const usersFields: INodeProperties[] = [
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'inviteUser',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: 'another@example.com',
		default: '',
		description: 'User email to invite',
		required: true,
	},
	{
		displayName: 'Role',
		name: 'role',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'inviteUser',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: 'Administrator',
		default: '',
		description: 'Role of the new user. Can be either a role UUID (e.g., c86c2761-65d3-43c3-897f-6f74ad6a5bd7) or role name (e.g., Administrator). Common roles: Administrator, Public.',
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
					'inviteUser',
				],
				resource: [
					'users',
				],
			},
		},
		options: [
			{
				displayName: 'Invite URL',
				name: 'inviteUrl',
				type: 'string',
				placeholder: '',
				default: '',
				description: 'Provide a custom invite URL which the link in the email will lead to. The invite token will be passed as a parameter. Note: You need to configure the [`USER_INVITE_URL_ALLOW_LIST` environment variable](https://docs.directus.io/reference/environment-variables/#security) to enable this feature.',
			},
		],
	},
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		typeOptions: { password: true },
		displayOptions: {
			show: {
				operation: [
					'acceptUserInvite',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: 'd1r3ctu5',
		default: '',
		description: 'Password of the user',
		required: true,
	},
	{
		displayName: 'Token',
		name: 'token',
		type: 'string',
		typeOptions: { password: true },
		displayOptions: {
			show: {
				operation: [
					'acceptUserInvite',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: 'eyJh...KmUk',
		default: '',
		description: 'Accept invite token',
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
					'generate2FA',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: 'd1r3ctu5',
		default: '',
		description: 'The user\'s password of the currently authenticated user',
		required: true,
	},
	{
		displayName: 'Secret',
		name: 'secret',
		type: 'string',
		typeOptions: { password: true },
		displayOptions: {
			show: {
				operation: [
					'enable2FA',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: '123456',
		default: '',
		description: 'The TFA secret from tfa/generate',
		required: true,
	},
	{
		displayName: 'OTP',
		name: 'otp',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'enable2FA',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: '3CtiutsNBmY3szHE',
		default: '',
		description: 'OTP generated with the secret, to recheck if the user has a correct TFA setup',
		required: true,
	},
	{
		displayName: 'OTP',
		name: 'otp',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'disable2FA',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: '859014',
		default: '',
		description: 'One-time password generated by the authenticator app',
		required: true,
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'users',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		placeholder: 'another@example.com',
		default: '',
		description: 'A partial [user object](https://docs.directus.io/reference/api/system/users/#the-user-object)',
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
					'create',
				],
				resource: [
					'users',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		placeholder: 'd1r3ctu5',
		default: '',
		description: 'A partial [user object](https://docs.directus.io/reference/api/system/users/#the-user-object)',
		required: true,
	},
	{
		displayName: 'JSON/RAW Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: '',
		default: false,
		description: 'If the query and/or body parameter should be set via the value-key pair UI or JSON/RAW',
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
					'create',
				],
				resource: [
					'users',
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
					'create',
				],
				resource: [
					'users',
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
				displayName: 'Avatar',
				name: 'avatar',
				type: 'string',
				placeholder: '',
				default: '',
				description: 'Avatar file. Many-to-one to [files](https://docs.directus.io/reference/api/system/files/).',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				placeholder: '',
				default: '',
				description: 'Description of the user',
			},
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				placeholder: 'Admin',
				default: '',
				description: 'First name of the user',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				placeholder: 'en-US',
				default: '',
				description: 'Language the Admin App is rendered in. See [our Crowdin page ](https://locales.directus.io/) [(opens new window)](https://locales.directus.io/) for all available languages and translations.',
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				placeholder: 'User',
				default: '',
				description: 'Last name of the user',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				placeholder: 'New York City',
				default: '',
				description: 'Location of the user',
			},
			{
				displayName: 'Role Name or ID',
				name: 'role',
				type: 'options',
				placeholder: '',
				default: '',
				description: 'Role of the User. Can be a role UUID, role name, or choose from the list. The role name will be automatically resolved to its UUID. Common roles: Administrator, Public.',
				typeOptions: {
					loadOptionsMethod: 'getRoles',
				},
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				placeholder: '',
				default: '',
				description: 'Tags for the user',
			},
			{
				displayName: 'TFA Secret',
				name: 'tfa_secret',
				type: 'string',
				typeOptions: { password: true },
				placeholder: '',
				default: '',
			},
			{
				displayName: 'Theme',
				name: 'theme',
				type: 'options',
				placeholder: 'Select an option',
				default: 'auto',
				description: 'One of auto, light, dark',
				options: [
					{
						name: 'Auto',
						value: 'auto',
					},
					{
						name: 'Dark',
						value: 'dark',
					},
					{
						name: 'Light',
						value: 'light',
					},
				],
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				placeholder: 'CTO',
				default: '',
				description: 'Title of the user',
			},
		],
	},
	{
		displayName: 'Data (JSON)',
		name: 'data',
		type: 'json',
		displayOptions: {
			show: {
				operation: [
					'createMultiple',
				],
				resource: [
					'users',
				],
				inputType: [
					'json',
				],
			},
		},
		placeholder: '[\n	{\n		"email": "admin@example.com",\n		"password": "p455w0rd",\n		"role": "Administrator"\n	},\n	{\n		"email": "another@example.com",\n		"password": "d1r3ctu5",\n		"role": "Administrator"\n	}\n]',
		default: null,
		description: 'An array of partial [user objects](https://docs.directus.io/reference/api/system/users/#the-user-object). Role can be UUID or role name (e.g., "Administrator").',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'createMultiple',
				],
				resource: [
					'users',
				],
			},
		},
		options: [
			{
				name: 'JSON',
				value: 'json',
				description: 'Provide user data as JSON array',
			},
			{
				name: 'CSV',
				value: 'csv',
				description: 'Provide user data as CSV',
			},
		],
		default: 'json',
		description: 'Input format for user data (JSON or CSV)',
	},
	{
		displayName: 'Data (CSV)',
		name: 'csvData',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'createMultiple',
				],
				resource: [
					'users',
				],
				inputType: [
					'csv',
				],
			},
		},
		placeholder: 'email,password,role,first_name,last_name\nadmin@example.com,p455w0rd,Administrator,John,Doe\nanother@example.com,d1r3ctu5,Administrator,Jane,Smith',
		default: '',
		description: 'CSV data with header row. First row must contain field names. Role can be UUID or role name (e.g., "Administrator").',
		required: true,
		typeOptions: {
			rows: 10,
		},
	},
	{
		displayName: 'Error Handling',
		name: 'errorHandling',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'createMultiple',
				],
				resource: [
					'users',
				],
			},
		},
		options: [
			{
				name: 'Stop on First Error',
				value: 'stop',
				description: 'Stop processing when the first error occurs',
			},
			{
				name: 'Continue on Error',
				value: 'continue',
				description: 'Continue processing remaining items even if errors occur',
			},
		],
		default: 'stop',
		description: 'How to handle errors during bulk creation',
	},
	{
		displayName: 'ID',
		name: 'id',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'get',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: '72a1ce24-4748-47de-a05f-ce9af3033727',
		default: '',
		description: 'Primary key of the user',
		required: true,
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'users',
				],
				operation: [
					'list',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		default: true,
		description: 'Whether to return all results or only up to a given limit',
		required: true,
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				operation: [
					'list',
				],
				resource: [
					'users',
				],
				returnAll: [
					false,
				],
			},
		},
		placeholder: '',
		default: 50,
		description: 'Max number of results to return',
		required: true,
		typeOptions: {
			minValue: 1,
		},
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
					'users',
				],
			},
		},
	},
	{
		displayName: 'JSON/RAW Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: [
					'list',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: '',
		default: false,
		description: 'If the query and/or body parameter should be set via the value-key pair UI or JSON/RAW',
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
					'list',
				],
				resource: [
					'users',
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
					'list',
				],
				resource: [
					'users',
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
				displayName: 'Aggregate',
				name: 'aggregate',
				type: 'fixedCollection',
				placeholder: 'Add Aggregation Functions',
				default: {},
				description: 'Aggregate functions allow you to perform calculations on a set of values, returning a single result',
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'aggregationFunctions',
						displayName: 'Functions',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'options',
								default: 'count',
								options: [
									{
										name: 'Count',
										value: 'count',
										description: 'Counts how many items there are',
									},
									{
										name: 'Count Distinct',
										value: 'countDistinct',
										description: 'Counts how many unique items there are',
									},
									{
										name: 'SUM',
										value: 'sum',
										description: 'Adds together the values in the given field',
									},
									{
										name: 'SUM Distinct',
										value: 'sumDistinct',
										description: 'Adds together the unique values in the given field',
									},
									{
										name: 'Average',
										value: 'avg',
										description: 'Get the average value of the given field',
									},
									{
										name: 'Average Distinct',
										value: 'avgDistinct',
										description: 'Get the average value of the unique values in the given field',
									},
									{
										name: 'Minimum',
										value: 'min',
										description: 'Return the lowest value in the field',
									},
									{
										name: 'Maximum',
										value: 'max',
										description: 'Return the highest value in the field',
									},
								],
								description: 'Aggregation Function',
							},
							{
								displayName: 'Field Name or ID',
								name: 'value',
								type: 'options',
								default: '',
								description: 'Field to apply aggregation on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
								typeOptions: {
									loadOptionsMethod: 'getFieldsInCollection',
								},
							},
						],
					},
				],
			},
			{
				displayName: 'Binary Property for Export Data',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property to download the data to',
			},
			{
				displayName: 'Deep (JSON)',
				name: 'deep',
				type: 'json',
				placeholder: '',
				default: null,
				description: 'Deep allows you to set any of the other query parameters on a nested relational dataset',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
			{
				displayName: 'Export',
				name: 'export',
				type: 'options',
				placeholder: 'Select an option',
				default: 'csv',
				description: 'Saves the API response to a file. Accepts one of JSON, csv, xml.',
				options: [
					{
						name: 'CSV',
						value: 'csv',
					},
					{
						name: 'JSON',
						value: 'json',
					},
					{
						name: 'XML',
						value: 'xml',
					},
				],
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				placeholder: '',
				default: '',
				description: 'Control what fields are being returned in the object',
			},
			{
				displayName: 'File Name for Export Data',
				name: 'fileName',
				type: 'string',
				default: 'export',
				description: 'File Name for the Export data without the extension',
			},
			{
				displayName: 'Filter (JSON)',
				name: 'filter',
				type: 'json',
				placeholder: '',
				default: null,
				description: 'Select items in collection by given conditions',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
			{
				displayName: 'Group By',
				name: 'groupBy',
				type: 'string',
				placeholder: 'author,year(publish_date)',
				default: '',
				description: 'Grouping allows for running the aggregation functions based on a shared value. This allows for things like "Average rating per month" or "Total sales of items in the jeans category".',
			},
			{
				displayName: 'Meta',
				name: 'meta',
				type: 'string',
				placeholder: '',
				default: '',
				description: 'What metadata to return in the response',
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				placeholder: '',
				default: null,
				description: 'How many items to skip when fetching data',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				placeholder: '',
				default: '',
				description: 'Filter by items that contain the given search query in one of their fields',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'string',
				placeholder: '',
				default: '',
				description: 'How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly.',
			},
		],
	},
	{
		displayName: 'ID',
		name: 'id',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'update',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: '72a1ce24-4748-47de-a05f-ce9af3033727',
		default: '',
		description: 'Primary key of the user',
		required: true,
	},
	{
		displayName: 'Data (JSON)',
		name: 'data',
		type: 'json',
		displayOptions: {
			show: {
				operation: [
					'update',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: '{\n	"title": "CTO"\n}',
		default: null,
		description: 'A partial [user object](https://docs.directus.io/reference/api/system/users/#the-user-object)',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
	{
		displayName: 'Data (JSON)',
		name: 'data',
		type: 'json',
		displayOptions: {
			show: {
				operation: [
					'updateMultiple',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: '{\n	"keys": ["72a1ce24-4748-47de-a05f-ce9af3033727", "9c3d75a8-7a5f-41a4-be0a-1488fd974511"],\n	"data": {\n		"title": "CTO"\n	}\n}',
		default: null,
		description: 'Required: - **`keys`** [Array of primary keys of the users you\'d like to update.] - **`data`** [Any of [the user object](https://docs.directus.io/reference/api/system/users/#the-user-object)\'s properties.]',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
	{
		displayName: 'Error Handling',
		name: 'errorHandling',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'updateMultiple',
				],
				resource: [
					'users',
				],
			},
		},
		options: [
			{
				name: 'Stop on First Error',
				value: 'stop',
				description: 'Stop processing when the first error occurs',
			},
			{
				name: 'Continue on Error',
				value: 'continue',
				description: 'Continue processing remaining items even if errors occur',
			},
		],
		default: 'stop',
		description: 'How to handle errors during bulk update',
	},
	{
		displayName: 'ID',
		name: 'id',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'delete',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: '72a1ce24-4748-47de-a05f-ce9af3033727',
		default: '',
		description: 'Primary key of the user',
		required: true,
	},
	{
		displayName: 'Keys (JSON)',
		name: 'keys',
		type: 'json',
		displayOptions: {
			show: {
				operation: [
					'deleteMultiple',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: '["653925a9-970e-487a-bfc0-ab6c96affcdc", "c86c2761-65d3-43c3-897f-6f74ad6a5bd7"]',
		default: null,
		description: 'An array of user primary keys',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
	{
		displayName: 'Error Handling',
		name: 'errorHandling',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'deleteMultiple',
				],
				resource: [
					'users',
				],
			},
		},
		options: [
			{
				name: 'Stop on First Error',
				value: 'stop',
				description: 'Stop processing when the first error occurs',
			},
			{
				name: 'Continue on Error',
				value: 'continue',
				description: 'Continue processing remaining items even if errors occur',
			},
		],
		default: 'stop',
		description: 'How to handle errors during bulk deletion',
	},
	{
		displayName: 'Data (JSON)',
		name: 'data',
		type: 'json',
		displayOptions: {
			show: {
				operation: [
					'updateMe',
				],
				resource: [
					'users',
				],
			},
		},
		placeholder: '{\n	"title": "CTO"\n}',
		default: null,
		description: 'Update the currently authenticated user',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
];

