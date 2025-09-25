module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true, // Adicione para reconhecer 'module'
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  globals: {
    JSZip: "readonly", // Adicione para JSZip do CDN
  },
  rules: {
    // Adicione regras customizadas se necessário, ex.:
    // 'no-unused-vars': 'warn',
    "no-constant-condition": "off", // Desative se for intencional (verifique linha 349 em app.js)
  },
};
