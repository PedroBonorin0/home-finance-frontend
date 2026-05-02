export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR').format(new Date(y, m - 1, d));
};

export const methodLabel: Record<string, string> = {
  Pix: 'Pix',
  Credit: 'Crédito',
  Debit: 'Débito',
};

export const typeLabel: Record<string, string> = {
  income: 'Receita',
  outcome: 'Despesa',
};

export const monthName = (date: Date) =>
  date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
