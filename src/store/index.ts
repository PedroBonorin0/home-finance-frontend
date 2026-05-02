import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from './slices/categoriesSlice';
import recordsReducer from './slices/recordsSlice';

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    records: recordsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
