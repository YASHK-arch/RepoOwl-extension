import React, { useState, useEffect, useRef } from 'react';
import p5 from 'p5';
import TRUNK from 'vanta/dist/vanta.trunk.min';

export default function VantaTrunkBackground({ style }) {
  const [vantaEffect, setVantaEffect] = useState(null);
  const myRef = useRef(null);

  useEffect(() => {
    // Vanta.js Trunk effect requires p5 to be globally available
    if (typeof window !== 'undefined' && !window.p5) {
      window.p5 = p5;
    }

    if (!vantaEffect) {
      setVantaEffect(
        TRUNK({
          el: myRef.current,
          p5: p5,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x98465f,
          backgroundColor: 0x222426,
          spacing: 9.50,
          chaos: 4.00,
        })
      );
    }
    
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div 
      ref={myRef} 
      className="absolute inset-0 z-0 pointer-events-auto" 
      style={style}
    />
  );
}
