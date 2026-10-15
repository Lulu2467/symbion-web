# Symbion Home · tools first

Interactive 1:1 HTML of **Home v2 — tools first** (not Desktop Home stages).

## Source

- **Canonical H0 / first visit:** https://www.figma.com/design/rV59JRaO6ZjuRaNqTNYMku/Homepage---Symbion?node-id=1-4755 (`1:4755`)  
- **Tutorial strip (Try each tool with Citta):** https://www.figma.com/design/rV59JRaO6ZjuRaNqTNYMku/Homepage---Symbion?node-id=1-8541  
- Same family board: `1:2180` Home v2 — tools first (H0 / H1 / H2 / H3 / Variant B / Citta dock)  
- **Switch AI (open menu + twin switched):** https://www.figma.com/design/rV59JRaO6ZjuRaNqTNYMku/Homepage---Symbion?node-id=1-7596  
- **Components stickersheet (组件):** https://www.figma.com/design/rV59JRaO6ZjuRaNqTNYMku/Homepage---Symbion?node-id=108-391 (`108:391`) — **Review → 组件 · 108:391** in the HTML prototype  
- **Do not use** `1:11405` Desktop · Home stages (sidebar + Ask bar + “Your first week”)

## Open

```bash
cd homepage
python -m http.server 8766
```

Then open http://127.0.0.1:8766/

Or open `index.html` directly.

## Review controls (outside the 1440 frame)

| Control | What it does |
|---|---|
| H0 · First visit | Arrival banner + WORKING WITH composer + START WITH + Try each tool with Citta (`1:4755`) |
| Tutorial · 1:8541 | Same as H0, scrolls to **Try each tool with Citta** (`1:8541`) |
| H1 · Learning the tools | Day 3 + NEW tip on twin switch + Your tools this week (`1:5405`) |
| H2 · Every day | Variant B Proposed (`1:6089`): quiet greeting, WORKING WITH hero composer, tinted Continue with |
| H3 · Welcome back | Pick up where you left off + Coming up + collapsed Cosmos (`1:6688`) |
| 组件 · 108:391 | Stickersheet: composer (proposed + hero), WORKING WITH / AI menu, tools, chips, CTAs, Try it / goal cards, discover, reminders, learn tip, Citta dock states |
| Switch AI · Menu open | H2 + WORKING WITH picker open — IN CONTEXT / DISCOVER (`1:7596`) |
| Switch AI · On Roland’s twin | H2 + `+ Twin`, Back to Citta, Roland ask placeholder, undo toast (`1:7596`) |
| Citta Collapsed / Peek / Expanded / Docked | Dock states; Docked = side panel with tasks (`1:7275`) |

## Switch AI (`1:7596`)

- Open from **WORKING WITH** pill, **⇄**, or **or switch to** · H1 **Show me** opens the same menu  
- Menu header: `WORKING WITH · switch anytime`  
- **IN CONTEXT:** Citta · Prof. Roland’s twin · Prof. Pajer’s twin · Prof. Xu’s twin (Figma subtitle lines)  
- **DISCOVER:** Lab Report Coach  
- Switched to Roland’s twin: `+ Twin` badge, `← Back to Citta`, lecture-5 ask placeholder, bottom toast with **Undo**

## Composer (H0) — 1:4755

- Header: `WORKING WITH` + Citta picker · `or switch to` + twin avatars · `your twins & AI agents — anytime`
- Placeholder: `What do you want to work on? Try a suggestion below.`
- Tool row: colored Doc / Deck / Numbers / SymTex / Code tiles
- Suggestions label: `START WITH`
- CTAs: green send · green `≋ Try it` · green `Join course` · blue `Use with Citta`

## Tutorial (`1:8541`) — verbatim

**Try each tool with Citta** · `1 minute each · uses Prof. Roland’s course material`

| Tool | Lead | Hint | CTA |
|---|---|---|---|
| Doc | Lecture 1 — one-page summary | A Doc with headings + key formulas | Try it |
| Deck | Lecture 1 — 6 study slides | A Deck you can present or revise | Try it |
| Numbers | Plot the sPHENIX sample data | A sheet + chart, explained | Try it |
| SymTex | Typeset the Bjorken energy formula | Clean LaTeX you can reuse | Try it |
| Code | Run a tiny particle simulation | A Python notebook, commented | Try it |

After tap, CTA becomes **✓ Tried** (prototype state only; not in Figma default).

## Files

- `index.html` — shell + review bar  
- `styles.css` — 1440 layout (OS bar, left rail, composer, sections)  
- `app.js` — stages, tool select, Try it, dismiss week, reminders, Citta dock  
