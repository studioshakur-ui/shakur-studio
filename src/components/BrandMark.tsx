import { useId } from 'react';

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 28, className }: BrandMarkProps) {
  const id = useId();
  const gradientId = `petaw-cauri-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="PETAW"
    >
      <defs>
        <linearGradient id={gradientId} x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9D9B8" />
          <stop offset="0.52" stopColor="#C89B3C" />
          <stop offset="1" stopColor="#8E6528" />
        </linearGradient>
      </defs>
      <path
        d="M32 7c9.8 0 18 10.9 18 25S41.8 57 32 57 14 46.1 14 32 22.2 7 32 7Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M32 13c5.7 4.7 8.7 11.2 8.7 19S37.7 46.3 32 51c-5.7-4.7-8.7-11.2-8.7-19S26.3 17.7 32 13Z"
        fill="#0B0A09"
        opacity="0.64"
      />
      <path
        d="M32 16v32M27.3 21.8l4.7 3.1 4.7-3.1M27.3 29.2l4.7 3.1 4.7-3.1M27.3 36.6l4.7 3.1 4.7-3.1M27.3 44l4.7 3.1 4.7-3.1"
        stroke="#F3E8D1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.78"
      />
    </svg>
  );
}

