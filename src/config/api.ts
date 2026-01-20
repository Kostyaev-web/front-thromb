// Конфигурация API для Tauri приложения
// Используется ZeroTier IP адрес вместо localhost

export const API_BASE_URL = "http://10.98.12.125:8000";

// Базовый URL для изображений (порт 9000)
export const IMAGES_BASE_URL = "http://10.98.12.125:9000";

export const isTauri = typeof window !== 'undefined' && (
  '__TAURI__' in (window as Window) || 
  (window as any).__TAURI_INTERNALS__ !== undefined ||
  (window as any).__TAURI_METADATA__ !== undefined ||
  (typeof navigator !== 'undefined' && navigator.userAgent.includes('Tauri')) ||
  // Проверка через переменную окружения Vite
  (import.meta.env && (import.meta.env as any).TAURI_PLATFORM !== undefined)
);

/**
 * Преобразует URL изображения, заменяя localhost на правильный IP адрес
 * @param imageUrl - URL изображения с бэкенда (может быть localhost:9000 или полный URL)
 * @returns Правильный URL изображения с IP адресом ZeroTier
 */
export function normalizeImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl || imageUrl.trim() === '') {
    return '';
  }

  // Если это уже data URI или полный URL с правильным IP, возвращаем как есть
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('http://10.98.12.125:9000')) {
    return imageUrl;
  }

  // Если это относительный путь, добавляем базовый URL
  if (imageUrl.startsWith('/')) {
    return `${IMAGES_BASE_URL}${imageUrl}`;
  }

  // Если это localhost, заменяем на правильный IP
  if (imageUrl.includes('localhost:9000') || imageUrl.includes('127.0.0.1:9000')) {
    return imageUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1):9000/, IMAGES_BASE_URL);
  }

  // Если это полный URL с другим хостом, возвращаем как есть
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // В остальных случаях считаем, что это относительный путь
  return `${IMAGES_BASE_URL}/${imageUrl}`;
}

// Логирование для отладки
if (typeof window !== 'undefined') {
  const win = window as Window & {
    __TAURI__?: any;
    __TAURI_INTERNALS__?: any;
    __TAURI_METADATA__?: any;
  };
  
  console.log('🔍 Tauri Detection:', {
    isTauri,
    hasTauri: '__TAURI__' in win,
    hasInternals: win.__TAURI_INTERNALS__ !== undefined,
    hasMetadata: win.__TAURI_METADATA__ !== undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    API_BASE_URL,
    IMAGES_BASE_URL,
  });
}

