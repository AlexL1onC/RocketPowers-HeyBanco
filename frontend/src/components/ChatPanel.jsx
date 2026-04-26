import React, { useState, useRef, useEffect } from 'react';
import { sendChat } from '../api';
import TypewriterText from './TypewriterText';

import { USER_ID } from '../config';

export default function ChatPanel() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: '¡Hola! Soy Delfos, tu asesor financiero de Hey Banco. ¿En qué te puedo ayudar hoy?',
      time: '12:00 pm',
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const animatedIds = useRef(new Set());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const now = () => {
    const d = new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'am' : 'pm'}`;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text, time: now() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const data = await sendChat(USER_ID, text);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: data.response || 'No pude procesar tu solicitud.',
        time: now(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: 'Hubo un error al conectar con Delfos. Intenta de nuevo.',
        time: now(),
      }]);
    } finally {
      setTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const QUICK = ['¿Cuánto ahorré este mes?', '¿Cómo mejoro mi score?', '¿Qué productos me recomiendas?'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Quick prompts */}
      <div style={{ padding: '12px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {QUICK.map(q => (
          <button
            key={q}
            onClick={() => setInput(q)}
            style={{
              padding: '4px 12px',
              borderRadius: 16,
              border: '0.5px solid var(--border-medium)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              fontSize: 11.5,
              cursor: 'pointer',
              transition: 'var(--transition)',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--brand-primary)';
              e.currentTarget.style.color = 'var(--brand-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-medium)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxHeight: 380,
      }}>
        {messages.map(m => (
          <div key={m.id} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '88%',
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            gap: 3,
          }}>
            <div style={{
              padding: '9px 14px',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? 'var(--brand-primary)' : '#fff',
              color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
              border: m.role === 'bot' ? '0.5px solid var(--border-light)' : 'none',
              fontSize: 13,
              lineHeight: 1.55,
              fontFamily: 'var(--font-body)',
            }}>
              {m.role === 'bot' && !animatedIds.current.has(m.id) ? (
                <TypewriterText
                  text={m.text}
                  speed={13}
                  style={{ fontFamily: 'var(--font-body)' }}
                  onComplete={() => animatedIds.current.add(m.id)}
                />
              ) : (
                <span style={{ fontFamily: 'var(--font-body)' }}>{m.text}</span>
              )}
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>{m.time}</span>
          </div>
        ))}

        {typing && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{
              display: 'flex', gap: 4, alignItems: 'center',
              padding: '10px 14px',
              borderRadius: '16px 16px 16px 4px',
              background: '#fff',
              border: '0.5px solid var(--border-light)',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--text-tertiary)',
                  animation: 'bounce 1.2s ease infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 14px',
        borderTop: '0.5px solid var(--border-light)',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={typing}
          placeholder={typing ? 'Delfos está escribiendo...' : 'Pregúntame cualquier cosa...'}
          style={{
            flex: 1,
            padding: '9px 14px',
            borderRadius: 22,
            border: '0.5px solid var(--border-medium)',
            background: typing ? '#f5f5f5' : 'var(--bg-secondary)',
            fontSize: 13,
            color: 'var(--text-primary)',
            outline: 'none',
            opacity: typing ? 0.7 : 1,
            transition: 'var(--transition)',
            fontFamily: 'var(--font-body)',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={typing}
          style={{
            width: 34, height: 34,
            borderRadius: '50%',
            background: typing ? 'var(--text-tertiary)' : 'var(--brand-primary)',
            border: 'none',
            color: '#fff',
            fontSize: 16,
            cursor: typing ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => { if (!typing) e.currentTarget.style.background = 'var(--brand-dark)'; }}
          onMouseLeave={e => { if (!typing) e.currentTarget.style.background = 'var(--brand-primary)'; }}
        >↑</button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}