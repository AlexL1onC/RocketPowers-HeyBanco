// SuggestionsCarousel.jsx
import React, { useEffect, useRef, useState } from 'react';
import SuggestionCard from './SuggestionCard';
import { fetchSuggestions } from '../api';

const USER_ID = "USR-09092";

const FALLBACK_SUGGESTIONS = [
  {
    id: "fb_1", tipo: "general", tag: "Hey Banco", icono: "🏦",
    titulo: "Bienvenido a Hey Banco",
    descripcion: "Explora todas las funciones de tu banco inteligente.",
    cta: "Explorar", steps: [], cluster_id: -1
  },
];

export default function SuggestionsCarousel() {
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  
  const containerRef = useRef(null);

  // ── CARGA DE DATOS ──
  useEffect(() => {
    let cancelled = false;
    
    fetchSuggestions(USER_ID)
      .then(data => {
        if (cancelled) return;
        const sugs = data?.suggestions;
        if (sugs && Array.isArray(sugs) && sugs.length > 0) {
          console.log(`[Carousel] ${sugs.length} sugerencias cargadas`);
          setAllSuggestions(sugs);
        } else {
          setAllSuggestions(FALLBACK_SUGGESTIONS);
        }
      })
      .catch(err => {
        if (cancelled) return;
        console.error("[Carousel] Error:", err);
        setAllSuggestions(FALLBACK_SUGGESTIONS);
      })
      .finally(() => {
        if (!cancelled) setLoadingInit(false);
      });
      
    return () => { cancelled = true; };
  }, []);

  const goNext = () => {
    setCurrent(prev => (prev + 1) % allSuggestions.length);
  };

  const goPrev = () => {
    setCurrent(prev => (prev - 1 + allSuggestions.length) % allSuggestions.length);
  };

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const data = await fetchSuggestions(USER_ID);
      if (data?.suggestions?.length) {
        setAllSuggestions(data.suggestions);
        setCurrent(0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const total = allSuggestions.length;

  if (loadingInit) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '1.2px', color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-body)'
          }}>
            Sugerencias para ti
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px',
            borderRadius: 10, background: '#F2F0E2', color: '#546436',
            fontFamily: 'var(--font-body)'
          }}>
            IA
          </span>
        </div>
        <div style={{
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-secondary)',
          height: 280,
          animation: 'pulse 1.5s ease infinite',
        }} />
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '1.2px',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-body)',
          }}>
            Sugerencias para ti
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px',
            borderRadius: 10, background: '#F2F0E2', color: '#546436',
            fontFamily: 'var(--font-body)',
          }}>
            IA
          </span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>
          {total > 0 ? `${current + 1} / ${total}` : '—'}
        </span>
      </div>

      {/* ── CARRUSEL ──
          El wrapper externo tiene position:relative para anclar las flechas.
          Solo el contenedor interno tiene overflow:hidden para no recortar los botones. */}
      <div style={{
        position: 'relative',   // ← ancla las flechas
        height: 280,
        marginBottom: 12,
      }}>

        {/* Contenedor de slides — único con overflow:hidden */}
        <div style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',  // ← necesario para los absolute de las tarjetas
        }}>
          {allSuggestions.map((s, idx) => (
            <div
              key={s.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transform: `translateX(${(idx - current) * 100}%)`,
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: idx === current ? 2 : 1,
                pointerEvents: idx === current ? 'auto' : 'none',
              }}
            >
              <SuggestionCard suggestion={s} cardIndex={idx} />
            </div>
          ))}
        </div>

        {/* Flecha izquierda — fuera del overflow:hidden, visible y clickeable */}
        {total > 1 && (
          <button
            onClick={goPrev}
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(4px)',
              color: 'var(--brand-primary)',
              fontSize: 16,
              cursor: 'pointer',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.85)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            ‹
          </button>
        )}

        {/* Flecha derecha — fuera del overflow:hidden, visible y clickeable */}
        {total > 1 && (
          <button
            onClick={goNext}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(4px)',
              color: 'var(--brand-primary)',
              fontSize: 16,
              cursor: 'pointer',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.85)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            ›
          </button>
        )}
      </div>

      {/* Bottom: dots + botón */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Dots de paginación */}
        <div style={{ display: 'flex', gap: 6, flex: 1, justifyContent: 'center' }}>
          {allSuggestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              style={{
                width: idx === current ? 20 : 6,
                height: 6,
                borderRadius: 3,
                border: 'none',
                background: idx === current ? 'var(--brand-primary)' : 'var(--border-medium)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Botón más sugerencias */}
        <button
          onClick={handleLoadMore}
          disabled={loading}
          style={{
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
            flexShrink: 0,
            fontFamily: 'var(--font-body)',
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.borderColor = 'var(--brand-primary)';
              e.currentTarget.style.color = 'var(--brand-primary)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-medium)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {loading ? '⟳ Cargando...' : '+ más sugerencias'}
        </button>
      </div>
    </div>
  );
}