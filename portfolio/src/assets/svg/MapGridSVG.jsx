export function MapGridSVG({ className = "absolute inset-0 w-full h-full opacity-30" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg">
      <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#mapGrid)" />
    </svg>
  );
}
