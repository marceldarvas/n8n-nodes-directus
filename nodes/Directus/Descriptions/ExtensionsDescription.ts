import {
	INodeProperties,
} from 'n8n-workflow';

export const extensionsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'extensions',
				],
			},
		},
		options: [
			{
				name: 'List',
				value: 'list',
				description: 'List the available extensions in the project. The types of extensions that you can list are interfaces, displays, layouts, modules.',
				action: 'List an extensions',
			},
		],
		default: 'list',
	},
];

export const extensionsFields: INodeProperties[] = [
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		displayOptions: {
			show: {
				operation: [
					'list',
				],
				resource: [
					'extensions',
				],
			},
		},
		placeholder: 'Select an option',
		default: 'displays',
		required: true,
		options: [
			{
				name: 'Displays',
				value: 'displays',
			},
			{
				name: 'Interfaces',
				value: 'interfaces',
			},
			{
				name: 'Layouts',
				value: 'layouts',
			},
			{
				name: 'Modules',
				value: 'modules',
			},
		],
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
					'extensions',
				],
			},
		},
	},
];

