import { useCallback } from 'react';
import { toPng, toJpeg, toSvg, toBlob } from 'html-to-image';
import { saveAs } from 'file-saver';
import { useAppStore } from '@/store/useAppStore';
import { getDisplayCoverUrl } from '@/services/coverArt';
import { compressDataUrl } from '@/utils/storage';
import { inlineExternalImages } from '@/utils/inlineExportImages';

function pickRenderer(format: 'png' | 'jpeg' | 'svg') {
  if (format === 'jpeg') return toJpeg;
  if (format === 'svg') return toSvg;
  return toPng;
}

function extensionFor(format: 'png' | 'jpeg' | 'svg') {
  return format === 'jpeg' ? 'jpg' : format;
}

async function renderNode(node: HTMLElement, format: 'png' | 'jpeg' | 'svg') {
  const restore = await inlineExternalImages(node);
  try {
    const renderer = pickRenderer(format);
    const { imageSettings } = useAppStore.getState();
    return await renderer(node, {
      pixelRatio: window.devicePixelRatio * imageSettings.resolution,
      cacheBust: true,
    });
  } finally {
    restore();
  }
}

async function renderBlob(node: HTMLElement) {
  const restore = await inlineExternalImages(node);
  try {
    const { imageSettings } = useAppStore.getState();
    return await toBlob(node, {
      pixelRatio: window.devicePixelRatio * imageSettings.resolution,
      cacheBust: true,
    });
  } finally {
    restore();
  }
}

export function useImageExport() {
  const downloadImage = useCallback(async (node: HTMLElement | null) => {
    const state = useAppStore.getState();
    const {
      songs,
      selectedSongIndex,
      setLoading,
      addHistoryEntry,
      imageSettings,
      pushToast,
    } = state;

    if (!node || selectedSongIndex === null) return;
    const song = songs[selectedSongIndex];
    if (!song) return;

    const ext = extensionFor(imageSettings.format);
    const fileName = `${song.artists.map((a) => a.name).join(', ')} - ${song.name}.${ext}`;

    setLoading(true, 'Generating image...');

    try {
      const dataUrl = await renderNode(node, imageSettings.format);
      const thumbnailDataUrl = await compressDataUrl(dataUrl, 240, 0.78);

      addHistoryEntry({
        id: crypto.randomUUID(),
        songName: song.name,
        artistName: song.artists.map((a) => a.name).join(', '),
        albumCoverUrl: getDisplayCoverUrl(song),
        lyrics:
          node.querySelector('.song-image-lyrics')?.textContent ?? '',
        settings: { ...imageSettings },
        thumbnailDataUrl,
        createdAt: Date.now(),
      });

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
  }, []);

  const copyToClipboard = useCallback(async (node: HTMLElement | null) => {
    const state = useAppStore.getState();
    const { setLoading, pushToast } = state;
    if (!node) return;

    setLoading(true, 'Copying to clipboard...');

    try {
      const blob = await renderBlob(node);
      if (!blob) throw new Error('No blob produced');

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      pushToast('success', 'Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy image:', err);
      pushToast('error', "Couldn't copy image");
    } finally {
      setLoading(false);
    }
  }, []);

  const shareImage = useCallback(async (node: HTMLElement | null) => {
    const state = useAppStore.getState();
    const { songs, selectedSongIndex, setLoading, imageSettings, pushToast } =
      state;
    if (!node || selectedSongIndex === null) return;
    const song = songs[selectedSongIndex];
    if (!song) return;

    setLoading(true, 'Preparing to share...');
    try {
      const blob = await renderBlob(node);
      if (!blob) throw new Error('No blob');

      const ext = extensionFor(imageSettings.format);
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
  }, []);

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
