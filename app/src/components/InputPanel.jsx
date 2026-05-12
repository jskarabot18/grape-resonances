/**
 * InputPanel
 *
 * Left column. The user's primary interaction surface:
 *   - A large freeform text input (the "resonance-input" pattern)
 *   - Example chips below to seed inspiration
 *   - A Reset link, visible only when the user has typed something
 *   - A subtle status area for loading / error messages
 *
 * The component is presentational — it holds the input value as
 * controlled state via the `query` and `onQueryChange` props from App.
 */

const EXAMPLE_QUERIES = [
  'falling deeply in love',
  'the feeling of brotherhood',
  'the weight of a decision',
  'the slow undoing of an old certainty',
  'the quiet authority of having survived something',
  'what you keep when everything else is gone',
];

export default function InputPanel({
  query,
  onQueryChange,
  status,        // 'idle' | 'loading' | 'error' | 'ready'
  errorMessage,
}) {
  const hasQuery = query.trim().length > 0;

  return (
    <aside className="lg:sticky lg:top-8 lg:self-start space-y-6">
      <div>
        <label htmlFor="resonance-query" className="small-caps block mb-2">
          What does it feel like?
        </label>
        <input
          id="resonance-query"
          type="text"
          className="resonance-input"
          placeholder="A word, a phrase, a feeling…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>

      <div>
        <p className="small-caps mb-3">Or try one of these</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((example) => (
            <button
              key={example}
              type="button"
              className="chip"
              onClick={() => onQueryChange(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/*
        Reset link — text-style, editorial. Visible only when there's
        something to reset, so it never adds visual weight to the empty
        state (which is already a balanced layout).
      */}
      {hasQuery && (
        <div>
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="font-sans text-xs uppercase tracking-widest text-ink-muted hover:text-wine transition-colors"
          >
            ← Clear and browse
          </button>
        </div>
      )}

      {/* Status area — kept compact and unobtrusive */}
      <div className="min-h-[1.5rem] text-sm">
        {status === 'loading' && (
          <p className="text-ink-subtle italic">Listening for resonance…</p>
        )}
        {status === 'error' && (
          <p className="text-wine">{errorMessage || 'Something went wrong.'}</p>
        )}
      </div>
    </aside>
  );
}
