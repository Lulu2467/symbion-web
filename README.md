# Symbion Home · tools first

Interactive 1:1 HTML of **Home v2 — tools first** (not Desktop Home stages).

## Source

- Canonical: https://www.figma.com/design/rV59JRaO6ZjuRaNqTNYMku/Homepage---Symbion?node-id=1-4750  
- Same family board: `1:2180` Home v2 — tools first (H0 / H1 / H2 / H3 / Variant B / Citta dock)  
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
| H0 · First visit | Arrival banner + Start with + Try each tool with Citta |
| H1 · First week | Continue with + Your tools this week (dismissible) |
| H2 · Established (B) | Variant B: quiet greeting, hero composer, tinted Continue with |
| H3 · Welcome back | Pick up where you left off + collapsed Cosmos |
| Citta Collapsed / Peek / Expanded / Docked | Dock states from the board |

## Tutorial (H0) — verbatim

**Try each tool with Citta** · `1 minute each · uses Prof. Roland’s course material`

| Tool | Lead | Hint | CTA |
|---|---|---|---|
| Doc | Lecture 1 → one-page summary | A Doc with headings + key formulas | ≋ Try it |
| Deck | Lecture 1 → 6 study slides | A Deck you can present or revise | ≋ Try it |
| Numbers | Plot the sPHENIX sample data | A sheet + chart, explained | ≋ Try it |
| SymTex | Typeset the Bjorken energy formula | Clean LaTeX you can reuse | ≋ Try it |
| Code | Run a tiny particle simulation | A Python notebook, commented | ≋ Try it |

## Files

- `index.html` — shell + review bar  
- `styles.css` — 1440 layout (OS bar, left rail, composer, sections)  
- `app.js` — stages, tool select, Try it, dismiss week, reminders, Citta dock  
