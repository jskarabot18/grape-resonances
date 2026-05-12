/**
 * VerificationPrompt
 *
 * "Does this resonate?" with three options. Per the locked Planning Doc
 * decision (open question 4, closed): the prompt records nothing anywhere.
 * Privacy-first per Vinotheca's existing ethos. The act of clicking is its
 * own moment.
 *
 * After a click we acknowledge with a brief, quiet response — the framework
 * sees the click; the user sees a small change of state; nothing is logged
 * server-side. We do hold the choice in local component state so the user
 * can see *which* one they picked (light affordance, not a record).
 */

import { useState } from 'react';

const OPTIONS = [
  { value: 'yes',        label: 'yes' },
  { value: 'partially',  label: 'partially' },
  { value: 'no',         label: 'no' },
];

const ACKNOWLEDGEMENTS = {
  yes:        'Held.',
  partially:  'Held — partially.',
  no:         'Held; the framework is one reading among many.',
};

export default function VerificationPrompt() {
  const [chosen, setChosen] = useState(null);

  return (
    <div>
      <p className="text-sm font-sans uppercase tracking-widest text-ink-muted">
        Does this resonate?
      </p>
      <div className="mt-3 flex items-center gap-2">
        {OPTIONS.map((opt) => {
          const isChosen = chosen === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setChosen(opt.value)}
              aria-pressed={isChosen}
              className={[
                'px-4 py-1.5 text-sm font-serif italic rounded-full transition-colors',
                'border',
                isChosen
                  ? 'bg-wine text-parchment border-wine'
                  : 'bg-parchment-raised text-ink-muted border-parchment-edge hover:text-wine hover:border-wine',
              ].join(' ')}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {chosen && (
        <p className="mt-3 text-sm font-serif italic text-ink-subtle">
          {ACKNOWLEDGEMENTS[chosen]}
        </p>
      )}
    </div>
  );
}
