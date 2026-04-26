import React, { useEffect, useState } from 'react';
import { fetchUserSummary } from '../api';

const USER_ID = "USER_001";

const NAV_ITEMS = ['Inicio', 'Cuenta', 'Inversiones', 'Crédito'];

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
    color: 'var(--brand-primary)',
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
    background: active ? 'var(--brand-light)' : 'transparent',
    color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: active ? 500 : 400,
    cursor: 'pointer',
    transition: 'var(--transition)',
    fontFamily: 'var(--font-body)',
  }),
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  greeting: { fontSize: 13, color: 'var(--text-secondary)' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'var(--brand-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-inverse)',
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

export default function Header({ activeNav, setActiveNav }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUserSummary(USER_ID).then(setUserData).catch(console.error);
  }, []);

  const nombre = userData?.cliente?.ocupacion
    ? userData.cliente.ocupacion
    : '...';

  const initials = userData
    ? String(userData.user_id).slice(0, 2).toUpperCase()
    : '..';

  const balance = userData?.productos?.dinero_disponible ?? null;

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img 
            src="/assets/imgs/hey_logo.png"  /* o la ruta de tu imagen */
            alt="Hey Banco"
            style={{ height: 28, width: 'auto' }}
        />
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
          {balance !== null
            ? `$${Number(balance).toLocaleString('es-MX')} MXN`
            : '— MXN'}
        </div>
        <span style={styles.greeting}>
          Buen día{userData?.cliente ? `, ${userData.cliente.ocupacion}` : ''}
        </span>
        <div style={styles.avatar}>{initials}</div>
      </div>
    </header>
  );
}