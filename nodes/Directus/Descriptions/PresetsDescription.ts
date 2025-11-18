import {
	INodeProperties,
} from 'n8n-workflow';

export const presetsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'presets',
				],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new preset',
				action: 'Create a presets',
			},
			{
				name: 'Create Multiple',
				value: 'createMultiple',
				description: 'Create Multiple Presets',
				action: 'Create multiple a presets',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an existing preset',
				action: 'Delete a presets',
			},
			{
				name: 'Delete Multiple',
				value: 'deleteMultiple',
				description: 'Delete Multiple Presets',
				action: 'Delete multiple a presets',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a single preset by unique identifier',
				action: 'Get a presets',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List the presets',
				action: 'List a presets',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing preset',
				action: 'Update a presets',
			},
			{
				name: 'Update Multiple',
				value: 'updateMultiple',
				description: 'Update Multiple Presets',
				action: 'Update multiple a presets',
			},
		],
		default: 'list',
	},
];

export const presetsFields: INodeProperties[] = [
	{
		displayName: 'Data (JSON)',
		name: 'data',
		type: 'json',
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'presets',
				],
			},
		},
		placeholder: '{\n	"user": "410b5772-e63f-4ae6-9ea2-39c3a31bd6ca",\n	"layout": "cards",\n	"search": "Directus"\n}',
		default: null,
		description: 'A partial [preset object](https://docs.directus.io/reference/api/system/presets/#the-preset-object)',
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
					'createMultiple',
				],
				resource: [
					'presets',
				],
			},
		},
		placeholder: '[\n	{\n		"collection": "directus_files",\n		"user": "410b5772-e63f-4ae6-9ea2-39c3a31bd6ca",\n		"layout": "cards",\n		"search": "Directus"\n	},\n	{\n		"collection": "articles",\n		"user": "410b5772-e63f-4ae6-9ea2-39c3a31bd6ca",\n		"layout": "tabular"\n	}\n]',
		default: null,
		description: 'An array of partial [preset objects](https://docs.directus.io/reference/api/system/presets/#the-preset-object)',
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
					'presets',
				],
			},
		},
		placeholder: '39',
		default: '',
		description: 'Primary key of the preset',
		required: true,
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
					'presets',
				],
			},
		},
		placeholder: '39',
		default: '',
		description: 'Primary key of the preset',
		required: true,
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
					'presets',
				],
			},
		},
		placeholder: '{\n	"keys": [15, 64],\n	"data": {\n		"layout": "tabular"\n	}\n}',
		default: null,
		description: 'Required: - keys [Array of primary keys of the presets you\'d like to update.] - data [Any of [the preset object](https://docs.directus.io/reference/api/system/presets/#the-preset-object)\'s properties.]',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'presets',
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
					'presets',
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
		description: 'Whether outputs each element of an array as own item',
		required: true,
		displayOptions: {
			show: {
				operation: [
					'list',
				],
				resource: [
					'presets',
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
					'presets',
				],
			},
		},
		placeholder: '',
		default: false,
		description: 'Whether if the query and/or body parameter should be set via the value-key pair UI or JSON/RAW',
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
					'presets',
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
					'presets',
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
					'presets',
				],
			},
		},
		placeholder: '[15, 251, 810]',
		default: null,
		description: 'An array of preset primary keys',
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
					'update',
				],
				resource: [
					'presets',
				],
			},
		},
		placeholder: '{\n	"layout": "tabular"\n}',
		default: null,
		description: 'A partial [preset object](https://docs.directus.io/reference/api/system/presets/#the-preset-object)',
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
					'presets',
				],
			},
		},
		placeholder: '39',
		default: '',
		description: 'Primary key of the preset',
		required: true,
	},
];

