import React, { useEffect, useRef, useState } from 'react';

// Translates the Flutter OrbitWarsBackground
// Renders a static grid of faint blue lines and dots
export default function OrbitBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawGrid = () => {
      const g = 40; // gridStep
      const w = canvas.width;
      const h = canvas.height;

      // Lines
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(47, 129, 247, 0.065)'; // #2F81F7
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
      ctx.fillStyle = 'rgba(47, 129, 247, 0.2)';
      for (let x = 0; x <= w; x += g) {
        for (let y = 0; y <= h; y += g) {
          ctx.beginPath();
          ctx.arc(x, y, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Holographic scan-line shimmer (linear gradient from top to bottom)
      t += 0.005;
      const scanY = (Math.sin(t) * 0.5 + 0.5) * h;
      
      const grad = ctx.createLinearGradient(0, scanY - 100, 0, scanY + 100);
      grad.addColorStop(0, 'rgba(47, 129, 247, 0.0)');
      grad.addColorStop(0.5, 'rgba(47, 129, 247, 0.04)');
      grad.addColorStop(1, 'rgba(47, 129, 247, 0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    };

    const draw = (ts) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
