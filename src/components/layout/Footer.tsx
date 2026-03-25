export default function Footer() {
  return (
    <footer className="py-6 px-5">
      <div className="max-w-2xl mx-auto flex flex-col gap-2 text-[11px] text-neutral-700">
        <div className="flex items-center justify-between">
          <span>
            Redesigned by{' '}
            <a
              href="https://github.com/MatiDeZeta"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              MatiDeZeta
            </a>
          </span>
          <a
            href="https://github.com/MatiDeZeta/lyricpost"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            GitHub
          </a>
        </div>
        <div className="flex items-center justify-between text-neutral-800">
          <span>
            Originally by{' '}
            <a
              href="https://github.com/palinkiewicz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              palinkiewicz
            </a>
          </span>
          <a
            href="https://github.com/palinkiewicz/lyricpost"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-700 hover:text-neutral-500 transition-colors"
          >
            Original repo
          </a>
        </div>
      </div>
    </footer>
  );
}
