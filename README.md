# LyricPost

> A modern lyrics image generator — fork & redesign by [MatiDeZeta](https://github.com/MatiDeZeta), originally by [palinkiewicz](https://github.com/palinkiewicz/lyricpost).

## About

LyricPost is a web app that turns song lyrics into shareable images. Search by name or paste a streaming link, pick the lines you want, customize the card, and export it — ready for Instagram, X, TikTok, or anywhere else.

## How it works

| Step | Screen | What you do |
|------|--------|-------------|
| 1 | **Search** | Search by artist/song name, or paste a track URL |
| 2 | **Pick** | Choose a song from results (skipped when you paste a direct link) |
| 3 | **Lyrics** | Select, edit, and reorder lines |
| 4 | **Export** | Style the card and save / copy / share |

## Features

### Search

- Search by artist and song name (Last.fm)
- Recent searches (up to 6), clearable
- Paste track URLs from:
  - Spotify (including short links)
  - Apple Music
  - Deezer
  - YouTube Music / YouTube

### Shareable links

- Copy a link that re-opens the same song (`?link=` for platform URLs, `?q=` for name search)
- Available from the Lyrics and Export screens
- Deep links are handled on app load

### Lyrics

- Toggle lines on/off; select all or clear
- Drag-reorder selected lines
- Inline edit any line
- Add custom lines (works even when no lyrics are found)
- Karaoke preview for synced lyrics (play/pause, seek, select while previewing)
- Copy selected lyrics to the clipboard
- Upload a custom cover for the session

### Image editor

**Background**

- Solid colors (presets + custom picker + shuffle)
- Colors pulled from the cover art palette
- Gradients (from / to / angle)
- Background image upload with opacity and blur
- Toggles: light text, platform tag, drop shadow, watermark

**Text**

- Fonts: Poppins, Inter, Playfair Display
- Lyric size (12–32px) and line spacing (1.1–2.8)
- Show / hide cover, title, and artist
- Glyph presets for CJK (TW, CN, HK, JP, KR)

**Layout**

- Card width (240–600px)
- Aspect ratios: Free, 1:1, 4:5, 9:16
- Platform presets: IG Post, IG 4:5, IG Story, X, TikTok
- Output format: PNG, JPG, SVG
- Resolution: 1x, 2x, 4x

**Templates**

- Built-in: Minimal, Tape, Poster
- Save your current settings as a named template; delete user templates anytime

### Export

| Mode | Result |
|------|--------|
| **Full image** | Card as shown (background, lyrics, header, tags) |
| **No background** | Header + lyrics on a transparent PNG |
| **Lyrics only** | Lyric lines only on a transparent PNG |
| **Album cover** | Cover art file only |

- Save to disk, copy image to clipboard (PNG), or use the Web Share API when available
- History drawer: up to 30 exports with thumbnails; restore settings and lyrics, download thumb, or delete entries

## Keyboard shortcuts

- **Esc** — closes the history drawer first; otherwise goes back one wizard step. With karaoke open, closes the modal without stepping back. Cancels inline lyric / template editing without leaving the step.
- **Arrow keys + Enter** — navigate and open songs in the results grid

## Tech stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** + **Framer Motion**
- **Zustand** with persist (safe storage + quota trim)
- **Vercel serverless** — Last.fm and URL resolve proxies (API keys stay server-side)
- **html-to-image** for export (external images inlined for CORS)

## Data sources

- Song search — [Last.fm](https://www.last.fm/) API (proxied via `/api/lastfm`)
- Link paste — Spotify oEmbed, Apple/iTunes Lookup, Deezer API, YouTube oEmbed
- Cover fallback — [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) (no key) + platform thumbs; Last.fm placeholders filtered out
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
   LASTFM_API_KEY=your_lastfm_api_key
   VITE_PLAUSIBLE_DOMAIN=          # optional
   VITE_SITE_URL=http://localhost:5173
   ```
3. **API routes** require Vercel dev (Vite alone does not run `/api`):
   ```bash
   npx vercel dev
   ```
   Or use `npm run dev` with the Vite proxy (to `localhost:3000`) while `vercel dev` runs on port 3000.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

## Build & deploy

```bash
npm run build
```

Deploy to **Vercel** (recommended). Set environment variables:

| Variable | Where | Required |
|----------|-------|----------|
| `LASTFM_API_KEY` | Server | Yes (for search) |
| `VITE_PLAUSIBLE_DOMAIN` | Client | No |
| `VITE_SITE_URL` | Client | No (canonical / share / OG URLs) |

After changing `package.json`, run `npm install` and commit `package-lock.json`.

## Legal

- [Privacy Policy](/privacy.html)
- [Terms of Use](/terms.html)

## Credits

- **Original** — [palinkiewicz/lyricpost](https://github.com/palinkiewicz/lyricpost)
- **Fork** — [MatiDeZeta/lyricpost](https://github.com/MatiDeZeta/lyricpost)

## Disclaimer

Not affiliated with Spotify, Apple, YouTube, Deezer, or Last.fm. Platform logos are used for identification only from public sources.
