import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Copy, Share2, ChevronDown } from 'lucide-react';
import { useImageExport } from '@/hooks/useImageExport';
import { useAppStore } from '@/store/useAppStore';
import { EXPORT_MODES } from './imageConstants';
import type { ExportMode } from '@/types';

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
  const [exportMode, setExportMode] = useState<ExportMode>('full');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLabel =
    EXPORT_MODES.find((m) => m.value === exportMode)?.label ?? 'Save';

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const save = (mode: ExportMode = exportMode) => {
    setExportMode(mode);
    setMenuOpen(false);
    void downloadImage(imageRef.current, mode);
  };

  const copyLabel =
    exportMode === 'cover'
      ? 'Cover art cannot be copied — use Save'
      : 'Copy to clipboard';

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
        <span className="text-[13px] font-medium text-neutral-400">
          Customize & export
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => copyToClipboard(imageRef.current, exportMode)}
          disabled={isLoading || exportMode === 'cover'}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-30"
          aria-label={copyLabel}
          title={copyLabel}
        >
          <Copy size={14} className="text-neutral-500" />
        </button>
        {shareAvailable && (
          <button
            onClick={() => shareImage(imageRef.current, exportMode)}
            disabled={isLoading || exportMode === 'cover'}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-30"
            aria-label="Share"
            title={
              exportMode === 'cover'
                ? 'Cover art cannot be shared — use Save'
                : 'Share'
            }
          >
            <Share2 size={14} className="text-neutral-500" />
          </button>
        )}
        <div className="relative" ref={menuRef}>
          <div className="flex items-stretch rounded-xl overflow-hidden">
            <button
              onClick={() => save()}
              disabled={isLoading}
              className="flex items-center gap-1.5 pl-3.5 pr-2.5 py-2 bg-white text-black text-[12px] font-semibold hover:bg-neutral-100 active:scale-[0.97] transition-all disabled:opacity-30"
            >
              <Download size={13} />
              {currentLabel}
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              disabled={isLoading}
              className="flex items-center px-1.5 bg-white text-black border-l border-black/10 hover:bg-neutral-100 transition-colors disabled:opacity-30"
              aria-label="More save options"
              aria-expanded={menuOpen}
            >
              <ChevronDown
                size={13}
                className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-white/[0.08] bg-[#141414] shadow-xl shadow-black/40 py-1 z-50"
              role="menu"
            >
              {EXPORT_MODES.map((mode) => (
                <button
                  key={mode.value}
                  role="menuitem"
                  onClick={() => save(mode.value)}
                  className={`w-full text-left px-3 py-2 hover:bg-white/[0.06] transition-colors ${
                    exportMode === mode.value ? 'bg-white/[0.04]' : ''
                  }`}
                >
                  <div className="text-[12px] font-medium text-neutral-200">
                    {mode.label}
                  </div>
                  <div className="text-[10px] text-neutral-600 mt-0.5 leading-snug">
                    {mode.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
