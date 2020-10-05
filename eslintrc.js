module.exports = {
    env: {
        'browser': true,
        'webextensions': true,
        'es6': true
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        'parser': '@typescript-eslint/parser',
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:vue/recommended'
    ],
    plugins: [
        '@typescript-eslint'
    ],
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'vue/html-indent': ["warn", 4],
        'no-console': 'warn'
    },
    globals: {
        "browser": true
    },
    settings: {
        'react': {
            'version': 'detect'
        }
    }
}
