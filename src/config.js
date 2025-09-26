/**
 * InstaChecker v3.0 - Configuration
 * Configurações centralizadas da aplicação
 */
export const CONFIG = {
  // Aplicação
  APP_NAME: 'InstaChecker',
  APP_VERSION: '3.0.0',
  APP_DESCRIPTION: 'Ferramenta premium para análise inteligente de seguidores do Instagram',
  
  // Caminhos dos assets
  PATHS: {
    MANIFEST: 'public/manifest.webmanifest',
    SERVICE_WORKER: 'public/sw.js',
    ICON_SVG: 'public/assets/instachecker-icon.svg',
    ICON_PNG_192: 'public/assets/instachecker-192.png',
    ICON_PNG_512: 'public/assets/instachecker-512.png',
    STYLES: 'src/styles.css'
  },
  
  // URLs de produção
  URLS: {
    HOMEPAGE: 'https://victorbrandao.tech/instachecker',
    GITHUB: 'https://github.com/victorbrandaao/instachecker',
    AUTHOR: 'https://victorbrandao.tech'
  },
  
  // PWA
  PWA: {
    THEME_COLOR: '#667eea',
    BACKGROUND_COLOR: '#1f2937',
    DISPLAY: 'standalone',
    START_URL: '/',
    SCOPE: '/',
    ORIENTATION: 'portrait-primary'
  },
  
  // Instagram
  INSTAGRAM: {
    FOLLOWERS_FILE: 'followers_1.json',
    FOLLOWING_FILE: 'following.json',
    SUPPORTED_FORMATS: ['.zip', '.json'],
    MAX_FILE_SIZE: 50 * 1024 * 1024 // 50MB
  },
  
  // UI/UX
  UI: {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    TOAST_DURATION: 5000,
    PROGRESS_STEPS: ['upload', 'extract', 'analyze', 'complete']
  },
  
  // Performance
  PERFORMANCE: {
    CHUNK_SIZE: 1000,
    LAZY_LOAD_THRESHOLD: 100,
    CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000 // 7 dias
  },
  
  // Desenvolvimento
  DEV: {
    DEBUG: process?.env?.NODE_ENV === 'development',
    LOG_LEVEL: 'info',
    ENABLE_ANALYTICS: false
  }
};

// Funções utilitárias para configuração
export const getAssetPath = (asset) => {
  const basePath = window.location.pathname.includes('/instachecker') 
    ? '/instachecker/' 
    : '/';
  return `${basePath}${CONFIG.PATHS[asset] || asset}`;
};

export const isDev = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

export const getBaseUrl = () => {
  return isDev() ? window.location.origin : CONFIG.URLS.HOMEPAGE;
};

// Configuração dinâmica baseada no ambiente
if (isDev()) {
  CONFIG.PWA.START_URL = '/';
  CONFIG.PWA.SCOPE = '/';
} else {
  CONFIG.PWA.START_URL = '/instachecker/';
  CONFIG.PWA.SCOPE = '/instachecker/';
}