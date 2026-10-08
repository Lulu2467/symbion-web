Symbion Cosmo macOS - UX audit evidence pack
Audits: 2 Oct 2026. R1 = round 1, tested by hand without Citta. R2 = round 2, tested with Citta.

Backlog (Google Sheet):
https://docs.google.com/spreadsheets/d/1ciWhQZKw1eNqfB_mkjjet0n1rgGcIFH9sHHZgWtfChg/edit

HOW TO CROSS-REFERENCE
1. Pick a problem in the sheet and note its ID (column A), e.g. NUM-01.
2. Open the folder for that ID's prefix:
     X-     -> Cross-tool
     DOC-   -> Doc
     DECK-  -> Deck
     NUM-   -> Numbers
     TEX-   -> SymTex
     CODE-  -> Code
     CIT-   -> Citta
     WK-    -> Workarounds
3. Every file for that problem starts with its ID. The Evidence column in the sheet
   lists the exact same file names, in the same order.

FILE NAME PATTERN
   NUM-01_1_R2_annotated_tab_key_and_conflict.jpg
   |      | |  |         |
   |      | |  |         what the screenshot shows
   |      | |  'annotated' = red callouts added (start with these)
   |      | round (R1 without Citta, R2 with Citta)
   |      order to view in
   problem ID (column A in the sheet)

RECORDINGS
   Recordings/<Tool>_R1_walkthrough.mp4            round 1, by hand
   Recordings/<Tool>_R2_walkthrough_with_Citta.mp4 round 2, with Citta
   Each is a step-by-step replay built from the real screenshots (~3 s per step).
   The sheet's Evidence column names the recording(s) for each problem.

NOTES
- A screenshot that proves more than one problem is copied into each problem's folder,
  so every problem has all its evidence in one place.
- The 'Evidence index' tab in the sheet lists every file here with its original file name.
