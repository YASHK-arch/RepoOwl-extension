import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import SplashScreen from './components/SplashScreen';
import HeroSection from './components/HeroSection';
import MetricBanner from './components/MetricBanner';
import BentoSection from './components/BentoSection';
import CtaFooter from './components/CtaFooter';
import OrbitBackground from './components/OrbitBackground';
import CustomCursor from './components/CustomCursor';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      <CustomCursor />
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <div
        className={`min-h-screen relative overflow-x-hidden transition-opacity duration-700 ${
          splashDone ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: '#0D1117' }}
      >
        <NavBar />
        <main className="flex flex-col items-center w-full">
          <div className="w-full relative flex justify-center">
            <OrbitBackground />
            <div className="pt-16 w-full max-w-[1200px] px-5 md:px-12">
              <HeroSection />
            </div>
          </div>
          <MetricBanner />
          <BentoSection />
          <CtaFooter />
        </main>
      </div>
    </>
  );
}
