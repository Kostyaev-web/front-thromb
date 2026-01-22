import { axiosInstance } from './axiosConfig';

export interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  date_joined: string;
}

export interface UserCreate {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

/**
 * Получить CSRF токен (автоматически получается при запросе публичного ключа)
 */
export async function getCsrfToken(): Promise<void> {
  await axiosInstance.get('/users/csrf-token/');
}

/**
 * Вход пользователя
 * Сервер шифрует токен RSA, клиент отправляет обычные username и password
 */
export async function login(username: string, password: string): Promise<{ user: User; token: string }> {
  try {
    // Получаем CSRF токен (автоматически устанавливается при запросе публичного ключа)
    await getCsrfToken();
    
    // Отправляем ОБЫЧНЫЕ (незашифрованные) username и password
    // Сервер сам проверит их и создаст зашифрованный токен
    const response = await axiosInstance.post<User>('/users/login/', {
      username: username,
      password: password,
    });
    
    // Получаем зашифрованный токен из заголовка X-Auth-Token
    const authToken = response.headers['x-auth-token'];
    if (!authToken) {
      console.warn('Токен не получен в заголовке X-Auth-Token');
      // Пробуем альтернативные заголовки
      const altToken = response.headers['X-Auth-Token'] || 
                       response.headers['Authorization']?.replace('Bearer ', '');
      if (altToken) {
        return { user: response.data, token: altToken };
      }
    }
    
    if (authToken) {
      // Сохраняем токен для использования в последующих запросах
      // Токен уже зашифрован сервером, мы его просто храним
      return { user: response.data, token: authToken };
    }
    
    // Если токена нет, но есть cookie session_id, то всё равно возвращаем пользователя
    // Cookie-based авторизация будет работать автоматически
    return { user: response.data, token: '' };
  } catch (error: any) {
    console.error('Ошибка входа:', error);
    console.error('Детали ошибки:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers,
    });
    
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.response?.data?.non_field_errors?.[0] ||
                          'Неверные данные для входа';
      throw new Error(errorMessage);
    }
    throw new Error(error.message || 'Ошибка при входе в систему');
  }
}

/**
 * Регистрация нового пользователя
 */
export async function register(userData: UserCreate): Promise<void> {
  try {
    await axiosInstance.post('/users/register/', userData);
  } catch (error: any) {
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.detail || error.response.data?.message || 'Ошибка регистрации';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * Выход пользователя
 */
export async function logout(authToken?: string): Promise<void> {
  try {
    // Получаем CSRF токен перед логаутом
    await getCsrfToken();
    
    // Отправляем токен в заголовке для удаления сессии
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['X-Auth-Token'] = authToken;
    }
    
    await axiosInstance.post('/users/logout/', {}, { headers });
    
    // Очищаем токен из localStorage
    try {
      localStorage.removeItem('authState');
    } catch {
      // Игнорируем ошибки
    }
  } catch (error: any) {
    // Игнорируем ошибки при выходе, но логируем
    console.error('Ошибка при выходе:', error);
    // Всё равно очищаем токен из localStorage
    try {
      localStorage.removeItem('authState');
    } catch {
      // Игнорируем ошибки
    }
  }
}

/**
 * Получить профиль текущего пользователя
 */
export async function getProfile(): Promise<User> {
  const response = await axiosInstance.get<User>('/users/profile/');
  return response.data;
}

/**
 * Обновить профиль пользователя
 */
export async function updateProfile(userData: Partial<User>): Promise<User> {
  try {
    const response = await axiosInstance.put<User>('/users/profile/update/', userData);
    
    // Если ответ пустой или не содержит username, возвращаем данные, которые отправили (обогащенные)
    if (!response.data || !response.data.username) {
      // Перезагружаем профиль для получения актуальных данных
      const profile = await getProfile();
      return profile;
    }
    
    return response.data;
  } catch (error: any) {
    // Если ошибка парсинга, но статус 200/204, перезагружаем профиль
    if (error.response && (error.response.status === 200 || error.response.status === 204)) {
      const profile = await getProfile();
      return profile;
    }
    throw error;
  }
}

