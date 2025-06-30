// hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook to track media query matches
 * @param query - The media query string to track
 * @returns boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Define the handler
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
};

// Predefined breakpoint hooks for common use cases
export const useIsMobile = (): boolean => {
  return useMediaQuery('(max-width: 768px)');
};

export const useIsTablet = (): boolean => {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
};

export const useIsDesktop = (): boolean => {
  return useMediaQuery('(min-width: 1025px)');
};

export const useIsSmallScreen = (): boolean => {
  return useMediaQuery('(max-width: 640px)');
};

export const useIsMediumScreen = (): boolean => {
  return useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
};

export const useIsLargeScreen = (): boolean => {
  return useMediaQuery('(min-width: 1025px)');
};

// Hook for detecting touch devices
export const useIsTouchDevice = (): boolean => {
  return useMediaQuery('(pointer: coarse)');
};

// Hook for detecting high-DPI displays
export const useIsHighDPI = (): boolean => {
  return useMediaQuery('(min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2)');
};

// Hook for detecting reduced motion preference
export const usePrefersReducedMotion = (): boolean => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};

// Hook for detecting dark mode preference
export const usePrefersDarkMode = (): boolean => {
  return useMediaQuery('(prefers-color-scheme: dark)');
};

// Hook for detecting print media
export const useIsPrintMode = (): boolean => {
  return useMediaQuery('print');
};

// Custom hook for multiple breakpoints
export const useBreakpoint = () => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isSmallScreen = useIsSmallScreen();
  const isMediumScreen = useIsMediumScreen();
  const isLargeScreen = useIsLargeScreen();

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    // Convenience getters
    current: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    size: isSmallScreen ? 'sm' : isMediumScreen ? 'md' : 'lg',
  } as const;
};

// Hook for container queries (experimental)
export const useContainerQuery = (
  containerRef: React.RefObject<HTMLElement>,
  query: string
): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof window === 'undefined') return;

    // This is a simplified version - real container queries would need more complex logic
    const checkQuery = () => {
      if (query.includes('max-width')) {
        const maxWidth = parseInt(query.match(/max-width:\s*(\d+)px/)?.[1] || '0');
        setMatches(element.offsetWidth <= maxWidth);
      } else if (query.includes('min-width')) {
        const minWidth = parseInt(query.match(/min-width:\s*(\d+)px/)?.[1] || '0');
        setMatches(element.offsetWidth >= minWidth);
      }
    };

    // Check initially
    checkQuery();

    // Use ResizeObserver to watch for size changes
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(checkQuery);
      resizeObserver.observe(element);
      
      return () => {
        resizeObserver.disconnect();
      };
    }

    // Fallback to window resize
    const handleResize = () => checkQuery();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef, query]);

  return matches;
};