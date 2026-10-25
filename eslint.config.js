import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Reglas de seguridad obligatorias:
 * - AC-SEC-02: prohibido `dangerouslySetInnerHTML`, `eval` e `innerHTML` en src.
 * - §8.3: prohibido usar localStorage, sessionStorage y cookies en el navegador.
 */
const securitySyntax = [
  {
    selector: "MemberExpression[property.name='innerHTML']",
    message: 'AC-SEC-02: innerHTML está prohibido. Renderice el contenido como texto.',
  },
  {
    selector: "MemberExpression[property.name='outerHTML']",
    message: 'AC-SEC-02: outerHTML está prohibido. Renderice el contenido como texto.',
  },
  {
    selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
    message: 'AC-SEC-02: insertAdjacentHTML está prohibido.',
  },
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'AC-SEC-02: dangerouslySetInnerHTML está prohibido.',
  },
  {
    selector: 'MemberExpression[property.name=/^(localStorage|sessionStorage)$/]',
    message: '§8.3: no se debe guardar nada en el almacenamiento del navegador.',
  },
  {
    selector: "MemberExpression[object.name='document'][property.name='cookie']",
    message: '§8.3: no se deben usar cookies.',
  },
];

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/no-danger': 'error',
      'react/prop-types': 'off',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: '§8.3: almacenamiento del navegador prohibido.' },
        { name: 'sessionStorage', message: '§8.3: almacenamiento del navegador prohibido.' },
      ],
      'no-restricted-syntax': ['error', ...securitySyntax],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['*.config.{ts,js}'],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
