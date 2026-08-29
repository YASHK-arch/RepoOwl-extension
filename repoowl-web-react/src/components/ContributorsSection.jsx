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
    <section id="contributors" className="relative w-full overflow-hidden py-24 flex flex-col items-center justify-center" style={{ borderTop: '4px solid #000', backgroundColor: '#ffffff' }}>
      {/* Animated background */}
      <AsciiRadar
        background="transparent"
        glyphColor="rgba(0,0,0,0.15)"
        ringColor="rgba(0,0,0,0.3)"
        className="absolute inset-0"
        style={{ position: 'absolute', zIndex: 0 }}
      />

      {/* Content wrapper */}
      <div
        className="relative z-10 flex flex-col items-center text-center pointer-events-auto w-full"
        style={{ maxWidth: '640px', padding: '2.5rem 3rem' }}
      >

        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black mb-4">
          Backed by <span className="bg-[#BD10E0] text-white px-2 py-1 shadow-[4px_4px_0px_#000]">Open Source</span>
        </h2>
        <p className="font-bold text-black max-w-2xl mx-auto mb-10">
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
                borderRadius: '0',
                border: '3px solid #000',
                overflow: 'hidden',
                width: '60px',
                height: '60px',
                boxShadow: '4px 4px 0px #000',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-4px, -4px)';
                e.currentTarget.style.boxShadow = '8px 8px 0px #000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0px, 0px)';
                e.currentTarget.style.boxShadow = '4px 4px 0px #000';
              }}
            >
              <img
                src={`${c.avatar_url}&s=200`}
                alt={`@${c.login}`}
                width={60}
                height={60}
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
                  width: '60px',
                  height: '60px',
                  borderRadius: '0',
                  border: '3px solid #000',
                  background: '#F8E71C',
                  boxShadow: '4px 4px 0px #000',
                }}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
