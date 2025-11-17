import { INodeProperties } from 'n8n-workflow';

export const flowOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['flow'],
			},
		},
		options: [
			{
				name: 'Trigger',
				value: 'trigger',
				description: 'Trigger a flow via webhook',
				action: 'Trigger a flow',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a flow by ID',
				action: 'Get a flow',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all flows',
				action: 'List flows',
			},
		],
		default: 'trigger',
	},
];

export const flowFields: INodeProperties[] = [
	// Trigger operation fields
	{
		displayName: 'Flow ID',
		name: 'flowId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['trigger', 'get'],
			},
		},
		default: '',
		placeholder: 'e.g., 8cbb43fe-4cdf-4991-8352-c461779cad5f',
		description: 'The ID of the flow',
	},
	{
		displayName: 'Payload',
		name: 'payload',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['trigger'],
			},
		},
		default: '{}',
		description: 'JSON payload to pass to the flow',
	},
	{
		displayName: 'Execution Mode',
		name: 'executionMode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['trigger'],
			},
		},
		options: [
			{
				name: 'Async',
				value: 'async',
				description: 'Trigger flow and return immediately',
			},
			{
				name: 'Sync',
				value: 'sync',
				description: 'Wait for flow to complete before returning',
			},
		],
		default: 'async',
		description: 'How to execute the flow',
	},
	{
		displayName: 'Max Wait Time (seconds)',
		name: 'maxWaitTime',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['trigger'],
				executionMode: ['sync'],
			},
		},
		default: 60,
		description: 'Maximum time to wait for flow completion in sync mode',
	},
	{
		displayName: 'Query Parameters',
		name: 'queryParameters',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['trigger'],
			},
		},
		default: {},
		placeholder: 'Add Query Parameter',
		options: [
			{
				name: 'parameter',
				displayName: 'Parameter',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Parameter name',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Parameter value',
					},
				],
			},
		],
		description: 'Query parameters to pass to the flow webhook',
	},
	// List operation fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['list'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['list'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'json',
				default: '{}',
				description: 'Filter query in JSON format',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'string',
				default: '',
				description: 'Sort by field (prefix with - for descending)',
				placeholder: 'e.g., -date_created',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description: 'Comma-separated list of fields to return',
				placeholder: 'e.g., id,name,status',
			},
		],
	},
];
