import React, { useState } from 'react';
import ChatPanel from './ChatPanel';
import StatsPanel from './StatsPanel';
import GoalsPanel from './GoalsPanel';

const TABS = [
  { id: 'chat',  label: 'Chat IA' },
  { id: 'stats', label: 'Estadísticas' },
  { id: 'goals', label: 'Objetivos' },
];

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div style={{
      background: '#fff',
      borderLeft: '0.5px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '0.5px solid var(--border-light)',
        padding: '0 4px',
        flexShrink: 0,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '13px 8px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--hey-orange)' : 'transparent'}`,
              color: activeTab === tab.id ? 'var(--hey-orange)' : 'var(--text-secondary)',
              fontSize: 12.5,
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'var(--transition)',
              letterSpacing: '0.2px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'chat'  && <ChatPanel />}
        {activeTab === 'stats' && <StatsPanel />}
        {activeTab === 'goals' && <GoalsPanel />}
      </div>
    </div>
  );
}