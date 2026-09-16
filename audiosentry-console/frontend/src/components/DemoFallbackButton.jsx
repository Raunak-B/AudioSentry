import React from 'react';

export default function DemoFallbackButton({ onActivate }) {
  return (
    <button className="fallback-btn neo-raised px-4 py-2 rounded-lg whitespace-nowrap" onClick={onActivate}>
      Switch to Offline Demo Clip
    </button>
  );
}
