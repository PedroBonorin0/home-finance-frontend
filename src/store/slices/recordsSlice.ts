import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { recordsApi } from '../../services/api';
import type { CreateRecordDto, Record, RecordFilters, Summary } from '../../types';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const now = new Date();

interface RecordsState {
  items: Record[];
  summary: Summary | null;
  filters: RecordFilters;
  loading: boolean;
  summaryLoading: boolean;
  error: string | null;
}

const initialState: RecordsState = {
  items: [],
  summary: null,
  filters: {
    date_from: format(startOfMonth(now), 'yyyy-MM-dd'),
    date_to: format(endOfMonth(now), 'yyyy-MM-dd'),
  },
  loading: false,
  summaryLoading: false,
  error: null,
};

export const fetchRecords = createAsyncThunk(
  'records/fetchAll',
  (_: void, { getState }) => {
    const state = getState() as { records: RecordsState };
    return recordsApi.getAll(state.records.filters);
  }
);

export const fetchSummary = createAsyncThunk(
  'records/fetchSummary',
  (_: void, { getState }) => {
    const state = getState() as { records: RecordsState };
    return recordsApi.getSummary(state.records.filters);
  }
);

export const createRecord = createAsyncThunk(
  'records/create',
  (dto: CreateRecordDto) => recordsApi.create(dto)
);

export const updateRecord = createAsyncThunk(
  'records/update',
  ({ id, dto }: { id: string; dto: Partial<CreateRecordDto> }) =>
    recordsApi.update(id, dto)
);

export const deleteRecord = createAsyncThunk(
  'records/delete',
  (id: string) => recordsApi.remove(id).then(() => id)
);

const slice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<RecordFilters>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      const now = new Date();
      state.filters = {
        date_from: format(startOfMonth(now), 'yyyy-MM-dd'),
        date_to: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchRecords.pending, s => { s.loading = true; s.error = null; })
      .addCase(fetchRecords.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchRecords.rejected, (s, a) => { s.loading = false; s.error = a.error.message ?? 'Erro'; })

      .addCase(fetchSummary.pending, s => { s.summaryLoading = true; })
      .addCase(fetchSummary.fulfilled, (s, a) => { s.summaryLoading = false; s.summary = a.payload; })
      .addCase(fetchSummary.rejected, s => { s.summaryLoading = false; })

      .addCase(createRecord.fulfilled, (s, a) => { s.items.unshift(a.payload); })

      .addCase(updateRecord.fulfilled, (s, a) => {
        const idx = s.items.findIndex(r => r.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      })

      .addCase(deleteRecord.fulfilled, (s, a) => {
        s.items = s.items.filter(r => r.id !== a.payload);
      });
  },
});

export const { setFilters, clearFilters } = slice.actions;
export default slice.reducer;
