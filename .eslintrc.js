module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module", // Suporte para módulos ES6
  },
  globals: {
    JSZip: "readonly", // JSZip do CDN
    bootstrap: "readonly" // Bootstrap do CDN
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off', // Permitir console.log para debug
    'prefer-const': 'error',
    'no-var': 'error', // Usar let/const ao invés de var
    'object-shorthand': 'warn',
    'prefer-arrow-callback': 'warn',
    "no-constant-condition": "off" // Para loops infinitos intencionais
  },
  overrides: [
    {
      // Arquivo legado ainda usa IIFE/script
      files: ['app.js'],
      parserOptions: {
        sourceType: "script"
      }
    }
  ]
};
