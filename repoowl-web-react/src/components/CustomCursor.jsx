import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const wingsUpRef = useRef(null);
  const wingsDownRef = useRef(null);
  const pupilLeftRef = useRef(null);
  const pupilRightRef = useRef(null);

  const px = 3; // Pixel size scale
  const w = 6 * px;
  const h = 8 * px;

  useEffect(() => {
    let flap = false;
    let flapInterval = setInterval(() => {
      flap = !flap;
      if (wingsUpRef.current && wingsDownRef.current) {
        wingsUpRef.current.style.display = flap ? 'block' : 'none';
        wingsDownRef.current.style.display = flap ? 'none' : 'block';
      }
    }, 200);

    const onMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - w / 2}px, ${e.clientY - h / 2}px, 0)`;
      }
      
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = cx - e.clientX;
      const dy = cy - e.clientY;
      
      const pxOffset = dx > 0 ? 1 : 0;
      const pyOffset = dy > 0 ? 1 : 0;

      if (pupilLeftRef.current && pupilRightRef.current) {
        pupilLeftRef.current.setAttribute('x', (1 + pxOffset) * px);
        pupilLeftRef.current.setAttribute('y', (2 + pyOffset) * px);
        pupilRightRef.current.setAttribute('x', (4 + pxOffset) * px);
        pupilRightRef.current.setAttribute('y', (2 + pyOffset) * px);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      clearInterval(flapInterval);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const body = [
    [0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1],
    [1, 2, 2, 1, 2, 2],
    [1, 2, 2, 1, 2, 2],
    [1, 1, 4, 4, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 1, 0, 0, 1, 0],
  ];

  const getColor = (val) => {
    if (val === 1) return '#FF5722';
    if (val === 2) return '#FFFFFF';
    if (val === 4) return '#FFAB40';
    return 'transparent';
  };

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        transform: `translate3d(-100px, -100px, 0)`,
        willChange: 'transform'
      }}
    >
      <svg width={w + 2 * px} height={h} style={{ overflow: 'visible' }}>
        <g transform={`translate(${px}, 0)`}>
          {body.map((row, y) =>
            row.map((val, x) => {
              if (val === 0) return null;
              return (
                <rect
                  key={`${x}-${y}`}
                  x={x * px}
                  y={y * px}
                  width={px}
                  height={px}
                  fill={getColor(val)}
                />
              );
            })
          )}
          
          <rect ref={pupilLeftRef} x={1 * px} y={2 * px} width={px} height={px} fill="#000000" />
          <rect ref={pupilRightRef} x={4 * px} y={2 * px} width={px} height={px} fill="#000000" />

          <g ref={wingsUpRef} style={{ display: 'none' }}>
            <rect x={-1 * px} y={3 * px} width={px} height={2 * px} fill="#FF5722" />
            <rect x={6 * px} y={3 * px} width={px} height={2 * px} fill="#FF5722" />
          </g>

          <g ref={wingsDownRef} style={{ display: 'block' }}>
            <rect x={-1 * px} y={5 * px} width={px} height={2 * px} fill="#FF5722" />
            <rect x={6 * px} y={5 * px} width={px} height={2 * px} fill="#FF5722" />
          </g>
        </g>
      </svg>
    </div>
  );
}
