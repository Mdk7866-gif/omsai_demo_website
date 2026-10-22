import type { ReactNode } from "react";
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    trash: (
      <>
        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
      </>
    ),
    archive: (
      <>
        <rect x="3" y="3" width="18" height="5" rx="1" />
        <path d="M5 8v13h14V8M9 12h6" />
      </>
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7v10H3Z" />
        <path d="M9 20v-7h6v7" />
      </>
    ),
    profile: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="M5 17a4 4 0 0 1 8 0M15 9h3M15 13h3M15 17h3" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v3" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 3C7 2 3 8 5 15c7 5 15-1 15-12Z" />
        <path d="M3 21 16 8M8 16v-5M12 12h5" />
      </>
    ),
    file: (
      <>
        <path d="M5 3h9l5 5v13H5Z M14 3v6h5M8 13h8M8 17h6" />
      </>
    ),
    truck: (
      <>
        <path d="M2 5h12v12H2ZM14 10h4l4 4v3h-8" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    wallet: (
      <>
        <path d="M4 7V4h14v3M3 7h18v14H3ZM16 12h5v5h-5Z" />
        <path d="M17 14.5h1" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V13M10 20V8M16 20V3M22 20H2" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    bell: (
      <>
        <path d="M5 17h14l-2-4V8a5 5 0 0 0-10 0v5ZM10 21h4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 2v6M17 2v6M3 11h18" />
      </>
    ),
    reset: (
      <>
        <path d="M3 10a9 9 0 1 1 2 8M3 3v7h7" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.leaf}
    </svg>
  );
}
export function Lotus({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 170"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <path d="M100 145C53 111 71 54 100 12c29 42 47 99 0 133Z" />
      <path d="M100 145C38 133 19 79 22 43c49 11 84 50 78 102ZM100 145c62-12 81-66 78-102-49 11-84 50-78 102Z" />
      <path d="M100 145C52 155 16 131 3 96c45-7 77 9 97 49ZM100 145c48 10 84-14 97-49-45-7-77 9-97 49Z" />
      <path d="M100 145C66 116 52 81 53 28c40 27 51 69 47 117ZM100 145c34-29 48-64 47-117-40 27-51 69-47 117Z" />
      <path d="M12 156h176M43 164h114" />
      <circle cx="100" cy="156" r="4" />
    </svg>
  );
}
