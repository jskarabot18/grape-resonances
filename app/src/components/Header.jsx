import { useState, useRef, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Header — Vinotheca-family banner. Mirrors region-resonances/Header.jsx
// structure (TopStrip with wordmark + Vinotheca link + Documentation
// dropdown; title block with eyebrow + mixed-italic title + subtitle).
//
// Grape Resonances differences:
//   - Wordmark: Grape *Resonances* (mixed italic, noun italicised)
//   - Eyebrow: "A Correspondence of Vinotheca" (per §4.2)
//   - Subtitle: oracle-frame prompt about feelings, not regions
//   - Documentation menu: placeholder hrefs. The four PDFs (Summary,
//     Methods Primer, Technical Appendix, Data Appendix) are not yet
//     authored; the menu items show but 404 until PDFs land. This is
//     deliberate scaffolding — the menu's *presence* signals the leaf
//     follows the §4.4 Tool pattern, and the documents follow when ready.
//
// PDF link convention: trailing #page=1 forces browser-render at page 1.
// BASE_URL prefix (Vite) so the same code works in dev (/) and prod
// (/grape-resonances/).
// ---------------------------------------------------------------------------

const SOUL_OF_WINE_BASE = 'https://jskarabot18.github.io/soul-of-wine';
const BASE = import.meta.env.BASE_URL;

const DOCS = [
  { label: 'Summary',                       href: `${BASE}docs/grape-resonances-summary.pdf#page=1` },
  { label: 'Methodology and Interpretation', href: `${BASE}docs/grape-resonances-methods-primer.pdf#page=1` },
  { label: 'Technical Appendix',            href: `${BASE}docs/grape-resonances-technical-appendix.pdf#page=1` },
  { label: 'Data Appendix',                 href: `${BASE}docs/grape-resonances-data-appendix.pdf#page=1` },
  { label: 'Region Profiles — Identity',    href: `${SOUL_OF_WINE_BASE}/docs/layer1-descriptions.pdf#page=1` },
];

export default function Header() {
  return (
    <header>
      <TopStrip />
      <div className="bg-parchment-warm border-b border-parchment-edge">
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-8">
          <div className="flex items-baseline gap-4 mb-1">
            <p className="small-caps text-wine">A Correspondence of Vinotheca</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic mb-2">
            Grape <span className="not-italic font-semibold">Resonances</span>
          </h1>
          <p className="text-ink-muted text-base md:text-lg max-w-2xl leading-relaxed">
            Type a word, a phrase, a feeling.
            <span className="text-ink-subtle">
              {' '}· Find the grapes that hold this temperament, drawn through the regions that grow them.
            </span>
          </p>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// TopStrip — wordmark + Vinotheca link + Documentation dropdown
// ---------------------------------------------------------------------------

function TopStrip() {
  return (
    <div className="bg-parchment border-b border-parchment-edge">
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
        <span className="font-serif italic text-lg text-wine tracking-tight">
          Grape Resonances
        </span>
        <div className="flex items-center gap-1 text-xs font-sans">
          <a
            href="https://jskarabot18.github.io/vinotheca/"
            className="px-3 py-2 uppercase tracking-widest text-ink-muted hover:text-wine transition-colors"
          >
            Vinotheca
          </a>
          <span className="text-ink-subtle">·</span>
          <DocumentationDropdown />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DocumentationDropdown — opens on click, closes on outside click / Escape
// ---------------------------------------------------------------------------

function DocumentationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="px-3 py-2 uppercase tracking-widest text-ink-muted hover:text-wine
                   transition-colors flex items-center gap-1.5"
      >
        Documentation
        <svg viewBox="0 0 10 6" className="w-2.5 h-1.5" fill="currentColor" aria-hidden="true">
          <path d="M0 0 L5 6 L10 0 Z" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-72 bg-parchment border border-parchment-edge
                     rounded-md shadow-lg z-50 overflow-hidden"
        >
          {DOCS.map((doc) => (
            <a
              key={doc.label}
              href={doc.href}
              target="_blank"
              rel="noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-serif text-ink hover:bg-parchment-warm
                         hover:text-wine border-b border-parchment-edge last:border-b-0
                         normal-case tracking-normal"
            >
              {doc.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
