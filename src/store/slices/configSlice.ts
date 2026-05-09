import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { configApi } from '../../services/api';
import type { SplitConfig } from '../../types';

interface ConfigState {
  config: SplitConfig | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: ConfigState = {
  config: null,
  loading: false,
  saving: false,
  error: null,
};

export const fetchConfig = createAsyncThunk(
  'config/fetch',
  () => configApi.get()
);

export const updateConfig = createAsyncThunk(
  'config/update',
  (config: SplitConfig) => configApi.update(config)
);

const slice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchConfig.pending, s => { s.loading = true; s.error = null; })
      .addCase(fetchConfig.fulfilled, (s, a) => { s.loading = false; s.config = a.payload; })
      .addCase(fetchConfig.rejected, (s, a) => { s.loading = false; s.error = a.error.message ?? 'Erro'; })

      .addCase(updateConfig.pending, s => { s.saving = true; })
      .addCase(updateConfig.fulfilled, (s, a) => { s.saving = false; s.config = a.payload; })
      .addCase(updateConfig.rejected, (s, a) => { s.saving = false; s.error = a.error.message ?? 'Erro'; });
  },
});

export default slice.reducer;
