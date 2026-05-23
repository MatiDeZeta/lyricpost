import { useRef, useEffect, useState } from 'react';
import SongImagePreview from '@/components/song-image/SongImagePreview';
import { useAppStore } from '@/store/useAppStore';

export default function ImagePreviewPane({
  imageRef,
}: {
  imageRef: React.RefObject<HTMLDivElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageSettings = useAppStore((s) => s.imageSettings);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 32;
      const imgWidth = imageSettings.width;
      if (imgWidth > containerWidth && containerWidth > 0) {
        setScale(containerWidth / imgWidth);
      } else {
        setScale(1);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [imageSettings.width]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center py-6 rounded-2xl bg-white/[0.02] border border-white/[0.03] mb-4"
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          marginBottom: `${(scale - 1) * (imageRef.current?.offsetHeight ?? 0)}px`,
        }}
      >
        <SongImagePreview ref={imageRef} />
      </div>
    </div>
  );
}
