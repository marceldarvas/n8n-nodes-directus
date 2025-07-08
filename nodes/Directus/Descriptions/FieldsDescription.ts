import {
	INodeProperties,
} from 'n8n-workflow';

export const fieldsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'fields',
				],
			},
		},
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an existing field',
				action: 'Delete a fields',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieves the details of a single field in a given collection',
				action: 'Get a fields',
			},
			{
				name: 'List',
				value: 'list',
				description: 'Returns a list of the fields available in the given collection',
				action: 'List a fields',
			},
			{
				name: 'List All',
				value: 'listAll',
				description: 'Returns a list of the fields available in the project',
				action: 'List all a fields',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing field',
				action: 'Update a fields',
			},
		],
		default: 'list',
	},
];

export const fieldsFields: INodeProperties[] = [
	{
		displayName: 'Field Name or ID',
		name: 'field',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'get',
				],
				resource: [
					'fields',
				],
			},
		},
		placeholder: '',
		default: '',
		description: 'Unique name of the field. Field name is unique within the collection. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getFieldsInCollection',
		},
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
					'fields',
				],
			},
		},
		placeholder: 'articles',
		default: '',
		description: 'The collection name. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCollections',
		},
	},
	{
		displayName: 'Field Name or ID',
		name: 'field',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'delete',
				],
				resource: [
					'fields',
				],
			},
		},
		placeholder: '',
		default: '',
		description: 'Unique name of the field. Field name is unique within the collection. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getFieldsInCollection',
		},
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
					'fields',
				],
			},
		},
		placeholder: 'articles',
		default: '',
		description: 'The collection name. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCollections',
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
					'listAll',
				],
				resource: [
					'fields',
				],
			},
		},
	},
	{
		displayName: 'Field Name or ID',
		name: 'field',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'update',
				],
				resource: [
					'fields',
				],
			},
		},
		placeholder: 'ID',
		default: '',
		description: 'Unique name of the field. Field name is unique within the collection. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getFieldsInCollection',
		},
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
					'fields',
				],
			},
		},
		placeholder: 'articles',
		default: '',
		description: 'The collection name. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCollections',
		},
	},
	{
		displayName: 'JSON/RAW Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: [
					'update',
				],
				resource: [
					'fields',
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
					'update',
				],
				resource: [
					'fields',
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
					'fields',
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
				displayName: 'Meta (JSON)',
				name: 'meta',
				type: 'json',
				placeholder: '',
				default: null,
				description: 'The meta info',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
			{
				displayName: 'Schema (JSON)',
				name: 'schema',
				type: 'json',
				placeholder: '',
				default: null,
				description: 'The schema info',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				placeholder: 'integer',
				default: 'bigInteger',
				description: 'Directus specific data type. Used to cast values in the API.',
				options: [
					{
						name: 'Big Integer',
						value: 'bigInteger',
						description: 'A larger number without a decimal point',
					},
					{
						name: 'Boolean',
						value: 'boolean',
						description: 'A True or False value',
					},
					{
						name: 'CSV',
						value: 'csv',
						description: 'A comma-separated value, returned as an array of strings',
					},
					{
						name: 'DateTime',
						value: 'dateTime',
						description: 'A date and time saved in the database vendor\'s format',
					},
					{
						name: 'Date',
						value: 'date',
						description: 'A date saved in the database vendor\'s format',
					},
					{
						name: 'Decimal',
						value: 'decimal',
						description: 'A higher precision, exact decimal number often used in finances',
					},
					{
						name: 'Field Group',
						value: 'alias',
					},
					{
						name: 'Float',
						value: 'float',
						description: 'A less exact number with a floating decimal point',
					},
					{
						name: 'Hash',
						value: 'string',
						description: 'A string hashed using argon2 cryptographic hash algorithm',
					},
					{
						name: 'Integer',
						value: 'integer',
						description: 'A number without a decimal point',
					},
					{
						name: 'JSON',
						value: 'json',
						description: 'A value nested in JavaScript Object Notation',
					},
					{
						name: 'M2A',
						value: 'm2a',
						description: 'Many to Any relationship',
					},
					{
						name: 'M2M',
						value: 'm2m',
						description: 'Many to Many relationship',
					},
					{
						name: 'Multiple Files',
						value: 'files',
						description: 'Field for Multiple Files',
					},
					{
						name: 'O2M',
						value: 'o2m',
						description: 'One to Many relationship',
					},
					{
						name: 'Single File',
						value: 'uuid',
						description: 'Field for a Single File',
					},
					{
						name: 'Text',
						value: 'text',
						description: 'A longer set of characters with no real-world max length',
					},
					{
						name: 'Timestamp',
						value: 'timestamp',
						description: 'A date, time, and timezone saved in ISO 8601 format',
					},
					{
						name: 'Time',
						value: 'time',
						description: 'A time saved in the database vendor\'s format',
					},
				],
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
					'list',
				],
				resource: [
					'fields',
				],
			},
		},
		placeholder: 'articles',
		default: '',
		description: 'The collection name. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCollections',
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
					'fields',
				],
			},
		},
	},
];

