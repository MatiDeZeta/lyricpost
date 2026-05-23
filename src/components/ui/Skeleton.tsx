interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export default function Skeleton({ className = '', rounded = 'rounded-lg' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-white/[0.04] ${rounded} ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}
