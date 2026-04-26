import React, { useEffect, useRef, useState } from 'react';
import SuggestionCard from './SuggestionCard';
import { fetchSuggestions } from '../api';

const USER_ID = "USER_001";

function loadSwiper() {
  return new Promise((resolve) => {
    if (window.Swiper) return resolve(window.Swiper);

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js';
    script.onload = () => resolve(window.Swiper);
    document.head.appendChild(script);
  });
}

export default function SuggestionsCarousel() {
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const swiperRef = useRef(null);
  const swiperInstanceRef = useRef(null);
  const containerRef = useRef(null);

  // Carga inicial desde la API
  useEffect(() => {
    fetchSuggestions(USER_ID)
      .then(data => {
        if (data.suggestions?.length) setAllSuggestions(data.suggestions);
      })
      .catch(console.error)
      .finally(() => setLoadingInit(false));
  }, []);

  // Init / reinit Swiper cuando cambian los slides
  useEffect(() => {
    if (!allSuggestions.length) return;

    let instance;
    loadSwiper().then((Swiper) => {
      if (swiperInstanceRef.current) {
        swiperInstanceRef.current.destroy(true, true);
      }
      instance = new Swiper(swiperRef.current, {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: allSuggestions.length > 1,
        effect: 'slide',
        autoplay: {
          delay: 4500,
          pauseOnMouseEnter: true,
          disableOnInteraction: false,
        },
        pagination: {
          el: containerRef.current?.querySelector('.hey-pagination'),
          clickable: true,
          renderBullet: (_, cls) =>
            `<span class="${cls}" style="border-radius:4px"></span>`,
        },
        navigation: {
          nextEl: containerRef.current?.querySelector('.hey-nav-next'),
          prevEl: containerRef.current?.querySelector('.hey-nav-prev'),
        },
        on: {
          slideChange(swiper) {
            setCurrent(swiper.realIndex);
          },
        },
      });
      swiperInstanceRef.current = instance;
    });

    return () => {
      if (swiperInstanceRef.current) {
        swiperInstanceRef.current.destroy(true, true);
        swiperInstanceRef.current = null;
      }
    };
  }, [allSuggestions]);

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const data = await fetchSuggestions(USER_ID);
      if (data.suggestions?.length) {
        setAllSuggestions(data.suggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const total = allSuggestions.length;

  // Skeleton mientras carga por primera vez
  if (loadingInit) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)' }}>
            Sugerencias para ti
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: '#EAF3DE', color: '#3B6D11' }}>
            IA
          </span>
        </div>
        <div style={{
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-secondary)',
          minHeight: 260,
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
          }}>
            Sugerencias para ti
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px',
            borderRadius: 10, background: '#EAF3DE', color: '#3B6D11',
          }}>
            IA
          </span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          {total > 0 ? `${current + 1} / ${total}` : '—'}
        </span>
      </div>

      {/* Swiper */}
      <div
        ref={swiperRef}
        className="swiper hey-carousel"
        style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 12 }}
      >
        <div className="swiper-wrapper">
          {allSuggestions.map((s) => (
            <div className="swiper-slide" key={s.id} style={{ height: 'auto' }}>
              <div style={{ position: 'relative', minHeight: 260 }}>
                <SuggestionCard suggestion={s} state="active" />
              </div>
            </div>
          ))}
        </div>

        <div className="swiper-button-prev hey-nav-btn hey-nav-prev" />
        <div className="swiper-button-next hey-nav-btn hey-nav-next" />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          className="swiper-pagination hey-pagination"
          style={{ display: 'flex', gap: 5, flex: 1 }}
        />

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
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.borderColor = 'var(--hey-orange)';
              e.currentTarget.style.color = 'var(--hey-orange)';
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