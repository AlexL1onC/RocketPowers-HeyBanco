import React, { useMemo, useState } from 'react';
import TypewriterText from './TypewriterText';

const TAG_STYLES = {
  green:  { bg: 'rgba(84,100,54,0.12)', color: '#546436' },
  coral:  { bg: 'rgba(150,72,49,0.10)', color: '#6b5a52' },
  blue:   { bg: 'rgba(82,90,107,0.10)', color: '#525a6b' },
  amber:  { bg: 'rgba(122,113,90,0.12)', color: '#7a715a' },
  dark:   { bg: 'rgba(50,50,50,0.10)',    color: '#323232' },
  pink:   { bg: 'rgba(107,82,96,0.10)',   color: '#6b5260' },
};

const TIPO_META = {
  inversion: { tagColor: 'green',  tag: 'Inversión',  emoji: '📈' },
  ahorro:    { tagColor: 'green',  tag: 'Ahorro',     emoji: '🪙' },
  credito:   { tagColor: 'coral',  tag: 'Crédito',    emoji: '⚠️' },
  tarjeta:   { tagColor: 'blue',   tag: 'Tarjeta',    emoji: '💳' },
  membresia: { tagColor: 'dark',   tag: 'Hey Pro',    emoji: '⭐' },
  seguro:    { tagColor: 'pink',   tag: 'Seguro',     emoji: '🛡️' },
  general:   { tagColor: 'amber',  tag: 'Hey Banco',  emoji: '🏦' },
};

// ── Genera un patrón SVG como fallback cuando no hay imagen ──
function generatePattern(clusterId, index) {
  const colors = ['#323232', '#546436', '#964831', '#7a715a', '#525a6b'];
  const baseColor = colors[(clusterId + index) % colors.length];
  const svg = `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="p" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="2" fill="${baseColor}" opacity="0.3"/>
          <circle cx="0" cy="0" r="1.5" fill="${baseColor}" opacity="0.2"/>
          <circle cx="40" cy="40" r="1.5" fill="${baseColor}" opacity="0.2"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#F2F0E2"/>
      <rect width="100%" height="100%" fill="url(#p)"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function getCardImage(clusterId, index) {
  const safeCluster = clusterId ?? -1;
  const safeIndex = ((index ?? 0) % 4) + 1;
  return `/assets/imgs/segmentos/${safeCluster}/${safeIndex}.png`;
}

export default function SuggestionCard({ suggestion, cardIndex = 0 }) {
  const [imgError, setImgError] = useState(false);
  
  const titulo      = suggestion.titulo      ?? suggestion.title       ?? '';
  const descripcion = suggestion.descripcion ?? suggestion.description ?? '';
  const cta         = suggestion.cta         ?? 'Ver más';
  const tipo        = suggestion.tipo        ?? 'general';
  const meta        = TIPO_META[tipo] || TIPO_META.general;

  const emoji       = suggestion.icono ?? suggestion.emoji ?? meta.emoji;
  const tag         = suggestion.tag ?? meta.tag;
  const tagColor    = suggestion.tagColor ?? meta.tagColor;
  const tc          = TAG_STYLES[tagColor] || TAG_STYLES.coral;

  const steps       = suggestion.steps ?? [];
  const clusterId   = suggestion.cluster_id;

  const imgSrc = useMemo(() => {
    if (imgError) return generatePattern(clusterId, cardIndex);
    return getCardImage(clusterId, cardIndex);
  }, [clusterId, cardIndex, imgError]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: '#F2F0E2',
      }}
    >
      {/* Background image con fallback */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${imgSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0,
      }}>
        <img 
          src={getCardImage(clusterId, cardIndex)}
          alt=""
          style={{ display: 'none' }}
          onError={() => setImgError(true)}
        />
      </div>

      {/* Cream overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(251,248,242,0.92) 0%, rgba(242,240,226,0.88) 60%, rgba(251,248,242,0.95) 100%)',
        zIndex: 1,
      }} />

      {/* Glass surface */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backdropFilter: 'blur(12px) saturate(130%)',
        WebkitBackdropFilter: 'blur(12px) saturate(130%)',
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
        boxShadow: '0 4px 24px rgba(50,50,50,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        zIndex: 11,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 12,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        gap: 8,
      }}>
        {/* Header: Tag + Emoji */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            padding: '3px 10px',
            borderRadius: 20,
            background: tc.bg,
            color: tc.color,
            border: '1px solid rgba(255,255,255,0.4)',
            fontFamily: 'var(--font-body)',
            backdropFilter: 'blur(8px)',
          }}>
            {tag}
          </span>
          <span style={{
            fontSize: 36,
            lineHeight: 1,
            filter: 'drop-shadow(0 2px 4px rgba(50,50,50,0.15))',
          }}>
            {emoji}
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.25,
          margin: 0,
          marginTop: 4,
          textShadow: '0 1px 2px rgba(255,255,255,0.6)',
        }}>
          <TypewriterText key={`title-${suggestion.id}`} text={titulo} speed={20} />
        </h2>

        {/* Description */}
        <p style={{
          fontSize: 12.5,
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          margin: 0,
          fontFamily: 'var(--font-body)',
          flex: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}>
          <TypewriterText key={`desc-${suggestion.id}`} text={descripcion} speed={14} />
        </p>

        {/* Steps (máx 2, compactos) */}
        {steps.length > 0 && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 4,
          }}>
            {steps.slice(0, 2).map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11.5, color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--brand-primary)', flexShrink: 0,
                }} />
                <span style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: 'auto', paddingTop: 4 }}>
          <button
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: '1px solid var(--brand-primary)',
              background: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(8px)',
              color: 'var(--brand-primary)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'var(--transition)',
              fontFamily: 'var(--font-body)',
              float: 'right',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--brand-primary)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.4)';
              e.currentTarget.style.color = 'var(--brand-primary)';
            }}
          >
            {cta} →
          </button>
        </div>
      </div>
    </div>
  );
}