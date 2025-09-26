/**
 * InstaChecker v2.0 - UI Enhancements
 * Melhorias visuais e de experiência do usuário
 */
(function () {
  "use strict";

  // Aguarda DOM estar pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEnhancements);
  } else {
    initEnhancements();
  }

  function initEnhancements() {
    console.log("🚀 InstaChecker v2.0 - Inicializando melhorias...");

    // Inicializa funcionalidades
    initThemeToggle();
    initSmoothScrolling();
    initAnimationsOnScroll();
    initVersionBadge();
    initKeyboardShortcuts();
    initPerformanceMonitoring();
    initAccessibilityEnhancements();
  }

  /**
   * Sistema de alternância de tema claro/escuro
   */
  function initThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");
    if (!themeToggle) return;

    // Detecta preferência inicial do usuário
    const savedTheme = localStorage.getItem("instachecker-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    updateThemeButton(initialTheme);

    // Event listener para toggle
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.body.classList.contains("light-theme")
        ? "light"
        : "dark";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
      updateThemeButton(newTheme);
      localStorage.setItem("instachecker-theme", newTheme);
    });

    // Escuta mudanças na preferência do sistema
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("instachecker-theme")) {
          setTheme(e.matches ? "dark" : "light");
          updateThemeButton(e.matches ? "dark" : "light");
        }
      });
  }

  function setTheme(theme) {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  }

  function updateThemeButton(theme) {
    const themeToggle = document.getElementById("theme-toggle");
    if (!themeToggle) return;

    const icon = themeToggle.querySelector("i");
    if (theme === "dark") {
      icon.className = "fa-solid fa-sun";
      themeToggle.title = "Alternar para tema claro";
    } else {
      icon.className = "fa-solid fa-moon";
      themeToggle.title = "Alternar para tema escuro";
    }
  }

  /**
   * Scrolling suave para seções
   */
  function initSmoothScrolling() {
    // Função global para scroll suave
    window.scrollToUpload = function () {
      const uploadSection = document.getElementById("upload-section");
      if (uploadSection) {
        uploadSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    // Scroll suave para todos os links âncora
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  }

  /**
   * Animações ao fazer scroll
   */
  function initAnimationsOnScroll() {
    // Intersection Observer para animações
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up");
          observer.unobserve(entry.target); // Remove observação após animar
        }
      });
    }, observerOptions);

    // Observa elementos que devem animar
    const animateElements = document.querySelectorAll(
      ".stats-card, .results-card, .upload-card"
    );
    animateElements.forEach((el) => observer.observe(el));

    // Parallax suave para floating cards
    const floatingCards = document.querySelectorAll(".stat-card");
    if (floatingCards.length) {
      window.addEventListener(
        "scroll",
        throttle(() => {
          const scrollY = window.pageYOffset;
          floatingCards.forEach((card, index) => {
            const speed = 0.5 + index * 0.1;
            card.style.transform = `translateY(${scrollY * speed}px)`;
          });
        }, 16)
      ); // ~60fps
    }
  }

  /**
   * Badge de versão com efeitos
   */
  function initVersionBadge() {
    const versionBadge = document.querySelector('.badge:contains("v2.0")');
    if (versionBadge) {
      // Adiciona efeito pulse periódico
      setInterval(() => {
        versionBadge.classList.add("animate-pulse");
        setTimeout(() => {
          versionBadge.classList.remove("animate-pulse");
        }, 2000);
      }, 10000); // A cada 10 segundos
    }
  }

  /**
   * Atalhos de teclado
   */
  function initKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + K para focar no campo de busca
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("search-input");
        if (searchInput && !searchInput.closest(".d-none")) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // Esc para limpar busca
      if (e.key === "Escape") {
        const searchInput = document.getElementById("search-input");
        if (searchInput && searchInput === document.activeElement) {
          searchInput.value = "";
          searchInput.blur();
          // Trigger input event para aplicar filtros
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }

      // Ctrl/Cmd + U para abrir upload
      if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault();
        window.scrollToUpload();
        const fileInput = document.getElementById("instagram-files");
        if (fileInput) {
          fileInput.click();
        }
      }

      // Teclas 1, 2, 3 para alternar entre abas
      if (
        ["1", "2", "3"].includes(e.key) &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey
      ) {
        const target = document.activeElement;
        // Só ativa se não estiver digitando em um input
        if (!target.matches("input, textarea, [contenteditable]")) {
          e.preventDefault();
          const tabButtons = document.querySelectorAll(
            '[data-bs-toggle="tab"]'
          );
          const index = parseInt(e.key) - 1;
          if (tabButtons[index]) {
            tabButtons[index].click();
          }
        }
      }
    });

    // Tooltip para atalhos
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.title = "Ctrl+K para focar rapidamente";
    }
  }

  /**
   * Monitoramento de performance
   */
  function initPerformanceMonitoring() {
    // Web Vitals básicos
    if ("web-vital" in window) {
      return; // Evita duplicação se já carregado
    }

    // Marca como carregado
    window["web-vital"] = true;

    // Monitora tempo de carregamento
    window.addEventListener("load", () => {
      const loadTime = performance.now();
      console.log(
        `⚡ InstaChecker v2.0 carregado em ${Math.round(loadTime)}ms`
      );

      // Se muito lento, sugere otimizações
      if (loadTime > 3000) {
        console.warn(
          "🐌 Carregamento lento detectado. Considere verificar sua conexão."
        );
      }
    });

    // Monitora interações lentas
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.processingStart - entry.startTime > 100) {
          console.warn(`🐌 Interação lenta detectada: ${entry.name}`);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["event"] });
    } catch (e) {
      // Fallback se não suportado
    }
  }

  /**
   * Melhorias de acessibilidade
   */
  function initAccessibilityEnhancements() {
    // Adiciona skip link
    addSkipLink();

    // Melhora navegação por teclado
    enhanceKeyboardNavigation();

    // Adiciona live regions para mudanças dinâmicas
    addLiveRegions();

    // Melhora labels e descrições
    enhanceLabels();
  }

  function addSkipLink() {
    const skipLink = document.createElement("a");
    skipLink.href = "#upload-section";
    skipLink.className =
      "sr-only sr-only-focusable btn btn-primary position-absolute";
    skipLink.style.cssText = "top: 10px; left: 10px; z-index: 9999;";
    skipLink.textContent = "Pular para conteúdo principal";
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  function enhanceKeyboardNavigation() {
    // Adiciona indicadores visuais de foco
    const style = document.createElement("style");
    style.textContent = `
      .focus-visible:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);

    // Gerencia foco em modais
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      modal.addEventListener("shown.bs.modal", () => {
        const firstFocusable = modal.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        }
      });
    });
  }

  function addLiveRegions() {
    // Região para anúncios de status
    if (!document.getElementById("sr-status")) {
      const statusRegion = document.createElement("div");
      statusRegion.id = "sr-status";
      statusRegion.setAttribute("aria-live", "polite");
      statusRegion.setAttribute("aria-atomic", "true");
      statusRegion.className = "sr-only";
      document.body.appendChild(statusRegion);
    }

    // Função global para anunciar mudanças
    window.announceToScreenReader = function (message) {
      const statusRegion = document.getElementById("sr-status");
      if (statusRegion) {
        statusRegion.textContent = message;
        // Limpa após um tempo para permitir novos anúncios
        setTimeout(() => {
          statusRegion.textContent = "";
        }, 1000);
      }
    };
  }

  function enhanceLabels() {
    // Melhora labels dos controles
    const searchInput = document.getElementById("search-input");
    if (searchInput && !searchInput.getAttribute("aria-label")) {
      searchInput.setAttribute("aria-label", "Buscar usuários por nome");
    }

    const sortSelect = document.getElementById("sort-select");
    if (sortSelect && !sortSelect.getAttribute("aria-label")) {
      sortSelect.setAttribute("aria-label", "Ordenar resultados");
    }

    // Adiciona descrições para botões
    const copyButtons = document.querySelectorAll("[data-copy]");
    copyButtons.forEach((button) => {
      if (!button.getAttribute("aria-label")) {
        const view = button.dataset.copy;
        button.setAttribute(
          "aria-label",
          `Copiar lista de ${getViewLabel(view)}`
        );
      }
    });
  }

  function getViewLabel(view) {
    const labels = {
      notFollowingBack: "usuários que não seguem você",
      notFollowedBack: "usuários que você não segue",
      mutuals: "seguidores mútuos",
    };
    return labels[view] || view;
  }

  /**
   * Utilitários
   */
  function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  // Adiciona classes CSS dinâmicas baseadas em capacidades do browser
  function addBrowserCapabilityClasses() {
    const html = document.documentElement;

    // Detecta suporte a CSS Grid
    if (CSS.supports("display", "grid")) {
      html.classList.add("supports-grid");
    }

    // Detecta suporte a backdrop-filter
    if (CSS.supports("backdrop-filter", "blur(10px)")) {
      html.classList.add("supports-backdrop-filter");
    }

    // Detecta dispositivos touch
    if ("ontouchstart" in window) {
      html.classList.add("touch-device");
    }

    // Detecta conexão lenta
    if (
      "connection" in navigator &&
      navigator.connection.effectiveType === "2g"
    ) {
      html.classList.add("slow-connection");
    }
  }

  // Inicializa classes do browser
  addBrowserCapabilityClasses();

  // Expõe utilitários globalmente para debug
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    window.InstaCheckerV2 = {
      setTheme,
      scrollToUpload: window.scrollToUpload,
      announceToScreenReader: window.announceToScreenReader,
    };
  }
})();
