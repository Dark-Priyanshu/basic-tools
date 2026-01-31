"use client";

import dynamic from "next/dynamic";

const SocialToolsClient = dynamic(() => import('./SocialToolsClient'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
    </div>
  ),
});

export default function SocialToolsPage() {
  return <SocialToolsClient />;
}
