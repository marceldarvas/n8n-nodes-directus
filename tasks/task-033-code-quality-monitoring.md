# Task 033: Code Quality Monitoring and Metrics

## Priority: LOW
**Effort**: 2-3 hours
**Developer**: Backend/DevOps specialist
**Phase**: 9 - Infrastructure & Automation

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- CI/CD pipeline setup (Task 030)
- Tests implemented (Task 027)

## Description

Set up code quality monitoring tools including code coverage tracking, technical debt analysis, code complexity metrics, and quality gates. This provides visibility into code health and prevents quality regression.

## Context

**Current State:**
- ❌ No code coverage tracking
- ❌ No code quality metrics
- ❌ No technical debt monitoring
- ❌ No complexity analysis
- ❌ No quality gates
- ❌ No code smell detection

**Impact:**
- Unknown test coverage
- Technical debt accumulates silently
- No visibility into code quality trends
- Complex code goes unnoticed
- No enforcement of quality standards

## Problem Scenarios

### Scenario 1: Coverage Regression
```typescript
// New feature added without tests
export function newFeature() {
    // ... 100 lines of untested code
}

// Coverage drops from 80% to 60%
// No one notices until much later
```

### Scenario 2: Increasing Complexity
```typescript
// Function becomes overly complex over time
function processUser(user) {
    if (user.type === 'admin') {
        if (user.active) {
            if (user.permissions.includes('write')) {
                // ... 50 nested conditions
            }
        }
    }
}
// Cyclomatic complexity = 25 (very high!)
// No alerts, becomes unmaintainable
```

### Scenario 3: Code Duplication
```typescript
// Same logic duplicated 5 times across codebase
// 30% code duplication
// Maintenance nightmare when fixing bugs
```

## Implementation Steps

### 1. Code Coverage with Codecov (0.5 hours)

**Sign up**: https://codecov.io

**File**: `codecov.yml`

```yaml
# Codecov configuration
coverage:
  status:
    project:
      default:
        target: 80%  # Require 80% coverage
        threshold: 2%  # Allow 2% drop

    patch:
      default:
        target: 80%  # New code must be 80% covered
        threshold: 0%  # No coverage drop allowed

  precision: 2
  round: down

comment:
  layout: "header, diff, files"
  behavior: default
  require_changes: false

ignore:
  - "test/**/*"
  - "dist/**/*"
  - "**/*.test.ts"
  - "**/*.spec.ts"
```

**Update CI workflow** (`.github/workflows/ci.yml`):

```yaml
# ... existing steps ...

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
    flags: unittests
    fail_ci_if_error: true
```

**Add badge to README.md**:

```markdown
[![codecov](https://codecov.io/gh/arladmin/n8n-nodes-directus/branch/main/graph/badge.svg)](https://codecov.io/gh/arladmin/n8n-nodes-directus)
```

### 2. SonarCloud Integration (0.5 hours)

**Sign up**: https://sonarcloud.io

**File**: `sonar-project.properties`

```properties
# SonarCloud configuration
sonar.projectKey=arladmin_n8n-nodes-directus
sonar.organization=arladmin

# Source code
sonar.sources=nodes,credentials
sonar.tests=test

# Exclusions
sonar.exclusions=dist/**/*,node_modules/**/*

# Coverage
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# Code smell thresholds
sonar.issue.ignore.multicriteria=e1,e2

# Ignore TODO comments
sonar.issue.ignore.multicriteria.e1.ruleKey=typescript:S1135
sonar.issue.ignore.multicriteria.e1.resourceKey=**/*.ts

# TypeScript specific
sonar.typescript.node=18
```

**Add to CI workflow**:

```yaml
# .github/workflows/ci.yml

- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

**Add badge to README.md**:

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=arladmin_n8n-nodes-directus&metric=alert_status)](https://sonarcloud.io/dashboard?id=arladmin_n8n-nodes-directus)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=arladmin_n8n-nodes-directus&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=arladmin_n8n-nodes-directus)
```

### 3. Code Climate (Alternative to SonarCloud) (0.5 hours)

**Sign up**: https://codeclimate.com

**File**: `.codeclimate.yml`

```yaml
version: "2"

plugins:
  duplication:
    enabled: true
    config:
      languages:
        - javascript
        - typescript

  eslint:
    enabled: true
    channel: eslint-8

  fixme:
    enabled: true
    config:
      strings:
        - FIXME
        - TODO
        - HACK
        - XXX

checks:
  argument-count:
    enabled: true
    config:
      threshold: 4

  complex-logic:
    enabled: true
    config:
      threshold: 4

  file-lines:
    enabled: true
    config:
      threshold: 250

  method-complexity:
    enabled: true
    config:
      threshold: 10

  method-count:
    enabled: true
    config:
      threshold: 20

  method-lines:
    enabled: true
    config:
      threshold: 50

  nested-control-flow:
    enabled: true
    config:
      threshold: 4

  return-statements:
    enabled: true
    config:
      threshold: 4

  similar-code:
    enabled: true
    config:
      threshold: 50

  identical-code:
    enabled: true
    config:
      threshold: 25

exclude_patterns:
  - "test/"
  - "dist/"
  - "node_modules/"
  - "**/*.test.ts"
  - "**/*.spec.ts"
```

### 4. TypeScript Strict Mode and Quality Checks (0.5 hours)

**Update `tsconfig.json`**:

```json
{
  "compilerOptions": {
    // Strict type checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // ... rest of config
  }
}
```

### 5. Bundle Size Monitoring (0.5 hours)

**Install bundlephobia CLI**:

```bash
npm install --save-dev bundlewatch
```

**File**: `.bundlewatchrc.json`

```json
{
  "files": [
    {
      "path": "dist/**/*.js",
      "maxSize": "500kb",
      "compression": "gzip"
    }
  ],
  "ci": {
    "trackBranches": ["main"]
  }
}
```

**Add to package.json**:

```json
{
  "scripts": {
    "bundlewatch": "bundlewatch --config .bundlewatchrc.json"
  }
}
```

**Add to CI**:

```yaml
# .github/workflows/ci.yml

- name: Check bundle size
  run: npm run bundlewatch
  env:
    BUNDLEWATCH_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 6. Code Metrics Dashboard (Optional) (0.5 hours)

**File**: `scripts/code-metrics.js`

```javascript
#!/usr/bin/env node

/**
 * Generate code metrics report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getCodeMetrics() {
  console.log('📊 Generating Code Metrics...\n');

  // Lines of Code
  const loc = execSync('find nodes credentials -name "*.ts" | xargs wc -l | tail -1')
    .toString()
    .trim()
    .split(/\s+/)[0];

  // Number of files
  const fileCount = execSync('find nodes credentials -name "*.ts" | wc -l')
    .toString()
    .trim();

  // Test coverage
  let coverage = 'Unknown';
  try {
    const coverageSummary = JSON.parse(
      fs.readFileSync('./coverage/coverage-summary.json', 'utf8')
    );
    coverage = `${coverageSummary.total.lines.pct}%`;
  } catch (e) {
    // Coverage not available
  }

  // Dependencies
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const depCount = Object.keys(packageJson.dependencies || {}).length;
  const devDepCount = Object.keys(packageJson.devDependencies || {}).length;

  // ESLint issues
  let eslintIssues = 0;
  try {
    execSync('npm run lint:check', { stdio: 'pipe' });
  } catch (e) {
    const output = e.stdout?.toString() || '';
    const match = output.match(/(\d+) problems?/);
    if (match) eslintIssues = parseInt(match[1], 10);
  }

  // Generate report
  const report = `
# Code Metrics Report

Generated: ${new Date().toISOString()}

## Code Statistics

- **Lines of Code**: ${loc}
- **Files**: ${fileCount}
- **Test Coverage**: ${coverage}

## Dependencies

- **Production Dependencies**: ${depCount}
- **Dev Dependencies**: ${devDepCount}
- **Total**: ${depCount + devDepCount}

## Quality

- **ESLint Issues**: ${eslintIssues}

## Recent Changes

\`\`\`
${execSync('git log --oneline -10').toString()}
\`\`\`

---

*Report generated by code-metrics.js*
  `;

  // Save report
  fs.writeFileSync('./docs/CODE_METRICS.md', report);
  console.log('✅ Metrics saved to docs/CODE_METRICS.md\n');
  console.log(report);
}

getCodeMetrics();
```

**Add to package.json**:

```json
{
  "scripts": {
    "metrics": "node scripts/code-metrics.js"
  }
}
```

## Quality Gates

### Define Quality Criteria

**File**: `docs/QUALITY_GATES.md`

```markdown
# Quality Gates

All code must pass these quality gates before merging:

## Coverage Gates

- [ ] Overall coverage ≥ 80%
- [ ] New code coverage ≥ 80%
- [ ] No coverage regression > 2%

## Complexity Gates

- [ ] Cyclomatic complexity ≤ 10 per function
- [ ] Cognitive complexity ≤ 15 per function
- [ ] Nesting depth ≤ 4 levels

## Code Quality Gates

- [ ] No ESLint errors
- [ ] No TypeScript errors
- [ ] No security vulnerabilities (high/critical)
- [ ] Code duplication < 3%

## Test Gates

- [ ] All tests passing
- [ ] No skipped tests in main code paths
- [ ] Integration tests passing

## Documentation Gates

- [ ] Public APIs documented
- [ ] README updated (if needed)
- [ ] CHANGELOG updated (on release)

## Performance Gates

- [ ] Bundle size < 500kb (gzipped)
- [ ] No performance regressions
- [ ] Build time < 30 seconds
```

## Expected Outcomes

- ✅ **Code coverage tracked** and enforced
- ✅ **Quality metrics visible** to team
- ✅ **Technical debt monitored** and managed
- ✅ **Code smells detected** early
- ✅ **Complexity controlled** through metrics
- ✅ **Bundle size monitored** for performance
- ✅ **Quality gates** prevent regression

## Files Created/Modified

- New: `codecov.yml`
- New: `sonar-project.properties`
- New: `.codeclimate.yml`
- New: `.bundlewatchrc.json`
- New: `scripts/code-metrics.js`
- New: `docs/QUALITY_GATES.md`
- New: `docs/CODE_METRICS.md` (generated)
- Modified: `tsconfig.json` (strict mode)
- Modified: `.github/workflows/ci.yml` (add quality checks)
- Modified: `package.json` (scripts)
- Modified: `README.md` (badges)

## Repository Secrets Required

Configure in GitHub repository settings:

1. **CODECOV_TOKEN**: Codecov upload token
2. **SONAR_TOKEN**: SonarCloud authentication
3. **CODECLIMATE_REPO_TOKEN**: Code Climate token (if using)

## Testing the Setup

### Test Coverage Upload

```bash
# Run tests with coverage
npm run test:coverage

# Check coverage report
open coverage/lcov-report/index.html
```

### Test Code Quality Scan

```bash
# Run locally with SonarScanner
npm install -g sonar-scanner
sonar-scanner
```

### Test Metrics Generation

```bash
# Generate metrics report
npm run metrics

# Check output
cat docs/CODE_METRICS.md
```

## Success Criteria

- [ ] Codecov integration configured
- [ ] SonarCloud or Code Climate configured
- [ ] Quality gates defined and documented
- [ ] Badges added to README
- [ ] CI enforces quality gates
- [ ] Team trained on quality metrics
- [ ] First quality report generated
- [ ] Git commit: "chore: setup code quality monitoring"

## Benefits

1. **Visibility**: See code quality at a glance
2. **Prevention**: Catch quality issues early
3. **Trends**: Track quality over time
4. **Accountability**: Quality metrics in PR reviews
5. **Confidence**: Know code is maintainable
6. **Standards**: Enforce quality baselines

## Monitoring Dashboards

After setup, you'll have:

1. **Codecov Dashboard**: Coverage trends, sunburst charts
2. **SonarCloud Dashboard**: Quality gate status, code smells, bugs
3. **GitHub PR Checks**: Automatic quality feedback on PRs
4. **Local Reports**: Coverage HTML, metrics reports

## Troubleshooting

### Coverage not uploading

```bash
# Check coverage file exists
ls -la coverage/lcov.info

# Manually upload
npx codecov -f coverage/lcov.info -t $CODECOV_TOKEN
```

### SonarCloud failing

```bash
# Check sonar-project.properties
cat sonar-project.properties

# Run locally
sonar-scanner -Dsonar.login=$SONAR_TOKEN
```

### Quality gate too strict

Adjust thresholds in `codecov.yml` or `sonar-project.properties`:

```yaml
# codecov.yml
coverage:
  status:
    project:
      default:
        target: 70%  # Lower threshold
        threshold: 5%  # Allow more drop
```

---

**Priority**: LOW (nice-to-have for mature projects)
**Dependencies**: Task 027 (tests), Task 030 (CI/CD)
**Estimated Effort**: 2-3 hours
