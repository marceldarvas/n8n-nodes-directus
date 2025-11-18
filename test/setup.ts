/**
 * Integration Test Setup
 *
 * This file configures the test environment for integration testing
 * the n8n-nodes-directus package.
 *
 * Prerequisites:
 * - Directus instance running (see README for setup)
 * - Test database with sample data loaded
 * - Environment variables configured
 */

import * as dotenv from 'dotenv';

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

// Test configuration
export const TEST_CONFIG = {
	// Directus instance configuration
	directusUrl: process.env.TEST_DIRECTUS_URL || 'http://localhost:8055',
	directusToken: process.env.TEST_DIRECTUS_TOKEN || '',
	directusEmail: process.env.TEST_DIRECTUS_EMAIL || 'admin@example.com',
	directusPassword: process.env.TEST_DIRECTUS_PASSWORD || 'password',

	// Test data IDs (populated from fixtures)
	testFlowId: process.env.TEST_FLOW_ID || 'flow-test',
	testUserId: process.env.TEST_USER_ID || '',
	testRoleId: process.env.TEST_ROLE_ID || 'role-editor',
	testPresetId: process.env.TEST_PRESET_ID || '',

	// Test timeouts
	defaultTimeout: 30000,
	longTimeout: 60000,

	// Retry configuration
	maxRetries: 3,
	retryDelay: 1000,
};

/**
 * Check if test environment is ready
 */
export async function checkTestEnvironment(): Promise<boolean> {
	if (!TEST_CONFIG.directusUrl || !TEST_CONFIG.directusToken) {
		console.error('❌ Test environment not configured!');
		console.error('Please set TEST_DIRECTUS_URL and TEST_DIRECTUS_TOKEN in .env.test');
		return false;
	}

	try {
		// Test connection to Directus
		const response = await fetch(`${TEST_CONFIG.directusUrl}/server/info`);
		if (!response.ok) {
			console.error('❌ Cannot connect to Directus instance');
			return false;
		}

		console.log('✓ Directus instance accessible');
		return true;
	} catch (error) {
		console.error('❌ Error connecting to Directus:', error.message);
		return false;
	}
}

/**
 * Setup function to run before all tests
 */
export async function setupTests(): Promise<void> {
	console.log('Setting up integration tests...');

	const isReady = await checkTestEnvironment();
	if (!isReady) {
		throw new Error('Test environment is not ready');
	}

	console.log('✓ Test environment ready');
}

/**
 * Teardown function to run after all tests
 */
export async function teardownTests(): Promise<void> {
	console.log('Cleaning up test environment...');
	// Add cleanup logic here if needed
	console.log('✓ Cleanup complete');
}

/**
 * Helper to create n8n execution context for testing
 */
export function createMockExecutionContext(nodeParameters: any = {}): any {
	return {
		getNodeParameter: (name: string) => nodeParameters[name],
		getCredentials: async () => ({
			url: TEST_CONFIG.directusUrl,
			staticToken: TEST_CONFIG.directusToken,
		}),
		helpers: {
			httpRequestWithAuthentication: async () => ({}),
		},
	};
}

/**
 * Wait helper for async operations
 */
export function wait(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry helper for flaky tests
 */
export async function retry<T>(
	fn: () => Promise<T>,
	maxRetries = TEST_CONFIG.maxRetries,
	delay = TEST_CONFIG.retryDelay,
): Promise<T> {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			if (attempt === maxRetries) {
				throw error;
			}
			console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
			await wait(delay);
		}
	}
	throw new Error('Retry failed');
}
