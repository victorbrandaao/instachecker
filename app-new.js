import { InstaCheckerApp } from "./src/instachecker-app.js";

/**
 * Ponto de entrada da aplicação InstaChecker
 * Arquivo principal simplificado e modular
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
      const app = new InstaCheckerApp();
      app.init();

      // Expõe globalmente para debug (apenas em desenvolvimento)
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        window.InstaCheckerApp = app;
        console.log(
          "InstaChecker: App disponível em window.InstaCheckerApp para debug"
        );
      }
    } catch (error) {
      console.error("Erro ao inicializar InstaChecker:", error);

      // Fallback: carrega versão antiga se a nova falhar
      if (typeof window.loadLegacyApp === "function") {
        console.warn("Carregando versão legada como fallback...");
        window.loadLegacyApp();
      } else {
        // Mostra erro para o usuário
        const errorEl = document.getElementById("error-alert");
        if (errorEl) {
          errorEl.textContent =
            "Erro ao carregar aplicação. Recarregue a página.";
          errorEl.style.display = "block";
        }
      }
    }
  }
})();
