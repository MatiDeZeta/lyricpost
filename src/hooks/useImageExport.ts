import { useCallback } from 'react';
import { toPng, toJpeg, toSvg, toBlob } from 'html-to-image';
import { saveAs } from 'file-saver';
import { useAppStore } from '@/store/useAppStore';
import { getDisplayCoverUrl } from '@/services/coverArt';
import { compressDataUrl, urlToDataUrl } from '@/utils/storage';
import { inlineExternalImages } from '@/utils/inlineExportImages';
import {
  prepareExportNode,
  exportFormatForMode,
  upscaleCoverUrl,
} from '@/utils/exportPrepare';
import type { ExportMode } from '@/types';

function pickRenderer(format: 'png' | 'jpeg' | 'svg') {
  if (format === 'jpeg') return toJpeg;
  if (format === 'svg') return toSvg;
  return toPng;
}

function extensionFor(format: 'png' | 'jpeg' | 'svg') {
  return format === 'jpeg' ? 'jpg' : format;
}

function songFileBase(song: { name: string; artists: { name: string }[] }) {
  return `${song.artists.map((a) => a.name).join(', ')} - ${song.name}`;
}

function htmlToImageOptions() {
  const { imageSettings } = useAppStore.getState();
  return {
    pixelRatio: window.devicePixelRatio * imageSettings.resolution,
    cacheBust: true,
    skipFonts: true,
  };
}

async function renderNode(
  node: HTMLElement,
  format: 'png' | 'jpeg' | 'svg',
  mode: ExportMode
) {
  const restoreInline = await inlineExternalImages(node);
  const restoreMode = prepareExportNode(node, mode);
  try {
    const renderer = pickRenderer(format);
    return await renderer(node, htmlToImageOptions());
  } finally {
    restoreMode();
    restoreInline();
  }
}

async function renderBlob(node: HTMLElement, mode: ExportMode) {
  const restoreInline = await inlineExternalImages(node);
  const restoreMode = prepareExportNode(node, mode);
  try {
    const { imageSettings } = useAppStore.getState();
    const format = exportFormatForMode(mode, imageSettings.format);
    const opts = htmlToImageOptions();
    if (format === 'jpeg') {
      return await toJpeg(node, opts).then((url) =>
        fetch(url).then((r) => r.blob())
      );
    }
    return await toBlob(node, opts);
  } finally {
    restoreMode();
    restoreInline();
  }
}

/** Always PNG — ClipboardItem is most reliable with image/png across browsers. */
async function renderClipboardBlob(node: HTMLElement, mode: ExportMode) {
  const restoreInline = await inlineExternalImages(node);
  const restoreMode = prepareExportNode(node, mode);
  try {
    return await toBlob(node, htmlToImageOptions());
  } finally {
    restoreMode();
    restoreInline();
  }
}

export function useImageExport() {
  const downloadImage = useCallback(
    async (node: HTMLElement | null, mode: ExportMode = 'full') => {
      const state = useAppStore.getState();
      const {
        songs,
        selectedSongIndex,
        setLoading,
        addHistoryEntry,
        imageSettings,
        pushToast,
      } = state;

      if (selectedSongIndex === null) return;
      const song = songs[selectedSongIndex];
      if (!song) return;

      const base = songFileBase(song);

      if (mode === 'cover') {
        setLoading(true, 'Saving cover art...');
        try {
          const coverUrl = getDisplayCoverUrl(song);
          if (!coverUrl) {
            pushToast('error', 'No cover art available');
            return;
          }
          const hiRes = upscaleCoverUrl(coverUrl);
          const dataUrl =
            hiRes.startsWith('data:') ? hiRes : await urlToDataUrl(hiRes);
          if (!dataUrl) {
            pushToast('error', 'Could not fetch cover art');
            return;
          }
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          saveAs(blob, `${base} - cover.jpg`);
          pushToast('success', 'Cover art saved');
        } catch (err) {
          console.error('Failed to save cover:', err);
          pushToast('error', 'Failed to save cover art');
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!node) return;

      const format = exportFormatForMode(mode, imageSettings.format);
      const ext = extensionFor(format);
      const suffix =
        mode === 'transparent'
          ? ' (transparent)'
          : mode === 'content'
            ? ' (content)'
            : '';
      const fileName = `${base}${suffix}.${ext}`;

      setLoading(true, 'Generating image...');

      try {
        const dataUrl = await renderNode(node, format, mode);

        if (mode === 'full') {
          const thumbnailDataUrl = await compressDataUrl(dataUrl, 240, 0.78);
          addHistoryEntry({
            id: crypto.randomUUID(),
            songName: song.name,
            artistName: song.artists.map((a) => a.name).join(', '),
            albumCoverUrl: getDisplayCoverUrl(song),
            lyrics:
              node.querySelector('.song-image-lyrics')?.textContent ?? '',
            settings: {
              ...imageSettings,
              backgroundImage: null,
            },
            thumbnailDataUrl,
            createdAt: Date.now(),
          });
        }

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        saveAs(blob, fileName);
        pushToast('success', 'Image saved');
      } catch (err) {
        console.error('Failed to generate image:', err);
        pushToast('error', 'Failed to generate image');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const copyToClipboard = useCallback(
    async (node: HTMLElement | null, mode: ExportMode = 'full') => {
      const state = useAppStore.getState();
      const { setLoading, pushToast } = state;
      if (!node) return;

      setLoading(true, 'Copying to clipboard...');

      try {
        const blob = await renderClipboardBlob(node, mode);
        if (!blob) throw new Error('No blob produced');

        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type || 'image/png']: blob }),
        ]);
        pushToast('success', 'Copied to clipboard');
      } catch (err) {
        console.error('Failed to copy image:', err);
        pushToast('error', "Couldn't copy image");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const shareImage = useCallback(
    async (node: HTMLElement | null, mode: ExportMode = 'full') => {
      const state = useAppStore.getState();
      const { songs, selectedSongIndex, setLoading, imageSettings, pushToast } =
        state;
      if (!node || selectedSongIndex === null) return;
      const song = songs[selectedSongIndex];
      if (!song) return;

      setLoading(true, 'Preparing to share...');
      try {
        const blob = await renderBlob(node, mode);
        if (!blob) throw new Error('No blob');

        const format = exportFormatForMode(mode, imageSettings.format);
        const ext = extensionFor(format);
        const file = new File(
          [blob],
          `${song.name}.${ext}`,
          { type: blob.type || 'image/png' }
        );

        if (
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            title: `${song.name} — ${song.artists.map((a) => a.name).join(', ')}`,
            text: 'Made with lyricpost',
          });
        } else {
          saveAs(blob, file.name);
          pushToast('info', 'Sharing not supported, downloaded instead');
        }
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          console.error('Share failed:', err);
          pushToast('error', "Couldn't share image");
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { downloadImage, copyToClipboard, shareImage };
}

export function canShareFiles(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (typeof navigator.canShare !== 'function') return false;
  try {
    return navigator.canShare({
      files: [new File([new Blob()], 'x.png', { type: 'image/png' })],
    });
  } catch {
    return false;
  }
}
