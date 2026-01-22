import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../api/auth';

// Загружаем токен и is_staff из localStorage при инициализации
const loadAuthTokenFromStorage = (): string | null => {
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

// Загружаем is_staff из localStorage
const loadIsStaffFromStorage = (): boolean | null => {
  try {
    const authState = localStorage.getItem('authState');
    if (authState) {
      const parsed = JSON.parse(authState);
      return parsed.is_staff !== undefined ? parsed.is_staff : null;
    }
  } catch {
    return null;
  }
  return null;
};

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authToken: string | null; // Зашифрованный RSA токен от сервера
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  authToken: loadAuthTokenFromStorage(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      if (action.payload === null) {
        state.user = null;
        state.isAuthenticated = false;
        // Очищаем is_staff из localStorage
        try {
          const authState = localStorage.getItem('authState');
          if (authState) {
            const parsed = JSON.parse(authState);
            delete parsed.is_staff;
            localStorage.setItem('authState', JSON.stringify(parsed));
          }
        } catch {
          // Игнорируем ошибки
        }
      } else {
        // Сохраняем старое значение is_staff, если новое не пришло
        const newUser = { ...action.payload };
        const oldIsStaff = state.user?.is_staff !== undefined ? state.user.is_staff : loadIsStaffFromStorage();
        if (newUser.is_staff === undefined && oldIsStaff !== null) {
          newUser.is_staff = oldIsStaff;
        }
        
        // Сохраняем is_staff в localStorage, если оно есть
        if (newUser.is_staff !== undefined) {
          try {
            const authState = localStorage.getItem('authState');
            const parsed = authState ? JSON.parse(authState) : {};
            parsed.is_staff = newUser.is_staff;
            localStorage.setItem('authState', JSON.stringify(parsed));
          } catch {
            // Игнорируем ошибки
          }
        }
        
        state.user = newUser;
        state.isAuthenticated = true;
      }
      state.error = null;
    },
    setAuthToken: (state, action: PayloadAction<string | null>) => {
      state.authToken = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      state.authToken = null;
      // Очищаем токен из localStorage
      try {
        localStorage.removeItem('authState');
      } catch {
        // Игнорируем ошибки
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setUser, setAuthToken, setLoading, setError, logout, clearError } = authSlice.actions;
export default authSlice.reducer;

