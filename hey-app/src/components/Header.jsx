import React from 'react';
import { USER } from '../data/mockData';

const styles = {
  header: {
    background: '#fff',
    borderBottom: '0.5px solid rgba(26,25,22,0.1)',
    padding: '14px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: { display: 'flex', alignItems: 'center', gap: 24 },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: 24,
    fontWeight: 800,
    color: '#D85A30',
    letterSpacing: '-0.5px',
  },
  tagline: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    fontWeight: 300,
    marginLeft: 6,
  },
  nav: { display: 'flex', gap: 4 },
  navBtn: (active) => ({
    padding: '6px 14px',
    borderRadius: 20,
    border: 'none',
    background: active ? 'var(--hey-orange-light)' : 'transparent',
    color: active ? 'var(--hey-orange)' : 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: active ? 500 : 400,
    cursor: 'pointer',
    transition: 'var(--transition)',
  }),
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  greeting: { fontSize: 13, color: 'var(--text-secondary)' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#F0997B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
    color: '#4A1B0C',
    cursor: 'pointer',
  },
  balancePill: {
    padding: '5px 14px',
    borderRadius: 20,
    background: 'var(--bg-secondary)',
    border: '0.5px solid var(--border-light)',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
};

const NAV_ITEMS = ['Inicio', 'Cuenta', 'Inversiones', 'Crédito'];

export default function Header({ activeNav, setActiveNav }) {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <div>
          <span style={styles.logo}>hey</span>
          <span style={styles.tagline}>tu banco inteligente</span>
        </div>
        <nav style={styles.nav}>
          {NAV_ITEMS.map(item => (
            <button
              key={item}
              style={styles.navBtn(activeNav === item)}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>
      <div style={styles.right}>
        <div style={styles.balancePill}>
          ${USER.balance.toLocaleString('es-MX')} MXN
        </div>
        <span style={styles.greeting}>Buen día, {USER.name}</span>
        <div style={styles.avatar}>{USER.initials}</div>
      </div>
    </header>
  );
}
