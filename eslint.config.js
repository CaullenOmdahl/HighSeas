import prettier from 'eslint-config-prettier';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	{
		ignores: [
			'**/node_modules/**',
			'**/.svelte-kit/**',
			'**/.vercel/**',
			'**/build/**',
			'**/dist/**',
			'**/stremio-ui-reference/**',
			'**/stremio-video-reference/**',
			'**/android/**',
			'**/*.config.js',
			'**/*.config.ts'
		]
	},
	js.configs.recommended,
	...ts.configs.recommended,
	react.configs.flat.recommended,
	react.configs.flat['jsx-runtime'],
	prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true
				}
			}
		},
		plugins: {
			'react-hooks': reactHooks
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-hooks/exhaustive-deps': 'warn', // Downgrade to warning
			
			// React-specific rules
			'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
			'react/jsx-uses-react': 'off',
			'react/jsx-uses-vars': 'error',
			'react/display-name': 'warn', // Downgrade to warning
			'react/prop-types': 'off', // Using TypeScript for prop validation
			'react/no-unescaped-entities': 'warn', // Downgrade to warning
			
			// TypeScript-specific
			'no-undef': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn', // Downgrade to warning
			'@typescript-eslint/no-unsafe-function-type': 'warn', // Downgrade to warning
			
			// Security rules
			'no-eval': 'error',
			'no-implied-eval': 'error',
			'no-new-func': 'error',
			'no-script-url': 'error',

			// Custom security rules for this project
			'no-restricted-syntax': [
				'error',
				{
					selector: 'Literal[value=/[A-Z0-9]{32,}/]',
					message:
						'Potential hardcoded API token or secret detected. Use environment variables instead.'
				},
				{
					selector: 'TemplateLiteral > TemplateElement[value.raw=/[A-Z0-9]{32,}/]',
					message:
						'Potential hardcoded API token or secret in template literal. Use environment variables instead.'
				}
			]
		},
		settings: {
			react: {
				version: 'detect'
			}
		}
	},
	{
		// Client-side files cannot import server-config
		files: ['**/src/**/*.ts', '**/src/**/*.tsx'],
		ignores: [
			'**/routes/api/**/*.ts',
			'**/lib/server-config.ts'
		],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['**/server-config'],
							message:
								'server-config cannot be imported in client-side code - use API endpoints instead'
						}
					]
				}
			]
		}
	}
);