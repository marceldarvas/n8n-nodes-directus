# Development Guide

## Setup

### Clone and Install

```bash
git clone https://github.com/marceldarvas/n8n-nodes-directus.git
cd n8n-nodes-directus
npm install
```

This automatically sets up Git hooks via Husky.

## Git Hooks

This project uses pre-commit hooks to maintain code quality:

### 1. pre-commit Hook

Runs lint-staged on files being committed:

- Automatically fixes ESLint issues
- Formats code with Prettier
- Type-checks TypeScript (for staged files)

### 2. commit-msg Hook

Validates commit message format:

- Enforces Conventional Commits format
- See examples below

### 3. pre-push Hook

Runs tests before push:

- Ensures all tests pass before push
- Prevents broken code from reaching remote
- Runs with CI configuration (coverage enabled)

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **test**: Adding or updating tests
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **style**: Code style changes (formatting, etc.)
- **build**: Build system changes
- **ci**: CI/CD changes
- **chore**: Other changes (dependencies, etc.)
- **revert**: Revert previous commit

### Scopes (Optional)

- users
- flows
- presets
- roles
- permissions
- agent
- auth
- deps
- docs
- test
- ci

### Examples

```bash
git commit -m "feat(flows): add flow trigger operation"
git commit -m "fix(users): handle role lookup errors"
git commit -m "docs: update README"
git commit -m "test(flows): add integration tests"
git commit -m "chore(deps): update dependencies"
```

## Skipping Hooks (Emergency Only)

If you absolutely must skip hooks:

```bash
# Skip pre-commit hook
git commit --no-verify -m "message"

# Skip pre-push hook
git push --no-verify
```

**⚠️ Warning**: Only use in emergencies. CI will still catch issues.

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-feature
```

### 2. Make Changes

```bash
# Edit files
# Pre-commit hook will run on staged files
git add .
git commit -m "feat: add new feature"
```

### 3. Run Tests Locally

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### 4. Build and Lint

```bash
# Build the project
npm run build

# Lint code
npm run lint

# Check formatting
npm run format:check
```

### 5. Push Changes

```bash
# Pre-push hook will run tests before pushing
git push origin feature/my-feature
```

### 6. Create Pull Request

- Create PR on GitHub
- CI will run automatically
- Wait for all checks to pass
- Request code review

## Troubleshooting

### Hook not running

```bash
# Reinstall hooks
npx husky install
```

### Lint-staged fails

```bash
# Run manually to see errors
npx lint-staged
```

### Commit message validation fails

```bash
# Check your commit message format
# Use conventional commits format
# Example: feat: add new feature
```

### Tests fail on pre-push

```bash
# Run tests locally to debug
npm test

# Fix failing tests
# Try push again
```

### Hooks too slow

If hooks are taking too long, you can temporarily disable them:

```bash
# Disable Husky temporarily
export HUSKY=0

# Make commits
git commit -m "message"

# Re-enable Husky
unset HUSKY
```

## Code Quality Standards

### TypeScript

- Use strict TypeScript
- Avoid `any` types
- Document complex types
- Use interfaces for public APIs

### ESLint

- Follow n8n-nodes-base rules
- Fix all linting errors before commit
- Use `// eslint-disable-next-line` sparingly

### Prettier

- Code is automatically formatted on commit
- No manual formatting needed
- Configuration in `.prettierrc`

### Testing

- Write tests for all new features
- Maintain >80% code coverage
- Use descriptive test names
- Mock external dependencies

## Continuous Integration

### GitHub Actions

The project uses GitHub Actions for CI/CD:

- **CI Workflow**: Runs on push and PR
  - Linting and formatting checks
  - Build verification
  - Unit tests (Node 18, 20, 22)
  - Type checking

- **Security Workflow**: Runs on push to main and weekly
  - npm audit
  - Snyk security scan
  - CodeQL analysis
  - Secret scanning (Gitleaks)

- **Publish Workflow**: Runs on release
  - Builds package
  - Publishes to npm
  - Creates GitHub deployment

### Status Checks

All PRs must pass:

- ✅ Lint and format checks
- ✅ Build successful
- ✅ All tests passing
- ✅ Type check passing
- ✅ No security vulnerabilities

## Additional Resources

- [Contributing Guide](CONTRIBUTING.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [API Reference](API_REFERENCE.md)
- [Migration Guide](MIGRATION.md)

## Getting Help

- Check existing issues on GitHub
- Create a new issue if needed
- Join community discussions
- Review documentation

## License

MIT License - See [LICENSE](../LICENSE) file for details
