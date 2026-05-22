/**
 * The Shakur Engine — premium metallic intelligence core.
 *
 * Three layered modules (WEB / AI / AUTOMATION) converge through pulsing
 * ice-blue wires into a single SYSTEM plate on the right.
 *
 * Pure CSS + SVG. No 3D libraries, no particles. Honors prefers-reduced-motion.
 */
import { memo } from 'react';

interface ShakurEngineProps {
  ariaLabel: string;
}

function ShakurEngineImpl({ ariaLabel }: ShakurEngineProps) {
  // The wires connect module right-edges (x≈195, y={80,180,280}) to the
  // SYSTEM plate left-edge (x≈900, y=180). Three smooth bézier paths.
  return (
    <div className="engine" role="img" aria-label={ariaLabel}>
      <div className="engine__bay">
        {/* Background: blurred abstract logic strokes (decorative). */}
        <svg
          className="engine__logic"
          viewBox="0 0 1200 360"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="engineLogic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 9 }).map((_, i) => (
            <path
              key={i}
              d={`M -60 ${30 + i * 38} L 1260 ${110 + i * 24}`}
              stroke="url(#engineLogic)"
              strokeWidth="1"
              fill="none"
            />
          ))}
        </svg>

        {/* Wires + pulses */}
        <svg
          className="engine__wires"
          viewBox="0 0 1200 360"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Static base wires */}
          <path className="engine__wire" d="M 195 80 C 460 80, 460 180, 900 180" />
          <path className="engine__wire" d="M 195 180 L 900 180" />
          <path className="engine__wire" d="M 195 280 C 460 280, 460 180, 900 180" />

          {/* Animated pulses tracing the same paths */}
          <path className="engine__pulse engine__pulse--web"  d="M 195 80 C 460 80, 460 180, 900 180" />
          <path className="engine__pulse engine__pulse--ai"   d="M 195 180 L 900 180" />
          <path className="engine__pulse engine__pulse--auto" d="M 195 280 C 460 280, 460 180, 900 180" />
        </svg>

        {/* Layered modules — left side */}
        <span className="engine__module engine__module--web"  aria-hidden="true">WEB</span>
        <span className="engine__module engine__module--ai"   aria-hidden="true">AI</span>
        <span className="engine__module engine__module--auto" aria-hidden="true">AUTOMATION</span>

        {/* System plate — right side */}
        <span className="engine__system" aria-hidden="true">
          <span className="engine__system-label">SYSTEM</span>
          <span className="engine__system-core" aria-hidden="true" />
        </span>

        {/* Cinematic scan reflection — slow drift across the bay */}
        <span className="engine__scan" aria-hidden="true" />
      </div>
    </div>
  );
}

export const ShakurEngine = memo(ShakurEngineImpl);
