# Task 030: CI/CD Pipeline Setup with GitHub Actions

## Priority: MEDIUM
**Effort**: 2-3 hours
**Developer**: Backend/DevOps specialist
**Phase**: 9 - Infrastructure & Automation

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- All core functionality implemented (Tasks 001-017)
- Tests created (Tasks 024, 027-029)

## Description

Set up a comprehensive CI/CD pipeline using GitHub Actions to automate testing, linting, building, and publishing of the n8n-nodes-directus package. This ensures code quality and streamlines the release process.

## Context

**Current State:**
- ❌ No GitHub Actions workflows exist
- ❌ No automated testing on push/PR
- ❌ No automated linting checks
- ❌ No automated build verification
- ❌ No automated npm publishing
- ❌ Manual release process prone to errors

**Impact:**
- Code can be merged without running tests
- Breaking changes can slip through
- Inconsistent code style
- Manual publishing is error-prone
- No automated dependency security scanning

## Problem Scenarios

### Scenario 1: Broken Code Merged
```bash
# Developer pushes code without running tests
git push origin main

# Code is broken, but no CI catches it
# Users install broken package from npm
```

### Scenario 2: Security Vulnerability
```bash
# Dependency has critical security issue
# No automated scanning to detect it
# Vulnerability ships to production
```

### Scenario 3: Manual Release Errors
```bash
# Developer forgets to build before publishing
npm publish  # publishes outdated dist/

# OR forgets to bump version
# OR forgets to update CHANGELOG
```

## Implementation Steps

### 1. Main CI Workflow (1 hour)

**File**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Job 1: Lint and Format Check
  lint:
    name: Lint & Format Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npm run format -- --check

  # Job 2: Build
  build:
    name: Build Package
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Verify dist/ folder exists
        run: |
          if [ ! -d "dist" ]; then
            echo "Error: dist/ folder not created"
            exit 1
          fi

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-dist
          path: dist/
          retention-days: 7

  # Job 3: Unit Tests
  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: node-${{ matrix.node-version }}
          fail_ci_if_error: false

  # Job 4: Integration Tests (if Docker available)
  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    if: false  # Enable when Task 028 is complete
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Start Directus instance
        run: docker-compose -f test/docker-compose.yml up -d

      - name: Wait for Directus to be ready
        run: |
          timeout 60 bash -c 'until curl -f http://localhost:8055/server/ping; do sleep 2; done'

      - name: Load test fixtures
        run: npm run test:fixtures:load

      - name: Run integration tests
        run: npm run test:integration

      - name: Cleanup
        if: always()
        run: docker-compose -f test/docker-compose.yml down

  # Job 5: Type Check
  typecheck:
    name: TypeScript Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run TypeScript compiler check
        run: npx tsc --noEmit
```

### 2. Security Scanning Workflow (0.5 hours)

**File**: `.github/workflows/security.yml`

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    # Run weekly on Monday at 9am UTC
    - cron: '0 9 * * 1'

jobs:
  # Job 1: Dependency Vulnerability Scan
  dependency-scan:
    name: Dependency Vulnerability Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  # Job 2: CodeQL Analysis
  codeql:
    name: CodeQL Security Analysis
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read
    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript,typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3

  # Job 3: Secret Scanning
  secret-scan:
    name: Secret Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 3. Release and Publish Workflow (0.5 hours)

**File**: `.github/workflows/publish.yml`

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    name: Publish Package
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write  # Required for npm provenance
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Build package
        run: npm run build

      - name: Verify package contents
        run: npm pack --dry-run

      - name: Publish to npm
        run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub deployment
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

### 4. Dependency Update Automation (0.5 hours)

**File**: `.github/workflows/dependency-updates.yml`

```yaml
name: Dependency Updates

on:
  schedule:
    # Run weekly on Monday at 8am UTC
    - cron: '0 8 * * 1'
  workflow_dispatch:  # Allow manual trigger

jobs:
  update-dependencies:
    name: Update Dependencies
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Update dependencies
        run: |
          npm update
          npm outdated || true

      - name: Run tests
        run: npm test

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v6
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: update dependencies'
          title: 'chore: Weekly dependency updates'
          body: |
            Automated dependency updates.

            Please review the changes and ensure all tests pass.
          branch: dependency-updates
          labels: dependencies,automated
```

### 5. Dependabot Configuration (0.5 hours)

**File**: `.github/dependabot.yml`

```yaml
version: 2
updates:
  # npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "08:00"
    open-pull-requests-limit: 10
    reviewers:
      - "arladmin"
    assignees:
      - "arladmin"
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore"
      include: "scope"
    # Group updates
    groups:
      # Group all n8n packages together
      n8n-packages:
        patterns:
          - "n8n-*"
      # Group dev dependencies
      dev-dependencies:
        dependency-type: "development"
      # Group typescript ecosystem
      typescript:
        patterns:
          - "typescript"
          - "@types/*"
          - "ts-*"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
    labels:
      - "ci/cd"
      - "automated"
```

## NPM Scripts Updates

Add to `package.json`:

```json
{
  "scripts": {
    "format:check": "prettier nodes credentials --check",
    "lint:check": "eslint nodes credentials --ext .ts",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "prepublishOnly": "npm run build && npm run lint:check && npm test"
  }
}
```

## Expected Outcomes

- ✅ **Automated testing** on every push and PR
- ✅ **Code quality checks** prevent broken code from merging
- ✅ **Security scanning** catches vulnerabilities early
- ✅ **Automated releases** reduce human error
- ✅ **Dependency updates** keep package secure and up-to-date
- ✅ **Multi-node version testing** ensures compatibility
- ✅ **Build verification** catches build issues before publish

## Files Created

- New: `.github/workflows/ci.yml`
- New: `.github/workflows/security.yml`
- New: `.github/workflows/publish.yml`
- New: `.github/workflows/dependency-updates.yml`
- New: `.github/dependabot.yml`
- Modified: `package.json` (add scripts)

## Repository Secrets Required

Configure these secrets in GitHub repository settings:

1. **NPM_TOKEN**: npm authentication token for publishing
2. **SNYK_TOKEN**: Snyk API token for security scanning (optional)
3. **CODECOV_TOKEN**: Codecov token for coverage reporting (optional)

## Success Criteria

- [ ] All workflow files created and committed
- [ ] CI runs successfully on push/PR
- [ ] Security scanning configured
- [ ] Dependabot configured
- [ ] Repository secrets configured
- [ ] Test publish workflow (dry-run)
- [ ] Documentation updated with CI badge
- [ ] Git commit: "ci: setup GitHub Actions workflows and automation"

## CI Status Badges

Add to `README.md`:

```markdown
[![CI](https://github.com/arladmin/n8n-nodes-directus/workflows/CI/badge.svg)](https://github.com/arladmin/n8n-nodes-directus/actions/workflows/ci.yml)
[![Security](https://github.com/arladmin/n8n-nodes-directus/workflows/Security%20Scan/badge.svg)](https://github.com/arladmin/n8n-nodes-directus/actions/workflows/security.yml)
[![codecov](https://codecov.io/gh/arladmin/n8n-nodes-directus/branch/main/graph/badge.svg)](https://codecov.io/gh/arladmin/n8n-nodes-directus)
```

## Benefits

1. **Quality Gate**: Prevents broken code from being merged
2. **Security**: Automated vulnerability scanning
3. **Confidence**: Multi-version testing ensures compatibility
4. **Speed**: Automated releases reduce time to publish
5. **Maintenance**: Automated dependency updates
6. **Visibility**: CI badges show project health

## Future Enhancements

- Add performance regression testing
- Add visual regression testing for UI components
- Add automatic changelog generation
- Add semantic release automation
- Add release notes generation

---

**Priority**: MEDIUM (foundational infrastructure)
**Dependencies**: None (can be done independently)
**Estimated Effort**: 2-3 hours
