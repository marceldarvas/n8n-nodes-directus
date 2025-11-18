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
    { type: 'ci', section: '👷 CI/CD', hidden: false },
    { type: 'chore', section: '🔧 Chores', hidden: false },
  ],

  // Commit types that trigger releases
  // feat = minor, fix = patch, BREAKING CHANGE = major
  releaseCommitMessageFormat: 'chore(release): {{currentTag}}',

  // Files to bump version in
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

  // Custom changelog formatting
  header:
    '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n',

  // Commit URL format (GitHub)
  commitUrlFormat:
    '{{host}}/{{owner}}/{{repository}}/commit/{{hash}}',
  compareUrlFormat:
    '{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}',
  issueUrlFormat: '{{host}}/{{owner}}/{{repository}}/issues/{{id}}',

  // Preset (conventional-changelog preset)
  preset: 'conventionalcommits',
};
