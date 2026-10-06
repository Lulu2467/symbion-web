/* Symbion UX v3 */

(function () {
  const views = {
    home: document.getElementById("view-home"),
    docs: document.getElementById("view-docs"),
    desk: document.getElementById("view-desk"),
    chat: document.getElementById("view-chat"),
    cosmo: document.getElementById("view-cosmo"),
    symbion: document.getElementById("view-symbion"),
    browser: document.getElementById("view-browser"),
    account: document.getElementById("view-account"),
    people: document.getElementById("view-people"),
  };
  const railBtns = document.querySelectorAll(".rail-btn[data-view]");
  const omnibox = document.getElementById("omnibox-input");
  const toastEl = document.getElementById("toast");
  let toastTimer;

  function setDates() {
    const d = new Date();
    const el = document.getElementById("sched-date");
    if (el) el.textContent = `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  }

  function showToast(msg) {
    if (!msg) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2200);
  }

  let deskPanel = "calendar";

  function setRail(name) {
    railBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.view === name);
    });
  }

  const place = { name: "home", desk: "calendar", chat: "", kind: "group", owner: "Citta", tab: "profile", section: "" };
  const history = [];
  let histAt = -1;
  let replaying = false;

  function placeKey(item) {
    return [item.name, item.desk, item.chat, item.owner, item.tab, item.section || "", item.url || ""].join("|");
  }

  function placeUrl(item) {
    if (item.name === "browser") return item.url || "";
    if (item.name === "home") return "symbion://home";
    if (item.name === "docs") return "symbion://docs";
    if (item.name === "desk") return deskUrls[item.desk] || "symbion://desk";
    if (item.name === "chat") return item.chat ? `symbion://messages/${encodeURIComponent(item.chat)}` : "symbion://messages";
    if (item.name === "cosmo") return "symbion://cosmo";
    if (item.name === "symbion") return "symbion://symbion";
    if (item.name === "account") return item.section ? `symbion://account/${item.section}` : "symbion://account";
    if (item.name === "people") return "symbion://people";
    return "symbion://home";
  }

  const tabs = [];
  let activeTab = 0;
  let tabSeq = 0;

  function blankPlace() {
    return { name: "browser", desk: "kanban", chat: "", kind: "group", owner: "Citta", tab: "profile", section: "", url: "" };
  }

  function tabTitle(item) {
    if (!item || (item.name === "browser" && !item.url)) return "新标签";
    if (item.name === "home") return "首页";
    if (item.name === "docs") return "云文档";
    if (item.name === "desk") {
      return { kanban: "看板", calendar: "日历", email: "邮件", ledger: "账本", drive: "网盘", mycosmo: "My Cosmo" }[item.desk] || "工作台";
    }
    if (item.name === "chat") return item.chat || "消息";
    if (item.name === "cosmo") return "数字人";
    if (item.name === "symbion") return "Citta";
    if (item.name === "account") return "账号";
    if (item.name === "people") return "好友和群聊管理";
    if (item.name === "browser") {
      try {
        const host = new URL(item.url).host.replace(/^www\./, "");
        if (host === "scholar.google.com") return "Scholar";
        if (host === "arxiv.org") return "arXiv";
        if (host === "notion.so") return "Notion";
        return host;
      } catch (_) { return "新标签"; }
    }
    return "新标签";
  }

  function renderTabs() {
    const list = document.getElementById("chrome-tablist");
    if (!list) return;
    list.replaceChildren();
    tabs.forEach((tab) => {
      const row = document.createElement("div");
      const on = place.name === "browser" && tab.id === activeTab;
      row.className = "chrome-tab" + (on ? " is-on" : "");
      row.setAttribute("role", "tab");
      row.setAttribute("aria-selected", on ? "true" : "false");
      row.dataset.tabId = String(tab.id);
      const label = document.createElement("button");
      label.type = "button";
      label.className = "chrome-tab-label";
      label.textContent = tabTitle(tab.place);
      const close = document.createElement("button");
      close.type = "button";
      close.className = "chrome-tab-x";
      close.setAttribute("aria-label", "关闭标签");
      close.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>';
      row.append(label, close);
      list.appendChild(row);
    });
  }

  function syncActiveTab() {
    if (place.name !== "browser") {
      renderTabs();
      return;
    }
    let tab = tabs.find((item) => item.id === activeTab);
    if (!tab) {
      tab = { id: ++tabSeq, place: { ...place } };
      tabs.push(tab);
      activeTab = tab.id;
    } else {
      tab.place = { ...place };
    }
    renderTabs();
  }

  function showBlank() {
    Object.assign(place, blankPlace());
    showView("browser");
    setRail("");
    const host = document.getElementById("browser-host");
    const title = document.getElementById("browser-title");
    const body = document.getElementById("browser-body");
    const url = document.getElementById("browser-url");
    if (host) host.textContent = "";
    if (title) title.textContent = "新标签";
    if (body) {
      body.replaceChildren();
      const line = document.createElement("p");
      line.className = "browser-lead";
      line.textContent = "搜索和网址在上面的地址栏。";
      const marks = document.createElement("div");
      marks.className = "ntp-marks";
      [
        ["Scholar", "https://scholar.google.com/"],
        ["arXiv", "https://arxiv.org/"],
        ["Notion", "https://www.notion.so/"],
      ].forEach(([name, href]) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ntp-mark";
        const strong = document.createElement("strong");
        strong.textContent = name;
        const host = document.createElement("em");
        host.textContent = new URL(href).host.replace(/^www\./, "");
        btn.append(strong, host);
        btn.addEventListener("click", () => openBrowser(href));
        marks.appendChild(btn);
      });
      body.append(line, marks);
    }
    if (url) url.textContent = "";
    const hint = document.querySelector("#view-browser .summon-hint");
    if (hint) hint.hidden = true;
    commitPlace();
  }

  function addTab() {
    const tab = { id: ++tabSeq, place: blankPlace() };
    tabs.push(tab);
    activeTab = tab.id;
    showBlank();
    if (omnibox) omnibox.focus();
  }

  function openInNewTab(input) {
    const viewingBlank = place.name === "browser" && !place.url;
    if (!viewingBlank) {
      const tab = { id: ++tabSeq, place: blankPlace() };
      tabs.push(tab);
      activeTab = tab.id;
    }
    openBrowser(input);
  }

  function selectTab(id) {
    const tab = tabs.find((item) => item.id === id);
    if (!tab || tab.id === activeTab) return;
    activeTab = tab.id;
    replay(tab.place);
  }

  function closeTab(id) {
    const index = tabs.findIndex((item) => item.id === id);
    if (index < 0) return;
    const wasActive = tabs[index].id === activeTab;
    tabs.splice(index, 1);
    if (!tabs.length) {
      activeTab = 0;
      renderTabs();
      go("home");
      return;
    }
    if (wasActive) {
      const next = tabs[Math.min(index, tabs.length - 1)];
      activeTab = next.id;
      replay(next.place);
      return;
    }
    renderTabs();
  }

  function paintHist() {
    const back = document.getElementById("hist-back");
    const fwd = document.getElementById("hist-fwd");
    if (back) back.disabled = histAt <= 0;
    if (fwd) fwd.disabled = histAt >= history.length - 1;
  }

  function commitPlace() {
    if (omnibox) omnibox.value = placeUrl(place);
    paintBookmarks();
    syncActiveTab();
    if (replaying) return;
    const key = placeKey(place);
    if (history[histAt] && placeKey(history[histAt]) === key) {
      paintHist();
      return;
    }
    history.splice(histAt + 1);
    history.push({ ...place });
    histAt = history.length - 1;
    paintHist();
  }

  function showView(name) {
    Object.entries(views).forEach(([viewName, el]) => {
      if (el) el.classList.toggle("is-active", viewName === name);
    });
  }

  const chatLogs = new Map([
    ["Wuhan Branch Team", [
      { who: "周宁", text: "周三的组会纪要放在 Shared 里了。" },
      { who: "你", text: "我先看纪要。周报等我批准再发。" },
      { who: "周宁", text: "纪要在 Shared。周四 16:00 还等你同意。" },
    ]],
    ["Research_Test", [
      { who: "你", text: "对完再改文件，先别覆盖原来的那份。" },
      { who: "Research_Test", text: "第 3 篇第 12 页和第 18 页对不上。" },
    ]],
    ["周宁", [
      { who: "你", text: "周五前对完页码。" },
      { who: "周宁", text: "讲义我标了三处，你看一眼就行。" },
    ]],
  ]);
  const chatTimes = {
    "Wuhan Branch Team": "昨天 16:20",
    "Research_Test": "今天 11:04",
    "周宁": "今天 09:12",
  };
  const chatNotes = new Map();
  let openChatName = "";

  function chatMark(name) {
    if (name === "Wuhan Branch Team") return "WB";
    if (name === "Research_Test") return "RT";
    if (name === "周宁") return "周";
    if (name === "你") return "YX";
    return name.slice(0, 1);
  }

  function renderChat(name) {
    const log = document.getElementById("chat-log");
    if (!log) return;
    const items = chatLogs.get(name) || [];
    log.replaceChildren();
    const stamp = document.createElement("p");
    stamp.className = "msg-time";
    stamp.textContent = chatTimes[name] || "";
    log.appendChild(stamp);
    if (!items.length) {
      const note = document.createElement("p");
      note.className = "dm-note";
      note.textContent = chatNotes.get(name) || "这里只显示你现在写下的内容，不编造历史消息。";
      log.appendChild(note);
      return;
    }
    items.forEach((item) => {
      const who = typeof item === "string" ? "你" : item.who;
      const text = typeof item === "string" ? item : item.text;
      const mine = who === "你";
      const row = document.createElement("div");
      row.className = mine ? "msg me" : "msg";
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      const body = document.createElement("p");
      body.textContent = text;
      if (mine) {
        const av = document.createElement("span");
        av.className = "msg-av";
        av.textContent = chatMark(who);
        bubble.appendChild(body);
        row.append(bubble, av);
      } else {
        const av = document.createElement("span");
        av.className = "msg-av";
        av.textContent = chatMark(who);
        const meta = document.createElement("div");
        meta.className = "msg-meta";
        const label = document.createElement("strong");
        label.textContent = who;
        meta.appendChild(label);
        bubble.append(meta, body);
        row.append(av, bubble);
      }
      log.appendChild(row);
    });
    log.scrollTop = log.scrollHeight;
  }

  function openChat(name, kind, opts) {
    openChatName = name;
    document.querySelectorAll(".inbox-item, .rail-chat").forEach((el) => {
      el.classList.toggle("is-on", el.dataset.chat === name);
    });
    const title = document.getElementById("chat-title");
    const kindEl = document.getElementById("chat-kind");
    if (title) title.textContent = name;
    if (kindEl) {
      const count = conversationMembers(name, kind === "dm" ? "dm" : "group").length;
      kindEl.textContent = kind === "dm" ? "私信" : `群聊 · ${count} 人`;
    }
    const empty = document.getElementById("chat-empty");
    const thread = document.getElementById("chat-thread");
    if (empty) empty.hidden = true;
    if (thread) thread.hidden = false;
    const phone = window.matchMedia("(max-width: 760px)").matches;
    if (phone && !(opts && opts.enterThread === false)) {
      document.getElementById("view-chat")?.classList.add("phone-thread");
    }
    renderChat(name);
    paintChatMembers();
    showView("chat");
    setRail("chat");
    place.name = "chat";
    place.url = "";
    place.chat = name;
    place.kind = kind || "group";
    commitPlace();
  }

  function go(name, desk, folder, extra) {
    if (name === "desk" && desk === "mycosmo") {
      go("cosmo");
      showCosmoTab("settings");
      const side = extra && extra.ownerSide;
      if (side) document.querySelector(`#owner-side [data-owner-side="${side}"]`)?.click();
      document.getElementById("own-manage")?.scrollIntoView({ block: "start" });
      return;
    }
    if (!views[name]) return;
    if (name === "cosmo") closeCosmoPerson();
    place.name = name;
    if (name !== "browser") place.url = "";
    if (name === "desk" && desk) place.desk = desk;
    if (extra && extra.owner) place.owner = extra.owner;
    if (extra && extra.tab) place.tab = extra.tab;
    place.section = extra && extra.section ? extra.section : "";
    showView(name);
    setRail(name);
    if (name === "desk") {
      if (desk) focusBench(desk, folder);
    } else if (name === "chat") {
      if (!openChatName) {
        const first = document.querySelector(".inbox-item");
        if (first) {
          openChat(first.dataset.chat, first.dataset.chatKind, { enterThread: false });
          return;
        }
      }
      place.chat = openChatName;
    } else if (name === "symbion") openSymbion(place.owner, place.tab);
    else if (name === "account") showAccount(place.section);
    else if (name === "people") paintBook();
    commitPlace();
  }

  function routeApp(address) {
    const path = address.replace(/^symbion:\/\//i, "");
    if (path.startsWith("desk")) {
      const panel = path.split("/")[1] || "calendar";
      const known = {
        kanban: "calendar",
        calendar: "calendar",
        email: "email",
        ledger: "ledger",
        drive: "drive",
        "my-cosmo": "mycosmo",
        mycosmo: "mycosmo",
      };
      go("desk", known[panel] || "calendar");
      return;
    }
    if (path.startsWith("cosmo")) {
      go("cosmo");
      return;
    }
    if (path.startsWith("docs")) {
      go("docs");
      return;
    }
    if (path.startsWith("message")) {
      go("chat");
      return;
    }
    if (path.startsWith("people") || path.startsWith("contact")) {
      go("people");
      return;
    }
    if (path.startsWith("account")) {
      go("account", undefined, undefined, { section: path.split("/")[1] || "settings" });
      return;
    }
    if (path.startsWith("symbion")) {
      go("symbion");
      return;
    }
    go("home");
  }

  function parseAddress(text) {
    const raw = String(text || "").trim();
    if (!raw) return null;
    if (/^symbion:\/\//i.test(raw)) return { kind: "app", value: raw };
    if (/^https?:\/\//i.test(raw) || /^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(raw)) {
      try {
        const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
        return { kind: "web", href: url.href, host: url.host, query: "" };
      } catch (_) { /* search instead */ }
    }
    return {
      kind: "web",
      href: `https://www.google.com/search?q=${encodeURIComponent(raw)}`,
      host: "www.google.com",
      query: raw,
    };
  }

  function browserCopy(target) {
    const host = target.host.replace(/^www\./, "");
    if (host === "scholar.google.com") {
      return {
        title: "阅读清单第 3 篇",
        lines: [
          "Research_Test · 发给 Xinyue · 今天 10:18",
          "第 12 页和第 18 页对不上。请在周五 10:00 的「页码」之前标好。",
          "文件在网盘 Google Drive / 阅读清单.pdf。",
        ],
      };
    }
    if (host === "arxiv.org") {
      return {
        title: "阅读清单第 3 篇",
        lines: [
          "预印本。页码还没对上。",
          "第 12 页：概念还停在上一节。",
          "第 18 页：例子和正文对不上。周五 10:00 之前标好。",
        ],
      };
    }
    if (host === "notion.so") {
      return {
        title: "周四的讲义",
        lines: [
          "第一节 先把概念讲短。",
          "第二节 标出还没核对的句子。",
          "改到可以发给学生。文件在网盘「讲义改稿.pptx」。",
        ],
      };
    }
    if (target.query) return { title: target.query, lines: ["这次搜索留在当前标签里。", target.href] };
    return { title: host, lines: ["这一页在 Symbion 的浏览器里打开。", target.href] };
  }

  function renderBrowser(target) {
    const copy = browserCopy(target);
    const host = document.getElementById("browser-host");
    const title = document.getElementById("browser-title");
    const body = document.getElementById("browser-body");
    const url = document.getElementById("browser-url");
    if (host) host.textContent = target.host.replace(/^www\./, "");
    if (title) title.textContent = copy.title;
    if (body) {
      body.replaceChildren();
      (copy.lines || []).forEach((line) => {
        const p = document.createElement("p");
        p.textContent = line;
        body.appendChild(p);
      });
    }
    if (url) url.textContent = target.href;
    const hint = document.querySelector("#view-browser .summon-hint");
    if (hint) hint.hidden = false;
  }

  function paintBookmarks() {
    let host = "";
    if (place.name === "browser" && place.url) {
      try { host = new URL(place.url).host.replace(/^www\./, ""); } catch (_) { host = ""; }
    }
    document.querySelectorAll("[data-bookmark]").forEach((btn) => {
      let mark = "";
      try { mark = new URL(btn.dataset.bookmark).host.replace(/^www\./, ""); } catch (_) { mark = ""; }
      btn.classList.toggle("is-on", Boolean(mark) && host === mark);
    });
  }

  function openBrowser(input) {
    const target = typeof input === "string" ? parseAddress(input) : input;
    if (!target) return;
    if (target.kind === "app") {
      routeApp(target.value);
      return;
    }
    place.name = "browser";
    place.url = target.href;
    showView("browser");
    setRail("");
    renderBrowser(target);
    commitPlace();
  }

  function routeAddress(text) {
    const target = parseAddress(text);
    if (!target) return;
    if (target.kind === "app") routeApp(target.value);
    else if (place.name !== "browser") openInNewTab(target.href);
    else openBrowser(target);
  }

  function replay(item) {
    replaying = true;
    Object.assign(place, item);
    if (item.name === "browser" && !item.url) showBlank();
    else if (item.name === "browser" && item.url) openBrowser(item.url);
    else if (item.name === "chat" && item.chat) openChat(item.chat, item.kind);
    else go(item.name, item.name === "desk" ? item.desk : undefined, undefined, { owner: item.owner, tab: item.tab, section: item.section });
    replaying = false;
    if (omnibox) omnibox.value = placeUrl(place);
    paintHist();
    paintBookmarks();
  }

  const deskUrls = {
    kanban: "symbion://desk",
    calendar: "symbion://desk/calendar",
    email: "symbion://desk/email",
    ledger: "symbion://desk/ledger",
    drive: "symbion://desk/drive",
    mycosmo: "symbion://desk/my-cosmo",
    team: "symbion://desk/team",
  };

  const benchAnchors = { mycosmo: "bench-cosmo", team: "bench-team" };

  function focusBench(panel, folderName) {
    if (!panel || panel === "kanban") panel = "calendar";
    deskPanel = panel;
    place.desk = panel;
    document.querySelectorAll("[data-desk-panel]").forEach((el) => {
      const on = el.dataset.deskPanel === deskPanel;
      el.classList.toggle("is-on", on);
      el.classList.toggle("is-focus", on);
    });
    document.querySelectorAll("#view-desk .desk-nav > [data-desk-tab]").forEach((el) => {
      const on = el.dataset.deskTab === deskPanel;
      el.classList.toggle("is-active", on);
      if (on) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
    const tools = document.getElementById("desk-tools");
    if (tools) tools.hidden = false;
    document.querySelectorAll("#desk-tools [data-desk-tab], #view-desk .desk-switch [data-desk-tab]").forEach((el) => {
      const on = el.dataset.deskTab === deskPanel;
      el.classList.toggle("is-active", on);
      if (on) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
    if (omnibox) omnibox.value = deskUrls[deskPanel] || deskUrls.kanban;
    if (deskPanel === "drive" && folderName) {
      const folder = folders.find((item) => item.name === folderName);
      if (folder) openFolder(folder);
    }
  }

  document.querySelectorAll("[data-desk-tab]").forEach((btn) => {
    btn.addEventListener("click", () => go("desk", btn.dataset.deskTab));
  });

  railBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.view === "desk") {
        go("desk", deskPanel === "kanban" ? "calendar" : deskPanel);
        return;
      }
      if (btn.dataset.view === "chat" && views.chat.classList.contains("is-active")) return;
      go(btn.dataset.view);
    });
  });

  document.querySelectorAll("[data-view]").forEach((el) => {
    if (el.classList.contains("rail-btn")) return;
    el.addEventListener("click", () => {
      if (el.dataset.view) {
        go(el.dataset.view, el.dataset.desk, el.dataset.folder, {
          owner: el.dataset.owner,
          tab: el.dataset.sym,
        });
      }
    });
  });

  document.querySelectorAll("[data-toast]").forEach((el) => {
    el.addEventListener("click", () => showToast(el.dataset.toast));
  });

  document.querySelectorAll("[data-chat]").forEach((btn) => {
    btn.addEventListener("click", () => openChat(btn.dataset.chat, btn.dataset.chatKind));
  });

  const inboxAdd = document.getElementById("inbox-add");
  const inboxMenu = document.getElementById("inbox-add-menu");
  const inboxSheet = document.getElementById("inbox-sheet");
  const groupSheet = document.getElementById("group-sheet");
  const friendSheet = document.getElementById("friend-sheet");

  function closeInboxMenu() {
    if (!inboxMenu || inboxMenu.hidden) return;
    inboxMenu.hidden = true;
    inboxAdd?.setAttribute("aria-expanded", "false");
  }

  function closeInboxSheet() {
    if (inboxSheet) inboxSheet.hidden = true;
  }

  function openInboxSheet(which) {
    closeInboxMenu();
    if (!inboxSheet) return;
    inboxSheet.hidden = false;
    if (groupSheet) groupSheet.hidden = which !== "group";
    if (friendSheet) friendSheet.hidden = which !== "friend";
    if (which === "group") paintGroupPicks();
    if (which === "friend") {
      const field = document.getElementById("friend-name");
      const result = document.getElementById("friend-result");
      if (field) field.value = "";
      if (result) result.replaceChildren();
      paintFriendNote("");
      field?.focus();
    }
  }

  function chatExists(name) {
    return Boolean(document.querySelector(`.inbox-item[data-chat="${CSS.escape(name)}"]`));
  }

  function friendNames() {
    return [...document.querySelectorAll('.inbox-item[data-chat-kind="dm"]')].map((el) => el.dataset.chat);
  }

  function syncGroupPicks() {
    const list = document.getElementById("group-picks");
    const chosen = document.getElementById("group-chosen");
    const countEl = document.getElementById("group-count");
    const done = document.getElementById("group-done");
    if (!list || !chosen) return;
    const checked = [...list.querySelectorAll("input:checked")];
    if (countEl) countEl.textContent = `已选择 ${checked.length} 人`;
    if (done) done.disabled = checked.length === 0;
    chosen.replaceChildren();
    checked.forEach((box) => {
      const row = document.createElement("div");
      row.className = "chosen-row";
      const av = document.createElement("span");
      av.className = "inbox-av";
      av.textContent = chatMark(box.value);
      const label = document.createElement("span");
      label.textContent = box.value;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.setAttribute("aria-label", `移除 ${box.value}`);
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        box.checked = false;
        syncGroupPicks();
      });
      row.append(av, label, remove);
      chosen.append(row);
    });
  }

  function paintGroupPicks() {
    const list = document.getElementById("group-picks");
    const note = document.getElementById("group-note");
    const filter = document.getElementById("group-filter");
    if (!list) return;
    list.replaceChildren();
    if (filter) filter.value = "";
    const people = friendNames();
    if (note) {
      note.textContent = people.length
        ? "勾选朋友后建立群聊。这里不编造历史消息。"
        : "还没有朋友。先添加朋友，再发起群聊。";
    }
    people.forEach((name) => {
      const row = document.createElement("label");
      row.className = "pick-row";
      const box = document.createElement("input");
      box.type = "checkbox";
      box.value = name;
      const av = document.createElement("span");
      av.className = "inbox-av";
      av.textContent = chatMark(name);
      const label = document.createElement("span");
      label.textContent = name;
      row.append(box, av, label);
      box.addEventListener("change", syncGroupPicks);
      list.append(row);
    });
    syncGroupPicks();
  }

  function paintFriendNote(name) {
    const note = document.getElementById("friend-note");
    if (!note) return;
    if (!name) {
      note.textContent = "添加后出现在左边。对方还没说话之前，这里不编造消息。";
      return;
    }
    const existing = document.querySelector(`.inbox-item[data-chat="${CSS.escape(name)}"]`);
    if (!existing) {
      note.textContent = "没有叫这个名字的会话。现有的是 Wuhan Branch Team、Research_Test、周宁。";
      return;
    }
    note.textContent = existing.dataset.chatKind === "dm" ? "已经是朋友。打开这个会话。" : "这是一个群聊。打开这个会话。";
  }

  function paintFriendResult(name) {
    const result = document.getElementById("friend-result");
    if (!result) return;
    result.replaceChildren();
    paintFriendNote(name);
    if (!name) return;
    const existing = document.querySelector(`.inbox-item[data-chat="${CSS.escape(name)}"]`);
    const row = document.createElement("div");
    row.className = "friend-hit";
    const av = document.createElement("span");
    av.className = "inbox-av";
    av.textContent = chatMark(existing ? existing.dataset.chat : name);
    const label = document.createElement("span");
    label.textContent = existing ? existing.dataset.chat : name;
    const action = document.createElement("button");
    action.type = "button";
    action.className = "inbox-sheet-go";
    if (existing) {
      action.textContent = "打开";
      action.addEventListener("click", () => {
        closeInboxSheet();
        openChat(existing.dataset.chat, existing.dataset.chatKind);
      });
    } else {
      action.textContent = "添加";
      action.addEventListener("click", () => addFriend(name));
    }
    row.append(av, label, action);
    result.append(row);
  }

  let bookSelected = "";
  let membersOpen = false;

  function inboxEntries() {
    return [...document.querySelectorAll("#view-chat .inbox-item")].map((el) => ({
      name: el.dataset.chat,
      kind: el.dataset.chatKind || "group",
      members: (el.dataset.members || "").split("、").filter(Boolean),
    }));
  }

  function groupMembers(name) {
    const entry = inboxEntries().find((item) => item.name === name);
    if (entry && entry.members.length) return ["你", ...entry.members];
    const seen = [];
    (chatLogs.get(name) || []).forEach((line) => {
      if (!line.who || line.who === "你" || line.who === name || seen.includes(line.who)) return;
      seen.push(line.who);
    });
    return ["你", ...seen];
  }

  function bookFace(name) {
    const face = document.createElement("span");
    face.className = "book-av";
    face.textContent = chatMark(name);
    return face;
  }

  function conversationKind(name) {
    return inboxEntries().find((item) => item.name === name)?.kind || "group";
  }

  function conversationMembers(name, kind) {
    if (kind === "dm") return ["你", name];
    return groupMembers(name);
  }

  function fillMembers(parent, name, kind) {
    const members = conversationMembers(name, kind);
    const list = document.createElement("ul");
    list.className = "member-list";
    members.forEach((member) => {
      const item = document.createElement("li");
      item.append(bookFace(member));
      const label = document.createElement("span");
      label.textContent = member;
      item.append(label);
      list.append(item);
    });
    parent.append(list);
    const note = document.createElement("p");
    note.className = "member-note";
    note.textContent = kind === "dm"
      ? "私信只有你们两个人。"
      : "只列出这条会话里出现过的人。添加朋友和发起群聊在消息里。";
    parent.append(note);
  }

  function paintChatMembers() {
    const pane = document.getElementById("chat-member-pane");
    const btn = document.getElementById("chat-members");
    if (!pane || !btn) return;
    const open = Boolean(openChatName) && membersOpen;
    btn.hidden = !openChatName;
    btn.classList.toggle("is-on", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    pane.hidden = !open;
    pane.replaceChildren();
    if (!open) return;
    const title = document.createElement("h2");
    title.textContent = "成员";
    pane.append(title);
    fillMembers(pane, openChatName, conversationKind(openChatName));
  }

  function paintBookDetail(entry) {
    const pane = document.getElementById("book-detail");
    if (!pane) return;
    pane.replaceChildren();
    if (!entry) {
      const quiet = document.createElement("p");
      quiet.className = "book-quiet";
      quiet.textContent = "从左边选一个群或一位好友，看里面有谁。";
      pane.append(quiet);
      return;
    }
    const panel = document.createElement("div");
    panel.className = "people-panel";
    const title = document.createElement("h1");
    title.textContent = entry.name;
    const meta = document.createElement("p");
    meta.className = "people-meta";
    const count = conversationMembers(entry.name, entry.kind).length;
    meta.textContent = entry.kind === "dm" ? "好友" : `群聊 · ${count} 人`;
    panel.append(title, meta);
    fillMembers(panel, entry.name, entry.kind);
    const open = document.createElement("button");
    open.type = "button";
    open.className = "member-open";
    open.textContent = "在消息里打开";
    open.addEventListener("click", () => {
      membersOpen = true;
      openChat(entry.name, entry.kind);
    });
    panel.append(open);
    pane.append(panel);
  }

  function paintBook() {
    const scroll = document.getElementById("book-scroll");
    const index = document.getElementById("book-index");
    const query = (document.getElementById("book-q")?.value || "").trim().toLowerCase();
    if (!scroll) return;
    if (index) index.hidden = true;
    scroll.replaceChildren();
    const entries = inboxEntries();
    const friends = entries.filter((item) => item.kind === "dm");
    const groups = entries.filter((item) => item.kind !== "dm");
    const match = (item) => !query || item.name.toLowerCase().includes(query);
    const shownGroups = groups.filter(match);
    const shownFriends = friends.filter(match);
    const section = (label) => {
      const head = document.createElement("p");
      head.className = "book-section";
      head.textContent = label;
      return head;
    };
    if (!shownGroups.length && !shownFriends.length) {
      const quiet = document.createElement("p");
      quiet.className = "book-miss";
      const names = entries.map((item) => item.name);
      quiet.textContent = names.length
        ? `没有叫这个名字的好友或群聊。现有的是 ${names.join("、")}。`
        : "还没有好友或群聊。在消息里添加之后，会出现在这里。";
      scroll.append(quiet);
    } else {
      if (shownGroups.length) scroll.append(section("群聊"), ...shownGroups.map(bookRow));
      if (shownFriends.length) scroll.append(section("好友"), ...shownFriends.map(bookRow));
    }
    paintBookDetail(entries.find((item) => item.name === bookSelected) || null);
  }

  function bookRow(entry) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "book-entry";
    if (entry.name === bookSelected) btn.classList.add("is-on");
    const name = document.createElement("strong");
    name.textContent = entry.name;
    btn.append(bookFace(entry.name), name);
    btn.addEventListener("click", () => {
      bookSelected = entry.name;
      paintBook();
    });
    return btn;
  }

  function addFriend(name) {
    const field = document.getElementById("friend-name");
    chatLogs.set(name, []);
    chatTimes[name] = "刚刚";
    chatNotes.set(name, "刚添加。对方还没说话，这里不编造消息。");
    addInboxItem(name, "dm");
    if (field) field.value = "";
    closeInboxSheet();
    openChat(name, "dm");
  }

  function addInboxItem(name, kind, members) {
    const inbox = document.querySelector("#view-chat .inbox");
    const empty = document.getElementById("inbox-empty");
    if (!inbox) return null;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "inbox-item";
    btn.dataset.chat = name;
    btn.dataset.chatKind = kind;
    if (members && members.length) btn.dataset.members = members.join("、");
    const face = document.createElement("span");
    face.className = "inbox-face";
    const av = document.createElement("span");
    av.className = "inbox-av";
    av.textContent = chatMark(name);
    face.append(av);
    const body = document.createElement("span");
    body.className = "inbox-body";
    const top = document.createElement("span");
    top.className = "inbox-top";
    const strong = document.createElement("strong");
    strong.textContent = name;
    const time = document.createElement("time");
    time.textContent = "刚刚";
    top.append(strong, time);
    const preview = document.createElement("em");
    preview.className = "preview";
    body.append(top, preview);
    btn.append(face, body);
    btn.addEventListener("click", () => openChat(name, kind));
    if (empty) inbox.insertBefore(btn, empty);
    else inbox.append(btn);
    return btn;
  }

  inboxAdd?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!inboxMenu) return;
    const open = inboxMenu.hidden;
    inboxMenu.hidden = !open;
    inboxAdd.setAttribute("aria-expanded", open ? "true" : "false");
  });

  inboxMenu?.querySelectorAll("[data-inbox-action]").forEach((btn) => {
    btn.addEventListener("click", () => openInboxSheet(btn.dataset.inboxAction));
  });

  inboxSheet?.querySelectorAll("[data-sheet-close]").forEach((btn) => {
    btn.addEventListener("click", closeInboxSheet);
  });

  document.getElementById("group-filter")?.addEventListener("input", (event) => {
    const q = event.target.value.trim().toLowerCase();
    document.querySelectorAll("#group-picks .pick-row").forEach((row) => {
      const name = row.querySelector("input")?.value.toLowerCase() || "";
      row.hidden = Boolean(q) && !name.includes(q);
    });
  });

  groupSheet?.addEventListener("submit", (event) => {
    event.preventDefault();
    const picks = [...document.querySelectorAll("#group-picks input:checked")].map((el) => el.value);
    if (!picks.length) return;
    let name = picks.join("、");
    if (chatExists(name)) name = `${name} 群聊`;
    if (chatExists(name)) {
      const note = document.getElementById("group-note");
      if (note) note.textContent = "已经有这个会话。";
      return;
    }
    chatLogs.set(name, []);
    chatTimes[name] = "刚刚";
    chatNotes.set(name, `成员：${picks.join("、")}。这里只显示你现在写下的内容，不编造历史消息。`);
    addInboxItem(name, "group", picks);
    closeInboxSheet();
    openChat(name, "group");
  });

  friendSheet?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("friend-name")?.value.trim();
    if (!name) {
      paintFriendResult("");
      return;
    }
    paintFriendResult(name);
  });

  document.getElementById("book-q")?.addEventListener("input", () => paintBook());
  document.getElementById("chat-phone-back")?.addEventListener("click", () => {
    document.getElementById("view-chat")?.classList.remove("phone-thread");
  });
  document.getElementById("chat-members")?.addEventListener("click", () => {
    membersOpen = !membersOpen;
    paintChatMembers();
  });

  document.addEventListener("click", (event) => {
    if (!inboxMenu || inboxMenu.hidden) return;
    if (event.target.closest("#inbox-add-menu") || event.target.closest("#inbox-add")) return;
    closeInboxMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeInboxMenu();
    if (inboxSheet && !inboxSheet.hidden) closeInboxSheet();
    closeGates();
  });

  document.getElementById("inbox-search")?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll(".inbox-item").forEach((item) => {
      const on = !q || item.dataset.chat.toLowerCase().includes(q);
      item.hidden = !on;
      if (on) shown += 1;
    });
    const empty = document.getElementById("inbox-empty");
    if (empty) empty.hidden = shown !== 0;
  });

  document.getElementById("chat-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const field = document.getElementById("chat-field");
    const text = field?.value.trim();
    if (!text || !openChatName) return;
    const items = chatLogs.get(openChatName) || [];
    items.push({ who: "你", text });
    chatLogs.set(openChatName, items);
    field.value = "";
    syncPreviews();
    renderChat(openChatName);
  });

  function lastLine(name) {
    const items = chatLogs.get(name) || [];
    const last = items[items.length - 1];
    if (!last) return "";
    const who = typeof last === "string" ? "你" : last.who;
    const text = typeof last === "string" ? last : last.text;
    if (!text) return "";
    if (who === "你") return `你：${text}`;
    if (who === name) return text;
    return `${who}：${text}`;
  }

  function syncPreviews() {
    document.querySelectorAll("[data-chat] .preview").forEach((el) => {
      const host = el.closest("[data-chat]");
      if (host) el.textContent = lastLine(host.dataset.chat);
    });
  }

  function gateLeft() {
    const count = document.getElementById("nod-count");
    if (count) count.textContent = String(document.querySelectorAll(".nod:not(.is-done)").length);
  }

  function finishGate(name, label) {
    const card = document.querySelector(`[data-nod="${name}"]`);
    if (!card || card.classList.contains("is-done")) return;
    card.classList.add("is-done");
    const btn = card.querySelector("[data-approve]");
    if (btn) btn.disabled = true;
    document.querySelectorAll(`[data-home-gate="${name}"]`).forEach((el) => {
      el.textContent = label || "已同意";
      el.disabled = true;
    });
    gateLeft();
  }

  function moveMeeting() {
    document.querySelectorAll("[data-meeting-when]").forEach((el) => {
      el.textContent = "周四 · 16:00";
    });
    document.querySelectorAll("[data-meeting-note]").forEach((el) => {
      el.textContent = "已改到周四 16:00。";
    });
    const card = document.querySelector("[data-cal-card='meeting']");
    const thuDay = document.querySelector('[data-cal-day="thu"] .cal-events');
    if (card && thuDay && card.parentElement !== thuDay) thuDay.prepend(card);
    document.querySelectorAll("[data-cal-when]").forEach((el) => {
      el.textContent = "16:00–17:00";
    });
    document.querySelectorAll("[data-cal-note]").forEach((el) => {
      el.textContent = "已改到这个时间。看板同一天。";
    });
    document.querySelectorAll("[data-home-when]").forEach((el) => {
      el.textContent = "周四 16:00";
    });
    document.querySelectorAll("[data-home-citta='cal']").forEach((el) => {
      el.textContent = "已改到周四 16:00";
    });
    document.querySelectorAll("[data-meeting] small").forEach((el) => {
      el.textContent = "16:00";
    });
    document.querySelectorAll("[data-cal-next]").forEach((el) => {
      el.textContent = "周四 组会";
    });
    const moved = document.querySelector("[data-cal-card='meeting']");
    if (moved) {
      moved.dataset.calDate = "2026-09-24";
      placeCalEvent(moved);
    }
    paintCalendar();
  }

  function markDraftApproved() {
    document.querySelectorAll("[data-approve-draft], [data-approve='mail']").forEach((btn) => {
      btn.disabled = true;
      btn.textContent = "已发出";
    });
    document.querySelectorAll("[data-draft-state]").forEach((el) => {
      el.textContent = "已发出 · Xinyue (by Citta)";
    });
    const sent = document.getElementById("mail-sent");
    if (sent) sent.hidden = false;
    finishGate("mail", "已发出");
    showToast("已批准。这封从已连接的邮箱发出，署名仍是 Xinyue (by Citta)。");
  }

  document.querySelectorAll("[data-approve-draft]").forEach((btn) => {
    btn.addEventListener("click", markDraftApproved);
  });

  document.querySelectorAll("[data-approve]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.approve;
      if (kind === "mail") {
        markDraftApproved();
        return;
      }
      if (kind === "cal") {
        moveMeeting();
        document.querySelectorAll("[data-cal-state]").forEach((el) => {
          el.textContent = "已批准 · 组会改到周四 16:00";
        });
        btn.textContent = "已改到周四";
        finishGate("cal");
        showToast("已批准。日历和看板上的组会都改到周四 16:00。");
        return;
      }
      if (kind === "memory") {
        document.querySelectorAll("[data-memory-state]").forEach((el) => {
          el.textContent = "已确认 · 可以写进邮件草稿";
        });
        btn.textContent = "已确认";
        finishGate("memory");
        showToast("已确认。这条只允许出现在草稿里，不会自己发出去。");
      }
    });
  });

  function closeGates() {
    document.querySelectorAll(".gate-pop").forEach((pop) => {
      pop.hidden = true;
    });
    document.querySelectorAll(".work-gate[aria-controls]").forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
    });
  }

  document.querySelectorAll("[data-home-gate]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pop = document.getElementById(`gate-${btn.dataset.homeGate}`);
      if (!pop || btn.disabled) return;
      const open = pop.hidden;
      closeGates();
      if (!open) return;
      pop.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    });
  });
  document.querySelectorAll("[data-gate-approve]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeGates();
      document.querySelector(`.nod [data-approve="${btn.dataset.gateApprove}"]`)?.click();
    });
  });
  document.querySelectorAll(".gate-cancel").forEach((btn) => {
    btn.addEventListener("click", closeGates);
  });

  document.getElementById("hist-back")?.addEventListener("click", () => {
    if (histAt <= 0) return;
    histAt -= 1;
    replay(history[histAt]);
  });
  document.getElementById("hist-fwd")?.addEventListener("click", () => {
    if (histAt >= history.length - 1) return;
    histAt += 1;
    replay(history[histAt]);
  });
  document.getElementById("hist-reload")?.addEventListener("click", () => {
    if (place.name === "browser" && place.url) openBrowser(place.url);
    else if (history[histAt]) replay(history[histAt]);
  });
  document.getElementById("omnibox-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    routeAddress(omnibox?.value || "");
  });
  omnibox?.addEventListener("focus", () => omnibox.select());
  const omniboxMic = document.getElementById("omnibox-mic");
  const omniboxLens = document.getElementById("omnibox-lens");
  const omniboxFile = document.getElementById("omnibox-file");
  const omniboxPlaceholder = "搜索网页或输入网址";
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let omniboxRec = null;
  function setOmniboxHint(text) {
    if (!omnibox) return;
    omnibox.placeholder = text;
    if (text === omniboxPlaceholder) return;
    window.setTimeout(() => {
      if (omnibox.placeholder === text) omnibox.placeholder = omniboxPlaceholder;
    }, 2200);
  }
  omniboxMic?.addEventListener("click", () => {
    if (!SpeechRecognition) {
      setOmniboxHint("这个浏览器没有语音输入");
      omnibox?.focus();
      return;
    }
    if (omniboxRec) {
      omniboxRec.stop();
      return;
    }
    const rec = new SpeechRecognition();
    omniboxRec = rec;
    rec.lang = "zh-CN";
    rec.interimResults = true;
    rec.onstart = () => {
      omniboxMic.classList.add("is-on");
      if (omnibox) omnibox.placeholder = "正在听";
    };
    rec.onresult = (event) => {
      let said = "";
      let final = false;
      for (let i = 0; i < event.results.length; i += 1) {
        said += event.results[i][0].transcript;
        if (event.results[i].isFinal) final = true;
      }
      if (omnibox) omnibox.value = said.trim();
      if (final && said.trim()) routeAddress(said.trim());
    };
    rec.onerror = () => setOmniboxHint("没有听清");
    rec.onend = () => {
      omniboxRec = null;
      omniboxMic.classList.remove("is-on");
      if (omnibox && omnibox.placeholder === "正在听") omnibox.placeholder = omniboxPlaceholder;
    };
    try { rec.start(); } catch (_) { setOmniboxHint("没有听清"); }
  });
  omniboxLens?.addEventListener("click", () => omniboxFile?.click());
  omniboxFile?.addEventListener("change", () => {
    const shot = omniboxFile.files && omniboxFile.files[0];
    omniboxFile.value = "";
    if (!shot) return;
    const query = shot.name.replace(/\.[^.]+$/, "") || shot.name;
    const target = {
      kind: "web",
      href: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      host: "www.google.com",
      query,
    };
    if (omnibox) omnibox.value = query;
    openBrowser(target);
    const body = document.getElementById("browser-body");
    if (!body) return;
    const img = document.createElement("img");
    img.className = "browser-shot";
    img.alt = shot.name;
    img.src = URL.createObjectURL(shot);
    body.prepend(img);
  });

  const accountTitles = {
    profile: "编辑资料",
    privacy: "安全与隐私",
    settings: "账号与设置",
    apps: "已连接的应用",
    about: "关于 Symbion",
    history: "最近浏览",
  };
  const deskNames = {
    kanban: "看板",
    calendar: "日历",
    email: "邮件",
    ledger: "账本",
    drive: "网盘",
    mycosmo: "My Cosmo",
    team: "团队",
  };
  function placeLabel(item) {
    if (!item) return "页面";
    if (item.name === "home") return "首页";
    if (item.name === "desk") return `工作台 · ${deskNames[item.desk] || "看板"}`;
    if (item.name === "chat") return item.chat || "消息";
    if (item.name === "cosmo") return "Cosmo";
    if (item.name === "symbion") return "Symbion";
    if (item.name === "account") return accountTitles[item.section] || "账号";
    if (item.name === "people") return "好友和群聊管理";
    if (item.name === "browser") {
      try { return new URL(item.url).host.replace(/^www\./, ""); } catch (_) { return item.url || "网页"; }
    }
    return "页面";
  }
  function renderAccountHistory() {
    const list = document.getElementById("account-history");
    if (!list) return;
    const items = history.slice(0, histAt + 1).slice(-8).reverse();
    list.replaceChildren();
    if (!items.length) {
      const quiet = document.createElement("p");
      quiet.className = "account-quiet";
      quiet.textContent = "还没有浏览记录";
      list.append(quiet);
      return;
    }
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = placeLabel(item);
      btn.addEventListener("click", () => {
        if (item.name === "browser" && item.url) openBrowser(item.url);
        else if (item.name === "chat" && item.chat) openChat(item.chat, item.kind);
        else go(item.name, item.name === "desk" ? item.desk : undefined, undefined, {
          owner: item.owner,
          tab: item.tab,
          section: item.section,
        });
      });
      list.append(btn);
    });
  }
  function showAccount(section) {
    const name = accountTitles[section] ? section : "settings";
    document.querySelectorAll("[data-account-panel]").forEach((el) => {
      el.hidden = el.dataset.accountPanel !== name;
    });
    const title = document.getElementById("account-title");
    if (title) title.textContent = accountTitles[name];
    if (name === "history") renderAccountHistory();
  }
  const accountOpen = document.getElementById("account-open");
  const accountMenu = document.getElementById("account-menu");
  const accountPhoto = document.getElementById("account-photo");
  function closeAccount() {
    if (!accountMenu || accountMenu.hidden) return;
    accountMenu.hidden = true;
    accountOpen?.setAttribute("aria-expanded", "false");
  }
  accountOpen?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = accountMenu.hidden;
    accountMenu.hidden = !open;
    accountOpen.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.getElementById("account-photo-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    accountPhoto?.click();
  });
  accountMenu?.querySelectorAll("[data-account]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.account;
      if (action === "signout") {
        closeAccount();
        const out = document.getElementById("signed-out");
        if (out) out.hidden = false;
        return;
      }
      const fold = accountMenu.querySelector(`[data-account-fold="${action}"]`);
      if (!fold) return;
      const willOpen = fold.hidden;
      accountMenu.querySelectorAll("[data-account-fold]").forEach((el) => {
        el.hidden = true;
      });
      accountMenu.querySelectorAll("[data-account][aria-expanded]").forEach((el) => {
        el.setAttribute("aria-expanded", "false");
      });
      fold.hidden = !willOpen;
      btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
  });
  accountPhoto?.addEventListener("change", () => {
    const shot = accountPhoto.files && accountPhoto.files[0];
    accountPhoto.value = "";
    if (!shot) return;
    const url = URL.createObjectURL(shot);
    document.querySelectorAll("[data-account-avatar]").forEach((el) => {
      el.style.backgroundImage = `url("${url}")`;
      el.classList.add("has-photo");
      el.textContent = "";
    });
  });
  document.getElementById("account-profile")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const field = document.getElementById("account-name");
    const name = (field && field.value.trim()) || "Xinyue";
    document.querySelectorAll("[data-account-name]").forEach((el) => {
      el.textContent = name;
    });
  });
  document.getElementById("sign-back")?.addEventListener("click", () => {
    const out = document.getElementById("signed-out");
    if (out) out.hidden = true;
  });
  document.addEventListener("click", (e) => {
    if (!accountMenu || accountMenu.hidden) return;
    if (e.target.closest("#account-menu") || e.target.closest("#account-open")) return;
    closeAccount();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAccount();
  });

  document.querySelectorAll("[data-bookmark]").forEach((btn) => {
    btn.addEventListener("click", () => openInNewTab(btn.dataset.bookmark));
  });

  const tabList = document.getElementById("chrome-tablist");
  if (tabList) {
    tabList.addEventListener("click", (e) => {
      const close = e.target.closest(".chrome-tab-x");
      const tab = e.target.closest(".chrome-tab");
      if (!tab) return;
      const id = Number(tab.dataset.tabId);
      if (close) closeTab(id);
      else selectTab(id);
    });
  }
  const tabAdd = document.getElementById("chrome-tab-add");
  if (tabAdd) tabAdd.addEventListener("click", addTab);

  syncPreviews();
  commitPlace();

  document.querySelectorAll("[data-team]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const note = document.getElementById("dm-note");
      if (note) note.textContent = `${btn.dataset.team} 的消息主区还没在这个原型里打开。`;
    });
  });

  let symOwner = "Citta";
  let symTab = "profile";

  function openSymbion(owner, tab) {
    if (owner) symOwner = owner;
    if (tab) symTab = tab;
    document.querySelectorAll(".sym-owner").forEach((el) => {
      el.classList.toggle("is-on", el.dataset.owner === symOwner);
    });
    document.querySelectorAll(".sym-tabs button").forEach((el) => {
      const on = el.dataset.sym === symTab;
      el.classList.toggle("is-on", on);
      el.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll("[data-sym-panel]").forEach((el) => {
      el.classList.toggle("is-on", el.dataset.symPanel === symTab);
    });
    const title = document.getElementById("sym-title");
    const citta = document.getElementById("sym-citta");
    const twin = document.getElementById("sym-twin");
    const isCitta = symOwner === "Citta";
    if (!isCitta) {
      const person = COSMO_PEOPLE.find((item) => item.name === symOwner || item.id === symOwner);
      if (person) {
        showView("cosmo");
        setRail("cosmo");
        place.name = "cosmo";
        if (omnibox) omnibox.value = "Cosmo";
        commitPlace();
        openCosmoPerson(person.id);
        return;
      }
    }
    if (title && isCitta) title.textContent = "Citta";
    if (citta) citta.hidden = !isCitta;
    if (twin) twin.hidden = isCitta;
    place.name = "symbion";
    place.owner = symOwner;
    place.tab = symTab;
    commitPlace();
  }

  document.querySelectorAll(".sym-owner").forEach((btn) => {
    btn.addEventListener("click", () => openSymbion(btn.dataset.owner, "profile"));
  });
  document.querySelectorAll(".sym-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => openSymbion(symOwner, btn.dataset.sym));
  });
  document.querySelectorAll("#model-efficient, #model-effective").forEach((sel) => {
    sel.addEventListener("change", () => {
      showToast("两个模式分开保存，只作用于对应回复");
    });
  });

  document.getElementById("draft-context")?.addEventListener("change", (e) => {
    const note = document.getElementById("draft-context-note");
    if (!note) return;
    note.textContent = e.target.checked
      ? "只用已确认的内容写进草稿。未确认的风格卡仍然不进。"
      : "已关掉。确认过的内容也不会写进新的草稿。";
  });

  const BUILTIN_SKILLS = [
    ["Writing", "改你已经写好的句子。不会自己发出。"],
    ["Document", "整理已经打开的文件。不覆盖原件。"],
    ["Reviewing", "标出还要核对的句子。"],
    ["Literature Watch", "看阅读清单。不写成已发表的结论。"],
    ["Message Triage", "把群消息收成待办。不代你回复。"],
    ["LaTeX", "只排版你给出的段落。"],
    ["Accounting", "账本只记已经同意的条目。"],
  ];
  const builtin = document.getElementById("sym-builtin");
  BUILTIN_SKILLS.forEach(([name, detail]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "person-line";
    btn.setAttribute("aria-expanded", "false");
    const title = document.createElement("strong");
    title.textContent = name;
    const status = document.createElement("span");
    status.className = "sym-status";
    status.textContent = "草稿";
    btn.append(title, status);
    const fold = document.createElement("div");
    fold.className = "sym-fold";
    fold.hidden = true;
    const copy = document.createElement("p");
    copy.textContent = `${detail} 还是草稿，不能在这里跑。`;
    fold.appendChild(copy);
    btn.addEventListener("click", () => {
      const open = fold.hidden;
      builtin.querySelectorAll(".sym-fold").forEach((el) => {
        el.hidden = true;
      });
      builtin.querySelectorAll(".person-line").forEach((el) => el.setAttribute("aria-expanded", "false"));
      fold.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    builtin?.append(btn, fold);
  });

  function toggleFold(button, fold) {
    if (!button || !fold) return;
    const open = fold.hidden;
    fold.hidden = !open;
    button.setAttribute("aria-expanded", open ? "true" : "false");
  }
  document.getElementById("skill-new")?.addEventListener("click", () => {
    const fold = document.getElementById("skill-new-fold");
    if (fold) fold.hidden = !fold.hidden;
    if (fold && !fold.hidden) document.getElementById("skill-new-name")?.focus();
  });
  document.getElementById("skill-new-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("skill-new-name");
    const does = document.getElementById("skill-new-does");
    const title = name.value.trim();
    const detail = does.value.trim();
    const list = document.querySelector("[data-sym-panel='skill'] .sym-card:last-child");
    if (!title || !detail || !list) return;
    const row = document.createElement("div");
    row.className = "person-line";
    const copy = document.createElement("span");
    copy.className = "sym-skill-copy";
    const strong = document.createElement("strong");
    strong.textContent = title;
    const note = document.createElement("span");
    note.textContent = detail;
    copy.append(strong, note);
    const status = document.createElement("span");
    status.className = "sym-status";
    status.textContent = "待同意";
    row.append(copy, status);
    const agree = document.createElement("button");
    agree.type = "button";
    agree.className = "link-quiet";
    agree.textContent = "同意";
    agree.addEventListener("click", () => {
      agree.remove();
      status.textContent = "草稿";
      note.textContent = `${detail} 已保存，还是草稿，不能在这里跑。`;
    });
    row.append(agree);
    list.appendChild(row);
    name.value = "";
    does.value = "";
    document.getElementById("skill-new-fold").hidden = true;
  });
  document.getElementById("skill-weekly")?.addEventListener("click", () => {
    toggleFold(document.getElementById("skill-weekly"), document.getElementById("skill-weekly-fold"));
  });
  document.getElementById("skill-open-draft")?.addEventListener("click", () => {
    go("desk", "email");
    showLetter("draft");
  });
  document.getElementById("loop-week")?.addEventListener("click", () => {
    toggleFold(document.getElementById("loop-week"), document.getElementById("loop-week-fold"));
  });
  document.getElementById("loop-run")?.addEventListener("click", () => {
    go("desk", "calendar");
    setCittaLast("已打开日历。邮件和账本没有改。");
  });
  document.getElementById("loop-new")?.addEventListener("click", () => {
    const form = document.getElementById("loop-new-form");
    if (!form) return;
    form.hidden = !form.hidden;
    if (!form.hidden) document.getElementById("loop-new-name")?.focus();
  });
  document.getElementById("loop-new-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameEl = document.getElementById("loop-new-name");
    const stepEl = document.getElementById("loop-new-step");
    const name = nameEl.value.trim();
    const step = stepEl.value.trim();
    const list = document.getElementById("loop-list");
    if (!name || !step || !list) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "person-line";
    const strong = document.createElement("strong");
    strong.textContent = name;
    button.append(strong, document.createTextNode(` ${step}`));
    const fold = document.createElement("div");
    fold.className = "sym-fold";
    fold.hidden = true;
    const note = document.createElement("p");
    note.textContent = step;
    const run = document.createElement("button");
    run.type = "button";
    run.className = "btn-next";
    run.textContent = "跑一次";
    run.addEventListener("click", () => {
      go("desk", "calendar");
      setCittaLast(`${name}：${step}`);
    });
    fold.append(note, run);
    button.addEventListener("click", () => toggleFold(button, fold));
    list.append(button, fold);
    const count = document.getElementById("loop-count");
    if (count) count.textContent = `已保存 ${list.querySelectorAll(".person-line").length} 条。`;
    nameEl.value = "";
    stepEl.value = "";
    event.currentTarget.hidden = true;
  });

  const COSMO_PEOPLE = [
    {
      id: "roland",
      name: "Prof. Gunther Roland",
      mark: "GR",
      ink: true,
      kind: "academic",
      kindLabel: "学术",
      open: true,
      status: "可打开",
      role: "粒子物理课的口吻。用来把一个概念讲短，并标出还没核对的地方。",
      q: "prof gunther roland mit physics nuclear 学术 粒子",
      can: ["用课上的口吻把一个概念收成三句话", "指出一段摘要里哪一句还要核对", "按阅读顺序排一篇相关论文，不写成已发表结论"],
      prompts: ["用三句话讲清什么是喷注淬火", "这段摘要里，哪一句还不能当结论"],
    },
    {
      id: "lin",
      name: "林知夏",
      mark: "林",
      ink: false,
      kind: "academic",
      kindLabel: "学术",
      open: true,
      status: "可打开",
      role: "比较教育学。用来收文献、排阅读顺序。",
      q: "林知夏 比较教育 文献 学术",
      can: ["把一批标题收成一张阅读顺序", "标出两篇论文在问的是不是同一件事", "起草文献综述的小标题，不替你下结论"],
      prompts: ["这六篇标题，先排一个阅读顺序", "这两篇摘要，问的是同一件事吗"],
    },
    {
      id: "zhou",
      name: "周衡",
      mark: "周",
      ink: false,
      kind: "academic",
      kindLabel: "学术",
      open: true,
      status: "可打开",
      role: "材料化学。把实验记录收成一页，数字留在原文里。",
      q: "周衡 材料 实验 学术",
      can: ["把零散实验记录收成一页", "标出缺单位、缺对照的格子", "按时间线重排步骤，不改原始数字"],
      prompts: ["把这三段实验记录收成一页", "这里哪几个数字缺单位"],
    },
    {
      id: "chen",
      name: "陈予安",
      mark: "陈",
      ink: true,
      kind: "academic",
      kindLabel: "学术",
      open: true,
      status: "可打开",
      role: "设计史。按周把一门课拆成可以上课的大纲。",
      q: "陈予安 设计史 课程 大纲 学术",
      can: ["按周拆一门课的大纲", "每一周只留一个要学生带走的问题", "标出还没选阅读材料的周"],
      prompts: ["把设计史课拆成 8 周", "第三周还缺哪一篇阅读"],
    },
    {
      id: "luo",
      name: "骆王宇",
      mark: "骆",
      ink: false,
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: true,
      status: "可打开",
      role: "护肤内容。把一支内容收成可以核对的句子，不写成医嘱。",
      q: "骆王宇 护肤 美妆",
      can: ["把一支护肤内容收成步骤", "标出成分名和宣传句分别是哪一句", "改写成可以核对的短句，不写疗效"],
      prompts: ["把这段口播收成四步", "哪几句是成分，哪几句是宣传"],
    },
    {
      id: "su",
      name: "苏晚",
      mark: "苏",
      ink: true,
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: true,
      status: "可打开",
      role: "成分表。把一串成分翻成能读的句子。",
      q: "苏晚 成分 护肤 美妆",
      can: ["按成分表的顺序解释前几位", "标出你点名要看的成分在不在表里", "区分成分名和营销句"],
      prompts: ["按顺序解释这张成分表的前五位", "表里有没有我点名的那一个"],
    },
    {
      id: "he",
      name: "何清",
      mark: "何",
      ink: false,
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: true,
      status: "可打开",
      role: "妆教。把一支视频拆成可以照着做的步骤。",
      q: "何清 妆教 美妆 步骤",
      can: ["把一支妆教拆成步骤和工具", "每一步只留一个动作", "标出视频里没说清的停留时间"],
      prompts: ["把这支妆教拆成步骤", "哪一步没有说清停多久"],
    },
    {
      id: "man",
      name: "小满",
      mark: "满",
      ink: false,
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: true,
      status: "可打开",
      role: "敏感肌笔记。只整理你确认过的反应，不推断体质。",
      q: "小满 敏感肌 护肤 笔记",
      can: ["把你写过的反应按产品排开", "标出还没记录日期的一条", "空着没写的反应，不补成结论"],
      prompts: ["把这几条使用笔记按产品排开", "哪一条还没有日期"],
    },
    {
      id: "li",
      name: "李佳琦",
      mark: "李",
      ink: true,
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: false,
      status: "要审核",
      block: "身份还在审核，这个档案不能用。",
      role: "公开的美妆身份。审核通过之前不能打开，也不能代他说话。",
      q: "李佳琦 review 美妆 审核",
      can: ["审核通过后，才可以收口播和产品句", "现在只能看到为什么打不开"],
      prompts: ["先不要用这个档案"],
    },
    {
      id: "doudou",
      name: "豆豆",
      mark: "豆",
      ink: false,
      kind: "academic",
      kindLabel: "学术",
      open: false,
      status: "身份不清楚",
      block: "身份不清楚，这个档案不能用。",
      role: "同名太多。分清是哪一位之前，不能当一个确定的人用。",
      q: "豆豆 identity 学术 身份",
      can: ["先列出可能对上的几个公开身份", "你指出是哪一位之前，不生成口吻"],
      prompts: ["先告诉我这是哪一位豆豆"],
    },
    {
      id: "bei",
      name: "北岛",
      mark: "北",
      ink: false,
      kind: "academic",
      kindLabel: "学术",
      open: false,
      status: "要审核",
      block: "学术身份还在核对，这个档案不能用。",
      role: "文学研究向的名字。核对到具体的人和机构之前不能打开。",
      q: "北岛 文学 学术 审核",
      can: ["核对完成后，才可以按论文口吻整理段落", "现在不能引用任何未核对的生平"],
      prompts: ["等身份核对完再用"],
    },
    {
      id: "ali",
      name: "阿梨",
      mark: "梨",
      ink: true,
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: false,
      status: "身份不清楚",
      block: "账号主体不清楚，这个档案不能用。",
      role: "美妆账号。分清是品牌、工作室还是个人之前不能用。",
      q: "阿梨 美妆 账号 身份",
      can: ["先标出这个名字对应的几种账号主体", "主体确认前，不写任何第一人称内容"],
      prompts: ["先分清这是品牌还是个人"],
    },
    {
      id: "shen",
      name: "沈照",
      mark: "沈",
      kind: "academic",
      kindLabel: "学术",
      open: true,
      status: "",
      role: "史学。把一批史料按时间排开，原文留在出处里。",
      q: "沈照 史学 史料 学术",
      can: ["按时间排一批史料", "标出还没有出处的一条", "不把摘录写成已发表的结论"],
      prompts: ["把这八条史料按时间排开", "哪一条还没有出处"],
    },
    {
      id: "jiang",
      name: "江澄",
      mark: "江",
      kind: "academic",
      kindLabel: "学术",
      open: true,
      status: "",
      role: "语言学。标出引文里还没核对的句子。",
      q: "江澄 语言学 引文 学术",
      can: ["标出引文和转述分别是哪一句", "指出还没对上页码的一处", "不改作者原来的措辞"],
      prompts: ["这段里哪几句是引文", "哪一处还没有页码"],
    },
    {
      id: "pei",
      name: "裴宁",
      mark: "裴",
      kind: "academic",
      kindLabel: "学术",
      open: true,
      status: "",
      role: "公共卫生。把一段方法收成可以核对的步骤。",
      q: "裴宁 公共卫生 方法 学术",
      can: ["把方法段收成步骤", "标出缺样本说明的一步", "不把方法写成已经完成的结果"],
      prompts: ["把这段方法收成步骤", "哪一步没有写样本"],
    },
    {
      id: "song",
      name: "宋晚晴",
      mark: "宋",
      kind: "academic",
      kindLabel: "学术",
      open: true,
      status: "",
      role: "社会学。把访谈摘成主题，不替受访者下结论。",
      q: "宋晚晴 社会学 访谈 学术",
      can: ["按主题排访谈摘录", "标出还是原话的句子", "空着没说的，不补成态度"],
      prompts: ["把这几段访谈按主题排开", "哪一句必须留成原话"],
    },
    {
      id: "xu",
      name: "许知行",
      mark: "许",
      kind: "academic",
      kindLabel: "学术",
      open: true,
      status: "",
      role: "计算机。把一段方法写成可以复现的步骤。",
      q: "许知行 计算机 复现 学术",
      can: ["按顺序写下输入、步骤和输出", "标出还缺环境说明的一步", "不把草稿写成已跑通"],
      prompts: ["把这段方法写成可复现的步骤", "哪一步还缺环境"],
    },
    {
      id: "gu",
      name: "顾清和",
      mark: "顾",
      kind: "academic",
      kindLabel: "学术",
      open: true,
      status: "",
      role: "经济史。把一张表收成可以核对的句子。",
      q: "顾清和 经济史 表格 学术",
      can: ["按列解释一张表", "标出单位不一致的格子", "不把表上的数字改成结论"],
      prompts: ["按列解释这张表", "哪一列的单位不一致"],
    },
    {
      id: "xiao",
      name: "小林",
      mark: "小",
      kind: "academic",
      kindLabel: "学术",
      open: false,
      status: "身份不清楚",
      block: "同名太多，这个档案不能用。",
      role: "公开资料里有好几位小林。分清是哪一位之前不能用。",
      q: "小林 同名 学术 身份",
      can: ["先列出可能对上的几个公开身份", "你指出是哪一位之前，不生成口吻"],
      prompts: ["先告诉我这是哪一位小林"],
    },
    {
      id: "nan",
      name: "南风",
      mark: "南",
      kind: "academic",
      kindLabel: "学术",
      open: false,
      status: "要审核",
      block: "机构还在核对，这个档案不能用。",
      role: "研究向的名字。核对到具体的人和机构之前不能打开。",
      q: "南风 机构 学术 审核",
      can: ["核对完成后才可以整理论文段落", "现在不能引用未核对的机构"],
      prompts: ["等机构核对完再用"],
    },
    {
      id: "shu",
      name: "书白",
      mark: "书",
      kind: "academic",
      kindLabel: "学术",
      open: false,
      status: "身份不清楚",
      block: "身份不清楚，这个档案不能用。",
      role: "笔名和本名还没对上。分清之前不能当一个确定的人用。",
      q: "书白 笔名 学术 身份",
      can: ["先标出这个名字可能对应的几种署名", "署名确认前，不写第一人称"],
      prompts: ["先分清这是笔名还是本名"],
    },
    {
      id: "tang",
      name: "唐米",
      mark: "唐",
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: true,
      status: "",
      role: "底妆。把步骤和工具分开写，不写成效果承诺。",
      q: "唐米 底妆 美妆 步骤",
      can: ["把底妆拆成步骤和工具", "每一步只留一个动作", "标出视频里没说清的用量"],
      prompts: ["把这支底妆拆成步骤", "哪一步没有说清用量"],
    },
    {
      id: "ruan",
      name: "阮清",
      mark: "阮",
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: true,
      status: "",
      role: "香氛。只整理气味描述，不写功效。",
      q: "阮清 香氛 美妆 气味",
      can: ["把气味描述收成短句", "标出宣传句和气味句", "不把香氛写成功效"],
      prompts: ["把这段气味描述收成短句", "哪几句是宣传"],
    },
    {
      id: "meng",
      name: "孟夏",
      mark: "孟",
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: true,
      status: "",
      role: "防晒。把涂抹步骤收成可以照着做的句子。",
      q: "孟夏 防晒 美妆 涂抹",
      can: ["把防晒步骤按顺序写下", "标出没写补涂时间的一步", "不把用量写成医嘱"],
      prompts: ["把防晒步骤按顺序写下", "哪一步没有写补涂"],
    },
    {
      id: "ye",
      name: "叶宁",
      mark: "叶",
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: true,
      status: "",
      role: "眉妆。把一支教程拆成工具和动作。",
      q: "叶宁 眉妆 美妆 教程",
      can: ["把眉妆拆成工具和动作", "每一步只留一个方向", "标出没说清颜色的一步"],
      prompts: ["把这支眉妆拆成步骤", "哪一步没有说清颜色"],
    },
    {
      id: "bai",
      name: "白露",
      mark: "白",
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: true,
      status: "",
      role: "卸妆。把清洁步骤和产品名分开。",
      q: "白露 卸妆 清洁 美妆",
      can: ["把卸妆收成步骤", "标出产品名和动作分别是哪一句", "不写清洁之后的肤质结论"],
      prompts: ["把这段卸妆收成步骤", "哪几句是产品名"],
    },
    {
      id: "cen",
      name: "岑舟",
      mark: "岑",
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: true,
      status: "",
      role: "唇妆。把色号和步骤分开，不写适合所有人。",
      q: "岑舟 唇妆 色号 美妆",
      can: ["把唇妆步骤和色号分开", "标出还没写质地的一个色号", "不把试色写成普遍结论"],
      prompts: ["把这支唇妆的步骤和色号分开", "哪个色号还没写质地"],
    },
    {
      id: "qi",
      name: "小七",
      mark: "七",
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: false,
      status: "身份不清楚",
      block: "账号主体不清楚，这个档案不能用。",
      role: "美妆账号。分清是品牌、工作室还是个人之前不能用。",
      q: "小七 美妆 账号 身份",
      can: ["先标出这个名字对应的几种账号主体", "主体确认前，不写任何第一人称内容"],
      prompts: ["先分清这是品牌还是个人"],
    },
    {
      id: "jie",
      name: "姐姐",
      mark: "姐",
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: false,
      status: "身份不清楚",
      block: "同名太多，这个档案不能用。",
      role: "称呼太宽。对上具体的人和账号之前不能用。",
      q: "姐姐 同名 美妆 身份",
      can: ["先列出可能对上的几个公开账号", "你指出是哪一个之前，不生成口吻"],
      prompts: ["先告诉我这是哪一个账号"],
    },
    {
      id: "amay",
      name: "阿 May",
      mark: "M",
      kind: "beauty",
      kindLabel: "美妆护肤",
      open: false,
      status: "要审核",
      block: "身份还在审核，这个档案不能用。",
      role: "公开的美妆身份。审核通过之前不能打开，也不能代其说话。",
      q: "阿 May review 美妆 审核",
      can: ["审核通过后，才可以收口播和产品句", "现在只能看到为什么打不开"],
      prompts: ["先不要用这个档案"],
    },
  ];

  function handToCitta(person, line) {
    if (!person.open) {
      showToast(person.block);
      return;
    }
    const field = document.getElementById("citta-dock-field");
    if (field) {
      field.value = `用 ${person.name} 的档案：${line}`;
      field.focus();
    }
    showToast("已放进 Citta。这句话还没发出。");
  }

  let cosmoOpenId = null;

  function closeCosmoPerson() {
    cosmoOpenId = null;
    document.querySelector("#cosmo-twins .cosmo-pick")?.remove();
    document.querySelectorAll("#cosmo-twins .twin.is-on").forEach((card) => {
      card.classList.remove("is-on");
      card.setAttribute("aria-expanded", "false");
    });
  }

  function openCosmoPerson(id) {
    const person = COSMO_PEOPLE.find((item) => item.id === id);
    const card = document.querySelector(`#cosmo-twins .twin[data-id="${id}"]`);
    if (!person || !card) return;
    if (cosmoOpenId === id) {
      closeCosmoPerson();
      return;
    }
    closeCosmoPerson();
    cosmoOpenId = id;
    card.classList.add("is-on");
    card.setAttribute("aria-expanded", "true");

    const pick = document.createElement("div");
    pick.className = "cosmo-pick";
    pick.setAttribute("role", "region");
    pick.setAttribute("aria-label", person.name);

    const head = document.createElement("div");
    head.className = "cosmo-pick-head";
    const lead = document.createElement("p");
    lead.textContent = person.open ? "点一句，放进 Citta。这句话还没发出。" : person.block;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "cosmo-pick-close";
    close.textContent = "收起";
    close.addEventListener("click", () => closeCosmoPerson());
    head.append(lead, close);

    const prompts = document.createElement("div");
    prompts.className = "cosmo-pick-prompts";
    person.prompts.forEach((line) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = line;
      btn.disabled = !person.open;
      btn.addEventListener("click", () => handToCitta(person, line));
      prompts.appendChild(btn);
    });

    const hire = document.createElement("button");
    hire.type = "button";
    hire.className = "btn-next";
    hire.textContent = hiredHas(person.id) ? "已在 Avatar 里" : "雇进 Avatar";
    hire.disabled = !person.open;
    hire.addEventListener("click", () => hireAvatar(person));

    const disc = document.createElement("p");
    disc.className = "hint";
    disc.textContent = "This is an AI/synthetic digital twin, not the real person.";
    pick.append(head, hire, prompts, disc);

    const visible = [...document.querySelectorAll("#cosmo-twins .twin")].filter((item) => !item.hidden);
    const index = visible.indexOf(card);
    const cols = getComputedStyle(document.getElementById("cosmo-twins")).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
    const rowEnd = Math.min(visible.length - 1, Math.floor(index / cols) * cols + cols - 1);
    visible[rowEnd].after(pick);
    pick.scrollIntoView({ block: "nearest" });
  }

  const COSMO_TAGS = {
    roland: ["粒子物理", "讲短", "核对"],
    lin: ["比较教育", "阅读顺序"],
    zhou: ["材料化学", "实验记录"],
    chen: ["设计史", "课程大纲"],
    luo: ["护肤", "口播"],
    su: ["成分表", "读成分"],
    he: ["妆教", "步骤"],
    man: ["敏感肌", "使用笔记"],
    li: ["美妆", "要审核"],
    doudou: ["学术", "身份不清楚"],
    bei: ["文学", "要审核"],
    ali: ["美妆账号", "身份不清楚"],
    shen: ["史学", "史料"],
    jiang: ["语言学", "引文"],
    pei: ["公共卫生", "方法"],
    song: ["社会学", "访谈"],
    xu: ["计算机", "复现"],
    gu: ["经济史", "表格"],
    xiao: ["学术", "身份不清楚"],
    nan: ["学术", "要审核"],
    shu: ["笔名", "身份不清楚"],
    tang: ["底妆", "步骤"],
    ruan: ["香氛", "气味"],
    meng: ["防晒", "涂抹"],
    ye: ["眉妆", "教程"],
    bai: ["卸妆", "清洁"],
    cen: ["唇妆", "色号"],
    qi: ["美妆账号", "身份不清楚"],
    jie: ["美妆", "身份不清楚"],
    amay: ["美妆", "要审核"],
  };

  function renderCosmoPeople() {
    const root = document.getElementById("cosmo-twins");
    if (!root) return;
    root.replaceChildren();
    COSMO_PEOPLE.forEach((person, index) => {
      const btn = document.createElement("div");
      btn.className = "twin";
      btn.dataset.id = person.id;
      btn.dataset.kind = person.kind;
      btn.dataset.open = person.open ? "1" : "0";
      btn.dataset.q = person.q;
      const top = document.createElement("span");
      top.className = "twin-top";
      const av = document.createElement("span");
      av.className = `twin-av t${index % 5}`;
      av.textContent = person.mark;
      const id = document.createElement("span");
      id.className = "twin-id";
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = person.name;
      const meta = document.createElement("span");
      meta.className = person.open ? "meta" : "meta is-hold";
      meta.textContent = person.open ? person.kindLabel : `${person.kindLabel} · ${person.status}`;
      id.append(name, meta);
      top.append(av, id);
      const role = document.createElement("span");
      role.className = "role";
      role.textContent = person.role;
      const tags = document.createElement("span");
      tags.className = "twin-tags";
      (COSMO_TAGS[person.id] || []).forEach((label) => {
        const tag = document.createElement("span");
        tag.textContent = label;
        tags.appendChild(tag);
      });
      btn.append(top, role, tags);
      if (person.open) {
        const summon = document.createElement("button");
        summon.type = "button";
        summon.className = "twin-summon";
        summon.textContent = "召唤";
        summon.addEventListener("click", (event) => {
          event.stopPropagation();
          hireAvatar(person);
          setAvatar(person.id);
        });
        btn.appendChild(summon);
      }
      root.appendChild(btn);
    });
  }

  renderCosmoPeople();

  let cosmoFilter = "all";

  function applyCosmo() {
    const q = (document.getElementById("cosmo-q")?.value || "").trim().toLowerCase();
    const twins = document.getElementById("cosmo-twins");
    const empty = document.getElementById("cosmo-empty");
    let shown = 0;
    document.querySelectorAll("#cosmo-twins .twin").forEach((card) => {
      const blob = (card.dataset.q || "").toLowerCase();
      const kind = card.dataset.kind || "";
      const open = card.dataset.open === "1";
      const passFilter = cosmoFilter === "all" || (cosmoFilter === "hold" && !open) || kind === cosmoFilter;
      const on = passFilter && (!q || blob.includes(q));
      card.hidden = !on;
      if (on) shown += 1;
    });
    if (twins) twins.hidden = shown === 0;
    if (empty) empty.hidden = shown !== 0;
    const selected = document.querySelector("#cosmo-twins .twin.is-on");
    if (selected?.hidden) closeCosmoPerson();
  }

  document.querySelectorAll(".filter").forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.parentElement.querySelectorAll(".filter").forEach((c) => c.classList.remove("is-on"));
      chip.classList.add("is-on");
      if (chip.dataset.cosmoFilter) {
        cosmoFilter = chip.dataset.cosmoFilter;
        applyCosmo();
      }
    });
  });

  document.getElementById("cosmo-q")?.addEventListener("input", applyCosmo);
  document.getElementById("cosmo-clear")?.addEventListener("click", () => {
    const field = document.getElementById("cosmo-q");
    if (field) field.value = "";
    cosmoFilter = "all";
    document.querySelectorAll("#cosmo-filters .filter").forEach((chip) => {
      chip.classList.toggle("is-on", chip.dataset.cosmoFilter === "all");
    });
    applyCosmo();
  });

  function showCosmoTab(tab) {
    const current = document.querySelector("[data-cosmo-tab].is-on");
    const changed = current?.dataset.cosmoTab !== tab;
    document.querySelectorAll("[data-cosmo-tab]").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.cosmoTab === tab);
    });
    document.querySelectorAll("[data-cosmo-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.cosmoPanel !== tab;
    });
    if (!changed) return;
    const scroller = document.querySelector("#view-cosmo .cosmo-body");
    if (scroller) scroller.scrollTop = 0;
  }
  document.querySelectorAll("[data-cosmo-tab]").forEach((btn) => {
    btn.addEventListener("click", () => showCosmoTab(btn.dataset.cosmoTab));
  });

  let topicTab = "pick";
  function applyTopic() {
    document.querySelectorAll("#view-cosmo .topic-tabs button").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.topic === topicTab);
    });
    document.querySelectorAll("#view-cosmo .weibo").forEach((post) => {
      const tags = (post.dataset.topicIn || "").split(/\s+/);
      post.hidden = !tags.includes(topicTab);
    });
  }
  document.querySelectorAll("#view-cosmo .topic-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      topicTab = btn.dataset.topic;
      applyTopic();
    });
  });
  document.getElementById("topic-follow")?.addEventListener("click", (event) => {
    const btn = event.currentTarget;
    const on = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "已关注" : "关注";
    const fans = document.getElementById("topic-fans");
    if (fans) fans.textContent = on ? "关注 1,281" : "关注 1,280";
  });
  document.getElementById("topic-checkin")?.addEventListener("click", (event) => {
    const btn = event.currentTarget;
    const on = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "已签到" : "签到";
  });
  document.querySelectorAll("#view-cosmo .weibo-like").forEach((btn) => {
    btn.addEventListener("click", () => {
      const base = Number(btn.dataset.count) || 0;
      const on = !btn.classList.contains("is-on");
      btn.classList.toggle("is-on", on);
      btn.textContent = `赞 ${base + (on ? 1 : 0)}`;
    });
  });
  applyTopic();
  document.getElementById("open-plan")?.addEventListener("click", () => {
    showCosmoTab("settings");
    document.getElementById("plan-block")?.scrollIntoView({ block: "nearest" });
  });

  function bindUpload(openId, formId, inputId, listId) {
    const open = document.getElementById(openId);
    const form = document.getElementById(formId);
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    open?.addEventListener("click", () => {
      if (!form) return;
      form.hidden = !form.hidden;
      open.setAttribute("aria-expanded", form.hidden ? "false" : "true");
      if (!form.hidden) input?.focus();
    });
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = input.value.trim();
      if (!name || !list) return;
      const line = document.createElement("span");
      line.textContent = `${name} · 已放进这个 Cosmo`;
      list.append(line);
      input.value = "";
      form.hidden = true;
      open?.setAttribute("aria-expanded", "false");
    });
  }
  bindUpload("cosmo-edu-upload-open", "cosmo-edu-upload", "cosmo-edu-file", "cosmo-edu-files");
  bindUpload("cosmo-fan-upload-open", "cosmo-fan-upload", "cosmo-fan-file", "cosmo-fan-files");

  const calDays = { mon: "周一 21", tue: "周二 22", wed: "周三 23", thu: "周四 24", fri: "周五 25", sat: "周六 26", sun: "周日 27" };
  const calKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const calNames = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const calToday = new Date(2026, 8, 23);
  let calCursor = new Date(2026, 8, 23);
  let calView = window.matchMedia("(max-width: 760px)").matches ? "day" : "week";
  let calAddDate = null;
  let calAddHour = 12;
  let calAddPoint = { x: 0, y: 0 };
  const CAL_START = 8;
  const CAL_HOUR = 80;

  function calSame(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function calWeekStart(date) {
    const x = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const offset = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - offset);
    return x;
  }
  function calKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  function placeCalEvent(card) {
    const when = card.querySelector("time")?.textContent || "";
    const range = when.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
    const one = when.match(/(\d{1,2}):(\d{2})/);
    const day = card.closest("[data-cal-day]")?.dataset.calDay || card.closest("[data-cal-all]")?.dataset.calAll;
    if (!range && !one) {
      const slot = day && document.querySelector(`[data-cal-all="${day}"]`);
      if (slot && card.parentElement !== slot) slot.appendChild(card);
      card.classList.add("is-allday");
      card.style.top = "";
      card.style.height = "";
      return;
    }
    card.classList.remove("is-allday");
    const lane = day && document.querySelector(`[data-cal-day="${day}"] .cal-events`);
    if (lane && card.parentElement !== lane) lane.appendChild(card);
    const sh = range ? Number(range[1]) : Number(one[1]);
    const sm = range ? Number(range[2]) : Number(one[2]);
    const eh = range ? Number(range[3]) : sh + 1;
    const em = range ? Number(range[4]) : sm;
    const top = ((sh - CAL_START) + sm / 60) * CAL_HOUR;
    const height = Math.max(20, ((eh - sh) + (em - sm) / 60) * CAL_HOUR - 3);
    card.style.top = `${top}px`;
    card.style.height = `${height}px`;
  }
  function paintCalendar() {
    const apple = document.getElementById("cal-apple");
    if (!apple) return;
    apple.dataset.calView = calView;
    const start = calWeekStart(calCursor);
    const story = calWeekStart(calToday);
    const onStory = calSame(start, story);
    calKeys.forEach((key, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const head = document.querySelector(`[data-cal-head="${key}"]`);
      const col = document.querySelector(`[data-cal-day="${key}"]`);
      const allday = document.querySelector(`[data-cal-all="${key}"]`);
      const today = calSame(date, calToday);
      const shown = calView !== "day" || calSame(date, calCursor);
      if (head) {
        head.dataset.date = calKey(date);
        const num = head.querySelector(".cal-num");
        if (num) num.textContent = String(date.getDate());
        head.classList.toggle("is-today", today);
        head.classList.toggle("is-shown", shown);
        head.classList.toggle("is-picked", calSame(date, calCursor) && !today);
      }
      if (col) {
        col.classList.toggle("is-today", today);
        col.classList.toggle("is-shown", shown);
      }
      if (allday) allday.classList.toggle("is-shown", shown);
      calDays[key] = `${calNames[index]} ${date.getDate()}`;
    });
    const weekEnd = new Date(start);
    weekEnd.setDate(start.getDate() + 7);
    document.querySelectorAll(".cal-time .cal-event, .cal-allday .cal-event").forEach((card) => {
      const stamp = card.dataset.calDate;
      if (!stamp) {
        card.hidden = !onStory;
        return;
      }
      const parts = stamp.split("-").map(Number);
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      card.hidden = date < start || date >= weekEnd;
    });
    const now = document.getElementById("cal-now");
    const todayGrid = document.querySelector(".cal-day.is-today .cal-grid");
    if (now) {
      if (todayGrid && (calView === "week" || calView === "day")) {
        todayGrid.appendChild(now);
        now.hidden = false;
      } else now.hidden = true;
    }
    const title = document.getElementById("cal-title");
    if (title) {
      if (calView === "day") title.textContent = `${calCursor.getMonth() + 1}月${calCursor.getDate()}日 ${calNames[(calCursor.getDay() + 6) % 7]}`;
      else if (calView === "year") title.textContent = `${calCursor.getFullYear()}年`;
      else title.textContent = `${calCursor.getFullYear()}年${calCursor.getMonth() + 1}月`;
    }
    document.querySelectorAll("[data-cal-mode]").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.calMode === calView);
    });
    paintCalMini();
    paintCalMonth();
    paintCalYear();
  }
  function paintCalMini() {
    const host = document.getElementById("cal-mini");
    if (!host) return;
    const year = calCursor.getFullYear();
    const month = calCursor.getMonth();
    const first = new Date(year, month, 1);
    const lead = (first.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const weekOf = calWeekStart(calCursor);
    host.replaceChildren();
    const caption = document.createElement("p");
    caption.textContent = `${year}年${month + 1}月`;
    host.appendChild(caption);
    const grid = document.createElement("div");
    grid.className = "cal-mini-grid";
    ["一", "二", "三", "四", "五", "六", "日"].forEach((name) => {
      const wd = document.createElement("span");
      wd.className = "cal-mini-wd";
      wd.textContent = name;
      grid.appendChild(wd);
    });
    for (let i = 0; i < lead; i += 1) {
      const blank = document.createElement("span");
      grid.appendChild(blank);
    }
    for (let day = 1; day <= days; day += 1) {
      const date = new Date(year, month, day);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = String(day);
      if (calSame(date, calToday)) btn.classList.add("is-today");
      else if (calSame(date, calCursor)) btn.classList.add("is-picked");
      if (calSame(calWeekStart(date), weekOf) && (calView === "week" || calView === "day")) btn.classList.add("in-week");
      btn.addEventListener("click", () => {
        calCursor = date;
        paintCalendar();
      });
      grid.appendChild(btn);
    }
    host.appendChild(grid);
  }
  function calEventsOn(dateKey) {
    return [...document.querySelectorAll(".cal-event[data-cal-date]")].filter((card) => card.dataset.calDate === dateKey && !card.classList.contains("is-off"));
  }
  function paintCalMonth() {
    const host = document.getElementById("cal-month");
    if (!host) return;
    const year = calCursor.getFullYear();
    const month = calCursor.getMonth();
    const first = new Date(year, month, 1);
    const lead = (first.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    host.replaceChildren();
    const grid = document.createElement("div");
    grid.className = "cal-month-grid";
    calNames.forEach((name) => {
      const wd = document.createElement("div");
      wd.className = "cal-month-wd";
      wd.textContent = name;
      grid.appendChild(wd);
    });
    const total = Math.ceil((lead + days) / 7) * 7;
    for (let i = 0; i < total; i += 1) {
      const cell = document.createElement("div");
      cell.className = "cal-month-cell";
      const dayNum = i - lead + 1;
      const inMonth = dayNum >= 1 && dayNum <= days;
      const date = new Date(year, month, inMonth ? dayNum : 1);
      if (!inMonth) {
        const outside = new Date(year, month, dayNum);
        cell.classList.add("is-out");
        const num = document.createElement("span");
        num.textContent = String(outside.getDate());
        cell.appendChild(num);
        grid.appendChild(cell);
        continue;
      }
      cell.dataset.calDate = calKey(date);
      const num = document.createElement("button");
      num.type = "button";
      num.textContent = String(dayNum);
      if (calSame(date, calToday)) num.classList.add("is-today");
      num.addEventListener("click", () => {
        calCursor = date;
        calView = "day";
        paintCalendar();
      });
      cell.appendChild(num);
      calEventsOn(calKey(date)).forEach((card) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = `cal-chip is-${card.dataset.calSource || "mine"}`;
        chip.textContent = card.querySelector("strong")?.textContent || "";
        chip.dataset.calSource = card.dataset.calSource || "mine";
        chip.dataset.calDate = card.dataset.calDate || "";
        chip.dataset.calWhen = card.querySelector("time")?.textContent || "";
        chip.dataset.calNote = card.querySelector("em")?.textContent || "";
        chip.addEventListener("click", (event) => {
          event.stopPropagation();
          openCalPopover(chip);
        });
        cell.appendChild(chip);
      });
      grid.appendChild(cell);
    }
    host.appendChild(grid);
  }
  function paintCalYear() {
    const host = document.getElementById("cal-year");
    if (!host) return;
    const year = calCursor.getFullYear();
    host.replaceChildren();
    for (let month = 0; month < 12; month += 1) {
      const block = document.createElement("button");
      block.type = "button";
      block.className = "cal-year-month";
      const title = document.createElement("strong");
      title.textContent = `${month + 1}月`;
      block.appendChild(title);
      const grid = document.createElement("div");
      const first = new Date(year, month, 1);
      const lead = (first.getDay() + 6) % 7;
      const days = new Date(year, month + 1, 0).getDate();
      for (let i = 0; i < lead; i += 1) grid.appendChild(document.createElement("i"));
      for (let day = 1; day <= days; day += 1) {
        const mark = document.createElement("i");
        mark.textContent = String(day);
        if (calSame(new Date(year, month, day), calToday)) mark.classList.add("is-today");
        grid.appendChild(mark);
      }
      block.appendChild(grid);
      block.addEventListener("click", () => {
        calCursor = new Date(year, month, 1);
        calView = "month";
        paintCalendar();
      });
      host.appendChild(block);
    }
  }
  const hourLabels = document.getElementById("cal-hour-labels");
  if (hourLabels && !hourLabels.childElementCount) {
    for (let hour = 9; hour <= 20; hour += 1) {
      const label = document.createElement("span");
      label.textContent = `${hour}:00`;
      label.style.top = `${(hour - CAL_START) * CAL_HOUR}px`;
      hourLabels.appendChild(label);
    }
  }
  document.querySelectorAll(".cal-time .cal-event").forEach(placeCalEvent);
  document.getElementById("cal-prev")?.addEventListener("click", () => {
    if (calView === "day") calCursor.setDate(calCursor.getDate() - 1);
    else if (calView === "week") calCursor.setDate(calCursor.getDate() - 7);
    else if (calView === "month") calCursor.setMonth(calCursor.getMonth() - 1);
    else calCursor.setFullYear(calCursor.getFullYear() - 1);
    calCursor = new Date(calCursor);
    paintCalendar();
  });
  document.getElementById("cal-next")?.addEventListener("click", () => {
    if (calView === "day") calCursor.setDate(calCursor.getDate() + 1);
    else if (calView === "week") calCursor.setDate(calCursor.getDate() + 7);
    else if (calView === "month") calCursor.setMonth(calCursor.getMonth() + 1);
    else calCursor.setFullYear(calCursor.getFullYear() + 1);
    calCursor = new Date(calCursor);
    paintCalendar();
  });
  document.getElementById("cal-today")?.addEventListener("click", () => {
    calCursor = new Date(calToday);
    paintCalendar();
  });
  document.querySelectorAll("[data-cal-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      calView = btn.dataset.calMode;
      paintCalendar();
    });
  });
  document.querySelectorAll("[data-cal-filter]").forEach((input) => {
    input.addEventListener("change", () => {
      const on = {};
      document.querySelectorAll("[data-cal-filter]").forEach((el) => {
        on[el.dataset.calFilter] = el.checked;
      });
      document.querySelectorAll("[data-cal-source]").forEach((card) => {
        card.classList.toggle("is-off", !on[card.dataset.calSource]);
      });
      paintCalendar();
    });
  });
  const calAddMenu = document.getElementById("cal-add-menu");

  function hideCalAddMenu() {
    if (calAddMenu) calAddMenu.hidden = true;
  }

  function hideCalAddForm() {
    const form = document.getElementById("cal-add-form");
    if (form) form.hidden = true;
  }

  function calAddHit(event) {
    if (event.target.closest(".cal-event, .cal-chip, #cal-add-form, #cal-add-menu, #cal-popover")) return null;
    const grid = event.target.closest(".cal-grid[data-cal-add]");
    if (grid && (calView === "week" || calView === "day")) {
      const head = document.querySelector(`[data-cal-head="${grid.dataset.calAdd}"]`);
      const stamp = head?.dataset.date;
      if (!stamp) return null;
      const parts = stamp.split("-").map(Number);
      const rect = grid.getBoundingClientRect();
      const hour = Math.min(20, Math.max(CAL_START, Math.floor((event.clientY - rect.top) / CAL_HOUR) + CAL_START));
      return { date: new Date(parts[0], parts[1] - 1, parts[2]), hour };
    }
    const cell = event.target.closest(".cal-month-cell[data-cal-date]");
    if (cell && calView === "month") {
      const parts = cell.dataset.calDate.split("-").map(Number);
      return { date: new Date(parts[0], parts[1] - 1, parts[2]), hour: 12 };
    }
    return null;
  }

  function openCalAddForm() {
    hideCalAddMenu();
    const form = document.getElementById("cal-add-form");
    const label = document.getElementById("cal-add-day");
    const time = document.getElementById("cal-add-time");
    const title = document.getElementById("cal-add-title");
    if (!form || !calAddDate) return;
    const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][calAddDate.getDay()];
    if (label) label.textContent = `${weekday} ${calAddDate.getDate()}`;
    const pad = (n) => String(n).padStart(2, "0");
    if (time) time.value = `${pad(calAddHour)}:00–${pad(calAddHour + 1)}:00`;
    if (title) title.value = "";
    form.hidden = false;
    const width = form.offsetWidth || 280;
    const height = form.offsetHeight || 188;
    let left = calAddPoint.x;
    let top = calAddPoint.y;
    if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
    if (top + height > window.innerHeight - 12) top = window.innerHeight - height - 12;
    form.style.left = `${Math.max(12, left)}px`;
    form.style.top = `${Math.max(12, top)}px`;
    title?.focus();
  }

  document.getElementById("cal-apple")?.addEventListener("contextmenu", (event) => {
    if (event.target.closest(".cal-event, .cal-chip, #cal-popover")) {
      event.preventDefault();
      return;
    }
    const hit = calAddHit(event);
    if (!hit) return;
    event.preventDefault();
    closeCalPopover();
    hideCalAddForm();
    calAddDate = hit.date;
    calAddHour = hit.hour;
    calAddPoint = { x: event.clientX, y: event.clientY };
    if (!calAddMenu) return;
    calAddMenu.hidden = false;
    const menuWidth = calAddMenu.offsetWidth || 148;
    const menuHeight = calAddMenu.offsetHeight || 48;
    calAddMenu.style.left = `${Math.max(8, Math.min(event.clientX, window.innerWidth - menuWidth - 8))}px`;
    calAddMenu.style.top = `${Math.max(8, Math.min(event.clientY, window.innerHeight - menuHeight - 8))}px`;
  });

  calAddMenu?.addEventListener("click", (event) => {
    if (!event.target.closest("[data-cal-add-go]")) return;
    event.stopPropagation();
    openCalAddForm();
  });

  document.getElementById("cal-add-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = document.getElementById("cal-add-title");
    const time = document.getElementById("cal-add-time");
    const name = title.value.trim();
    const when = time.value.trim();
    if (!name || !when || !calAddDate) return;
    const key = calKeys[(calAddDate.getDay() + 6) % 7];
    const day = document.querySelector(`[data-cal-day="${key}"] .cal-events`);
    if (!day) return;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "cal-event";
    card.dataset.calSource = "mine";
    card.dataset.calDate = calKey(calAddDate);
    const strong = document.createElement("strong");
    strong.textContent = name;
    const clock = document.createElement("time");
    clock.textContent = when;
    const wait = document.createElement("em");
    wait.textContent = "等你同意";
    card.append(strong, clock, wait);
    day.appendChild(card);
    placeCalEvent(card);
    const lane = document.getElementById("kb-you");
    if (lane) {
      const kb = document.createElement("button");
      kb.type = "button";
      kb.className = "kb-card";
      kb.dataset.openDesk = "calendar";
      const heading = document.createElement("strong");
      heading.textContent = name;
      const stamp = document.createElement("time");
      stamp.textContent = `${calNames[(calAddDate.getDay() + 6) % 7]} ${calAddDate.getDate()} · ${when}`;
      const note = document.createElement("p");
      note.textContent = "写进日历之前仍等你同意。";
      const mark = document.createElement("em");
      mark.className = "kb-wait";
      mark.textContent = "等你同意";
      kb.append(heading, stamp, note, mark);
      lane.prepend(kb);
    }
    title.value = "";
    time.value = "";
    event.currentTarget.hidden = true;
    paintCalendar();
  });

  const calWho = { mine: "Xinyue", team: "Wuhan Branch Team", research: "Research_Test" };
  const calWeekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  function closeCalPopover() {
    document.querySelectorAll(".cal-event.is-on, .cal-chip.is-on").forEach((el) => el.classList.remove("is-on"));
    const pop = document.getElementById("cal-popover");
    if (pop) pop.hidden = true;
  }

  function openCalPopover(card) {
    const pop = document.getElementById("cal-popover");
    const main = document.querySelector("#view-desk [data-desk-panel='calendar'] .cal-main");
    if (!pop || !main || !card) return;
    document.querySelectorAll(".cal-event.is-on, .cal-chip.is-on").forEach((el) => el.classList.remove("is-on"));
    card.classList.add("is-on");
    const title = card.querySelector("strong")?.textContent || card.textContent.trim();
    const when = card.dataset.calWhen || card.querySelector("time")?.textContent || "";
    const note = card.dataset.calNote || card.querySelector("em")?.textContent || "";
    const source = card.dataset.calSource || "mine";
    const stamp = card.dataset.calDate || "";
    const titleEl = document.getElementById("cal-pop-title");
    const dateEl = document.getElementById("cal-pop-date");
    const timeEl = document.getElementById("cal-pop-time");
    const calEl = document.getElementById("cal-pop-cal");
    const noteEl = document.getElementById("cal-pop-note");
    if (titleEl) titleEl.textContent = title;
    if (dateEl) {
      const parts = stamp.split("-").map(Number);
      const date = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : null;
      dateEl.textContent = date ? `${parts[0]}年${parts[1]}月${parts[2]}日 ${calWeekday[date.getDay()]}` : "";
    }
    if (timeEl) timeEl.textContent = when;
    if (calEl) {
      calEl.dataset.source = source;
      calEl.textContent = calWho[source] || source;
    }
    if (noteEl) {
      noteEl.textContent = note;
      noteEl.hidden = !note;
    }
    pop.hidden = false;
    pop.dataset.source = source;
    const box = card.getBoundingClientRect();
    const width = pop.offsetWidth;
    const height = pop.offsetHeight;
    let left = box.right + 8;
    if (left + width > window.innerWidth - 8) left = box.left - width - 8;
    if (left < 8) left = 8;
    let top = box.top;
    if (top + height > window.innerHeight - 8) top = Math.max(8, window.innerHeight - height - 8);
    if (top < 8) top = 8;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }

  document.getElementById("cal-apple")?.addEventListener("click", (event) => {
    const card = event.target.closest(".cal-event");
    if (!card) return;
    event.stopPropagation();
    openCalPopover(card);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#cal-add-menu")) hideCalAddMenu();
    if (!event.target.closest("#cal-add-form, #cal-add-menu")) hideCalAddForm();
    if (event.target.closest(".cal-event, .cal-chip, #cal-popover")) return;
    closeCalPopover();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeCalPopover();
    hideCalAddMenu();
    hideCalAddForm();
  });

  paintCalendar();

  document.querySelectorAll(".mode-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.parentElement.querySelectorAll(".mode-chip").forEach((c) => c.classList.remove("is-on"));
      chip.classList.add("is-on");
    });
  });

  const form = document.getElementById("citta-form");
  const field = document.getElementById("citta-field");
  const chat = document.getElementById("citta-chat");

  function setCittaOpen(open) {
    document.body.classList.toggle("citta-collapsed", !open);
    if (!open) dockCittaPane();
  }

  function dockCittaPane() {
    const pane = document.querySelector(".citta-pane");
    document.body.classList.remove("citta-free");
    if (!pane) return;
    pane.classList.remove("is-free");
    pane.style.left = "";
    pane.style.top = "";
    pane.style.right = "";
    pane.style.bottom = "";
    pane.style.width = "";
    pane.style.height = "";
  }

  document.getElementById("citta-collapse")?.addEventListener("click", () => setCittaOpen(false));
  (function bindCittaDrag() {
    const pane = document.querySelector(".citta-pane");
    const head = document.querySelector(".citta-pane-head");
    if (!pane || !head) return;
    head.addEventListener("dblclick", (e) => {
      if (e.target.closest("button")) return;
      dockCittaPane();
    });
    head.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("button")) return;
      const rect = pane.getBoundingClientRect();
      const dx = e.clientX - rect.left;
      const dy = e.clientY - rect.top;
      pane.classList.add("is-free");
      document.body.classList.add("citta-free");
      pane.style.width = rect.width + "px";
      pane.style.height = rect.height + "px";
      function place(ev) {
        const left = Math.max(8, Math.min(ev.clientX - dx, window.innerWidth - rect.width - 8));
        const top = Math.max(8, Math.min(ev.clientY - dy, window.innerHeight - 120));
        pane.style.left = left + "px";
        pane.style.top = top + "px";
        pane.style.right = "auto";
        pane.style.bottom = "auto";
      }
      function end() {
        head.removeEventListener("pointermove", place);
        head.removeEventListener("pointerup", end);
      }
      place(e);
      try { head.setPointerCapture(e.pointerId); } catch (err) {}
      head.addEventListener("pointermove", place);
      head.addEventListener("pointerup", end);
    });
  })();
  document.getElementById("citta-scrim")?.addEventListener("click", () => setCittaOpen(false));
  (function bindCittaAvatarDrag() {
    const dock = document.getElementById("citta-dock");
    const fab = document.getElementById("citta-fab");
    if (!dock || !fab) return;
    let active = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let originLeft = 0;
    let originTop = 0;

    fab.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || !document.body.classList.contains("citta-collapsed")) return;
      const rect = dock.getBoundingClientRect();
      active = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      originLeft = rect.left;
      originTop = rect.top;
      try { fab.setPointerCapture(e.pointerId); } catch (err) {}
    });

    fab.addEventListener("pointermove", (e) => {
      if (!active) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      dock.classList.add("is-moved", "is-dragging");
      const size = dock.offsetWidth || 56;
      const left = Math.max(8, Math.min(originLeft + dx, window.innerWidth - size - 8));
      const top = Math.max(8, Math.min(originTop + dy, window.innerHeight - size - 8));
      dock.style.left = left + "px";
      dock.style.top = top + "px";
    });

    function endDrag() {
      if (!active) return;
      active = false;
      dock.classList.remove("is-dragging");
      if (moved) dock.dataset.dragged = "1";
    }
    fab.addEventListener("pointerup", endDrag);
    fab.addEventListener("pointercancel", endDrag);

    fab.addEventListener("click", (e) => {
      if (dock.dataset.dragged === "1") {
        dock.dataset.dragged = "";
        e.preventDefault();
        return;
      }
      setCittaOpen(true);
    });
  })();
  document.getElementById("home-citta")?.addEventListener("click", () => setCittaOpen(true));

  function setCittaLast(text) {
    const last = document.getElementById("citta-last");
    if (last) last.textContent = text;
  }

  function cittaReply(text) {
    if (/^框选|^截图/.test(text)) return "这段已交给我。若要教授带你找到问题，先在右下角切换到已雇佣的 Avatar。";
    if (/周报|草稿|邮件|发出/.test(text)) return "周报草稿在邮件里。署名是 Xinyue (by Citta)。你同意之前不会发出。";
    if (/组会|日历|时间|周四/.test(text)) return "改组会时间还在等你同意。批准前，日历仍是周三 15:00。";
    if (/看板|三件|讲义|页码/.test(text)) return "看板上是周三组会、周四讲义、周五页码。对话里不会改它们。";
    if (/网盘|文件|文件夹/.test(text)) return "文件在网盘里。打开文件夹只看列表，不会改文件。";
    if (/待办/.test(text)) return "待办在首页。勾掉只记在这里。";
    return "我在旁边。发出邮件和改时间会停在首页，等你同意。";
  }

  const hiredAvatars = new Set();
  let currentAvatar = "citta";
  let avatarKind = "all";

  function hiredHas(id) {
    return hiredAvatars.has(id);
  }

  function avatarPerson() {
    if (currentAvatar === "citta") return null;
    return COSMO_PEOPLE.find((item) => item.id === currentAvatar) || null;
  }

  function guideOn() {
    const box = document.getElementById("skill-guide");
    return !box || box.checked;
  }

  function guideReply(text) {
    const person = avatarPerson();
    const name = person ? person.name : "当前 Avatar";
    if (!guideOn()) return `${name} 的「引导找到问题」关着。打开它在 Cosmo 的设置里。`;
    if (/答案|告诉我|直接给|写完|替我/.test(text)) return "答案不从这里出去。先说出你现在的判断，卡在哪一句。";
    if (/页码|清单|pdf|PDF/.test(text)) return "先别对页码。清单里的哪一条，和文件的哪一页对不上？";
    if (/讲义|第二节|核对/.test(text)) return "先别改句子。你框住的这句里，哪一个词你还不能向同学解释？";
    if (/截图/.test(text)) return "画面我看见了。用一句话指出：你卡住的是画面里的哪一处？";
    return `${name} 只帮你找到卡住的那一句。你现在卡在哪里？`;
  }

  function paintAvatar() {
    const person = avatarPerson();
    const name = person ? person.name : "Citta";
    const mark = person ? person.mark : "C";
    const sub = person
      ? "This is an AI/synthetic digital twin, not the real person."
      : "在旁边";
    const dockName = document.getElementById("dock-name");
    const dockMark = document.getElementById("dock-mark");
    const paneMark = document.getElementById("pane-mark");
    const paneName = document.getElementById("pane-name");
    const paneSub = document.getElementById("pane-sub");
    const dockField = document.getElementById("citta-dock-field");
    const paneField = document.getElementById("citta-field");
    if (dockName) dockName.textContent = name;
    if (dockMark) dockMark.textContent = mark;
    if (paneMark) paneMark.textContent = mark;
    if (paneName) paneName.textContent = name;
    if (paneSub) paneSub.textContent = sub;
    const ask = person ? `问 ${name}` : "问 Citta";
    if (dockField) {
      dockField.placeholder = ask;
      dockField.setAttribute("aria-label", ask);
    }
    if (paneField) paneField.placeholder = person ? "指出你卡住的那一句…" : "今天需要我做什么？";
    const homeMark = document.getElementById("agent-mark");
    const homeName = document.getElementById("agent-name");
    const homeLine = document.getElementById("agent-role");
    const homeTwin = document.getElementById("agent-twin");
    if (homeMark) {
      homeMark.textContent = mark;
      homeMark.classList.toggle("citta", !person);
    }
    if (homeName) homeName.textContent = name;
    if (homeLine) homeLine.textContent = person ? avatarLine(person) : "Super agent";
    if (homeTwin) homeTwin.hidden = !person;
    document.querySelectorAll("#avatar-pop-list [data-avatar]").forEach((btn) => {
      const on = btn.dataset.avatar === currentAvatar;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function avatarLine(person) {
    const sentence = (person.role || "").split("。")[0];
    return sentence || person.kindLabel || "";
  }

  function closeAvatarPop() {
    const pop = document.getElementById("avatar-pop");
    if (pop) pop.hidden = true;
    document.getElementById("avatar-switch")?.setAttribute("aria-expanded", "false");
    document.getElementById("agent-switch")?.setAttribute("aria-expanded", "false");
  }

  function placeAvatarPop(anchor) {
    const pop = document.getElementById("avatar-pop");
    if (!pop || pop.hidden || !anchor) return;
    const rect = anchor.getBoundingClientRect();
    const margin = 12;
    const width = Math.min(320, window.innerWidth - margin * 2);
    pop.style.width = `${width}px`;
    const spaceBelow = window.innerHeight - rect.bottom - margin - 8;
    const spaceAbove = rect.top - margin - 8;
    const below = spaceBelow >= 220 || spaceBelow >= spaceAbove;
    pop.style.maxHeight = `${Math.max(180, Math.min(480, below ? spaceBelow : spaceAbove))}px`;
    const height = pop.offsetHeight;
    let left = rect.right - width;
    if (left < margin) left = margin;
    if (left + width > window.innerWidth - margin) left = window.innerWidth - margin - width;
    const top = below ? rect.bottom + 8 : Math.max(margin, rect.top - 8 - height);
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }

  function openAvatarPop(anchor) {
    const pop = document.getElementById("avatar-pop");
    if (!pop || !anchor) return;
    if (!pop.hidden && pop.dataset.anchor === anchor.id) {
      closeAvatarPop();
      return;
    }
    pop.dataset.anchor = anchor.id;
    avatarKind = "all";
    const field = document.getElementById("avatar-q");
    if (field) field.value = "";
    renderAvatarMenu();
    pop.hidden = false;
    placeAvatarPop(anchor);
    document.getElementById("avatar-switch")?.setAttribute("aria-expanded", anchor.id === "avatar-switch" ? "true" : "false");
    document.getElementById("agent-switch")?.setAttribute("aria-expanded", anchor.id === "agent-switch" ? "true" : "false");
    field?.focus();
  }

  function chooseAvatar(id) {
    if (id !== "citta") {
      const person = COSMO_PEOPLE.find((item) => item.id === id && item.open);
      if (!person) return;
      if (!hiredAvatars.has(id)) hireAvatar(person);
    }
    setAvatar(id);
    closeAvatarPop();
  }

  function renderAvatarMenu() {
    const list = document.getElementById("avatar-pop-list");
    const kinds = document.getElementById("avatar-kinds");
    const empty = document.getElementById("avatar-pop-empty");
    if (!list) return;
    const query = (document.getElementById("avatar-q")?.value || "").trim().toLowerCase();
    const people = COSMO_PEOPLE.filter((person) => person.open);
    const labels = [];
    people.forEach((person) => {
      if (person.kindLabel && !labels.includes(person.kindLabel)) labels.push(person.kindLabel);
    });
    if (kinds) {
      kinds.replaceChildren();
      [{ id: "all", name: "全部" }, ...labels.map((label) => ({ id: label, name: label }))].forEach((chip) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = chip.name;
        btn.classList.toggle("is-on", avatarKind === chip.id);
        btn.addEventListener("click", (event) => {
          event.stopPropagation();
          avatarKind = chip.id;
          renderAvatarMenu();
        });
        kinds.appendChild(btn);
      });
    }
    const items = [
      { id: "citta", name: "Citta", mark: "C", line: "Super agent", kind: "", blob: "citta super agent 我的" },
      ...people.map((person) => ({
        id: person.id,
        name: person.name,
        mark: person.mark,
        line: avatarLine(person),
        kind: person.kindLabel || "",
        blob: `${person.name} ${person.role} ${person.kindLabel} ${person.q}`,
      })),
    ].filter((item) => {
      if (avatarKind !== "all" && item.kind !== avatarKind) return false;
      if (!query) return true;
      return `${item.name} ${item.line} ${item.blob}`.toLowerCase().includes(query);
    });
    list.replaceChildren();
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.avatar = item.id;
      btn.setAttribute("role", "option");
      const mark = document.createElement("span");
      mark.className = "avatar-pop-mark";
      mark.textContent = item.mark;
      const copy = document.createElement("span");
      copy.className = "avatar-pop-copy";
      const strong = document.createElement("strong");
      strong.textContent = item.name;
      const em = document.createElement("em");
      em.textContent = item.line;
      copy.append(strong, em);
      btn.append(mark, copy);
      if (item.kind) {
        const kind = document.createElement("span");
        kind.className = "avatar-pop-kind";
        kind.textContent = item.kind;
        btn.appendChild(kind);
      }
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        chooseAvatar(item.id);
      });
      list.appendChild(btn);
    });
    if (empty) empty.hidden = items.length > 0;
    paintAvatar();
    paintSummon();
  }

  function paintSummon() {
    document.querySelectorAll("#cosmo-twins .twin-summon").forEach((btn) => {
      const id = btn.closest(".twin")?.dataset.id;
      const on = id && id === currentAvatar;
      btn.textContent = on ? "已召唤" : "召唤";
      btn.classList.toggle("is-on", Boolean(on));
      btn.disabled = Boolean(on);
    });
  }

  function setAvatar(id) {
    if (id !== "citta" && !hiredAvatars.has(id)) return;
    closeAvatarPop();
    if (id === currentAvatar) return;
    currentAvatar = id;
    paintAvatar();
    paintSummon();
    const person = avatarPerson();
    if (person && chat) {
      appendCittaBubble("ai", `已切换到 ${person.name}。This is an AI/synthetic digital twin, not the real person. 接下来只帮你找到卡住的那一句。`);
    }
  }

  function hireAvatar(person) {
    if (!person || !person.open) return;
    hiredAvatars.add(person.id);
    renderAvatarMenu();
    renderOwnHire();
    document.querySelectorAll(".cosmo-pick .btn-next").forEach((btn) => {
      const card = btn.closest(".cosmo-pick");
      const named = card?.getAttribute("aria-label");
      if (named === person.name) btn.textContent = "已在 Avatar 里";
    });
  }

  function releaseAvatar(id) {
    hiredAvatars.delete(id);
    if (currentAvatar === id) currentAvatar = "citta";
    renderAvatarMenu();
    renderOwnHire();
  }

  const OWN_PLANS = {
    starter: { name: "入门", quota: "10 万", cap: 10 },
    plus: { name: "常用", quota: "50 万", cap: 50 },
    pro: { name: "专业", quota: "200 万", cap: 200 },
  };
  const ownUsed = 18.6;
  let ownPlan = "plus";

  function paintOwnPlan() {
    const plan = OWN_PLANS[ownPlan];
    const usage = document.getElementById("own-usage");
    const meter = document.getElementById("own-meter");
    if (usage) {
      usage.textContent = ownUsed > plan.cap
        ? `${plan.name} · 已用 18.6 万，这档是 ${plan.quota}`
        : `${plan.name} · 已用 18.6 万 / ${plan.quota}`;
    }
    if (meter) meter.style.width = `${Math.min(100, (ownUsed / plan.cap) * 100)}%`;
    document.querySelectorAll("#own-plans button").forEach((btn) => {
      const on = btn.dataset.plan === ownPlan;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      const label = btn.querySelector(".own-plan-go");
      if (label) label.textContent = on ? "当前" : "换成这档";
    });
  }

  function ownRow(person, action) {
    const row = document.createElement("div");
    row.className = "own-row";
    const av = document.createElement("span");
    av.className = `note-av a${(person.name.length % 4) + 1}`;
    av.textContent = person.mark;
    const text = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = person.name;
    const meta = document.createElement("span");
    meta.className = "own-meta";
    meta.textContent = person.kindLabel;
    text.append(name, meta);
    const btn = document.createElement("button");
    btn.type = "button";
    if (action === "hire") {
      btn.dataset.hire = person.id;
      btn.textContent = "雇进";
    } else {
      btn.dataset.release = person.id;
      btn.textContent = "卸下";
    }
    row.append(av, text, btn);
    return row;
  }

  function renderOwnHire() {
    const hired = document.getElementById("own-hired");
    const candidates = document.getElementById("own-candidates");
    if (!hired || !candidates) return;
    const q = (document.getElementById("own-q")?.value || "").trim().toLowerCase();
    hired.replaceChildren();
    const hiredPeople = COSMO_PEOPLE.filter((person) => hiredAvatars.has(person.id));
    if (hiredPeople.length === 0) {
      const empty = document.createElement("p");
      empty.className = "own-empty";
      empty.textContent = "还没有雇来的数字人。";
      hired.appendChild(empty);
    } else {
      hiredPeople.forEach((person) => hired.appendChild(ownRow(person, "release")));
    }
    candidates.replaceChildren();
    const openPeople = COSMO_PEOPLE.filter((person) => {
      if (!person.open || hiredAvatars.has(person.id)) return false;
      if (!q) return true;
      return `${person.name} ${person.kindLabel} ${person.role}`.toLowerCase().includes(q);
    });
    if (openPeople.length === 0) {
      const empty = document.createElement("p");
      empty.className = "own-empty";
      empty.textContent = q ? "没有叫这个名字的数字人。" : "可以雇的都已经在上面。";
      candidates.appendChild(empty);
    } else {
      openPeople.forEach((person) => candidates.appendChild(ownRow(person, "hire")));
    }
  }

  document.getElementById("own-hired")?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-release]");
    if (btn) releaseAvatar(btn.dataset.release);
  });
  document.getElementById("own-candidates")?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-hire]");
    if (!btn) return;
    const person = COSMO_PEOPLE.find((item) => item.id === btn.dataset.hire);
    if (person) hireAvatar(person);
  });
  document.getElementById("own-q")?.addEventListener("input", renderOwnHire);
  document.querySelectorAll("[data-mine-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const paused = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", paused ? "true" : "false");
      btn.textContent = paused ? "恢复" : "暂停";
      const card = btn.closest("[data-mine]");
      card?.classList.toggle("is-hold", paused);
      const status = card?.querySelector(".own-status");
      if (status) status.textContent = paused ? "已暂停" : "公开";
    });
  });
  document.querySelectorAll("[data-mine-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      go("cosmo");
      showCosmoTab("settings");
      document.querySelector(`#owner-side [data-owner-side="${btn.dataset.mineOpen}"]`)?.click();
      document.getElementById("own-manage")?.scrollIntoView({ block: "start" });
    });
  });
  document.getElementById("own-plans")?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-plan]");
    if (!btn || !OWN_PLANS[btn.dataset.plan]) return;
    ownPlan = btn.dataset.plan;
    paintOwnPlan();
  });
  renderOwnHire();
  paintOwnPlan();

  function appendCittaBubble(role, text) {
    if (!chat) return;
    const line = document.createElement("div");
    line.className = role === "me" ? "bubble me" : "bubble ai";
    const body = document.createElement("p");
    body.textContent = text;
    if (role === "me") {
      line.appendChild(body);
    } else {
      const mark = document.createElement("span");
      mark.className = "mark";
      mark.setAttribute("aria-hidden", "true");
      const paneMark = document.getElementById("pane-mark");
      mark.textContent = paneMark ? paneMark.textContent : "C";
      const who = document.createElement("span");
      who.className = "who";
      const name = document.getElementById("pane-name");
      who.textContent = name ? name.textContent : "Citta";
      line.append(mark, who, body);
    }
    chat.appendChild(line);
    chat.scrollTop = chat.scrollHeight;
  }

  function pushCitta(text, opts) {
    if (!text || !chat) return;
    appendCittaBubble("me", text);
    setCittaLast(text);
    setTimeout(() => {
      const reply = currentAvatar === "citta" ? cittaReply(text) : guideReply(text);
      appendCittaBubble("ai", reply);
      setCittaLast(reply);
    }, 450);
    chat.scrollTop = chat.scrollHeight;
    if (!opts || opts.open !== false) setCittaOpen(true);
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = (field?.value || "").trim();
    if (!v) return;
    pushCitta(v);
    if (field) field.value = "";
  });
  document.querySelectorAll("[data-citta-ask]").forEach((btn) => {
    btn.addEventListener("click", () => pushCitta(btn.dataset.cittaAsk));
  });
  document.getElementById("citta-mic")?.addEventListener("click", () => {
    const mic = document.getElementById("citta-mic");
    if (!SpeechRecognition) {
      if (field) {
        field.placeholder = "这个浏览器没有语音输入";
        field.focus();
        window.setTimeout(() => {
          if (field.placeholder === "这个浏览器没有语音输入") field.placeholder = "今天需要我做什么？";
        }, 2200);
      }
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "zh-CN";
    rec.onstart = () => mic?.classList.add("is-on");
    rec.onresult = (event) => {
      const said = event.results[0][0].transcript.trim();
      if (field && said) field.value = said;
    };
    rec.onend = () => mic?.classList.remove("is-on");
    rec.start();
  });

  document.getElementById("citta-dock")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const dockField = document.getElementById("citta-dock-field");
    const v = (dockField?.value || "").trim();
    if (!v) return;
    pushCitta(v, { open: false });
    if (dockField) dockField.value = "";
  });

  const taskModes = {
    ask: {
      label: "问一问",
      status: "只回答",
      reply: "只回答，不改看板、邮件、账本或网盘。",
    },
    plan: {
      label: "想一想",
      status: "计划待确认",
      reply: "先出计划：看工作台里相关的一块，写出要改什么，然后停在这里。确认前不会发信，也不会入账。",
    },
    do: {
      label: "去做",
      status: "等你批准",
      reply: "这一步停在批准前。邮件和账本要在工作台里你点批准之后才有记录，对话里不直接做完。",
    },
  };
  const tasks = [
    {
      id: "t1",
      title: "整理本周三件事",
      mode: "plan",
      modeLabel: "想一想",
      status: "计划已确认",
      confirmed: true,
      artifact: {
        name: "本周三件事",
        body: "周三 Wuhan Branch 组会。周四改讲义。周五对阅读清单第 3 篇页码。计划已确认，看板上的这三件没有再改。",
      },
      messages: [
        { role: "me", text: "把这周 Wuhan Branch 和 Research_Test 的事理成三段，先不要改看板。" },
        { role: "ai", text: "周三组会，周四改讲义，周五对阅读清单。确认前不改看板，也不发信。" },
        { role: "ai", text: "计划已确认。看板保持现在这三件事。" },
      ],
    },
    {
      id: "t2",
      title: "周报草稿先别发",
      mode: "do",
      modeLabel: "去做",
      status: "等你批准",
      confirmed: false,
      artifact: {
        name: "本周进展 · 草稿",
        body: "给 Research_Test。纪要已在 Shared，页码还没对完。邮箱已连接，批准之前不会发出。署名 Xinyue (by Citta)。",
      },
      messages: [
        { role: "me", text: "按这三件事写一封给 Research_Test 的周报，先不要发出。" },
        { role: "ai", text: "草稿在工作台的 Email 里。邮箱已经连上，你点批准之前不会发出。" },
      ],
    },
    {
      id: "t3",
      title: "这两笔记不记在一起",
      mode: "ask",
      modeLabel: "问一问",
      status: "只回答",
      confirmed: false,
      artifact: null,
      messages: [
        { role: "me", text: "讲义打印和小组茶歇要不要记成一笔？" },
        { role: "ai", text: "分开记。两笔都已经批准，收据要等邮箱连上才有。" },
      ],
    },
  ];
  let activeTaskId = "t1";
  let taskMode = "do";
  const taskList = document.getElementById("task-list");
  const taskThread = document.getElementById("task-thread");
  const taskEmpty = document.getElementById("task-empty");
  const taskEmptyList = document.getElementById("task-empty-list");
  const resultOut = document.getElementById("result-out");

  function taskById(id) {
    return tasks.find((item) => item.id === id);
  }

  function renderTasks(query) {
    if (!taskList) return;
    const q = (query || "").trim().toLowerCase();
    taskList.innerHTML = "";
    tasks.forEach((task) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "task-item" + (task.id === activeTaskId ? " is-on" : "");
      btn.hidden = q.length > 0 && !task.title.toLowerCase().includes(q);
      const title = document.createElement("strong");
      title.textContent = task.title;
      const status = document.createElement("span");
      status.textContent = task.status;
      btn.append(title, status);
      btn.addEventListener("click", () => openTask(task.id));
      taskList.appendChild(btn);
    });
    if (taskEmptyList) taskEmptyList.hidden = tasks.length > 0;
  }

  function renderThread(task) {
    if (!taskThread || !taskEmpty) return;
    const showEmpty = !task;
    taskEmpty.hidden = !showEmpty;
    taskThread.hidden = showEmpty;
    taskThread.innerHTML = "";
    if (!task || !resultOut) {
      if (resultOut) {
        resultOut.innerHTML = "";
        const idle = document.createElement("p");
        idle.className = "dm-note";
        idle.textContent = "邮件和账本在工作台里批准。对话里不直接做完。";
        resultOut.appendChild(idle);
      }
      return;
    }
    task.messages.forEach((message) => {
      const bubble = document.createElement("div");
      bubble.className = "task-bubble " + (message.role === "me" ? "me" : "ai");
      bubble.textContent = message.text;
      taskThread.appendChild(bubble);
    });
    taskThread.scrollTop = taskThread.scrollHeight;
    resultOut.innerHTML = "";
    const card = document.createElement("div");
    card.className = "result-card";
    const label = document.createElement("span");
    label.className = "task-kicker";
    label.textContent = task.modeLabel;
    const title = document.createElement("strong");
    title.textContent = task.title;
    const note = document.createElement("p");
    if (task.artifact) {
      note.textContent = task.artifact.body;
      const file = document.createElement("p");
      file.className = "task-kicker";
      file.textContent = task.artifact.name;
      card.append(label, title, file, note);
    } else {
      note.textContent = task.confirmed
        ? "计划已确认。看板、邮件和账本在工作台里改。"
        : "去工作台批准。对话里不改邮件和账本。";
      card.append(label, title, note);
    }
    resultOut.appendChild(card);
    if (task.mode === "plan" && !task.confirmed) {
      const confirm = document.createElement("button");
      confirm.type = "button";
      confirm.className = "task-confirm";
      confirm.textContent = "确认计划";
      confirm.addEventListener("click", () => {
        task.confirmed = true;
        task.status = "计划已确认";
        task.messages.push({ role: "ai", text: "计划已确认。看板、邮件和账本在工作台里改。" });
        renderTasks(document.getElementById("task-search")?.value);
        renderThread(task);
      });
      resultOut.appendChild(confirm);
    }
  }

  function openTask(id) {
    activeTaskId = id;
    renderTasks(document.getElementById("task-search")?.value);
    renderThread(taskById(id));
  }

  document.getElementById("task-new")?.addEventListener("click", () => {
    activeTaskId = null;
    renderTasks(document.getElementById("task-search")?.value);
    renderThread(null);
    document.getElementById("home-ask-input")?.focus();
  });

  document.getElementById("task-search")?.addEventListener("input", (e) => {
    renderTasks(e.target.value);
  });

  document.querySelectorAll(".mode-switch button").forEach((btn) => {
    btn.addEventListener("click", () => {
      taskMode = btn.dataset.mode;
      document.querySelectorAll(".mode-switch button").forEach((item) => {
        const on = item === btn;
        item.classList.toggle("is-on", on);
        item.setAttribute("aria-checked", String(on));
      });
    });
  });

  document.querySelectorAll(".task-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".task-tabs button").forEach((item) => {
        const on = item === btn;
        item.classList.toggle("is-on", on);
        item.setAttribute("aria-selected", String(on));
      });
      document.getElementById("result-out").hidden = btn.dataset.result !== "out";
      document.getElementById("result-desk").hidden = btn.dataset.result !== "desk";
    });
  });

  document.getElementById("home-ask")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("home-ask-input");
    const text = input?.value.trim();
    if (!text) return;
    const mode = taskModes[taskMode] || taskModes.do;
    let task = taskById(activeTaskId);
    if (!task) {
      task = {
        id: "t" + Date.now(),
        title: text.length > 28 ? text.slice(0, 28) + "…" : text,
        mode: taskMode,
        modeLabel: mode.label,
        status: mode.status,
        confirmed: false,
        messages: [],
      };
      tasks.unshift(task);
      activeTaskId = task.id;
    }
    task.messages.push({ role: "me", text });
    task.messages.push({ role: "ai", text: mode.reply });
    task.status = task.confirmed && taskMode === "plan" ? "计划已确认" : mode.status;
    task.mode = taskMode;
    task.modeLabel = mode.label;
    input.value = "";
    renderTasks(document.getElementById("task-search")?.value);
    renderThread(task);
  });

  renderTasks();
  renderThread(taskById("t1"));

  const folders = [
    {
      name: "Google Drive",
      files: [
        ["组会纪要.docx", "Shared"],
        ["阅读清单.pdf", "Research_Test"],
        ["讲义改稿.pptx", "Personal"],
      ],
      count: "3 个文件",
    },
    {
      name: "Symbion Editors",
      files: [["周报草稿", "本地草稿 · 未发出"]],
      count: "1 个文件",
    },
    {
      name: "Shared",
      files: [
        ["组会纪要", "周三"],
        ["阅读清单", "第 3 篇待对页码"],
        ["讲义改稿", "周四"],
        ["演示大纲", "组会用"],
      ],
      count: "4 个文件",
    },
  ];

  const driveGrid = document.getElementById("drive-grid");
  const driveFolder = document.getElementById("drive-folder");
  const driveFiles = document.getElementById("drive-files");

  function renderDrive(mode) {
    if (!driveGrid) return;
    driveGrid.classList.toggle("is-list", mode === "list");
    driveGrid.innerHTML = "";
    folders.forEach((folder) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "folder";
      btn.innerHTML = `<span class="name">${folder.name}</span><span class="count">${folder.count || folder.files.length + " 个文件"}</span>`;
      btn.addEventListener("click", () => openFolder(folder));
      driveGrid.appendChild(btn);
    });
  }

  function showDriveIndex() {
    driveFolder.hidden = true;
    driveGrid.hidden = false;
    const back = document.getElementById("drive-back");
    const seg = document.getElementById("drive-seg");
    const title = document.getElementById("drive-title");
    if (back) back.hidden = true;
    if (seg) seg.hidden = false;
    if (title) title.textContent = "网盘";
    document.getElementById("drive-sub").textContent = "Google Drive · 已连接";
  }

  function openFolder(folder) {
    driveGrid.hidden = true;
    driveFolder.hidden = false;
    const back = document.getElementById("drive-back");
    const seg = document.getElementById("drive-seg");
    const title = document.getElementById("drive-title");
    if (back) back.hidden = false;
    if (seg) seg.hidden = true;
    if (title) title.textContent = folder.name;
    document.getElementById("drive-sub").textContent = folder.count || `${folder.files.length} 个文件`;
    driveFiles.replaceChildren();
    folder.files.forEach(([name, src]) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "file-row";
      const title = document.createElement("strong");
      title.textContent = name;
      const from = document.createElement("span");
      from.textContent = src;
      row.append(title, from);
      row.addEventListener("click", () => openKnownFile(name));
      driveFiles.appendChild(row);
    });
  }

  document.getElementById("drive-back")?.addEventListener("click", showDriveIndex);

  function openKnownFile(name) {
    const editor = {
      "讲义改稿.pptx": "deck",
      "讲义改稿": "deck",
      "阅读清单.pdf": "tex",
      "阅读清单": "tex",
      "组会纪要.docx": "doc",
      "组会纪要": "doc",
    }[name];
    if (!editor) return;
    go("home");
    openEditor(editor);
  }

  function openDeskFrom(event) {
    const jump = event.target.closest("[data-open-desk]");
    if (!jump || !event.currentTarget.contains(jump)) return;
    if (jump.closest(".cal-event, .cal-chip, #cal-popover")) return;
    go("desk", jump.dataset.openDesk, jump.dataset.openFolder || undefined);
    if (jump.dataset.openLetter) showLetter(jump.dataset.openLetter);
  }

  document.getElementById("view-home")?.addEventListener("click", openDeskFrom);
  document.getElementById("view-desk")?.addEventListener("click", openDeskFrom);

  const kbForm = document.getElementById("kb-new-form");
  document.getElementById("kb-new")?.addEventListener("click", () => {
    if (!kbForm) return;
    kbForm.hidden = !kbForm.hidden;
    if (!kbForm.hidden) document.getElementById("kb-new-title")?.focus();
  });
  kbForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = document.getElementById("kb-new-title");
    const when = document.getElementById("kb-new-when");
    const name = title.value.trim();
    const day = when.value.trim();
    const lane = document.getElementById("kb-you");
    if (!name || !day || !lane) return;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "kb-card";
    const heading = document.createElement("strong");
    heading.textContent = name;
    const time = document.createElement("time");
    time.textContent = day;
    const note = document.createElement("p");
    note.textContent = "写进日历之前仍等你同意。";
    const wait = document.createElement("em");
    wait.className = "kb-wait";
    wait.textContent = "等你同意";
    card.append(heading, time, note, wait);
    lane.prepend(card);
    kbForm.reset();
    kbForm.hidden = true;
  });

  document.querySelectorAll("#drive-seg button").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.querySelectorAll("button").forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
      renderDrive(btn.dataset.driveView);
    });
  });
  function showLetter(id) {
    document.querySelectorAll(".mail-row").forEach((row) => {
      const on = row.dataset.letter === id;
      row.classList.toggle("is-on", on);
      row.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll("[data-letter-body]").forEach((body) => {
      body.hidden = body.dataset.letterBody !== id;
    });
  }

  document.querySelectorAll(".mail-row").forEach((row) => {
    row.addEventListener("click", () => {
      showLetter(row.dataset.letter);
      row.classList.remove("is-unread");
      const n = document.querySelectorAll(".mail-row.is-unread").length;
      document.querySelectorAll("[data-mail-unread]").forEach((el) => {
        el.textContent = n ? `${n} 封未读` : "收件箱";
      });
    });
  });

  renderDrive("grid");

  const ledgerForm = document.getElementById("ledger-form");
  document.getElementById("ledger-add")?.addEventListener("click", () => {
    if (!ledgerForm) return;
    ledgerForm.hidden = !ledgerForm.hidden;
  });
  ledgerForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("ledger-title").value.trim();
    const amount = document.getElementById("ledger-amount").value.trim();
    if (!title || !amount) return;
    const ledgerEmpty = document.getElementById("ledger-empty");
    if (ledgerEmpty) ledgerEmpty.hidden = true;
    const row = document.createElement("div");
    row.className = "ledger-row";
    row.innerHTML = `<span>${title}</span><span>手动</span><span>${amount}</span><span><button type="button" class="seg-approve">批准</button></span>`;
    row.querySelector("button").addEventListener("click", () => {
      row.lastElementChild.textContent = "已批准";
      const n = document.getElementById("ledger-approved");
      n.textContent = String(Number(n.textContent) + 1);
    });
    document.getElementById("ledger-body").appendChild(row);
    ledgerForm.reset();
    ledgerForm.hidden = true;
  });

  document.querySelectorAll("#lab-seg button").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.querySelectorAll("button").forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
      const chat = document.getElementById("lab-chat");
      const space = document.getElementById("lab-space");
      const showChat = btn.dataset.lab === "chat";
      chat.hidden = !showChat;
      space.hidden = showChat;
    });
  });

  document.getElementById("lab-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const field = document.getElementById("lab-field");
    const text = field.value.trim();
    if (!text) return;
    const msg = document.createElement("div");
    msg.className = "msg";
    msg.innerHTML = `<strong>你</strong><p></p>`;
    msg.querySelector("p").textContent = text;
    document.querySelector("#lab-chat .thread").appendChild(msg);
    field.value = "";
  });

  function syncTodoCount() {
    const list = document.getElementById("home-captured");
    if (!list) return;
    const open = list.querySelectorAll(".todo-item input[type='checkbox']:not(:checked):not(:disabled)").length;
    const count = document.getElementById("todo-count");
    if (count) count.textContent = String(open);
  }

  function addTodo(text) {
    const list = document.getElementById("home-captured");
    if (!list) return;
    const item = document.createElement("li");
    const label = document.createElement("label");
    label.className = "todo-item";
    const box = document.createElement("input");
    box.type = "checkbox";
    const title = document.createElement("span");
    title.textContent = text;
    label.append(box, title);
    item.append(label);
    box.addEventListener("change", syncTodoCount);
    const draft = document.getElementById("home-capture");
    if (draft && draft.parentElement === list) list.insertBefore(item, draft.nextSibling);
    else list.prepend(item);
    syncTodoCount();
  }

  document.querySelectorAll("#home-captured .todo-item input").forEach((box) => {
    box.addEventListener("change", syncTodoCount);
  });
  const todoDraft = document.getElementById("home-capture");
  const todoForm = todoDraft?.querySelector("form");
  const todoInput = document.getElementById("home-capture-input");
  const todoAdd = document.getElementById("todo-add");
  let todoClosing = false;
  function setTodoCompose(open) {
    if (!todoDraft || !todoAdd) return;
    if (!open) todoClosing = true;
    todoDraft.hidden = !open;
    todoAdd.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      todoClosing = false;
      todoInput?.focus({ preventScroll: true });
    } else {
      queueMicrotask(() => { todoClosing = false; });
    }
  }
  todoAdd?.addEventListener("mousedown", (e) => e.preventDefault());
  todoAdd?.addEventListener("click", () => {
    const text = todoInput?.value.trim();
    if (!todoDraft.hidden && text) {
      addTodo(text);
      todoInput.value = "";
      growTodoInput();
    }
    setTodoCompose(true);
  });
  function growTodoInput() {
    if (!todoInput) return;
    todoInput.style.height = "auto";
    todoInput.style.height = `${todoInput.scrollHeight}px`;
  }
  todoInput?.addEventListener("input", growTodoInput);
  todoInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      todoForm?.requestSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      todoInput.value = "";
      growTodoInput();
      setTodoCompose(false);
    }
  });
  todoInput?.addEventListener("blur", () => {
    if (todoClosing || todoDraft.hidden) return;
    const text = todoInput.value.trim();
    todoInput.value = "";
    growTodoInput();
    if (text) addTodo(text);
    setTodoCompose(false);
  });
  todoForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) {
      setTodoCompose(false);
      return;
    }
    addTodo(text);
    todoInput.value = "";
    growTodoInput();
    todoInput.focus({ preventScroll: true });
  });

  const editCopy = {
    doc: { title: "文档", note: "周四的讲义。发给学生之前仍等你同意。" },
    num: { title: "表格", note: "讲义打印的收据。这一笔已经在账本里。" },
    code: { title: "代码", note: "阅读清单第 3 篇的页码核对。" },
    tex: { title: "SymTex", note: "阅读清单第 3 篇。" },
    deck: { title: "演示", note: "讲义改稿。文件在网盘。Designer 还没叫来，改动只留在这里。" },
  };

  function setHomeMode(mode) {
    document.querySelectorAll("[data-home-mode]").forEach((btn) => {
      const on = btn.dataset.homeMode === mode;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll("[data-home-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.homePanel !== mode;
    });
  }

  function openEditor(id) {
    const copy = editCopy[id];
    const sheet = document.getElementById("edit-sheet");
    const grid = document.getElementById("edit-grid");
    if (!copy || !sheet || !grid) return;
    setHomeMode("edit");
    grid.hidden = true;
    sheet.hidden = false;
    const title = document.getElementById("edit-title");
    const note = document.getElementById("edit-byline");
    if (title) title.textContent = copy.title;
    if (note) note.textContent = copy.note;
    sheet.dataset.editKind = id;
    document.querySelectorAll("[data-edit-canvas]").forEach((canvas) => {
      canvas.hidden = canvas.dataset.editCanvas !== id;
    });
    sheet.querySelector(`[data-edit-canvas="${id}"] textarea, [data-edit-canvas="${id}"] input`)?.focus();
  }

  document.querySelectorAll("[data-home-mode]").forEach((btn) => {
    btn.addEventListener("click", () => setHomeMode(btn.dataset.homeMode));
  });
  document.querySelectorAll("[data-edit-open]").forEach((card) => {
    card.addEventListener("click", () => openEditor(card.dataset.editOpen));
  });
  document.querySelectorAll("[data-wps-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const sheet = document.getElementById("edit-sheet");
      if (!sheet) return;
      sheet.dataset.wpsTab = tab.dataset.wpsTab;
      document.querySelectorAll("[data-wps-tab]").forEach((btn) => {
        btn.classList.toggle("is-on", btn === tab);
      });
      document.querySelectorAll("[data-wps-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.wpsPanel !== tab.dataset.wpsTab;
      });
    });
  });
  document.getElementById("edit-back")?.addEventListener("click", () => {
    const sheet = document.getElementById("edit-sheet");
    const grid = document.getElementById("edit-grid");
    if (sheet) sheet.hidden = true;
    if (grid) grid.hidden = false;
  });

  const docTypes = [
    { type: "doc", group: "办公", label: "文字文档", hint: "Word", mark: "W", tone: "doc", kind: "文", base: "未命名文档" },
    { type: "sheet", group: "办公", label: "表格", hint: "Excel", mark: "X", tone: "sheet", kind: "表", base: "未命名表格" },
    { type: "deck", group: "办公", label: "演示文稿", hint: "PPT", mark: "P", tone: "deck", kind: "演", base: "未命名演示" },
    { type: "pdf", group: "办公", label: "PDF", hint: "页面", mark: "PDF", tone: "pdf", kind: "PDF", base: "未命名 PDF" },
    { type: "smart-doc", group: "智能", label: "智能文档", hint: "提纲", mark: "智", tone: "doc", kind: "文", base: "未命名智能文档" },
    { type: "smart-sheet", group: "智能", label: "智能表格", hint: "汇总", mark: "智", tone: "sheet", kind: "表", base: "未命名智能表格" },
    { type: "mind", group: "图形", label: "思维导图", hint: "分支", mark: "图", tone: "mind", kind: "图", base: "未命名导图" },
    { type: "flow", group: "图形", label: "流程图", hint: "步骤", mark: "流", tone: "flow", kind: "流", base: "未命名流程图" },
    { type: "board", group: "图形", label: "白板", hint: "便签", mark: "板", tone: "board", kind: "板", base: "未命名白板" },
    { type: "form", group: "收集", label: "表单", hint: "题目", mark: "单", tone: "form", kind: "单", base: "未命名表单" },
    { type: "collect", group: "收集", label: "收集表", hint: "填写", mark: "收", tone: "form", kind: "收", base: "未命名收集表" },
    { type: "base", group: "收集", label: "多维表格", hint: "记录", mark: "多", tone: "base", kind: "多", base: "未命名多维表格" },
    { type: "folder", group: "整理", label: "文件夹", hint: "收纳", mark: "夹", tone: "folder", kind: "夹", base: "未命名文件夹" },
  ];

  function typeSpec(type) {
    return docTypes.find((item) => item.type === type) || docTypes[0];
  }

  function blankCells(rows, cols, header) {
    const cells = [];
    for (let r = 0; r < rows; r += 1) {
      const row = [];
      for (let c = 0; c < cols; c += 1) row.push(r === 0 && header ? header[c] || "" : "");
      cells.push(row);
    }
    return cells;
  }

  function padCells(doc, rows, cols) {
    const width = Math.max(cols, ...(doc.cells || []).map((row) => row.length), 1);
    const height = Math.max(rows, (doc.cells || []).length, 1);
    const cells = [];
    for (let r = 0; r < height; r += 1) {
      const row = [];
      for (let c = 0; c < width; c += 1) row.push((doc.cells && doc.cells[r] && doc.cells[r][c]) || "");
      cells.push(row);
    }
    doc.cells = cells;
    doc.bold = doc.bold || {};
  }

  function colName(index) {
    let n = index + 1;
    let name = "";
    while (n > 0) {
      const m = (n - 1) % 26;
      name = String.fromCharCode(65 + m) + name;
      n = Math.floor((n - 1) / 26);
    }
    return name;
  }

  const cloudDocs = [
    {
      id: "lecture",
      name: "讲义改稿",
      type: "doc",
      crumb: "我的空间 / 讲义",
      meta: "Xinyue · 更新于今天 14:20",
      html: "<p>周四的讲义。发给学生之前仍等你同意。</p><h2>第一节</h2><p>先把概念讲短。</p><h2>第二节</h2><p>标出还没核对的句子。</p><p>改到可以发给学生。</p>",
    },
    {
      id: "readlist",
      name: "阅读清单第 3 篇",
      type: "doc",
      crumb: "我的空间 / 阅读",
      meta: "Research_Test · 更新于今天 10:18",
      html: "<p>页码还没对上。周五 10:00 的「页码」之前标好，组会上会一起过。</p><p>文件也在网盘的阅读清单.pdf。</p>",
    },
    {
      id: "minutes",
      name: "组会纪要",
      type: "doc",
      crumb: "我的空间 / Wuhan Branch Team",
      meta: "周宁 · 更新于昨天 16:40",
      html: "<p>昨天的组会纪要已经放进 Shared。</p><p>下次组会仍是周三 15:00–16:00。若要改到周四 16:00，需要你在首页同意。</p>",
    },
    {
      id: "receipt",
      name: "讲义打印",
      type: "sheet",
      crumb: "我的空间 / 账本",
      meta: "Xinyue · 更新于周一 09:12",
      cells: [
        ["项目", "金额", "状态"],
        ["讲义打印", "86", "已批准"],
        ["小组茶歇", "120", "待记"],
      ],
      bold: { "0,0": true, "0,1": true, "0,2": true },
    },
  ];
  cloudDocs.forEach((item) => {
    const spec = typeSpec(item.type);
    item.kind = spec.kind;
    item.mark = spec.mark;
    item.tone = spec.tone;
  });

  let openDocId = "";
  let activeCell = { r: 0, c: 0 };

  function currentDoc() {
    return cloudDocs.find((item) => item.id === openDocId) || null;
  }

  function freshName(base) {
    const names = new Set(cloudDocs.map((item) => item.name));
    if (!names.has(base)) return base;
    let n = 2;
    while (names.has(`${base} ${n}`)) n += 1;
    return `${base} ${n}`;
  }

  function paintDocsList(activeId) {
    const list = document.getElementById("docs-list");
    if (!list) return;
    list.replaceChildren();
    cloudDocs.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "docs-item" + (item.id === activeId ? " is-on" : "");
      const mark = document.createElement("i");
      mark.dataset.tone = item.tone;
      mark.textContent = item.mark;
      const label = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = item.name;
      const when = document.createElement("em");
      when.textContent = item.meta.split("·").pop().trim();
      label.append(name, when);
      btn.append(mark, label);
      btn.addEventListener("click", () => openCloudDoc(item.id));
      list.appendChild(btn);
    });
  }

  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function toolButton(label, cmd, arg, html) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.docCmd = cmd;
    if (arg) btn.dataset.docArg = arg;
    if (html) btn.innerHTML = html;
    else btn.textContent = label;
    return btn;
  }

  function wordTools() {
    const bar = node("div", "docs-tools");
    bar.setAttribute("aria-label", "开始");
    bar.append(
      toolButton("撤销", "undo"),
      toolButton("恢复", "redo"),
      toolButton("", "bold", "", "<b>B</b>"),
      toolButton("", "italic", "", "<span class=\"docs-i\">I</span>"),
      toolButton("", "underline", "", "<u>U</u>"),
      toolButton("", "strikeThrough", "", "<s>S</s>"),
      toolButton("左", "justifyLeft"),
      toolButton("中", "justifyCenter"),
      toolButton("右", "justifyRight"),
      toolButton("项目", "insertUnorderedList"),
      toolButton("编号", "insertOrderedList"),
      toolButton("标题", "formatBlock", "h2"),
      toolButton("正文", "formatBlock", "p"),
      toolButton("表格", "insertHTML", "<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>")
    );
    const font = document.createElement("select");
    font.dataset.docSelect = "fontName";
    font.setAttribute("aria-label", "字体");
    ["等线", "宋体", "黑体", "楷体", "Georgia"].forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      font.appendChild(opt);
    });
    const size = document.createElement("select");
    size.dataset.docSelect = "fontSize";
    size.setAttribute("aria-label", "字号");
    [["3", "小"], ["4", "正文"], ["5", "大"], ["6", "标题"]].forEach(([value, label]) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      if (value === "4") opt.selected = true;
      size.appendChild(opt);
    });
    const color = document.createElement("input");
    color.type = "color";
    color.value = "#1f2329";
    color.dataset.docSelect = "foreColor";
    color.setAttribute("aria-label", "字色");
    const mark = document.createElement("input");
    mark.type = "color";
    mark.value = "#fff3a3";
    mark.dataset.docSelect = "hiliteColor";
    mark.setAttribute("aria-label", "高亮");
    bar.prepend(size);
    bar.prepend(font);
    bar.append(color, mark);
    return bar;
  }

  function paper(doc, extra) {
    const page = node("article", "docs-page");
    const title = node("h1", "docs-name", doc.name);
    title.contentEditable = "true";
    title.spellcheck = false;
    const meta = node("p", "docs-meta", doc.meta);
    const body = node("div", "docs-body");
    body.id = "docs-body";
    body.contentEditable = "true";
    body.spellcheck = false;
    body.innerHTML = doc.html || "<p><br></p>";
    page.append(title, meta, wordTools(), body);
    if (extra) page.append(extra);
    return page;
  }

  function renderSheet(doc) {
    padCells(doc, 16, 8);
    const wrap = node("div", "docs-sheet");
    const bar = node("div", "docs-sheet-bar");
    bar.append(node("strong", "", doc.name));
    const nameBox = node("span", "docs-cell-name", colName(activeCell.c) + (activeCell.r + 1));
    nameBox.id = "docs-cell-name";
    const formula = document.createElement("input");
    formula.id = "docs-formula";
    formula.setAttribute("aria-label", "编辑栏");
    formula.value = doc.cells[activeCell.r][activeCell.c] || "";
    bar.append(nameBox, formula, node("button", "", "加粗"), node("button", "", "加一行"), node("button", "", "加一列"));
    bar.querySelectorAll("button")[0].dataset.docsAct = "bold-cell";
    bar.querySelectorAll("button")[1].dataset.docsAct = "add-row";
    bar.querySelectorAll("button")[2].dataset.docsAct = "add-col";
    const scroller = node("div", "docs-grid-wrap");
    const table = document.createElement("table");
    table.className = "docs-grid";
    const head = document.createElement("tr");
    head.appendChild(node("th", "", ""));
    doc.cells[0].forEach((_, c) => head.appendChild(node("th", "", colName(c))));
    table.appendChild(head);
    doc.cells.forEach((row, r) => {
      const tr = document.createElement("tr");
      tr.appendChild(node("th", "", String(r + 1)));
      row.forEach((value, c) => {
        const td = document.createElement("td");
        if (r === activeCell.r && c === activeCell.c) td.className = "is-on";
        const input = document.createElement("input");
        input.dataset.cell = "1";
        input.dataset.r = String(r);
        input.dataset.c = String(c);
        input.value = value;
        if (doc.bold[`${r},${c}`]) input.className = "is-bold";
        td.appendChild(input);
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    scroller.appendChild(table);
    const status = node("div", "docs-sheet-status");
    status.id = "docs-sheet-status";
    wrap.append(bar, scroller, status);
    return wrap;
  }

  function columnSum(doc, col) {
    let sum = 0;
    let any = false;
    for (let r = 1; r < doc.cells.length; r += 1) {
      const raw = String(doc.cells[r][col] || "").replace(/,/g, "");
      if (!raw) continue;
      const n = Number(raw);
      if (!Number.isNaN(n)) {
        sum += n;
        any = true;
      }
    }
    return any ? sum : "";
  }

  function paintSum(doc) {
    const status = document.getElementById("docs-sheet-status");
    if (!status) return;
    const sum = columnSum(doc, activeCell.c);
    status.textContent = sum === "" ? `就绪 · ${colName(activeCell.c)}` : `求和 ${sum}`;
  }

  function renderDeck(doc) {
    doc.slides = doc.slides && doc.slides.length ? doc.slides : [{ title: "标题", body: "" }];
    doc.slide = Math.min(doc.slide || 0, doc.slides.length - 1);
    const deck = node("div", "docs-deck");
    const film = node("div", "docs-film");
    doc.slides.forEach((slide, index) => {
      const btn = node("button", "docs-thumb" + (index === doc.slide ? " is-on" : ""));
      btn.type = "button";
      btn.dataset.docsAct = "pick-slide";
      btn.dataset.slide = String(index);
      btn.append(node("b", "", String(index + 1)), node("strong", "", slide.title || "未命名"));
      film.appendChild(btn);
    });
    const add = node("button", "docs-thumb-add", "新建幻灯片");
    add.type = "button";
    add.dataset.docsAct = "add-slide";
    film.appendChild(add);
    const stage = node("div", "docs-deck-stage");
    const slide = doc.slides[doc.slide];
    const card = node("article", "docs-slide");
    const title = document.createElement("input");
    title.className = "docs-slide-title";
    title.value = slide.title;
    title.dataset.slideField = "title";
    title.setAttribute("aria-label", "幻灯片标题");
    const body = document.createElement("textarea");
    body.className = "docs-slide-body";
    body.value = slide.body;
    body.dataset.slideField = "body";
    body.setAttribute("aria-label", "幻灯片正文");
    card.append(title, body);
    stage.appendChild(card);
    const foot = node("div", "docs-deck-foot");
    foot.append(node("span", "", `${doc.slide + 1} / ${doc.slides.length}`));
    const del = node("button", "", "删除这页");
    del.type = "button";
    del.dataset.docsAct = "del-slide";
    foot.appendChild(del);
    const main = node("div", "docs-deck-main");
    main.append(stage, foot);
    deck.append(film, main);
    return deck;
  }

  function renderMind(doc) {
    doc.center = doc.center || "中心主题";
    doc.branches = doc.branches || ["分支 1"];
    const map = node("div", "docs-mind");
    const center = document.createElement("input");
    center.className = "docs-mind-center";
    center.value = doc.center;
    center.dataset.mind = "center";
    const branches = node("div", "docs-mind-branches");
    doc.branches.forEach((text, index) => {
      const input = document.createElement("input");
      input.value = text;
      input.dataset.mind = "branch";
      input.dataset.index = String(index);
      branches.appendChild(input);
    });
    const add = node("button", "", "添加分支");
    add.type = "button";
    add.dataset.docsAct = "add-branch";
    map.append(center, branches, add);
    return map;
  }

  function renderFlow(doc) {
    doc.steps = doc.steps && doc.steps.length ? doc.steps : [{ kind: "step", text: "开始" }];
    const flow = node("div", "docs-flow");
    doc.steps.forEach((step, index) => {
      const row = node("div", "docs-flow-step is-" + step.kind);
      const input = document.createElement("input");
      input.value = step.text;
      input.dataset.flow = String(index);
      row.append(node("i", "", step.kind === "choice" ? "判断" : "步骤"), input);
      flow.appendChild(row);
    });
    const actions = node("div", "docs-inline-actions");
    const step = node("button", "", "添加步骤");
    step.type = "button";
    step.dataset.docsAct = "add-step";
    const choice = node("button", "", "添加判断");
    choice.type = "button";
    choice.dataset.docsAct = "add-choice";
    actions.append(step, choice);
    flow.appendChild(actions);
    return flow;
  }

  function renderForm(doc, collect) {
    doc.questions = doc.questions && doc.questions.length ? doc.questions : [{ prompt: "未命名题目", kind: "text" }];
    const form = node("div", "docs-form");
    if (collect) form.append(node("p", "docs-form-lead", "把链接发出去之后，回答会收在这里。发出仍等你同意。"));
    doc.questions.forEach((q, index) => {
      const row = node("label", "docs-question");
      const input = document.createElement("input");
      input.value = q.prompt;
      input.dataset.question = String(index);
      const select = document.createElement("select");
      select.dataset.questionKind = String(index);
      [["text", "填空"], ["choice", "单选"]].forEach(([value, label]) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = label;
        if (q.kind === value) opt.selected = true;
        select.appendChild(opt);
      });
      row.append(node("span", "", String(index + 1)), input, select);
      form.appendChild(row);
    });
    const actions = node("div", "docs-inline-actions");
    const add = node("button", "", "添加题目");
    add.type = "button";
    add.dataset.docsAct = "add-question";
    actions.appendChild(add);
    if (collect) {
      const send = node("button", "", "提交");
      send.type = "button";
      send.dataset.docsAct = "submit-form";
      actions.appendChild(send);
    }
    form.appendChild(actions);
    return form;
  }

  function renderBoard(doc) {
    doc.notes = doc.notes && doc.notes.length ? doc.notes : [{ text: "便签", x: 48, y: 48 }];
    const board = node("div", "docs-board");
    doc.notes.forEach((note, index) => {
      const card = document.createElement("textarea");
      card.className = "docs-note";
      card.value = note.text;
      card.dataset.note = String(index);
      card.style.left = note.x + "px";
      card.style.top = note.y + "px";
      board.appendChild(card);
    });
    const add = node("button", "docs-board-add", "添加便签");
    add.type = "button";
    add.dataset.docsAct = "add-note";
    board.appendChild(add);
    return board;
  }

  function renderBase(doc) {
    doc.fields = doc.fields && doc.fields.length ? doc.fields : ["名称", "状态"];
    doc.rows = doc.rows && doc.rows.length ? doc.rows : [doc.fields.map(() => "")];
    const base = node("div", "docs-base");
    const table = document.createElement("table");
    table.className = "docs-grid";
    const head = document.createElement("tr");
    doc.fields.forEach((field, c) => {
      const th = document.createElement("th");
      const input = document.createElement("input");
      input.value = field;
      input.dataset.field = String(c);
      th.appendChild(input);
      head.appendChild(th);
    });
    table.appendChild(head);
    doc.rows.forEach((row, r) => {
      const tr = document.createElement("tr");
      doc.fields.forEach((_, c) => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.value = row[c] || "";
        input.dataset.record = String(r);
        input.dataset.c = String(c);
        td.appendChild(input);
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    const add = node("button", "", "添加记录");
    add.type = "button";
    add.dataset.docsAct = "add-record";
    base.append(table, add);
    return base;
  }

  function renderFolder(doc) {
    const box = node("div", "docs-folder");
    box.append(node("h1", "", doc.name), node("p", "", "这个文件夹还是空的。在这里新建，文件会放进来。"));
    const kids = cloudDocs.filter((item) => item.folder === doc.id);
    kids.forEach((item) => {
      const btn = node("button", "docs-folder-file", item.name);
      btn.type = "button";
      btn.dataset.docsAct = "open-child";
      btn.dataset.child = item.id;
      box.appendChild(btn);
    });
    if (kids.length) box.querySelector("p").textContent = `${kids.length} 个文件`;
    return box;
  }

  function renderPdf(doc) {
    const wrap = node("div", "docs-pdf");
    const frame = node("div", "docs-pdf-stage");
    const page = node("article", "docs-pdf-page");
    const title = node("h1", "docs-name", doc.name);
    title.contentEditable = "true";
    title.spellcheck = false;
    const body = node("div", "docs-body");
    body.id = "docs-body";
    body.contentEditable = "true";
    body.spellcheck = false;
    body.innerHTML = doc.html || "<p><br></p>";
    page.append(title, body);
    frame.appendChild(page);
    wrap.append(frame, node("div", "docs-pdf-bar", "第 1 页"));
    return wrap;
  }

  function renderStage(doc) {
    const stage = document.getElementById("docs-stage");
    const scroll = document.getElementById("docs-scroll");
    const crumb = document.getElementById("docs-crumb");
    if (!stage || !scroll) return;
    const bleed = doc.type === "sheet" || doc.type === "smart-sheet" || doc.type === "base";
    const deck = doc.type === "deck" || doc.type === "board";
    scroll.classList.toggle("is-bleed", bleed);
    scroll.classList.toggle("is-deck", deck);
    scroll.classList.toggle("is-pdf", doc.type === "pdf");
    if (crumb) crumb.textContent = doc.crumb || "我的空间";
    stage.replaceChildren();
    if (doc.type === "doc" || doc.type === "smart-doc") stage.appendChild(paper(doc));
    else if (doc.type === "pdf") stage.appendChild(renderPdf(doc));
    else if (doc.type === "sheet" || doc.type === "smart-sheet") {
      const view = renderSheet(doc);
      stage.appendChild(view);
      paintSum(doc);
    } else if (doc.type === "deck") stage.appendChild(renderDeck(doc));
    else if (doc.type === "mind") stage.appendChild(renderMind(doc));
    else if (doc.type === "flow") stage.appendChild(renderFlow(doc));
    else if (doc.type === "form") stage.appendChild(paperShell(doc, renderForm(doc, false)));
    else if (doc.type === "collect") stage.appendChild(paperShell(doc, renderForm(doc, true)));
    else if (doc.type === "board") stage.appendChild(renderBoard(doc));
    else if (doc.type === "base") stage.appendChild(renderBase(doc));
    else stage.appendChild(renderFolder(doc));
  }

  function paperShell(doc, inner) {
    const page = node("article", "docs-page");
    const title = node("h1", "docs-name", doc.name);
    title.contentEditable = "true";
    page.append(title, node("p", "docs-meta", doc.meta), inner);
    return page;
  }

  function openCloudDoc(id) {
    const doc = cloudDocs.find((item) => item.id === id) || cloudDocs[0];
    openDocId = doc.id;
    if (doc.type !== "sheet" && doc.type !== "smart-sheet") activeCell = { r: 0, c: 0 };
    paintDocsList(doc.id);
    renderStage(doc);
  }

  function createCloudDoc(type) {
    const spec = typeSpec(type);
    const folder = currentDoc();
    const parent = folder && folder.type === "folder" ? folder : null;
    const item = {
      id: `${type}-${Date.now()}`,
      name: freshName(spec.base),
      type,
      kind: spec.kind,
      mark: spec.mark,
      tone: spec.tone,
      crumb: parent ? `我的空间 / ${parent.name}` : "我的空间",
      meta: "Xinyue · 刚刚",
      folder: parent ? parent.id : "",
    };
    if (type === "doc" || type === "pdf") item.html = "<p><br></p>";
    if (type === "smart-doc") item.html = "<h2>提纲</h2><p>先写要讲的一句。</p><h2>还没核对</h2><p><br></p>";
    if (type === "sheet") item.cells = blankCells(16, 8);
    if (type === "smart-sheet") {
      item.cells = blankCells(16, 6, ["项目", "数量", "金额", "状态", "备注", ""]);
      item.cells[1] = ["讲义打印", "1", "86", "已批准", "", ""];
      item.bold = { "0,0": true, "0,1": true, "0,2": true, "0,3": true, "0,4": true };
    }
    if (type === "deck") item.slides = [{ title: "标题", body: "在这里写这一页要说的话。" }];
    if (type === "mind") {
      item.center = "中心主题";
      item.branches = ["分支 1", "分支 2"];
    }
    if (type === "flow") item.steps = [{ kind: "step", text: "开始" }, { kind: "choice", text: "是否继续" }, { kind: "step", text: "结束" }];
    if (type === "form" || type === "collect") item.questions = [{ prompt: "未命名题目", kind: "text" }];
    if (type === "board") item.notes = [{ text: "便签", x: 48, y: 48 }, { text: "再记一条", x: 220, y: 120 }];
    if (type === "base") {
      item.fields = ["名称", "状态", "备注"];
      item.rows = [["", "待记", ""]];
    }
    cloudDocs.unshift(item);
    openCloudDoc(item.id);
  }

  function closeNewMenu() {
    const menu = document.getElementById("docs-new-menu");
    const btn = document.getElementById("docs-new");
    if (menu) menu.hidden = true;
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  const newMenu = document.getElementById("docs-new-menu");
  if (newMenu) {
    let group = "";
    docTypes.forEach((spec) => {
      if (spec.group !== group) {
        group = spec.group;
        newMenu.appendChild(node("p", "", group));
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.newType = spec.type;
      const mark = node("i", "", spec.mark);
      mark.dataset.tone = spec.tone;
      const label = node("span", "");
      label.append(node("strong", "", spec.label), node("em", "", spec.hint));
      btn.append(mark, label);
      newMenu.appendChild(btn);
    });
  }

  document.getElementById("docs-new")?.addEventListener("click", () => {
    const menu = document.getElementById("docs-new-menu");
    const btn = document.getElementById("docs-new");
    if (!menu || !btn) return;
    const open = menu.hidden;
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("click", (e) => {
    if (e.target.closest(".docs-new-wrap")) return;
    closeNewMenu();
  });
  newMenu?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-new-type]");
    if (!btn) return;
    createCloudDoc(btn.dataset.newType);
    closeNewMenu();
  });
  document.getElementById("docs-share")?.addEventListener("click", () => {
    showToast("分享还等你同意。");
  });

  const docsView = document.getElementById("view-docs");
  docsView?.addEventListener("mousedown", (e) => {
    if (e.target.closest(".docs-tools button")) e.preventDefault();
  });
  docsView?.addEventListener("click", (e) => {
    const cmd = e.target.closest("[data-doc-cmd]");
    if (cmd) {
      document.getElementById("docs-body")?.focus();
      document.execCommand(cmd.dataset.docCmd, false, cmd.dataset.docArg || null);
      const doc = currentDoc();
      const body = document.getElementById("docs-body");
      if (doc && body) doc.html = body.innerHTML;
      return;
    }
    const act = e.target.closest("[data-docs-act]");
    if (!act) return;
    const doc = currentDoc();
    if (!doc) return;
    const action = act.dataset.docsAct;
    if (action === "bold-cell") {
      const key = `${activeCell.r},${activeCell.c}`;
      doc.bold[key] = !doc.bold[key];
      renderStage(doc);
    } else if (action === "add-row") {
      doc.cells.push(doc.cells[0].map(() => ""));
      renderStage(doc);
    } else if (action === "add-col") {
      doc.cells.forEach((row) => row.push(""));
      renderStage(doc);
    } else if (action === "add-slide") {
      doc.slides.push({ title: "标题", body: "" });
      doc.slide = doc.slides.length - 1;
      renderStage(doc);
    } else if (action === "del-slide" && doc.slides.length > 1) {
      doc.slides.splice(doc.slide, 1);
      doc.slide = Math.max(0, doc.slide - 1);
      renderStage(doc);
    } else if (action === "pick-slide") {
      doc.slide = Number(act.dataset.slide);
      renderStage(doc);
    } else if (action === "add-branch") {
      doc.branches.push("新分支");
      renderStage(doc);
    } else if (action === "add-step") {
      doc.steps.push({ kind: "step", text: "新步骤" });
      renderStage(doc);
    } else if (action === "add-choice") {
      doc.steps.push({ kind: "choice", text: "是否继续" });
      renderStage(doc);
    } else if (action === "add-question") {
      doc.questions.push({ prompt: "未命名题目", kind: "text" });
      renderStage(doc);
    } else if (action === "submit-form") {
      showToast("提交还等你同意。");
    } else if (action === "add-note") {
      doc.notes.push({ text: "便签", x: 48 + (doc.notes.length % 4) * 160, y: 48 + doc.notes.length * 28 });
      renderStage(doc);
    } else if (action === "add-record") {
      doc.rows.push(doc.fields.map(() => ""));
      renderStage(doc);
    } else if (action === "open-child") {
      openCloudDoc(act.dataset.child);
    }
  });
  docsView?.addEventListener("change", (e) => {
    const sel = e.target.closest("[data-doc-select]");
    if (sel) {
      document.getElementById("docs-body")?.focus();
      document.execCommand(sel.dataset.docSelect, false, sel.value);
      const doc = currentDoc();
      const body = document.getElementById("docs-body");
      if (doc && body) doc.html = body.innerHTML;
      return;
    }
    const kind = e.target.closest("[data-question-kind]");
    const doc = currentDoc();
    if (kind && doc) doc.questions[Number(kind.dataset.questionKind)].kind = kind.value;
  });
  docsView?.addEventListener("input", (e) => {
    const doc = currentDoc();
    if (!doc) return;
    const body = e.target.closest("#docs-body");
    if (body) doc.html = body.innerHTML;
    const cell = e.target.closest("[data-cell]");
    if (cell) {
      const r = Number(cell.dataset.r);
      const c = Number(cell.dataset.c);
      doc.cells[r][c] = cell.value;
      activeCell = { r, c };
      const formula = document.getElementById("docs-formula");
      const name = document.getElementById("docs-cell-name");
      if (formula && document.activeElement === cell) formula.value = cell.value;
      if (name) name.textContent = colName(c) + (r + 1);
      paintSum(doc);
    }
    if (e.target.id === "docs-formula") {
      doc.cells[activeCell.r][activeCell.c] = e.target.value;
      const input = docsView.querySelector(`[data-cell][data-r="${activeCell.r}"][data-c="${activeCell.c}"]`);
      if (input) input.value = e.target.value;
      paintSum(doc);
    }
    const slideField = e.target.closest("[data-slide-field]");
    if (slideField) doc.slides[doc.slide][slideField.dataset.slideField] = e.target.value;
    if (e.target.dataset.mind === "center") doc.center = e.target.value;
    if (e.target.dataset.mind === "branch") doc.branches[Number(e.target.dataset.index)] = e.target.value;
    if (e.target.dataset.flow != null) doc.steps[Number(e.target.dataset.flow)].text = e.target.value;
    if (e.target.dataset.question != null) doc.questions[Number(e.target.dataset.question)].prompt = e.target.value;
    if (e.target.dataset.note != null) doc.notes[Number(e.target.dataset.note)].text = e.target.value;
    if (e.target.dataset.field != null) doc.fields[Number(e.target.dataset.field)] = e.target.value;
    if (e.target.dataset.record != null) doc.rows[Number(e.target.dataset.record)][Number(e.target.dataset.c)] = e.target.value;
  });
  docsView?.addEventListener("focusin", (e) => {
    const cell = e.target.closest("[data-cell]");
    const doc = currentDoc();
    if (!cell || !doc) return;
    activeCell = { r: Number(cell.dataset.r), c: Number(cell.dataset.c) };
    docsView.querySelectorAll(".docs-grid td.is-on").forEach((td) => td.classList.remove("is-on"));
    cell.parentElement?.classList.add("is-on");
    const formula = document.getElementById("docs-formula");
    const name = document.getElementById("docs-cell-name");
    if (formula) formula.value = cell.value;
    if (name) name.textContent = colName(activeCell.c) + (activeCell.r + 1);
    paintSum(doc);
  });
  docsView?.addEventListener("blur", (e) => {
    const title = e.target.closest(".docs-name");
    const doc = currentDoc();
    if (!title || !doc) return;
    const next = title.textContent.trim();
    if (!next || next === doc.name) return;
    doc.name = next;
    paintDocsList(doc.id);
  }, true);

  openCloudDoc("lecture");

  setDates();
  renderAvatarMenu();

  document.getElementById("avatar-switch")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openAvatarPop(document.getElementById("avatar-switch"));
  });
  document.getElementById("agent-switch")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openAvatarPop(document.getElementById("agent-switch"));
  });
  document.getElementById("avatar-q")?.addEventListener("input", () => renderAvatarMenu());
  document.addEventListener("keydown", (e) => {
    const pop = document.getElementById("avatar-pop");
    if (e.key === "Escape" && pop && !pop.hidden) closeAvatarPop();
  });

  document.getElementById("owner-side")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-owner-side]");
    if (!btn) return;
    const side = btn.dataset.ownerSide;
    document.querySelectorAll("#owner-side .filter").forEach((chip) => {
      chip.classList.toggle("is-on", chip === btn);
    });
    document.querySelectorAll("[data-owner-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.ownerPanel !== side;
    });
  });

  document.getElementById("skill-guide")?.addEventListener("change", (e) => {
    showToast(e.target.checked
      ? "引导找到问题已打开。学生来问时，先找到卡住的那一句。"
      : "引导找到问题已关上。学生侧不再按这个技能回答。");
  });

  const summonMenu = document.getElementById("summon-menu");
  let summonText = "";
  let summonShot = "";

  function hideSummon() {
    if (summonMenu) summonMenu.hidden = true;
  }

  document.addEventListener("contextmenu", (e) => {
    const host = e.target.closest(".edit-sheet textarea, .edit-sheet input, .browser-doc, .docs-body");
    if (!host || !summonMenu) return;
    e.preventDefault();
    const field = e.target.closest("textarea, input");
    let selected = "";
    if (field && typeof field.selectionStart === "number" && field.selectionStart !== field.selectionEnd) {
      selected = field.value.slice(field.selectionStart, field.selectionEnd).trim();
    } else {
      selected = String(window.getSelection?.() || "").trim();
    }
    summonText = selected;
    summonShot = host.closest(".edit-sheet") ? "当前编辑区" : "当前页面";
    summonMenu.hidden = false;
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 88);
    summonMenu.style.left = `${x}px`;
    summonMenu.style.top = `${y}px`;
  });

  summonMenu?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-summon]");
    if (!btn) return;
    e.stopPropagation();
    hideSummon();
    if (btn.dataset.summon === "shot") {
      pushCitta(`截图 · ${summonShot}`);
      return;
    }
    if (!summonText) {
      showToast("先框选一段文字。");
      return;
    }
    pushCitta(`框选 · ${summonText}`);
  });

  document.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".work-decide")) closeGates();
    if (summonMenu && !summonMenu.hidden && !e.target.closest("#summon-menu")) hideSummon();
    const pop = document.getElementById("avatar-pop");
    if (
      pop &&
      !pop.hidden &&
      !e.target.closest("#avatar-pop") &&
      !e.target.closest("#avatar-switch") &&
      !e.target.closest("#agent-switch")
    ) {
      closeAvatarPop();
    }
  });
})();
