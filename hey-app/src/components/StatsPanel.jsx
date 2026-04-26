import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SPENDING_CATEGORIES, SPENDING_CHART } from '../data/mockData';

const TREND_COLORS = {
  up: { bg: '#FAECE7', color: '#993C1D' },
  down: { bg: '#EAF3DE', color: '#3B6D11' },
  neutral: { bg: '#F1EFE8', color: '#5F5E5A' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff', border: '0.5px solid var(--border-light)',
        borderRadius: 10, padding: '8px 12px', fontSize: 12,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          ${payload[0].value.toLocaleString('es-MX')}
        </div>
      </div>
    );
  }
  return null;
};

export default function StatsPanel() {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', flex: 1 }}>
      {/* Bar Chart */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary)', marginBottom: 12 }}>
          Gasto mensual
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={SPENDING_CHART} barSize={22}>
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#A09D96' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F3EE' }} />
            <Bar dataKey="gasto" radius={[5, 5, 0, 0]}>
              {SPENDING_CHART.map((entry, i) => (
                <Cell
                  key={i}
                  fill={i === SPENDING_CHART.length - 1 ? '#D85A30' : '#E8E5DF'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Categories */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary)', marginBottom: 10 }}>
          Por categoría
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SPENDING_CATEGORIES.map((cat, i) => {
            const tc = TREND_COLORS[cat.trend];
            return (
              <div key={cat.name} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderBottom: i < SPENDING_CATEGORIES.length - 1 ? '0.5px solid var(--border-light)' : 'none',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: tc.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, flexShrink: 0,
                }}>{cat.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: tc.color, marginTop: 1 }}>{cat.sub}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  ${cat.amount.toLocaleString('es-MX')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
