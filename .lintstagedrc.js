module.exports = {
  // TypeScript files in nodes and credentials
  '{nodes,credentials}/**/*.ts': [
    // 1. Fix ESLint issues automatically
    'eslint --fix',
    // 2. Format with Prettier
    'prettier --write',
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
