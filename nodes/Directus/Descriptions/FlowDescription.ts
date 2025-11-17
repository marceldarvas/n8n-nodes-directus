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
				name: 'Chain Flows',
				value: 'chainFlows',
				description: 'Trigger multiple flows in sequence with data passing',
				action: 'Chain flows',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new flow with webhook trigger configuration',
				action: 'Create a flow',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a flow',
				action: 'Delete a flow',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a flow by ID',
				action: 'Get a flow',
			},
			{
				name: 'Get Execution',
				value: 'getExecution',
				description: 'Get details of a flow execution by ID',
				action: 'Get execution details',
			},
			{
				name: 'Get Execution Logs',
				value: 'getExecutionLogs',
				description: 'Get detailed logs for a flow execution',
				action: 'Get execution logs',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all flows',
				action: 'List flows',
			},
			{
				name: 'List Executions',
				value: 'listExecutions',
				description: 'List flow executions with filters',
				action: 'List executions',
			},
			{
				name: 'Loop Flows',
				value: 'loopFlows',
				description: 'Loop through data array and trigger flow for each item',
				action: 'Loop flows',
			},
			{
				name: 'Trigger',
				value: 'trigger',
				description: 'Trigger a flow via webhook',
				action: 'Trigger a flow',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing flow',
				action: 'Update a flow',
			},
		],
		default: 'trigger',
	},
];

export const flowFields: INodeProperties[] = [
	// ----------------------------------
	//         Create operation fields
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., My Webhook Flow',
		description: 'The name of the flow',
	},
	{
		displayName: 'Trigger Type',
		name: 'triggerType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Webhook',
				value: 'webhook',
				description: 'Trigger flow via webhook',
			},
			{
				name: 'Event',
				value: 'event',
				description: 'Trigger flow on database event',
			},
			{
				name: 'Schedule',
				value: 'schedule',
				description: 'Trigger flow on a schedule',
			},
			{
				name: 'Manual',
				value: 'manual',
				description: 'Trigger flow manually',
			},
		],
		default: 'webhook',
		description: 'The type of trigger for the flow',
	},
	{
		displayName: 'Webhook Method',
		name: 'webhookMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['create'],
				triggerType: ['webhook'],
			},
		},
		options: [
			{
				name: 'GET',
				value: 'GET',
			},
			{
				name: 'POST',
				value: 'POST',
			},
			{
				name: 'PUT',
				value: 'PUT',
			},
			{
				name: 'DELETE',
				value: 'DELETE',
			},
		],
		default: 'POST',
		description: 'HTTP method for the webhook',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Active',
				value: 'active',
				description: 'Flow is active and can be triggered',
			},
			{
				name: 'Inactive',
				value: 'inactive',
				description: 'Flow is inactive and cannot be triggered',
			},
		],
		default: 'active',
		description: 'The status of the flow',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the flow',
			},
			{
				displayName: 'Icon',
				name: 'icon',
				type: 'string',
				default: '',
				placeholder: 'e.g., bolt',
				description: 'Icon for the flow',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '',
				placeholder: 'e.g., #6644FF',
				description: 'Color for the flow',
			},
			{
				displayName: 'Operations (JSON)',
				name: 'operations',
				type: 'json',
				default: '[]',
				description: 'Array of operations to execute in the flow',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
			{
				displayName: 'Options (JSON)',
				name: 'options',
				type: 'json',
				default: '{}',
				description: 'Additional options for the flow trigger',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
		],
	},
	// ----------------------------------
	//         Update operation fields
	// ----------------------------------
	{
		displayName: 'Flow ID',
		name: 'flowId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['update'],
			},
		},
		default: '',
		placeholder: 'e.g., 8cbb43fe-4cdf-4991-8352-c461779cad5f',
		description: 'The ID of the flow to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The name of the flow',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the flow',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'Active',
						value: 'active',
					},
					{
						name: 'Inactive',
						value: 'inactive',
					},
				],
				default: 'active',
				description: 'The status of the flow',
			},
			{
				displayName: 'Icon',
				name: 'icon',
				type: 'string',
				default: '',
				description: 'Icon for the flow',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '',
				description: 'Color for the flow',
			},
			{
				displayName: 'Operations (JSON)',
				name: 'operations',
				type: 'json',
				default: '[]',
				description: 'Array of operations to execute in the flow',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
			{
				displayName: 'Options (JSON)',
				name: 'options',
				type: 'json',
				default: '{}',
				description: 'Additional options for the flow trigger',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
		],
	},
	// ----------------------------------
	//         Delete operation fields
	// ----------------------------------
	{
		displayName: 'Flow ID',
		name: 'flowId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['delete'],
			},
		},
		default: '',
		placeholder: 'e.g., 8cbb43fe-4cdf-4991-8352-c461779cad5f',
		description: 'The ID of the flow to delete',
	},
	// ----------------------------------
	//         Get/Trigger operation fields
	// ----------------------------------
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
		displayName: 'Max Wait Time (Seconds)',
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
	// ----------------------------------
	//         Get Execution operation fields
	// ----------------------------------
	{
		displayName: 'Execution ID',
		name: 'executionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['getExecution'],
			},
		},
		default: '',
		placeholder: 'e.g., 8cbb43fe-4cdf-4991-8352-c461779cad5f',
		description: 'The ID of the execution to retrieve',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['getExecution'],
			},
		},
		options: [
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description: 'Comma-separated list of fields to return',
				placeholder: 'e.g., ID,action,timestamp,user',
			},
		],
	},
	// ----------------------------------
	//         List Executions operation fields
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['listExecutions'],
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
				operation: ['listExecutions'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['listExecutions'],
			},
		},
		options: [
			{
				displayName: 'Flow ID',
				name: 'flowId',
				type: 'string',
				default: '',
				placeholder: 'e.g., 8cbb43fe-4cdf-4991-8352-c461779cad5f',
				description: 'Filter executions by flow ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'All',
						value: 'all',
					},
					{
						name: 'Success',
						value: 'success',
					},
					{
						name: 'Failed',
						value: 'failed',
					},
					{
						name: 'Running',
						value: 'running',
					},
				],
				default: 'all',
				description: 'Filter executions by status',
			},
			{
				displayName: 'Date From',
				name: 'dateFrom',
				type: 'dateTime',
				default: '',
				description: 'Filter executions from this date onwards',
			},
			{
				displayName: 'Date To',
				name: 'dateTo',
				type: 'dateTime',
				default: '',
				description: 'Filter executions up to this date',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'Filter executions by user ID',
			},
		],
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
				operation: ['listExecutions'],
			},
		},
		options: [
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'string',
				default: '-timestamp',
				description: 'Sort by field (prefix with - for descending)',
				placeholder: 'e.g., -timestamp',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description: 'Comma-separated list of fields to return',
				placeholder: 'e.g., ID,action,timestamp,user',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'Page number for pagination (starts at 1)',
				typeOptions: {
					minValue: 1,
				},
			},
		],
	},
	// ----------------------------------
	//         Get Execution Logs operation fields
	// ----------------------------------
	{
		displayName: 'Execution ID',
		name: 'executionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['getExecutionLogs'],
			},
		},
		default: '',
		placeholder: 'e.g., 8cbb43fe-4cdf-4991-8352-c461779cad5f',
		description: 'The ID of the execution to retrieve logs for',
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
				operation: ['getExecutionLogs'],
			},
		},
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				description: 'Max number of results to return',
				typeOptions: {
					minValue: 1,
				},
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				default: '',
				description: 'Comma-separated list of fields to return',
				placeholder: 'e.g., ID,action,timestamp,comment,revisions',
			},
		],
	},
	// ----------------------------------
	//         Chain Flows operation fields
	// ----------------------------------
	{
		displayName: 'Flow Chain (JSON)',
		name: 'flowChain',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['chainFlows'],
			},
		},
		default: '[\n  {\n    "flowId": "flow-id-1",\n    "passDataStrategy": "all"\n  },\n  {\n    "flowId": "flow-id-2",\n    "passDataStrategy": "result"\n  }\n]',
		description: 'Array of flows to chain with their data passing strategy (all/result/custom)',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
	{
		displayName: 'Initial Payload',
		name: 'initialPayload',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['chainFlows'],
			},
		},
		default: '{}',
		description: 'Initial payload to pass to the first flow',
	},
	{
		displayName: 'Execution Mode',
		name: 'executionMode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['chainFlows'],
			},
		},
		options: [
			{
				name: 'Sequential',
				value: 'sequential',
				description: 'Execute flows one after another',
			},
			{
				name: 'Parallel',
				value: 'parallel',
				description: 'Execute all flows in parallel',
			},
		],
		default: 'sequential',
		description: 'How to execute the flow chain',
	},
	{
		displayName: 'Error Handling',
		name: 'errorHandling',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['chainFlows'],
			},
		},
		options: [
			{
				name: 'Stop on Error',
				value: 'stop',
				description: 'Stop execution when a flow fails',
			},
			{
				name: 'Continue on Error',
				value: 'continue',
				description: 'Continue executing remaining flows if one fails',
			},
		],
		default: 'stop',
		description: 'How to handle errors during flow chain execution',
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
				operation: ['chainFlows'],
			},
		},
		options: [
			{
				displayName: 'Delay Between Flows (Ms)',
				name: 'delayBetweenFlows',
				type: 'number',
				default: 0,
				description: 'Delay in milliseconds between flow executions',
				typeOptions: {
					minValue: 0,
				},
			},
			{
				displayName: 'Max Wait Time (Seconds)',
				name: 'maxWaitTime',
				type: 'number',
				default: 60,
				description: 'Maximum time to wait for each flow completion in sync mode',
				typeOptions: {
					minValue: 1,
				},
			},
			{
				displayName: 'Collect Results',
				name: 'collectResults',
				type: 'boolean',
				default: true,
				description: 'Whether to collect and return results from all flows',
			},
		],
	},
	// ----------------------------------
	//         Loop Flows operation fields
	// ----------------------------------
	{
		displayName: 'Flow ID',
		name: 'flowId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['loopFlows'],
			},
		},
		default: '',
		placeholder: 'e.g., 8cbb43fe-4cdf-4991-8352-c461779cad5f',
		description: 'The ID of the flow to trigger for each data item',
	},
	{
		displayName: 'Data Array (JSON)',
		name: 'dataArray',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['loopFlows'],
			},
		},
		default: '[\n  {"item": 1},\n  {"item": 2},\n  {"item": 3}\n]',
		description: 'Array of data items to loop through',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},
	{
		displayName: 'Execution Mode',
		name: 'executionMode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['flow'],
				operation: ['loopFlows'],
			},
		},
		options: [
			{
				name: 'Sequential',
				value: 'sequential',
				description: 'Execute flows one after another',
			},
			{
				name: 'Parallel',
				value: 'parallel',
				description: 'Execute all flows in parallel',
			},
		],
		default: 'sequential',
		description: 'How to execute the flow loop',
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
				operation: ['loopFlows'],
			},
		},
		options: [
			{
				displayName: 'Concurrency Limit',
				name: 'concurrencyLimit',
				type: 'number',
				default: 5,
				description: 'Maximum number of concurrent flow executions (for parallel mode)',
				typeOptions: {
					minValue: 1,
					maxValue: 50,
				},
			},
			{
				displayName: 'Delay Between Iterations (Ms)',
				name: 'delayBetweenIterations',
				type: 'number',
				default: 0,
				description: 'Delay in milliseconds between flow executions',
				typeOptions: {
					minValue: 0,
				},
			},
			{
				displayName: 'Max Wait Time (Seconds)',
				name: 'maxWaitTime',
				type: 'number',
				default: 60,
				description: 'Maximum time to wait for each flow completion',
				typeOptions: {
					minValue: 1,
				},
			},
			{
				displayName: 'Collect Results',
				name: 'collectResults',
				type: 'boolean',
				default: true,
				description: 'Whether to collect and return results from all iterations',
			},
			{
				displayName: 'Stop on Error',
				name: 'stopOnError',
				type: 'boolean',
				default: true,
				description: 'Whether to stop execution when a flow fails',
			},
		],
	},
];
