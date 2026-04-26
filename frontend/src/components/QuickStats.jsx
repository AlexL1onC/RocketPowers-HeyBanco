import React, { useEffect, useState } from 'react';
import { fetchUserStats } from '../api';

import { USER_ID } from '../config';

const skeletonStyle = {
  background: 'var(--bg-secondary)',
  borderRadius: 'var(--radius-md)',
  padding: '14px 16px',
  textAlign: 'center',
  animation: 'pulse 1.5s ease infinite',
};

export default function QuickStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats(USER_ID)
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        marginTop: 20,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={skeletonStyle}>
            <div style={{ height: 11, background: '#E8E5DF', borderRadius: 4, marginBottom: 8, width: '60%', margin: '0 auto 8px' }} />
            <div style={{ height: 20, background: '#E8E5DF', borderRadius: 4, marginBottom: 6, width: '80%', margin: '0 auto' }} />
            <div style={{ height: 11, background: '#E8E5DF', borderRadius: 4, width: '50%', margin: '6px auto 0' }} />
          </div>
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    );
  }

  const items = [
    {
      label: 'Saldo total',
      value: `$${stats.balance.toLocaleString('es-MX')}`,
      delta: stats.balanceDelta,
      positive: stats.balancePositive,
    },
    {
      label: 'Gasto del mes',
      value: `$${stats.monthlySpend.toLocaleString('es-MX')}`,
      delta: stats.spendDelta,
      positive: stats.spendPositive,
    },
    {
      label: 'Inversiones',
      value: `$${stats.investments.toLocaleString('es-MX')}`,
      delta: stats.investDelta,
      positive: stats.investPositive,
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 10,
      marginTop: 20,
    }}>
      {items.map(s => (
        <div key={s.label} style={{
          background: '#fff',
          border: '0.5px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 5, fontWeight: 500, letterSpacing: '0.3px' }}>
            {s.label}
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {s.value}
          </div>
          <div style={{ fontSize: 11, marginTop: 3, color: s.positive ? '#3B6D11' : '#993C1D', fontWeight: 500 }}>
            {s.delta}
          </div>
        </div>
      ))}
    </div>
  );
}