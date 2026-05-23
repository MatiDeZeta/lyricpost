# LyricPost

> A modern lyrics image generator — fork & redesign by [MatiDeZeta](https://github.com/MatiDeZeta), originally by [palinkiewicz](https://github.com/palinkiewicz/lyricpost).

## About

LyricPost lets you search for any song, pick your favourite lines, and export a beautiful shareable image. Monochrome dark UI, smart cover fallbacks, and a full export workflow.

### Highlights

- **Cover art** — filters Last.fm placeholders; auto-fetches from Spotify oEmbed + iTunes Search; manual upload per song (session)
- **History drawer** — restore past exports with thumbnails (up to 30, compressed)
- **Templates** — built-in Minimal / Tape / Poster + save your own
- **Export** — PNG / JPG / SVG, 1x–4x resolution, clipboard, Web Share API
- **Lyrics** — drag-reorder selection, inline edit, custom lines, karaoke preview for synced lyrics
- **Platform ratios** — IG Post, Story, X, TikTok, and generic presets
- **PWA-ready** — `manifest.webmanifest`, SPA routing via `vercel.json`

## Tech Stack

- **React 19.2** + **TypeScript 6** + **Vite 8**
- **TailwindCSS v4.3** + **Framer Motion 12.40**
- **Zustand 5** with `persist` (safe storage + quota trim)
- **Lucide React 1.16**
- **html-to-image** for export (with CORS inlining for covers)

## Data sources

- Song search — [Last.fm](https://www.last.fm/) API (`VITE_LASTFM_API_KEY`)
- Spotify links — oEmbed thumbnail + Last.fm metadata
- Cover fallback — [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) (no key)
- Lyrics — [lrclib](https://lrclib.net/docs)

## Local setup

1. Clone and install:
   ```bash
   git clone https://github.com/MatiDeZeta/lyricpost
   cd lyricpost
   npm install
   ```
2. Create `.env` from `.env.example`:
   ```
   VITE_LASTFM_API_KEY=your_lastfm_api_key
   ```
3. Run dev:
   ```bash
   npm run dev
   ```

## Build & deploy

```bash
npm run build
```

Deploy the `dist/` folder (Vercel recommended). Set `VITE_LASTFM_API_KEY` in the project environment variables.

After changing `package.json`, always run `npm install` and commit `package-lock.json`.

## Keyboard shortcuts

- **Esc** — back one step (closes history drawer first)
- **Arrow keys + Enter** — navigate song results grid

## Credits

- **Original** — [palinkiewicz/lyricpost](https://github.com/palinkiewicz/lyricpost)
- **Fork** — [MatiDeZeta/lyricpost](https://github.com/MatiDeZeta/lyricpost)

## Disclaimer

Not affiliated with Spotify. The Spotify logo is used per Spotify branding guidelines from an external CDN.
