/* Home v2 — tools first (Figma 1:4750 / board 1:2180). Not Desktop Home 1:11405. */

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

const TRY_CARDS = [
  { id: "doc", title: "Lecture 1 → one-page summary", hint: "A Doc with headings + key formulas" },
  { id: "deck", title: "Lecture 1 → 6 study slides", hint: "A Deck you can present or revise" },
  { id: "numbers", title: "Plot the sPHENIX sample data", hint: "A sheet + chart, explained" },
  { id: "symtex", title: "Typeset the Bjorken energy formula", hint: "Clean LaTeX you can reuse" },
  { id: "code", title: "Run a tiny particle simulation", hint: "A Python notebook, commented" }
];

const state = {
  stage: "h0",
  dock: "collapsed",
  tool: null,
  ask: "",
  tried: { doc: false, deck: false, numbers: false, symtex: false, code: false },
  weekHidden: false,
  interest: null,
  pressed: {},
  joined: false,
  emailConnected: false,
  emailDismissed: false,
  reminderAdded: false,
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
  const events = (cfg.events || [])
    .map(
      (e) =>
        `<span class="day-event" style="left:${e.x}%"></span>` +
        `<span class="day-label" style="left:${e.x}%">${esc(e.time)} ${esc(e.label)}</span>`
    )
    .join("");
  return `<div class="your-day">
    <div class="your-day-top"><span>YOUR DAY</span><span>${esc(cfg.status)}</span></div>
    <div class="day-track">
      <div class="day-elapsed" style="width:${cfg.elapsed}%"></div>
      <span class="day-now" style="left:${cfg.now}%"></span>
      ${events}
    </div>
    <div class="day-scale"><span>8 am</span><span>8 pm</span></div>
    <div class="now-label" style="position:relative;margin-top:2px;font-size:11px;color:var(--faint);padding-left:${Math.max(cfg.now - 4, 0)}%">now · 9:40</div>
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

function composerHTML(cfg) {
  const hero = !!cfg.hero;
  const placeholder = cfg.placeholder;
  const tools = toolChips(hero);
  let foot = "";
  if (cfg.startWith) {
    foot = `<div class="suggest-row">
      <span class="suggest-label">Start with:</span>
      ${cfg.startWith
        .map(
          (s, i) =>
            `<button type="button" class="chip${on("start-" + i)}" data-press="start-${i}" data-fill="${esc(s)}">${esc(s)}</button>`
        )
        .join("")}
    </div>`;
  } else if (cfg.continueWith && !hero) {
    foot = `<div class="continue-row">
      <span class="continue-label">Continue with:</span>
      ${continueChips(cfg.continueWith)}
    </div>`;
  }

  const top = `<div class="${hero ? "composer-top" : ""}">
    <div class="composer-row">
      <div class="ai-switch">
        ${avatar("≋", "lg")}
        <button type="button" class="switch-ai${on("switch-ai")}" data-press="switch-ai" title="Switch AI">⇄</button>
      </div>
      <input class="composer-input" id="ask" type="text" placeholder="${esc(placeholder)}" value="${esc(state.ask)}">
      <button type="button" class="send${on("send")}" data-press="send" aria-label="Send">↗</button>
    </div>
    <div class="tool-row">
      ${tools}
      ${attachLinks()}
    </div>
    ${hero ? "" : foot}
  </div>`;

  const heroFoot =
    hero && cfg.continueWith
      ? `<div class="composer-foot">
          <span class="continue-label">CONTINUE WITH</span>
          ${continueChips(cfg.continueWith)}
        </div>`
      : "";

  return `<section class="composer${hero ? " hero" : ""}">${top}${heroFoot}</section>`;
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
      const badge = c.twin
        ? `<span class="badge-mini">✦ Twin</span>`
        : `<span class="badge-mini agent">AI agent</span>`;
      return `<div class="disc-card">
        ${avatar(c.initials, "sm", c.cls || "")}
        <div>
          <div class="name" title="${esc(c.name)}">${esc(c.short || c.name)}${badge}</div>
          <div class="meta">${esc(c.meta)}</div>
        </div>
        <button type="button" class="add-si${on("add-" + c.initials)}" data-press="add-${esc(c.initials)}">+ Add SI</button>
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
  return `
    <div class="section-head">
      <h2>Try each tool with Citta</h2>
      <span class="sub">1 minute each · uses Prof. Roland’s course material</span>
      <span class="spacer"></span>
    </div>
    <div class="try-row">${cards}</div>`;
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
      <button type="button" class="btn-secondary${state.joined ? " is-on" : ""}" data-join-course>
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
      placeholder: "What do you want to work on? Try one of the suggestions below.",
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
        { initials: "PC", name: "Physics Problem Coach", short: "Physics Problem Coach", meta: "Step-by-step in SymTex", twin: false },
        { initials: "GW", name: "Gauge Theory 101", short: "Gauge Theory 101", meta: "Course · MIT OCW", twin: false }
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
      placeholder: "What do you want to work on? Citta can start it for you.",
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
      items: [
        { id: "b1", initials: "GR", title: "Prof. Roland’s twin posted lecture 3 slides", meta: "Heavy-ion Physics · today", act: "Turn into study notes →" },
        { id: "b2", initials: "EP", title: "Prof. Pajer’s twin answered a popular question", meta: "#cosmology · 1.2k found helpful", act: "Read →" }
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
        status: "Evening free",
        elapsed: 14,
        now: 14,
        events: [
          { x: 24, time: "11:00", label: "Reply Roland" },
          { x: 54, time: "2:30", label: "Lecture 5" }
        ]
      }
    },
    composer: {
      hero: true,
      placeholder: "What do you want to work on? Citta can start it for you.",
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
        { id: "c4", initials: "HX", title: "Prof. Xu’s twin: new insight on pricing data", meta: "AI & decisions · today" }
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
      placeholder: "What do you want to work on? Citta can start it for you.",
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

function contentHTML() {
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
  html += `<section class="greeting${g.quiet ? " quiet" : ""}">
    ${g.quiet ? "" : '<div class="sun" aria-hidden="true"></div>'}
    <div class="hello">
      <div class="eyebrow"><span class="dot-time"></span>${esc(g.eyebrow)}</div>
      <h1>${esc(g.title)}</h1>
      <p>${esc(g.sub)}</p>
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
      <strong>Citta</strong>
      <button type="button" class="dock-icon-btn" data-set-dock="expanded" title="Undock">⇲</button>
      <button type="button" class="dock-icon-btn" data-set-dock="collapsed" title="Collapse">—</button>
    </div>
    <div class="dock-body">
      <div class="dock-msg">Docked beside the page — nothing behind is covered. Ask me to finish Reading report — QGP or prep lecture 5.</div>
    </div>
    <div class="dock-input-row">
      <input type="text" placeholder="Message Citta…" id="dock-ask-side">
      <button type="button" class="send" data-press="dock-send">↗</button>
    </div>
  </div>`;
}

function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 1600);
}

function render() {
  const s = STAGES[state.stage];
  const frame = document.getElementById("frame");
  frame.dataset.stage = state.stage;
  frame.dataset.dock = state.dock;
  frame.classList.toggle("is-docked", state.dock === "docked");

  document.getElementById("rail").innerHTML = railHTML(s.rail);
  document.getElementById("content").innerHTML = contentHTML();

  const side = document.getElementById("citta-side");
  const dock = document.getElementById("citta-dock");
  if (state.dock === "docked") {
    side.hidden = false;
    side.innerHTML = sideDockHTML();
    dock.innerHTML = "";
  } else {
    side.hidden = true;
    side.innerHTML = "";
    dock.innerHTML = dockHTML();
  }

  document.querySelectorAll(".review [data-stage]").forEach((b) => {
    b.classList.toggle("is-on", b.dataset.stage === state.stage);
  });
  document.querySelectorAll(".review [data-dock]").forEach((b) => {
    b.classList.toggle("is-on", b.dataset.dock === state.dock);
  });

  const ask = document.getElementById("ask");
  if (ask) {
    ask.addEventListener("input", () => {
      state.ask = ask.value;
    });
  }
}

function setStage(stage) {
  state.stage = stage;
  state.pressed = {};
  state.ask = "";
  state.tool = stage === "h2" ? "deck" : null;
  state.weekHidden = false;
  state.interest = null;
  if (stage === "h0") {
    state.tried = { doc: false, deck: false, numbers: false, symtex: false, code: false };
    state.joined = false;
    state.emailConnected = false;
    state.emailDismissed = false;
    state.reminderAdded = false;
  }
  if (stage === "h1") {
    state.tried = { doc: true, deck: true, numbers: false, symtex: false, code: false };
  }
  render();
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
  const dockBtn = e.target.closest("[data-dock]");
  if (dockBtn) setDock(dockBtn.dataset.dock);
});

document.getElementById("frame").addEventListener("click", (e) => {
  const tryBtn = e.target.closest("[data-try]");
  if (tryBtn) {
    markTried(tryBtn.dataset.try);
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

document.addEventListener("keydown", (e) => {
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
