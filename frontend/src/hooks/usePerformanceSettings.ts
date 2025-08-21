import { useState, useEffect } from 'react';

export type QualityLevel = 'low' | 'medium' | 'high';

interface PerformanceSettings {
  quality: QualityLevel;
  shadows: boolean;
  particles: boolean;
  antialias: boolean;
  pixelRatio: number;
  shadowMapSize: number;
}

export function usePerformanceSettings() {
  const [fps, setFps] = useState(60);
  const [quality, setQuality] = useState<QualityLevel>('medium');
  
  // Detect performance and auto-adjust quality
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(frameCount);
        
        // Auto-adjust quality based on FPS
        if (frameCount < 30 && quality !== 'low') {
          setQuality('low');
        } else if (frameCount >= 50 && frameCount < 60 && quality !== 'medium') {
          setQuality('medium');
        } else if (frameCount >= 60 && quality !== 'high') {
          // Only go to high if consistently hitting 60fps
          if (frameCount >= 60) {
            setQuality('high');
          }
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    animationId = requestAnimationFrame(measureFPS);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [quality]);
  
  const getSettings = (): PerformanceSettings => {
    switch (quality) {
      case 'low':
        return {
          quality: 'low',
          shadows: false,
          particles: false,
          antialias: false,
          pixelRatio: 1,
          shadowMapSize: 512
        };
      case 'medium':
        return {
          quality: 'medium',
          shadows: true,
          particles: true,
          antialias: false,
          pixelRatio: Math.min(window.devicePixelRatio, 1.5),
          shadowMapSize: 1024
        };
      case 'high':
        return {
          quality: 'high',
          shadows: true,
          particles: true,
          antialias: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
          shadowMapSize: 2048
        };
      default:
        return getSettings(); // Recursive call with default 'medium'
    }
  };
  
  return {
    fps,
    quality,
    setQuality,
    settings: getSettings()
  };
}