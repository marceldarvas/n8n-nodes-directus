import {
	INodeProperties,
} from 'n8n-workflow';

export const permissionsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'permissions',
				],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new permission',
				action: 'Create a permissions',
			},
			{
				name: 'Create Multiple',
				value: 'createMultiple',
				description: 'Create Multiple Permission Rules',
				action: 'Create Multiple a permissions',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an existing permission',
				action: 'Delete a permissions',
			},
			{
				name: 'Delete Multiple',
				value: 'deleteMultiple',
				description: 'Delete Multiple Permissions',
				action: 'Delete Multiple a permissions',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a single permissions object by unique identifier',
				action: 'Get a permissions',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all permissions',
				action: 'List a permissions',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing permission',
				action: 'Update a permissions',
			},
			{
				name: 'Update Multiple',
				value: 'updateMultiple',
				description: 'Update Multiple Permissions',
				action: 'Update Multiple a permissions',
			},
		],
		default: 'list',
	},
];

export const permissionsFields: INodeProperties[] = [
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
					'permissions',
				],
			},
		},
		placeholder: '[34, 64]',
		default: null,
		description: 'An array of permission primary keys',
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
					'permissions',
				],
			},
		},
		placeholder: '34',
		default: '',
		description: 'Primary key of the permission rule.',
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
					'permissions',
				],
			},
		},
		placeholder: '{ "fields": ["ID", "title", "body"] }',
		default: null,
		description: 'A partial [permissions object](https://docs.directus.io/reference/api/system/permissions/#the-permission-object).',
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
					'permissions',
				],
			},
		},
		placeholder: '34',
		default: '',
		description: 'Primary key of the permission rule.',
		required: true,
	},
	{
		displayName: 'Collection Name or ID',
		name: 'collection',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'permissions',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		placeholder: 'customers',
		default: '',
		description: 'What collection this permission applies to.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCollections',
		},
	},
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'permissions',
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		placeholder: 'create',
		default: 'create',
		description: 'What CRUD operation this permission rule applies to. One of `create`, `read`, `update`, `delete`.',
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
				name: 'Read',
				value: 'read',
			},
			{
				name: 'Update',
				value: 'update',
			},
		],
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
					'permissions',
				],
			},
		},
		placeholder: '',
		default: false,
		description: 'If the query and/or body parameter should be set via the value-key pair UI or JSON/RAW.',
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
					'permissions',
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
					'updateMultiple',
				],
				resource: [
					'permissions',
				],
			},
		},
		placeholder: '{ "keys": [34, 65], "data": { "fields": ["ID", "title", "body"] } }',
		default: null,
		description: 'Required: - keys [Array of primary keys of the permissions you\'d like to update.] - data [Any of [the permission object](https://docs.directus.io/reference/api/system/permissions/#the-permission-object)\'s properties.]',
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
					'permissions',
				],
			},
		},
		placeholder: '34',
		default: '',
		description: 'Primary key of the permission rule.',
		required: true,
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'permissions',
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
		description: 'If all results should be returned or only up to a given limit',
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
					'permissions',
				],
				returnAll: [
					false,
				],
			},
			hide: {
				jsonParameters: [
					true,
				],
			},
		},
		placeholder: '',
		default: 50,
		description: 'A limit on the number of objects that are returned.',
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
					'permissions',
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
					'permissions',
				],
			},
		},
		placeholder: '',
		default: false,
		description: 'If the query and/or body parameter should be set via the value-key pair UI or JSON/RAW.',
		required: true,
	},
	{
		displayName: 'Query Parameters',
		name: 'queryParametersJson',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				operation: [
					'list',
				],
				resource: [
					'permissions',
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
		description: 'Query parameters as JSON (flat object)',
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
					'permissions',
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
				description: 'Aggregate functions allow you to perform calculations on a set of values, returning a single result.',
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
				description: 'Deep allows you to set any of the other query parameters on a nested relational dataset.',
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
				description: 'Control what fields are being returned in the object.',
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
				description: 'Select items in collection by given conditions.',
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
				description: 'What metadata to return in the response.',
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				placeholder: '',
				default: null,
				description: 'How many items to skip when fetching data.',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				placeholder: '',
				default: '',
				description: 'Filter by items that contain the given search query in one of their fields.',
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
					'createMultiple',
				],
				resource: [
					'permissions',
				],
			},
		},
		placeholder: '[ { "collection": "pages", "action": "read", "role": "c86c2761-65d3-43c3-897f-6f74ad6a5bd7", "fields": ["ID", "title"] }, { "collection": "pages", "action": "create", "role": "c86c2761-65d3-43c3-897f-6f74ad6a5bd7", "fields": ["id", "title"] } ]',
		default: null,
		description: 'An array of partial [permissions objects](https://docs.directus.io/reference/api/system/permissions/#the-permission-object). `action` and `collection` are required.',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
];

