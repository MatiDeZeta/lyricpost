# LyricPost

> A modern lyrics image generator — fork & redesign by [MatiDeZeta](https://github.com/MatiDeZeta), originally by [palinkiewicz](https://github.com/palinkiewicz/lyricpost).

## About

LyricPost lets you search for any song, pick your favourite lines, and export a beautiful shareable image. This fork features a complete UI redesign with a monochrome dark theme and several new features.

### What's new in this fork

- **Monochrome dark theme** — fully redesigned UI with a sleek gray palette
- **Shuffle color** — randomize the background color with one click
- **Reset settings** — restore all image controls to defaults instantly
- **Copy lyrics as text** — copy selected lyrics to your clipboard from the lyrics screen
- **Inline step indicator** — compact breadcrumb navigation in the header
- **Grid-based song results** — album art cards instead of a flat list
- **Improved animations** — smoother transitions with AnimatePresence throughout
- **Better empty states** — clear messaging and icons when no lyrics are found
- **Refined image preview** — container with visual boundary for the export area

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **TailwindCSS v4** for styling
- **Zustand** for state management
- **Framer Motion** for animations
- **html-to-image** for high-quality image export
- **Lucide React** for icons

## Features

- **Song search** via [Last.fm](https://www.last.fm/) API
- **Spotify link support** — paste a Spotify track URL to load a song directly
- **Lyrics fetching** from [lrclib](https://lrclib.net/docs)
- **Lyrics line selection** with select all / deselect all / copy as text
- **Customizable image** — solid colors, gradients, light/dark text, Spotify tag
- **Shuffle & reset** — quick color randomizer and one-click settings reset
- **Font controls** — Poppins, Inter, or Playfair Display; adjustable font size
- **Aspect ratio presets** — Free, 1:1, 4:5, 9:16
- **Width slider** for precise image sizing
- **Download** high-quality PNG or **copy to clipboard**
- **Keyboard shortcuts** — Escape to go back
- **CJK font support** — Chinese (TW/CN/HK), Japanese, Korean glyph standards
- **Mobile-first responsive design**

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
