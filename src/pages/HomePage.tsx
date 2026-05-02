import React, { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchRecords, fetchSummary, setFilters, clearFilters, deleteRecord } from '../store/slices/recordsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { formatCurrency, formatDate, methodLabel } from '../utils/formatters';
import { useToast } from '../components/ui/Toast';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  TrendingUp, TrendingDown, Wallet, ChevronLeft, ChevronRight,
  Filter, Trash2, Loader2, AlertCircle
} from 'lucide-react';
import type { PaymentMethod } from '../types';

const METHODS: PaymentMethod[] = ['Pix', 'Credit', 'Debit'];

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, summary, filters, loading, summaryLoading } = useAppSelector(s => s.records);
  const { items: categories } = useAppSelector(s => s.categories);
  const { show } = useToast();

  // Derive the current reference month from filters
  const refDate = filters.date_from ? new Date(filters.date_from + 'T12:00:00') : new Date();

  const load = useCallback(() => {
    dispatch(fetchRecords());
    dispatch(fetchSummary());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [filters, load]);

  const navigate = (dir: -1 | 1) => {
    const next = dir === -1 ? subMonths(refDate, 1) : addMonths(refDate, 1);
    dispatch(setFilters({
      ...filters,
      date_from: format(startOfMonth(next), 'yyyy-MM-dd'),
      date_to: format(endOfMonth(next), 'yyyy-MM-dd'),
    }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este registro?')) return;
    try {
      await dispatch(deleteRecord(id)).unwrap();
      dispatch(fetchSummary());
      show('Registro removido', 'success');
    } catch {
      show('Erro ao remover registro', 'error');
    }
  };

  const monthLabel = refDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', marginBottom: 4 }}>
          Visão Geral
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          Acompanhe suas finanças do mês
        </p>
      </div>

      {/* Month navigator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button className="btn-icon" onClick={() => navigate(-1)}>
          <ChevronLeft size={17} />
        </button>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.125rem',
          color: 'var(--text)',
          textTransform: 'capitalize',
          minWidth: 200,
          textAlign: 'center',
        }}>
          {monthLabel}
        </span>
        <button className="btn-icon" onClick={() => navigate(1)}>
          <ChevronRight size={17} />
        </button>
        <button className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: '0.8125rem' }}
          onClick={() => dispatch(clearFilters())}>
          Mês atual
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <SummaryCard
          label="Receitas"
          value={summary?.total_income ?? 0}
          icon={<TrendingUp size={20} />}
          color="var(--income)"
          bg="var(--income-bg)"
          loading={summaryLoading}
        />
        <SummaryCard
          label="Despesas"
          value={summary?.total_outcome ?? 0}
          icon={<TrendingDown size={20} />}
          color="var(--outcome)"
          bg="var(--outcome-bg)"
          loading={summaryLoading}
        />
        <SummaryCard
          label="Saldo"
          value={summary?.balance ?? 0}
          icon={<Wallet size={20} />}
          color={!summary || summary.balance >= 0 ? 'var(--accent)' : 'var(--outcome)'}
          bg={!summary || summary.balance >= 0 ? 'rgba(200,169,110,0.08)' : 'var(--outcome-bg)'}
          loading={summaryLoading}
          highlight
        />
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-end',
        flexWrap: 'wrap',
      }}>
        <Filter size={15} style={{ color: 'var(--text-dim)', marginBottom: 10, flexShrink: 0 }} />

        <div className="form-group" style={{ flex: '1 1 160px' }}>
          <label className="form-label">Categoria</label>
          <select className="form-select" value={filters.category_id ?? ''}
            onChange={e => dispatch(setFilters({ ...filters, category_id: e.target.value || undefined }))}>
            <option value="">Todas</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ flex: '1 1 130px' }}>
          <label className="form-label">Método</label>
          <select className="form-select" value={filters.method ?? ''}
            onChange={e => dispatch(setFilters({ ...filters, method: (e.target.value as PaymentMethod) || undefined }))}>
            <option value="">Todos</option>
            {METHODS.map(m => <option key={m} value={m}>{methodLabel[m]}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ flex: '1 1 140px' }}>
          <label className="form-label">De</label>
          <input className="form-input" type="date" value={filters.date_from ?? ''}
            onChange={e => dispatch(setFilters({ ...filters, date_from: e.target.value || undefined }))} />
        </div>

        <div className="form-group" style={{ flex: '1 1 140px' }}>
          <label className="form-label">Até</label>
          <input className="form-input" type="date" value={filters.date_to ?? ''}
            onChange={e => dispatch(setFilters({ ...filters, date_to: e.target.value || undefined }))} />
        </div>

        <button className="btn btn-ghost" onClick={() => dispatch(clearFilters())}
          style={{ marginBottom: 1, flexShrink: 0 }}>
          Limpar
        </button>
      </div>

      {/* Records table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Categoria</th>
                <th>Método</th>
                <th>Observações</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th style={{ width: 48 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="loading-row">
                  <td colSpan={6}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-muted)' }}>
                      <Loader2 size={18} className="spin" /> Carregando...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <AlertCircle size={36} />
                      <p>Nenhum registro encontrado para este período</p>
                    </div>
                  </td>
                </tr>
              ) : items.map(record => {
                const isIncome = record.categories?.type === 'income';
                return (
                  <tr key={record.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {formatDate(record.date)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          background: isIncome ? 'var(--income)' : 'var(--outcome)',
                        }} />
                        {record.categories?.name ?? '—'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${record.method.toLowerCase()}`}>
                        {methodLabel[record.method]}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 200 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {record.notes ?? '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.9375rem',
                      color: isIncome ? 'var(--income)' : 'var(--outcome)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {isIncome ? '+' : '-'}{formatCurrency(record.value)}
                    </td>
                    <td>
                      <button className="btn-icon" style={{ borderColor: 'transparent' }}
                        onClick={() => handleDelete(record.id)} title="Remover">
                        <Trash2 size={15} style={{ color: 'var(--text-dim)' }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && items.length > 0 && (
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            fontSize: '0.8125rem',
            color: 'var(--text-dim)',
          }}>
            {items.length} {items.length === 1 ? 'registro' : 'registros'}
          </div>
        )}
      </div>
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  loading?: boolean;
  highlight?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon, color, bg, loading, highlight }) => (
  <div className="card" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    borderColor: highlight ? 'var(--border-light)' : undefined,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <div style={{ padding: 8, borderRadius: 8, background: bg, color }}>
        {icon}
      </div>
    </div>
    {loading ? (
      <div style={{ height: 32, display: 'flex', alignItems: 'center' }}>
        <div className="spinner" style={{ width: 18, height: 18 }} />
      </div>
    ) : (
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.625rem',
        color: highlight ? color : 'var(--text)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {formatCurrency(value)}
      </div>
    )}
  </div>
);
