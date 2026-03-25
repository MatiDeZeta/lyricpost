# LyricPost

> A modern, beautiful Spotify-like lyrics image generator built with React, TypeScript, and TailwindCSS.

## Introduction

LyricPost is a web application that allows users to generate Spotify-like lyrics images.
Search for a song or paste a Spotify link, select lyrics lines, and generate a stylish image with customizable colors, gradients, fonts, and more.

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
- **Lyrics line selection** with select all / deselect all
- **Customizable image** — solid colors, gradients, light/dark text, Spotify tag, background shadow
- **Font controls** — choose between Poppins, Inter, or Playfair Display; adjustable font size
- **Aspect ratio presets** — Free, 1:1, 4:5, 9:16
- **Width slider** for precise image sizing
- **Download** high-quality PNG or **copy to clipboard**
- **Image history** — last 10 generated images saved locally
- **Dark / light theme** with system preference detection
- **Keyboard shortcuts** — Escape to go back
- **CJK font support** — Chinese (TW/CN/HK), Japanese, Korean glyph standards
- **Mobile-first responsive design**

## Local Installation

1. Clone the repo
   ```bash
   git clone https://github.com/palinkiewicz/lyricpost
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

## Disclaimer

This project is not affiliated with or endorsed by Spotify.
The Spotify logo is used in compliance with Spotify's branding guidelines and is fetched from an outside source.
