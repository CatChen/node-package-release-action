import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: js.configs.recommended,
});

// console.log(
//   compat.config({
//     env: {
//       browser: true,
//       es2021: true,
//       node: true,
//     },
//     extends: [
//       'eslint:recommended',
//       'plugin:@typescript-eslint/recommended',
//       'plugin:prettier/recommended',
//     ],
//     parser: '@typescript-eslint/parser',
//     parserOptions: {
//       // project: './tsconfig.json',
//       ecmaVersion: 'latest',
//       sourceType: 'module',
//     },
//     plugins: ['@typescript-eslint'],
//     root: true,
//     rules: {},
//     ignorePatterns: ['node_modules/**/*', 'lib/**/*', 'dist/**/*'],
//     overrides: [
//       {
//         files: ['*.ts'],
//       },
//     ],
//   }),
// );

export default compat.config({
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // project: './tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {},
  ignorePatterns: ['node_modules/**/*', 'lib/**/*', 'dist/**/*'],
  overrides: [
    {
      files: ['*.ts'],
    },
  ],
});
