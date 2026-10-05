module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'ui',
        'map',
        'quest',
        'mentor',
        'content',
        'sync',
        'auth',
        'db',
        'xp',
        'math',
        'ci',
        'deps',
        'harness',
      ],
    ],
  },
};
