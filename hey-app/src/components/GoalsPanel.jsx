import React, { useState } from 'react';
import { GOALS } from '../data/mockData';

function GoalBar({ goal }) {
  const pct = Math.round((goal.current / goal.target) * 100);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 16 }}>{goal.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{goal.name}</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          ${goal.current.toLocaleString('es-MX')} / ${goal.target.toLocaleString('es-MX')}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: goal.color,
          borderRadius: 3,
          transition: 'width 1s ease',
        }} />
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-tertiary)' }}>
        {pct}% — {pct >= 90 ? '¡casi lista!' : pct >= 50 ? 'a mitad de camino' : 'en progreso'}
      </div>
    </div>
  );
}

export default function GoalsPanel() {
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '' });

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary)', marginBottom: 16 }}>
        Mis objetivos de ahorro
      </div>

      {GOALS.map(g => <GoalBar key={g.id} goal={g} />)}

      {showForm && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '0.5px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          marginBottom: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <input
            value={newGoal.name}
            onChange={e => setNewGoal(p => ({ ...p, name: e.target.value }))}
            placeholder="Nombre del objetivo..."
            style={{
              padding: '8px 12px', borderRadius: 8,
              border: '0.5px solid var(--border-medium)',
              background: '#fff', fontSize: 13, color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <input
            type="number"
            value={newGoal.target}
            onChange={e => setNewGoal(p => ({ ...p, target: e.target.value }))}
            placeholder="Meta en MXN..."
            style={{
              padding: '8px 12px', borderRadius: 8,
              border: '0.5px solid var(--border-medium)',
              background: '#fff', fontSize: 13, color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setShowForm(false)}
              style={{
                flex: 1, padding: '7px', borderRadius: 8,
                border: '0.5px solid var(--border-medium)',
                background: '#fff', color: 'var(--text-secondary)',
                fontSize: 12, cursor: 'pointer',
              }}
            >Cancelar</button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                flex: 1, padding: '7px', borderRadius: 8,
                border: 'none',
                background: 'var(--hey-orange)', color: '#fff',
                fontSize: 12, cursor: 'pointer', fontWeight: 500,
              }}
            >Guardar</button>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowForm(true)}
        style={{
          width: '100%', padding: 10,
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border-medium)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          fontSize: 13, cursor: 'pointer',
          transition: 'var(--transition)',
          marginTop: 4,
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--hey-orange)', e.currentTarget.style.color = 'var(--hey-orange)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-medium)', e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        + Agregar nuevo objetivo
      </button>
    </div>
  );
}
