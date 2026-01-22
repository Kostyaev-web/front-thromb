import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Базовый инстанс axios для симптомов и пользователя (без кодогенерации)
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true, // Важно для работы с cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Получение CSRF токена из cookie
const getCsrfToken = (): string | null => {
  const name = 'csrftoken';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Получение CSRF токена из заголовка ответа или cookie
const getCsrfTokenFromResponse = (response: any): void => {
  const csrfToken = response.headers['x-csrftoken'] || getCsrfToken();
  if (csrfToken) {
    document.cookie = `csrftoken=${csrfToken}; path=/`;
  }
};

// Получаем authToken из localStorage для добавления в заголовки
const getAuthToken = (): string | null => {
  try {
    const authState = localStorage.getItem('authState');
    if (authState) {
      const parsed = JSON.parse(authState);
      return parsed.authToken || null;
    }
  } catch {
    // Игнорируем ошибки парсинга
  }
  return null;
};

// Перехватчик запросов - добавляет CSRF токен и Auth Token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const csrfToken = getCsrfToken();
    if (csrfToken && config.headers) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    // Добавляем заголовки Origin и Referer для CSRF защиты
    if (config.headers) {
      config.headers['Origin'] = 'https://localhost:8443';
      config.headers['Referer'] = 'https://localhost:8443';
    }
    
    // Добавляем RSA токен в заголовки, если есть
    const authToken = getAuthToken();
    if (authToken && config.headers) {
      config.headers['X-Auth-Token'] = authToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов - сохраняет CSRF токен и обрабатывает ошибки
axiosInstance.interceptors.response.use(
  (response) => {
    getCsrfTokenFromResponse(response);
    
    // Обрабатываем пустые ответы для PUT/PATCH запросов
    if ((response.config.method === 'put' || response.config.method === 'patch') && 
        (response.data === null || response.data === undefined || response.data === '')) {
      // Если ответ пустой, возвращаем данные из запроса
      response.data = response.config.data ? (typeof response.config.data === 'string' ? JSON.parse(response.config.data) : response.config.data) : {};
    }
    
    return response;
  },
  async (error) => {
    // Обрабатываем ошибки, чтобы не показывать HTML страницы ошибок
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
      // Это HTML страница ошибки Django, преобразуем в JSON ошибку
      error.response.data = {
        detail: `Ошибка ${error.response.status}: ${error.response.statusText}`,
      };
    }
    
    // Обрабатываем ошибки парсинга JSON для PUT/PATCH запросов
    if (error.message && (error.message.includes('JSON') || error.message.includes('parse'))) {
      if (error.response && (error.response.status === 200 || error.response.status === 204)) {
        // Статус успешный, но ошибка парсинга - возвращаем данные из запроса
        error.response.data = error.config?.data ? (typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data) : {};
        return Promise.resolve(error.response);
      }
    }
    
    // Если получили 401, возможно нужно обновить сессию
    if (error.response?.status === 401) {
      // Можно добавить логику для обновления токена или редиректа на логин
    }
    return Promise.reject(error);
  }
);

// Инстанс для сгенерированного API (тоже с поддержкой cookies и CSRF)
export const apiAxiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Те же перехватчики для API инстанса
apiAxiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const csrfToken = getCsrfToken();
    if (csrfToken && config.headers) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    // Добавляем заголовки Origin и Referer для CSRF защиты
    if (config.headers) {
      config.headers['Origin'] = 'https://localhost:8443';
      config.headers['Referer'] = 'https://localhost:8443';
    }
    
    // Добавляем RSA токен в заголовки для сгенерированного API
    const authToken = getAuthToken();
    if (authToken && config.headers) {
      config.headers['X-Auth-Token'] = authToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiAxiosInstance.interceptors.response.use(
  (response) => {
    getCsrfTokenFromResponse(response);
    return response;
  },
  (error) => {
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

