import React from 'react';

const ITEMS = [
  { value: '100%', label: 'Client-Side' },
  { value: '$0', label: 'Server Costs' },
  { value: 'LLaMA 3.3', label: 'AI Engine' },
  { value: 'Apache 2.0', label: 'Open Source' },
];

export default function MetricBanner() {
  return (
    <div
      className="w-full py-9 md:py-12 px-5 md:px-12"
      style={{
        borderTop: '1px solid #30363D',
        borderBottom: '1px solid #30363D',
        background: 'linear-gradient(to right, #0D1117, #0F1318, #0D1117)',
      }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Mobile: stack */}
        <div className="flex flex-col gap-6 md:hidden items-center">
          {ITEMS.map((item) => (
            <MetricItem key={item.label} {...item} />
          ))}
        </div>

        {/* Desktop: row with dividers */}
        <div className="hidden md:flex items-center justify-evenly">
          {ITEMS.map((item, i) => (
            <React.Fragment key={item.label}>
              <MetricItem {...item} />
              {i < ITEMS.length - 1 && (
                <div className="h-10 w-px" style={{ background: '#30363D' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricItem({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-[28px] font-extrabold tracking-[-0.5px]"
        style={{ color: '#F0F6FC' }}
      >
        {value}
      </span>
      <span className="text-[13px] mt-1" style={{ color: '#8B949E' }}>
        {label}
      </span>
    </div>
  );
}
