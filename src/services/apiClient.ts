export async function resolveUrl(url: string): Promise<string> {
  const res = await fetch(`/api/resolve-url?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('Failed to resolve URL');
  const data = (await res.json()) as { url: string };
  return data.url;
}

export interface PageMetadata {
  title: string | null;
  image: string | null;
  url: string;
}

export async function fetchPageMetadata(url: string): Promise<PageMetadata> {
  const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('Failed to fetch metadata');
  return res.json() as Promise<PageMetadata>;
}

export async function lastfmApi(
  params: Record<string, string>
): Promise<unknown> {
  const qs = new URLSearchParams(params);
  const res = await fetch(`/api/lastfm?${qs.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? 'Last.fm API request failed'
    );
  }
  return res.json();
}
