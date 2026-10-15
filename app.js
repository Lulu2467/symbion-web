/* Home v2 — tools first (Figma H0 1:4755 / tutorial 1:8541 / board 1:2180). Not Desktop Home 1:11405. */

const TOOLS = [
  { id: "doc", icon: "≡", label: "Doc" },
  { id: "deck", icon: "▧", label: "Deck" },
  { id: "numbers", icon: "▦", label: "Numbers" },
  { id: "symtex", icon: "Σ", label: "SymTex" },
  { id: "code", icon: "</>", label: "Code" }
];

const TEMPLATES = [
  { tool: "doc", title: "Essay, start to finish", hint: "Topic → outline → draft → citations" },
  { tool: "deck", title: "Class presentation", hint: "Notes or lecture → slides → speaker notes" },
  { tool: "numbers", title: "Data analysis", hint: "Upload CSV → trends → chart for your Deck" },
  { tool: "symtex", title: "Proof or problem set", hint: "Handwritten steps → typeset LaTeX" },
  { tool: "code", title: "Explain or fix my script", hint: "Paste code → explain → fix → test" }
];

/* Tutorial cards — Figma 1:8541 (Try each tool with Citta) */
const TRY_CARDS = [
  { id: "doc", title: "Lecture 1 — one-page summary", hint: "A Doc with headings + key formulas" },
  { id: "deck", title: "Lecture 1 — 6 study slides", hint: "A Deck you can present or revise" },
  { id: "numbers", title: "Plot the sPHENIX sample data", hint: "A sheet + chart, explained" },
  { id: "symtex", title: "Typeset the Bjorken energy formula", hint: "Clean LaTeX you can reuse" },
  { id: "code", title: "Run a tiny particle simulation", hint: "A Python notebook, commented" }
];

/** Switch AI menu (`1:7596`) — IN CONTEXT + DISCOVER */
const AI_IN_CONTEXT = [
  { id: "citta", label: "Citta", mark: "≋", meta: "Default · aware of every task", cls: "" },
  { id: "roland", label: "Prof. Roland’s twin", mark: "GR", meta: "Heavy-ion Physics · knows the slides", cls: "gr" },
  { id: "pajer", label: "Prof. Pajer’s twin", mark: "EP", meta: "Cosmology", cls: "ep" },
  { id: "xu", label: "Prof. Xu’s twin", mark: "HX", meta: "AI & decisions · stats, pricing", cls: "hx" }
];

const AI_DISCOVER = [
  { id: "lab", label: "Lab Report Coach", mark: "LR", meta: "AI agents · drafts lab reports in Doc", cls: "" }
];

const AI_OPTIONS = [...AI_IN_CONTEXT, ...AI_DISCOVER];

const AI_SWITCH_TOAST = {
  roland: "Now working with Prof. Roland’s twin — trained on Heavy-ion Physics lectures 1–5."
};

const AI_ASK_PLACEHOLDER = {
  roland: "Ask Prof. Roland’s twin — e.g. ‘Which lecture 5 topics are on the exam?’"
};

const state = {
  stage: "h0",
  reviewHighlight: "h0",
  dock: "collapsed",
  tool: null,
  ask: "",
  ai: "citta",
  aiOpen: false,
  aiPrev: null,
  tried: { doc: false, deck: false, numbers: false, symtex: false, code: false },
  weekHidden: false,
  interest: "Heavy-ion physics",
  pressed: {},
  joined: false,
  emailConnected: false,
  emailDismissed: false,
  reminderAdded: false,
  tipDismissed: false,
  peekTimer: null
};

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function on(id) {
  return state.pressed[id] ? " is-on" : "";
}

function toolMeta(id) {
  return TOOLS.find((t) => t.id === id);
}

function avatar(initials, size, cls) {
  return `<span class="avatar ${size}${cls ? " " + cls : ""}">${esc(initials)}</span>`;
}

function toolIcon(id, size) {
  const t = toolMeta(id);
  return `<span class="avatar ${size || "sm"} tool-${id}">${t.icon}</span>`;
}

function railHTML(avatars) {
  const items = ["›", "◉", "▤", "✣", "⚙"];
  return items
    .map((g, i) => `<button type="button" class="rail-btn${i === 1 ? " is-on" : ""}" data-press="rail-${i}">${g}</button>`)
    .join("") +
    `<div class="rail-rule"></div>` +
    `<div class="rail-avos">${avatars.map((a) => {
      const cls = a === "GR" ? "gr" : a === "EP" ? "ep" : a === "HX" ? "hx" : a === "王" ? "wang" : "";
      return avatar(a, "sm", cls);
    }).join("")}</div>`;
}

function dayStrip(cfg) {
  if (!cfg) return "";
  const nowPct = cfg.now ?? 14;
  const elapsed = cfg.elapsed ?? nowPct;
  const nowLabel = cfg.nowLabel || "now · 9:40";
  const events = (cfg.events || [])
    .map(
      (e) =>
        `<div class="day-event-wrap" style="left:${e.x}%">
          <span class="day-label"><span class="day-label-time">${esc(e.time)}</span> <span class="day-label-title">${esc(e.label)}</span></span>
          <span class="day-event" aria-hidden="true"></span>
        </div>`
    )
    .join("");
  return `<div class="your-day">
    <div class="your-day-top">
      <span class="your-day-heading">YOUR DAY</span>
      <span class="your-day-meta">${esc(cfg.status)}</span>
    </div>
    <div class="day-rail">
      <div class="day-track">
        <div class="day-elapsed" style="width:${elapsed}%"></div>
        <div class="day-now-wrap" style="left:${nowPct}%"><span class="day-now" aria-hidden="true"></span></div>
        ${events}
      </div>
      <div class="day-scale"><span>8 am</span><span>8 pm</span></div>
      <div class="day-now-label" style="left:${nowPct}%">${esc(nowLabel)}</div>
    </div>
  </div>`;
}

function toolChips(colored) {
  if (colored) {
    return TOOLS.map((t) => {
      const active = state.tool === t.id ? " is-on" : "";
      return `<button type="button" class="tool-tile${active}" data-tool="${t.id}" data-select-tool="${t.id}">
        <span class="ico">${t.icon}</span>${t.label}
      </button>`;
    }).join("");
  }
  return TOOLS.map((t) => {
    const active = state.tool === t.id ? " is-on" : "";
    return `<button type="button" class="tool-chip${active}" data-select-tool="${t.id}">${t.icon} ${t.label}</button>`;
  }).join("");
}

function attachLinks() {
  return `<div class="attach-links">
    <button type="button" data-press="attach">+ Attach file</button>
    <span> · </span>
    <button type="button" data-press="from-cosmo">From a Cosmo</button>
    <span> · </span>
    <button type="button" data-press="from-library">From Library</button>
  </div>`;
}

function continueChips(items) {
  return items
    .map((c) => {
      const t = toolMeta(c.tool);
      const pct = typeof c.pct === "number" ? c.pct : null;
      const label = pct === null ? "Done" : pct + "%";
      const width = pct === null ? 100 : pct;
      return `<button type="button" class="continue-chip${on("cont-" + c.id)}" data-press="cont-${esc(c.id)}" data-fill="${esc(c.title)}">
        <span>${t.icon}</span>
        <span>${esc(c.title)}</span>
        <span class="prog"><span class="prog-bar"><i style="width:${width}%"></i></span>${label}</span>
        <span>→</span>
      </button>`;
    })
    .join("") +
    `<button type="button" class="link-quiet${on("all-files")}" data-press="all-files">All files →</button>`;
}

function aiById(id) {
  return AI_OPTIONS.find((a) => a.id === id) || AI_IN_CONTEXT[0];
}

function composerPlaceholder(cfg) {
  if (AI_ASK_PLACEHOLDER[state.ai]) return AI_ASK_PLACEHOLDER[state.ai];
  if (state.ai !== "citta") {
    return `Ask ${aiById(state.ai).label}…`;
  }
  return cfg.placeholder;
}

function aiMenuSection(label, items) {
  return `<div class="ai-menu-section">
    <div class="ai-section-label">${esc(label)}</div>
    ${items
      .map((a) => {
        const selected = a.id === state.ai;
        return `<button type="button" class="ai-option${selected ? " is-on" : ""}" data-ai="${a.id}" role="option" aria-selected="${selected}">
          ${avatar(a.mark, "sm", a.cls)}
          <span class="ai-option-copy"><strong>${esc(a.label)}</strong><em>${esc(a.meta)}</em></span>
          ${selected ? '<span class="ai-check" aria-hidden="true">✓</span>' : ""}
        </button>`;
      })
      .join("")}
  </div>`;
}

function aiMenuHTML() {
  return `<div class="ai-menu" role="listbox" aria-label="Switch AI">
    <div class="ai-menu-head">
      <span class="ai-menu-kicker">WORKING WITH</span>
      <span class="ai-menu-rule">·</span>
      <span class="ai-menu-sub">switch anytime</span>
    </div>
    ${aiMenuSection("IN CONTEXT", AI_IN_CONTEXT)}
    <div class="ai-menu-divider"></div>
    ${aiMenuSection("DISCOVER", AI_DISCOVER)}
  </div>`;
}

function learnTipHTML() {
  if (state.stage !== "h1" || state.tipDismissed) return "";
  return `<div class="learn-tip" role="dialog" aria-label="Learning the tools">
    <span class="learn-tip-badge">NEW</span>
    <p class="learn-tip-title">You’re not limited to Citta</p>
    <p class="learn-tip-body">Tap ⇄ to hand this task to Prof. Roland’s twin for course-specific help, then switch back to Citta whenever you like.</p>
    <div class="learn-tip-actions">
      <button type="button" class="tip-btn ghost" data-tip-show>Show me</button>
      <button type="button" class="tip-btn solid" data-tip-dismiss>Got it</button>
    </div>
  </div>`;
}

function aiPickerHTML() {
  const current = aiById(state.ai);
  const onTwin = state.ai !== "citta";
  const menu = state.aiOpen ? aiMenuHTML() : "";
  const switchAvatars = (
    state.stage === "h0"
      ? [
          { mark: "GR", cls: "gr" },
          { mark: "EP", cls: "ep" },
          { mark: "LR", cls: "" }
        ]
      : [
          { mark: "EP", cls: "ep" },
          { mark: "JG", cls: "" },
          { mark: "LR", cls: "" }
        ]
  )
    .map((a) => `<span class="avatar xs switch-av${a.cls ? " " + a.cls : ""}">${esc(a.mark)}</span>`)
    .join("");
  const twinBadge = onTwin ? '<span class="twin-badge">+ Twin</span>' : "";
  const backCitta = onTwin
    ? `<button type="button" class="back-citta" data-back-citta>← Back to Citta</button>`
    : "";
  return `<div class="working-bar">
    <div class="working-left">
      <span class="working-kicker">WORKING WITH</span>
      <div class="ai-picker-wrap">
        <button type="button" class="ai-current${state.aiOpen ? " is-open" : ""}" data-toggle-ai aria-expanded="${state.aiOpen}">
          <span class="avatar sm${current.cls ? " " + current.cls : ""}">${esc(current.mark)}</span>
          <span class="ai-current-label">${esc(current.label)}</span>
          ${twinBadge}
          <span class="caret">▾</span>
        </button>
        <button type="button" class="ai-switch-btn" data-toggle-ai aria-label="Switch AI">⇄</button>
        ${menu}
      </div>
      ${backCitta}
    </div>
    <div class="working-right">
      <button type="button" class="working-status" data-toggle-ai>
        <span class="switch-label">or switch to</span>
        <span class="switch-stack">${switchAvatars}</span>
        <span>your twins &amp; AI agents — anytime</span>
      </button>
      ${learnTipHTML()}
    </div>
  </div>`;
}

function composerHTML(cfg) {
  const hero = !!cfg.hero;
  const placeholder = composerPlaceholder(cfg);
  const tools = toolChips(true);
  let foot = "";
  if (cfg.startWith) {
    foot = `<div class="suggest-row">
      <span class="suggest-label">START WITH</span>
      ${cfg.startWith
        .map(
          (s, i) =>
            `<button type="button" class="chip${on("start-" + i)}" data-press="start-${i}" data-fill="${esc(s)}">${esc(s)}</button>`
        )
        .join("")}
    </div>`;
  } else if (cfg.continueWith && !hero) {
    foot = `<div class="continue-row">
      <span class="continue-label">CONTINUE WITH</span>
      ${continueChips(cfg.continueWith)}
    </div>`;
  }

  const top = `<div class="${hero ? "composer-top" : ""}">
    ${aiPickerHTML()}
    <div class="composer-row">
      <input class="composer-input" id="ask" type="text" placeholder="${esc(placeholder)}" value="${esc(state.ask)}">
      <button type="button" class="send${on("send")}" data-press="send" aria-label="Send">↗</button>
    </div>
    <div class="tool-row">
      ${tools}
      ${attachLinks()}
    </div>
    ${hero ? "" : foot}
  </div>`;

  let heroFoot = "";
  if (hero && cfg.continueWith) {
    heroFoot = `<div class="composer-foot">
          <span class="continue-label">CONTINUE WITH</span>
          ${continueChips(cfg.continueWith)}
        </div>`;
  } else if (hero && cfg.startWith) {
    heroFoot = `<div class="composer-foot">
          <span class="continue-label">START WITH</span>
          ${cfg.startWith
            .map(
              (s, i) =>
                `<button type="button" class="chip${on("start-" + i)}" data-press="start-${i}" data-fill="${esc(s)}">${esc(s)}</button>`
            )
            .join("")}
        </div>`;
  }

  return `<section class="composer${hero ? " hero" : " proposed"}">${top}${heroFoot}</section>`;
}

function discoverHTML(cfg) {
  const interests = cfg.interests
    .map((name) => {
      const id = "int-" + name;
      return `<button type="button" class="interest${state.interest === name || on(id) ? " is-on" : ""}" data-interest="${esc(name)}">${esc(name)}</button>`;
    })
    .join("");
  const cards = cfg.cards
    .map((c) => {
      let badge = "";
      if (c.twin) badge = `<span class="badge-mini twin">+ Twin</span>`;
      else if (c.agent) badge = `<span class="badge-mini agent">AI agent</span>`;
      const addSi = c.twin
        ? `<button type="button" class="add-si${on("add-" + c.initials)}" data-press="add-${esc(c.initials)}">+ Add SI</button>`
        : "";
      return `<div class="disc-card">
        ${avatar(c.initials, "sm", c.cls || "")}
        <div class="disc-card-copy">
          <div class="name" title="${esc(c.name)}"><span class="name-text">${esc(c.short || c.name)}</span>${badge}</div>
          <div class="meta">${esc(c.meta)}</div>
        </div>
        ${addSi}
      </div>`;
    })
    .join("");
  return `<section class="discover">
    <span class="discover-label">${esc(cfg.label)}</span>
    ${interests}
    <span class="disc-rule"></span>
    <div class="disc-scroll">${cards}</div>
    <div class="disc-more">
      <button type="button" class="scroll-btn${on("disc-scroll")}" data-press="disc-scroll">›</button>
      <button type="button" class="link-quiet${on("browse-all")}" data-press="browse-all">Browse all ↗</button>
    </div>
  </section>`;
}

function trySectionHTML() {
  const cards = TRY_CARDS.map((c) => {
    const tried = state.tried[c.id];
    return `<article class="try-card">
      <div class="top">${toolIcon(c.id)}<h3>${toolMeta(c.id).label}</h3></div>
      <p class="lead">${esc(c.title)}</p>
      <p class="hint">${esc(c.hint)}</p>
      <button type="button" class="btn-try${tried ? " tried is-on" : ""}" data-try="${c.id}">
        ${tried ? "✓ Tried" : "≋ Try it"}
      </button>
    </article>`;
  }).join("");
  return `<section class="tutorial-strip" id="tutorial-8541" aria-labelledby="tutorial-8541-title">
    <div class="section-head">
      <h2 id="tutorial-8541-title">Try each tool with Citta</h2>
      <span class="sub">1 minute each · uses Prof. Roland’s course material</span>
      <span class="spacer"></span>
    </div>
    <div class="try-row">${cards}</div>
  </section>`;
}

function goalsHTML() {
  const cards = TEMPLATES.map((t) => {
    return `<article class="goal-card">
      <div class="top">${toolIcon(t.tool)}<h3>${toolMeta(t.tool).label}</h3></div>
      <p class="lead">${esc(t.title)}</p>
      <p class="hint">${esc(t.hint)}</p>
      <button type="button" class="btn-use${on("use-" + t.tool)}" data-press="use-${t.tool}" data-select-tool="${t.tool}" data-fill="${esc(t.title)}">Use with Citta</button>
    </article>`;
  }).join("");
  return `
    <div class="section-head">
      <h2>Start from a goal</h2>
      <span class="sub">Templates with Citta built in</span>
      <span class="spacer"></span>
      <button type="button" class="see link-quiet${on("see-all")}" data-press="see-all">See all</button>
    </div>
    <div class="goal-row">${cards}</div>`;
}

function toolsWeekHTML() {
  if (state.weekHidden) return "";
  const items = [
    { id: "doc", file: "Lecture 1 summary", act: "Open →", tried: true },
    { id: "deck", file: "6 study slides", act: "Open →", tried: true },
    { id: "numbers", file: "Chart your lab data", act: "Try with Citta →", tried: state.tried.numbers },
    { id: "symtex", file: "Typeset a formula", act: "Try with Citta →", tried: state.tried.symtex },
    { id: "code", file: "Run a simulation", act: "Try with Citta →", tried: state.tried.code }
  ];
  const count = items.filter((i) => i.tried).length;
  const cards = items
    .map((i) => {
      return `<div class="week-tool${i.tried ? " tried" : ""}">
        <div class="top">
          ${toolIcon(i.id)}
          <strong>${toolMeta(i.id).label}</strong>
          <span class="mark${i.tried ? "" : " open"}">${i.tried ? "✓" : "○"}</span>
        </div>
        <p class="file">${esc(i.file)}</p>
        <button type="button" class="act${on("week-" + i.id)}" data-press="week-${i.id}" ${
          i.tried ? "" : `data-try="${i.id}"`
        }>${esc(i.act)}</button>
      </div>`;
    })
    .join("");
  return `<section class="tools-week">
    <div class="tools-week-head">
      <h2>Your tools this week</h2>
      <span class="badge">${count} of 5 tried</span>
      <span class="spacer"></span>
      <button type="button" class="dismiss" data-dismiss-week aria-label="Dismiss">✕</button>
    </div>
    <div class="tools-week-row">${cards}</div>
  </section>`;
}

function remindersEmptyHTML() {
  return `<div>
    <div class="reminders-head">
      <h2>Reminders</h2>
      <span class="sub">Nothing yet</span>
      <span class="spacer"></span>
    </div>
    <div class="empty-card">
      <div class="col">
        <p class="title">Join Heavy-ion Physics</p>
        <p class="desc">Get lecture and deadline reminders from the course</p>
      </div>
      <button type="button" class="btn-primary${state.joined ? " is-on" : ""}" data-join-course>
        ${state.joined ? "Joined" : "Join course"}
      </button>
    </div>
    <div class="empty-card">
      <div class="col">
        <p class="title">Connect your email</p>
        <p class="desc">Citta flags emails that need a reply and drafts it in Doc</p>
      </div>
      <button type="button" class="btn-secondary${state.emailConnected ? " is-on" : ""}" data-connect-email>
        ${state.emailConnected ? "Connected" : "Connect"}
      </button>
    </div>
    <div class="empty-card">
      <div class="col">
        <p class="title">Add your own</p>
        <p class="desc">Or tell Citta: “remind me to finish my lab on Friday”</p>
      </div>
      <button type="button" class="btn-secondary${state.reminderAdded ? " is-on" : ""}" data-add-reminder>
        ${state.reminderAdded ? "Added" : "+ Add reminder"}
      </button>
    </div>
  </div>`;
}

function reminderRows(rows, head) {
  const list = rows
    .map((r) => {
      return `<div class="reminder-row">
        <div class="time-col">${esc(r.when)}</div>
        <div class="col">
          <p class="title">${esc(r.title)}</p>
          <div class="meta-row">
            <span class="tag${r.tagClass ? " " + r.tagClass : ""}">${esc(r.tag)}</span>
            ${r.extra ? `<span>${esc(r.extra)}</span>` : ""}
          </div>
        </div>
        <button type="button" class="btn-citta${on("rem-" + r.id)}" data-press="rem-${esc(r.id)}" data-fill="${esc(r.action)}">≋ ${esc(r.action)}</button>
      </div>`;
    })
    .join("");
  return `<div>
    <div class="reminders-head">
      <h2>${esc(head.title)}</h2>
      <span class="sub">${esc(head.sub)}</span>
      <span class="spacer"></span>
      <button type="button" class="link-quiet${on("add-rem")}" data-press="add-rem">+ Add</button>
    </div>
    ${list}
    ${head.emailPrompt && !state.emailDismissed && !state.emailConnected
      ? `<div class="email-prompt">
          <p>Connect email so Citta can flag replies you owe and draft them.</p>
          <button type="button" class="btn-secondary${on("connect-h1")}" data-connect-email>Connect</button>
          <button type="button" class="not-now${on("not-now")}" data-dismiss-email>Not now</button>
        </div>`
      : ""}
  </div>`;
}

function activityHTML(cfg) {
  if (cfg.collapsed) {
    return `<aside class="activity collapsed">
      <div class="activity-head"><h2>${esc(cfg.title)}</h2></div>
      <p class="summary">${esc(cfg.summary)}</p>
      <button type="button" class="btn-secondary${on("see-new")}" data-press="see-new">${esc(cfg.cta)}</button>
    </aside>`;
  }
  const ready = cfg.ready
    ? `<div class="activity-ready">
        <span class="ready-dot"></span>
        <span>${esc(cfg.ready.text)}</span>
        <button type="button" class="act${on("ready")}" data-press="ready">${esc(cfg.ready.act)}</button>
      </div>`
    : "";
  const items = cfg.items
    .map((a) => {
      const cls = a.initials === "GR" ? "gr" : a.initials === "EP" ? "ep" : a.initials === "HX" ? "hx" : a.initials === "王" ? "wang" : "";
      return `<div class="activity-item">
        ${avatar(a.initials, "md", cls)}
        <div class="col">
          <p class="title">${esc(a.title)}</p>
          <p class="meta">${esc(a.meta)}</p>
          ${a.act ? `<button type="button" class="act${on("act-" + a.id)}" data-press="act-${esc(a.id)}">${esc(a.act)}</button>` : ""}
        </div>
      </div>`;
    })
    .join("");
  return `<aside class="activity">
    <div class="activity-head">
      <h2>${esc(cfg.title)}</h2>
      <span class="spacer"></span>
      ${cfg.count ? `<span class="count">${esc(cfg.count)}</span>` : ""}
    </div>
    ${ready}
    ${items}
  </aside>`;
}

function pickupHTML() {
  const rows = [
    {
      id: "miss-report",
      when: "Missed",
      title: "Reading report was due Tuesday",
      tag: "Course · Prof. Roland",
      extra: "820 / 1,500 words · extension request?",
      action: "Finish it with Citta"
    },
    {
      id: "miss-lectures",
      when: "Missed",
      title: "Lectures 6 and 7",
      tag: "Course · Prof. Roland",
      extra: "2 lectures · 1h 40m",
      action: "Make catch-up notes"
    },
    {
      id: "miss-reply",
      when: "Today",
      title: "Reply to Prof. Roland (sent 8 days ago)",
      tag: "Email",
      tagClass: "email",
      action: "Draft reply"
    }
  ];
  return `<section class="pickup">
    <h2>Pick up where you left off</h2>
    ${rows
      .map(
        (r) => `<div class="reminder-row">
      <div class="time-col">${esc(r.when)}</div>
      <div class="col">
        <p class="title">${esc(r.title)}</p>
        <div class="meta-row">
          <span class="tag${r.tagClass ? " " + r.tagClass : ""}">${esc(r.tag)}</span>
          ${r.extra ? `<span>${esc(r.extra)}</span>` : ""}
        </div>
      </div>
      <button type="button" class="btn-citta${on("pu-" + r.id)}" data-press="pu-${esc(r.id)}" data-fill="${esc(r.action)}">≋ ${esc(r.action)}</button>
    </div>`
      )
      .join("")}
  </section>`;
}

const STAGES = {
  h0: {
    rail: ["GR"],
    arrival: true,
    greeting: {
      quiet: false,
      eyebrow: "MONDAY 12 OCTOBER · YOUR FIRST DAY",
      title: "Welcome, Jess",
      sub: "You came in from Heavy-ion Physics. Pick a tool below and Citta will show you around."
    },
    composer: {
      hero: true,
      placeholder: "What do you want to work on? Try a suggestion below.",
      startWith: [
        "Summarise Prof. Roland’s lecture 1 in one page",
        "Explain quark-gluon plasma for my notes",
        "Start my reading report outline"
      ]
    },
    discover: {
      label: "More in",
      interests: ["Heavy-ion physics", "Physics & Space"],
      cards: [
        { initials: "EP", name: "Enrico Pajer", short: "Enrico Pajer", meta: "Cosmology · Cambridge", twin: true, cls: "ep" },
        { initials: "JG", name: "Julia R. Greer", short: "Julia R. Greer", meta: "Materials · Caltech", twin: true },
        { initials: "PC", name: "Physics Problem Coach", short: "Physics Problem Coach", meta: "Step-by-step in SymTex", agent: true, cls: "pc" },
        { initials: "GW", name: "Gauge Theory 101", short: "Gauge Theory 101", meta: "Course · MIT OCW" }
      ]
    },
    try: true,
    reminders: "empty",
    activity: {
      title: "From Prof. Roland’s Cosmo",
      items: [
        { id: "a1", initials: "GR", title: "Lecture 5 slides posted", meta: "Heavy-ion Physics · 1h ago", act: "Turn into study notes →" },
        { id: "a2", initials: "GR", title: "Prof. Roland goes live Thu 7pm (the real person)", meta: "His twin has a recap of the last Q&A", act: "Set reminder →" }
      ]
    },
    goals: true
  },
  h1: {
    rail: ["GR", "EP"],
    greeting: {
      quiet: false,
      eyebrow: "MONDAY 12 OCTOBER · DAY 3 WITH SYMBION",
      title: "Good morning, Jess",
      sub: "Lecture 5 is at 2:30. Want Citta to prep a 10-minute deck before you go?",
      day: {
        status: "1 thing today",
        elapsed: 14,
        now: 14,
        events: [{ x: 54, time: "2:30", label: "Lecture 5" }]
      }
    },
    composer: {
      placeholder: "What do you want to work on?",
      continueWith: [
        { id: "l1s", tool: "doc", title: "Lecture 1 summary", pct: null },
        { id: "l1d", tool: "deck", title: "Lecture 1 slides", pct: 80 }
      ]
    },
    discover: {
      label: "Discover in",
      interests: ["Physics & Space", "Cosmology", "+"],
      cards: [
        { initials: "JG", name: "Julia R. Greer", short: "Julia R. Greer", meta: "Materials · Caltech", twin: true },
        { initials: "AR", name: "Anastasia Romanou", short: "Anastasia Romanou", meta: "Climate maths · Columbia", twin: true },
        { initials: "LR", name: "Lab Report Coach", short: "Lab Report Coach", meta: "Drafts in Doc", twin: false },
        { initials: "KS", name: "Katherine F. Smith", short: "Katherine F. Smith", meta: "Planetary health · Brown", twin: true }
      ]
    },
    toolsWeek: true,
    learnTip: true,
    reminders: {
      title: "Reminders",
      sub: "Course · Yours",
      emailPrompt: true,
      rows: [
        { id: "lec3", when: "2:30", title: "Heavy-ion Physics — lecture 3", tag: "Course · Prof. Roland", action: "Prep a 10-min deck" },
        { id: "report", when: "Fri", title: "Reading report due", tag: "Course · Prof. Roland", action: "Outline it with Citta" }
      ]
    },
    activity: {
      title: "From your Cosmos",
      count: "3 new",
      ready: {
        text: "Deck “Lecture 4 summary” is ready",
        act: "Review →"
      },
      items: [
        { id: "b1", initials: "GR", title: "Prof. Roland’s twin posted lecture 3 slides", meta: "Heavy-ion Physics · 2d ago", act: "Turn into study notes →" },
        { id: "b2", initials: "EP", title: "Prof. Pajer’s twin answered a popular question", meta: "Cosmology · 1.2k found helpful", act: "Read →" }
      ]
    },
    goals: true
  },
  h2: {
    rail: ["GR", "王", "EP", "HX"],
    variantB: true,
    greeting: {
      quiet: true,
      eyebrow: "MONDAY 12 OCTOBER · WEEK 6 OF FALL TERM",
      title: "Good morning, Jess",
      sub: "Lecture 5 is at 2:30, your reading report is 55% there, and a reply to Prof. Roland is ready.",
      day: {
        status: "1 thing today",
        elapsed: 14,
        now: 14,
        events: [{ x: 54, time: "2:30", label: "Lecture 5" }]
      }
    },
    composer: {
      hero: true,
      placeholder: "What do you want to work on?",
      continueWith: [
        { id: "l4", tool: "deck", title: "Lecture 4 summary", pct: 60 },
        { id: "qgp", tool: "doc", title: "Reading report — QGP", pct: 55 },
        { id: "lab3", tool: "numbers", title: "Lab 3", pct: 30 }
      ]
    },
    discover: {
      label: "Discover in",
      interests: ["Physics & Space", "AI & Data", "Cosmology", "+"],
      cards: [
        { initials: "JG", name: "Julia R. Greer", short: "Julia R. Greer", meta: "Materials · Caltech", twin: true },
        { initials: "AR", name: "Anastasia Romanou", short: "Anastasia Romanou", meta: "Climate maths · Columbia", twin: true },
        { initials: "LR", name: "Lab Report Coach", short: "Lab Report Coach", meta: "Drafts in Doc", twin: false },
        { initials: "KS", name: "Katherine F. Smith", short: "Katherine F. Smith", meta: "Planetary health · Brown", twin: true }
      ]
    },
    reminders: {
      title: "Reminders",
      sub: "Course · Email · Yours",
      rows: [
        { id: "lec5", when: "2:30", title: "Heavy-ion Physics — lecture 5", tag: "Course · Prof. Roland", extra: "Room 6-120", action: "Prep a 10-min deck" },
        { id: "reply", when: "Today", title: "Reply to Prof. Roland about the lab report", tag: "Email", tagClass: "email", extra: "Received 9:12", action: "Draft reply" },
        { id: "submit", when: "Tomorrow", title: "Submit reading report", tag: "Course · Prof. Roland", extra: "820 / 1,500 words", action: "Finish with Citta" },
        { id: "lab", when: "Fri", title: "Lab 3 analysis due", tag: "Yours", tagClass: "yours", action: "Open in Numbers" }
      ]
    },
    activity: {
      title: "From your Cosmos",
      count: "5 new",
      items: [
        { id: "c1", initials: "GR", title: "Prof. Roland’s twin posted lecture 5 slides", meta: "Heavy-ion Physics · 1h ago", act: "Turn into study notes →" },
        { id: "c2", initials: "王", title: "骆王宇 is going live soon (the real person)", meta: "Live at 3:10 · twin has a recap ready", act: "Set reminder →" },
        { id: "c3", initials: "EP", title: "2 replies to your #cosmology thread", meta: "Prof. Pajer’s twin + @maya_k", act: "Open thread →" },
        { id: "c4", initials: "HX", title: "Prof. Xu’s twin: new insight on pricing data", meta: "AI & decisions · today", act: "View insight →" }
      ]
    },
    goals: true
  },
  h3: {
    rail: ["GR", "王", "EP", "HX"],
    greeting: {
      quiet: false,
      eyebrow: "MONDAY 12 OCTOBER · 9 DAYS SINCE YOUR LAST VISIT",
      title: "Welcome back, Jess",
      sub: "Everything is where you left it. Your reading report is due tomorrow.",
      day: {
        status: "Report due tmrw",
        elapsed: 14,
        now: 14,
        events: [{ x: 54, time: "2:30", label: "Lecture 5" }]
      }
    },
    composer: {
      placeholder: "What do you want to work on?",
      continueWith: [
        { id: "qgp", tool: "doc", title: "Reading report — QGP", pct: 55 },
        { id: "l4", tool: "deck", title: "Lecture 4 summary", pct: 60 },
        { id: "lab3", tool: "numbers", title: "Lab 3", pct: 30 }
      ]
    },
    discover: {
      label: "Discover in",
      interests: ["Physics & Space", "AI & Data", "Cosmology", "+"],
      cards: [
        { initials: "JG", name: "Julia R. Greer", short: "Julia R. Greer", meta: "Materials · Caltech", twin: true },
        { initials: "AR", name: "Anastasia Romanou", short: "Anastasia Romanou", meta: "Climate maths · Columbia", twin: true },
        { initials: "LR", name: "Lab Report Coach", short: "Lab Report Coach", meta: "Drafts in Doc", twin: false },
        { initials: "KS", name: "Katherine F. Smith", short: "Katherine F. Smith", meta: "Planetary health · Brown", twin: true }
      ]
    },
    pickup: true,
    reminders: {
      title: "Coming up",
      sub: "Course · Email · Yours",
      rows: [
        { id: "lec8", when: "Thu", title: "Heavy-ion Physics — lecture 8", tag: "Course · Prof. Roland", action: "Prep a 10-min deck" },
        { id: "lab", when: "Fri", title: "Lab 3 analysis due", tag: "Yours", tagClass: "yours", action: "Open in Numbers" }
      ]
    },
    activity: {
      collapsed: true,
      title: "From your Cosmos",
      summary: "14 updates while you were away · 3 replies to your threads · 2 new lectures",
      cta: "See what’s new"
    }
  }
};

function withSpecState(patch, fn) {
  const saved = {};
  Object.keys(patch).forEach((k) => {
    saved[k] = state[k];
    state[k] = patch[k];
  });
  const html = fn();
  Object.keys(patch).forEach((k) => {
    state[k] = saved[k];
  });
  return html;
}

function compSection(title, body) {
  return `<section class="comp-section">
    <h2 class="comp-section-title">${esc(title)}</h2>
    <div class="comp-section-body">${body}</div>
  </section>`;
}

function componentsHTML() {
  const h0Composer = withSpecState(
    { tool: "doc", ask: "", ai: "citta", aiOpen: false, stage: "h0", tipDismissed: true },
    () => composerHTML(STAGES.h0.composer)
  );
  const h2Composer = withSpecState(
    { tool: "deck", ask: "", ai: "citta", aiOpen: false, stage: "h2", tipDismissed: true },
    () => composerHTML(STAGES.h2.composer)
  );
  const toolTiles = withSpecState({ tool: "numbers" }, () => toolChips(true));
  const toolChipsPlain = withSpecState({ tool: null }, () => toolChips(false));
  const startChips = withSpecState({ stage: "h0" }, () => {
    const cfg = STAGES.h0.composer;
    return cfg.startWith
      .map(
        (s, i) =>
          `<button type="button" class="chip" tabindex="-1">${esc(s)}</button>`
      )
      .join("");
  });
  const continueSample = withSpecState({ stage: "h2" }, () =>
    continueChips(STAGES.h2.composer.continueWith.slice(0, 2))
  );
  const discoverSample = withSpecState({ interest: "Physics & Space" }, () => discoverHTML(STAGES.h0.discover));
  const tryCard = (() => {
    const c = TRY_CARDS[0];
    return `<article class="try-card comp-card">
      <div class="top">${toolIcon(c.id)}<h3>${toolMeta(c.id).label}</h3></div>
      <p class="lead">${esc(c.title)}</p>
      <p class="hint">${esc(c.hint)}</p>
      <button type="button" class="btn-try" tabindex="-1">≋ Try it</button>
    </article>
    <article class="try-card comp-card tried">
      <div class="top">${toolIcon(c.id)}<h3>${toolMeta(c.id).label}</h3></div>
      <p class="lead">${esc(c.title)}</p>
      <p class="hint">${esc(c.hint)}</p>
      <button type="button" class="btn-try tried is-on" tabindex="-1">✓ Tried</button>
    </article>`;
  })();
  const goalCard = (() => {
    const t = TEMPLATES[1];
    return `<article class="goal-card comp-card">
      <div class="top">${toolIcon(t.tool)}<h3>${toolMeta(t.tool).label}</h3></div>
      <p class="lead">${esc(t.title)}</p>
      <p class="hint">${esc(t.hint)}</p>
      <button type="button" class="btn-use" tabindex="-1">Use with Citta</button>
    </article>`;
  })();
  const reminderSample = (() => {
    const r = STAGES.h2.reminders.rows[0];
    return `<div class="reminder-row comp-row-spec">
      <div class="time-col">${esc(r.when)}</div>
      <div class="col">
        <p class="title">${esc(r.title)}</p>
        <div class="meta-row">
          <span class="tag">${esc(r.tag)}</span>
          ${r.extra ? `<span>${esc(r.extra)}</span>` : ""}
        </div>
      </div>
      <button type="button" class="btn-citta" tabindex="-1">≋ ${esc(r.action)}</button>
    </div>`;
  })();
  const learnTip = withSpecState({ stage: "h1", tipDismissed: false }, () => learnTipHTML());
  const aiPickerOpen = withSpecState(
    { aiOpen: true, ai: "citta", stage: "h2", tipDismissed: true },
    () => aiPickerHTML()
  );
  const dockExpandedSpec = `<div class="dock-panel comp-inert">
      <div class="dock-panel-top">
        ${avatar("≋", "md")}
        <strong>Citta</strong>
        <span class="dock-icon-btn" aria-hidden="true">⇥</span>
        <span class="dock-icon-btn" aria-hidden="true">—</span>
      </div>
      <div class="dock-body">
        <div class="dock-msg">I can start any tool from here — Doc, Deck, Numbers, SymTex, or Code — using your Cosmo material.</div>
        <div class="dock-msg">Try: “Prep a 10-min deck for lecture 5.”</div>
      </div>
      <div class="dock-input-row">
        <input type="text" placeholder="Message Citta…" tabindex="-1" readonly>
        <span class="send" aria-hidden="true">↗</span>
      </div>
    </div>`;
  const dockStrip = `<div class="comp-dock-stage">
    <p class="comp-dock-kicker">Citta — anchored to the bottom-right of the window</p>
    <div class="comp-dock-row">
      <div class="comp-dock-item">
        <span class="comp-dock-label">Collapsed (default)</span>
        <div class="comp-dock-spec"><span class="dock-bubble">≋<span class="dock-badge">1</span></span></div>
      </div>
      <div class="comp-dock-item">
        <span class="comp-dock-label">Peek</span>
        <div class="comp-dock-spec"><span class="dock-peek"><span class="bubble">≋</span><span class="line">Lecture 1 summary is ready in Doc</span></span></div>
      </div>
      <div class="comp-dock-item comp-dock-item--panel">
        <span class="comp-dock-label">Expanded</span>
        <div class="comp-dock-spec">${dockExpandedSpec}</div>
      </div>
      <div class="comp-dock-item comp-dock-item--side">
        <span class="comp-dock-label">Docked</span>
        <div class="comp-dock-spec comp-dock-side comp-inert">${sideDockHTML()}</div>
      </div>
    </div>
  </div>`;

  return `<div class="components-sheet" id="components-108-391">
    <header class="components-head">
      <h1>组件 · Components</h1>
      <p class="components-meta">Figma <code>108:391</code> · shared primitives for H0–H3 (copy from stage frames, not invented here)</p>
    </header>
    ${compSection(
      "Composer · WORKING WITH",
      `<div class="comp-stack">
        <p class="comp-caption">Proposed (H0 · <code>1:4755</code>)</p>
        <div class="comp-inert">${h0Composer}</div>
        <p class="comp-caption">Hero + CONTINUE WITH footer (H2 · <code>1:6089</code>)</p>
        <div class="comp-inert">${h2Composer}</div>
      </div>`
    )}
    ${compSection(
      "AI picker · menu open",
      `<div class="comp-inert comp-ai-menu-spec">${aiPickerOpen}</div>`
    )}
    ${compSection(
      "Tool row",
      `<div class="tool-row comp-inert">${toolTiles}${attachLinks()}</div>
       <p class="comp-caption">Plain chips (non-composer contexts)</p>
       <div class="comp-inert">${toolChipsPlain}</div>`
    )}
    ${compSection(
      "Suggestion & continue chips",
      `<div class="suggest-row comp-inert"><span class="suggest-label">START WITH</span>${startChips}</div>
       <div class="continue-row comp-inert"><span class="continue-label">CONTINUE WITH</span>${continueSample}</div>`
    )}
    ${compSection(
      "Buttons",
      `<div class="comp-btn-row comp-inert">
        <button type="button" class="btn-try" tabindex="-1">≋ Try it</button>
        <button type="button" class="btn-use" tabindex="-1">Use with Citta</button>
        <button type="button" class="btn-primary" tabindex="-1">Join course</button>
        <button type="button" class="btn-secondary" tabindex="-1">Connect</button>
        <button type="button" class="btn-ghost" tabindex="-1">Back to the Cosmo ↗</button>
        <button type="button" class="btn-citta" tabindex="-1">≋ Prep a 10-min deck</button>
        <button type="button" class="send" tabindex="-1" aria-hidden="true">↗</button>
      </div>`
    )}
    ${compSection("Try it & goal cards", `<div class="comp-card-row comp-inert">${tryCard}${goalCard}</div>`)}
    ${compSection("Discover strip", `<div class="comp-inert">${discoverSample}</div>`)}
    ${compSection("Reminder row & tags", `<div class="comp-inert">${reminderSample}
      <div class="comp-tag-row">
        <span class="tag">Course · Prof. Roland</span>
        <span class="tag email">Email</span>
        <span class="tag yours">Yours</span>
        <span class="badge-mini">✦ Twin</span>
        <span class="badge-mini agent">AI agent</span>
      </div></div>`)}
    ${learnTip ? compSection("Learning tip (H1)", `<div class="comp-inert comp-tip-spec">${learnTip}</div>`) : ""}
    ${compSection("Citta dock", dockStrip)}
  </div>`;
}

function contentHTML() {
  if (state.stage === "components") return componentsHTML();
  const s = STAGES[state.stage];
  let html = "";

  if (s.arrival) {
    html += `<div class="arrival">
      ${avatar("GR", "md", "gr")}
      <div class="arrival-text">You came from Prof. Roland’s Cosmo · Heavy-ion Physics</div>
      <button type="button" class="btn-ghost${on("back-cosmo")}" data-press="back-cosmo">Back to the Cosmo ↗</button>
    </div>`;
  }

  const g = s.greeting;
  let titleHTML = esc(g.title).replace(
    /\b(Jess)\b/g,
    '<span class="name-accent">$1</span>'
  );
  if (state.stage === "h0") {
    titleHTML = 'Welcome, <span class="name-accent">Jess</span>';
  }
  let subHTML = esc(g.sub).replace(
    /(due tomorrow)/gi,
    '<strong class="due-accent">$1</strong>'
  );
  if (state.stage === "h0") {
    subHTML =
      'You came in from <span class="text-accent">Heavy-ion Physics. Pick a tool below</span> and Citta will show you around.';
  }
  const showSunOrb = !g.quiet && state.stage !== "h0";
  const showEyebrowDot = state.stage !== "h0";
  const eyebrowPrefix =
    state.stage === "h0"
      ? '<span class="eyebrow-sun" aria-hidden="true">☀️</span>'
      : showEyebrowDot
        ? '<span class="dot-time"></span>'
        : "";
  html += `<section class="greeting${g.quiet ? " quiet" : ""}${state.stage === "h0" ? " first-day" : ""}">
    ${showSunOrb ? '<div class="sun" aria-hidden="true"></div>' : ""}
    <div class="hello">
      <div class="eyebrow">${eyebrowPrefix}${esc(g.eyebrow)}</div>
      <h1>${titleHTML}</h1>
      <p>${subHTML}</p>
    </div>
    ${dayStrip(g.day)}
  </section>`;

  html += composerHTML(s.composer);
  html += discoverHTML(s.discover);
  if (s.try) html += trySectionHTML();
  if (s.toolsWeek) html += toolsWeekHTML();
  if (s.pickup) html += pickupHTML();

  if (s.reminders === "empty") {
    html += `<div class="split">${remindersEmptyHTML()}${activityHTML(s.activity)}</div>`;
  } else if (s.reminders) {
    html += `<div class="split">${reminderRows(s.reminders.rows, s.reminders)}${activityHTML(s.activity)}</div>`;
  }

  if (s.goals) html += goalsHTML();
  return html;
}

function dockHTML() {
  if (state.dock === "peek") {
    return `<button type="button" class="dock-peek" data-dock-cycle title="Citta">
      <span class="bubble">≋</span>
      <span class="line">Lecture 1 summary is ready in Doc</span>
    </button>`;
  }
  if (state.dock === "expanded") {
    return `<div class="dock-panel">
      <div class="dock-panel-top">
        ${avatar("≋", "md")}
        <strong>Citta</strong>
        <button type="button" class="dock-icon-btn" data-set-dock="docked" title="Dock">⇥</button>
        <button type="button" class="dock-icon-btn" data-set-dock="collapsed" title="Collapse">—</button>
      </div>
      <div class="dock-body">
        <div class="dock-msg">I can start any tool from here — Doc, Deck, Numbers, SymTex, or Code — using your Cosmo material.</div>
        <div class="dock-msg">Try: “Prep a 10-min deck for lecture 5.”</div>
      </div>
      <div class="dock-input-row">
        <input type="text" placeholder="Message Citta…" id="dock-ask">
        <button type="button" class="send" data-press="dock-send">↗</button>
      </div>
    </div>`;
  }
  return `<button type="button" class="dock-bubble" data-set-dock="expanded" title="Open Citta (⌘J)">
    ≋
    <span class="dock-badge">1</span>
  </button>`;
}

function sideDockHTML() {
  return `<div class="citta-side-inner">
    <div class="dock-panel-top">
      ${avatar("≋", "md")}
      <div class="dock-title">
        <strong>Citta</strong>
        <span class="dock-sub">3 tasks</span>
      </div>
      <button type="button" class="dock-icon-btn" data-set-dock="expanded" title="Undock">⇲</button>
      <button type="button" class="dock-icon-btn" data-set-dock="collapsed" title="Collapse">—</button>
    </div>
    <div class="dock-body dock-tasks">
      <article class="task-card done">
        <div class="task-kicker">Done</div>
        <h3>Prep me for lecture 5</h3>
        <p>I drafted a 10-slide deck from Prof. Roland’s lecture 5 slides and speaker notes.</p>
        <button type="button" class="task-link${on("open-deck5")}" data-press="open-deck5">Open in Deck →</button>
      </article>

      <div class="task-section-label">Running &amp; ready</div>

      <article class="task-card running">
        <div class="task-meta"><span class="tool-pill deck">Deck</span><span>Lecture 4 summary</span></div>
        <p>Drafting slide 7 of 10…</p>
        <div class="task-bar"><i style="width:70%"></i></div>
      </article>

      <article class="task-card ready">
        <div class="task-meta"><span class="tool-pill numbers">Numbers</span><span>Lab 3 trends</span></div>
        <p>Analysis ready.</p>
        <button type="button" class="task-link${on("review-lab3")}" data-press="review-lab3">Review →</button>
      </article>

      <article class="task-card fail">
        <div class="task-meta"><span class="tool-pill deck">Deck</span><span>Create a deck called “Lab 3”</span></div>
        <p>Result not delivered.</p>
        <button type="button" class="task-link danger${on("retry-lab3")}" data-press="retry-lab3">Retry →</button>
      </article>
    </div>
    <div class="dock-suggest">
      <button type="button" class="chip quiet${on("sug-deck")}" data-press="sug-deck" data-fill="Elaborate in the deck editor">Elaborate in the deck editor</button>
      <button type="button" class="chip quiet${on("sug-slides")}" data-press="sug-slides" data-fill="Turn Lab 3 trends into slides">Turn Lab 3 trends into slides</button>
    </div>
    <div class="dock-input-row">
      <input type="text" placeholder="Ask Citta, or / for a tool…" id="dock-ask-side">
      <button type="button" class="send" data-press="dock-send" aria-label="Send">↗</button>
    </div>
  </div>`;
}

function toast(msg, opts) {
  const options = opts || {};
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  clearTimeout(el._t);
  el.classList.remove("has-undo");
  el.style.pointerEvents = options.undo ? "auto" : "none";
  if (options.undo) {
    el.innerHTML = `<span>${esc(msg)}</span> <button type="button" class="toast-undo" data-toast-undo>Undo</button>`;
    el.classList.add("has-undo");
  } else {
    el.textContent = msg;
  }
  el.classList.add("show");
  el._t = setTimeout(() => {
    el.classList.remove("show", "has-undo");
    el.style.pointerEvents = "none";
  }, options.undo ? 5200 : 1600);
}

function switchAi(id) {
  if (id === state.ai) {
    state.aiOpen = false;
    render();
    return;
  }
  state.aiPrev = state.ai;
  state.ai = id;
  state.aiOpen = false;
  const label = aiById(id).label;
  if (id === "citta") {
    toast(`Working with ${label}`);
  } else if (AI_SWITCH_TOAST[id]) {
    toast(AI_SWITCH_TOAST[id], { undo: true });
  } else {
    toast(`Now working with ${label}`, { undo: true });
  }
  render();
}

function render() {
  const isComponents = state.stage === "components";
  const s = STAGES[isComponents ? "h0" : state.stage];
  const frame = document.getElementById("frame");
  frame.dataset.stage = state.stage;
  frame.dataset.dock = state.dock;
  frame.classList.toggle("is-docked", !isComponents && state.dock === "docked");
  frame.classList.toggle("is-components", isComponents);

  document.getElementById("rail").innerHTML = isComponents
    ? railHTML(["GR"])
    : railHTML(s.rail);
  document.getElementById("content").innerHTML = contentHTML();

  const side = document.getElementById("citta-side");
  const dock = document.getElementById("citta-dock");
  if (isComponents) {
    side.hidden = true;
    side.innerHTML = "";
    dock.innerHTML = "";
  } else if (state.dock === "docked") {
    side.hidden = false;
    side.innerHTML = sideDockHTML();
    dock.innerHTML = "";
  } else {
    side.hidden = true;
    side.innerHTML = "";
    dock.innerHTML = dockHTML();
  }

  document.querySelectorAll(".review [data-stage]").forEach((b) => {
    b.classList.toggle("is-on", b.dataset.stage === state.reviewHighlight);
  });
  document.querySelectorAll(".review [data-dock]").forEach((b) => {
    b.classList.toggle("is-on", b.dataset.dock === state.dock);
  });
  document.querySelectorAll(".review [data-ai-preview]").forEach((b) => {
    const mode = b.dataset.aiPreview;
    const on =
      mode === "open"
        ? state.stage === "h2" && state.aiOpen && state.ai === "citta"
        : mode === "roland"
          ? state.stage === "h2" && state.ai === "roland" && !state.aiOpen
          : false;
    b.classList.toggle("is-on", on);
  });

  const ask = document.getElementById("ask");
  if (ask) {
    ask.addEventListener("input", () => {
      state.ask = ask.value;
    });
  }
}

function scrollToTutorial() {
  requestAnimationFrame(() => {
    const el = document.getElementById("tutorial-8541");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function setStage(stage, opts = {}) {
  if (stage === "components") {
    state.stage = "components";
    state.reviewHighlight = "components";
    state.pressed = {};
    state.aiOpen = false;
    render();
    return;
  }
  const focusTutorial = stage === "tutorial";
  const resolved = focusTutorial ? "h0" : stage;
  state.reviewHighlight = focusTutorial ? "tutorial" : resolved;
  state.stage = resolved;
  state.pressed = {};
  state.ask = "";
  state.aiOpen = false;
  state.ai = "citta";
  state.aiPrev = null;
  state.tool = resolved === "h2" ? "deck" : resolved === "h3" ? "doc" : null;
  state.weekHidden = false;
  state.interest = null;
  if (resolved === "h0") {
    state.tried = { doc: false, deck: false, numbers: false, symtex: false, code: false };
    state.joined = false;
    state.emailConnected = false;
    state.emailDismissed = false;
    state.reminderAdded = false;
  }
  if (resolved === "h1") {
    state.tried = { doc: true, deck: true, numbers: false, symtex: false, code: false };
    state.tipDismissed = false;
  }
  render();
  if (focusTutorial || opts.scrollTutorial) scrollToTutorial();
}

function setDock(mode) {
  state.dock = mode;
  clearTimeout(state.peekTimer);
  if (mode === "peek") {
    state.peekTimer = setTimeout(() => {
      if (state.dock === "peek") {
        state.dock = "collapsed";
        render();
      }
    }, 6000);
  }
  render();
}

function markTried(id) {
  state.tried[id] = true;
  state.tool = id;
  const t = toolMeta(id);
  const card = TRY_CARDS.find((c) => c.id === id);
  state.ask = card ? card.title : t.label;
  toast(`Citta · ${t.label} demo started`);
  render();
}

document.querySelector(".review").addEventListener("click", (e) => {
  const stageBtn = e.target.closest("[data-stage]");
  if (stageBtn) {
    setStage(stageBtn.dataset.stage);
    return;
  }
  const aiPreview = e.target.closest("[data-ai-preview]");
  if (aiPreview) {
    state.stage = "h2";
    state.pressed = {};
    state.ask = "";
    state.tool = "deck";
    state.weekHidden = false;
    if (aiPreview.dataset.aiPreview === "open") {
      state.ai = "citta";
      state.aiOpen = true;
      state.aiPrev = null;
    } else if (aiPreview.dataset.aiPreview === "roland") {
      state.ai = "roland";
      state.aiOpen = false;
      state.aiPrev = "citta";
    }
    render();
    return;
  }
  const dockBtn = e.target.closest("[data-dock]");
  if (dockBtn) setDock(dockBtn.dataset.dock);
});

document.getElementById("frame").addEventListener("click", (e) => {
  const tryBtn = e.target.closest("[data-try]");
  if (tryBtn) {
    markTried(tryBtn.dataset.try);
    return;
  }

  if (e.target.closest("[data-tip-dismiss]")) {
    state.tipDismissed = true;
    render();
    return;
  }
  if (e.target.closest("[data-tip-show]")) {
    state.tipDismissed = true;
    state.aiOpen = true;
    toast("Pick Prof. Roland’s twin — or any agent");
    render();
    return;
  }

  if (e.target.closest("[data-toggle-ai]")) {
    state.aiOpen = !state.aiOpen;
    render();
    return;
  }
  if (e.target.closest("[data-back-citta]")) {
    state.ai = "citta";
    state.aiOpen = false;
    state.aiPrev = null;
    render();
    return;
  }
  const aiOpt = e.target.closest("[data-ai]");
  if (aiOpt) {
    switchAi(aiOpt.dataset.ai);
    return;
  }
  if (state.aiOpen && !e.target.closest(".working-left")) {
    state.aiOpen = false;
    render();
    return;
  }

  const toolBtn = e.target.closest("[data-select-tool]");
  if (toolBtn) {
    state.tool = toolBtn.dataset.selectTool;
    render();
    return;
  }

  const interest = e.target.closest("[data-interest]");
  if (interest) {
    state.interest = interest.dataset.interest;
    state.pressed["int-" + state.interest] = true;
    render();
    return;
  }

  if (e.target.closest("[data-dismiss-week]")) {
    state.weekHidden = true;
    render();
    return;
  }
  if (e.target.closest("[data-join-course]")) {
    state.joined = true;
    toast("Joined Heavy-ion Physics");
    render();
    return;
  }
  if (e.target.closest("[data-connect-email]")) {
    state.emailConnected = true;
    toast("Email connected");
    render();
    return;
  }
  if (e.target.closest("[data-dismiss-email]")) {
    state.emailDismissed = true;
    state.pressed["not-now"] = true;
    render();
    return;
  }
  if (e.target.closest("[data-add-reminder]")) {
    state.reminderAdded = true;
    toast("Reminder added");
    render();
    return;
  }

  const setDockBtn = e.target.closest("[data-set-dock]");
  if (setDockBtn) {
    setDock(setDockBtn.dataset.setDock);
    return;
  }
  if (e.target.closest("[data-dock-cycle]")) {
    setDock("expanded");
    return;
  }

  const press = e.target.closest("[data-press]");
  if (press) {
    const id = press.dataset.press;
    state.pressed[id] = !state.pressed[id];
    if (press.dataset.fill) state.ask = press.dataset.fill;
    if (id === "send" && state.ask) toast("Sent to Citta");
    render();
  }
});

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-toast-undo]")) {
    const prev = state.aiPrev;
    if (prev) {
      state.ai = prev;
      state.aiPrev = null;
      toast(`Back to ${aiById(state.ai).label}`);
      render();
    }
    const el = document.getElementById("toast");
    if (el) el.classList.remove("show", "has-undo");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.aiOpen) {
    state.aiOpen = false;
    render();
    return;
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
    e.preventDefault();
    if (e.shiftKey) {
      setDock(state.dock === "docked" ? "collapsed" : "docked");
    } else {
      setDock(state.dock === "expanded" || state.dock === "docked" ? "collapsed" : "expanded");
    }
  }
  if (e.key === "Escape" && (state.dock === "expanded" || state.dock === "peek")) {
    setDock("collapsed");
  }
});

setStage("h0");
