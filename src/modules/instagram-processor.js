import { Helpers } from '../utils/helpers.js';

/**
 * Processador de arquivos do Instagram
 */
export class InstagramProcessor {
  /**
   * Processa arquivos do Instagram (JSON ou ZIP)
   * @param {FileList|Array} files - Lista de arquivos
   * @returns {Promise<Object>} Dados processados {followers, following}
   */
  static async processFiles(files) {
    if (!files || !files.length) {
      throw new Error('Nenhum arquivo fornecido');
    }

    let jsonMap = {};
    const zipFile = Array.from(files).find((file) =>
      file.name.toLowerCase().endsWith(".zip")
    );

    if (zipFile) {
      jsonMap = await this._extractFromZip(zipFile);
    } else {
      jsonMap = await this._extractFromFiles(files);
    }

    if (!Object.keys(jsonMap).length) {
      throw new Error(
        "Não encontramos JSONs válidos. Envie o ZIP completo ou os arquivos da pasta connections."
      );
    }

    return this._normalizeData(jsonMap);
  }

  /**
   * Extrai JSONs de arquivo ZIP
   * @param {File} file - Arquivo ZIP
   * @returns {Promise<Object>} Mapeamento de JSONs
   * @private
   */
  static async _extractFromZip(file) {
    if (typeof JSZip === "undefined") {
      throw new Error(
        "Biblioteca de descompactação indisponível. Recarregue a página e tente novamente."
      );
    }

    const zip = await JSZip.loadAsync(file);
    const entries = {};
    
    const promises = Object.keys(zip.files).map(async (path) => {
      const entry = zip.files[path];
      if (entry.dir || !path.toLowerCase().endsWith(".json")) {
        return;
      }

      try {
        const data = await entry.async("string");
        entries[path] = JSON.parse(data);
      } catch (error) {
        console.warn(`Ignorando JSON inválido no ZIP: ${path}`, error);
      }
    });

    await Promise.all(promises);
    return entries;
  }

  /**
   * Extrai JSONs de lista de arquivos
   * @param {FileList|Array} files - Lista de arquivos
   * @returns {Promise<Object>} Mapeamento de JSONs
   * @private
   */
  static async _extractFromFiles(files) {
    const entries = {};
    
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith(".json")) continue;
      
      try {
        const text = await file.text();
        entries[file.name] = JSON.parse(text);
      } catch (error) {
        console.warn(`Ignorando arquivo JSON inválido: ${file.name}`, error);
      }
    }
    
    return entries;
  }

  /**
   * Normaliza dados do mapeamento JSON
   * @param {Object} jsonMap - Mapeamento de JSONs extraídos
   * @returns {Object} Dados normalizados {followers, following}
   * @private
   */
  static _normalizeData(jsonMap) {
    const paths = Object.keys(jsonMap);
    const followers = new Set();
    const following = new Set();
    
    // Padrões para identificar tipos de arquivo
    const followerPattern = /(followers|relationships_followers)/i;
    const followingPattern = /(following|relationships_following)/i;

    // Primeira tentativa: usar nome do arquivo
    paths.forEach((path) => {
      const payload = jsonMap[path];
      
      if (followerPattern.test(path)) {
        this._extractUsers(payload).forEach((handle) => {
          if (handle) followers.add(handle);
        });
      } else if (followingPattern.test(path)) {
        this._extractUsers(payload).forEach((handle) => {
          if (handle) following.add(handle);
        });
      }
    });

    // Fallback: analisar estrutura de dados se não encontrou por nome
    if (!followers.size || !following.size) {
      Object.values(jsonMap).forEach((payload) => {
        if (!payload || typeof payload !== "object") return;
        
        // Estrutura alternativa com propriedades diretas
        if (Array.isArray(payload.followers)) {
          payload.followers.forEach((entry) => {
            const handle = this._extractHandle(entry);
            if (handle) followers.add(handle);
          });
        }
        
        if (Array.isArray(payload.following)) {
          payload.following.forEach((entry) => {
            const handle = this._extractHandle(entry);
            if (handle) following.add(handle);
          });
        }
      });
    }

    return { followers, following };
  }

  /**
   * Extrai usuários de estrutura de dados do Instagram
   * @param {Object} obj - Objeto com dados do Instagram
   * @returns {Array} Lista de usernames
   * @private
   */
  static _extractUsers(obj) {
    if (!obj || typeof obj !== "object") return [];
    
    const collected = [];
    const stack = [obj];
    
    while (stack.length) {
      const current = stack.pop();
      if (!current || typeof current !== "object") continue;
      
      if (Array.isArray(current)) {
        current.forEach((item) => stack.push(item));
        continue;
      }

      // Procura por string_list_data (formato padrão do Instagram)
      if (current.string_list_data && Array.isArray(current.string_list_data)) {
        current.string_list_data.forEach((item) => {
          const handle = Helpers.normalizeHandle(item?.value || item?.href);
          if (handle) collected.push(handle);
        });
      }

      // Procura por propriedades diretas
      ['username', 'value', 'href'].forEach(prop => {
        if (typeof current[prop] === "string") {
          const handle = Helpers.normalizeHandle(current[prop]);
          if (handle) collected.push(handle);
        }
      });

      // Continua buscando recursivamente
      Object.keys(current).forEach((key) => {
        if (key !== "string_list_data") {
          stack.push(current[key]);
        }
      });
    }
    
    return collected;
  }

  /**
   * Extrai handle de entrada individual
   * @param {Object} entry - Entrada individual
   * @returns {string} Username normalizado
   * @private
   */
  static _extractHandle(entry) {
    if (!entry) return '';
    
    return Helpers.normalizeHandle(
      entry?.string_list_data?.[0]?.value ||
      entry?.value ||
      entry?.username ||
      entry?.href
    );
  }
}