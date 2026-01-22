"use client";

import dynamic from "next/dynamic";

const ColorConverterClient = dynamic(() => import("./ColorConverterClient"), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
    </div>
  ),
});

export default function ColorConverterPage() {
  return <ColorConverterClient />;
}
