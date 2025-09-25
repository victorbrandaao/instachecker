(function () {
  const $ = (sel) => document.querySelector(sel);
  const fileInput = $("#fileInput");
  const uploader = $("#uploader");
  const pickBtn = $("#pickBtn");
  const statusEl = $("#status");
  const errorEl = $("#error");
  const results = $("#results");
  const listA = $("#listA");
  const listB = $("#listB");
  const listC = $("#listC");
  const countA = $("#countA");
  const countB = $("#countB");
  const countC = $("#countC");
  const exportA = $("#exportA");
  const exportB = $("#exportB");
  const exportC = $("#exportC");

  let followers = new Set();
  let following = new Set();

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = "block";
  }
  function clearError() {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }

  pickBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) await handleFiles(files);
  });
  uploader.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploader.classList.add("dragging");
  });
  uploader.addEventListener("dragleave", () =>
    uploader.classList.remove("dragging")
  );
  uploader.addEventListener("drop", async (e) => {
    e.preventDefault();
    uploader.classList.remove("dragging");
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) await handleFiles(files);
  });

  function diffSets(aSet, bSet) {
    const res = [];
    aSet.forEach((v) => {
      if (!bSet.has(v)) res.push(v);
    });
    return res.sort();
  }

  function render() {
    const notFollowingBack = diffSets(following, followers);
    const notFollowedBack = diffSets(followers, following);
    const mutuals = [];
    followers.forEach((u) => {
      if (following.has(u)) mutuals.push(u);
    });
    mutuals.sort();

    fillList(listA, notFollowingBack);
    countA.textContent = notFollowingBack.length;
    fillList(listB, notFollowedBack);
    countB.textContent = notFollowedBack.length;
    fillList(listC, mutuals);
    countC.textContent = mutuals.length;

    exportA.onclick = () =>
      exportCSV(notFollowingBack, "nao_te_segue_de_volta.csv");
    exportB.onclick = () => exportCSV(notFollowedBack, "voce_nao_segue.csv");
    exportC.onclick = () => exportCSV(mutuals, "mutuos.csv");
  }

  function fillList(container, arr) {
    container.innerHTML = "";
    arr.forEach((u) => {
      const div = document.createElement("div");
      div.className = "pill";
      div.textContent = "@" + u;
      container.appendChild(div);
    });
  }

  function exportCSV(rows, filename) {
    const csv = ["username"].concat(rows).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleFiles(files) {
    clearError();
    statusEl.textContent = "Processando...";
    try {
      const sets = await parseInstagramFiles(files);
      followers = sets.followers;
      following = sets.following;
      if (!followers.size && !following.size)
        throw new Error(
          "Não foi possível localizar listas de seguidores/seguindo nos arquivos fornecidos."
        );
      results.style.display = "grid";
      render();
    } catch (e) {
      console.error(e);
      showError(e?.message || "Falha ao processar o arquivo.");
    } finally {
      statusEl.textContent =
        "Arraste e solte o ZIP/JSON aqui, ou clique para selecionar.";
    }
  }

  // Parsing logic (ZIP or JSONs)
  async function parseInstagramFiles(files) {
    const zipFile = files.find((f) => f.name.toLowerCase().endsWith(".zip"));
    if (zipFile) {
      const zip = await JSZip.loadAsync(zipFile);
      const jsonMap = {};
      const fileNames = Object.keys(zip.files);
      for (const name of fileNames) {
        if (name.toLowerCase().endsWith(".json") && !zip.files[name].dir) {
          const data = await zip.files[name].async("string");
          try {
            jsonMap[name] = JSON.parse(data);
          } catch {}
        }
      }
      return normalizeFromJsonMap(jsonMap);
    } else {
      const jsonMap = {};
      for (const f of files) {
        if (f.name.toLowerCase().endsWith(".json")) {
          const txt = await f.text();
          try {
            jsonMap[f.name] = JSON.parse(txt);
          } catch {}
        }
      }
      return normalizeFromJsonMap(jsonMap);
    }
  }

  function extractFromStringListData(obj) {
    if (!obj || typeof obj !== "object") return [];
    const results = [];
    const stack = [obj];
    while (stack.length) {
      const cur = stack.pop();
      if (!cur || typeof cur !== "object") continue;
      if (Array.isArray(cur)) {
        for (const it of cur) stack.push(it);
        continue;
      }
      if (cur.string_list_data && Array.isArray(cur.string_list_data)) {
        for (const it of cur.string_list_data) {
          if (it && typeof it.value === "string") {
            let v = it.value.trim();
            v = v.replace(/^@/, "");
            const m = v.match(/instagram\.com\/(.+?)(?:\/?$|\?|#)/i);
            if (m) v = m[1];
            results.push(v.toLowerCase());
          }
        }
      } else {
        for (const k of Object.keys(cur)) stack.push(cur[k]);
      }
    }
    return results;
  }

  function normalizeFromJsonMap(jsonMap) {
    const paths = Object.keys(jsonMap);
    const followerPaths = paths.filter((p) =>
      /followers|relationships_followers/i.test(p)
    );
    const followingPaths = paths.filter((p) =>
      /following|relationships_following/i.test(p)
    );

    const followers = new Set();
    const following = new Set();

    for (const p of followerPaths) {
      const users = extractFromStringListData(jsonMap[p]);
      users.forEach((u) => followers.add(u));
    }
    for (const p of followingPaths) {
      const users = extractFromStringListData(jsonMap[p]);
      users.forEach((u) => following.add(u));
    }

    return { followers, following };
  }
})();
