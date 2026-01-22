"use client";

import dynamic from "next/dynamic";

const EditorClient = dynamic(() => import("./EditorClient"), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
    </div>
  ),
});

export default function ImageEditorPage() {
  return <EditorClient />;
}
