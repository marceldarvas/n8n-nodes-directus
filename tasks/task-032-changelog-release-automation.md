# Task 032: CHANGELOG and Automated Release Management

## Priority: MEDIUM
**Effort**: 2-3 hours
**Developer**: Backend/DevOps specialist
**Phase**: 9 - Infrastructure & Automation

## Status
- [ ] Not Started | [ ] In Progress | [ ] Code Review | [ ] Testing | [ ] Completed

## Prerequisites
- Conventional commits enforced (Task 031)
- CI/CD pipeline setup (Task 030)

## Description

Implement automated CHANGELOG generation and semantic versioning using standard-version or semantic-release. This automates the release process, generates changelogs from conventional commits, and ensures consistent versioning.

## Context

**Current State:**
- ❌ No CHANGELOG.md file exists
- ❌ Manual version bumping in package.json
- ❌ No automated release notes
- ❌ No Git tags for releases
- ❌ Manual npm publishing process
- ❌ No release documentation

**Impact:**
- Users don't know what changed between versions
- Inconsistent version numbering
- Forgotten version bumps
- Manual release process is error-prone
- No migration guides for breaking changes

## Problem Scenarios

### Scenario 1: Forgotten Version Bump
```bash
# Developer makes changes and publishes
npm publish

# Error: Version already exists
# Developer manually edits package.json
# Forgets to commit version bump
# Git and npm are out of sync
```

### Scenario 2: No Release Notes
```bash
# v2.1.0 released
# Users ask: "What's new in 2.1.0?"
# Developer has to manually review git log
# Incomplete or missing release notes
```

### Scenario 3: Wrong Version Bump
```bash
# Breaking change committed
# Developer bumps patch version (wrong!)
# Should be major version
# Users' code breaks unexpectedly
```

## Implementation Options

### Option A: standard-version (Simpler)

Pros:
- Simple setup
- Works offline
- Git-only (no external services)
- Full control

Cons:
- Manual release trigger
- Less automation

### Option B: semantic-release (Full Automation)

Pros:
- Fully automated
- CI/CD integration
- npm publish automation
- GitHub releases

Cons:
- More complex setup
- Requires CI/CD

**Recommendation**: Use **standard-version** for simplicity.

## Implementation Steps

### 1. Install Dependencies (0.25 hours)

```bash
npm install --save-dev standard-version
```

### 2. Configure standard-version (0.5 hours)

**File**: `.versionrc.js`

```javascript
module.exports = {
  // Version bump types
  types: [
    { type: 'feat', section: '✨ Features' },
    { type: 'fix', section: '🐛 Bug Fixes' },
    { type: 'perf', section: '⚡ Performance' },
    { type: 'revert', section: '⏪ Reverts' },
    { type: 'docs', section: '📝 Documentation', hidden: false },
    { type: 'style', section: '💎 Styles', hidden: true },
    { type: 'refactor', section: '♻️ Refactoring', hidden: true },
    { type: 'test', section: '✅ Tests', hidden: true },
    { type: 'build', section: '🏗️ Build', hidden: true },
    { type: 'ci', section: '👷 CI/CD', hidden: true },
    { type: 'chore', section: '🔧 Chores', hidden: true },
  ],

  // Commit types that trigger releases
  releaseCommitMessageFormat: 'chore(release): {{currentTag}}',

  // Which commit types bump which version
  // feat = minor, fix = patch, BREAKING CHANGE = major
  bumpFiles: [
    {
      filename: 'package.json',
      type: 'json',
    },
    {
      filename: 'package-lock.json',
      type: 'json',
    },
  ],

  // Skip commits with these types in changelog
  skip: {
    changelog: false,
  },

  // Custom changelog formatting
  header: '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n',

  // Commit URL format (GitHub)
  commitUrlFormat: '{{host}}/{{owner}}/{{repository}}/commit/{{hash}}',
  compareUrlFormat: '{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}',
  issueUrlFormat: '{{host}}/{{owner}}/{{repository}}/issues/{{id}}',

  // Preset (conventional-changelog preset)
  preset: 'conventionalcommits',
};
```

### 3. Add NPM Scripts (0.25 hours)

Add to `package.json`:

```json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major",
    "release:patch": "standard-version --release-as patch",
    "release:dry-run": "standard-version --dry-run",
    "release:first": "standard-version --first-release",
    "postrelease": "git push --follow-tags origin main && npm publish"
  }
}
```

### 4. Create Initial CHANGELOG (0.5 hours)

**Option 1: Generate from all history**

```bash
# First release - generate CHANGELOG from entire git history
npm run release:first
```

**Option 2: Create manual initial CHANGELOG**

**File**: `CHANGELOG.md`

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-15

### ✨ Features

- **Flows**: Add flow trigger, monitoring, and webhook management
- **Users**: Add bulk user operations and enhanced invitations
- **Presets**: Add preset application and data extraction
- **Agent Tools**: Add AI agent integration with function calling
- **OAuth2**: Add OAuth2 authentication support

### 🐛 Bug Fixes

- **Errors**: Enhanced error handling with user-friendly messages
- **Syntax**: Fix syntax errors in initial implementation

### 📝 Documentation

- Add comprehensive API reference
- Add migration guide from v1.x
- Add AI agent setup guide
- Add troubleshooting guide
- Add architecture documentation

### ✅ Tests

- Add integration test suite
- Add test fixtures and setup

## [1.0.0] - 2024-XX-XX

### ✨ Features

- Initial release
- Basic Directus operations
- User management
- Static token authentication

---

[2.0.0]: https://github.com/arladmin/n8n-nodes-directus/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/arladmin/n8n-nodes-directus/releases/tag/v1.0.0
```

### 5. Create Release Workflow Documentation (0.5 hours)

**File**: `docs/RELEASE_PROCESS.md`

```markdown
# Release Process

This document describes how to release new versions of n8n-nodes-directus.

## Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes
- **MINOR** (0.x.0): New features (backward compatible)
- **PATCH** (0.0.x): Bug fixes

## Automated Release Process

### Prerequisites

1. All tests passing
2. All changes committed
3. On main branch
4. Clean working directory

### Release Steps

#### 1. Determine Release Type

**Patch Release** (bug fixes only):
\`\`\`bash
npm run release:patch
\`\`\`

**Minor Release** (new features):
\`\`\`bash
npm run release:minor
\`\`\`

**Major Release** (breaking changes):
\`\`\`bash
npm run release:major
\`\`\`

**Automatic** (inferred from commits):
\`\`\`bash
npm run release
\`\`\`

This automatically:
1. Bumps version in package.json
2. Generates/updates CHANGELOG.md
3. Creates a git commit
4. Creates a git tag
5. Pushes to remote
6. Publishes to npm

#### 2. Dry Run (Preview Changes)

Before releasing, preview what will happen:

\`\`\`bash
npm run release:dry-run
\`\`\`

This shows:
- New version number
- CHANGELOG updates
- Which commits will be included

#### 3. Execute Release

\`\`\`bash
# Let standard-version decide version bump
npm run release

# This triggers postrelease script which:
# - Pushes code and tags to GitHub
# - Publishes package to npm
\`\`\`

#### 4. Create GitHub Release

After publishing, create GitHub release:

1. Go to https://github.com/arladmin/n8n-nodes-directus/releases
2. Click "Draft a new release"
3. Select the new tag (e.g., v2.1.0)
4. Copy CHANGELOG entry as release notes
5. Publish release

## Manual Release (Fallback)

If automated process fails:

### 1. Bump Version Manually

\`\`\`bash
# Edit package.json and package-lock.json
# Update version field
\`\`\`

### 2. Update CHANGELOG

\`\`\`bash
# Edit CHANGELOG.md
# Add new section with changes
\`\`\`

### 3. Commit and Tag

\`\`\`bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): 2.1.0"
git tag v2.1.0
git push --follow-tags
\`\`\`

### 4. Publish to npm

\`\`\`bash
npm run build
npm publish
\`\`\`

## Breaking Changes

When introducing breaking changes:

### 1. Document in Commit

\`\`\`
feat(users)!: change role parameter to require UUID

BREAKING CHANGE: Role parameter no longer accepts role names,
must use role UUID directly. Use lookupRoleByName() helper if needed.

Migration:
- Before: createUser({ role: 'Editor' })
- After: createUser({ role: '00000000-0000-0000-0000-000000000000' })
\`\`\`

### 2. Update Migration Guide

Add entry to `MIGRATION.md` with:
- What changed
- Why it changed
- How to migrate
- Code examples

### 3. Bump Major Version

\`\`\`bash
npm run release:major
\`\`\`

### 4. Announce Breaking Changes

- Update README with notice
- Post in community forums
- Add deprecation warnings (if phasing out gradually)

## Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Breaking changes documented in MIGRATION.md
- [ ] CHANGELOG reviewed
- [ ] Version bumped correctly
- [ ] Git tag created
- [ ] Pushed to GitHub
- [ ] Published to npm
- [ ] GitHub release created
- [ ] Community announced (if major release)

## Troubleshooting

### "Version already exists on npm"

\`\`\`bash
# Bump version again
npm run release:patch
\`\`\`

### "Git working directory not clean"

\`\`\`bash
# Commit or stash changes first
git status
git add .
git commit -m "chore: prepare for release"
\`\`\`

### "Tag already exists"

\`\`\`bash
# Delete local tag
git tag -d v2.1.0

# Delete remote tag (careful!)
git push origin :refs/tags/v2.1.0

# Try release again
\`\`\`

## Rollback Release

If release has critical issues:

### 1. Unpublish from npm (within 72 hours)

\`\`\`bash
npm unpublish n8n-nodes-directus@2.1.0
\`\`\`

### 2. Delete Git Tag

\`\`\`bash
git tag -d v2.1.0
git push origin :refs/tags/v2.1.0
\`\`\`

### 3. Revert Commit

\`\`\`bash
git revert HEAD
git push
\`\`\`

### 4. Release Hotfix

\`\`\`bash
# Fix the issue
git commit -m "fix: critical bug in release"

# Release new patch version
npm run release:patch
\`\`\`
\`\`\`

### 6. Update .gitignore (0.25 hours)

Ensure these are NOT ignored:

```gitignore
# .gitignore

# KEEP these files
!CHANGELOG.md
!.versionrc.js
```

### 7. Add Release Automation to CI (Optional, 0.5 hours)

**File**: `.github/workflows/release.yml`

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      release-type:
        description: 'Release type'
        required: true
        type: choice
        options:
          - patch
          - minor
          - major

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Run release
        run: npm run release:${{ github.event.inputs.release-type }}

      - name: Push changes
        run: git push --follow-tags origin main

      - name: Publish to npm
        run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Expected Outcomes

- ✅ **Automated CHANGELOG** generated from commits
- ✅ **Semantic versioning** enforced
- ✅ **Git tags** created automatically
- ✅ **Consistent releases** no manual errors
- ✅ **Release documentation** clear process
- ✅ **Migration guides** for breaking changes
- ✅ **npm publishing** automated

## Files Created/Modified

- New: `CHANGELOG.md`
- New: `.versionrc.js`
- New: `docs/RELEASE_PROCESS.md`
- New: `.github/workflows/release.yml` (optional)
- Modified: `package.json` (scripts and version)
- Modified: `.gitignore` (ensure CHANGELOG not ignored)

## Testing the Setup

```bash
# Preview what release would do
npm run release:dry-run

# Should show:
# - Version bump (e.g., 2.0.0 → 2.1.0)
# - CHANGELOG updates
# - Commits included
```

## Success Criteria

- [ ] standard-version installed and configured
- [ ] CHANGELOG.md created
- [ ] Release scripts added to package.json
- [ ] Release process documented
- [ ] Dry-run tested successfully
- [ ] First release executed (or planned)
- [ ] Team trained on release process
- [ ] Git commit: "chore: setup automated changelog and release management"

## Benefits

1. **Consistency**: Automated versioning prevents errors
2. **Transparency**: Users see exactly what changed
3. **Speed**: Release in seconds, not minutes
4. **Quality**: Enforces conventional commits
5. **Documentation**: Auto-generated release notes
6. **Migration**: Clear upgrade paths for breaking changes

## Future Enhancements

- Automate GitHub release creation
- Add release announcement automation (Discord, Slack)
- Add deprecation warnings system
- Add beta/alpha release channels

---

**Priority**: MEDIUM (improves release quality)
**Dependencies**: Task 031 (conventional commits needed)
**Estimated Effort**: 2-3 hours
