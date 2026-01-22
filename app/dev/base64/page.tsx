"use client";

import dynamic from "next/dynamic";

const Base64Client = dynamic(() => import("./Base64Client"), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
    </div>
  ),
});

export default function Base64Page() {
  return <Base64Client />;
}
