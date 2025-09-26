/**
 * PWA Helper - InstaChecker v3.0
 * Gerencia recursos PWA avançados
 */
class PWAHelper {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.init();
  }

  init() {
    this.checkInstallation();
    this.setupInstallPrompt();
    this.setupUpdateNotification();
    this.handleAppShortcuts();
    this.setupOfflineDetection();
  }

  /**
   * Verifica se o app já está instalado
   */
  checkInstallation() {
    // Verifica se está rodando como PWA
    this.isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");

    if (this.isInstalled) {
      console.log("PWA: App está instalado");
      this.hideInstallPrompt();
    } else {
      console.log("PWA: App não está instalado");
    }
  }

  /**
   * Configura prompt de instalação
   */
  setupInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // Handle installation
    window.addEventListener("appinstalled", () => {
      console.log("PWA: App foi instalado");
      this.isInstalled = true;
      this.hideInstallPrompt();
      this.showSuccessMessage("App instalado com sucesso! 🎉");
    });
  }

  /**
   * Mostra prompt de instalação personalizado
   */
  showInstallPrompt() {
    if (this.isInstalled) return;

    const installBanner = document.createElement("div");
    installBanner.id = "pwa-install-banner";
    installBanner.className =
      "fixed top-4 right-4 z-50 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-xl max-w-sm glass-enhanced";
    installBanner.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <i class="fas fa-download text-xl"></i>
        </div>
        <div class="flex-1">
          <h4 class="font-semibold text-sm">Instalar InstaChecker</h4>
          <p class="text-xs opacity-90 mt-1">Adicione à tela inicial para acesso rápido</p>
          <div class="flex space-x-2 mt-3">
            <button id="pwa-install-btn" class="px-3 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-all">
              Instalar
            </button>
            <button id="pwa-dismiss-btn" class="px-3 py-1 bg-white bg-opacity-10 rounded text-xs hover:bg-opacity-20 transition-all">
              Agora não
            </button>
          </div>
        </div>
        <button id="pwa-close-btn" class="flex-shrink-0 opacity-70 hover:opacity-100">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(installBanner);

    // Event listeners
    document.getElementById("pwa-install-btn").addEventListener("click", () => {
      this.installApp();
    });

    document.getElementById("pwa-dismiss-btn").addEventListener("click", () => {
      this.hideInstallPrompt();
      localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    });

    document.getElementById("pwa-close-btn").addEventListener("click", () => {
      this.hideInstallPrompt();
    });

    // Auto hide after 10 seconds
    setTimeout(() => {
      this.hideInstallPrompt();
    }, 10000);
  }

  /**
   * Executa instalação do PWA
   */
  async installApp() {
    if (!this.deferredPrompt) return;

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("PWA: Usuário aceitou instalação");
      } else {
        console.log("PWA: Usuário rejeitou instalação");
      }

      this.deferredPrompt = null;
      this.hideInstallPrompt();
    } catch (error) {
      console.error("PWA: Erro na instalação:", error);
    }
  }

  /**
   * Esconde prompt de instalação
   */
  hideInstallPrompt() {
    const banner = document.getElementById("pwa-install-banner");
    if (banner) {
      banner.remove();
    }
  }

  /**
   * Configura notificação de atualização
   */
  setupUpdateNotification() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        this.showUpdateNotification();
      });

      // Check for updates periodically
      setInterval(() => {
        this.checkForUpdates();
      }, 60000); // Check every minute
    }
  }

  /**
   * Verifica atualizações disponíveis
   */
  async checkForUpdates() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      } catch (error) {
        console.log("PWA: Erro ao verificar atualizações:", error);
      }
    }
  }

  /**
   * Mostra notificação de atualização
   */
  showUpdateNotification() {
    const updateBanner = document.createElement("div");
    updateBanner.id = "pwa-update-banner";
    updateBanner.className =
      "fixed bottom-4 left-4 right-4 z-50 p-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg shadow-xl glass-enhanced";
    updateBanner.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <i class="fas fa-sync-alt text-lg"></i>
          <div>
            <h4 class="font-semibold text-sm">Nova versão disponível!</h4>
            <p class="text-xs opacity-90">Clique em recarregar para atualizar</p>
          </div>
        </div>
        <button id="pwa-reload-btn" class="px-4 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-all text-sm font-medium">
          Recarregar
        </button>
      </div>
    `;

    document.body.appendChild(updateBanner);

    document.getElementById("pwa-reload-btn").addEventListener("click", () => {
      window.location.reload();
    });

    // Auto hide after 15 seconds
    setTimeout(() => {
      if (updateBanner.parentElement) {
        updateBanner.remove();
      }
    }, 15000);
  }

  /**
   * Gerencia atalhos do app
   */
  handleAppShortcuts() {
    // URL params para atalhos
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");

    if (action === "analyze") {
      // Foca na área de upload
      setTimeout(() => {
        const uploadArea = document.getElementById("upload-area");
        if (uploadArea) {
          uploadArea.scrollIntoView({ behavior: "smooth" });
          uploadArea.classList.add("animate-pulse");
          setTimeout(() => {
            uploadArea.classList.remove("animate-pulse");
          }, 2000);
        }
      }, 1000);
    }
  }

  /**
   * Configura detecção offline/online
   */
  setupOfflineDetection() {
    window.addEventListener("online", () => {
      this.showSuccessMessage("Conexão restaurada! 🌐");
      this.hideOfflineMessage();
    });

    window.addEventListener("offline", () => {
      this.showOfflineMessage();
    });

    // Check initial state
    if (!navigator.onLine) {
      this.showOfflineMessage();
    }
  }

  /**
   * Mostra mensagem offline
   */
  showOfflineMessage() {
    const offlineBanner = document.createElement("div");
    offlineBanner.id = "pwa-offline-banner";
    offlineBanner.className =
      "fixed top-4 left-4 right-4 z-50 p-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg shadow-xl glass-enhanced";
    offlineBanner.innerHTML = `
      <div class="flex items-center space-x-3">
        <i class="fas fa-wifi-slash text-lg"></i>
        <div>
          <h4 class="font-semibold text-sm">Modo Offline</h4>
          <p class="text-xs opacity-90">Funcionalidades limitadas. Seus dados são processados localmente.</p>
        </div>
      </div>
    `;

    document.body.appendChild(offlineBanner);
  }

  /**
   * Esconde mensagem offline
   */
  hideOfflineMessage() {
    const banner = document.getElementById("pwa-offline-banner");
    if (banner) {
      banner.remove();
    }
  }

  /**
   * Mostra mensagem de sucesso
   */
  showSuccessMessage(message) {
    const successDiv = document.createElement("div");
    successDiv.className =
      "fixed top-4 right-4 z-50 p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg success-enhanced";
    successDiv.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas fa-check-circle"></i>
        <span class="text-sm font-medium">${message}</span>
      </div>
    `;

    document.body.appendChild(successDiv);

    setTimeout(() => {
      if (successDiv.parentElement) {
        successDiv.remove();
      }
    }, 4000);
  }

  /**
   * Verifica se deve mostrar prompt de instalação
   */
  shouldShowInstallPrompt() {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed =
        (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      return daysSinceDismissed > 7; // Show again after 7 days
    }
    return true;
  }

  /**
   * Força atualização da cache
   */
  async forceUpdate() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.unregister();
          window.location.reload();
        }
      } catch (error) {
        console.error("PWA: Erro ao forçar atualização:", error);
      }
    }
  }

  /**
   * Obtém estatísticas de uso
   */
  getUsageStats() {
    return {
      isInstalled: this.isInstalled,
      isOnline: navigator.onLine,
      hasServiceWorker: "serviceWorker" in navigator,
      installPromptAvailable: !!this.deferredPrompt,
      lastVisit: localStorage.getItem("pwa-last-visit"),
      visitCount: parseInt(localStorage.getItem("pwa-visit-count") || "0"),
    };
  }

  /**
   * Registra visita
   */
  trackVisit() {
    const visitCount =
      parseInt(localStorage.getItem("pwa-visit-count") || "0") + 1;
    localStorage.setItem("pwa-visit-count", visitCount.toString());
    localStorage.setItem("pwa-last-visit", new Date().toISOString());
  }
}

// Inicializa PWA Helper quando DOM carrega
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.pwaHelper = new PWAHelper();
  });
} else {
  window.pwaHelper = new PWAHelper();
}

export default PWAHelper;
