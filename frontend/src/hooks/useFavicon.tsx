import { useEffect } from 'react';

interface UseFaviconProps {
  faviconUrl?: string;
}

export const useFavicon = ({ faviconUrl }: UseFaviconProps) => {
  useEffect(() => {
    if (faviconUrl) {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach(link => link.remove());

      // Add cache busting parameter
      const urlWithCacheBust = `${faviconUrl}?t=${Date.now()}`;

      // Create new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      link.href = urlWithCacheBust;
      document.head.appendChild(link);

      // Also add for different sizes and types
      const linkPNG = document.createElement('link');
      linkPNG.rel = 'icon';
      linkPNG.type = 'image/png';
      linkPNG.href = urlWithCacheBust;
      document.head.appendChild(linkPNG);

      const linkApple = document.createElement('link');
      linkApple.rel = 'apple-touch-icon';
      linkApple.href = urlWithCacheBust;
      document.head.appendChild(linkApple);

      console.log('Favicon updated:', urlWithCacheBust);
    }
  }, [faviconUrl]);
}; 