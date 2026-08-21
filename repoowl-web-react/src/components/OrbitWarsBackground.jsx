import React, { useEffect, useRef, useState } from 'react';
// Use Vite's worker import syntax
import OrbitWarsWorker from '../workers/orbitWarsWorker?worker';

const COLORS = {
  sun: '#D29922', // Yellow
};

const MONOTONE = 'rgba(26,26,26,0.4)';
const PILL_BG = 'rgba(240, 237, 232, 0.9)';
const CHARS = {
  0: '/',
  1: '+',
  2: 'O',
  3: '#',
  neutral: '-'
};

export default function OrbitWarsBackground() {
  const canvasRef = useRef(null);
  const workerRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize worker
    workerRef.current = new OrbitWarsWorker();
    
    // Handle state updates from worker
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'STATE_UPDATE') {
        stateRef.current = e.data.payload;
      }
    };

    // Start worker
    workerRef.current.postMessage({ type: 'START' });

    // Handle visibility changes to pause worker when tab is inactive
    const handleVisibilityChange = () => {
      if (document.hidden) {
        workerRef.current.postMessage({ type: 'PAUSE' });
      } else {
        workerRef.current.postMessage({ type: 'START' });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Resize handler — multiply by devicePixelRatio for sharp HiDPI rendering
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      // Set the canvas buffer to physical pixel size
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // Reset the context scale so logical coords still work in CSS pixels
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    let t = 0;

    const drawAsciiCircle = (ctx, cx, cy, radius, char) => {
      ctx.font = '8px monospace';
      const charWidth = 6;
      const charHeight = 8;
      for (let y = -radius; y <= radius; y += charHeight) {
        for (let x = -radius; x <= radius; x += charWidth) {
          if (x * x + y * y <= radius * radius) {
            ctx.fillText(char, cx + x, cy + y);
          }
        }
      }
    };

    const drawGrid = (ctx, w, h) => {
      const g = 40; // gridStep

      // Lines
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)'; // Monotone grid lines
      ctx.beginPath();
      for (let x = 0; x <= w; x += g) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += g) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Dots
      ctx.fillStyle = 'rgba(0, 0, 0, 0.10)'; // Monotone dots
      for (let x = 0; x <= w; x += g) {
        for (let y = 0; y <= h; y += g) {
          ctx.beginPath();
          ctx.arc(x, y, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Scanline removed per user request
    };

    // Render loop
    const render = () => {
      const ctx = canvas.getContext('2d');
      // Canvas width/height are in physical pixels; logical size is /dpr
      const dpr = window.devicePixelRatio || 1;
      const logicalW = canvas.width / dpr;
      const logicalH = canvas.height / dpr;

      ctx.clearRect(0, 0, logicalW, logicalH);

      drawGrid(ctx, logicalW, logicalH);

      // Increase opacity for the game layer to make orbits more visible
      ctx.globalAlpha = 0.35;

      const state = stateRef.current;
      if (state) {
        // Use window.innerHeight so the scale is based on the viewport,
        // preventing the game from becoming massively upscaled on tall scrolling pages.
        const vh = window.innerHeight || logicalH;
        const scale = Math.max(logicalW, vh) / 1000;
        
        ctx.save();
        // Center the 1000x1000 board horizontally, and vertically relative to the viewport (vh)
        // so the sun appears in the center of the screen when scrolled to the top.
        const offsetX = (logicalW - 1000 * scale) / 2;
        const offsetY = (vh - 1000 * scale) / 2 + 100;
        
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        // Draw Sun
        if (state.sun) {
          ctx.fillStyle = MONOTONE;
          drawAsciiCircle(ctx, state.sun.x, state.sun.y, state.sun.radius, '*');
          
          // Draw dotted elliptical orbits
          ctx.beginPath();
          ctx.setLineDash([2, 6]);
          ctx.ellipse(state.sun.x, state.sun.y, 150 * 1.8, 150, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)'; // higher opacity
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(state.sun.x, state.sun.y, 280 * 1.8, 280, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw Planets
        if (state.planets) {
          state.planets.forEach(p => {
            // Draw gray outer ring dashed
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.arc(p.x, p.y, p.radius + 4, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]);

            // Dots on the ring representing genPower
            const dots = p.genPower || 1;
            for (let i = 0; i < dots; i++) {
               let angle = (p.angle || 0) + (Math.PI * 2 / dots) * i;
               ctx.beginPath();
               ctx.arc(p.x + Math.cos(angle) * (p.radius + 4), p.y + Math.sin(angle) * (p.radius + 4), 1.5, 0, Math.PI * 2);
               ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
               ctx.fill();
            }

            // Draw filled planet with ASCII
            ctx.fillStyle = MONOTONE;
            drawAsciiCircle(ctx, p.x, p.y, p.radius, p.owner !== null ? CHARS[p.owner] : CHARS['neutral']);

            // Background pill for text readability
            ctx.fillStyle = PILL_BG;
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, 11, 9, 0, 0, Math.PI * 2);
            ctx.fill();

            // Draw text (ships count)
            ctx.fillStyle = MONOTONE;
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(Math.floor(p.ships).toString(), p.x, p.y - 3);

            ctx.font = '7px monospace';
            ctx.fillText(`+${p.genPower || 1}`, p.x, p.y + 4);
          });
        }

        // Draw Fleets
        if (state.fleets) {
          state.fleets.forEach(f => {
            ctx.save();
            ctx.translate(f.x, f.y);
            const angle = Math.atan2(f.vy, f.vx);
            ctx.rotate(angle);
            
            const size = Math.max(6, Math.log10(f.ships + 1) * 4);
            
            ctx.fillStyle = MONOTONE;
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const ownerChar = f.owner !== null ? CHARS[f.owner] : CHARS['neutral'];
            let arrowStr = ownerChar + '>';
            if (size > 8) arrowStr = ownerChar + '->';
            
            ctx.fillText(arrowStr, 0, 0);
            
            ctx.restore();

            // Ship count text underneath
            ctx.fillStyle = MONOTONE;
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(Math.floor(f.ships).toString(), f.x, f.y + 12);
          });
        }

        // Draw Comet
        if (state.comet) {
            ctx.save();
            ctx.translate(state.comet.x, state.comet.y);
            const angle = Math.atan2(state.comet.vy, state.comet.vx);
            ctx.rotate(angle);
            
            ctx.fillStyle = MONOTONE;
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('@', 0, 0); // Comet head
            
            ctx.font = '10px monospace';
            for(let i=1; i<=6; i++) {
                ctx.fillText('~', -i * 8, 0); // Comet tail
            }
            ctx.restore();
        }
        
        ctx.restore();
      }

      ctx.globalAlpha = 1.0; // Reset alpha for next frame
      
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ objectFit: 'cover' }}
        aria-hidden="true"
      />
      {/* Cloud-like fade beneath the navbar */}
      <div 
        className="absolute top-0 left-0 right-0 h-48"
        style={{ background: 'linear-gradient(to bottom, rgba(240, 237, 232, 1) 0%, rgba(240, 237, 232, 0.8) 30%, transparent 100%)' }}
      />
    </div>
  );
}
