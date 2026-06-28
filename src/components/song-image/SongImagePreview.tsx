import { forwardRef } from 'react';
import { FALLBACK_COVER } from '@/constants/covers';
import { getDisplayCoverUrl } from '@/services/coverArt';
import { useAppStore } from '@/store/useAppStore';

const SPOTIFY_LOGO =
  'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg';

const FONT_MAP: Record<string, string> = {
  Poppins: "'Poppins', sans-serif",
  Inter: "'Inter', sans-serif",
  'Playfair Display': "'Playfair Display', serif",
};

interface SongImagePreviewProps {
  editableName?: string;
  editableArtist?: string;
  editableLyrics?: string;
  onNameChange?: (val: string) => void;
  onArtistChange?: (val: string) => void;
  onLyricsChange?: (val: string) => void;
}

const SongImagePreview = forwardRef<HTMLDivElement, SongImagePreviewProps>(
  (
    {
      editableName,
      editableArtist,
      editableLyrics,
      onNameChange,
      onArtistChange,
      onLyricsChange,
    },
    ref
  ) => {
    const {
      songs,
      selectedSongIndex,
      selectedLyricIndices,
      lyricOrder,
      imageSettings,
    } = useAppStore();

    const song =
      selectedSongIndex !== null ? songs[selectedSongIndex] : null;

    if (!song) return null;

    const name = editableName ?? song.name;
    const artist =
      editableArtist ?? song.artists.map((a) => a.name).join(', ');

    // Respect user-provided ordering (drag-reorder), fall back to natural order.
    const orderedSelected = lyricOrder.length > 0
      ? lyricOrder.filter((i) => selectedLyricIndices.has(i))
      : (song.lyrics ?? [])
          .map((_, i) => i)
          .filter((i) => selectedLyricIndices.has(i));

    const selectedLyrics =
      editableLyrics ??
      (song.lyrics
        ? orderedSelected
            .map((i) => song.lyrics?.[i]?.text)
            .filter(Boolean)
            .join('\n') ||
          'No lyrics selected\nType your own lyrics here'
        : 'No lyrics selected\nType your own lyrics here');

    const {
      backgroundColor,
      gradient,
      useGradient,
      backgroundImage,
      lightText,
      showSpotifyTag,
      showBackground,
      showWatermark,
      width,
      fontSize,
      fontFamily,
      aspectRatio,
    } = imageSettings;

    const bgStyle = useGradient && gradient
      ? {
          background: `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.to})`,
        }
      : { backgroundColor };

    const textColor = lightText
      ? 'rgba(255, 255, 255, 0.95)'
      : 'rgba(0, 0, 0, 0.95)';

    const subTextColor = lightText
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(0, 0, 0, 0.6)';

    const fontFamilyValue = FONT_MAP[fontFamily] || FONT_MAP['Poppins'];

    const aspectRatioMap: Record<string, string | undefined> = {
      free: undefined,
      '1:1': '1 / 1',
      '4:5': '4 / 5',
      '9:16': '9 / 16',
      'ig-post': '1 / 1',
      'ig-portrait': '4 / 5',
      'ig-story': '9 / 16',
      'x-post': '16 / 9',
      tiktok: '9 / 16',
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      const sel = window.getSelection();
      if (!sel?.rangeCount) return;
      sel.deleteFromDocument();
      sel.getRangeAt(0).insertNode(document.createTextNode(text));
      sel.collapseToEnd();
    };

    const coverSrc = getDisplayCoverUrl(song) ?? FALLBACK_COVER;

    const boxShadow = showBackground
      ? '0 30px 60px -20px rgba(0,0,0,0.55), 0 12px 24px -10px rgba(0,0,0,0.4)'
      : undefined;

    return (
      <div
        ref={ref}
        className="song-image-root overflow-hidden relative"
        style={{
          ...bgStyle,
          color: textColor,
          width: `${width}px`,
          fontFamily: fontFamilyValue,
          aspectRatio: aspectRatioMap[aspectRatio],
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '1.25rem',
          boxShadow,
          isolation: 'isolate',
        }}
      >
        {/* Custom background image layer */}
        {backgroundImage && (
          <>
            <div
              aria-hidden
              data-export-bg
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${backgroundImage.dataUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: backgroundImage.opacity,
                filter: `blur(${backgroundImage.blur}px)`,
                zIndex: 0,
                transform: backgroundImage.blur > 0 ? 'scale(1.05)' : undefined,
              }}
            />
            <div
              aria-hidden
              data-export-bg
              style={{
                position: 'absolute',
                inset: 0,
                background: lightText
                  ? 'linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.45))'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.2))',
                zIndex: 0,
              }}
            />
          </>
        )}

        {/* Header: cover + song info */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '1.1rem 1rem 0',
          }}
        >
          <img
            className="song-export-cover"
            src={coverSrc}
            alt="Album cover"
            crossOrigin="anonymous"
            style={{
              width: '2.2rem',
              height: '2.2rem',
              borderRadius: '0.4rem',
              objectFit: 'cover',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              contentEditable
              suppressContentEditableWarning
              onPaste={handlePaste}
              onBlur={(e) => onNameChange?.(e.currentTarget.textContent ?? '')}
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                lineHeight: '1.1rem',
                letterSpacing: '-0.01em',
                outline: 'none',
              }}
            >
              {name}
            </div>
            <div
              contentEditable
              suppressContentEditableWarning
              onPaste={handlePaste}
              onBlur={(e) =>
                onArtistChange?.(e.currentTarget.textContent ?? '')
              }
              style={{
                fontSize: '0.7rem',
                lineHeight: '0.95rem',
                fontWeight: 500,
                color: subTextColor,
                outline: 'none',
                marginTop: '0.1rem',
              }}
            >
              {artist}
            </div>
          </div>
        </div>

        {/* Lyrics */}
        <div
          className="song-image-lyrics"
          contentEditable
          suppressContentEditableWarning
          onPaste={handlePaste}
          onBlur={(e) => onLyricsChange?.(e.currentTarget.innerText ?? '')}
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: `${fontSize}px`,
            fontWeight: 700,
            lineHeight: 1.4,
            letterSpacing: '-0.01em',
            padding: '1rem',
            outline: 'none',
            whiteSpace: 'pre-wrap',
            flex: aspectRatio !== 'free' ? 1 : undefined,
            display: aspectRatio !== 'free' ? 'flex' : undefined,
            alignItems: aspectRatio !== 'free' ? 'center' : undefined,
          }}
        >
          {selectedLyrics}
        </div>

        {/* Spotify tag */}
        {showSpotifyTag && (
          <div
            data-export-optional
            style={{
              position: 'relative',
              zIndex: 1,
              padding: '0 1rem 0.75rem',
              height: '1.6rem',
              filter: lightText
                ? 'brightness(0) invert(1) opacity(0.7)'
                : 'brightness(0) opacity(0.5)',
            }}
          >
            <img
              src={SPOTIFY_LOGO}
              alt="Spotify"
              crossOrigin="anonymous"
              style={{ height: '100%' }}
            />
          </div>
        )}

        {/* Watermark */}
        {showWatermark && (
          <div
            data-export-optional
            style={{
              position: 'relative',
              zIndex: 1,
              padding: '0 1rem 0.65rem',
              fontSize: '0.6rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: lightText
                ? 'rgba(255,255,255,0.35)'
                : 'rgba(0,0,0,0.35)',
              textAlign: 'right',
              marginTop: showSpotifyTag ? 0 : 'auto',
            }}
          >
            made with lyricpost
          </div>
        )}
      </div>
    );
  }
);

SongImagePreview.displayName = 'SongImagePreview';

export default SongImagePreview;
