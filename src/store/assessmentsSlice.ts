import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';
import type { RootState } from './store';
import type {
  RiskAssessment,
  RiskAssessmentList,
  RiskAssessmentUpdate,
  AssessmentSymptom,
  PatchedAssessmentSymptom,
  DeepVeinThrombosisListParams,
} from '../api/Api';

// Вспомогательная функция для обработки ошибок API
const extractErrorMessage = (error: any, defaultMessage: string): string => {
  if (error.response?.data) {
    if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
      return `Ошибка ${error.response.status}: ${error.response.statusText}`;
    }
    if (error.response.data.detail) {
      return error.response.data.detail;
    }
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    if (error.response.data.message) {
      return error.response.data.message;
    }
  }
  return defaultMessage;
};

export interface AssessmentsState {
  currentDraft: RiskAssessment | null;
  assessmentsList: RiskAssessmentList[];
  currentAssessment: RiskAssessment | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
  };
  count: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const initialState: AssessmentsState = {
  currentDraft: null,
  assessmentsList: [],
  currentAssessment: null,
  loading: false,
  error: null,
  filters: {},
  count: 0,
  hasNext: false,
  hasPrevious: false,
};

// Получение информации о корзине (черновике)
export const getCartInfo = createAsyncThunk(
  'assessments/getCartInfo',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Получаем информацию о корзине (возвращает assessment_id и количество элементов)
      const response = await api.api.cartInfoRetrieve();
      // response.data должен содержать { assessment_id: number, items_count: number }
      const cartInfo = response.data as any;
      
      if (cartInfo && cartInfo.assessment_id) {
        // Получаем детальную информацию о черновике по ID
        const detailResult = await dispatch(getAssessmentDetail(cartInfo.assessment_id));
        return { 
          draft: detailResult.payload as RiskAssessment,
          itemsCount: cartInfo.items_count || 0
        };
      }
      
      return { draft: null, itemsCount: 0 };
    } catch (error: any) {
      // Если корзина пуста (404), это нормально
      if (error.response?.status === 404) {
        return { draft: null, itemsCount: 0 };
      }
      return rejectWithValue(extractErrorMessage(error, 'Ошибка получения корзины'));
    }
  }
);

// Получение списка заявок
export const getAssessmentsList = createAsyncThunk(
  'assessments/getAssessmentsList',
  async (params: DeepVeinThrombosisListParams = {}, { rejectWithValue }) => {
    try {
      const response = await api.api.deepVeinThrombosisList(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Ошибка получения списка заявок'));
    }
  }
);

// Получение детальной информации о заявке
export const getAssessmentDetail = createAsyncThunk(
  'assessments/getAssessmentDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.api.deepVeinThrombosisRetrieve({ id });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Ошибка получения заявки'));
    }
  }
);

// Обновление заявки (тема/комментарий)
export const updateAssessment = createAsyncThunk(
  'assessments/updateAssessment',
  async (
    { id, data }: { id: number; data: RiskAssessmentUpdate },
    { rejectWithValue, dispatch }
  ) => {
    try {
      // Используем PATCH вместо PUT для частичного обновления
      await api.api.deepVeinThrombosisUpdatePartialUpdate({ id }, data);
      
      // После успешного обновления всегда обновляем заявку через getAssessmentDetail
      await dispatch(getAssessmentDetail(id));
      
      // Возвращаем отправленные данные
      return data;
    } catch (error: any) {
      console.error('Ошибка при обновлении заявки:', error);
      
      // Если ошибка парсинга JSON, но статус 200/204, значит операция успешна
      const isJsonError = error.message && (
        error.message.includes('JSON') || 
        error.message.includes('parse') || 
        error.message.includes('Unexpected token') ||
        error.message.includes('Unexpected end')
      );
      
      // Проверяем, был ли запрос успешным, несмотря на ошибку парсинга
      if (isJsonError && error.response) {
        const status = error.response.status;
        if (status === 200 || status === 204) {
          // Статус успешный, но ошибка парсинга - обновляем через getAssessmentDetail
          try {
            await dispatch(getAssessmentDetail(id));
            return data;
          } catch (refreshError) {
            // Если не удалось обновить, возвращаем отправленные данные
            return data;
          }
        }
      }
      
      return rejectWithValue(extractErrorMessage(error, 'Ошибка обновления заявки'));
    }
  }
);

// Формирование заявки (создатель)
export const formAssessment = createAsyncThunk(
  'assessments/formAssessment',
  async (assessmentId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.api.deepVeinThrombosisFormUpdate({ assessmentId });
      // Обновляем заявку после формирования
      await dispatch(getAssessmentDetail(assessmentId));
      return assessmentId;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Ошибка формирования заявки'));
    }
  }
);

// Завершение заявки (модератор)
export const completeAssessment = createAsyncThunk(
  'assessments/completeAssessment',
  async (assessmentId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.api.deepVeinThrombosisCompleteUpdate({ assessmentId });
      // Обновляем заявку после завершения
      await dispatch(getAssessmentDetail(assessmentId));
      return assessmentId;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Ошибка завершения заявки'));
    }
  }
);

// Удаление заявки
export const deleteAssessment = createAsyncThunk(
  'assessments/deleteAssessment',
  async (assessmentId: number, { rejectWithValue }) => {
    try {
      await api.api.deepVeinThrombosisDeleteDestroy({ assessmentId });
      return assessmentId;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Ошибка удаления заявки'));
    }
  }
);

// Обновление симптома в заявке
export const updateAssessmentSymptom = createAsyncThunk(
  'assessments/updateAssessmentSymptom',
  async (
    { id, data }: { id: number; data: AssessmentSymptom | PatchedAssessmentSymptom },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      await api.api.deepVeinThrombosisSymptomsPartialUpdate({ id }, data);
      // Обновляем текущую заявку после успешного обновления симптома
      const state = getState() as RootState;
      const currentAssessment = state.assessments.currentAssessment;
      if (currentAssessment) {
        await dispatch(getAssessmentDetail(currentAssessment.id));
      }
      // Возвращаем данные, которые были отправлены
      return data;
    } catch (error: any) {
      console.error('Ошибка при обновлении симптома:', error);
      
      // Если ошибка парсинга JSON, но статус 200/204, значит операция успешна
      const isJsonError = error.message && (
        error.message.includes('JSON') || 
        error.message.includes('parse') || 
        error.message.includes('Unexpected token')
      );
      
      if (isJsonError && error.response && (error.response.status === 200 || error.response.status === 204)) {
        // Статус успешный, но ошибка парсинга - обновляем через getAssessmentDetail
        try {
          const state = getState() as RootState;
          const currentAssessment = state.assessments.currentAssessment;
          if (currentAssessment) {
            await dispatch(getAssessmentDetail(currentAssessment.id));
          }
          return data;
        } catch (refreshError) {
          return data;
        }
      }
      
      return rejectWithValue(extractErrorMessage(error, 'Ошибка обновления симптома'));
    }
  }
);

// Удаление симптома из заявки
export const deleteAssessmentSymptom = createAsyncThunk(
  'assessments/deleteAssessmentSymptom',
  async (id: number, { rejectWithValue, dispatch, getState }) => {
    try {
      await api.api.deepVeinThrombosisSymptomsDeleteDestroy({ id });
      // Обновляем текущую заявку
      const state = getState() as RootState;
      const currentAssessment = state.assessments.currentAssessment;
      if (currentAssessment) {
        await dispatch(getAssessmentDetail(currentAssessment.id));
        // Обновляем информацию о корзине после удаления симптома
        await dispatch(getCartInfo());
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Ошибка удаления симптома'));
    }
  }
);

// Добавление симптома в черновик
export const addSymptomToDraft = createAsyncThunk(
  'assessments/addSymptomToDraft',
  async (symptomId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.api.symptomsAddToDraftCreate({ symptomId });
      // После добавления обновляем информацию о корзине
      await dispatch(getCartInfo());
      return symptomId;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Ошибка добавления симптома'));
    }
  }
);

const assessmentsSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {
    setCurrentDraft: (state, action: PayloadAction<RiskAssessment | null>) => {
      state.currentDraft = action.payload;
    },
    setCurrentAssessment: (state, action: PayloadAction<RiskAssessment | null>) => {
      state.currentAssessment = action.payload;
    },
    setFilters: (state, action: PayloadAction<AssessmentsState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    clearDraft: (state) => {
      state.currentDraft = null;
    },
  },
  extraReducers: (builder) => {
    // getCartInfo
    builder
      .addCase(getCartInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCartInfo.fulfilled, (state, action) => {
        state.loading = false;
        // Сохраняем черновик в state
        if (action.payload?.draft) {
          state.currentDraft = action.payload.draft;
        } else {
          state.currentDraft = null;
        }
      })
      .addCase(getCartInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentDraft = null;
      });

    // getAssessmentsList
    builder
      .addCase(getAssessmentsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssessmentsList.fulfilled, (state, action) => {
        state.loading = false;
        state.assessmentsList = action.payload.results;
        state.count = action.payload.count;
        state.hasNext = !!action.payload.next;
        state.hasPrevious = !!action.payload.previous;
        // Детали черновика будут загружены отдельно в компоненте при необходимости
      })
      .addCase(getAssessmentsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // getAssessmentDetail
    builder
      .addCase(getAssessmentDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssessmentDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssessment = action.payload;
        // Если это черновик, также обновляем currentDraft
        if (action.payload.status === 'draft') {
          state.currentDraft = action.payload;
        }
      })
      .addCase(getAssessmentDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateAssessment
    builder
      .addCase(updateAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssessment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // formAssessment
    builder
      .addCase(formAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(formAssessment.fulfilled, (state) => {
        state.loading = false;
        // Очищаем черновик после формирования
        state.currentDraft = null;
      })
      .addCase(formAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // completeAssessment
    builder
      .addCase(completeAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeAssessment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(completeAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // deleteAssessment
    builder
      .addCase(deleteAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssessment.fulfilled, (state, action) => {
        state.loading = false;
        // Удаляем заявку из списка
        state.assessmentsList = state.assessmentsList.filter(
          (a) => a.id !== action.payload
        );
        // Если удалили текущую заявку, очищаем
        if (state.currentAssessment?.id === action.payload) {
          state.currentAssessment = null;
        }
        if (state.currentDraft?.id === action.payload) {
          state.currentDraft = null;
        }
      })
      .addCase(deleteAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateAssessmentSymptom
    builder
      .addCase(updateAssessmentSymptom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssessmentSymptom.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateAssessmentSymptom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // deleteAssessmentSymptom
    builder
      .addCase(deleteAssessmentSymptom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssessmentSymptom.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteAssessmentSymptom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // addSymptomToDraft
    builder
      .addCase(addSymptomToDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSymptomToDraft.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addSymptomToDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentDraft,
  setCurrentAssessment,
  setFilters,
  clearFilters,
  clearError,
  clearDraft,
} = assessmentsSlice.actions;

export default assessmentsSlice.reducer;

