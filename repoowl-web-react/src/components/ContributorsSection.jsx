import React, { useEffect, useState } from 'react';
import AsciiRadar from './AsciiRadar';

const REPO = 'YASHK-arch/RepoOwl-extension';

export default function ContributorsSection() {
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${REPO}/contributors?per_page=100`)
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        // Filter out bots
        setContributors(data.filter((c) => c.type !== 'Bot' && !c.login.includes('[bot]')));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative w-full overflow-hidden py-24 flex flex-col items-center justify-center">
      {/* Animated background */}
      <AsciiRadar
        background="transparent"
        glyphColor="rgba(26,26,26,0.25)"
        ringColor="rgba(26,26,26,0.4)"
        className="absolute inset-0"
        style={{ position: 'absolute', zIndex: 0 }}
      />

      {/* Content wrapper — cloud only covers this region */}
      <div
        className="relative z-10 flex flex-col items-center text-center pointer-events-auto w-full"
        style={{ maxWidth: '640px', padding: '2.5rem 3rem' }}
      >
        {/* Cloud blob — Layer 1: primary opaque */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-18px',
            background: '#F0EDE8',
            borderRadius: '45% 55% 60% 40% / 38% 48% 52% 62%',
            filter: 'blur(16px)',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
        {/* Cloud blob — Layer 2: softer, offset */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-28px',
            left: '-30px',
            right: '-24px',
            bottom: '-22px',
            background: 'rgba(240,237,232,0.85)',
            borderRadius: '60% 40% 35% 65% / 55% 62% 38% 45%',
            filter: 'blur(26px)',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
        {/* Cloud blob — Layer 3: outermost wispy halo */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-44px',
            left: '-48px',
            right: '-40px',
            bottom: '-38px',
            background: 'rgba(240,237,232,0.45)',
            borderRadius: '37% 63% 52% 48% / 60% 42% 58% 40%',
            filter: 'blur(38px)',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />

        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] mb-4">
          Backed by Open Source
        </h2>
        <p className="text-[#6B6A67] max-w-2xl mx-auto mb-8">
          RepoOwl is built with the help of amazing contributors from around the world.
        </p>

        {/* Avatar grid — wraps into rows, never expands container width */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
          }}
        >
          {contributors.map((c) => (
            <a
              key={c.login}
              href={c.html_url}
              target="_blank"
              rel="noopener noreferrer"
              title={`@${c.login} · ${c.contributions} contribution${c.contributions !== 1 ? 's' : ''}`}
              style={{
                display: 'block',
                flexShrink: 0,
                borderRadius: '50%',
                overflow: 'hidden',
                width: '52px',
                height: '52px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.12)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.28)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
              }}
            >
              <img
                src={`${c.avatar_url}&s=200`}
                alt={`@${c.login}`}
                width={52}
                height={52}
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            </a>
          ))}

          {/* Skeleton placeholders while loading */}
          {contributors.length === 0 &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(26,26,26,0.08)',
                  animation: 'pulse 1.4s ease-in-out infinite',
                }}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
