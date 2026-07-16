import type { ExportMode } from '@/types';

/** Temporarily adjust the preview DOM for a given export mode. Call restore() after capture. */
export function prepareExportNode(
  node: HTMLElement,
  mode: ExportMode
): () => void {
  if (mode === 'full' || mode === 'cover') return () => {};

  const restores: Array<() => void> = [];

  const prevBg = node.style.background;
  const prevBgColor = node.style.backgroundColor;
  const prevBoxShadow = node.style.boxShadow;

  node.style.background = 'transparent';
  node.style.backgroundColor = 'transparent';
  node.style.boxShadow = 'none';

  restores.push(() => {
    node.style.background = prevBg;
    node.style.backgroundColor = prevBgColor;
    node.style.boxShadow = prevBoxShadow;
  });

  node.querySelectorAll<HTMLElement>('[data-export-bg]').forEach((el) => {
    const prev = el.style.display;
    el.style.display = 'none';
    restores.push(() => {
      el.style.display = prev;
    });
  });

  if (mode === 'lyrics') {
    node
      .querySelectorAll<HTMLElement>(
        '[data-export-header], [data-export-optional]'
      )
      .forEach((el) => {
        const prev = el.style.display;
        el.style.display = 'none';
        restores.push(() => {
          el.style.display = prev;
        });
      });
  }

  return () => restores.forEach((r) => r());
}

export function exportFormatForMode(
  mode: ExportMode,
  preferred: 'png' | 'jpeg' | 'svg'
): 'png' | 'jpeg' | 'svg' {
  if (mode === 'transparent' || mode === 'lyrics') return 'png';
  return preferred;
}

export function upscaleCoverUrl(url: string): string {
  if (url.startsWith('data:')) return url;
  return url
    .replace(/\/\d+x\d+\//, '/600x600/')
    .replace('100x100bb', '600x600bb')
    .replace('300x300', '600x600');
}
