# Task 035: Automated API Documentation Generation

## Priority: LOW
**Effort**: 2-3 hours
**Developer**: Backend/Technical Writer
**Phase**: 9 - Infrastructure & Automation

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- API Reference documentation exists (Task 026)
- TypeScript with proper JSDoc comments

## Description

Implement automated API documentation generation from TypeScript source code using TSDoc/TypeDoc. This ensures documentation stays in sync with code and provides interactive API explorer for developers.

## Context

**Current State:**
- ✅ Manual API reference documentation exists
- ❌ Documentation must be manually updated
- ❌ No auto-generated TypeScript API docs
- ❌ No interactive API explorer
- ❌ Documentation can drift from code
- ❌ JSDoc comments inconsistent

**Impact:**
- Documentation becomes outdated
- Manual synchronization required
- Developer experience degraded
- API changes not reflected in docs
- Internal API usage unclear

## Problem Scenarios

### Scenario 1: Documentation Drift
```typescript
// Code changed
export function createUser(params: CreateUserParams): Promise<User> {
    // Now requires 'status' field
}

// But docs/API_REFERENCE.md still shows old signature
// Developers confused by outdated docs
```

### Scenario 2: Missing Internal Docs
```typescript
// Complex helper function
export async function lookupRoleByName(name: string): Promise<string> {
    // ... 50 lines of logic
}

// No documentation for other developers
// How does caching work? What errors can it throw?
```

### Scenario 3: No Type Information
```typescript
// User wants to extend the node
// No generated types documentation
// Must read source code to understand interfaces
```

## Implementation Options

### Option A: TypeDoc (Recommended)

**Pros:**
- Official TypeScript tool
- Clean output
- Markdown plugin available
- Theme customization

**Cons:**
- Basic features
- Limited customization

### Option B: API Extractor + API Documenter

**Pros:**
- Microsoft-backed
- Advanced features
- API reports
- Breaking change detection

**Cons:**
- More complex setup
- Steeper learning curve

**Recommendation**: Use **TypeDoc** for simplicity and good results.

## Implementation Steps

### 1. Install Dependencies (0.25 hours)

```bash
npm install --save-dev typedoc typedoc-plugin-markdown
```

### 2. Configure TypeDoc (0.5 hours)

**File**: `typedoc.json`

```json
{
  "$schema": "https://typedoc.org/schema.json",

  "entryPoints": [
    "nodes/Directus/Directus.node.ts",
    "nodes/Directus/GenericFunctions.ts",
    "credentials/DirectusApi.credentials.ts",
    "credentials/DirectusOAuth2Api.credentials.ts"
  ],

  "out": "docs/api",

  "plugin": ["typedoc-plugin-markdown"],

  "readme": "none",

  "name": "n8n-nodes-directus API",

  "includeVersion": true,

  "excludePrivate": true,
  "excludeProtected": false,
  "excludeInternal": true,

  "categorizeByGroup": true,
  "categoryOrder": [
    "Node",
    "Credentials",
    "Operations",
    "Helpers",
    "*"
  ],

  "sort": ["source-order"],

  "kindSortOrder": [
    "Class",
    "Interface",
    "TypeAlias",
    "Function",
    "Variable"
  ],

  "navigation": {
    "includeCategories": true,
    "includeGroups": true
  },

  "searchInComments": true,
  "searchInDocuments": true
}
```

### 3. Add JSDoc Comments (1 hour)

**Update existing files with proper JSDoc**:

**Example**: `nodes/Directus/GenericFunctions.ts`

```typescript
/**
 * Make an authenticated API request to Directus
 *
 * @param this - n8n execution context
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param endpoint - API endpoint (e.g., '/users', '/items/articles')
 * @param body - Request body for POST/PUT requests
 * @returns Response data from Directus API
 *
 * @throws {NodeOperationError} When authentication fails
 * @throws {NodeOperationError} When API returns error
 *
 * @example
 * ```typescript
 * const users = await directusApiRequest.call(
 *   this,
 *   'GET',
 *   '/users',
 * );
 * ```
 *
 * @group Helpers
 * @category API
 */
export async function directusApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: string,
  endpoint: string,
  body?: any,
): Promise<any> {
  // ... implementation
}

/**
 * Lookup Directus role UUID by role name
 *
 * This function provides user-friendly role name resolution, allowing
 * workflows to use "Editor" instead of UUID. Results are cached for
 * performance.
 *
 * @param this - n8n execution context
 * @param roleNameOrId - Role name (e.g., "Editor") or UUID
 * @returns Role UUID
 *
 * @throws {NodeOperationError} When role is not found
 * @throws {NodeOperationError} When API request fails
 *
 * @example
 * ```typescript
 * // By name
 * const roleId = await lookupRoleByName.call(this, 'Editor');
 * // Returns: '00000000-0000-0000-0000-000000000000'
 *
 * // By UUID (pass-through)
 * const roleId = await lookupRoleByName.call(this, 'uuid-here');
 * // Returns: 'uuid-here'
 * ```
 *
 * @remarks
 * - Role names are cached for the duration of the workflow execution
 * - Case-sensitive matching
 * - If UUID provided, returns immediately without API call
 *
 * @see {@link directusApiRequest} for API call implementation
 *
 * @group Helpers
 * @category Roles
 */
export async function lookupRoleByName(
  this: IExecuteFunctions,
  roleNameOrId: string,
): Promise<string> {
  // ... implementation
}

/**
 * Parameters for creating a Directus user
 *
 * @group Interfaces
 * @category Users
 */
export interface ICreateUserParams {
  /** User's email address (must be unique) */
  email: string;

  /** User's password (min 8 characters) */
  password: string;

  /** Role UUID or role name */
  role: string;

  /** User's first name (optional) */
  first_name?: string;

  /** User's last name (optional) */
  last_name?: string;

  /** User status (active, suspended, invited) */
  status?: 'active' | 'suspended' | 'invited';

  /** Custom user metadata */
  [key: string]: any;
}
```

### 4. Add NPM Scripts (0.25 hours)

Add to `package.json`:

```json
{
  "scripts": {
    "docs:generate": "typedoc",
    "docs:serve": "npx http-server docs/api -p 8080 -o",
    "docs:watch": "typedoc --watch"
  }
}
```

### 5. Create Documentation Index (0.5 hours)

**File**: `docs/api/README.md` (manually created)

```markdown
# API Documentation

Auto-generated API documentation for n8n-nodes-directus.

## Overview

This documentation is automatically generated from TypeScript source code
using TypeDoc. It provides complete API reference for:

- **Node Implementation**: Main Directus node
- **Credentials**: Authentication setup
- **Operations**: All supported operations
- **Helpers**: Utility functions
- **Types**: TypeScript interfaces and types

## Quick Links

- [Directus Node](./classes/Directus.md)
- [Generic Functions](./modules/GenericFunctions.md)
- [DirectusApi Credentials](./classes/DirectusApi.md)
- [OAuth2 Credentials](./classes/DirectusOAuth2Api.md)

## Usage

### For Users

If you're using the node in n8n workflows, see the
[User Guide](../README.md) instead.

### For Contributors

This API documentation is for developers who want to:
- Contribute to the codebase
- Extend functionality
- Understand internal implementation
- Debug issues

## Regenerating Documentation

Documentation is automatically regenerated on each release.

To manually regenerate:

\`\`\`bash
npm run docs:generate
\`\`\`

To view locally:

\`\`\`bash
npm run docs:serve
\`\`\`

## Documentation Standards

All public APIs should include:

1. **Description**: What the function/class does
2. **Parameters**: With types and descriptions
3. **Returns**: Return type and description
4. **Throws**: Possible errors
5. **Example**: Code example
6. **Remarks**: Additional notes (optional)
7. **See Also**: Related functions (optional)

### Example

\`\`\`typescript
/**
 * Brief description
 *
 * Detailed description with more context.
 *
 * @param paramName - Parameter description
 * @returns What is returned
 * @throws {ErrorType} When error occurs
 * @example
 * \`\`\`typescript
 * const result = functionName(param);
 * \`\`\`
 */
export function functionName(paramName: string): ReturnType {
  // ...
}
\`\`\`

## Versioning

This documentation is versioned alongside the package:

- **Current Version**: 2.0.0
- **Last Updated**: Auto-generated on release

Previous versions available in git history.
```

### 6. Add to CI/CD (0.25 hours)

**Update `.github/workflows/ci.yml`**:

```yaml
# Add to CI workflow
- name: Generate API Documentation
  run: npm run docs:generate

- name: Upload API docs
  uses: actions/upload-artifact@v4
  with:
    name: api-docs
    path: docs/api/
```

**Update `.github/workflows/publish.yml`**:

```yaml
# Add before npm publish
- name: Generate API Documentation
  run: npm run docs:generate

- name: Commit documentation
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add docs/api
    git commit -m "docs: update API documentation" || true
    git push || true
```

### 7. GitHub Pages Setup (Optional) (0.5 hours)

**File**: `.github/workflows/docs.yml`

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  deploy-docs:
    name: Deploy API Documentation
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pages: write
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Generate docs
        run: npm run docs:generate

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/api
```

Enable GitHub Pages in repository settings → Pages → Source: gh-pages branch.

Documentation will be available at:
`https://arladmin.github.io/n8n-nodes-directus/`

## Documentation Template

**File**: `.github/CONTRIBUTING_DOCS.md`

```markdown
# Documentation Contribution Guide

## JSDoc Standards

All public functions, classes, and interfaces must include JSDoc comments.

### Required Tags

- `@param` - For each parameter
- `@returns` - What the function returns
- `@throws` - Possible errors
- `@example` - At least one code example

### Optional Tags

- `@remarks` - Additional notes
- `@see` - Related functions
- `@deprecated` - If deprecated
- `@internal` - If internal (won't appear in docs)
- `@group` - Group functions together
- `@category` - Sub-category

### Example

\`\`\`typescript
/**
 * Create a new user in Directus with role lookup
 *
 * This function creates a user and handles automatic role name
 * resolution. If a role name is provided instead of UUID, it will
 * be looked up automatically.
 *
 * @param this - n8n execution context
 * @param params - User creation parameters
 * @returns Created user with ID and role UUID
 *
 * @throws {NodeOperationError} When role is not found
 * @throws {NodeOperationError} When email already exists
 * @throws {NodeOperationError} When API request fails
 *
 * @example
 * Basic usage:
 * \`\`\`typescript
 * const user = await createUser.call(this, {
 *   email: 'user@example.com',
 *   password: 'SecurePass123!',
 *   role: 'Editor',
 * });
 * \`\`\`
 *
 * @example
 * With UUID:
 * \`\`\`typescript
 * const user = await createUser.call(this, {
 *   email: 'user@example.com',
 *   password: 'SecurePass123!',
 *   role: '00000000-0000-0000-0000-000000000000',
 * });
 * \`\`\`
 *
 * @remarks
 * - Email must be unique
 * - Password must meet Directus requirements
 * - Role can be name or UUID
 *
 * @see {@link lookupRoleByName} for role lookup implementation
 *
 * @group Operations
 * @category Users
 */
export async function createUser(
  this: IExecuteFunctions,
  params: ICreateUserParams,
): Promise<IUser> {
  // ...
}
\`\`\`
\`\`\`

## Expected Outcomes

- ✅ **Auto-generated docs** from source code
- ✅ **Always up-to-date** documentation
- ✅ **Interactive API explorer** for developers
- ✅ **Type information** fully documented
- ✅ **Code examples** in documentation
- ✅ **Searchable** API reference
- ✅ **Versioned** with releases

## Files Created/Modified

- New: `typedoc.json`
- New: `docs/api/README.md`
- New: `.github/workflows/docs.yml` (optional)
- New: `.github/CONTRIBUTING_DOCS.md`
- Modified: `package.json` (scripts)
- Modified: `.github/workflows/ci.yml` (generate docs)
- Modified: `.github/workflows/publish.yml` (commit docs)
- Modified: All `.ts` files (add/improve JSDoc)

## Testing the Setup

```bash
# Generate documentation
npm run docs:generate

# Verify output
ls -la docs/api/

# Serve locally
npm run docs:serve
# Open http://localhost:8080
```

## Success Criteria

- [ ] TypeDoc installed and configured
- [ ] All public APIs have JSDoc comments
- [ ] Documentation generates without errors
- [ ] Examples included for key functions
- [ ] Served locally successfully
- [ ] Integrated into CI/CD
- [ ] GitHub Pages deployed (optional)
- [ ] Git commit: "docs: setup automated API documentation generation"

## Benefits

1. **Accuracy**: Docs always match code
2. **Automation**: No manual synchronization
3. **Developer Experience**: Interactive API explorer
4. **Discoverability**: Searchable documentation
5. **Versioning**: Docs track code versions
6. **Consistency**: Standard format across all APIs

## Documentation Quality Checklist

For each public function:

- [ ] Has summary description
- [ ] All parameters documented
- [ ] Return value documented
- [ ] Possible errors documented
- [ ] At least one example provided
- [ ] Related functions linked (if any)

## Future Enhancements

- Add interactive playground
- Add API usage examples from real workflows
- Add video tutorials embedded in docs
- Add search with Algolia
- Add versioned documentation (multiple versions)

---

**Priority**: LOW (improves contributor experience)
**Dependencies**: None (can be done independently)
**Estimated Effort**: 2-3 hours
