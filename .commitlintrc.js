module.exports = {
  extends: ['cz'],
  rules: {
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'build', 'chore', 'revert', 'i18n', 'wip'],
    ],
  },
};
