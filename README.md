# LyricPost

> A modern lyrics image generator — fork & redesign by [MatiDeZeta](https://github.com/MatiDeZeta), originally by [palinkiewicz](https://github.com/palinkiewicz/lyricpost).

## About

LyricPost lets you search for any song, pick your favourite lines, and export a beautiful shareable image. Paste links from **Spotify, Apple Music, Deezer, or YouTube Music** — or search by name.

### Highlights

- **Multi-platform links** — paste track URLs from major streaming services
- **Cover art** — filters Last.fm placeholders; auto-fetches from platform thumbs + iTunes Search; manual upload per song (session)
- **History drawer** — restore past exports with thumbnails (up to 30, compressed)
- **Templates** — built-in Minimal / Tape / Poster + save your own
- **Export** — PNG / JPG / SVG, 1x–4x resolution, transparent modes, clipboard, Web Share API
- **Platform tags** — optional streaming-service logo on exports
- **Shareable URLs** — copy a link that re-opens the same song
- **Lyrics** — drag-reorder selection, inline edit, custom lines, karaoke preview for synced lyrics
- **Platform ratios** — IG Post, Story, X, TikTok, and generic presets

## Tech Stack

- **React 19.2** + **TypeScript 6** + **Vite 8**
- **TailwindCSS v4.3** + **Framer Motion 12.40**
- **Zustand 5** with `persist` (safe storage + quota trim)
- **Vercel serverless** — Last.fm API proxy (key hidden server-side)
- **html-to-image** for export (with CORS inlining for covers)

## Data sources

- Song search — [Last.fm](https://www.last.fm/) API (proxied via `/api/lastfm`)
- Link paste — Spotify oEmbed, Apple/iTunes Lookup, Deezer API, YouTube oEmbed
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
   LASTFM_API_KEY=your_lastfm_api_key
   VITE_PLAUSIBLE_DOMAIN=          # optional
   VITE_SITE_URL=http://localhost:5173
   ```
3. **API routes** require Vercel dev (Vite alone does not run `/api`):
   ```bash
   npx vercel dev
   ```
   Or use `npm run dev` with Vite proxy (configured to `localhost:3000`) while `vercel dev` runs on port 3000.

## Build & deploy

```bash
npm run build
```

Deploy to **Vercel** (recommended). Set environment variables:

| Variable | Where | Required |
|----------|-------|----------|
| `LASTFM_API_KEY` | Server | Yes |
| `VITE_PLAUSIBLE_DOMAIN` | Client | No |
| `VITE_SITE_URL` | Client | No (canonical/share/OG URLs) |

After changing `package.json`, run `npm install` and commit `package-lock.json`.

## Keyboard shortcuts

- **Esc** — back one step (closes history drawer first)
- **Arrow keys + Enter** — navigate song results grid

## Legal

- [Privacy Policy](/privacy.html)
- [Terms of Use](/terms.html)

## Credits

- **Original** — [palinkiewicz/lyricpost](https://github.com/palinkiewicz/lyricpost)
- **Fork** — [MatiDeZeta/lyricpost](https://github.com/MatiDeZeta/lyricpost)

## Disclaimer

Not affiliated with Spotify, Apple, YouTube, Deezer, or Last.fm. Platform logos are used for identification only from public sources.
