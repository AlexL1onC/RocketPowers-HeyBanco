import React, { useState, useEffect, useCallback } from 'react';
import SuggestionCard from './SuggestionCard';
import { SUGGESTIONS, EXTRA_SUGGESTIONS } from '../data/mockData';

export default function SuggestionsCarousel() {
  const [allSuggestions, setAllSuggestions] = useState(SUGGESTIONS);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);

  const total = allSuggestions.length;

  const getState = (index) => {
    if (index === current) return 'active';
    return 'next';
  };

  const goTo = useCallback((idx) => {
    setCurrent(((idx % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setAllSuggestions(prev => {
        const ids = new Set(prev.map(s => s.id));
        const newOnes = EXTRA_SUGGESTIONS.filter(s => !ids.has(s.id));
        return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
      });
      setLoading(false);
    }, 900);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)' }}>
            Sugerencias para ti
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px',
            borderRadius: 10, background: '#EAF3DE', color: '#3B6D11',
          }}>IA</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{current + 1} / {total}</span>
      </div>

      {/* Carousel viewport */}
      <div style={{ position: 'relative', height: 280, marginBottom: 16, overflow: 'hidden' }}>
        {allSuggestions.map((s, i) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            state={getState(i)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <NavArrow dir="←" onClick={prev} />

        {/* Dots */}
        <div style={{ display: 'flex', gap: 5, flex: 1, justifyContent: 'center' }}>
          {allSuggestions.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? 20 : 7,
                height: 7,
                borderRadius: 4,
                background: i === current ? 'var(--hey-orange)' : 'var(--border-medium)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>

        <NavArrow dir="→" onClick={next} />

        <button
          onClick={handleLoadMore}
          disabled={loading}
          style={{
            marginLeft: 6,
            padding: '6px 14px',
            borderRadius: 20,
            border: '0.5px solid var(--border-medium)',
            background: '#fff',
            color: loading ? 'var(--text-tertiary)' : 'var(--text-secondary)',
            fontSize: 12,
            fontWeight: 500,
            cursor: loading ? 'default' : 'pointer',
            transition: 'var(--transition)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.borderColor = 'var(--hey-orange)', e.currentTarget.style.color = 'var(--hey-orange)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-medium)', e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          {loading ? '⟳ Cargando...' : '+ más sugerencias'}
        </button>
      </div>
    </div>
  );
}

function NavArrow({ dir, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 30, height: 30,
        borderRadius: '50%',
        border: `0.5px solid ${hovered ? 'var(--hey-orange)' : 'var(--border-medium)'}`,
        background: '#fff',
        color: hovered ? 'var(--hey-orange)' : 'var(--text-secondary)',
        fontSize: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'var(--transition)',
        flexShrink: 0,
      }}
    >{dir}</button>
  );
}
