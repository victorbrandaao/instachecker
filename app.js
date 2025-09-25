(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const dom = {
    fileInput: $("#fileInput"),
    uploader: $("#uploader"),
    pickBtn: $("#pickBtn"),
    status: $("#status"),
    error: $("#error"),
    resultsSection: $("#results"),
    list: {
      notFollowingBack: $("#listA"),
      notFollowedBack: $("#listB"),
      mutuals: $("#listC"),
    },
    counts: {
      notFollowingBack: $("#countA"),
      notFollowedBack: $("#countB"),
      mutuals: $("#countC"),
    },
    summaryFollowBack: $("#summaryFollowBack"),
    totalFollowing: $("#totalFollowing"),
    totalFollowers: $("#totalFollowers"),
    totalMutuals: $("#totalMutuals"),
    netBalance: $("#netBalance"),
    insightText: $("#insightText"),
    mutualProgress: $("#mutualProgress"),
    resultNotice: $("#resultNotice"),
    filterFeedback: $("#filterFeedback"),
    tabCounts: {
      notFollowingBack: $("#tabCountA"),
      notFollowedBack: $("#tabCountB"),
      mutuals: $("#tabCountC"),
    },
    searchInput: $("#searchInput"),
    sortSelect: $("#sortSelect"),
    copyCurrent: $("#copyCurrent"),
    clearBtn: $("#clearBtn"),
  };
  dom.copyButtons = $$("[data-copy]");
  dom.tabButtons = $$("button[data-view]");
  dom.exportButtons = {
    notFollowingBack: $("#exportA"),
    notFollowedBack: $("#exportB"),
    mutuals: $("#exportC"),
  };

  const defaultStatusHTML = dom.status ? dom.status.innerHTML : "";
  let statusTimeout = null;
  let noticeTimeout = null;

  const state = {
    followers: new Set(),
    following: new Set(),
    notFollowingBack: [],
    notFollowedBack: [],
    mutuals: [],
  };

  const viewState = {
    active: "notFollowingBack",
    sort: "asc",
    filter: "",
  };

  const viewLabels = {
    notFollowingBack: "Quem não segue de volta",
    notFollowedBack: "Te seguem sem follow",
    mutuals: "Seguidores em comum",
  };

  const emptyMessages = {
    notFollowingBack:
      "Nenhum perfil pendente por aqui. Faça um novo upload ou ajuste o filtro.",
    notFollowedBack: "Ainda não há seguidores aguardando follow de volta.",
    mutuals: "Sem registros de seguidores em comum neste momento.",
  };

  init();

  function init() {
    bindUploader();
    bindControls();
    resetResults(false);
    resetStatus();
    clearError();
  }

  function bindUploader() {
    if (dom.pickBtn) {
      dom.pickBtn.addEventListener("click", () => dom.fileInput?.click());
    }
    if (dom.fileInput) {
      dom.fileInput.addEventListener("change", async (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length) {
          await handleFiles(files);
        }
      });
    }
    if (dom.uploader) {
      ["dragenter", "dragover"].forEach((evt) => {
        dom.uploader.addEventListener(evt, (event) => {
          event.preventDefault();
          dom.uploader.classList.add("dragging");
        });
      });
      ["dragleave", "dragend"].forEach((evt) => {
        dom.uploader.addEventListener(evt, () =>
          dom.uploader.classList.remove("dragging")
        );
      });
      dom.uploader.addEventListener("drop", async (event) => {
        event.preventDefault();
        dom.uploader.classList.remove("dragging");
        const files = Array.from(event.dataTransfer?.files || []);
        if (files.length) {
          await handleFiles(files);
        }
      });
    }
  }

  function bindControls() {
    if (dom.searchInput) {
      const debounced = debounce((value) => {
        viewState.filter = value.trim().toLowerCase();
        applyFilters();
      }, 200);
      dom.searchInput.addEventListener("input", (event) => {
        debounced(event.target.value || "");
      });
    }

    if (dom.sortSelect) {
      dom.sortSelect.addEventListener("change", (event) => {
        viewState.sort = event.target.value;
        applyFilters();
      });
    }

    dom.tabButtons.forEach((button) => {
      button.addEventListener("shown.bs.tab", (event) => {
        const view = event.target.dataset.view;
        if (view) {
          viewState.active = view;
          applyFilters();
        }
      });
      button.addEventListener("click", (event) => {
        const view = event.currentTarget.dataset.view;
        if (view) {
          viewState.active = view;
          applyFilters();
        }
      });
    });

    dom.copyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const view = button.dataset.copy;
        if (view) {
          copyList(view, view === viewState.active);
        }
      });
    });

    if (dom.copyCurrent) {
      dom.copyCurrent.addEventListener("click", () =>
        copyList(viewState.active, true)
      );
    }

    if (dom.clearBtn) {
      dom.clearBtn.addEventListener("click", () => {
        resetResults(true);
        resetStatus();
        clearError();
      });
    }

    if (dom.exportButtons.notFollowingBack) {
      dom.exportButtons.notFollowingBack.addEventListener("click", () =>
        exportCSV(state.notFollowingBack, "nao_te_segue_de_volta.csv")
      );
    }
    if (dom.exportButtons.notFollowedBack) {
      dom.exportButtons.notFollowedBack.addEventListener("click", () =>
        exportCSV(state.notFollowedBack, "voce_nao_segue.csv")
      );
    }
    if (dom.exportButtons.mutuals) {
      dom.exportButtons.mutuals.addEventListener("click", () =>
        exportCSV(state.mutuals, "mutuos.csv")
      );
    }
  }

  function showError(message) {
    if (!dom.error) return;
    dom.error.textContent = message;
    dom.error.style.display = "block";
    dom.error.classList.add("show");
  }

  function clearError() {
    if (!dom.error) return;
    dom.error.textContent = "";
    dom.error.style.display = "none";
    dom.error.classList.remove("show");
  }

  async function handleFiles(files) {
    if (!files.length) return;
    clearError();
    hideResultNotice();
    if (dom.searchInput) dom.searchInput.value = "";
    viewState.filter = "";
    updateFilterFeedback(0, state[viewState.active]?.length || 0);
    setUploaderEnabled(false);
    setStatusProcessing();
    try {
      const parsed = await parseInstagramFiles(files);
      state.followers = parsed.followers;
      state.following = parsed.following;

      if (!state.followers.size && !state.following.size) {
        throw new Error(
          "Não encontramos dados de seguidores ou seguindo. Confira se enviou o ZIP completo ou os JSONs da pasta connections."
        );
      }

      renderData();
      setStatusSuccess();
      showResultNotice(
        `Processamos ${formatNumber(
          state.following.size
        )} seguindo(s) e ${formatNumber(state.followers.size)} seguidore(s).`,
        "success"
      );
      if (dom.fileInput) dom.fileInput.value = "";
      scrollToResults();
    } catch (error) {
      console.error(error);
      showError(error?.message || "Falha ao processar o arquivo.");
      showResultNotice(
        "Não foi possível processar estes arquivos. Revise o tutorial e tente novamente.",
        "danger"
      );
      resetStatus();
    } finally {
      setUploaderEnabled(true);
    }
  }

  function renderData() {
    state.notFollowingBack = diffSets(state.following, state.followers);
    state.notFollowedBack = diffSets(state.followers, state.following);
    state.mutuals = intersectSets(state.followers, state.following);

    if (dom.summaryFollowBack) {
      dom.summaryFollowBack.textContent =
        state.notFollowingBack.length.toString();
    }

    if (dom.resultsSection) {
      dom.resultsSection.classList.remove("d-none");
    }

    updateSummary();
    updateActionButtons();
    applyFilters();
  }

  function applyFilters() {
    const highlight = viewState.filter;
    const views = ["notFollowingBack", "notFollowedBack", "mutuals"];
    let activeMatches = 0;
    let activeTotal = state[viewState.active]?.length || 0;

    views.forEach((view) => {
      const data = getPreparedData(view);
      if (view === viewState.active) {
        activeMatches = data.length;
        activeTotal = state[view].length;
      }
      fillList(dom.list[view], data, highlight, view);
      updateCountDisplay(view, data.length, state[view].length);
    });

    updateFilterFeedback(activeMatches, activeTotal);
  }

  function getPreparedData(view) {
    const source = Array.isArray(state[view]) ? [...state[view]] : [];
    if (!source.length) return [];
    const sorted = sortData(source);
    if (!viewState.filter) return sorted;
    const term = viewState.filter;
    return sorted.filter((username) => username.includes(term));
  }

  function sortData(arr) {
    const collator = new Intl.Collator("pt-BR");
    switch (viewState.sort) {
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

  function fillList(container, arr, highlightTerm = "", view) {
    if (!container) return;
    container.innerHTML = "";
    if (!arr.length) {
      const message = document.createElement("p");
      message.className = "empty-message";
      message.textContent = emptyMessages[view] || "Nenhum perfil encontrado.";
      container.appendChild(message);
      return;
    }
    arr.forEach((username) => {
      const link = document.createElement("a");
      link.className = "pill";
      link.href = `https://instagram.com/${encodeURIComponent(username)}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.innerHTML = formatUsername(username, highlightTerm);
      container.appendChild(link);
    });
  }

  function formatUsername(username, term) {
    if (!term) return `@${escapeHtml(username)}`;
    const lower = username.toLowerCase();
    const query = term.toLowerCase();
    let start = 0;
    let result = "";
    while (true) {
      const index = lower.indexOf(query, start);
      if (index === -1) {
        result += escapeHtml(username.slice(start));
        break;
      }
      if (index > start) {
        result += escapeHtml(username.slice(start, index));
      }
      const match = username.slice(index, index + term.length);
      result += `<mark>${escapeHtml(match)}</mark>`;
      start = index + term.length;
    }
    return `@${result}`;
  }

  function updateSummary(reset = false) {
    const followingTotal = reset ? 0 : state.following.size;
    const followersTotal = reset ? 0 : state.followers.size;
    const mutualsTotal = reset ? 0 : state.mutuals.length;

    if (dom.totalFollowing)
      dom.totalFollowing.textContent = formatNumber(followingTotal);
    if (dom.totalFollowers)
      dom.totalFollowers.textContent = formatNumber(followersTotal);
    if (dom.totalMutuals)
      dom.totalMutuals.textContent = formatNumber(mutualsTotal);

    const net = followingTotal - followersTotal;
    if (dom.netBalance) {
      dom.netBalance.textContent =
        net > 0 ? `+${formatNumber(net)}` : formatNumber(net);
    }
    if (dom.insightText) {
      dom.insightText.textContent = buildInsightMessage(reset);
    }
    updateProgress(mutualsTotal, followingTotal, followersTotal, reset);
  }

  function buildInsightMessage(reset) {
    if (reset) return "Faça upload para ver as sugestões.";
    const pending = state.notFollowingBack.length;
    const awaiting = state.notFollowedBack.length;
    const mutuals = state.mutuals.length;
    if (pending && awaiting) {
      return `Você segue ${formatNumber(
        pending
      )} perfis que não retribuem e tem ${formatNumber(
        awaiting
      )} seguidores aguardando follow.`;
    }
    if (pending) {
      return `Você segue ${formatNumber(
        pending
      )} perfil(is) que ainda não retribuíram. Avalie ajustes.`;
    }
    if (awaiting) {
      return `Há ${formatNumber(
        awaiting
      )} seguidor(es) que você ainda não segue. Que tal retribuir?`;
    }
    if (mutuals) {
      return `Excelente! ${formatNumber(
        mutuals
      )} conexão(ões) estão em equilíbrio com você.`;
    }
    return "Resultados prontos; explore as abas para detalhes.";
  }

  function updateProgress(mutualsTotal, followingTotal, followersTotal, reset) {
    if (!dom.mutualProgress) return;
    const base = Math.max(followingTotal, followersTotal, 1);
    const percent = reset
      ? 0
      : Math.min(100, Math.round((mutualsTotal / base) * 100));
    dom.mutualProgress.style.width = `${percent}%`;
    dom.mutualProgress.textContent = `${percent}%`;
    dom.mutualProgress.setAttribute("aria-valuenow", percent.toString());
  }

  function updateCountDisplay(view, visibleCount, totalCount) {
    if (dom.counts[view]) {
      dom.counts[view].textContent =
        viewState.filter && visibleCount !== totalCount
          ? `${visibleCount}/${totalCount}`
          : totalCount.toString();
    }
    if (dom.tabCounts[view]) {
      dom.tabCounts[view].textContent = totalCount.toString();
    }
  }

  function updateFilterFeedback(matches, total) {
    if (!dom.filterFeedback) return;
    if (!viewState.filter) {
      dom.filterFeedback.classList.add("d-none");
      dom.filterFeedback.textContent = "";
      return;
    }
    const label = viewLabels[viewState.active] || "lista";
    dom.filterFeedback.classList.remove("d-none");
    dom.filterFeedback.textContent = `Filtro ativo: mostrando ${formatNumber(
      matches
    )} de ${formatNumber(total)} perfis em "${label}".`;
  }

  function updateActionButtons() {
    const views = ["notFollowingBack", "notFollowedBack", "mutuals"];
    const hasAny = views.some((view) => state[view].length > 0);

    if (dom.copyCurrent) dom.copyCurrent.disabled = !hasAny;
    if (dom.clearBtn) dom.clearBtn.disabled = !hasAny;

    views.forEach((view) => {
      const hasItems = state[view].length > 0;
      const exportBtn = dom.exportButtons[view];
      if (exportBtn) exportBtn.disabled = !hasItems;
      dom.copyButtons.forEach((button) => {
        if (button.dataset.copy === view) {
          button.disabled = !hasItems;
        }
      });
    });
  }

  function diffSets(source, comparator) {
    const result = [];
    source.forEach((value) => {
      if (!comparator.has(value)) result.push(value);
    });
    return result.sort((a, b) => a.localeCompare(b));
  }

  function intersectSets(aSet, bSet) {
    const result = [];
    aSet.forEach((value) => {
      if (bSet.has(value)) result.push(value);
    });
    return result.sort((a, b) => a.localeCompare(b));
  }

  async function copyList(view, useFilter) {
    const dataset = useFilter ? getPreparedData(view) : state[view] || [];
    if (!dataset.length) {
      showResultNotice("Não há perfis disponíveis nesta lista.", "warning");
      return;
    }
    const payload = dataset.map((username) => `@${username}`).join("\n");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const success = fallbackCopy(payload);
        if (!success) throw new Error("Clipboard indisponível");
      }
      showResultNotice(
        `Copiamos ${formatNumber(
          dataset.length
        )} perfil(is) para a área de transferência.`,
        "success"
      );
    } catch (error) {
      console.error(error);
      const success = fallbackCopy(payload);
      if (success) {
        showResultNotice(
          `Copiamos ${formatNumber(
            dataset.length
          )} perfil(is) para a área de transferência.`,
          "success"
        );
      } else {
        showResultNotice(
          "Não foi possível copiar automaticamente. Copie manualmente o CSV exportado.",
          "danger"
        );
      }
    }
  }

  function fallbackCopy(text) {
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
      console.error("Fallback copy failed", error);
      return false;
    }
  }

  function exportCSV(data, filename) {
    if (!data || !data.length) {
      showResultNotice(
        "Não há dados para exportar nesta categoria.",
        "warning"
      );
      return;
    }
    const rows = ["username,profile_url"];
    data.forEach((username) => {
      const handleCell = toCsvCell(username);
      const urlCell = toCsvCell(`https://instagram.com/${username}`);
      rows.push(`${handleCell},${urlCell}`);
    });
    downloadBlob(rows.join("\n"), filename, "text/csv;charset=utf-8;");
    showResultNotice(
      `Exportamos ${formatNumber(data.length)} linha(s) para ${filename}.`,
      "success"
    );
  }

  function toCsvCell(value) {
    const str = String(value ?? "");
    return `"${str.replace(/"/g, '""')}"`;
  }

  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function setUploaderEnabled(enabled) {
    if (dom.pickBtn) dom.pickBtn.disabled = !enabled;
    if (dom.uploader) dom.uploader.classList.toggle("busy", !enabled);
  }

  function setStatusProcessing() {
    setStatus(
      '<span class="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></span> <span class="ms-2">Processando arquivos...</span>',
      false
    );
  }

  function setStatusSuccess() {
    setStatus(
      '<i class="fa-solid fa-circle-check text-success"></i> <span class="ms-2">Tudo certo! Confira os resultados abaixo ou envie novos arquivos.</span>',
      true
    );
  }

  function resetStatus() {
    setStatus(defaultStatusHTML, false);
  }

  function setStatus(html, autoReset) {
    if (!dom.status) return;
    if (statusTimeout) {
      clearTimeout(statusTimeout);
      statusTimeout = null;
    }
    dom.status.innerHTML = html;
    if (autoReset) {
      statusTimeout = setTimeout(() => {
        dom.status.innerHTML = defaultStatusHTML;
        statusTimeout = null;
      }, 4000);
    }
  }

  function showResultNotice(message, type = "success", timeout = 4000) {
    if (!dom.resultNotice || !message) return;
    dom.resultNotice.classList.remove(
      "d-none",
      "alert-success",
      "alert-info",
      "alert-warning",
      "alert-danger"
    );
    dom.resultNotice.classList.add(`alert-${type}`);
    dom.resultNotice.textContent = message;
    if (noticeTimeout) {
      clearTimeout(noticeTimeout);
      noticeTimeout = null;
    }
    if (timeout > 0) {
      noticeTimeout = setTimeout(() => {
        hideResultNotice();
      }, timeout);
    }
  }

  function hideResultNotice() {
    if (!dom.resultNotice) return;
    dom.resultNotice.classList.add("d-none");
    dom.resultNotice.textContent = "";
    if (noticeTimeout) {
      clearTimeout(noticeTimeout);
      noticeTimeout = null;
    }
  }

  function resetResults(showMessage = false) {
    state.followers = new Set();
    state.following = new Set();
    state.notFollowingBack = [];
    state.notFollowedBack = [];
    state.mutuals = [];

    if (dom.resultsSection) dom.resultsSection.classList.add("d-none");
    Object.values(dom.list).forEach((container) => {
      if (container) container.innerHTML = "";
    });
    Object.values(dom.counts).forEach((countEl) => {
      if (countEl) countEl.textContent = "0";
    });
    Object.values(dom.tabCounts).forEach((countEl) => {
      if (countEl) countEl.textContent = "0";
    });

    if (dom.summaryFollowBack) dom.summaryFollowBack.textContent = "0";

    viewState.filter = "";
    viewState.sort = "asc";
    if (dom.searchInput) dom.searchInput.value = "";
    if (dom.sortSelect) dom.sortSelect.value = "asc";
    if (dom.filterFeedback) {
      dom.filterFeedback.classList.add("d-none");
      dom.filterFeedback.textContent = "";
    }

    if (dom.tabButtons.length) {
      const first = dom.tabButtons[0];
      viewState.active = first?.dataset.view || "notFollowingBack";
      if (window.bootstrap?.Tab && first) {
        window.bootstrap.Tab.getOrCreateInstance(first).show();
      } else {
        dom.tabButtons.forEach((button, index) => {
          const targetSelector = button.getAttribute("data-bs-target");
          button.classList.toggle("active", index === 0);
          const panel = targetSelector ? $(targetSelector) : null;
          if (panel) {
            panel.classList.toggle("show", index === 0);
            panel.classList.toggle("active", index === 0);
          }
        });
      }
    } else {
      viewState.active = "notFollowingBack";
    }

    updateSummary(true);
    updateActionButtons();
    hideResultNotice();
    clearError();

    if (dom.fileInput) dom.fileInput.value = "";

    if (showMessage) {
      showResultNotice(
        "Resultados limpos. Faça um novo upload para reprocessar.",
        "info"
      );
    }
  }

  function scrollToResults() {
    if (!dom.resultsSection) return;
    requestAnimationFrame(() => {
      dom.resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  async function parseInstagramFiles(files) {
    let jsonMap = {};
    const zipFile = files.find((file) =>
      file.name.toLowerCase().endsWith(".zip")
    );
    if (zipFile) {
      if (typeof JSZip === "undefined") {
        throw new Error(
          "Biblioteca de descompactação indisponível. Recarregue a página e tente novamente."
        );
      }
      jsonMap = await extractJsonFromZip(zipFile);
    } else {
      jsonMap = await extractJsonFromFiles(files);
    }

    if (!Object.keys(jsonMap).length) {
      throw new Error(
        "Não encontramos JSONs válidos. Envie o ZIP completo ou os arquivos da pasta connections."
      );
    }

    const { followers, following } = normalizeFromJsonMap(jsonMap);
    return { followers, following };
  }

  async function extractJsonFromZip(file) {
    const zip = await JSZip.loadAsync(file);
    const entries = {};
    const promises = Object.keys(zip.files).map(async (path) => {
      const entry = zip.files[path];
      if (entry.dir) return;
      if (!path.toLowerCase().endsWith(".json")) return;
      try {
        const data = await entry.async("string");
        entries[path] = JSON.parse(data);
      } catch (error) {
        console.warn(`Ignorando JSON inválido dentro do ZIP: ${path}`, error);
      }
    });
    await Promise.all(promises);
    return entries;
  }

  async function extractJsonFromFiles(files) {
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

  function normalizeFromJsonMap(jsonMap) {
    const paths = Object.keys(jsonMap);
    const followers = new Set();
    const following = new Set();
    const followerPattern = /(followers|relationships_followers)/i;
    const followingPattern = /(following|relationships_following)/i;

    paths.forEach((path) => {
      const payload = jsonMap[path];
      if (followerPattern.test(path)) {
        extractFromStringListData(payload).forEach((handle) => {
          if (handle) followers.add(handle);
        });
      } else if (followingPattern.test(path)) {
        extractFromStringListData(payload).forEach((handle) => {
          if (handle) following.add(handle);
        });
      }
    });

    if (!followers.size || !following.size) {
      Object.values(jsonMap).forEach((payload) => {
        if (!payload || typeof payload !== "object") return;
        if (Array.isArray(payload.followers)) {
          payload.followers.forEach((entry) => {
            const handle = normalizeHandle(
              entry?.string_list_data?.[0]?.value ||
                entry?.value ||
                entry?.username
            );
            if (handle) followers.add(handle);
          });
        }
        if (Array.isArray(payload.following)) {
          payload.following.forEach((entry) => {
            const handle = normalizeHandle(
              entry?.string_list_data?.[0]?.value ||
                entry?.value ||
                entry?.username
            );
            if (handle) following.add(handle);
          });
        }
      });
    }

    return { followers, following };
  }

  function extractFromStringListData(obj) {
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
      if (current.string_list_data && Array.isArray(current.string_list_data)) {
        current.string_list_data.forEach((item) => {
          const handle = normalizeHandle(item?.value || item?.href);
          if (handle) collected.push(handle);
        });
      }
      if (typeof current.username === "string") {
        const handle = normalizeHandle(current.username);
        if (handle) collected.push(handle);
      }
      if (typeof current.value === "string") {
        const handle = normalizeHandle(current.value);
        if (handle) collected.push(handle);
      }
      if (typeof current.href === "string") {
        const handle = normalizeHandle(current.href);
        if (handle) collected.push(handle);
      }
      Object.keys(current).forEach((key) => {
        if (key !== "string_list_data") stack.push(current[key]);
      });
    }
    return collected;
  }

  function normalizeHandle(value) {
    if (!value || typeof value !== "string") return "";
    let handle = value.trim();
    if (!handle) return "";

    handle = handle.replace(/^@+/, "");
    handle = handle.replace(/^https?:\/\//i, "");

    const instagramMatch = handle.match(/^instagram\.com\/(.+)$/i);
    if (instagramMatch) {
      handle = instagramMatch[1];
    }

    handle = handle.split(/[?#]/)[0];
    handle = handle.replace(/\/+$/, "");

    if (typeof handle.normalize === "function") {
      handle = handle.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }

    handle = handle.toLowerCase();
    handle = handle.replace(/[^a-z0-9._]/g, "");
    return handle;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("pt-BR");
  }

  function debounce(fn, delay = 200) {
    let timer;
    return (value) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(value), delay);
    };
  }
})();
