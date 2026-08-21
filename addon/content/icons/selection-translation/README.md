# Selection Translation Icons

This directory is reserved for Zotero PDF Reader selection-translation UI icons.

Preferred format:

- Use SVG for functional icons.
- Prefer outline SVGs with `stroke="currentColor"` and `fill="none"` so CSS can control hover, disabled, and theme colors.
- Keep each icon visually simple at 16–20 px.
- Avoid icon fonts and Unicode glyph placeholders.

Planned filenames:

- `sidebar.svg` — open detailed translation sidebar
- `pin.svg` — pin / keep translation popup open
- `close.svg` — close popup
- `speaker.svg` — read translated text aloud through local/browser Web Speech when available
- `model.svg` — model switch control for `selectionTranslationModel`
- `history.svg` — session-scoped recent history in the detail sidebar
- `copy.svg` — copy translated text as a retained local UI utility

Out of scope for the accepted MVP unless later reintroduced:

- `more.svg` — more/actions menu
- `thumbs-up.svg` / `thumbs-down.svg` — feedback controls
- current-PDF disable icons or state assets

Brand asset:

- Keep the Immersive Translate logo as a raster or vector asset depending on the source provided later.
