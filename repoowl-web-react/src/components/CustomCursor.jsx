import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [flap, setFlap] = useState(false);

  useEffect(() => {
    let flapInterval = setInterval(() => {
      setFlap(f => !f);
    }, 200);

    const onMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      clearInterval(flapInterval);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // Determine look direction (looking at the center of the screen)
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = cx - pos.x;
  const dy = cy - pos.y;
  
  // If dx > 0, center is to the right of the mouse, so look right
  const pxOffset = dx > 0 ? 1 : 0;
  const pyOffset = dy > 0 ? 1 : 0;

  // The 8x6 matrix
  // 0=empty, 1=orange, 2=white, 4=beak
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

  const px = 3; // Pixel size scale
  const w = 6 * px;
  const h = 8 * px;

  const getColor = (val) => {
    if (val === 1) return '#FF5722';
    if (val === 2) return '#FFFFFF';
    if (val === 4) return '#FFAB40';
    return 'transparent';
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: `translate(-${w / 2}px, -${h / 2}px)`,
      }}
    >
      <svg width={w + 2 * px} height={h} style={{ overflow: 'visible' }}>
        {/* We shift everything by +px in X to leave room for the left wing */}
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
          
          {/* Pupils */}
          <rect x={(1 + pxOffset) * px} y={(2 + pyOffset) * px} width={px} height={px} fill="#000000" />
          <rect x={(4 + pxOffset) * px} y={(2 + pyOffset) * px} width={px} height={px} fill="#000000" />

          {/* Wings */}
          {flap ? (
            // Wings up
            <>
              <rect x={-1 * px} y={3 * px} width={px} height={2 * px} fill="#FF5722" />
              <rect x={6 * px} y={3 * px} width={px} height={2 * px} fill="#FF5722" />
            </>
          ) : (
            // Wings down
            <>
              <rect x={-1 * px} y={5 * px} width={px} height={2 * px} fill="#FF5722" />
              <rect x={6 * px} y={5 * px} width={px} height={2 * px} fill="#FF5722" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
