import React, { useEffect, useRef, useState } from 'react';

/**
 * AsciiDonut — JavaScript port of the classic spinning donut algorithm.
 * Used as the faint animated background in the CTA "Get started in 2 clicks" section.
 * Ported directly from Flutter _AsciiDonutState in main.dart.
 */
export default function AsciiDonut({ opacity = 0.15 }) {
  const [frame, setFrame] = useState('');
  const A = useRef(0);
  const B = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      A.current += 0.04;
      B.current += 0.02;

      const z = new Float64Array(1760);
      const b = new Array(1760).fill(' ');

      const sinA = Math.sin(A.current), cosA = Math.cos(A.current);
      const sinB = Math.sin(B.current), cosB = Math.cos(B.current);

      for (let j = 0; j < 6.28; j += 0.07) {
        const ct = Math.cos(j), st = Math.sin(j);
        for (let i = 0; i < 6.28; i += 0.02) {
          const sp = Math.sin(i), cp = Math.cos(i);
          const h = ct + 2;
          const D = 1 / (sp * h * sinA + st * cosA + 5);
          const t = sp * h * cosA - st * sinA;

          const x = Math.floor(40 + 30 * D * (cp * h * cosB - t * sinB));
          const y = Math.floor(12 + 15 * D * (cp * h * sinB + t * cosB));
          const o = x + 80 * y;
          const N = Math.floor(
            8 *
              ((st * sinA - sp * ct * cosA) * cosB -
                sp * ct * sinA -
                st * cosA -
                cp * ct * sinB)
          );

          if (y > 0 && y < 22 && x > 0 && x < 80 && D > z[o]) {
            z[o] = D;
            b[o] = '.,-~:;=!*#$@'[Math.max(N, 0)] || '.';
          }
        }
      }

      let result = '';
      for (let k = 0; k < 1760; k++) {
        result += k % 80 !== 0 ? b[k] : '\n';
      }
      setFrame(result);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <pre
      aria-hidden="true"
      style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '10px',
        lineHeight: '1.1',
        letterSpacing: '1.2px',
        color: '#8B949E',
        opacity,
        margin: 0,
        padding: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'pre',
      }}
    >
      {frame}
    </pre>
  );
}
