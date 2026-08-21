import React, { useEffect, useState } from 'react';
import './SplashScreen.css'; // We will extract the CSS here

export default function SplashScreen({ onDone }) {
  const [stepClass, setStepClass] = useState('');
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const steps = [
      { time: 50,   cls: 'step-0' },
      { time: 900,  cls: 'step-1 step-0' },
      { time: 2600, cls: 'step-2 step-1 step-0' },
      { time: 3200, cls: 'step-3 step-2 step-1 step-0' },
      { time: 3800, cls: 'step-4 step-3 step-2 step-1 step-0' },
      { time: 4500, cls: 'step-5 step-4 step-3 step-2 step-1 step-0' },
      { time: 5100, cls: 'step-6 step-5 step-4 step-3 step-2 step-1 step-0' },
      { time: 5600, cls: 'step-7 step-6 step-5 step-4 step-3 step-2 step-1 step-0' }
    ];

    steps.forEach((s) => {
      setTimeout(() => {
        if (mounted) setStepClass(s.cls);
      }, s.time);
    });

    setTimeout(() => {
      if (mounted) {
        onDone();
      }
    }, 6600);

    return () => { mounted = false; };
  }, [onDone]);

  return (
    <div id="owl-loader" className={`${stepClass} ${exiting ? 'exit' : ''}`}>
      <div id="anim-stage">
        <div className="ripple r1"></div>
        <div className="ripple r2"></div>
        <div className="ripple r3"></div>

        <svg id="owl-svg" viewBox="0 0 500 500" width="240" height="240"
             xmlns="http://www.w3.org/2000/svg"
             style={{ overflow: 'visible', willChange: 'transform', transform: 'translateZ(0)' }}>
          <defs>
            <filter id="glow-yellow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-red" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="10" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <g className="orbit-group hide-on-final">
            <g className="sym-target-wrap" transform="translate(250,100)">
              <g className="orb-sym">
                <rect className="sym-target-bg tr-op" x="-55" y="-27" width="110" height="54" rx="10" fill="rgba(218,54,51,0.15)" stroke="rgba(218,54,51,0.6)" strokeWidth="2" filter="url(#glow-red)" />
                <text className="sym-fade sym-target-text tr-op" fontFamily="JetBrains Mono,monospace" fontSize="36" fill="rgba(47,129,247,0.75)" textAnchor="middle" dominantBaseline="central">&lt;/&gt;</text>
              </g>
            </g>

            <g transform="translate(391,141)">
              <g className="orb-sym"><text className="sym-fade sym-other tr-op" fontFamily="JetBrains Mono,monospace" fontSize="36" fill="rgba(59,185,80,0.7)" textAnchor="middle" dominantBaseline="central">{'{}'}</text></g>
            </g>
            <g transform="translate(450,300)">
              <g className="orb-sym"><text className="sym-fade sym-other tr-op" fontFamily="JetBrains Mono,monospace" fontSize="32" fill="rgba(139,92,246,0.7)" textAnchor="middle" dominantBaseline="central">()</text></g>
            </g>
            <g transform="translate(391,459)">
              <g className="orb-sym"><text className="sym-fade sym-other tr-op" fontFamily="JetBrains Mono,monospace" fontSize="32" fill="rgba(210,153,34,0.7)" textAnchor="middle" dominantBaseline="central">[]</text></g>
            </g>
            <g transform="translate(250,500)">
              <g className="orb-sym"><text className="sym-fade sym-other tr-op" fontFamily="JetBrains Mono,monospace" fontSize="30" fill="rgba(218,54,51,0.7)" textAnchor="middle" dominantBaseline="central">=&gt;</text></g>
            </g>
            <g transform="translate(109,459)">
              <g className="orb-sym"><text className="sym-fade sym-other tr-op" fontFamily="JetBrains Mono,monospace" fontSize="30" fill="rgba(47,129,247,0.65)" textAnchor="middle" dominantBaseline="central">/*</text></g>
            </g>
            <g transform="translate(50,300)">
              <g className="orb-sym"><text className="sym-fade sym-other tr-op" fontFamily="JetBrains Mono,monospace" fontSize="32" fill="rgba(59,185,80,0.65)" textAnchor="middle" dominantBaseline="central">##</text></g>
            </g>
            <g transform="translate(109,141)">
              <g className="orb-sym"><text className="sym-fade sym-other tr-op" fontFamily="JetBrains Mono,monospace" fontSize="32" fill="rgba(255,87,34,0.65)" textAnchor="middle" dominantBaseline="central">$$</text></g>
            </g>
          </g>

          <path className="owl-wings tr-op hide-on-final"
            d="M 60 280 L 70 110 L 210 200 L 250 230 L 290 200 L 430 110 L 440 280"
            fill="none" stroke="#000000" strokeWidth="32"
            strokeLinecap="round" strokeLinejoin="round" />

          <circle className="eye-circle tr-op hide-on-final" cx="150" cy="300" r="90" fill="#ffffff" stroke="#000000" strokeWidth="32" />
          <circle className="eye-circle tr-op hide-on-final" cx="350" cy="300" r="90" fill="#ffffff" stroke="#000000" strokeWidth="32" />
          
          <circle className="eye-orange tr-op hide-on-final" cx="150" cy="300" r="90" fill="rgba(255,87,34,0.15)" />
          <circle className="eye-orange tr-op hide-on-final" cx="350" cy="300" r="90" fill="rgba(255,87,34,0.15)" />

          <g className="pupils tr-op hide-on-final">
            <circle className="pupil-white tr-op" cx="150" cy="300" r="30" fill="#000000" />
            <circle className="pupil-white tr-op" cx="350" cy="300" r="30" fill="#000000" />
            
            <circle className="pupil-yellow tr-op" cx="150" cy="300" r="30" fill="#facc15" filter="url(#glow-yellow)" />
            <circle className="pupil-yellow tr-op" cx="350" cy="300" r="30" fill="#facc15" filter="url(#glow-yellow)" />
          </g>

          <line className="brow-L tr-op hide-on-final" x1="90" y1="195" x2="185" y2="225" stroke="#000000" strokeWidth="18" strokeLinecap="round" />
          <line className="brow-R tr-op hide-on-final" x1="410" y1="195" x2="315" y2="225" stroke="#000000" strokeWidth="18" strokeLinecap="round" />

          <path className="code-eye tr-op hide-on-final" d="M 170 255 L 120 300 L 170 345" fill="none" stroke="#000000" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
          <path className="code-eye tr-op hide-on-final" d="M 330 255 L 380 300 L 330 345" fill="none" stroke="#000000" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />

          <path className="beak-normal tr-op hide-on-final" d="M 240 330 L 260 330 L 250 345 Z" fill="#000000" />
          <line className="mouth-angry tr-op hide-on-final" x1="210" y1="370" x2="290" y2="370" stroke="#000000" strokeWidth="20" strokeLinecap="round" />
          <path className="beak-final tr-op hide-on-final" d="M 215 320 L 285 320 L 250 385 Z" fill="#000000" stroke="#000000" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />

          <line className="owl-foot tr-op hide-on-final" x1="275" y1="415" x2="225" y2="465" stroke="#000000" strokeWidth="32" strokeLinecap="round" />

          <g className="owl-final tr-op">
            <g stroke="#000000" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 60 280 L 70 110 L 210 200 L 250 230 L 290 200 L 430 110 L 440 280" fill="none" strokeWidth="32"/>
              <circle cx="150" cy="300" r="90" fill="#ffffff" strokeWidth="32"/>
              <circle cx="350" cy="300" r="90" fill="#ffffff" strokeWidth="32"/>
              <path d="M 170 255 L 120 300 L 170 345" fill="none" strokeWidth="32"/>
              <path d="M 330 255 L 380 300 L 330 345" fill="none" strokeWidth="32"/>
              <path d="M 215 320 L 285 320 L 250 385 Z" fill="#000000" strokeWidth="16"/>
              <line x1="275" y1="415" x2="225" y2="465" strokeWidth="32"/>
            </g>
          </g>
        </svg>
      </div>
      <div className="owl-brand">RepoOwl</div>
      <div className="owl-sub">AI-Powered GitHub Issue Triage</div>
      <div className="owl-bar-wrap">
        <div className="owl-bar-fill"></div>
      </div>
    </div>
  );
}
