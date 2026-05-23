import { Square, Smartphone, Monitor } from '@/constants/icons';
import type { AspectRatio, ExportFormat, ExportResolution } from '@/types';

export const RATIO_GROUPS: {
  label: string;
  ratios: {
    value: AspectRatio;
    label: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
  }[];
}[] = [
  {
    label: 'Generic',
    ratios: [
      { value: 'free', label: 'Free' },
      { value: '1:1', label: '1:1' },
      { value: '4:5', label: '4:5' },
      { value: '9:16', label: '9:16' },
    ],
  },
  {
    label: 'Platforms',
    ratios: [
      { value: 'ig-post', label: 'IG Post', icon: Square },
      { value: 'ig-portrait', label: 'IG 4:5', icon: Square },
      { value: 'ig-story', label: 'IG Story', icon: Smartphone },
      { value: 'x-post', label: 'X', icon: Monitor },
      { value: 'tiktok', label: 'TikTok', icon: Smartphone },
    ],
  },
];

export const FONT_FAMILIES = ['Poppins', 'Inter', 'Playfair Display'];

export const LANG_OPTIONS = [
  { value: 'en', label: 'Auto' },
  { value: 'zh-TW', label: 'TW' },
  { value: 'zh-CN', label: 'CN' },
  { value: 'zh-HK', label: 'HK' },
  { value: 'ja', label: 'JP' },
  { value: 'ko', label: 'KR' },
];

export const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPG' },
  { value: 'svg', label: 'SVG' },
];

export const RESOLUTIONS: { value: ExportResolution; label: string }[] = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 4, label: '4x' },
];
