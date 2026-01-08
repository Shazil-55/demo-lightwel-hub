/**
 * API Configuration
 * Base URL for the backend API
 */

const getApiBaseUrl = (): string => {
  // Check if we're in development
  // const isDev = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
  
  // if (!isDev) {
  //   return 'http://localhost:8000/api/v_1/external/projects';
  // }
  
  // Production URL - adjust based on your deployment
  return 'https://backend.proximahq.io/api/v_1/external/projects';
};

export const API_BASE_URL = getApiBaseUrl();

// API Key for authenticated requests
// In production, this should come from environment variables
export const API_KEY = import.meta.env.VITE_API_KEY || '_=g%C3HktHH!=ozZtj[:P@S=G$';

