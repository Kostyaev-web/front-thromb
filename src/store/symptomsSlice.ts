import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Symptom, SymptomsResponse } from '../types';

export interface SymptomsState {
  symptoms: Symptom[];
  currentSymptom: Symptom | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  page: number;
  count: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const initialState: SymptomsState = {
  symptoms: [],
  currentSymptom: null,
  loading: false,
  error: null,
  searchQuery: '',
  page: 1,
  count: 0,
  hasNext: false,
  hasPrevious: false,
};

const symptomsSlice = createSlice({
  name: 'symptoms',
  initialState,
  reducers: {
    setSymptoms: (state, action: PayloadAction<SymptomsResponse>) => {
      state.symptoms = action.payload.results;
      state.count = action.payload.count;
      state.hasNext = !!action.payload.next;
      state.hasPrevious = !!action.payload.previous;
      state.error = null;
    },
    setCurrentSymptom: (state, action: PayloadAction<Symptom | null>) => {
      state.currentSymptom = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSymptoms,
  setCurrentSymptom,
  setLoading,
  setError,
  setSearchQuery,
  setPage,
  clearError,
} = symptomsSlice.actions;

export default symptomsSlice.reducer;

