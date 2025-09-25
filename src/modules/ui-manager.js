import { Helpers } from '../utils/helpers.js';

/**
 * Gerenciador da interface do usuário
 */
export class UIManager {
  constructor() {
    this._elements = this._mapElements();
    this._timeouts = {
      status: null,
      notice: null
    };
    
    this._emptyMessages = {
      notFollowingBack: "Ótimo! Todos que você segue retribuem o follow.",
      notFollowedBack: "Perfeito! Você já segue todos os seus seguidores.",
      mutuals: "Ainda não há conexões mútuas para exibir."
    };

    this._viewLabels = {
      notFollowingBack: "não seguem você",
      notFollowedBack: "você não segue",
      mutuals: "mútuos"
    };

    this._defaultStatusHTML = '<i class="fa-solid fa-upload text-muted"></i> <span class="ms-2">Escolha os arquivos do Instagram ou arraste aqui para começar.</span>';
  }

  /**
   * Mapeia elementos do DOM
   * @returns {Object} Mapeamento de elementos
   * @private
   */
  _mapElements() {
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    return {
      // Upload
      fileInput: $("#instagram-files"),
      pickBtn: $("#pick-btn"),
      uploader: $("#uploader"),
      status: $("#upload-status"),
      
      // Controles
      searchInput: $("#search-input"),
      sortSelect: $("#sort-select"),
      filterFeedback: $("#filter-feedback"),
      
      // Resultados
      resultsSection: $("#results-section"),
      error: $("#error-alert"),
      resultNotice: $("#result-notice"),
      
      // Abas e listas
      tabButtons: $$('[data-bs-toggle="tab"]'),
      list: {
        notFollowingBack: $("#not-following-back-list"),
        notFollowedBack: $("#not-followed-back-list"),
        mutuals: $("#mutuals-list")
      },
      
      // Contadores
      counts: {
        notFollowingBack: $("#not-following-back-count"),
        notFollowedBack: $("#not-followed-back-count"),  
        mutuals: $("#mutuals-count")
      },
      tabCounts: {
        notFollowingBack: $("#not-following-back-tab-count"),
        notFollowedBack: $("#not-followed-back-tab-count"),
        mutuals: $("#mutuals-tab-count")
      },
      
      // Resumo
      totalFollowing: $("#total-following"),
      totalFollowers: $("#total-followers"),
      totalMutuals: $("#total-mutuals"),
      summaryFollowBack: $("#summary-follow-back"),
      netBalance: $("#net-balance"),
      insightText: $("#insight-text"),
      mutualProgress: $("#mutual-progress"),
      
      // Botões
      copyButtons: $$('[data-copy]'),
      copyCurrent: $("#copy-current"),
      clearBtn: $("#clear-btn"),
      exportButtons: {
        notFollowingBack: $("#export-not-following-back"),
        notFollowedBack: $("#export-not-followed-back"),
        mutuals: $("#export-mutuals")
      }
    };
  }

  /**
   * Obtém elementos mapeados
   * @returns {Object} Elementos DOM
   */
  getElements() {
    return this._elements;
  }

  /**
   * Exibe erro
   * @param {string} message - Mensagem de erro
   */
  showError(message) {
    const { error } = this._elements;
    if (!error) return;
    
    error.textContent = message;
    error.style.display = "block";
    error.classList.add("show");
  }

  /**
   * Limpa erro
   */
  clearError() {
    const { error } = this._elements;
    if (!error) return;
    
    error.textContent = "";
    error.style.display = "none";
    error.classList.remove("show");
  }

  /**
   * Define status do uploader
   * @param {boolean} enabled - Se está habilitado
   */
  setUploaderEnabled(enabled) {
    const { pickBtn, uploader } = this._elements;
    
    if (pickBtn) pickBtn.disabled = !enabled;
    if (uploader) uploader.classList.toggle("busy", !enabled);
  }

  /**
   * Define status de processamento
   */
  setStatusProcessing() {
    this._setStatus(
      '<span class="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></span> <span class="ms-2">Processando arquivos...</span>',
      false
    );
  }

  /**
   * Define status de sucesso
   */
  setStatusSuccess() {
    this._setStatus(
      '<i class="fa-solid fa-circle-check text-success"></i> <span class="ms-2">Tudo certo! Confira os resultados abaixo ou envie novos arquivos.</span>',
      true
    );
  }

  /**
   * Reseta status para padrão
   */
  resetStatus() {
    this._setStatus(this._defaultStatusHTML, false);
  }

  /**
   * Define status personalizado
   * @param {string} html - HTML do status
   * @param {boolean} autoReset - Se deve resetar automaticamente
   * @private
   */
  _setStatus(html, autoReset) {
    const { status } = this._elements;
    if (!status) return;
    
    if (this._timeouts.status) {
      clearTimeout(this._timeouts.status);
      this._timeouts.status = null;
    }
    
    status.innerHTML = html;
    
    if (autoReset) {
      this._timeouts.status = setTimeout(() => {
        status.innerHTML = this._defaultStatusHTML;
        this._timeouts.status = null;
      }, 4000);
    }
  }

  /**
   * Exibe notificação de resultado
   * @param {string} message - Mensagem
   * @param {string} type - Tipo (success, info, warning, danger)
   * @param {number} timeout - Timeout em ms (0 = sem timeout)
   */
  showResultNotice(message, type = "success", timeout = 4000) {
    const { resultNotice } = this._elements;
    if (!resultNotice || !message) return;
    
    resultNotice.classList.remove(
      "d-none",
      "alert-success",
      "alert-info", 
      "alert-warning",
      "alert-danger"
    );
    resultNotice.classList.add(`alert-${type}`);
    resultNotice.textContent = message;
    
    if (this._timeouts.notice) {
      clearTimeout(this._timeouts.notice);
      this._timeouts.notice = null;
    }
    
    if (timeout > 0) {
      this._timeouts.notice = setTimeout(() => {
        this.hideResultNotice();
      }, timeout);
    }
  }

  /**
   * Esconde notificação de resultado
   */
  hideResultNotice() {
    const { resultNotice } = this._elements;
    if (!resultNotice) return;
    
    resultNotice.classList.add("d-none");
    resultNotice.textContent = "";
    
    if (this._timeouts.notice) {
      clearTimeout(this._timeouts.notice);
      this._timeouts.notice = null;
    }
  }

  /**
   * Atualiza lista de usuários
   * @param {string} view - Nome da visualização
   * @param {Array} data - Dados para exibir
   * @param {string} highlightTerm - Termo para destacar
   */
  updateList(view, data, highlightTerm = "") {
    const container = this._elements.list[view];
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!data.length) {
      const message = document.createElement("p");
      message.className = "empty-message";
      message.textContent = this._emptyMessages[view] || "Nenhum perfil encontrado.";
      container.appendChild(message);
      return;
    }
    
    data.forEach((username) => {
      const link = document.createElement("a");
      link.className = "pill";
      link.href = `https://instagram.com/${encodeURIComponent(username)}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.innerHTML = Helpers.formatUsername(username, highlightTerm);
      container.appendChild(link);
    });
  }

  /**
   * Atualiza contadores
   * @param {string} view - Nome da visualização  
   * @param {number} visibleCount - Contagem visível
   * @param {number} totalCount - Contagem total
   */
  updateCounts(view, visibleCount, totalCount) {
    const { counts, tabCounts } = this._elements;
    
    if (counts[view]) {
      counts[view].textContent = visibleCount !== totalCount
        ? `${visibleCount}/${totalCount}`
        : totalCount.toString();
    }
    
    if (tabCounts[view]) {
      tabCounts[view].textContent = totalCount.toString();
    }
  }

  /**
   * Atualiza resumo geral
   * @param {Object} data - Dados do estado
   * @param {boolean} reset - Se deve resetar
   */
  updateSummary(data, reset = false) {
    const followingTotal = reset ? 0 : data.following?.size || 0;
    const followersTotal = reset ? 0 : data.followers?.size || 0;
    const mutualsTotal = reset ? 0 : data.mutuals?.length || 0;

    const elements = this._elements;
    
    if (elements.totalFollowing) {
      elements.totalFollowing.textContent = Helpers.formatNumber(followingTotal);
    }
    if (elements.totalFollowers) {
      elements.totalFollowers.textContent = Helpers.formatNumber(followersTotal);
    }
    if (elements.totalMutuals) {
      elements.totalMutuals.textContent = Helpers.formatNumber(mutualsTotal);
    }
    if (elements.summaryFollowBack) {
      elements.summaryFollowBack.textContent = reset ? "0" : data.notFollowingBack?.length || 0;
    }

    // Saldo líquido
    const net = followingTotal - followersTotal;
    if (elements.netBalance) {
      elements.netBalance.textContent = net > 0 
        ? `+${Helpers.formatNumber(net)}` 
        : Helpers.formatNumber(net);
    }

    // Texto de insight
    if (elements.insightText) {
      elements.insightText.textContent = this._buildInsightMessage(data, reset);
    }

    // Progresso de mútuos
    this._updateProgress(mutualsTotal, followingTotal, followersTotal, reset);
  }

  /**
   * Constrói mensagem de insight
   * @param {Object} data - Dados do estado
   * @param {boolean} reset - Se deve resetar  
   * @returns {string} Mensagem de insight
   * @private
   */
  _buildInsightMessage(data, reset) {
    if (reset) return "Faça upload para ver as sugestões.";
    
    const pending = data.notFollowingBack?.length || 0;
    const awaiting = data.notFollowedBack?.length || 0;
    const mutuals = data.mutuals?.length || 0;
    
    if (pending && awaiting) {
      return `Você segue ${Helpers.formatNumber(pending)} perfis que não retribuem e tem ${Helpers.formatNumber(awaiting)} seguidores aguardando follow.`;
    }
    if (pending) {
      return `Você segue ${Helpers.formatNumber(pending)} perfil(is) que ainda não retribuíram. Avalie ajustes.`;
    }
    if (awaiting) {
      return `Há ${Helpers.formatNumber(awaiting)} seguidor(es) que você ainda não segue. Que tal retribuir?`;
    }
    if (mutuals) {
      return `Excelente! ${Helpers.formatNumber(mutuals)} conexão(ões) estão em equilíbrio com você.`;
    }
    
    return "Resultados prontos; explore as abas para detalhes.";
  }

  /**
   * Atualiza barra de progresso de mútuos
   * @param {number} mutualsTotal - Total de mútuos
   * @param {number} followingTotal - Total seguindo
   * @param {number} followersTotal - Total de seguidores
   * @param {boolean} reset - Se deve resetar
   * @private
   */
  _updateProgress(mutualsTotal, followingTotal, followersTotal, reset) {
    const { mutualProgress } = this._elements;
    if (!mutualProgress) return;
    
    const base = Math.max(followingTotal, followersTotal, 1);
    const percent = reset ? 0 : Math.min(100, Math.round((mutualsTotal / base) * 100));
    
    mutualProgress.style.width = `${percent}%`;
    mutualProgress.textContent = `${percent}%`;
    mutualProgress.setAttribute("aria-valuenow", percent.toString());
  }

  /**
   * Atualiza feedback do filtro
   * @param {number} matches - Número de itens que correspondem ao filtro
   * @param {number} total - Total de itens
   * @param {string} activeView - Visualização ativa
   * @param {string} filter - Filtro atual
   */
  updateFilterFeedback(matches, total, activeView, filter) {
    const { filterFeedback } = this._elements;
    if (!filterFeedback) return;
    
    if (!filter) {
      filterFeedback.classList.add("d-none");
      filterFeedback.textContent = "";
      return;
    }
    
    const label = this._viewLabels[activeView] || "lista";
    filterFeedback.classList.remove("d-none");
    filterFeedback.textContent = `Filtro ativo: mostrando ${Helpers.formatNumber(matches)} de ${Helpers.formatNumber(total)} perfis em "${label}".`;
  }

  /**
   * Atualiza estado dos botões de ação
   * @param {Object} data - Dados do estado
   */
  updateActionButtons(data) {
    const views = ["notFollowingBack", "notFollowedBack", "mutuals"];
    const hasAny = views.some((view) => (data[view]?.length || 0) > 0);
    const elements = this._elements;

    if (elements.copyCurrent) elements.copyCurrent.disabled = !hasAny;
    if (elements.clearBtn) elements.clearBtn.disabled = !hasAny;

    views.forEach((view) => {
      const hasItems = (data[view]?.length || 0) > 0;
      
      // Botões de exportação
      const exportBtn = elements.exportButtons[view];
      if (exportBtn) exportBtn.disabled = !hasItems;
      
      // Botões de cópia
      elements.copyButtons.forEach((button) => {
        if (button.dataset.copy === view) {
          button.disabled = !hasItems;
        }
      });
    });
  }

  /**
   * Mostra seção de resultados
   */
  showResults() {
    const { resultsSection } = this._elements;
    if (resultsSection) {
      resultsSection.classList.remove("d-none");
    }
  }

  /**
   * Esconde seção de resultados
   */
  hideResults() {
    const { resultsSection } = this._elements;
    if (resultsSection) {
      resultsSection.classList.add("d-none");
    }
  }

  /**
   * Faz scroll para seção de resultados
   */
  scrollToResults() {
    const { resultsSection } = this._elements;
    if (!resultsSection) return;
    
    requestAnimationFrame(() => {
      resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  /**
   * Reseta interface para estado inicial
   */
  resetInterface() {
    const elements = this._elements;
    
    // Limpa listas
    Object.values(elements.list).forEach((container) => {
      if (container) container.innerHTML = "";
    });
    
    // Reseta contadores
    [...Object.values(elements.counts), ...Object.values(elements.tabCounts)].forEach((countEl) => {
      if (countEl) countEl.textContent = "0";
    });
    
    // Limpa campo de busca
    if (elements.searchInput) elements.searchInput.value = "";
    if (elements.sortSelect) elements.sortSelect.value = "asc";
    
    // Limpa input de arquivo
    if (elements.fileInput) elements.fileInput.value = "";
    
    // Esconde elementos
    this.hideResults();
    this.hideResultNotice();
    this.clearError();
    
    // Reseta para primeira aba
    if (elements.tabButtons.length) {
      const firstTab = elements.tabButtons[0];
      if (window.bootstrap?.Tab && firstTab) {
        window.bootstrap.Tab.getOrCreateInstance(firstTab).show();
      }
    }
  }
}