import { StateManager } from './modules/state-manager.js';
import { UIManager } from './modules/ui-manager.js';
import { InstagramProcessor } from './modules/instagram-processor.js';
import { Helpers } from './utils/helpers.js';
import { ExportUtils } from './utils/export-utils.js';

/**
 * Controlador principal da aplicação InstaChecker
 */
export class InstaCheckerApp {
  constructor() {
    this.state = new StateManager();
    this.ui = new UIManager();
    this._setupEventListeners();
    this._bindStateEvents();
  }

  /**
   * Inicializa a aplicação
   */
  init() {
    console.log('InstaChecker iniciado');
    this.ui.resetStatus();
    
    // Reset inicial
    this.state.reset();
  }

  /**
   * Configura event listeners da UI
   * @private
   */
  _setupEventListeners() {
    const elements = this.ui.getElements();

    // Upload de arquivos
    this._setupFileUpload(elements);
    
    // Controles de filtro e ordenação
    this._setupFilters(elements);
    
    // Abas
    this._setupTabs(elements);
    
    // Botões de ação
    this._setupActionButtons(elements);
  }

  /**
   * Configura upload de arquivos
   * @param {Object} elements - Elementos da UI
   * @private
   */
  _setupFileUpload(elements) {
    // Input de arquivo
    if (elements.fileInput) {
      elements.fileInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length) {
          this._handleFiles(files);
        }
      });
    }

    // Botão de seleção
    if (elements.pickBtn) {
      elements.pickBtn.addEventListener('click', () => {
        elements.fileInput?.click();
      });
    }

    // Drag and drop
    if (elements.uploader) {
      // Eventos de drag
      ["dragenter", "dragover"].forEach((evt) => {
        elements.uploader.addEventListener(evt, (event) => {
          event.preventDefault();
          elements.uploader.classList.add("dragging");
        });
      });

      ["dragleave", "dragend"].forEach((evt) => {
        elements.uploader.addEventListener(evt, () =>
          elements.uploader.classList.remove("dragging")
        );
      });

      // Drop
      elements.uploader.addEventListener("drop", async (event) => {
        event.preventDefault();
        elements.uploader.classList.remove("dragging");
        
        const files = Array.from(event.dataTransfer?.files || []);
        if (files.length) {
          await this._handleFiles(files);
        }
      });
    }
  }

  /**
   * Configura filtros e ordenação
   * @param {Object} elements - Elementos da UI
   * @private
   */
  _setupFilters(elements) {
    // Campo de busca com debounce
    if (elements.searchInput) {
      const debouncedSearch = Helpers.debounce((value) => {
        this.state.setFilter(value);
      }, 200);

      elements.searchInput.addEventListener('input', (event) => {
        debouncedSearch(event.target.value || '');
      });
    }

    // Seletor de ordenação
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', (event) => {
        this.state.setSort(event.target.value);
      });
    }
  }

  /**
   * Configura abas
   * @param {Object} elements - Elementos da UI
   * @private
   */
  _setupTabs(elements) {
    elements.tabButtons.forEach((button) => {
      // Evento do Bootstrap
      button.addEventListener('shown.bs.tab', (event) => {
        const view = event.target.dataset.view;
        if (view) {
          this.state.setActiveView(view);
        }
      });

      // Fallback para clique direto
      button.addEventListener('click', (event) => {
        const view = event.currentTarget.dataset.view;
        if (view) {
          this.state.setActiveView(view);
        }
      });
    });
  }

  /**
   * Configura botões de ação
   * @param {Object} elements - Elementos da UI
   * @private
   */
  _setupActionButtons(elements) {
    // Botões de cópia específicos
    elements.copyButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const view = button.dataset.copy;
        if (view) {
          this._copyList(view, false);
        }
      });
    });

    // Cópia da visualização atual
    if (elements.copyCurrent) {
      elements.copyCurrent.addEventListener('click', () => {
        const viewState = this.state.getViewState();
        this._copyList(viewState.active, true);
      });
    }

    // Botão limpar
    if (elements.clearBtn) {
      elements.clearBtn.addEventListener('click', () => {
        this._clearResults();
      });
    }

    // Botões de exportação
    Object.entries(elements.exportButtons).forEach(([view, button]) => {
      if (button) {
        button.addEventListener('click', () => {
          this._exportCSV(view);
        });
      }
    });
  }

  /**
   * Vincula eventos do estado
   * @private
   */
  _bindStateEvents() {
    // Quando dados são atualizados
    this.state.on('dataUpdated', (data) => {
      this._renderData(data);
      this.ui.setStatusSuccess();
      this.ui.showResultNotice(
        `Processamos ${Helpers.formatNumber(data.following.size)} seguindo(s) e ${Helpers.formatNumber(data.followers.size)} seguidore(s).`,
        'success'
      );
      this.ui.scrollToResults();
    });

    // Quando processamento muda
    this.state.on('processingChanged', (isProcessing) => {
      this.ui.setUploaderEnabled(!isProcessing);
      if (isProcessing) {
        this.ui.setStatusProcessing();
      }
    });

    // Quando erro muda
    this.state.on('errorChanged', (error) => {
      if (error) {
        this.ui.showError(error);
        this.ui.showResultNotice(
          'Não foi possível processar estes arquivos. Revise o tutorial e tente novamente.',
          'danger'
        );
        this.ui.resetStatus();
      } else {
        this.ui.clearError();
      }
    });

    // Quando filtro, ordenação ou visualização mudam
    ['filterChanged', 'sortChanged', 'viewChanged'].forEach(event => {
      this.state.on(event, () => {
        this._updateCurrentView();
      });
    });
  }

  /**
   * Processa arquivos do usuário
   * @param {Array} files - Lista de arquivos
   * @private
   */
  async _handleFiles(files) {
    if (!files.length) return;

    // Limpa estado anterior
    this.ui.clearError();
    this.ui.hideResultNotice();
    
    // Reseta filtros
    const elements = this.ui.getElements();
    if (elements.searchInput) elements.searchInput.value = '';
    this.state.setFilter('');

    try {
      this.state.setProcessing(true);
      
      // Processa arquivos
      const data = await InstagramProcessor.processFiles(files);
      
      // Valida dados
      if (!data.followers.size && !data.following.size) {
        throw new Error(
          'Não encontramos dados de seguidores ou seguindo. Confira se enviou o ZIP completo ou os JSONs da pasta connections.'
        );
      }

      // Atualiza estado
      this.state.setInstagramData(data);
      
      // Limpa input
      if (elements.fileInput) elements.fileInput.value = '';
      
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      this.state.setError(error?.message || 'Falha ao processar o arquivo.');
    } finally {
      this.state.setProcessing(false);
    }
  }

  /**
   * Renderiza dados na interface
   * @param {Object} data - Dados do estado
   * @private
   */
  _renderData(data) {
    // Mostra seção de resultados
    this.ui.showResults();
    
    // Atualiza resumo
    this.ui.updateSummary(data);
    
    // Atualiza botões
    this.ui.updateActionButtons(data);
    
    // Atualiza visualização atual
    this._updateCurrentView();
  }

  /**
   * Atualiza a visualização atual com filtros
   * @private
   */
  _updateCurrentView() {
    const state = this.state.getState();
    const viewState = this.state.getViewState();
    const views = ['notFollowingBack', 'notFollowedBack', 'mutuals'];
    
    let activeMatches = 0;
    let activeTotal = 0;

    // Atualiza todas as visualizações
    views.forEach((view) => {
      const rawData = state[view] || [];
      const processedData = this._getPreparedData(view, rawData, viewState);
      
      if (view === viewState.active) {
        activeMatches = processedData.length;
        activeTotal = rawData.length;
      }
      
      // Atualiza lista
      this.ui.updateList(view, processedData, viewState.filter);
      
      // Atualiza contadores
      this.ui.updateCounts(view, processedData.length, rawData.length);
    });

    // Atualiza feedback do filtro
    this.ui.updateFilterFeedback(
      activeMatches,
      activeTotal,
      viewState.active,
      viewState.filter
    );
  }

  /**
   * Prepara dados para visualização (filtro + ordenação)
   * @param {string} view - Nome da visualização
   * @param {Array} rawData - Dados brutos
   * @param {Object} viewState - Estado da visualização
   * @returns {Array} Dados processados
   * @private
   */
  _getPreparedData(view, rawData, viewState) {
    if (!rawData.length) return [];
    
    // Copia e ordena
    let data = Helpers.sortData([...rawData], viewState.sort);
    
    // Aplica filtro se existir
    if (viewState.filter) {
      const term = viewState.filter.toLowerCase();
      data = data.filter((username) => 
        username.toLowerCase().includes(term)
      );
    }
    
    return data;
  }

  /**
   * Copia lista para área de transferência
   * @param {string} view - Nome da visualização
   * @param {boolean} useFilter - Se deve usar filtro atual
   * @private
   */
  async _copyList(view, useFilter) {
    const state = this.state.getState();
    const viewState = this.state.getViewState();
    
    let data;
    if (useFilter) {
      data = this._getPreparedData(view, state[view] || [], viewState);
    } else {
      data = state[view] || [];
    }

    await ExportUtils.copyToClipboard(data, (message, type) => {
      this.ui.showResultNotice(message, type);
    });
  }

  /**
   * Exporta dados como CSV
   * @param {string} view - Nome da visualização
   * @private
   */
  _exportCSV(view) {
    const state = this.state.getState();
    const data = state[view] || [];
    
    const filenames = {
      notFollowingBack: 'nao_te_segue_de_volta.csv',
      notFollowedBack: 'voce_nao_segue.csv',
      mutuals: 'mutuos.csv'
    };
    
    ExportUtils.exportCSV(data, filenames[view], (message, type) => {
      this.ui.showResultNotice(message, type);
    });
  }

  /**
   * Limpa resultados
   * @private
   */
  _clearResults() {
    this.state.reset();
    this.ui.resetInterface();
    this.ui.resetStatus();
    
    this.ui.showResultNotice(
      'Resultados limpos. Faça um novo upload para reprocessar.',
      'info'
    );
  }
}