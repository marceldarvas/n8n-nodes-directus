# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-15

### ✨ Features

- **Flows**: Add flow trigger, monitoring, and webhook management operations
- **Flows**: Add flow chaining and looping with concurrency control
- **Users**: Add bulk user operations and enhanced invitations
- **Users**: Add role lookup helper for creating users with role names (no UUID required)
- **Presets**: Add preset application and data extraction operations
- **Presets**: Add dynamic filter builder for complex queries
- **Activity Logs**: Add flow log filtering and aggregation
- **Revisions**: Add revision comparison and diff generation
- **Insights**: Add insights panel access and query execution
- **Agent Tools**: Add AI agent integration with function calling schemas
- **Agent Tools**: Add pre-built tools for user management, flows, activity queries, and presets
- **OAuth2**: Add OAuth2 authentication support with token refresh

### 🐛 Bug Fixes

- **Core**: Fix syntax errors in initial implementation
- **Errors**: Enhanced error handling with user-friendly messages and retry logic
- **Auth**: Improved authentication error handling

### 📝 Documentation

- Add comprehensive API reference documentation
- Add migration guide from v1.x to v2.x
- Add AI agent setup guide with examples
- Add troubleshooting guide
- Add architecture documentation
- Add contributing guidelines

### ✅ Tests

- Add integration test suite with fixtures
- Add test setup and configuration
- Add placeholder tests for all major features

### 👷 CI/CD

- Setup GitHub Actions CI/CD pipeline
- Add automated testing on multiple Node versions (18, 20, 22)
- Add security scanning (npm audit, Snyk, CodeQL, Gitleaks)
- Add automated npm publishing on release
- Setup Dependabot for dependency updates

### 🔧 Chores

- Setup pre-commit hooks with Husky and lint-staged
- Add commitlint for enforcing Conventional Commits
- Add ESLint and Prettier configuration
- Add development documentation

## [1.0.0] - 2024-XX-XX

### ✨ Features

- Initial release
- Basic Directus operations
- User management
- Static token authentication
- Support for all 19 Directus resources

---

[2.0.0]: https://github.com/marceldarvas/n8n-nodes-directus/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/marceldarvas/n8n-nodes-directus/releases/tag/v1.0.0
