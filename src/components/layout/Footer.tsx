export default function Footer() {
  return (
    <footer className="py-6 px-5">
      <div className="max-w-2xl mx-auto flex items-center justify-between text-[11px] text-neutral-700">
        <span>
          by{' '}
          <a
            href="https://github.com/palinkiewicz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            palinkiewicz
          </a>
        </span>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/palinkiewicz/lyricpost"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://ko-fi.com/palinkiewicz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
