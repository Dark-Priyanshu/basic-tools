"use client";

import dynamic from "next/dynamic";

const UrlConverterClient = dynamic(() => import("./UrlConverterClient"), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
    </div>
  ),
});

export default function UrlConverterPage() {
  return <UrlConverterClient />;
}
