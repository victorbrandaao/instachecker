# 📱 InstaChecker v3.0

> **Ferramenta premium para análise inteligente de seguidores do Instagram com interface moderna Tailwind CSS**

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/victorbrandaao/instachecker)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://victorbrandao.tech/instachecker)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🌟 Recursos

### 🎨 **Interface Moderna**
- **Design Tailwind CSS** com glass morphism
- **Animações suaves** e interações premium
- **Responsivo** para todos os dispositivos
- **Dark/Light mode** automático

### 📊 **Análise Avançada**
- **Comparação de seguidores** e seguidos
- **Detecção de unfollows** automatizada
- **Estatísticas detalhadas** com visualizações
- **Exportação** em múltiplos formatos

### ⚡ **Performance**
- **PWA completa** com cache offline
- **Processamento local** - dados seguros
- **Carregamento otimizado** com lazy loading
- **Service Worker** avançado

## 🚀 Como Usar

### 1️⃣ **Baixar dados do Instagram**
1. Vá para Instagram → Configurações → Privacidade e Segurança
2. Solicite download dos seus dados
3. Escolha formato JSON e baixe o arquivo ZIP

### 2️⃣ **Analisar no InstaChecker**
1. Acesse [victorbrandao.tech/instachecker](https://victorbrandao.tech/instachecker)
2. Faça upload do arquivo ZIP baixado
3. Visualize análises detalhadas automaticamente

### 3️⃣ **Instalar como PWA**
1. Clique em "Instalar App" no navegador
2. Use como aplicativo nativo
3. Funciona offline após primeira visita

## 🛠️ Desenvolvimento

### **Estrutura do Projeto**
```
instachecker/
├── src/                 # Código fonte
│   ├── app.js          # App principal Tailwind
│   ├── styles.css      # Estilos customizados
│   ├── modules/        # Módulos da aplicação
│   └── utils/          # Utilitários e helpers
├── public/             # Assets públicos
│   ├── assets/         # Ícones e imagens
│   ├── manifest.webmanifest
│   └── sw.js           # Service Worker
├── archive/            # Versões antigas
└── index.html          # Interface principal
```

### **Scripts Disponíveis**
```bash
# Desenvolvimento local
npm run dev

# Servidor de produção
npm run serve

# Linting de código
npm run lint
npm run lint:fix

# Testes
npm test

# Limpeza
npm run clean

# Arquivo da versão
npm run archive
```

### **Tecnologias Utilizadas**
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Framework CSS**: Tailwind CSS 3.x
- **PWA**: Service Worker, Web App Manifest
- **Build**: Modular ES6 imports
- **Deploy**: Vercel + GitHub Actions
- **Quality**: ESLint, Jest

## 📱 PWA Features

- ✅ **Installable** - Funciona como app nativo
- ✅ **Offline-first** - Cache inteligente 
- ✅ **Background sync** - Sincronização automática
- ✅ **Push notifications** - Alertas personalizados
- ✅ **Responsive** - Adapta a qualquer tela
- ✅ **Secure** - HTTPS obrigatório

## 🎨 Design System

### **Cores Principais**
- **Primary**: `#667eea` (Roxo/Azul gradient)
- **Secondary**: `#764ba2` (Roxo profundo)  
- **Accent**: `#6B73FF` (Azul vibrante)
- **Surface**: Glass morphism com blur

### **Tipografia**
- **Font**: Inter (Google Fonts)
- **Scales**: Tailwind typography scale
- **Weights**: 400, 500, 600, 700

## 🔄 Changelog

### **v3.0.0** - 2025-09-26
- 🎨 **Redesign completo** com Tailwind CSS
- ⚡ **Performance aprimorada** com lazy loading
- 📱 **PWA melhorada** com offline-first
- 🧹 **Código organizado** em módulos limpos
- 🎯 **UX/UI premium** com animações modernas

### **v2.0.0** - 2025-09-25
- 🔧 **Arquitetura modular** refatorada
- 🚀 **CI/CD pipeline** com GitHub Actions
- 📊 **Análises aprimoradas** com estatísticas
- 🎨 **Interface melhorada** com Bootstrap

### **v1.0.0** - 2025-09-24
- 🎉 **Lançamento inicial** da ferramenta
- 📁 **Upload e processamento** de dados Instagram
- 📊 **Análise básica** de seguidores

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 👨‍💻 Autor

**Victor Brandão**
- GitHub: [@victorbrandaao](https://github.com/victorbrandaao)
- Site: [victorbrandao.tech](https://victorbrandao.tech)

---

<p align="center">
  <strong>⭐ Se este projeto te ajudou, considere dar uma estrela!</strong>
</p>