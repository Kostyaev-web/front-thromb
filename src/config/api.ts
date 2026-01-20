// Конфигурация API для приложения
// Используется ZeroTier IP адрес вместо localhost

// TODO: Замените на реальный IP адрес из вашей ZeroTier сети
// Бэкенд работает на HTTPS (порт 8443)
// Для dev режима используется HTTPS через прокси Vite
export const API_BASE_URL = "https://10.98.12.125:8443";

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
 * Определяет, запущено ли приложение на GitHub Pages
 */
export const isGitHubPages = typeof window !== 'undefined' && 
  (window.location.hostname.includes('github.io') || 
   window.location.hostname.includes('github.com'));

/**
 * Получить базовый URL для API запросов
 * - В dev режиме (Vite) - пустая строка (используется прокси)
 * - На GitHub Pages - используем localhost (как указано в требованиях)
 * - В Tauri production - прямой URL к ZeroTier бэкенду
 */
export function getApiBaseUrl(): string {
  // Dev режим - используем прокси через Vite
  const isViteDevServer = (window.location.protocol === 'https:' || window.location.protocol === 'http:') 
    && window.location.port === '5173';
  
  if (isViteDevServer) {
    return ''; // Относительный путь через прокси Vite
  }
  
  // GitHub Pages - используем localhost как указано в требованиях
  // ВАЖНО: Это будет работать только если пользователь настроит прокси локально
  // или запустит бэкенд на localhost:8000
  if (isGitHubPages) {
    return 'http://localhost:8000'; // Используем localhost для GitHub Pages
  }
  
  // Tauri production - прямой URL к ZeroTier бэкенду
  if (isTauri) {
    return API_BASE_URL;
  }
  
  // По умолчанию - прямой URL
  return API_BASE_URL;
}

/**
 * Получить базовый URL для изображений
 * - В dev режиме (Vite) - /images (используется прокси)
 * - На GitHub Pages - используем localhost:9000
 * - В остальных случаях - IMAGES_BASE_URL
 */
export function getImagesBaseUrl(): string {
  // Dev режим - используем прокси через Vite
  const isViteDevServer = (window.location.protocol === 'https:' || window.location.protocol === 'http:') 
    && window.location.port === '5173';
  
  if (isViteDevServer) {
    return '/images'; // Относительный путь через прокси Vite
  }
  
  if (isGitHubPages) {
    return 'http://localhost:9000'; // Используем localhost для GitHub Pages
  }
  return IMAGES_BASE_URL;
}

/**
 * Преобразует URL изображения
 * @param imageUrl - URL изображения с бэкенда (может быть localhost:9000 или полный URL)
 * @returns Правильный URL изображения
 */
export function normalizeImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl || imageUrl.trim() === '') {
    return '';
  }

  // Если это уже data URI, возвращаем как есть
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  const imagesBaseUrl = getImagesBaseUrl();
  const isViteDevServer = (window.location.protocol === 'https:' || window.location.protocol === 'http:') 
    && window.location.port === '5173';

  // Если это полный URL с адресом сервера изображений, извлекаем путь
  if (imageUrl.startsWith('http://10.98.12.125:9000') || 
      imageUrl.startsWith('http://localhost:9000') ||
      imageUrl.startsWith('https://10.98.12.125:9000')) {
    // В dev режиме преобразуем в относительный путь через прокси
    if (isViteDevServer) {
      const url = new URL(imageUrl);
      return `/images${url.pathname}${url.search}`;
    }
    // В production возвращаем как есть
    return imageUrl;
  }

  // Если это уже относительный путь через прокси, возвращаем как есть
  if (isViteDevServer && imageUrl.startsWith('/images')) {
    return imageUrl;
  }

  // Если это относительный путь, добавляем базовый URL
  if (imageUrl.startsWith('/')) {
    return `${imagesBaseUrl}${imageUrl}`;
  }

  // Если это localhost, заменяем на правильный адрес
  if (imageUrl.includes('localhost:9000') || imageUrl.includes('127.0.0.1:9000')) {
    if (isViteDevServer) {
      // Извлекаем путь из URL
      const match = imageUrl.match(/https?:\/\/[^\/]+(\/.*)/);
      if (match) {
        return `/images${match[1]}`;
      }
    }
    return imageUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1):9000/, imagesBaseUrl);
  }

  // Если это полный URL с другим хостом, возвращаем как есть
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // В остальных случаях считаем, что это относительный путь
  return `${imagesBaseUrl}/${imageUrl}`;
}