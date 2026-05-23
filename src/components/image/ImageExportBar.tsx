import { ArrowLeft, Download, Copy, Share2 } from 'lucide-react';
import { useImageExport } from '@/hooks/useImageExport';
import { useAppStore } from '@/store/useAppStore';

export default function ImageExportBar({
  imageRef,
  onBack,
  shareAvailable,
}: {
  imageRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
  shareAvailable: boolean;
}) {
  const isLoading = useAppStore((s) => s.isLoading);
  const { downloadImage, copyToClipboard, shareImage } = useImageExport();

  return (
    <div className="flex items-center justify-between py-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} className="text-neutral-500" />
        </button>
        <span className="text-[13px] font-medium text-neutral-400">Customize & export</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => copyToClipboard(imageRef.current)}
          disabled={isLoading}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-30"
          aria-label="Copy to clipboard"
          title="Copy to clipboard"
        >
          <Copy size={14} className="text-neutral-500" />
        </button>
        {shareAvailable && (
          <button
            onClick={() => shareImage(imageRef.current)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-30"
            aria-label="Share"
            title="Share"
          >
            <Share2 size={14} className="text-neutral-500" />
          </button>
        )}
        <button
          onClick={() => downloadImage(imageRef.current)}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black text-[12px] font-semibold hover:bg-neutral-100 active:scale-[0.97] transition-all disabled:opacity-30"
        >
          <Download size={13} />
          Save
        </button>
      </div>
    </div>
  );
}
