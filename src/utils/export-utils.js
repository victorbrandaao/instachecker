import { Helpers } from './helpers.js';

/**
 * Utilitários para exportação e cópia de dados
 */
export class ExportUtils {
  /**
   * Copia lista para área de transferência
   * @param {Array} data - Dados para copiar
   * @param {Function} showNotice - Callback para exibir notificação
   * @returns {Promise<void>}
   */
  static async copyToClipboard(data, showNotice) {
    if (!data?.length) {
      showNotice("Não há perfis disponíveis nesta lista.", "warning");
      return;
    }

    const payload = data.map((username) => `@${username}`).join("\n");
    
    try {
      // Tenta usar API moderna do clipboard
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        // Fallback para método antigo
        const success = this._fallbackCopy(payload);
        if (!success) throw new Error("Clipboard indisponível");
      }
      
      showNotice(
        `Copiamos ${Helpers.formatNumber(data.length)} perfil(is) para a área de transferência.`,
        "success"
      );
    } catch (error) {
      console.error('Erro ao copiar:', error);
      
      // Tenta fallback mesmo em caso de erro
      const success = this._fallbackCopy(payload);
      if (success) {
        showNotice(
          `Copiamos ${Helpers.formatNumber(data.length)} perfil(is) para a área de transferência.`,
          "success"
        );
      } else {
        showNotice(
          "Não foi possível copiar automaticamente. Copie manualmente o CSV exportado.",
          "danger"
        );
      }
    }
  }

  /**
   * Método fallback para cópia usando comando execCommand (legacy)
   * @param {string} text - Texto para copiar
   * @returns {boolean} Sucesso da operação
   * @private
   */
  static _fallbackCopy(text) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      
      return success;
    } catch (error) {
      console.error("Fallback copy failed:", error);
      return false;
    }
  }

  /**
   * Exporta dados como arquivo CSV
   * @param {Array} data - Dados para exportar
   * @param {string} filename - Nome do arquivo
   * @param {Function} showNotice - Callback para exibir notificação
   */
  static exportCSV(data, filename, showNotice) {
    if (!data?.length) {
      showNotice("Não há dados para exportar nesta categoria.", "warning");
      return;
    }

    const rows = ["username,profile_url"];
    
    data.forEach((username) => {
      const handleCell = this._toCsvCell(username);
      const urlCell = this._toCsvCell(`https://instagram.com/${username}`);
      rows.push(`${handleCell},${urlCell}`);
    });

    this._downloadBlob(
      rows.join("\n"), 
      filename, 
      "text/csv;charset=utf-8;"
    );
    
    showNotice(
      `Exportamos ${Helpers.formatNumber(data.length)} linha(s) para ${filename}.`,
      "success"
    );
  }

  /**
   * Converte valor para célula CSV escapada
   * @param {*} value - Valor para converter
   * @returns {string} Célula CSV escapada
   * @private
   */
  static _toCsvCell(value) {
    const str = String(value ?? "");
    return `"${str.replace(/"/g, '""')}"`;
  }

  /**
   * Baixa conteúdo como blob
   * @param {string} content - Conteúdo do arquivo
   * @param {string} filename - Nome do arquivo
   * @param {string} type - Tipo MIME
   * @private
   */
  static _downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    
    // Limpa URL temporária
    URL.revokeObjectURL(url);
  }
}