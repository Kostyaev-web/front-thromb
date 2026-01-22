import { Api, HttpClient } from './Api';
import { apiAxiosInstance } from './axiosConfig';

// Создаем HttpClient с правильной конфигурацией для сгенерированного API
// baseURL пустой, так как пути в сгенерированном API уже содержат /api/
const httpClient = new HttpClient({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Получаем authToken из localStorage
const getAuthToken = (): string | null => {
  try {
    const authState = localStorage.getItem('authState');
    if (authState) {
      const parsed = JSON.parse(authState);
      return parsed.authToken || null;
    }
  } catch {
    return null;
  }
  return null;
};

// Применяем перехватчики напрямую к инстансу axios внутри HttpClient
// Используем тот же подход, что и в axiosConfig
httpClient.instance.interceptors.request.use(
  (config) => {
    const getCsrfToken = (): string | null => {
      const name = 'csrftoken';
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    };
    
    const csrfToken = getCsrfToken();
    if (csrfToken && config.headers) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    // Добавляем заголовки Origin и Referer для CSRF защиты
    if (config.headers) {
      config.headers['Origin'] = 'https://localhost:8443';
      config.headers['Referer'] = 'https://localhost:8443';
    }
    
    // Добавляем RSA токен в заголовки
    const authToken = getAuthToken();
    if (authToken && config.headers) {
      config.headers['X-Auth-Token'] = authToken;
    }
    
    // Для PUT/PATCH запросов на /update/ и /deep-vein-thrombosis-symptoms/ меняем responseType на 'text', чтобы обработать пустые ответы
    if ((config.url?.includes('/update/') || config.url?.includes('/deep-vein-thrombosis-symptoms/')) && 
        (config.method === 'put' || config.method === 'patch')) {
      // Если format не установлен явно в params, меняем responseType на text
      if (config.responseType !== 'text') {
        config.responseType = 'text';
      }
      // Устанавливаем validateStatus для принятия успешных ответов даже с пустым телом
      config.validateStatus = (status: number) => status >= 200 && status < 300;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

httpClient.instance.interceptors.response.use(
  (response) => {
    // Сохраняем CSRF токен из ответа
    const csrfToken = response.headers['x-csrftoken'];
    if (csrfToken) {
      document.cookie = `csrftoken=${csrfToken}; path=/`;
    }
    
    // Обрабатываем пустые ответы или ответы, которые не являются JSON
    // Если статус 204 No Content или тело ответа пустое
    if (response.status === 204 || response.data === null || response.data === undefined) {
      response.data = {};
      return response;
    }
    
    // Если responseType был 'text', значит мы получили raw ответ
    if (typeof response.data === 'string') {
      const trimmed = response.data.trim();
      
      // Пустой ответ или null/undefined в виде строки
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined' || trimmed.length === 0) {
        response.data = {};
        return response;
      }
      
      // Пытаемся распарсить как JSON
      try {
        response.data = JSON.parse(trimmed);
      } catch (e) {
        // Если не удалось распарсить
        if (trimmed.includes('<!DOCTYPE') || trimmed.includes('<html')) {
          // Это HTML ошибка, оставляем как есть для дальнейшей обработки
          console.error('Получен HTML ответ вместо JSON');
        } else {
          // Не HTML и не JSON - возвращаем пустой объект
          console.warn('Не удалось распарсить ответ как JSON, возвращаем пустой объект. Ответ:', trimmed.substring(0, 100));
          response.data = {};
        }
      }
    }
    
    return response;
  },
  (error) => {
    // Обрабатываем ошибки парсинга JSON ДО обработки других ошибок
    const isJsonParseError = error.message && (
      error.message.includes('JSON') || 
      error.message.includes('parse') || 
      error.message.includes('Unexpected token') ||
      error.message.includes('Unexpected end of JSON input')
    );
    
    if (isJsonParseError) {
      // Если это ошибка парсинга JSON, но статус 200/204, значит ответ пустой - это нормально
      if (error.response && (error.response.status === 200 || error.response.status === 204)) {
        // Пробуем обработать raw response data
        const rawData = error.config?.transformResponse ? error.response.data : error.response.data;
        if (!rawData || (typeof rawData === 'string' && rawData.trim() === '')) {
          error.response.data = {};
          return Promise.resolve(error.response);
        }
        // Если есть данные, но они не JSON, возвращаем пустой объект
        error.response.data = {};
        return Promise.resolve(error.response);
      }
    }
    
    // Обрабатываем ошибки, чтобы не показывать HTML страницы ошибок
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
      // Это HTML страница ошибки Django, преобразуем в JSON ошибку
      error.response.data = {
        detail: `Ошибка ${error.response.status}: ${error.response.statusText}`,
      };
    }
    
    return Promise.reject(error);
  }
);

// Создаем инстанс API
export const api = new Api(httpClient);

// Экспортируем типы из API
export * from './Api';

