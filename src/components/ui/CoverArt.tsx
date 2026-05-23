import { useRef } from 'react';
import { Disc3, Upload } from '@/constants/icons';
import { FALLBACK_COVER } from '@/constants/covers';
import { getDisplayCoverUrl, hasRealCover } from '@/services/coverArt';
import { compressCoverForDisplay, readFileAsDataUrl } from '@/utils/storage';
import { useAppStore } from '@/store/useAppStore';
import type { Song } from '@/types';
import Skeleton from './Skeleton';

type Size = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<Size, { box: string; icon: number }> = {
  sm: { box: 'w-8 h-8 rounded-md', icon: 14 },
  md: { box: 'w-full aspect-square rounded-xl', icon: 28 },
  lg: { box: 'w-16 h-16 rounded-lg', icon: 22 },
};

interface CoverArtProps {
  song: Song;
  songIndex: number;
  size?: Size;
  showUpload?: boolean;
  className?: string;
}

export default function CoverArt({
  song,
  songIndex,
  size = 'md',
  showUpload = true,
  className = '',
}: CoverArtProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const setSongCover = useAppStore((s) => s.setSongCover);
  const pushToast = useAppStore((s) => s.pushToast);

  const url = getDisplayCoverUrl(song);
  const missing = !hasRealCover(song);
  const { box, icon } = SIZE_CLASS[size];

  const onFile = async (file: File) => {
    try {
      const raw = await readFileAsDataUrl(file);
      const compressed = await compressCoverForDisplay(raw, 512);
      setSongCover(songIndex, compressed);
      pushToast('success', 'Cover updated');
    } catch {
      pushToast('error', "Couldn't read that image");
    }
  };

  if (song.coverLoading) {
    return (
      <Skeleton className={box} rounded={size === 'sm' ? 'rounded-md' : 'rounded-xl'} />
    );
  }

  return (
    <div className={`relative group/cover ${box} ${className}`}>
      {url ? (
        <img
          src={url}
          alt={`${song.name} cover`}
          className={`${box} object-cover w-full h-full`}
          loading="lazy"
          crossOrigin="anonymous"
        />
      ) : (
        <div
          className={`${box} w-full h-full flex flex-col items-center justify-center bg-white/[0.04] border border-dashed border-white/[0.08] text-neutral-600`}
        >
          <Disc3 size={icon} strokeWidth={1.5} />
          {size !== 'sm' && (
            <span className="text-[10px] mt-1 font-medium">No cover</span>
          )}
        </div>
      )}

      {showUpload && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/cover:opacity-100 transition-opacity rounded-[inherit] ${
              missing ? 'opacity-100 bg-black/40' : ''
            }`}
            aria-label="Upload cover"
            title="Upload cover"
          >
            <Upload size={size === 'sm' ? 12 : 16} className="text-white" />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
              e.target.value = '';
            }}
          />
        </>
      )}

      {missing && size === 'md' && (
        <span className="absolute top-1.5 left-1.5 px-1.5 py-px rounded text-[9px] font-semibold uppercase tracking-wider bg-black/60 text-neutral-400 backdrop-blur">
          Upload
        </span>
      )}
    </div>
  );
}

/** Static display when no song index (e.g. fallback only) */
export function CoverArtStatic({
  src,
  alt,
  className = '',
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const url = src || FALLBACK_COVER;
  return (
    <img
      src={url}
      alt={alt}
      className={`object-cover ${className}`}
      crossOrigin="anonymous"
    />
  );
}
