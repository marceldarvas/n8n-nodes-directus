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
3. On main branch (or appropriate release branch)
4. Clean working directory

### Release Steps

#### 1. Determine Release Type

**Automatic** (inferred from commits):

```bash
npm run release
```

This automatically determines the version bump based on commits since last release:

- `fix:` commits → PATCH release
- `feat:` commits → MINOR release
- `BREAKING CHANGE:` → MAJOR release

**Manual version bump**:

```bash
# Patch release (bug fixes only)
npm run release:patch

# Minor release (new features)
npm run release:minor

# Major release (breaking changes)
npm run release:major
```

#### 2. Dry Run (Preview Changes)

Before releasing, preview what will happen:

```bash
npm run release:dry-run
```

This shows:

- New version number
- CHANGELOG updates
- Which commits will be included

#### 3. Execute Release

```bash
# Let standard-version decide version bump
npm run release

# This automatically:
# 1. Bumps version in package.json and package-lock.json
# 2. Generates/updates CHANGELOG.md
# 3. Creates a git commit
# 4. Creates a git tag
# 5. Triggers postrelease script which:
#    - Pushes code and tags to GitHub
#    - Publishes package to npm
```

#### 4. Verify Release

After publishing:

1. Check npm: `npm view n8n-nodes-directus version`
2. Check GitHub releases: https://github.com/marceldarvas/n8n-nodes-directus/releases
3. Verify package can be installed: `npm install n8n-nodes-directus@latest`

## Manual Release (Fallback)

If automated process fails:

### 1. Bump Version Manually

```bash
# Edit package.json and package-lock.json
# Update version field
npm version patch  # or minor, or major
```

### 2. Update CHANGELOG

```bash
# Edit CHANGELOG.md
# Add new section with changes
```

### 3. Commit and Tag

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): 2.1.0"
git tag v2.1.0
git push --follow-tags
```

### 4. Publish to npm

```bash
npm run build
npm publish
```

## Breaking Changes

When introducing breaking changes:

### 1. Document in Commit

```
feat(users)!: change role parameter to require UUID

BREAKING CHANGE: Role parameter no longer accepts role names,
must use role UUID directly. Use lookupRoleByName() helper if needed.

Migration:
- Before: createUser({ role: 'Editor' })
- After: createUser({ role: '00000000-0000-0000-0000-000000000000' })
```

### 2. Update Migration Guide

Add entry to `docs/MIGRATION.md` with:

- What changed
- Why it changed
- How to migrate
- Code examples

### 3. Bump Major Version

```bash
npm run release:major
```

### 4. Announce Breaking Changes

- Update README with notice
- Post in community forums
- Add deprecation warnings (if phasing out gradually)

## Release Checklist

- [ ] All tests passing locally and in CI
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

```bash
# Bump version again
npm run release:patch
```

### "Git working directory not clean"

```bash
# Commit or stash changes first
git status
git add .
git commit -m "chore: prepare for release"
```

### "Tag already exists"

```bash
# Delete local tag
git tag -d v2.1.0

# Delete remote tag (careful!)
git push origin :refs/tags/v2.1.0

# Try release again
```

### Pre-commit hooks fail during release

```bash
# Fix the issues first
npm run lint
npm test

# Or skip hooks in emergency (not recommended)
HUSKY=0 npm run release
```

## Rollback Release

If release has critical issues:

### 1. Unpublish from npm (within 72 hours)

```bash
npm unpublish n8n-nodes-directus@2.1.0
```

⚠️ **Warning**: npm unpublish is restricted after 72 hours

### 2. Delete Git Tag

```bash
git tag -d v2.1.0
git push origin :refs/tags/v2.1.0
```

### 3. Revert Commit

```bash
git revert HEAD
git push
```

### 4. Release Hotfix

```bash
# Fix the issue
git commit -m "fix: critical bug in release"

# Release new patch version
npm run release:patch
```

## Release Cadence

### Patch Releases

- Released as needed for bug fixes
- Can be released quickly (same day)
- No major testing required

### Minor Releases

- Released monthly or when significant features are ready
- Requires thorough testing
- Should include updated documentation

### Major Releases

- Released quarterly or when breaking changes are necessary
- Requires extensive testing
- Requires migration guide
- Should be announced in advance

## GitHub Release Creation

After npm publish, create GitHub release manually:

1. Go to https://github.com/marceldarvas/n8n-nodes-directus/releases
2. Click "Draft a new release"
3. Select the new tag (e.g., v2.1.0)
4. Copy CHANGELOG entry as release notes
5. Add any additional context or screenshots
6. Publish release

## Communication

### Release Announcements

For minor and major releases:

1. **GitHub**: Create detailed release notes
2. **npm**: Package.json description stays updated
3. **README**: Update examples if needed
4. **Community**: Post in n8n community forums (for major releases)

### What to Include

- What's new
- What's fixed
- Breaking changes (if any)
- Migration guide (if needed)
- Thanks to contributors

## Example Release Flow

```bash
# 1. Ensure you're on main branch
git checkout main
git pull

# 2. Preview release
npm run release:dry-run

# 3. Run release (this pushes and publishes automatically)
npm run release

# 4. Create GitHub release
# Visit GitHub and create release from the new tag

# 5. Announce (if major release)
# Post in community forums
```

## Tips

- **Always test locally first**: Run `npm test` and `npm run build` before release
- **Use dry-run**: Always preview changes with `npm run release:dry-run`
- **Commit early, commit often**: Don't wait until release to commit changes
- **Follow conventional commits**: Makes automated releases work better
- **Update docs**: Keep documentation in sync with code

## Resources

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [standard-version documentation](https://github.com/conventional-changelog/standard-version)

---

For questions about the release process, please open an issue on GitHub.
