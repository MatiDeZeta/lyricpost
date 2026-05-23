# LyricPost

> A modern lyrics image generator — fork & redesign by [MatiDeZeta](https://github.com/MatiDeZeta), originally by [palinkiewicz](https://github.com/palinkiewicz/lyricpost).

## About

LyricPost lets you search for any song, pick your favourite lines, and export a beautiful shareable image. This fork is a redesign with a sleek monochrome dark theme and a deep set of editing, layout, and export features — built to feel as fast as it looks.

## What's new in this fork

### Workflow
- **Recent searches** — chip row of your last queries, with one-tap re-run and individual remove
- **Sample suggestions** — try-one chips on first run so you're never staring at an empty input
- **Grid-based song results** with keyboard navigation (arrows + Enter)
- **Skeleton loading states** instead of plain spinners

### Lyrics screen
- **Drag-to-reorder** selected lyrics — the export follows your order
- **Inline edit** any lyric line with a pencil button
- **Add custom line** — extend a song with your own text
- **Karaoke preview** for songs with synced lyrics — scrub through the timeline and toggle lines into your selection
- **Copy as text** + select all / clear

### Image screen
- **Tabbed controls**: Background, Text, Layout — no more wall of options
- **Album-art palette** — auto-extracted dominant colors from the cover, plus a one-tap Auto pick
- **Custom background image** upload with opacity + blur sliders
- **Gradient** background with two color stops + angle
- **Shuffle color** and **Reset all** built-in
- **Templates** — save current settings as a named template, plus 3 built-in styles (`Minimal`, `Tape`, `Poster`)
- **Watermark** toggle, **Shadow** depth, **Spotify tag**, **Light text** toggle

### Export
- **PNG / JPG / SVG** format choice
- **Resolution** toggle (1x / 2x / 4x)
- **Web Share API** support — share directly to other apps where supported
- **Copy to clipboard** with confirmation toast
- **Filename** auto-derived from artist + song

### History
- **History drawer** — every saved export is kept (up to 30) with a compressed thumbnail
- **Restore** any past export back into the editor with one tap
- **Re-download** the thumbnail, or delete individual entries / clear all
- **Persisted** locally — settings, recent searches, templates and history all survive reloads

### Polish
- **Toast notifications** for success, errors, and info
- **Strict monochrome dark theme** throughout
- **Smoother animations** with AnimatePresence
- **CJK font support** — Chinese (TW/CN/HK), Japanese, Korean glyph standards
- **Keyboard shortcuts** — Escape to step back (or close drawer/modal first)
- **Mobile-first responsive design**

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **TailwindCSS v4** for styling
- **Zustand** (+ `persist` middleware) for state management & local persistence
- **Framer Motion** for animations and drag-to-reorder
- **html-to-image** for PNG / JPEG / SVG export
- **Lucide React** for icons

## Data sources

- **Song search** via [Last.fm](https://www.last.fm/) API
- **Spotify link support** — paste a Spotify track URL to load a song directly (via Spotify's oEmbed)
- **Lyrics** from [lrclib](https://lrclib.net/docs) (plain + synced)

## Local Installation

1. Clone the repo
   ```bash
   git clone https://github.com/MatiDeZeta/lyricpost
   cd lyricpost
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file (see `.env.example`)
   ```
   VITE_LASTFM_API_KEY=your_lastfm_api_key
   ```
4. Start the dev server
   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
```

Output is in the `dist/` folder.

## Credits

- **Original project** — [palinkiewicz/lyricpost](https://github.com/palinkiewicz/lyricpost)
- **Fork & redesign** — [MatiDeZeta/lyricpost](https://github.com/MatiDeZeta/lyricpost)

## Disclaimer

This project is not affiliated with or endorsed by Spotify.
The Spotify logo is used in compliance with Spotify's branding guidelines and is fetched from an outside source.
