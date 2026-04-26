import React, { useState, useEffect, useRef } from 'react';

export default function TypewriterText({ text, speed = 14, style, onComplete }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;

    if (!text) {
      setDone(true);
      onComplete?.();
      return;
    }

    intervalRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(intervalRef.current);
        setDone(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [text, speed, onComplete]);

  return (
    <>
      <span style={style}>{displayed}</span>
      {!done && (
        <span
          style={{
            display: 'inline-block',
            width: 2,
            height: '1em',
            background: 'currentColor',
            marginLeft: 2,
            verticalAlign: 'text-bottom',
            opacity: 0.7,
            animation: 'typewriter-blink 1s step-end infinite',
          }}
        />
      )}
      <style>{`
        @keyframes typewriter-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </>
  );
}