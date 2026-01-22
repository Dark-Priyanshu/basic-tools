"use client";

import dynamic from "next/dynamic";

const QRGeneratorClient = dynamic(() => import("./QRGeneratorClient"), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
    </div>
  ),
});

export default function QRGeneratorPage() {
  return <QRGeneratorClient />;
}
