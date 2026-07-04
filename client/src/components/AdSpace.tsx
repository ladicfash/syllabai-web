import React, { useEffect } from 'react';

export type AdSize = '300x250' | '728x90' | '160x600' | '320x50' | '300x600';

interface AdSpaceProps {
  size: AdSize;
  slot?: string;
  className?: string;
}

/**
 * AdSpace component for displaying ads
 * Supports standard IAB ad sizes
 * Configure with Google AdSense or other ad networks
 */
export const AdSpace: React.FC<AdSpaceProps> = ({ size, slot, className = '' }) => {
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number }>({ width: 300, height: 250 });

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

  return (
    <div
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
      <div className="text-center text-xs text-muted-foreground">
        <p className="font-medium">Ad Space</p>
        <p>{size}</p>
        {slot && <p className="text-[10px] mt-1">Slot: {slot}</p>}
      </div>
    </div>
  );
};

export default AdSpace;
