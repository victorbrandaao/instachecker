import { InstaCheckerApp } from "./src/instachecker-app.js";

/**
 * InstaChecker v3.0 - Tailwind Enhanced Version
 * Ponto de entrada da aplicação com suporte aprimorado
 */
(function () {
  "use strict";

  // Aguarda carregamento do DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }

  /**
   * Inicializa a aplicação
   */
  function initApp() {
    try {
      // Inicializa animações do Tailwind
      initTailwindAnimations();
      
      // Configura theme toggle se disponível
      setupThemeToggle();
      
      // Inicializa app principal
      const app = new InstaCheckerApp();
      app.init();

      // Configura eventos específicos do Tailwind UI
      setupTailwindInteractions();

      // Expõe globalmente para debug (apenas em desenvolvimento)
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        window.InstaCheckerApp = app;
        console.log(
          "InstaChecker v3.0: App disponível em window.InstaCheckerApp para debug"
        );
      }
    } catch (error) {
      console.error("Erro ao inicializar InstaChecker v3.0:", error);

      // Fallback: carrega versão antiga se a nova falhar
      if (typeof window.loadLegacyApp === "function") {
        console.warn("Carregando versão legada como fallback...");
        window.loadLegacyApp();
      } else {
        // Mostra erro para o usuário
        showErrorMessage("Erro ao carregar aplicação. Recarregue a página.");
      }
    }
  }

  /**
   * Inicializa animações específicas do Tailwind
   */
  function initTailwindAnimations() {
    // Adiciona classes de animação aos cards após carregamento
    setTimeout(() => {
      const cards = document.querySelectorAll('.card-premium');
      cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-in');
      });
    }, 100);

    // Configura intersection observer para animações on scroll
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fade-in-up');
              entry.target.classList.remove('opacity-0');
            }
          });
        },
        { threshold: 0.1 }
      );

      // Observa elementos com animação
      document.querySelectorAll('[data-animate]').forEach((el) => {
        el.classList.add('opacity-0');
        observer.observe(el);
      });
    }
  }

  /**
   * Configura toggle de tema (se implementado)
   */
  function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', 
          document.documentElement.classList.contains('dark') ? 'dark' : 'light'
        );
      });

      // Aplica tema salvo
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || 
          (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    }
  }

  /**
   * Configura interações específicas da UI Tailwind
   */
  function setupTailwindInteractions() {
    // Enhanced drag and drop
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
      uploadArea.addEventListener('dragenter', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragging');
      });

      uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        if (!uploadArea.contains(e.relatedTarget)) {
          uploadArea.classList.remove('dragging');
        }
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragging');
      });
    }

    // Enhanced button interactions
    document.querySelectorAll('.btn-premium').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.classList.add('gpu-accelerated');
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.classList.remove('gpu-accelerated');
      });
    });

    // Smooth scrolling para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Tooltips enhancement
    setupTooltips();
  }

  /**
   * Configura tooltips avançados
   */
  function setupTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(el => {
      el.addEventListener('mouseenter', showTooltip);
      el.addEventListener('mouseleave', hideTooltip);
    });
  }

  function showTooltip(e) {
    const text = e.target.getAttribute('data-tooltip');
    const tooltip = document.createElement('div');
    tooltip.className = 'fixed z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg pointer-events-none';
    tooltip.textContent = text;
    tooltip.id = 'tooltip';
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
  }

  function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }

  /**
   * Mostra mensagem de erro com estilo Tailwind
   */
  function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 z-50 p-4 bg-red-500 text-white rounded-lg shadow-lg error-enhanced';
    errorDiv.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-red-200 hover:text-white">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
    }, 5000);
  }

  // Adiciona CSS para animações customizadas
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fade-in-up {
      animation: fade-in-up 0.6s ease-out forwards;
    }
    
    .animate-in {
      animation: fade-in-up 0.8s ease-out forwards;
    }
  `;
  document.head.appendChild(style);

})();