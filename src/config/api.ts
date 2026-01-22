// Конфигурация API для приложения
// Используется ZeroTier IP адрес вместо localhost

// TODO: Замените на реальный IP адрес из вашей ZeroTier сети
const ZEROTIER_IP = '10.98.12.125';
const API_PORT = 8443;
const IMAGES_PORT = 9000;

// Бэкенд работает на HTTPS (порт 8443)
// Для dev режима используется HTTPS через прокси Vite
export const API_BASE_URL = `https://${ZEROTIER_IP}:${API_PORT}`;

// Базовый URL для изображений (порт 9000)
export const IMAGES_BASE_URL = `http://${ZEROTIER_IP}:${IMAGES_PORT}`;

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
 * - В production - прямой URL к ZeroTier бэкенду
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
  
  // По умолчанию - прямой URL к ZeroTier бэкенду
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

  const isViteDevServer = (window.location.protocol === 'https:' || window.location.protocol === 'http:') 
    && window.location.port === '5173';

  // В dev режиме: преобразуем все URL сервера изображений в прокси /images
  if (isViteDevServer) {
    // Если это уже относительный путь через прокси, возвращаем как есть
    if (imageUrl.startsWith('/images')) {
      return imageUrl;
    }

    // Проверяем все варианты URL сервера изображений
    const imageServerPatterns = [
      `http://localhost:${IMAGES_PORT}`,
      `https://localhost:${IMAGES_PORT}`,
      `http://127.0.0.1:${IMAGES_PORT}`,
      `https://127.0.0.1:${IMAGES_PORT}`,
      `http://${ZEROTIER_IP}:${IMAGES_PORT}`,
      `https://${ZEROTIER_IP}:${IMAGES_PORT}`,
    ];

    for (const pattern of imageServerPatterns) {
      if (imageUrl.startsWith(pattern)) {
        try {
          const url = new URL(imageUrl);
          return `/images${url.pathname}${url.search || ''}${url.hash || ''}`;
        } catch (e) {
          // Если не удалось распарсить URL, извлекаем путь вручную
          const pathMatch = imageUrl.match(/https?:\/\/[^\/]+(\/.*)/);
          if (pathMatch) {
            return `/images${pathMatch[1]}`;
          }
        }
      }
    }

    // Если это относительный путь (начинается с /), добавляем префикс /images
    if (imageUrl.startsWith('/')) {
      return `/images${imageUrl}`;
    }
  }

  // Для production или других режимов
  const imagesBaseUrl = getImagesBaseUrl();

  // Если это полный URL с адресом сервера изображений
  if (imageUrl.startsWith(`http://${ZEROTIER_IP}:${IMAGES_PORT}`) || 
      imageUrl.startsWith(`https://${ZEROTIER_IP}:${IMAGES_PORT}`)) {
    return imageUrl;
  }

  // Если это localhost, заменяем на правильный адрес
  if (imageUrl.includes('localhost:9000') || imageUrl.includes('127.0.0.1:9000')) {
    return imageUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1):9000/, imagesBaseUrl);
  }

  // Если это относительный путь, добавляем базовый URL
  if (imageUrl.startsWith('/')) {
    return `${imagesBaseUrl}${imageUrl}`;
  }

  // Если это полный URL с другим хостом, возвращаем как есть
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // В остальных случаях считаем, что это относительный путь
  return `${imagesBaseUrl}/${imageUrl}`;
}
