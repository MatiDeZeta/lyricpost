/** Parse "Artist - Song" style titles from oEmbed / OG metadata */
export function parseArtistTitle(raw: string): {
  artist: string;
  title: string;
} | null {
  const cleaned = raw
    .replace(/\s*[(\[][^)\]]*[)\]]\s*/g, ' ')
    .replace(/\s*[-–—|]\s*(official|lyric|audio|video|mv|hd|4k|visualizer|topic).*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  const separators = [' - ', ' – ', ' — ', ' | ', ': '];
  for (const sep of separators) {
    const idx = cleaned.indexOf(sep);
    if (idx > 0) {
      const artist = cleaned.slice(0, idx).trim();
      const title = cleaned.slice(idx + sep.length).trim();
      if (artist && title) return { artist, title };
    }
  }

  return null;
}

export function upscaleArtwork(url: string): string {
  return url
    .replace('100x100bb', '600x600bb')
    .replace(/\/\d+x\d+\//, '/600x600/');
}
