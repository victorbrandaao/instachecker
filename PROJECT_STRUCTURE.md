# InstaChecker - Estrutura do Projeto

## 📁 Organização dos Diretórios

### `/src/` - Código Fonte
- **`app.js`** - Aplicação principal (Tailwind v3.0)
- **`styles.css`** - Estilos customizados Tailwind
- **`instachecker-app.js`** - Controlador principal
- **`modules/`** - Módulos da aplicação
  - `state-manager.js` - Gerenciamento de estado
  - `ui-manager.js` - Gerenciamento de UI
  - `instagram-processor.js` - Processamento Instagram
- **`utils/`** - Utilitários
  - `export-utils.js` - Exportação de dados
  - `helpers.js` - Funções auxiliares
  - `icon-generator.js` - Geração de ícones
  - `pwa-helper.js` - Funcionalidades PWA

### `/public/` - Arquivos Públicos
- **`assets/`** - Assets estáticos
  - `instachecker-icon.svg` - Ícone principal
- **`manifest.webmanifest`** - Manifesto PWA
- **`sw.js`** - Service Worker

### `/archive/` - Versões Antigas
- **`app.js`** - Versão original monolítica
- **`app-new.js`** - Primeira refatoração modular
- **`app-v2-enhancements.js`** - Melhorias v2.0
- **`index-v2-backup.html`** - Backup da interface v2.0
- **`styles.css`** - Estilos antigos
- **`debug.html`** - Página de debug
- **`redirect.html`** - Página de redirecionamento

### `/dist/` - Build de Produção (futuro)
- Arquivos otimizados para produção
- Assets minificados
- Bundle final

### Raiz do Projeto
- **`index.html`** - Página principal (v3.0 Tailwind)
- **`package.json`** - Configuração npm
- **`vercel.json`** - Configuração Vercel
- **`.eslintrc.js`** - Configuração ESLint
- **`.gitignore`** - Arquivos ignorados
- **`README.md`** - Documentação

## 🎯 Próximos Passos de Organização

1. **Build System**: Implementar Webpack/Vite para bundle
2. **TypeScript**: Migração gradual para TS
3. **Testing**: Estrutura de testes organizados
4. **Documentation**: Melhoria da documentação técnica
5. **CI/CD**: Pipeline de build automatizado

## 🧹 Limpeza Realizada

- ✅ Movidos arquivos legados para `/archive/`
- ✅ Organizados assets em `/public/`
- ✅ Reestruturado código fonte em `/src/`
- ✅ Atualizado caminhos no HTML principal
- ✅ Criada estrutura para builds futuros