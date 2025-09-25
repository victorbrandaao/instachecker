/**
 * Utilitários gerais para formatação e manipulação
 */
export class Helpers {
  /**
   * Escapa caracteres HTML especiais
   * @param {string} value - Texto a ser escapado
   * @returns {string} Texto escapado
   */
  static escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Formata números no padrão brasileiro
   * @param {number|string} value - Número a ser formatado
   * @returns {string} Número formatado
   */
  static formatNumber(value) {
    return Number(value || 0).toLocaleString("pt-BR");
  }

  /**
   * Cria função debounced
   * @param {Function} fn - Função a ser executada
   * @param {number} delay - Delay em millisegundos
   * @returns {Function} Função debounced
   */
  static debounce(fn, delay = 200) {
    let timer;
    return (value) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(value), delay);
    };
  }

  /**
   * Normaliza username do Instagram
   * @param {string} value - Username bruto
   * @returns {string} Username normalizado
   */
  static normalizeHandle(value) {
    if (!value || typeof value !== "string") return "";

    let handle = value.trim();
    if (!handle) return "";

    // Remove @ inicial
    handle = handle.replace(/^@+/, "");

    // Remove protocolo
    handle = handle.replace(/^https?:\/\//i, "");

    // Extrai username de URL do Instagram
    const instagramMatch = handle.match(/^instagram\.com\/(.+)$/i);
    if (instagramMatch) {
      handle = instagramMatch[1];
    }

    // Remove query params e hash
    handle = handle.split(/[?#]/)[0];

    // Remove trailing slashes
    handle = handle.replace(/\/+$/, "");

    // Normaliza caracteres especiais
    if (typeof handle.normalize === "function") {
      handle = handle.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }

    // Converte para lowercase e remove caracteres inválidos
    handle = handle.toLowerCase();
    handle = handle.replace(/[^a-z0-9._]/g, "");

    return handle;
  }

  /**
   * Calcula diferença entre dois sets
   * @param {Set} source - Set de origem
   * @param {Set} comparator - Set para comparar
   * @returns {Array} Array com a diferença
   */
  static diffSets(source, comparator) {
    const result = [];
    source.forEach((value) => {
      if (!comparator.has(value)) result.push(value);
    });
    return result.sort((a, b) => a.localeCompare(b));
  }

  /**
   * Calcula interseção entre dois sets
   * @param {Set} aSet - Primeiro set
   * @param {Set} bSet - Segundo set
   * @returns {Array} Array com a interseção
   */
  static intersectSets(aSet, bSet) {
    const result = [];
    aSet.forEach((value) => {
      if (bSet.has(value)) result.push(value);
    });
    return result.sort((a, b) => a.localeCompare(b));
  }

  /**
   * Ordena array de strings conforme critério
   * @param {Array} arr - Array a ser ordenado
   * @param {string} sortType - Tipo de ordenação (asc, desc, len, len-desc)
   * @returns {Array} Array ordenado
   */
  static sortData(arr, sortType = "asc") {
    const collator = new Intl.Collator("pt-BR");
    switch (sortType) {
      case "desc":
        return arr.sort((a, b) => collator.compare(b, a));
      case "len":
        return arr.sort(
          (a, b) => a.length - b.length || collator.compare(a, b)
        );
      case "len-desc":
        return arr.sort(
          (a, b) => b.length - a.length || collator.compare(a, b)
        );
      default:
        return arr.sort((a, b) => collator.compare(a, b));
    }
  }

  /**
   * Formata username com destaque de termo de busca
   * @param {string} username - Username a ser formatado
   * @param {string} term - Termo de busca para destacar
   * @returns {string} HTML com username formatado
   */
  static formatUsername(username, term) {
    if (!term) return `@${Helpers.escapeHtml(username)}`;

    const lower = username.toLowerCase();
    const query = term.toLowerCase();
    let start = 0;
    let result = "";

    while (true) {
      const index = lower.indexOf(query, start);
      if (index === -1) {
        result += Helpers.escapeHtml(username.slice(start));
        break;
      }
      if (index > start) {
        result += Helpers.escapeHtml(username.slice(start, index));
      }
      const match = username.slice(index, index + term.length);
      result += `<mark>${Helpers.escapeHtml(match)}</mark>`;
      start = index + term.length;
    }

    return `@${result}`;
  }
}
