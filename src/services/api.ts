import axios from 'axios';
import type { Category, InstallmentGroup, Record, RecordFilters, Summary, CreateCategoryDto, CreateRecordDto, SplitConfig } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
});

// ── Categories ──────────────────────────────────────────────────────────────

export const categoriesApi = {
  getAll: (type?: string) =>
    api.get<Category[]>('/categories', { params: type ? { type } : undefined }).then(r => r.data),

  getOne: (id: string) =>
    api.get<Category>(`/categories/${id}`).then(r => r.data),

  create: (dto: CreateCategoryDto) =>
    api.post<Category>('/categories', dto).then(r => r.data),

  update: (id: string, dto: Partial<CreateCategoryDto>) =>
    api.patch<Category>(`/categories/${id}`, dto).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/categories/${id}`).then(r => r.data),
};

// ── Records ─────────────────────────────────────────────────────────────────

export const recordsApi = {
  getAll: (filters?: RecordFilters) =>
    api.get<Record[]>('/records', { params: filters }).then(r => r.data),

  getSummary: (filters?: RecordFilters) =>
    api.get<Summary>('/records/summary', { params: filters }).then(r => r.data),

  getOne: (id: string) =>
    api.get<Record>(`/records/${id}`).then(r => r.data),

  create: (dto: CreateRecordDto) =>
    api.post<Record>('/records', dto).then(r => r.data),

  update: (id: string, dto: Partial<CreateRecordDto>) =>
    api.patch<Record>(`/records/${id}`, dto).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/records/${id}`).then(r => r.data),

  removeByInstallmentGroup: (installmentGroupId: string) =>
    api.delete(`/records/installment-group/${installmentGroupId}`).then(r => r.data),

  updateByInstallmentGroup: (installmentGroupId: string, dto: Partial<CreateRecordDto>) =>
    api.patch<Record[]>(`/records/installment-group/${installmentGroupId}`, dto).then(r => r.data),

  findByInstallmentGroup: (installmentGroupId: string) =>
    api.get<Record[]>(`/records/installment-group/${installmentGroupId}`).then(r => r.data),
};

// ── Config ──────────────────────────────────────────────────────────────────

export const configApi = {
  get: () =>
    api.get<SplitConfig>('/config').then(r => r.data),

  update: (config: SplitConfig) =>
    api.put<SplitConfig>('/config', config).then(r => r.data),
};

export const installmentGroupsApi = {
  getAll: () =>
    api.get<InstallmentGroup[]>('/installment-groups').then(r => r.data),

  getOne: (id: string) =>
    api.get<InstallmentGroup>(`/installment-groups/${id}`).then(r => r.data),

  create: (dto: any) =>
    api.post<InstallmentGroup>('/installment-groups', dto).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/installment-groups/${id}`).then(r => r.data),
};
