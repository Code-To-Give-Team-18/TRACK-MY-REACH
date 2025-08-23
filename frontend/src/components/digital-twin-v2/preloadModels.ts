'use client';

import { useGLTF } from '@react-three/drei';

// Preload all models to avoid loading failures
export function preloadModels() {
  const models = [
    '/models/stationary.glb',
    '/models/Book Stack.glb',
    '/models/Ramen_lunch.glb',
    '/models/Laptop.glb'
  ];

  models.forEach(model => {
    try {
      useGLTF.preload(model);
    } catch (error) {
      console.warn(`Failed to preload model ${model}:`, error);
    }
  });
}