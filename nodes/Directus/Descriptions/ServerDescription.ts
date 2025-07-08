import {
	INodeProperties,
} from 'n8n-workflow';

export const serverOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'server',
				],
			},
		},
		options: [
			{
				name: 'Get GraphQL',
				value: 'getGraphQL',
				description: 'Retrieve the GraphQL SDL for the current project',
				action: 'Get graph ql a server',
			},
			{
				name: 'Get OpenAPI',
				value: 'getOpenAPI',
				description: 'Retrieve the OpenAPI spec for the current project',
				action: 'Get open api a server',
			},
			{
				name: 'Ping Server',
				value: 'pingServer',
				description: 'Ping... pong! 🏓.',
				action: 'Ping server a server',
			},
			{
				name: 'Server Health',
				value: 'serverHealth',
				description: 'Get the current health status of the server',
				action: 'Server health a server',
			},
			{
				name: 'System Info',
				value: 'systemInfo',
				description: 'Information about the current installation',
				action: 'System info a server',
			},
		],
		default: 'getGraphQL',
	},
];

export const serverFields = [] as INodeProperties[];

