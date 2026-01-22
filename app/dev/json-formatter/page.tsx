"use client";

import dynamic from "next/dynamic";

const JsonFormatterClient = dynamic(() => import("./JsonFormatterClient"), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
    </div>
  ),
});

export default function JsonFormatterPage() {
  return <JsonFormatterClient />;
}
