import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';

interface StatsCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

export default function StatsCounter({ value, suffix = "", duration = 2 }: StatsCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const springValue = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const displayValue = useTransform(springValue, (current) => Math.round(current));
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  useEffect(() => {
    const unsubscribe = displayValue.on("change", (latest) => {
      setCurrentValue(latest);
    });
    return () => unsubscribe();
  }, [displayValue]);

  return (
    <span ref={ref} className="tabular-nums">
      {currentValue}{suffix}
    </span>
  );
}
