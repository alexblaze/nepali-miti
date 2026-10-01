import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    rules: {
      // `noUncheckedIndexedAccess` is on; indices are validated before lookup, so `!` is intentional.
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['src/**'],
    rules: { 'no-console': 'error' },
  },
  {
    files: ['examples/**'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly', require: 'readonly' } },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
);
