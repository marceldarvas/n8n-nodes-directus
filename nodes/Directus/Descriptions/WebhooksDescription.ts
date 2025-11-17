import {
	INodeProperties,
} from 'n8n-workflow';

export const webhooksOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'webhooks',
				],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new webhook',
				action: 'Create a webhooks',
			},
			{
				name: 'Create Multiple',
				value: 'createMultiple',
				description: 'Create Multiple Webhooks',
				action: 'Create multiple a webhooks',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an existing webhook',
				action: 'Delete a webhooks',
			},
			{
				name: 'Delete Multiple',
				value: 'deleteMultiple',
				description: 'Delete Multiple Webhooks',
				action: 'Delete multiple a webhooks',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a single webhook by unique identifier',
				action: 'Get a webhooks',
			},
			{
				name: 'List',
				value: 'list',
				description: 'Get all webhooks',
				action: 'List a webhooks',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing webhook',
				action: 'Update a webhooks',
			},
			{
				name: 'Update Multiple',
				value: 'updateMultiple',
				description: 'Update Multiple Webhooks',
				action: 'Update multiple a webhooks',
			},
		],
		default: 'list',
	},
];

export const webhooksFields: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'webhooks',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		placeholder: 'Build Website',
		default: '',
		description: 'Name for the webhook. Shown in the Admin App.',
		required: true,
	},
	{
		displayName: 'Actions',
		name: 'actions',
		type: 'multiOptions',
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'webhooks',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		placeholder: '["create", "update"]',
		default: [],
		description: 'When to fire the webhook. Can contain create, update, delete.',
		required: true,
		options: [
			{
				name: 'Create',
				value: 'create',
			},
			{
				name: 'Delete',
				value: 'delete',
			},
			{
				name: 'Update',
				value: 'update',
			},
		],
	},
	{
		displayName: 'Collection Names or IDs',
		name: 'collections',
		type: 'multiOptions',
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'webhooks',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		placeholder: '["articles"]',
		default: [],
		description: 'What collections to fire this webhook on. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomCollections',
		},
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'webhooks',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		placeholder: 'https://example.com/',
		default: '',
		description: 'Where to send the request too',
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
					'webhooks',
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
					'webhooks',
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
		displayName: 'Data (JSON)',
		name: 'data',
		type: 'json',
		displayOptions: {
			show: {
				operation: [
					'createMultiple',
				],
				resource: [
					'webhooks',
				],
			},
		},
		placeholder: '[\n	{\n		"name": "Example",\n		"actions": ["create", "update"],\n		"collections": ["articles"],\n		"url": "https://example.com"\n	},\n	{\n		"name": "Second Example",\n		"actions": ["delete"],\n		"collections": ["articles"],\n		"url": "https://example.com/on-delete"\n	}\n]',
		default: null,
		description: 'An array of partial [webhook object](https://docs.directus.io/reference/api/system/webhooks/#the-webhook-object). `name`, `actions`, `collections`, and `URL` are required.',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
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
					'webhooks',
				],
			},
		},
		placeholder: '15',
		default: '',
		description: 'Primary key of the webhook',
		required: true,
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'webhooks',
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
					'webhooks',
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
					'webhooks',
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
					'webhooks',
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
					'webhooks',
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
					'webhooks',
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
		displayName: 'Data (JSON)',
		name: 'data',
		type: 'json',
		displayOptions: {
			show: {
				operation: [
					'updateMultiple',
				],
				resource: [
					'webhooks',
				],
			},
		},
		placeholder: '{\n	"keys": [15, 41],\n	"data": {\n		"name": "Build Website"\n	}\n}',
		default: null,
		description: 'Required: - **`keys`** [Array of primary keys of the webhooks you\'d like to update] - **`data`** [Any of [the webhook object](https://docs.directus.io/reference/api/system/webhooks/#the-webhook-object)\'s properties]',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
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
					'webhooks',
				],
			},
		},
		placeholder: '15',
		default: '',
		description: 'Primary key of the webhook',
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
					'webhooks',
				],
			},
		},
		placeholder: '{\n	"name": "Build Website"\n}',
		default: null,
		description: 'A partial [webhook object](https://docs.directus.io/reference/api/system/webhooks/#the-webhook-object)',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
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
					'webhooks',
				],
			},
		},
		placeholder: '[2, 15, 41]',
		default: null,
		description: 'An array of webhook primary keys',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
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
					'webhooks',
				],
			},
		},
		placeholder: '15',
		default: '',
		description: 'Primary key of the webhook',
		required: true,
	},
];

