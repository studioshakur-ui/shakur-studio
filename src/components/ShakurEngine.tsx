/**
 * The Shakur Engine — cinematic typographic reveal.
 *
 * A brushed-graphite plate. A single horizontal silver/ice-blue energy line.
 * Three layers cycle in sequence — WEB → AI → AUTOMATION — and then
 * resolve into one word: SYSTEM. A subtle SHAKUR seal closes the loop.
 *
 * Pure CSS + SVG, no 3D libraries, no particles, no schema diagram.
 * Honors prefers-reduced-motion (resolves to the final SYSTEM + SHAKUR
 * state with no animation).
 */
import { memo } from 'react';

interface ShakurEngineProps {
  ariaLabel: string;
}

function ShakurEngineImpl({ ariaLabel }: ShakurEngineProps) {
  return (
    <div className="engine" role="img" aria-label={ariaLabel}>
      <div className="engine__plate">
        {/* Brushed-metal grain (very faint horizontal striations). */}
        <span className="engine__grain" aria-hidden="true" />

        {/* Specular highlight that drifts across the plate. */}
        <span className="engine__sheen" aria-hidden="true" />

        {/* Abstract logic fragments — faint horizontal data bands, never readable. */}
        <svg
          className="engine__logic"
          viewBox="0 0 1200 360"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="logicFade" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"  stopColor="currentColor" stopOpacity="0" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.4" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[40, 90, 140, 200, 260, 310].map((y, i) => (
            <g key={i} stroke="url(#logicFade)" strokeWidth="1" fill="none">
              <line x1="60"  y1={y} x2={340 + (i * 17)} y2={y} />
              <line x1={420 + (i * 13)} y1={y} x2={780 + (i * 21)} y2={y} />
              <line x1={860 + (i * 9)}  y1={y} x2="1180" y2={y} />
            </g>
          ))}
        </svg>

        {/* Horizontal energy line — the engine's main rail. */}
        <span className="engine__rail" aria-hidden="true">
          <span className="engine__rail-pulse" aria-hidden="true" />
        </span>

        {/* Kinetic typography stage. Words cycle in/out at the same position;
            SYSTEM resolves the cycle; the SHAKUR seal closes the loop. */}
        <div className="engine__stage" aria-hidden="true">
          <span className="engine__word engine__word--web">WEB</span>
          <span className="engine__word engine__word--ai">AI</span>
          <span className="engine__word engine__word--auto">AUTOMATION</span>
          <span className="engine__word engine__word--system">SYSTEM</span>
          <span className="engine__seal">SHAKUR · STUDIO</span>
        </div>
      </div>
    </div>
  );
}

export const ShakurEngine = memo(ShakurEngineImpl);
