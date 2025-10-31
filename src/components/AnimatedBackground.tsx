import React, { useEffect, useRef, useState } from 'react';

interface AnimatedBackgroundProps {
  imageUrl: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ imageUrl }) => {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    const extractColors = async () => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        // Scale down for faster processing
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Sample colors from different regions
        const sampledColors: { r: number; g: number; b: number; count: number }[] = [];
        const step = 4; // Sample every 4th pixel for performance
        
        for (let i = 0; i < pixels.length; i += step * 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];
          
          // Skip transparent pixels
          if (a < 128) continue;
          
          // Skip very dark or very light colors
          const brightness = (r + g + b) / 3;
          if (brightness < 30 || brightness > 225) continue;
          
          sampledColors.push({ r, g, b, count: 1 });
        }
        
        // Simple color clustering - find dominant colors
        const dominantColors: string[] = [];
        const numColors = 4;
        
        for (let i = 0; i < numColors && sampledColors.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * sampledColors.length);
          const color = sampledColors[randomIndex];
          
          // Create semi-transparent version for overlay
          dominantColors.push(`rgba(${color.r}, ${color.g}, ${color.b}, 0.15)`);
          
          // Remove similar colors
          sampledColors.splice(randomIndex, 1);
        }
        
        setColors(dominantColors.length > 0 ? dominantColors : [
          'rgba(139, 92, 246, 0.15)',
          'rgba(236, 72, 153, 0.15)',
          'rgba(59, 130, 246, 0.15)',
          'rgba(251, 146, 60, 0.15)'
        ]);
      };
      
      img.onerror = () => {
        // Fallback colors if image fails to load
        setColors([
          'rgba(139, 92, 246, 0.15)',
          'rgba(236, 72, 153, 0.15)',
          'rgba(59, 130, 246, 0.15)',
          'rgba(251, 146, 60, 0.15)'
        ]);
      };
      
      img.src = imageUrl;
    };
    
    extractColors();
  }, [imageUrl]);

  if (colors.length === 0) return null;

  return (
    <div className="hidden md:block fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient blobs */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl animate-blob"
        style={{ 
          background: colors[0],
          animation: 'blob 7s infinite'
        }}
      />
      <div 
        className="absolute top-48 -right-32 w-96 h-96 rounded-full blur-3xl animate-blob animation-delay-2000"
        style={{ 
          background: colors[1],
          animation: 'blob 7s infinite 2s'
        }}
      />
      <div 
        className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full blur-3xl animate-blob animation-delay-4000"
        style={{ 
          background: colors[2],
          animation: 'blob 7s infinite 4s'
        }}
      />
      {colors[3] && (
        <div 
          className="absolute bottom-48 right-1/4 w-96 h-96 rounded-full blur-3xl animate-blob animation-delay-6000"
          style={{ 
            background: colors[3],
            animation: 'blob 7s infinite 6s'
          }}
        />
      )}
      
      {/* Subtle overlay to ensure readability */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
    </div>
  );
};
