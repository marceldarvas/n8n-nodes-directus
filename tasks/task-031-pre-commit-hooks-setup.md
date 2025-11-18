# Task 031: Pre-commit Hooks Setup with Husky and lint-staged

## Priority: MEDIUM
**Effort**: 1-2 hours
**Developer**: Backend/DevOps specialist
**Phase**: 9 - Infrastructure & Automation

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- ESLint and Prettier configured (already done)
- Tests implemented (Task 027)

## Description

Set up pre-commit hooks using Husky and lint-staged to automatically run linting, formatting, and tests before commits. This ensures code quality at the developer's machine before code reaches CI/CD.

## Context

**Current State:**
- ❌ No pre-commit hooks configured
- ❌ Developers can commit without linting
- ❌ Developers can commit without tests
- ❌ Inconsistent code formatting can reach repository
- ❌ No automatic fix of common issues

**Impact:**
- Inconsistent code style in repository
- CI failures after commit (wasted time)
- Broken code can be committed
- Manual enforcement of code quality
- Time wasted on trivial formatting fixes in code review

## Problem Scenarios

### Scenario 1: Formatting Issues in PR
```bash
# Developer commits without formatting
git commit -m "Add feature"

# PR shows 50 files changed due to formatting
# Reviewer has to ask for formatting fixes
# Developer wastes time fixing formatting
```

### Scenario 2: Broken Tests Committed
```bash
# Developer forgets to run tests
git commit -m "Fix bug"
git push

# CI fails 5 minutes later
# Developer has to fix and push again
# Team members may pull broken code
```

### Scenario 3: ESLint Errors Committed
```bash
# Developer commits code with lint errors
git commit -m "Update function"

# CI catches errors
# Developer fixes, commits again
# Pollutes git history with fix commits
```

## Implementation Steps

### 1. Install Dependencies (0.25 hours)

```bash
npm install --save-dev husky lint-staged @commitlint/cli @commitlint/config-conventional
```

**Packages:**
- **husky**: Git hooks manager
- **lint-staged**: Run commands on staged files only
- **@commitlint/cli**: Validate commit messages
- **@commitlint/config-conventional**: Conventional commit rules

### 2. Configure Husky (0.25 hours)

**Initialize Husky:**

```bash
npx husky init
```

This creates `.husky/` directory with Git hooks.

**File**: `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged
```

**File**: `.husky/commit-msg`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Validate commit message format
npx --no -- commitlint --edit "$1"
```

**File**: `.husky/pre-push`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run tests before push
npm run test:ci
```

Make hooks executable:
```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

### 3. Configure lint-staged (0.25 hours)

**File**: `.lintstagedrc.js`

```javascript
module.exports = {
  // TypeScript files in nodes and credentials
  '{nodes,credentials}/**/*.ts': [
    // 1. Fix ESLint issues automatically
    'eslint --fix',
    // 2. Format with Prettier
    'prettier --write',
    // 3. Run TypeScript compiler check
    () => 'tsc --noEmit',
  ],

  // JSON files (package.json, tsconfig.json, etc.)
  '*.json': [
    'prettier --write',
  ],

  // Markdown files
  '*.md': [
    'prettier --write',
  ],

  // YAML files
  '*.{yml,yaml}': [
    'prettier --write',
  ],

  // Test files - run related tests
  'test/**/*.ts': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests',
  ],
};
```

**Alternative simple configuration** (if above is too strict):

**File**: `.lintstagedrc.json`

```json
{
  "*.ts": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

### 4. Configure Commitlint (0.25 hours)

**File**: `.commitlintrc.js`

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enum - allowed commit types
    'type-enum': [
      2,
      'always',
      [
        'feat',      // New feature
        'fix',       // Bug fix
        'docs',      // Documentation changes
        'style',     // Code style changes (formatting, etc.)
        'refactor',  // Code refactoring
        'perf',      // Performance improvements
        'test',      // Adding or updating tests
        'build',     // Build system changes
        'ci',        // CI/CD changes
        'chore',     // Other changes (dependencies, etc.)
        'revert',    // Revert previous commit
      ],
    ],

    // Scope enum - optional scopes
    'scope-enum': [
      1,
      'always',
      [
        'users',
        'flows',
        'presets',
        'roles',
        'permissions',
        'agent',
        'auth',
        'deps',
        'docs',
        'test',
        'ci',
      ],
    ],

    // Subject case - should be lowercase
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],

    // Subject should not be empty
    'subject-empty': [2, 'never'],

    // Type should not be empty
    'type-empty': [2, 'never'],

    // Max header length
    'header-max-length': [2, 'always', 100],
  },
};
```

**Commit Message Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**
```
feat(flows): add flow trigger operation
fix(users): handle role lookup errors
docs(api): update API reference
test(flows): add integration tests
chore(deps): update dependencies
```

### 5. Update package.json Scripts (0.25 hours)

Add/update scripts in `package.json`:

```json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint nodes credentials --ext .ts --fix",
    "lint:check": "eslint nodes credentials --ext .ts",
    "format": "prettier nodes credentials --write",
    "format:check": "prettier nodes credentials --check",
    "test:ci": "jest --ci --coverage --maxWorkers=2 --bail",
    "test:staged": "jest --bail --findRelatedTests"
  }
}
```

### 6. Create Setup Documentation (0.25 hours)

**File**: `docs/DEVELOPMENT.md`

```markdown
# Development Guide

## Setup

### Clone and Install

\`\`\`bash
git clone https://github.com/arladmin/n8n-nodes-directus.git
cd n8n-nodes-directus
npm install
\`\`\`

This automatically sets up Git hooks via Husky.

### Git Hooks

This project uses pre-commit hooks to maintain code quality:

1. **pre-commit**: Runs lint-staged
   - Automatically fixes ESLint issues
   - Formats code with Prettier
   - Type-checks TypeScript

2. **commit-msg**: Validates commit message format
   - Enforces Conventional Commits format
   - See examples below

3. **pre-push**: Runs tests
   - Ensures tests pass before push
   - Prevents broken code from reaching remote

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

\`\`\`
<type>(<scope>): <subject>
\`\`\`

**Types:**
- feat: New feature
- fix: Bug fix
- docs: Documentation
- test: Tests
- refactor: Code refactoring
- chore: Maintenance

**Examples:**
\`\`\`bash
git commit -m "feat(flows): add flow trigger operation"
git commit -m "fix(users): handle role lookup errors"
git commit -m "docs: update README"
\`\`\`

### Skipping Hooks (Emergency Only)

If you absolutely must skip hooks:

\`\`\`bash
# Skip pre-commit hook
git commit --no-verify -m "message"

# Skip pre-push hook
git push --no-verify
\`\`\`

**⚠️ Warning**: Only use in emergencies. CI will still catch issues.

### Troubleshooting

**Hook not running:**
\`\`\`bash
# Reinstall hooks
npx husky install
\`\`\`

**Lint-staged fails:**
\`\`\`bash
# Run manually to see errors
npx lint-staged
\`\`\`

**Commit message validation fails:**
\`\`\`bash
# Check your commit message format
# Use conventional commits format
\`\`\`
\`\`\`

### 7. Add .husky to .gitignore Exceptions (0.25 hours)

Update `.gitignore`:

```gitignore
# .gitignore

# ... existing entries ...

# Include Husky hooks
!.husky/_/
!.husky/pre-commit
!.husky/commit-msg
!.husky/pre-push
```

## Configuration Options

### Strict Mode (Recommended for Mature Projects)

Enables all checks including tests in pre-commit:

**`.lintstagedrc.js`:**
```javascript
module.exports = {
  '{nodes,credentials}/**/*.ts': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --noEmit',
    'jest --bail --findRelatedTests',  // Run related tests
  ],
};
```

### Lenient Mode (Good for Rapid Development)

Only format and lint, skip tests in pre-commit:

**`.lintstagedrc.json`:**
```json
{
  "*.ts": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml}": ["prettier --write"]
}
```

Tests still run in pre-push hook.

## Expected Outcomes

- ✅ **Consistent code style** automatically enforced
- ✅ **Fewer CI failures** (caught locally first)
- ✅ **Faster code reviews** (no formatting nitpicks)
- ✅ **Better commit messages** (conventional commits)
- ✅ **Cleaner git history** (validated commits)
- ✅ **Catch errors early** (before push)
- ✅ **Developer productivity** (auto-fix issues)

## Files Created/Modified

- New: `.husky/pre-commit`
- New: `.husky/commit-msg`
- New: `.husky/pre-push`
- New: `.lintstagedrc.js`
- New: `.commitlintrc.js`
- New: `docs/DEVELOPMENT.md`
- Modified: `package.json` (scripts and devDependencies)
- Modified: `.gitignore` (husky exceptions)

## Testing the Setup

### Test Pre-commit Hook

```bash
# Make a change to a file
echo "// test" >> nodes/Directus/Directus.node.ts

# Try to commit
git add nodes/Directus/Directus.node.ts
git commit -m "test"

# Should see:
# - ESLint running
# - Prettier running
# - TypeScript checking
```

### Test Commit Message Validation

```bash
# Try invalid commit message
git commit -m "update stuff"
# Should fail

# Try valid commit message
git commit -m "feat: add new feature"
# Should succeed
```

### Test Pre-push Hook

```bash
# Try to push
git push
# Should run all tests first
```

## Success Criteria

- [ ] Husky installed and configured
- [ ] lint-staged configured
- [ ] commitlint configured
- [ ] All hooks tested and working
- [ ] Documentation created (DEVELOPMENT.md)
- [ ] Team onboarded (how to skip hooks if needed)
- [ ] Verified hooks work on fresh clone
- [ ] Git commit: "chore: setup pre-commit hooks with Husky"

## Benefits

1. **Quality at Source**: Catch issues before commit
2. **Faster Feedback**: No waiting for CI
3. **Consistent Style**: Automatic formatting
4. **Better History**: Validated commit messages
5. **Reduced CI Load**: Fewer failed builds
6. **Developer Experience**: Auto-fix common issues

## Troubleshooting

### Hooks Not Running

```bash
# Reinstall Husky
rm -rf .husky
npx husky init
chmod +x .husky/*
```

### Lint-staged Too Slow

```bash
# Reduce scope in .lintstagedrc.js
# Remove TypeScript checking or tests
module.exports = {
  '*.ts': ['eslint --fix', 'prettier --write'],
  // Remove tsc and jest
};
```

### Want to Temporarily Disable

```bash
# Set env variable
export HUSKY=0

# Or use --no-verify
git commit --no-verify -m "message"
```

---

**Priority**: MEDIUM (improves developer experience)
**Dependencies**: Task 027 (tests should exist first)
**Estimated Effort**: 1-2 hours
