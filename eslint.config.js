import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import tsParser from '@typescript-eslint/parser';

export default [
  { ignores: ['dist', 'build', '.next', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: '19' },
    },
    plugins: {
      'react-hooks': reactHooks,
      react,
      'jsx-a11y': jsxA11y,
      '@next/next': nextPlugin,
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...eslintConfigPrettier.rules,
      'react-hooks/set-state-in-effect': 'off',
      'react/prop-types': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'prettier/prettier': 'warn',
    },
  },
];
