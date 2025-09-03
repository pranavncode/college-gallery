import type { SVGProps } from 'react';

export function CampusConnectLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="150"
      height="37.5" // Adjusted height to maintain aspect ratio for 150px width
      aria-label="CampusConnect Logo"
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
      <text x="5" y="25" className="logo-text">CampusConnect</text>
    </svg>
  );
}
