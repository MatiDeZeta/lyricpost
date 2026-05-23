interface LrcLibResult {
  trackName: string;
  artistName: string;
  syncedLyrics: string | null;
  plainLyrics: string | null;
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

function trackMatches(result: LrcLibResult, trackName: string): boolean {
  return normalize(result.trackName) === normalize(trackName);
}

function artistMatches(result: LrcLibResult, artistName: string): boolean {
  const a = normalize(result.artistName);
  const b = normalize(artistName);
  return a === b || a.includes(b) || b.includes(a);
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
  if (!result?.length) return null;

  const exactTrack = result.find((data) => trackMatches(data, trackName));
  if (exactTrack) return exactTrack;

  const trackAndArtist = result.find(
    (data) => trackMatches(data, trackName) && artistMatches(data, artistName)
  );
  if (trackAndArtist) return trackAndArtist;

  const looseArtist = result.find(
    (data) => artistMatches(data, artistName)
  );
  if (looseArtist) return looseArtist;

  return result[0] ?? null;
}
