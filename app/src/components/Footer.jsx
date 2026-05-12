// Footer — Vinotheca-family lower-left.
// Mirrors region-affinities Footer.jsx exactly. Uses a typographic
// ornament (❧, U+2767) instead of an emoji so the motto renders in
// serif italic and inherits the wine-red colour of surrounding text.
//
// "License · CC BY-NC 4.0" is a single link to the LICENSE file in the repo
// (matching the pattern used by Vinotheca, the Atlases, and TasteRank).

export default function Footer() {
  return (
    <footer className="border-t border-parchment-edge bg-parchment-warm mt-12">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-4">
          <p className="font-serif italic text-wine text-base inline-flex items-center gap-3">
            <span aria-hidden="true">❧</span>
            <span>in vino, cognitio</span>
            <span aria-hidden="true">❧</span>
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-sans text-ink-muted">
          <a href="https://github.com/jskarabot18/region-resonances" className="hover:text-wine transition-colors" target="_blank" rel="noreferrer">GitHub</a>
          <span className="text-ink-subtle">·</span>
          <a href="https://github.com/jskarabot18/region-resonances/blob/main/LICENSE" className="hover:text-wine transition-colors" target="_blank" rel="noreferrer">License · CC BY-NC 4.0</a>
          <span className="text-ink-subtle">·</span>
          <a href="https://jskarabot18.github.io/vinotheca/" className="hover:text-wine transition-colors">Vinotheca</a>
          <span className="text-ink-subtle">·</span>
          <a href="mailto:hello@codexvini.com" className="hover:text-wine transition-colors">Correspondence</a>
        </div>
        <p className="text-center text-xs font-sans text-ink-subtle mt-3">
          © Jure Skarabot · MMXXVI
        </p>
      </div>
    </footer>
  );
}
