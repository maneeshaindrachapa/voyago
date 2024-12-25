import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginJsonc from 'eslint-plugin-jsonc';
import jsoncEslintParser from 'jsonc-eslint-parser';

export default [
  {
    ignores: ['node_modules', 'dist'],
  },
  {
    files: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: true,
        module: true,
        __dirname: true,
        require: true,
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'no-console': 'warn',
      semi: ['error', 'always'],
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.json'],
    plugins: {
      jsonc: eslintPluginJsonc,
    },
    languageOptions: {
      parser: jsoncEslintParser,
    },
    rules: {
      'jsonc/sort-keys': 'off',
    },
  },
];
