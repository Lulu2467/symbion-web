const A = (initials, size) =>
  `<span class="avatar ${size}">${initials}</span>`;

const PEOPLE = {
  EP: { initials: "EP", name: "Enrico Pajer", at: "@Pajer" },
  HX: { initials: "HX", name: "Haifeng Xu", at: "@Xu" },
  GR: { initials: "GR", name: "Gunther Roland", at: "@Roland" },
  AR: { initials: "AR", name: "Anastasia Romanou" },
  JG: { initials: "JG", name: "Julia R. Greer" },
  QG: { initials: "QG" },
  RR: { initials: "RR", name: "Raghavendra Rau" },
  MG: { initials: "MG", name: "Matthew Grimes" }
};

const state = {
  stage: "h0",
  ask: "",
  jump: "",
  weekHidden: false,
  week: { ask: true, visit: false, tool: false, peek: false, brief: false },
  pressed: {}
};

const WEEK = [
  { id: "ask", label: "Ask your first question" },
  { id: "visit", label: "Visit 3 Cosmos ◐○○", action: "Open map →" },
  { id: "tool", label: "Make something with a tool", action: "Try →" },
  { id: "peek", label: "Peek into a #topic thread", action: "Peek →" },
  { id: "brief", label: "Set your daily brief", action: "Set →" }
];

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

function pressBtn(id, cls, label, extra) {
  return `<button type="button" class="${cls}${on(id)}" data-press="${id}" ${extra || ""}>${label}</button>`;
}

function avatarRow(ids, ghost) {
  return `<div class="faces">${ids.map((id) => {
    const p = PEOPLE[id];
    return `<span class="avatar md${ghost ? " ghost" : ""}">${p.initials}</span>`;
  }).join("")}</div>`;
}

function twin(p, meta, quote) {
  return `<article class="card">
    <div class="topic" style="cursor:default">
      ${A(p.initials, "lg")}
      <span><span class="who">${esc(p.name)}</span><span class="meta" style="display:block">${esc(meta)}</span></span>
    </div>
    <p class="quote">“${esc(quote)}”</p>
    ${pressBtn("ask-" + p.initials, "btn", "Ask", `data-fill="${esc(quote)}"`)}
  </article>`;
}

function thread(kicker, title, meta) {
  return `<article class="thread">
    <p class="kicker-link">${esc(kicker)}</p>
    <h3>${esc(title)}</h3>
    <p class="meta">${esc(meta)}</p>
  </article>`;
}

function section(label, link, linkId) {
  return `<div class="section"><span class="kicker">${esc(label)}</span>${
    link ? pressBtn(linkId, "text-link", esc(link)) : ""
  }</div>`;
}

function continueRow(id, person, title, meta) {
  return `<button type="button" class="cont${on(id)}" data-press="${id}" data-fill="${esc(title)}">
    ${A(person, "md")}
    <span class="cont-copy"><span class="who">${esc(title)}</span><span class="meta">${esc(meta)}</span></span>
    <span class="chev">›</span>
  </button>`;
}

function sideHTML() {
  const stages = {
    h0: {
      topics: [
        ["# cosmology"],
        ["# ai-and-economics"]
      ],
      cosmos: [
        ["EP", "Suggested"],
        ["HX", "Suggested"],
        ["GR", "Suggested"]
      ],
      plan: ["Guest · picks saved on this device", "Save your picks →", true]
    },
    h1: {
      topics: [
        ["# cosmology", "2"],
        ["# physics"]
      ],
      cosmos: [
        ["EP", "1 new insight"],
        ["GR", "Live Thu 7pm"],
        ["HX", ""]
      ],
      plan: ["Free · 16 of 20 questions left", "Resets Monday", false]
    },
    h2: {
      topics: [
        ["# physics", "3"],
        ["# cosmology"],
        ["# ai-and-economics", "1"]
      ],
      cosmos: [
        ["GR", "Live in 40 min"],
        ["EP", "2 new insights"],
        ["HX", "Last chat · Monday"]
      ],
      plan: ["Free · 14 of 20 questions left", "Resets Monday", false]
    },
    h3: {
      topics: [
        ["# physics", "12"],
        ["# cosmology"]
      ],
      cosmos: [
        ["GR", "3 new insights"],
        ["EP", ""],
        ["HX", ""]
      ],
      plan: ["Free · 20 of 20 questions left", "Resets Monday", false]
    }
  };
  const s = stages[state.stage];
  const q = state.jump.trim().toLowerCase();
  const show = (text) => !q || text.toLowerCase().includes(q);
  const topics = s.topics.filter((t) => show(t[0])).map(([label, count]) =>
    `<button type="button" class="topic${on("topic-" + label)}" data-press="topic-${esc(label)}" data-fill="${esc(label)}"${state.stage === "h1" ? ' data-week-do="peek"' : ""}>${esc(label)}${count ? `<b>${esc(count)}</b>` : ""}</button>`
  ).join("");
  const cosmos = s.cosmos.filter((c) => show(PEOPLE[c[0]].name + " " + c[1])).map(([id, sub]) => {
    const p = PEOPLE[id];
    const fill = p.at || p.name;
    const live = /live/i.test(sub || "") ? " is-live" : "";
    return `<button type="button" class="cosmo${on("cosmo-" + id)}" data-press="cosmo-${id}" data-fill="${esc(fill)}">
      ${A(p.initials, "sm")}
      <span><span class="cosmo-name">${esc(p.name)}</span>${sub ? `<span class="cosmo-sub${live}" style="display:block">${esc(sub)}</span>` : ""}</span>
    </button>`;
  }).join("");
  const planBtn = s.plan[2]
    ? pressBtn("save", "", esc(s.plan[1]))
    : `<span>${esc(s.plan[1])}</span>`;
  const planClass = s.plan[2] ? "plan is-guest" : "plan";
  return `
    <input class="jump" id="jump" type="text" placeholder="Jump to… # @ /" value="${esc(state.jump)}" aria-label="Jump to… # @ /">
    <button type="button" class="nav is-on" data-press="nav-home">Home</button>
    <button type="button" class="nav${on("nav-explore")}" data-press="nav-explore">Explore</button>
    <button type="button" class="nav${on("nav-library")}" data-press="nav-library">Library</button>
    <p class="kicker">TOPICS</p>
    ${topics}
    ${pressBtn("browse", "browse", "+ Browse topics")}
    <p class="kicker">YOUR COSMOS</p>
    ${cosmos}
    <div class="side-spacer"></div>
    <div class="${planClass}"><strong>${esc(s.plan[0])}</strong>${planBtn}</div>`;
}

function askBar(placeholder, chips) {
  const chipHTML = (chips || []).map((c) =>
    `<button type="button" class="chip${state.ask === c ? " is-on" : ""}" data-fill="${esc(c)}">${esc(c)}</button>`
  ).join("");
  return `<form class="ask" id="ask-form">
    <div class="ask-row">
      <input class="ask-input" id="ask" type="text" placeholder="${esc(placeholder)}" value="${esc(state.ask)}" aria-label="${esc(placeholder)}">
      <button class="send" type="submit" aria-label="↑">↑</button>
    </div>
    ${chipHTML ? `<div class="chips">${chipHTML}</div>` : ""}
  </form>`;
}

function weekCard() {
  if (state.weekHidden) return "";
  const done = WEEK.filter((w) => state.week[w.id]).length;
  const steps = WEEK.map((w) => {
    const isDone = state.week[w.id];
    const mark = isDone ? "✓" : "○";
    return `<button type="button" class="step${isDone ? " is-done" : ""}" data-week="${w.id}">
      <span class="step-label">${mark} ${esc(w.label)}</span>
      ${!isDone && w.action ? `<span class="go">${esc(w.action)}</span>` : ""}
    </button>`;
  }).join("");
  return `<section class="week" aria-label="Your first week">
    <div class="week-head">
      <h2>Your first week</h2>
      <span class="week-count">${done} of 5</span>
      <button type="button" class="x" data-week-hide aria-label="✕">✕</button>
    </div>
    <div class="steps">${steps}</div>
  </section>`;
}

function madeCard(badge, title, action, weekDo) {
  const week = weekDo ? ` data-week-do="${weekDo}"` : "";
  return `<article class="made">
    <div class="thumb" aria-hidden="true"></div>
    <span class="pill">${esc(badge)}</span>
    <h3>${esc(title)}</h3>
    ${pressBtn("made-" + badge, "go", esc(action), `data-fill="${esc(title)}"${week}`)}
  </article>`;
}

function h0() {
  return {
    main: `
      <h1 class="hello">Hi there</h1>
      ${askBar("Ask a professor’s twin anything…", [
        "What happened in the first second after the Big Bang?",
        "How do AI agents learn to cooperate?",
        "Why do first impressions stick?"
      ])}
      ${section("MINDS FOR YOUR GOALS", "See all", "see-minds")}
      <div class="row">
        ${twin(PEOPLE.EP, "Cosmology · Cambridge", "What happened in the first second after the Big Bang?")}
        ${twin(PEOPLE.HX, "AI & decisions · UChicago", "How do AI agents learn to cooperate?")}
        ${twin(PEOPLE.GR, "Nuclear physics · MIT", "Explain quark-gluon plasma in plain English")}
      </div>
      <section class="banner">
        <h2>Who do you want to learn from?</h2>
        <p>Tell us your goal and we’ll suggest three minds.</p>
        ${pressBtn("find-minds", "btn-fill", "Find my minds")}
      </section>
      ${section("POPULAR IN #COSMOLOGY", "Open", "open-cosmo")}
      <div class="row">
        ${thread("#cosmology · Prof. Pajer’s twin", "Why is the night sky dark if the universe is infinite?", "1.2k found helpful · 48 replies")}
        ${thread("#cosmology · Prof. Pajer’s twin", "What is dark energy, in one paragraph?", "860 found helpful · 21 replies")}
      </div>`,
    right: `
      <section class="amber">
        <h2>Save your picks</h2>
        <p>Your picks are kept on this device for 7 days. Save them to any device.</p>
        ${pressBtn("save", "btn", "Save")}
      </section>
      <section class="panel">
        <h2>Explore your field</h2>
        ${avatarRow(["EP", "GR", "AR", "JG"], true)}
        <p>Physics & Space · 0 of 6 explored</p>
        ${pressBtn("field-map", "map-link", "Open field map")}
      </section>
      <section class="panel">
        <h2>How twins work</h2>
        <p>Each ✦ Digital twin is trained by a real professor on their own lectures and slides. Like any AI, it can make mistakes.</p>
      </section>`
  };
}

function h1() {
  return {
    main: `
      <h1 class="hello">Good morning, Jess</h1>
      ${askBar("Ask anything, or @ a twin…")}
      ${weekCard()}
      ${section("CONTINUE")}
      <div class="continue">${continueRow("c-bang", "EP", "The first second after the Big Bang", "Enrico Pajer · yesterday")}</div>
      ${section("MADE WITH SYMBION", "See all", "see-made")}
      <div class="row made-row">
        ${madeCard("Deck", "Lecture 4 → 8-slide study deck", "Make one from my chat →", "tool")}
        ${madeCard("Symtex", "Black-Scholes, derived step by step", "Open template →", "tool")}
        ${madeCard("Doc", "Startup idea → 1-page memo", "Try with my idea →", "tool")}
        ${madeCard("Citta + Doc", "Reading report outlined in 15 min", "Start with Citta →", "tool")}
      </div>
      ${section("TRY A DIFFERENT MIND")}
      <div class="row">
        ${twin(PEOPLE.GR, "Nuclear physics · MIT", "Explain quark-gluon plasma in plain English")}
        ${twin(PEOPLE.AR, "Nearby · Applied maths · Columbia", "How do climate models actually work?")}
      </div>`,
    right: `
      <section class="today lavender${on("brief")}">
        <span class="pill">✦ Prof. Pajer’s twin</span>
        <h3>Your 3-minute brief is ready</h3>
        ${pressBtn("brief", "go", "Read brief →", `data-fill="Your 3-minute brief is ready" data-week-do="brief"`)}
      </section>
      <section class="panel">
        <h2>Explore more Cosmos</h2>
        ${avatarRow(["EP", "GR", "AR", "JG", "QG"], true)}
        <p>1 of 6 explored in Physics & Space</p>
        ${pressBtn("field-map", "map-link", "Open field map", `data-week-do="visit"`)}
      </section>
      <section class="panel">
        <h2>Your interests</h2>
        <div class="interests">
          ${["Physics & Space", "#cosmology", "AI & Data"].map((c) =>
            `<button type="button" class="interest${on("int-" + c)}" data-press="int-${esc(c)}" data-fill="${esc(c)}">${esc(c)}</button>`
          ).join("")}
          ${pressBtn("add-interest", "interest", "＋ Add")}
        </div>
      </section>`
  };
}

function h2() {
  return {
    main: `
      <h1 class="hello">Good morning, Jess</h1>
      ${askBar("Ask, @twin, #topic or /command", ["@Pajer", "@Roland", "@Xu", "/quiz", "/deck"])}
      ${section("TODAY")}
      <div class="row">
        <button type="button" class="today lavender${on("prep")}" data-press="prep" data-fill="Warm up for today’s 2:30 class">
          <span class="pill">✦ Prof. Roland’s twin</span>
          <h3>Warm up for today’s 2:30 class</h3>
          <p>10-minute prep: 3 key ideas and a quick check.</p>
          <span class="go">Start prep →</span>
        </button>
        <button type="button" class="today sand${on("live")}" data-press="live" data-fill="Prof. Roland goes live in 40 min">
          <span class="pill amber">From Prof. Roland · live</span>
          <h3>Prof. Roland goes live in 40 min</h3>
          <p>His twin has a recap of the last Q&A.</p>
          <span class="go amber-ink">Set reminder →</span>
        </button>
      </div>
      ${section("CONTINUE", "See all", "see-continue")}
      <div class="continue">
        ${continueRow("c-quiz", "EP", "Quiz: inflation basics", "2 of 5 questions done")}
        ${continueRow("c-deck", "GR", "Deck: lecture 4 summary", "Draft · edited yesterday")}
        ${continueRow("c-chat", "HX", "Chat: pricing my data", "Last reply Monday")}
      </div>
      ${section("BECAUSE YOU ASKED ABOUT PRICING DATA")}
      <div class="row">
        ${twin(PEOPLE.RR, "Corporate finance · Cambridge", "How do investors actually use information?")}
        ${twin(PEOPLE.MG, "Entrepreneurship · Cambridge", "Pressure-test my startup idea")}
      </div>
      ${section("TRENDING IN YOUR FIELDS", "Explore", "explore-fields")}
      <div class="row">
        ${thread("Rising in #ai-and-economics", "“Can AI agents collude on prices without being told to?”", "Prof. Xu’s twin · 2.3k this week")}
        ${thread("Rising in #cosmology", "“Is the universe’s expansion speeding up?”", "Prof. Pajer’s twin · 1.1k this week")}
      </div>
      ${section("LIBRARY", "See all", "see-library")}
      <div class="lib">
        ${["Deck · Lecture 4", "Doc · Reading report", "Symtex · Proof 2", "Quiz · Inflation"].map((c) =>
          `<button type="button" class="lib-chip${state.ask === c ? " is-on" : ""}" data-fill="${esc(c)}">${esc(c)}</button>`
        ).join("")}
      </div>`,
    right: `
      <section class="panel">
        <h2>Activity · 5 new</h2>
        <div class="act"><span class="pill">2 replies</span><span>to your #physics thread</span></div>
        <div class="act"><span class="pill">3 insights</span><span>from Prof. Pajer’s twin</span></div>
        <div class="act"><span class="pill amber">Update</span><span>New lecture changes your QGP answer</span></div>
      </section>
      <section class="panel">
        <h2>Your twin</h2>
        <p>✓ Drafts class summaries in your format ✓ Formats proofs in Symtex your way ◐ Learning: reading-report structure</p>
        ${pressBtn("try-task", "btn", "Try a task")}
      </section>
      <section class="panel">
        <h2>Your week</h2>
        <p>3h 10m · 14 questions · 4 concepts · 5-day streak</p>
        <p class="note">Shows Sunday–Monday</p>
      </section>
      <div class="usage-row">
        <p class="usage">14 of 20 free questions left</p>
        ${pressBtn("nudges", "text-link", "Manage nudges")}
      </div>`
  };
}

function h3() {
  return {
    main: `
      <h1 class="hello">Welcome back, Jess</h1>
      ${askBar("Ask anything, or @ a twin…")}
      <section class="recap">
        <h2>While you were away</h2>
        <div class="recap-grid">
          ${[
            ["Saved", "Your chat about sPHENIX, with your notes"],
            ["3 insights", "from Prof. Roland’s twin"],
            ["2 replies", "to your #physics thread"],
            ["Update", "New lecture changes your QGP answer"]
          ].map(([badge, text], i) =>
            `<button type="button" class="mini${on("away-" + i)}" data-press="away-${i}" data-fill="${esc(text)}">
              <span class="pill amber">${esc(badge)}</span>
              <span>${esc(text)}</span>
            </button>`
          ).join("")}
        </div>
        <div class="recap-actions">
          ${pressBtn("away-continue", "btn-fill", "Continue", `data-scroll="continue"`)}
          ${pressBtn("away-new", "btn", "See what’s new")}
          ${pressBtn("away-interests", "map-link", "Change my interests")}
        </div>
      </section>
      ${section("CONTINUE")}
      <div class="continue" id="continue">${continueRow("c-sphenix", "GR", "Chat: what is sPHENIX trying to discover?", "9 days ago · notes saved")}</div>
      ${section("BECAUSE YOU ASKED ABOUT HEAVY-ION PHYSICS")}
      <div class="row">
        ${twin(PEOPLE.EP, "Cosmology · Cambridge", "What happened in the first second after the Big Bang?")}
        ${twin(PEOPLE.JG, "Materials · Caltech", "How can a material be both light and very strong?")}
      </div>`,
    right: `
      <section class="today lavender${on("brief3")}">
        <span class="pill">✦ Prof. Roland’s twin</span>
        <h3>Your 3-minute brief is ready</h3>
        ${pressBtn("brief3", "go", "Read brief →", `data-fill="Your 3-minute brief is ready"`)}
      </section>
      <section class="panel" style="flex-direction:row;align-items:center;justify-content:space-between">
        <p style="color:var(--ink);font-size:15px;font-weight:500;max-width:214px">12 updates from your minds and topics</p>
        ${pressBtn("open-updates", "text-link", "Open ›")}
      </section>`
  };
}

const VIEWS = { h0, h1, h2, h3 };

function render() {
  document.querySelectorAll(".review button").forEach((b) => {
    b.classList.toggle("is-on", b.dataset.stage === state.stage);
  });
  document.getElementById("side").innerHTML = sideHTML();
  const view = VIEWS[state.stage]();
  document.getElementById("body").innerHTML = `<div class="main">${view.main}</div><aside class="right">${view.right}</aside>`;
}

function bindJump() {
  const jump = document.getElementById("jump");
  if (!jump) return;
  jump.addEventListener("input", () => {
    state.jump = jump.value;
    const caret = jump.selectionStart;
    document.getElementById("side").innerHTML = sideHTML();
    const next = document.getElementById("jump");
    next.focus();
    next.setSelectionRange(caret, caret);
    bindJump();
  });
}

function resetStage(stage) {
  state.stage = stage;
  state.ask = "";
  state.jump = "";
  state.weekHidden = false;
  state.week = { ask: true, visit: false, tool: false, peek: false, brief: false };
  state.pressed = {};
  render();
  bindJump();
}

document.addEventListener("click", (e) => {
  const stageBtn = e.target.closest(".review [data-stage]");
  if (stageBtn) {
    resetStage(stageBtn.dataset.stage);
    return;
  }
  const hide = e.target.closest("[data-week-hide]");
  if (hide) {
    state.weekHidden = true;
    render();
    bindJump();
    return;
  }
  const weekBtn = e.target.closest("[data-week]");
  if (weekBtn) {
    const id = weekBtn.dataset.week;
    if (id !== "ask") state.week[id] = true;
    if (id === "visit") state.ask = "Open field map";
    if (id === "tool") state.ask = "Make something with a tool";
    if (id === "peek") state.ask = "#cosmology";
    if (id === "brief") state.ask = "Your 3-minute brief is ready";
    render();
    bindJump();
    const input = document.getElementById("ask");
    if (input && id !== "ask") input.focus();
    return;
  }
  const fill = e.target.closest("[data-fill]");
  if (fill) {
    state.ask = fill.dataset.fill;
    if (fill.dataset.press) state.pressed[fill.dataset.press] = true;
    if (fill.dataset.weekDo) state.week[fill.dataset.weekDo] = true;
    render();
    bindJump();
    const input = document.getElementById("ask");
    if (input) input.focus();
    return;
  }
  const press = e.target.closest("[data-press]");
  if (press && !press.closest(".review")) {
    if (press.dataset.press === "nav-home") return;
    if (press.dataset.weekDo) state.week[press.dataset.weekDo] = true;
    state.pressed[press.dataset.press] = !state.pressed[press.dataset.press];
    if (press.dataset.press === "find-minds" || press.dataset.press === "try-task") {
      render();
      bindJump();
      const input = document.getElementById("ask");
      if (input) input.focus();
      return;
    }
    if (press.dataset.scroll) {
      render();
      bindJump();
      const el = document.getElementById(press.dataset.scroll);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    render();
    bindJump();
  }
});

document.addEventListener("submit", (e) => {
  if (e.target.id !== "ask-form") return;
  e.preventDefault();
  const input = document.getElementById("ask");
  state.ask = input.value;
  if (state.stage === "h1" && state.ask.trim()) state.week.ask = true;
  render();
  bindJump();
});

document.addEventListener("input", (e) => {
  if (e.target.id === "ask") state.ask = e.target.value;
});

resetStage("h0");
