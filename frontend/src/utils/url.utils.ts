import { env } from '@/config/env';

export function getBackendUrl(path?: string): string {
  if (!path) return env.API_URL;
  
  // If the path is already a full URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If the path starts with /api, it's a relative backend path
  if (path.startsWith('/api')) {
    return `${env.API_URL}${path}`;
  }
  
  // Otherwise, treat it as a relative path
  return path.startsWith('/') ? `${env.API_URL}${path}` : `${env.API_URL}/${path}`;
}