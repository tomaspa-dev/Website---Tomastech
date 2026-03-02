/**
 * billing-api.ts — Cliente API para Neon PostgreSQL via Netlify Functions
 * 
 * Este módulo expone las mismas interfaces que billing-store.ts pero
 * conecta con la BD real en producción. En desarrollo local, sigue
 * usando localStorage como fallback.
 */

// Detectar si estamos en producción (Netlify) o dev local
const IS_PRODUCTION = typeof window !== 'undefined' && (
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  !window.location.hostname.includes('192.168.')
);

const API_URL = '/.netlify/functions/api';

/**
 * Llama a la API de Netlify Functions
 */
export async function apiCall(action: string, data?: any): Promise<any> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Verifica si debemos usar la API (producción) o localStorage (dev)
 */
export function shouldUseAPI(): boolean {
  return IS_PRODUCTION;
}
