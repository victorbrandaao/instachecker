/**
 * Gerenciador de estado da aplicação
 */
export class StateManager {
  constructor() {
    this.reset();
    this._subscribers = {};
  }

  /**
   * Reseta o estado para valores iniciais
   */
  reset() {
    this._state = {
      followers: new Set(),
      following: new Set(),
      notFollowingBack: [],
      notFollowedBack: [],
      mutuals: [],
      isProcessing: false,
      error: null,
    };

    this._viewState = {
      active: "notFollowingBack",
      filter: "",
      sort: "asc",
    };

    this.emit("stateChanged", this._state);
  }

  /**
   * Obtém uma cópia do estado atual
   * @returns {Object} Estado atual
   */
  getState() {
    return { ...this._state };
  }

  /**
   * Obtém o estado da visualização
   * @returns {Object} Estado da visualização
   */
  getViewState() {
    return { ...this._viewState };
  }

  /**
   * Atualiza dados de seguidores e seguindo
   * @param {Object} data - Dados com followers e following
   */
  setInstagramData(data) {
    this._state.followers = data.followers;
    this._state.following = data.following;
    this._computeRelationships();
    this.emit("dataUpdated", this._state);
  }

  /**
   * Calcula relacionamentos entre seguidores e seguindo
   * @private
   */
  _computeRelationships() {
    const { followers, following } = this._state;

    // Quem você segue mas não te segue de volta
    this._state.notFollowingBack = [];
    following.forEach((user) => {
      if (!followers.has(user)) {
        this._state.notFollowingBack.push(user);
      }
    });

    // Quem te segue mas você não segue de volta
    this._state.notFollowedBack = [];
    followers.forEach((user) => {
      if (!following.has(user)) {
        this._state.notFollowedBack.push(user);
      }
    });

    // Seguidores mútuos
    this._state.mutuals = [];
    followers.forEach((user) => {
      if (following.has(user)) {
        this._state.mutuals.push(user);
      }
    });

    // Ordena as listas
    this._state.notFollowingBack.sort((a, b) => a.localeCompare(b));
    this._state.notFollowedBack.sort((a, b) => a.localeCompare(b));
    this._state.mutuals.sort((a, b) => a.localeCompare(b));
  }

  /**
   * Define o status de processamento
   * @param {boolean} isProcessing - Se está processando
   */
  setProcessing(isProcessing) {
    this._state.isProcessing = isProcessing;
    this.emit("processingChanged", isProcessing);
  }

  /**
   * Define erro
   * @param {string|null} error - Mensagem de erro ou null
   */
  setError(error) {
    this._state.error = error;
    this.emit("errorChanged", error);
  }

  /**
   * Atualiza filtro de visualização
   * @param {string} filter - Novo filtro
   */
  setFilter(filter) {
    this._viewState.filter = filter.trim().toLowerCase();
    this.emit("filterChanged", this._viewState.filter);
  }

  /**
   * Atualiza ordenação
   * @param {string} sort - Tipo de ordenação
   */
  setSort(sort) {
    this._viewState.sort = sort;
    this.emit("sortChanged", sort);
  }

  /**
   * Define visualização ativa
   * @param {string} view - Nome da visualização
   */
  setActiveView(view) {
    this._viewState.active = view;
    this.emit("viewChanged", view);
  }

  /**
   * Obtém dados de uma visualização específica
   * @param {string} view - Nome da visualização
   * @returns {Array} Dados da visualização
   */
  getViewData(view) {
    return [...(this._state[view] || [])];
  }

  /**
   * Verifica se há dados disponíveis
   * @returns {boolean} True se há dados
   */
  hasData() {
    return this._state.followers.size > 0 || this._state.following.size > 0;
  }

  /**
   * Registra callback para evento
   * @param {string} event - Nome do evento
   * @param {Function} callback - Função callback
   */
  on(event, callback) {
    if (!this._subscribers[event]) {
      this._subscribers[event] = [];
    }
    this._subscribers[event].push(callback);
  }

  /**
   * Remove callback de evento
   * @param {string} event - Nome do evento
   * @param {Function} callback - Função callback
   */
  off(event, callback) {
    if (!this._subscribers[event]) return;

    const index = this._subscribers[event].indexOf(callback);
    if (index > -1) {
      this._subscribers[event].splice(index, 1);
    }
  }

  /**
   * Emite evento para subscribers
   * @param {string} event - Nome do evento
   * @param {*} data - Dados do evento
   * @private
   */
  emit(event, data) {
    if (!this._subscribers[event]) return;

    this._subscribers[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Erro em callback do evento ${event}:`, error);
      }
    });
  }
}
