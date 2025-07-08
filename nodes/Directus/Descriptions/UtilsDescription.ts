import {
	INodeProperties,
} from 'n8n-workflow';

export const utilsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'utils',
				],
			},
		},
		options: [
			{
				name: 'Clear Cache',
				value: 'clearCache',
				description: 'Clear the Internal Cache',
				action: 'Clear cache an utils',
			},
			{
				name: 'Generate Hash',
				value: 'generateHash',
				description: 'Generate a Hash',
				action: 'Generate hash an utils',
			},
			{
				name: 'Get a Random String',
				value: 'getRandomString',
				description: 'Returns a random string of given length',
				action: 'Get a random string an utils',
			},
			{
				name: 'Import File Data',
				value: 'importFileData',
				description: 'Import Data from File',
				action: 'Import file data an utils',
			},
			{
				name: 'Sort Items',
				value: 'sortItems',
				description: 'Re-sort items in collection based on start and to value of item',
				action: 'Sort items an utils',
			},
			{
				name: 'Verifiy Hash',
				value: 'verfiyHash',
				description: 'Verify a Hash',
				action: 'Verifiy hash an utils',
			},
		],
		default: 'clearCache',
	},
];

export const utilsFields: INodeProperties[] = [
	{
		displayName: 'String',
		name: 'string',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'generateHash',
				],
				resource: [
					'utils',
				],
			},
		},
		placeholder: 'Hello World!',
		default: '',
		description: 'String to hash',
		required: true,
	},
	{
		displayName: 'String',
		name: 'string',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'verfiyHash',
				],
				resource: [
					'utils',
				],
			},
		},
		placeholder: 'Hello World!',
		default: '',
		description: 'Source string',
		required: true,
	},
	{
		displayName: 'Hash',
		name: 'hash',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'verfiyHash',
				],
				resource: [
					'utils',
				],
			},
		},
		placeholder: '$arg...fEfM',
		default: '',
		description: 'Hash you want to verify against',
		required: true,
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'number',
		displayOptions: {
			show: {
				operation: [
					'sortItems',
				],
				resource: [
					'utils',
				],
			},
		},
		placeholder: '51',
		default: null,
		description: 'Primary key of item where to move the current item to',
		required: true,
	},
	{
		displayName: 'Item',
		name: 'item',
		type: 'number',
		displayOptions: {
			show: {
				operation: [
					'sortItems',
				],
				resource: [
					'utils',
				],
			},
		},
		placeholder: '16',
		default: null,
		description: 'Primary key of item to move',
		required: true,
	},
	{
		displayName: 'Collection Name or ID',
		name: 'collection',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'sortItems',
				],
				resource: [
					'utils',
				],
			},
		},
		placeholder: 'author',
		default: '',
		description: 'Collection identifier. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCollections',
		},
	},
	{
		displayName: 'Collection Name or ID',
		name: 'collection',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'importFileData',
				],
				resource: [
					'utils',
				],
			},
		},
		placeholder: 'articles',
		default: '',
		description: 'Unique name of the collection to import the data to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCollections',
		},
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'importFileData',
				],
				resource: [
					'utils',
				],
			},
		},
		placeholder: '',
		default: '\n',
		description: 'Name of the Binary Property the file is in',
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
					'getRandomString',
				],
				resource: [
					'utils',
				],
			},
		},
		options: [
			{
				displayName: 'Length',
				name: 'length',
				type: 'number',
				placeholder: '20',
				default: null,
				description: 'Length of the random string',
				typeOptions: {
					minValue: 1,
				},
			},
		],
	},
];

