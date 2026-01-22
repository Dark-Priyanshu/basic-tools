"use client";

import dynamic from "next/dynamic";

const UuidGeneratorClient = dynamic(() => import("./UuidGeneratorClient"), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
    </div>
  ),
});

export default function UuidGeneratorPage() {
  return <UuidGeneratorClient />;
}
