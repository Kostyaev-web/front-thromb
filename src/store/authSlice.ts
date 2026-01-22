import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../api/auth';

// Загружаем токен из localStorage при инициализации
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
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
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

