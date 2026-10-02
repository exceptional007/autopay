import { useState, useEffect, useRef } from 'react';

export interface UseCountUpOptions {
  end: number | null;
  start?: number;
  duration?: number; // ms, restrained 800-1400ms
  decimals?: number;
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  enabled?: boolean; // triggered by IntersectionObserver
}

export function formatMetricNumber(
  value: number,
  isCurrency = false,
  decimals = 0,
  prefix = '',
  suffix = ''
): string {
  if (isCurrency) {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(value);
    return `${prefix}${formatted}${suffix}`;
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
  return `${prefix}${formatted}${suffix}`;
}

/**
 * High-performance count-up animation hook targeting 90 FPS on capable displays.
 * Employs requestAnimationFrame with timestamp delta and ease-out cubic curve.
 * Bypasses animation immediately when prefers-reduced-motion is active.
 */
export function useCountUp({
  end,
  start = 0,
  duration = 1100,
  decimals = 0,
  isCurrency = false,
  prefix = '',
  suffix = '',
  enabled = true,
}: UseCountUpOptions) {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (end === null) return '—';
    return formatMetricNumber(start, isCurrency, decimals, prefix, suffix);
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const prevEndRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Clean up any ongoing animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // If end is null (loading or unavailable state)
    if (end === null) {
      setDisplayValue('—');
      setIsAnimating(false);
      prevEndRef.current = null;
      return;
    }

    // Respect prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !enabled) {
      setDisplayValue(formatMetricNumber(end, isCurrency, decimals, prefix, suffix));
      prevEndRef.current = end;
      setIsAnimating(false);
      return;
    }

    // Determine starting value for animation:
    // If previously animated to a number, smoothly animate from that number to the new number!
    const fromValue = prevEndRef.current !== null ? prevEndRef.current : start;
    const toValue = end;

    // If already at target
    if (fromValue === toValue && prevEndRef.current !== null) {
      setDisplayValue(formatMetricNumber(toValue, isCurrency, decimals, prefix, suffix));
      return;
    }

    setIsAnimating(true);
    startTimeRef.current = null;

    // Cubic ease-out curve: rapid initial acceleration, graceful decelerating landing
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / Math.max(duration, 100), 1);
      const easedProgress = easeOutCubic(progress);

      const currentValue = fromValue + (toValue - fromValue) * easedProgress;

      if (progress < 1) {
        setDisplayValue(formatMetricNumber(currentValue, isCurrency, decimals, prefix, suffix));
        rafRef.current = requestAnimationFrame(step);
      } else {
        // Guarantee precision: exact target value without floating-point drift
        setDisplayValue(formatMetricNumber(toValue, isCurrency, decimals, prefix, suffix));
        prevEndRef.current = toValue;
        setIsAnimating(false);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [end, enabled, duration, isCurrency, decimals, prefix, suffix, start]);

  return { displayValue, isAnimating };
}
