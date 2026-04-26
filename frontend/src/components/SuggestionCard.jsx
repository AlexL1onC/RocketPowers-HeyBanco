import React, { useMemo } from 'react';

const TAG_STYLES = {
  green:  { bg: 'rgba(234,243,222,0.85)', color: '#3B6D11' },
  coral:  { bg: 'rgba(250,236,231,0.85)', color: '#993C1D' },
  blue:   { bg: 'rgba(230,241,251,0.85)', color: '#185FA5' },
  amber:  { bg: 'rgba(250,238,218,0.85)', color: '#854F0B' },
  dark:   { bg: 'rgba(50,50,50,0.10)',    color: '#323232' },
  pink:   { bg: 'rgba(251,187,211,0.35)', color: '#8B2252' },
};

// Mapea tipo del backend → metadatos visuales
const TIPO_META = {
  inversion: { tagColor: 'green',  tag: 'Inversión',  emoji: '📈' },
  ahorro:    { tagColor: 'green',  tag: 'Ahorro',     emoji: '🪙' },
  credito:   { tagColor: 'coral',  tag: 'Crédito',    emoji: '⚠️' },
  tarjeta:   { tagColor: 'blue',   tag: 'Tarjeta',    emoji: '💳' },
  membresia: { tagColor: 'dark',   tag: 'Hey Pro',    emoji: '⭐' },
  seguro:    { tagColor: 'pink',   tag: 'Seguro',     emoji: '🛡️' },
  general:   { tagColor: 'amber',  tag: 'Hey Banco',  emoji: '🏦' },
};

function getCardImage(id) {
  // id puede ser string ("inv_hey") o number; normalizamos a índice 1-5
  const num = (Math.abs(
    String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  ) % 5) + 1;
  return `/assets/imgs/card_imgs/${num}.png`;
}

export default function SuggestionCard({ suggestion, state = 'active' }) {
  // Soporta tanto el schema del backend (titulo/descripcion/tipo)
  // como el schema legacy del mockData (title/description/tag/steps/emoji)
  const titulo      = suggestion.titulo      ?? suggestion.title       ?? '';
  const descripcion = suggestion.descripcion ?? suggestion.description ?? '';
  const cta         = suggestion.cta         ?? 'Ver más';
  const tipo        = suggestion.tipo        ?? 'general';
  const meta        = TIPO_META[tipo] || TIPO_META.general;

  // Emoji: backend puede mandar uno, sino usamos el del mapa
  const emoji       = suggestion.icono ?? suggestion.emoji ?? meta.emoji;

  // Tag: backend no manda tag, usamos el del mapa
  const tag         = suggestion.tag ?? meta.tag;
  const tagColor    = suggestion.tagColor ?? meta.tagColor;
  const tc          = TAG_STYLES[tagColor] || TAG_STYLES.coral;

  // Steps: el backend no manda steps, dejamos array vacío
  const steps       = suggestion.steps ?? [];

  const imgSrc = useMemo(() => getCardImage(suggestion.id ?? 1), [suggestion.id]);

  const isActive = state === 'active';

  const transforms = {
    active: 'translateX(0)',
    next:   'translateX(110%)',
    prev:   'translateX(-110%)',
  };

  return (
    <div
      className="suggestion-glass-card"
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        minHeight: 260,
        transform: transforms[state] ?? 'translateX(0)',
        opacity: isActive ? 1 : 0,
        transition: 'transform 0.52s cubic-bezier(0.4,0,0.2,1), opacity 0.52s ease',
        zIndex: isActive ? 2 : 1,
      }}
    >
      {/* Background image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${imgSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0,
      }} />

      {/* Cream overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(251,248,242,0.82) 0%, rgba(242,240,226,0.70) 100%)',
        zIndex: 1,
      }} />

      {/* Glass surface */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        zIndex: 2,
      }} />

      {/* Top shine */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0.95) 70%, transparent)',
        zIndex: 10,
        pointerEvents: 'none',
      }} />

      {/* Border ring */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid rgba(255,255,255,0.55)',
        boxShadow: '0 4px 24px rgba(50,50,50,0.10), inset 0 1px 0 rgba(255,255,255,0.7)',
        zIndex: 11,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 12,
        padding: '20px 22px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gridTemplateRows: 'auto auto 1fr auto',
        gap: 10,
        minHeight: 260,
      }}>

        {/* Tag */}
        <div style={{ gridColumn: 1, display: 'inline-flex', alignSelf: 'start' }}>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            padding: '3px 10px',
            borderRadius: 20,
            background: tc.bg,
            color: tc.color,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.4)',
          }}>
            {tag}
          </span>
        </div>

        {/* Emoji */}
        <div style={{
          gridColumn: 2,
          gridRow: '1 / 3',
          fontSize: 42,
          alignSelf: 'center',
          marginLeft: 12,
          lineHeight: 1,
          filter: 'drop-shadow(0 2px 4px rgba(50,50,50,0.15))',
        }}>
          {emoji}
        </div>

        {/* Title */}
        <h2 style={{
          gridColumn: 1,
          fontFamily: 'var(--font-display)',
          fontSize: 19,
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          margin: 0,
          textShadow: '0 1px 2px rgba(255,255,255,0.6)',
        }}>
          {titulo}
        </h2>

        {/* Description */}
        <p style={{
          gridColumn: '1 / -1',
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          margin: 0,
        }}>
          {descripcion}
        </p>

        {/* Steps — solo se renderizan si existen */}
        {steps.length > 0 && (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                fontSize: 12.5, color: 'var(--text-secondary)',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--hey-orange)', flexShrink: 0,
                }} />
                {step}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            style={{
              padding: '7px 18px',
              borderRadius: 20,
              border: '1px solid var(--hey-orange)',
              background: 'rgba(255,255,255,0.35)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: 'var(--hey-orange)',
              fontSize: 12.5,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--hey-orange)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
              e.currentTarget.style.color = 'var(--hey-orange)';
            }}
          >
            {cta} →
          </button>
        </div>
      </div>
    </div>
  );
}