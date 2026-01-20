import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FiltersState {
  searchQuery: string;
  filterParams: Record<string, any>;
}

const initialState: FiltersState = {
  searchQuery: '',
  filterParams: {},
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilterParams: (state, action: PayloadAction<Record<string, any>>) => {
      state.filterParams = { ...state.filterParams, ...action.payload };
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.filterParams = {};
    },
  },
});

export const { setSearchQuery, setFilterParams, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;

