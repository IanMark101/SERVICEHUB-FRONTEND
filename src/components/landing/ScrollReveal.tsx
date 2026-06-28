import React, { useState, useEffect, useRef } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollReveal({ children, className = "" }: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [transitionDone, setTransitionDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollDirectionRef = useRef<'up' | 'down'>('down');
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      lastScrollYRef.current = window.scrollY;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollYRef.current) {
        scrollDirectionRef.current = 'down';
      } else if (currentScrollY < lastScrollYRef.current) {
        scrollDirectionRef.current = 'up';
      }
      lastScrollYRef.current = currentScrollY;
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        if (entry.isIntersecting) {
          if (scrollDirectionRef.current === 'up') {
            setIsVisible(true);
            setTransitionDone(true); // No transition on scroll up
          } else {
            setIsVisible(true);
            setTransitionDone(false); // Enable transition on scroll down
            timeoutRef.current = setTimeout(() => {
              setTransitionDone(true);
            }, 1000);
          }
        } else {
          // Reset visibility instantly when exiting the viewport
          setIsVisible(false);
          setTransitionDone(true); // No transition on exit
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${transitionDone
        ? ''
        : 'transition-all duration-1000 transform'
        } ${isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
        } ${className}`}
    >
      {children}
    </div>
  );
}
