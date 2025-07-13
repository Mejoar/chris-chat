module.exports = {
  extends: ['react-app'],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  }
};
