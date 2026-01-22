"use client";

import dynamic from "next/dynamic";

const UrlShortenerClient = dynamic(() => import("./UrlShortenerClient"), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
    </div>
  ),
});

export default function UrlShortenerPage() {
  return <UrlShortenerClient />;
}
