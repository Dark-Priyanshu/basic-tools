'use client';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '0.5rem', 
      marginBottom: '1.5rem',
      borderBottom: '1px solid var(--border)' 
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === tab.id ? 'var(--primary)' : 'var(--foreground)',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s',
            opacity: activeTab === tab.id ? 1 : 0.7
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
