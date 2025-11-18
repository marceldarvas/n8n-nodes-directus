# Contributing to n8n-nodes-directus

Thank you for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](../CODE_OF_CONDUCT.md).

**In short**: Be respectful, inclusive, and professional.

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git
- n8n instance (for testing)
- Directus instance (for testing)

### Ways to Contribute

- 🐛 **Bug Reports**: Report issues you encounter
- 💡 **Feature Requests**: Suggest new capabilities
- 📝 **Documentation**: Improve docs and examples
- 🧪 **Tests**: Add or improve test coverage
- 💻 **Code**: Fix bugs or implement features
- 🎨 **Examples**: Share workflow examples

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/n8n-nodes-directus.git
cd n8n-nodes-directus
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Link for Local Development

```bash
# Build the package
npm run build

# Link to your n8n instance
cd ~/.n8n/custom
npm link /path/to/n8n-nodes-directus
```

### 4. Start Development Mode

```bash
# Watch for changes and rebuild
npm run dev
```

### 5. Restart n8n

```bash
# Restart n8n to load the development version
n8n start
```

---

## Project Structure

```
n8n-nodes-directus/
├── nodes/
│   └── Directus/
│       ├── Directus.node.ts           # Main node implementation
│       ├── GenericFunctions.ts        # Shared helper functions
│       ├── descriptions/              # Operation descriptions
│       │   ├── UserDescription.ts
│       │   ├── FlowDescription.ts
│       │   └── ...
│       └── operations/                # Operation implementations
│           ├── UserOperations.ts
│           ├── FlowOperations.ts
│           └── ...
├── credentials/
│   ├── DirectusApi.credentials.ts     # Static token auth
│   └── DirectusOAuth2Api.credentials.ts
├── test/
│   ├── integration/                   # Integration tests
│   ├── fixtures/                      # Test data
│   └── setup.ts                       # Test configuration
├── docs/                              # Documentation
├── examples/                          # Example workflows
└── package.json
```

---

## Development Workflow

### Creating a New Feature

1. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement the Feature**:
   - Add operation description in `descriptions/`
   - Implement operation in `operations/`
   - Update main node file if needed

3. **Add Tests**:
   - Add integration tests in `test/integration/`
   - Ensure tests pass

4. **Document**:
   - Update relevant documentation
   - Add examples if applicable

5. **Commit**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Fixing a Bug

1. **Create a Branch**:
   ```bash
   git checkout -b fix/bug-description
   ```

2. **Write a Failing Test**:
   - Reproduce the bug in a test
   - Verify test fails

3. **Fix the Bug**:
   - Implement the fix
   - Verify test now passes

4. **Document**:
   - Update troubleshooting guide if applicable
   - Add to changelog

5. **Commit**:
   ```bash
   git commit -m "fix: description of bug fix"
   ```

---

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Provide type annotations for all public APIs
- Avoid `any` type when possible

### Code Style

```typescript
// Use clear, descriptive names
function createDirectusUser(params: UserParams): Promise<User> {
	// Implementation
}

// Prefer async/await over .then()
async function fetchData() {
	const result = await client.request(readItems('collection'));
	return result;
}

// Use destructuring
const { email, password, role } = userParams;

// Handle errors appropriately
try {
	await createUser(params);
} catch (error) {
	throw new NodeOperationError(
		this.getNode(),
		`Failed to create user: ${error.message}`
	);
}
```

### Naming Conventions

- **Files**: PascalCase for components (`UserDescription.ts`)
- **Variables**: camelCase (`userName`, `userId`)
- **Constants**: UPPER_SNAKE_CASE (`API_VERSION`)
- **Interfaces**: PascalCase with descriptive names (`IUserParams`)

### Comments

```typescript
/**
 * Creates a new user in Directus with role lookup
 * @param email User's email address
 * @param role Role name or UUID
 * @returns Created user object with ID
 */
async function createUser(email: string, role: string): Promise<User> {
	// Lookup role if name provided instead of UUID
	const roleId = await lookupRole(role);

	// Create user with validated role
	return await client.request(createItem('directus_users', {
		email,
		role: roleId,
	}));
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Run specific test suite
npm run test:integration -- user-management

# Run with coverage
npm run test:coverage
```

### Writing Tests

```typescript
describe('User Operations', () => {
	it('should create user with role name', async () => {
		// Arrange
		const userParams = {
			email: 'test@example.com',
			password: 'SecurePass123!',
			role: 'Editor',
		};

		// Act
		const result = await createUser(userParams);

		// Assert
		expect(result).toHaveProperty('id');
		expect(result.email).toBe(userParams.email);
		expect(result.role).toBe(expectedRoleId);
	});
});
```

### Test Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Aim for >80% code coverage
- Tests should be independent and idempotent

---

## Documentation

### Documentation Standards

- Write clear, concise explanations
- Include code examples
- Use proper markdown formatting
- Keep TOC updated

### Documentation Types

1. **API Reference**: Document all operations
2. **Examples**: Provide working examples
3. **Guides**: Step-by-step tutorials
4. **Troubleshooting**: Common issues and solutions

### Updating Documentation

When adding features:
1. Update `README.md` (if major feature)
2. Update `API_REFERENCE.md`
3. Add examples to `examples/`
4. Update migration guide if breaking changes

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project standards
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] Branch is up to date with main

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions/changes
- `refactor`: Code refactoring
- `chore`: Build/tooling changes

**Examples**:
```
feat(flows): add flow trigger operation

Implement flow trigger with sync/async modes and payload support.

Closes #123
```

```
fix(users): handle role name lookup errors

Add proper error handling when role name is not found.

Fixes #456
```

### Submitting PR

1. **Push Your Branch**:
   ```bash
   git push origin your-branch-name
   ```

2. **Create Pull Request** on GitHub

3. **Fill Out Template**:
   - Clear description of changes
   - Link related issues
   - List breaking changes (if any)
   - Describe testing performed

4. **Respond to Feedback**:
   - Address reviewer comments
   - Make requested changes
   - Keep discussion professional

### PR Review Criteria

- Code quality and style
- Test coverage
- Documentation completeness
- Backward compatibility
- Performance impact

---

## Release Process

### Version Numbers

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Published to npm
- [ ] GitHub release created

---

## Development Tips

### Hot Reload

```bash
# Terminal 1: Watch for changes
npm run dev

# Terminal 2: Restart n8n when build completes
# (Manual restart required for now)
```

### Debugging

1. **Use Console Logs**:
   ```typescript
   console.log('Debug:', data);
   ```

2. **Check n8n Logs**:
   ```bash
   # View n8n console output
   ```

3. **Test Directus API Directly**:
   ```bash
   curl -X POST \
     -H "Authorization: Bearer TOKEN" \
     https://your-directus.com/users
   ```

### Common Tasks

```bash
# Build project
npm run build

# Format code
npm run format

# Lint code
npm run lint

# Fix lint issues
npm run lint -- --fix
```

---

## Getting Help

- **Documentation**: Check the docs/ folder
- **Discussions**: GitHub Discussions
- **Issues**: GitHub Issues
- **Discord**: n8n Community Discord

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🎉
