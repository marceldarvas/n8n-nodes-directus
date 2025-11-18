import {
	INodeProperties,
} from 'n8n-workflow';

export const itemsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'items',
				],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new item',
				action: 'Create an items',
			},
			{
				name: 'Create Multiple',
				value: 'createMultiple',
				description: 'Create multiple items',
				action: 'Create multiple an items',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an existing item',
				action: 'Delete an items',
			},
			{
				name: 'Delete Multiple',
				value: 'deleteMultiple',
				description: 'Delete multiple items',
				action: 'Delete multiple an items',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a single item by unique identifier',
				action: 'Get an items',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List the items',
				action: 'List an items',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing item',
				action: 'Update an items',
			},
			{
				name: 'Update Multiple',
				value: 'updateMultiple',
				description: 'Update multiple items',
				action: 'Update multiple an items',
			},
		],
		default: 'list',
	},
];

export const itemsFields: INodeProperties[] = [
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
					'items',
				],
			},
		},
		placeholder: '15',
		default: '',
		description: 'Unique ID of the file object',
		required: true,
	},
	{
		displayName: 'Collection Name or ID',
		name: 'collection',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'get',
				],
				resource: [
					'items',
				],
			},
		},
		placeholder: 'articles',
		default: '',
		description: 'Unique name of the parent collection. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomCollections',
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'items',
				],
				operation: [
					'get',
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
					'get',
				],
				resource: [
					'items',
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
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				operation: [
					'get',
				],
				resource: [
					'items',
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
		displayName: 'Collection Name or ID',
		name: 'collection',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'items',
				],
			},
		},
		placeholder: 'articles',
		default: '',
		description: 'Unique name of the parent collection. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomCollections',
		},
	},
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
					'items',
				],
			},
		},
		placeholder: '{\n	"title": "Hello world!",\n	"body": "This is our first article"\n}',
		default: null,
		description: 'The partial [item object](https://docs.directus.io/reference/api/items/#the-item-object)',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
	{
		displayName: 'Collection Name or ID',
		name: 'collection',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'createMultiple',
				],
				resource: [
					'items',
				],
			},
		},
		placeholder: 'articles',
		default: '',
		description: 'Unique name of the parent collection. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomCollections',
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
					'items',
				],
			},
		},
		placeholder: '[\n	{\n		"title": "Hello world!",\n		"body": "This is our first article"\n	},\n	{\n		"title": "Hello again, world!",\n		"body": "This is our second article"\n	}\n]',
		default: null,
		description: 'An array of partial [item objects](https://docs.directus.io/reference/api/items/#the-item-object)',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
	{
		displayName: 'Collection Name or ID',
		name: 'collection',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'list',
				],
				resource: [
					'items',
				],
			},
		},
		placeholder: 'articles',
		default: '',
		description: 'Unique name of the parent collection. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomCollections',
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'items',
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
					'items',
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
					'items',
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
					'items',
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
					'items',
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
					'items',
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
					'items',
				],
			},
		},
		placeholder: '15',
		default: '',
		description: 'Unique ID of the file object',
		required: true,
	},
	{
		displayName: 'Collection Name or ID',
		name: 'collection',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'update',
				],
				resource: [
					'items',
				],
			},
		},
		placeholder: 'articles',
		default: '',
		description: 'Unique name of the parent collection. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomCollections',
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
					'items',
				],
			},
		},
		placeholder: '{\n	"title": "Hello world!",\n	"body": "This is our first article"\n}',
		default: null,
		description: 'The partial [item object](https://docs.directus.io/reference/api/items/#the-item-object)',
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
					'items',
				],
			},
		},
		placeholder: '{\n	"keys": [1, 2],\n	"data": {\n		"status": "published"\n	}\n}',
		default: null,
		description: 'An array of partial [item objects](https://docs.directus.io/reference/api/items/#the-item-object)',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
	{
		displayName: 'Collection Name or ID',
		name: 'collection',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'updateMultiple',
				],
				resource: [
					'items',
				],
			},
		},
		placeholder: 'articles',
		default: '',
		description: 'Unique name of the parent collection. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomCollections',
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
					'items',
				],
			},
		},
		placeholder: '15',
		default: '',
		description: 'Unique ID of the file object',
		required: true,
	},
	{
		displayName: 'Collection Name or ID',
		name: 'collection',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'delete',
				],
				resource: [
					'items',
				],
			},
		},
		placeholder: 'articles',
		default: '',
		description: 'Unique name of the parent collection. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomCollections',
		},
	},
	{
		displayName: 'Collection Name or ID',
		name: 'collection',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'deleteMultiple',
				],
				resource: [
					'items',
				],
			},
		},
		placeholder: 'articles',
		default: '',
		description: 'Unique name of the parent collection. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomCollections',
		},
	},
	{
		displayName: 'Data (JSON)',
		name: 'data',
		type: 'json',
		displayOptions: {
			show: {
				operation: [
					'deleteMultiple',
				],
				resource: [
					'items',
				],
			},
		},
		placeholder: '[15, 16, 21]',
		default: null,
		description: 'An array of item primary keys',
		required: true,
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
];

