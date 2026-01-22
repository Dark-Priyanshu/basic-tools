"use client";

import dynamic from "next/dynamic";

const HashGeneratorClient = dynamic(() => import("./HashGeneratorClient"), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
    </div>
  ),
});

export default function HashGeneratorPage() {
  return <HashGeneratorClient />;
}
