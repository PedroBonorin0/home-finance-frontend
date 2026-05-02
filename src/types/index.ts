export type CategoryType = 'income' | 'outcome';
export type PaymentMethod = 'Pix' | 'Credit' | 'Debit';
export type People = 'Pedro'| 'Clarissa';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  created_at: string;
  updated_at: string;
}

export interface Record {
  id: string;
  category_id: string;
  responsible: People;
  value: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export interface RecordFilters {
  category_id?: string;
  method?: PaymentMethod;
  responsible?: People;
  date_from?: string;
  date_to?: string;
}

export interface Summary {
  total_income: number;
  total_outcome: number;
  balance: number;
  count: number;
}

export interface CreateCategoryDto {
  name: string;
  type: CategoryType;
}

export interface CreateRecordDto {
  category_id: string;
  responsible: People;
  value: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
}
