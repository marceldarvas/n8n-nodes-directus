import {
	INodeProperties,
} from 'n8n-workflow';

export const filesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'files',
				],
			},
		},
		options: [
			{
				name: 'Create / Upload',
				value: 'create',
				description: 'Create/Upload a new file',
				action: 'Create upload a files',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an existing file',
				action: 'Delete a files',
			},
			{
				name: 'Delete Multiple',
				value: 'deleteMultiple',
				description: 'Delete multiple files',
				action: 'Delete multiple a files',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a single file by unique identifier',
				action: 'Get a files',
			},
			{
				name: 'Import File',
				value: 'importFile',
				description: 'Import a file',
				action: 'Import file a files',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List the files',
				action: 'List a files',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing file',
				action: 'Update a files',
			},
			{
				name: 'Update Multiple',
				value: 'updateMultiple',
				description: 'Update Multiple Files',
				action: 'Update multiple a files',
			},
		],
		default: 'list',
	},
];

export const filesFields: INodeProperties[] = [
	{
		displayName: 'Send Binary Data',
		name: 'sendBinaryData',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'files',
				],
			},
		},
		placeholder: '',
		default: false,
		description: 'Upload/create a new file',
		required: true,
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: {
				sendBinaryData: [
					true,
				],
				operation: [
					'create',
				],
				resource: [
					'files',
				],
			},
		},
		description: 'Name of the binary property which contains the data for the file to be uploaded. For multiple files, values can be provided in the format: "binaryProperty1,binaryProperty2.',
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
					'files',
				],
			},
		},
		options: [
			{
				displayName: 'File Object (JSON)',
				name: 'data',
				type: 'json',
				placeholder: '',
				default: null,
				description: 'Other properties of [the file object](https://docs.directus.io/reference/api/system/files/#the-file-object)',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
		],
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'importFile',
				],
				resource: [
					'files',
				],
			},
		},
		placeholder: '',
		default: '',
		description: 'The URL to download the file from',
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
					'importFile',
				],
				resource: [
					'files',
				],
			},
		},
		options: [
			{
				displayName: 'File Object (JSON)',
				name: 'data',
				type: 'json',
				placeholder: '{\n	"title": "Example"\n}',
				default: null,
				description: 'Any of [the file object](https://docs.directus.io/reference/api/system/files/#the-file-object)\'s properties',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
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
					'delete',
				],
				resource: [
					'files',
				],
			},
		},
		placeholder: '0fca80c4-d61c-4404-9fd7-6ba86b64154d',
		default: '',
		description: 'Unique ID of the file object',
		required: true,
	},
	{
		displayName: 'Send Binary Data',
		name: 'sendBinaryData',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: [
					'update',
				],
				resource: [
					'files',
				],
			},
		},
		placeholder: '',
		default: false,
		description: 'Upload/create a new file',
		required: true,
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
					'files',
				],
			},
		},
		placeholder: '0fca80c4-d61c-4404-9fd7-6ba86b64154d',
		default: '',
		description: 'Unique ID of the file object',
		required: true,
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: {
				sendBinaryData: [
					true,
				],
				operation: [
					'update',
				],
				resource: [
					'files',
				],
			},
		},
		description: 'Name of the binary property which contains the data for the file to be uploaded. For multiple files, values can be provided in the format: "binaryProperty1,binaryProperty2.',
	},
	{
		displayName: 'Update Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				operation: [
					'update',
				],
				resource: [
					'files',
				],
			},
		},
		options: [
			{
				displayName: 'File Object (JSON)',
				name: 'data',
				type: 'json',
				placeholder: '',
				default: null,
				description: 'Other properties of [the file object](https://docs.directus.io/reference/api/system/files/#the-file-object)',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
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
					'get',
				],
				resource: [
					'files',
				],
			},
		},
		placeholder: '0fca80c4-d61c-4404-9fd7-6ba86b64154d',
		default: '',
		description: 'Unique ID of the file object',
		required: true,
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'files',
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
					'files',
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
					'files',
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
					'files',
				],
			},
		},
		placeholder: '',
		default: false,
		description: 'If the query and/or body parameter should be set via the value-key pair UI or JSON/RAW',
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
					'files',
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
					'files',
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
		displayName: 'Keys (JSON)',
		name: 'keys',
		type: 'json',
		displayOptions: {
			show: {
				operation: [
					'deleteMultiple',
				],
				resource: [
					'files',
				],
			},
		},
		placeholder: '["b6123925-2fc0-4a30-9d86-863eafc0a6e7", "d17c10aa-0bad-4864-9296-84f522c753e5"]',
		default: null,
		description: 'Array of primary keys of the files you\'d like to update',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
	{
		displayName: 'Update Data (JSON)',
		name: 'data',
		type: 'json',
		displayOptions: {
			show: {
				operation: [
					'updateMultiple',
				],
				resource: [
					'files',
				],
			},
		},
		placeholder: '{\n	"keys": ["b6123925-2fc0-4a30-9d86-863eafc0a6e7", "d17c10aa-0bad-4864-9296-84f522c753e5"],\n	"data": {\n		"tags": ["cities"]\n	}\n}',
		default: null,
		description: 'Required - **`keys`** [Array of primary keys of the files you\'d like to update.] - **`data`** [Any of [the file object](https://docs.directus.io/reference/api/system/files/#the-file-object)\'s properties.]',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
];

