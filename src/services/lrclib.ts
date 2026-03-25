interface LrcLibResult {
  trackName: string;
  artistName: string;
  syncedLyrics: string | null;
  plainLyrics: string | null;
}

export async function fetchLyrics(
  artistName: string,
  trackName: string
): Promise<LrcLibResult | null> {
  const response = await fetch(
    `https://lrclib.net/api/search?q=${encodeURIComponent(artistName)} ${encodeURIComponent(trackName)}`,
    { method: 'GET' }
  );

  const result: LrcLibResult[] = await response.json();

  const exactMatch = result.find(
    (data) =>
      data.trackName.toLowerCase().trim() === trackName.toLowerCase().trim()
  );

  return exactMatch ?? result[0] ?? null;
}
