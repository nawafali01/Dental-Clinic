import React from 'react';

export const SparklineSvg = ({ data, isPositive }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = 32 - ((val - min) / range) * 26; // Scale into 32px height box
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = isPositive ? '#10b981' : '#f43f5e';

  return (
    <div className="w-24 h-8 shrink-0">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 32">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
};
