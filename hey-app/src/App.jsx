import React, { useState } from 'react';
import Header from './components/Header';
import SuggestionsCarousel from './components/SuggestionsCarousel';
import QuickStats from './components/QuickStats';
import RightPanel from './components/RightPanel';

export default function App() {
  const [activeNav, setActiveNav] = useState('Inicio');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header activeNav={activeNav} setActiveNav={setActiveNav} />

      <main style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: 0,
        maxHeight: 'calc(100vh - 57px)',
        overflow: 'hidden',
      }}>
        {/* Left panel */}
        <div style={{
          padding: '28px 28px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {/* Welcome row */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              marginBottom: 4,
            }}>
              ¡Buen día, Sofía! 👋
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Esto es lo que tengo para ti hoy — todo basado en tu historial financiero.
            </p>
          </div>

          <SuggestionsCarousel />
          <QuickStats />
        </div>

        {/* Right panel */}
        <RightPanel />
      </main>
    </div>
  );
}
