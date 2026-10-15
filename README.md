# Symbion Homepage

Interactive HTML prototype of Desktop Home stages (H0–H3), restored from Figma `Homepage — Symbion` / `Desktop · Home stages`.

## Open

```bash
python -m http.server 8766
```

Then open http://127.0.0.1:8766/

Or open `index.html` directly.

## Review controls

The sticky **Review** bar above the 1440 frame switches stages:

| Stage | Name | Tutorial |
|---|---|---|
| H0 | Day zero | No checklist; Ask starters + Find my minds |
| H1 | Getting started | **Your first week** — 5 steps, dismissible |
| H2 | Established | No tutorial |
| H3 | Welcome back | Recap instead of tutorial |

## Tutorial (H1)

Exact copy from the design:

1. ✓ Ask your first question  
2. ○ Visit 3 Cosmos ◐○○ → Open map →  
3. ○ Make something with a tool → Try →  
4. ○ Peek into a #topic thread → Peek →  
5. ○ Set your daily brief → Set →  

Click a step or the matching page action (field map, Made with Symbion, Read brief) to mark it done. ✕ hides the row only.

## Source

Figma: https://www.figma.com/design/rV59JRaO6ZjuRaNqTNYMku/Homepage---Symbion?node-id=1-11405
