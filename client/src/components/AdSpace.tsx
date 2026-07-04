import React, { useEffect, useRef } from 'react';

export type AdSize = '300x250' | '728x90' | '160x600' | '320x50' | '300x600';

interface AdSpaceProps {
  size: AdSize;
  slot?: string;
  className?: string;
}

/**
 * AdSpace component for displaying Adsterra native ads
 * Supports standard IAB ad sizes
 * Configured with Adsterra publisher ID for monetization
 */
export const AdSpace: React.FC<AdSpaceProps> = ({ size, slot, className = '' }) => {
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number }>({ width: 300, height: 250 });
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  React.useEffect(() => {
    const sizeMap: Record<AdSize, { width: number; height: number }> = {
      '300x250': { width: 300, height: 250 }, // Medium Rectangle
      '728x90': { width: 728, height: 90 },   // Leaderboard
      '160x600': { width: 160, height: 600 }, // Wide Skyscraper
      '320x50': { width: 320, height: 50 },   // Mobile Banner
      '300x600': { width: 300, height: 600 }, // Half Page
    };
    setDimensions(sizeMap[size]);
  }, [size]);

  useEffect(() => {
    const pubId = import.meta.env.VITE_ADSTERRA_PUB_ID;
    if (!pubId || !containerRef.current) return;

    // Load Adsterra ad script once globally
    if (!scriptLoadedRef.current) {
      const script = document.createElement('script');
      script.src = `https://www.adsterra.com/script/displayAds.js`;
      script.async = true;
      script.onload = () => {
        scriptLoadedRef.current = true;
        // Trigger ad refresh after script loads
        if ((window as any).atOptions) {
          (window as any).atOptions.publisher = pubId;
          (window as any).atOptions.docUrl = window.location.href;
        }
      };
      document.head.appendChild(script);
    }

    // Create ad container with Adsterra attributes
    if (containerRef.current) {
      containerRef.current.innerHTML = `
        <ins class="adsbygoogle"
          style="display:block"
          data-ad-client="ca-pub-${pubId}"
          data-ad-slot="${slot || 'default'}"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
      `;

      // Trigger ad refresh if script is already loaded
      if ((window as any).adsbygoogle) {
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (e) {
          console.error('Adsterra ad error:', e);
        }
      }
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`ad-space flex items-center justify-center bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg ${className}`}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        minWidth: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`,
      }}
      data-ad-size={size}
      data-ad-slot={slot}
    >
      {/* Adsterra ads will render here */}
    </div>
  );
};

export default AdSpace;
