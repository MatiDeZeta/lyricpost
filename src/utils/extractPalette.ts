/**
 * Lightweight album-art palette extractor.
 *
 * Loads the image into a canvas, samples pixels on a coarse grid,
 * quantizes them to 4-bit-per-channel buckets, and returns the most
 * frequent N colors as hex strings.
 *
 * No external dep required.
 */
export async function extractPalette(
  imageUrl: string,
  count = 5
): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const target = 64;
        const canvas = document.createElement('canvas');
        canvas.width = target;
        canvas.height = target;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve([]);
          return;
        }
        ctx.drawImage(img, 0, 0, target, target);
        const { data } = ctx.getImageData(0, 0, target, target);

        const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 200) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          if (max - min < 8 && max > 235) continue;
          if (max < 10) continue;
          const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
          const existing = buckets.get(key);
          if (existing) {
            existing.r += r;
            existing.g += g;
            existing.b += b;
            existing.n += 1;
          } else {
            buckets.set(key, { r, g, b, n: 1 });
          }
        }

        const sorted = Array.from(buckets.values())
          .sort((a, b) => b.n - a.n)
          .slice(0, count * 3);

        const distinct: { r: number; g: number; b: number }[] = [];
        for (const c of sorted) {
          const avg = { r: c.r / c.n, g: c.g / c.n, b: c.b / c.n };
          const isFar = distinct.every((d) => {
            const dr = d.r - avg.r;
            const dg = d.g - avg.g;
            const db = d.b - avg.b;
            return Math.sqrt(dr * dr + dg * dg + db * db) > 28;
          });
          if (isFar) distinct.push(avg);
          if (distinct.length >= count) break;
        }

        resolve(distinct.map(({ r, g, b }) => rgbToHex(r, g, b)));
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function isDarkColor(hex: string): boolean {
  const v = hex.replace('#', '');
  if (v.length !== 6) return true;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma < 140;
}
