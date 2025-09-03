
import type { SVGProps } from 'react';

export function CollegeGalleryLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 50" // Adjusted viewBox slightly for potentially wider text
      width="165" // Adjusted width slightly
      height="37.5"
      aria-label="ClgGallery Logo" // Updated aria-label
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap');
          .logo-text {
            font-family: 'Poppins', var(--font-geist-sans), sans-serif;
            font-size: 30px;
            fill: url(#logoGradient);
            dominant-baseline: central;
            text-anchor: start;
          }
        `}
      </style>
      <text x="5" y="25" className="logo-text">ClgGallery</text> {/* Corrected text */}
    </svg>
  );
}
