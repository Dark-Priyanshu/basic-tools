"use client";

import dynamic from "next/dynamic";

const CropResizeClient = dynamic(() => import("./CropResizeClient"), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
    </div>
  ),
});

export default function CropResizePage() {
  return <CropResizeClient />;
}
