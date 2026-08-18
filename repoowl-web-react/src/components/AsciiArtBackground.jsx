import React, { useEffect, useRef, useState } from 'react';

/**
 * AsciiArtBackground — React port of Flutter's AsciiArtBackground widget
 * (ascii_art_background.dart).
 *
 * Loads the raw ASCII art from /assets/ascii-art.txt, renders it inside a
 * <pre> element, and cover-scales it to fill its container — identical to the
 * Flutter HTML platform-view implementation.
 *
 * Props:
 *   color   – CSS colour string, default '#8B949E'
 *   opacity – 0–1, default 0.2
 */
export default function AsciiArtBackground({ color = '#8B949E', opacity = 0.2 }) {
  const containerRef = useRef(null);
  const preRef = useRef(null);
  const [art, setArt] = useState('');

  // Fetch the ASCII art file once
  useEffect(() => {
    fetch('/assets/ascii-art.txt')
      .then((r) => r.text())
      .then((text) => setArt(text))
      .catch(() => {
        // Fallback: simple placeholder so the container still renders
        setArt('RepoOwl');
      });
  }, []);

  // Scale-to-cover logic — matches the Flutter `applyScale` helper
  useEffect(() => {
    if (!art || !containerRef.current || !preRef.current) return;

    const applyScale = () => {
      const container = containerRef.current;
      const pre = preRef.current;
      if (!container || !pre) return;

      // Reset to read natural size
      pre.style.transform = 'none';
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const pw = pre.scrollWidth;
      const ph = pre.scrollHeight;

      if (pw > 0 && ph > 0 && cw > 0 && ch > 0) {
        const scale = Math.max(cw / pw, ch / ph);
        pre.style.transform = `scale(${scale})`;
        pre.style.transformOrigin = 'top left';
      }
    };

    applyScale();

    const ro = new ResizeObserver(applyScale);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [art]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <pre
        ref={preRef}
        style={{
          fontFamily: '"Courier New", Courier, monospace',
          whiteSpace: 'pre',
          margin: 0,
          padding: 0,
          color,
          fontSize: '11px',
          lineHeight: '12px',
          letterSpacing: '0',
          opacity,
          position: 'absolute',
          top: 0,
          left: 0,
          transformOrigin: 'top left',
          userSelect: 'none',
        }}
      >
        {art}
      </pre>
    </div>
  );
}
