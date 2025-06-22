import React, { useEffect, useRef, useState } from 'react';

const AnimatedNumber: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const raf = useRef<number>();

  useEffect(() => {
    const duration = 700; // ms
    const start = displayValue;
    const end = value;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = start + (end - start) * progress;
      setDisplayValue(current);
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };
    raf.current = requestAnimationFrame(animate);
    return () => raf.current && cancelAnimationFrame(raf.current);
    // eslint-disable-next-line
  }, [value]);

  return <span className={className}>{displayValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>;
};

export default AnimatedNumber; 