/**
 * User Management Tool for AI Agents
 * Provides user creation and management capabilities
 */

import type { IExecuteFunctions } from 'n8n-workflow';
import { BaseAgentTool } from '../BaseAgentTool';
import type { IParameterSchema } from '../types';
import { directusApiRequest } from '../../GenericFunctions';

/**
 * Tool for creating and managing Directus users
 */
export class UserManagementTool extends BaseAgentTool {
	readonly name = 'directus_create_user';
	readonly description = 'Create a new user in Directus with specified email, password, role, and optional profile information';
	readonly category = 'user_management';

	readonly parameters: Record<string, IParameterSchema> = {
		email: {
			type: 'string',
			description: 'Email address for the new user (must be unique)',
			required: true,
		},
		password: {
			type: 'string',
			description: 'Password for the new user (must meet security requirements)',
			required: true,
		},
		role: {
			type: 'string',
			description: 'Role ID or UUID to assign to the user',
			required: true,
		},
		first_name: {
			type: 'string',
			description: 'First name of the user',
			required: false,
		},
		last_name: {
			type: 'string',
			description: 'Last name of the user',
			required: false,
		},
		status: {
			type: 'string',
			description: 'User status (active, suspended, draft)',
			required: false,
			enum: ['active', 'suspended', 'draft'],
			default: 'active',
		},
		title: {
			type: 'string',
			description: 'Job title or position of the user',
			required: false,
		},
		description: {
			type: 'string',
			description: 'Description or bio for the user',
			required: false,
		},
		tags: {
			type: 'array',
			description: 'Tags to associate with the user',
			required: false,
			items: {
				type: 'string',
				description: 'Tag name',
			},
		},
		language: {
			type: 'string',
			description: 'Preferred language for the user (e.g., en-US, de-DE)',
			required: false,
		},
		theme: {
			type: 'string',
			description: 'UI theme preference (auto, light, dark)',
			required: false,
			enum: ['auto', 'light', 'dark'],
		},
	};

	readonly examples = [
		'Create a user with email "john@example.com", password "SecurePass123", and role "admin"',
		'Create a user john.doe@company.com with role "editor" and first name "John", last name "Doe"',
	];

	private executionContext: IExecuteFunctions;

	constructor(executionContext: IExecuteFunctions) {
		super();
		this.executionContext = executionContext;
	}

	/**
	 * Execute user creation
	 * @param params - User creation parameters
	 * @returns Created user object
	 */
	protected async run(params: Record<string, any>): Promise<any> {
		// Build user data object
		const userData: Record<string, any> = {
			email: params.email,
			password: params.password,
			role: params.role,
			status: params.status || 'active',
		};

		// Add optional fields if provided
		if (params.first_name) {
			userData.first_name = params.first_name;
		}
		if (params.last_name) {
			userData.last_name = params.last_name;
		}
		if (params.title) {
			userData.title = params.title;
		}
		if (params.description) {
			userData.description = params.description;
		}
		if (params.tags && Array.isArray(params.tags)) {
			userData.tags = params.tags;
		}
		if (params.language) {
			userData.language = params.language;
		}
		if (params.theme) {
			userData.theme = params.theme;
		}

		// Create the user via Directus API
		const response = await directusApiRequest.call(
			this.executionContext,
			'POST',
			'users',
			userData,
		);

		// Return the created user data
		const createdUser = response.data || response;

		return {
			id: createdUser.id,
			email: createdUser.email,
			first_name: createdUser.first_name,
			last_name: createdUser.last_name,
			role: createdUser.role,
			status: createdUser.status,
			created_at: createdUser.date_created || new Date().toISOString(),
			full_user_data: createdUser,
		};
	}
}
