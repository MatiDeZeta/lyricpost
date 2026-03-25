import { useCallback } from 'react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { useAppStore } from '@/store/useAppStore';

const SCALE_FACTOR = 4;

export function useImageExport() {
  const { songs, selectedSongIndex, setLoading, addHistoryEntry, imageSettings } =
    useAppStore();

  const downloadImage = useCallback(
    async (node: HTMLElement | null) => {
      if (!node || selectedSongIndex === null) return;

      const song = songs[selectedSongIndex];
      if (!song) return;

      const downloadName = `${song.artists.map((a) => a.name).join(', ')} - ${song.name}.png`;

      setLoading(true, 'Generating image...');

      try {
        const dataUrl = await toPng(node, {
          pixelRatio: window.devicePixelRatio * SCALE_FACTOR,
          cacheBust: true,
        });

        // Save to history
        const thumbnailUrl = await toPng(node, {
          pixelRatio: 1,
          cacheBust: true,
        });

        addHistoryEntry({
          id: crypto.randomUUID(),
          songName: song.name,
          artistName: song.artists.map((a) => a.name).join(', '),
          lyrics:
            node.querySelector('.song-image-lyrics')?.textContent ?? '',
          settings: { ...imageSettings },
          thumbnailDataUrl: thumbnailUrl,
          createdAt: Date.now(),
        });

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        saveAs(blob, downloadName);
      } catch (err) {
        console.error('Failed to generate image:', err);
      } finally {
        setLoading(false);
      }
    },
    [songs, selectedSongIndex, setLoading, addHistoryEntry, imageSettings]
  );

  const copyToClipboard = useCallback(
    async (node: HTMLElement | null) => {
      if (!node) return;

      setLoading(true, 'Copying to clipboard...');

      try {
        const dataUrl = await toPng(node, {
          pixelRatio: window.devicePixelRatio * SCALE_FACTOR,
          cacheBust: true,
        });

        const res = await fetch(dataUrl);
        const blob = await res.blob();

        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
      } catch (err) {
        console.error('Failed to copy image:', err);
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  return { downloadImage, copyToClipboard };
}
