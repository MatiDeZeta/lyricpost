import { forwardRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

const SPOTIFY_LOGO =
  'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg';

const FALLBACK_COVER =
  'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png';

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
    const { songs, selectedSongIndex, selectedLyricIndices, imageSettings } =
      useAppStore();

    const song =
      selectedSongIndex !== null ? songs[selectedSongIndex] : null;

    if (!song) return null;

    const name = editableName ?? song.name;
    const artist =
      editableArtist ?? song.artists.map((a) => a.name).join(', ');

    const selectedLyrics =
      editableLyrics ??
      (song.lyrics
        ?.filter((_, i) => selectedLyricIndices.has(i))
        .map((l) => l.text)
        .join('\n') ||
        'No lyrics selected\nType your own lyrics here');

    const {
      backgroundColor,
      gradient,
      useGradient,
      lightText,
      showSpotifyTag,
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
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    };

    return (
      <div
        ref={ref}
        className="song-image-root overflow-hidden"
        style={{
          ...bgStyle,
          color: textColor,
          width: `${width}px`,
          fontFamily: fontFamilyValue,
          aspectRatio: aspectRatioMap[aspectRatio],
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '1.25rem',
        }}
      >
        {/* Header: cover + song info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '1.1rem 1rem 0',
          }}
        >
          <img
            src={song.albumCoverUrl || FALLBACK_COVER}
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
            style={{
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
      </div>
    );
  }
);

SongImagePreview.displayName = 'SongImagePreview';

export default SongImagePreview;
