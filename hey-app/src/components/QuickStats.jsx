import React from 'react';
import { USER } from '../data/mockData';

const stats = [
  {
    label: 'Saldo total',
    value: `$${USER.balance.toLocaleString('es-MX')}`,
    delta: '+$340 este mes',
    positive: true,
  },
  {
    label: 'Gasto del mes',
    value: `$${USER.monthlySpend.toLocaleString('es-MX')}`,
    delta: '+12% vs anterior',
    positive: false,
  },
  {
    label: 'Inversiones',
    value: `$${USER.investments.toLocaleString('es-MX')}`,
    delta: '+11.2% anual',
    positive: true,
  },
];

export default function QuickStats() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 10,
      marginTop: 20,
    }}>
      {stats.map(s => (
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
