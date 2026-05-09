import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { RecordsPage } from './pages/RecordsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ConfigPage } from './pages/ConfigPage';

export const App: React.FC = () => (
  <Provider store={store}>
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="registros" element={<RecordsPage />} />
              <Route path="categorias" element={<CategoriesPage />} />
              <Route path="config" element={<ConfigPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  </Provider>
);
