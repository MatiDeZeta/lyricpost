export default function Footer() {
  return (
    <footer className="text-center py-5 px-4 border-t border-white/[0.04]">
      <p className="text-[11px] text-neutral-600">
        Built by{' '}
        <a
          href="https://github.com/palinkiewicz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-400 hover:text-white transition-colors"
        >
          palinkiewicz
        </a>
        {' · '}
        <a
          href="https://ko-fi.com/palinkiewicz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-400 hover:text-white transition-colors"
        >
          Support
        </a>
      </p>
    </footer>
  );
}
