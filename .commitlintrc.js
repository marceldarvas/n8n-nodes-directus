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
