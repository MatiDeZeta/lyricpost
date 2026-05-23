import { urlToDataUrl } from '@/utils/storage';

/** Temporarily inline remote <img> sources so html-to-image avoids CORS taint */
export async function inlineExternalImages(
  node: HTMLElement
): Promise<() => void> {
  const imgs = Array.from(node.querySelectorAll('img'));
  const restores: Array<() => void> = [];

  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute('src');
      if (!src || src.startsWith('data:') || src.startsWith('blob:')) return;
      const data = await urlToDataUrl(src);
      if (data) {
        const prev = src;
        img.setAttribute('src', data);
        restores.push(() => img.setAttribute('src', prev));
      }
    })
  );

  return () => restores.forEach((r) => r());
}
