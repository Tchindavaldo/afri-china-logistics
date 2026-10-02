import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Délai en ms, pour décaler les éléments d'une grille. */
  delay?: number;
}

/** Apparition douce au défilement (respecte prefers-reduced-motion via CSS). */
export default function Reveal({ children, as: Tag = 'div', className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} data-reveal="" className={className} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
