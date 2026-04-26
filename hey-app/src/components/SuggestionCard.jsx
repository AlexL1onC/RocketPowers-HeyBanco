import React from 'react';

const TAG_STYLES = {
  green:  { bg: '#EAF3DE', color: '#3B6D11' },
  coral:  { bg: '#FAECE7', color: '#993C1D' },
  blue:   { bg: '#E6F1FB', color: '#185FA5' },
  amber:  { bg: '#FAEEDA', color: '#854F0B' },
};

export default function SuggestionCard({ suggestion, state }) {
  const { tag, tagColor, emoji, title, description, steps, cta } = suggestion;
  const tc = TAG_STYLES[tagColor] || TAG_STYLES.coral;

  const transforms = {
    active: 'translateX(0)',
    next:   'translateX(110%)',
    prev:   'translateX(-110%)',
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      border: '0.5px solid var(--border-light)',
      padding: '20px 22px',
      minHeight: 260,
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gridTemplateRows: 'auto auto 1fr auto',
      gap: 10,
      transform: transforms[state],
      opacity: state === 'active' ? 1 : 0,
      transition: 'transform 0.48s cubic-bezier(0.4,0,0.2,1), opacity 0.48s ease',
      zIndex: state === 'active' ? 2 : 1,
      boxShadow: state === 'active' ? 'var(--shadow-card)' : 'none',
    }}>
      {/* Tag */}
      <div style={{
        gridColumn: 1,
        display: 'inline-flex',
        alignSelf: 'start',
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          padding: '3px 10px',
          borderRadius: 20,
          background: tc.bg,
          color: tc.color,
        }}>{tag}</span>
      </div>

      {/* Emoji */}
      <div style={{
        gridColumn: 2,
        gridRow: '1 / 3',
        fontSize: 42,
        alignSelf: 'center',
        marginLeft: 12,
        lineHeight: 1,
      }}>{emoji}</div>

      {/* Title */}
      <h2 style={{
        gridColumn: 1,
        fontFamily: 'var(--font-display)',
        fontSize: 19,
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1.2,
      }}>{title}</h2>

      {/* Description */}
      <p style={{
        gridColumn: '1 / -1',
        fontSize: 13,
        color: 'var(--text-secondary)',
        lineHeight: 1.65,
      }}>{description}</p>

      {/* Steps */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: 'var(--text-secondary)' }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--hey-orange)', flexShrink: 0,
            }} />
            {step}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          style={{
            padding: '7px 18px',
            borderRadius: 20,
            border: '1px solid var(--hey-orange)',
            background: 'transparent',
            color: 'var(--hey-orange)',
            fontSize: 12.5,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => { e.target.style.background = 'var(--hey-orange)'; e.target.style.color = '#fff'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--hey-orange)'; }}
        >
          {cta} →
        </button>
      </div>
    </div>
  );
}
