import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { categoriesApi } from '../../services/api';
import type { Category, CreateCategoryDto } from '../../types';

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = { items: [], loading: false, error: null };

export const fetchCategories = createAsyncThunk('categories/fetchAll', () =>
  categoriesApi.getAll()
);

export const createCategory = createAsyncThunk(
  'categories/create',
  (dto: CreateCategoryDto) => categoriesApi.create(dto)
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  ({ id, dto }: { id: string; dto: Partial<CreateCategoryDto> }) =>
    categoriesApi.update(id, dto)
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  (id: string) => categoriesApi.remove(id).then(() => id)
);

const slice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchCategories.pending, s => { s.loading = true; s.error = null; })
      .addCase(fetchCategories.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchCategories.rejected, (s, a) => { s.loading = false; s.error = a.error.message ?? 'Erro'; })

      .addCase(createCategory.fulfilled, (s, a) => { s.items.push(a.payload); })

      .addCase(updateCategory.fulfilled, (s, a) => {
        const idx = s.items.findIndex(c => c.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      })

      .addCase(deleteCategory.fulfilled, (s, a) => {
        s.items = s.items.filter(c => c.id !== a.payload);
      });
  },
});

export default slice.reducer;
