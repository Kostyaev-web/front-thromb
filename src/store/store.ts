import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from './filtersSlice';
import authReducer from './authSlice';
import symptomsReducer from './symptomsSlice';
import assessmentsReducer from './assessmentsSlice';

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    auth: authReducer,
    symptoms: symptomsReducer,
    assessments: assessmentsReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

