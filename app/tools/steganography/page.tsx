"use client";

import dynamic from "next/dynamic";

const SteganographyClient = dynamic(() => import("./SteganographyClient"), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
    </div>
  ),
});

export default function SteganographyPage() {
  return <SteganographyClient />;
}
