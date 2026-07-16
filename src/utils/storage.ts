/**
 * Downscale + re-encode a PNG/JPEG data URL to a JPEG of a target max-width.
 * Used to keep history thumbnails small in localStorage.
 */
export async function compressDataUrl(
  dataUrl: string,
  maxWidth = 240,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Read a File from an <input type="file"> as a data URL.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/** Compress an uploaded cover for in-memory session use */
export async function compressCoverForDisplay(
  dataUrl: string,
  maxPx = 512,
  quality = 0.85
): Promise<string> {
  return compressDataUrl(dataUrl, maxPx, quality);
}

/** Fetch remote image URL and return a data URL for canvas/export (CORS permitting) */
export async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
