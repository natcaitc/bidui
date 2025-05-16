import vuetifyConfig from 'eslint-config-vuetify'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  ...vuetifyConfig, // Keep the base Vuetify config

  // Add configuration for TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    rules: {
      // Include TypeScript-specific rules
      ...tseslint.configs.recommended.rules,
    },
  },

  // Add configuration for Vue files with TypeScript
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: {
          // Use TS parser for <script lang="ts"> blocks
          ts: tsParser,
          // Keep the default parser for regular script blocks
          js: null, // This will use the default Vue parser
        },
      },
    },
  },
]
