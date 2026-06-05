import React, { useEffect, useRef, useState } from 'react';

interface StatsCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

export default function StatsCounter({ value, suffix = "", duration = 2 }: StatsCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();

          const start = performance.now();
          const durationMs = duration * 1000;

          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / durationMs, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * value);
            setDisplay(current);
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums" data-target={value} data-suffix={suffix}>
      {display}{suffix}
    </span>
  );
}
