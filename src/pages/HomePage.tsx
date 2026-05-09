import React, { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchRecords, fetchSummary, setFilters, clearFilters, deleteRecord, deleteRecordByInstallmentGroup, fetchInstallmentGroups } from '../store/slices/recordsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { fetchConfig } from '../store/slices/configSlice';
import { formatCurrency, formatDate, methodLabel } from '../utils/formatters';
import { useToast } from '../components/ui/Toast';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  TrendingUp, TrendingDown, Wallet, ChevronLeft, ChevronRight,
  Filter, Trash2, Loader2, AlertCircle, RotateCcw, ArrowRightLeft
} from 'lucide-react';
import type { PaymentMethod, People } from '../types';

const METHODS: PaymentMethod[] = ['Pix', 'Credit', 'Debit'];
const PEOPLE: People[] = ['Pedro', 'Clarissa'];

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, summary, filters, loading, summaryLoading, installmentGroups } = useAppSelector(s => s.records);
  const { items: categories } = useAppSelector(s => s.categories);
  const { config } = useAppSelector(s => s.config);
  const { show } = useToast();

  // Derive the current reference month from filters
  const refDate = filters.date_from ? new Date(filters.date_from + 'T12:00:00') : new Date();

  const load = useCallback(() => {
    dispatch(fetchRecords());
    dispatch(fetchSummary());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchInstallmentGroups());
    dispatch(fetchConfig());
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

  const handleDelete = async (record: any) => {
    if (record.installment_group_id && record.installment_number) {
      const group = installmentGroups.find(g => g.id === record.installment_group_id);
      const total = group?.installments ?? '?';
      const deleteAll = confirm(`Esta e a parcela ${record.installment_number}/${total}. Deseja excluir TODAS as parcelas?`);
      if (!deleteAll) return;
      try {
        await dispatch(deleteRecordByInstallmentGroup(record.installment_group_id)).unwrap();
        dispatch(fetchSummary());
        show('Parcelas removidas', 'success');
      } catch {
        show('Erro ao remover parcelas', 'error');
      }
    } else {
      if (!confirm('Remover este registro?')) return;
      try {
        await dispatch(deleteRecord(record.id)).unwrap();
        dispatch(fetchSummary());
        show('Registro removido', 'success');
      } catch {
        show('Erro ao remover registro', 'error');
      }
    }
  };

  const monthLabel = refDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  // Transfer calculation
  const pedroPct = config?.pedro_percentage ?? 50;
  const clarissaPct = config?.clarissa_percentage ?? 50;
  const outcomeRecords = items.filter(r => r.categories?.type === 'outcome');
  const pedroPaid = outcomeRecords.filter(r => r.responsible === 'Pedro').reduce((s, r) => s + r.value, 0);
  const clarissaPaid = outcomeRecords.filter(r => r.responsible === 'Clarissa').reduce((s, r) => s + r.value, 0);
  const totalOutcome = summary?.total_outcome ?? 0;
  const pedroShouldPay = totalOutcome * pedroPct / 100;
  const clarissaShouldPay = totalOutcome * clarissaPct / 100;
  const pedroDiff = pedroShouldPay - pedroPaid;
  const transferAmount = Math.abs(pedroDiff);
  const transferFrom = pedroDiff < 0 ? 'Clarissa' : 'Pedro';
  const transferTo = pedroDiff < 0 ? 'Pedro' : 'Clarissa';

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

      {/* Transfer calculation */}
      {summary && totalOutcome > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <ArrowRightLeft size={16} style={{ color: 'var(--accent)' }} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              color: 'var(--text)',
            }}>
              Acerto do Mês
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Total de Despesas</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(totalOutcome)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>
                Pedro <span style={{ color: 'var(--accent)', fontWeight: 600 }}>({pedroPct}%)</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                Deve pagar: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{formatCurrency(pedroShouldPay)}</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Pagou: <span style={{ color: 'var(--outcome)', fontWeight: 600 }}>{formatCurrency(pedroPaid)}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>
                Clarissa <span style={{ color: 'var(--income)', fontWeight: 600 }}>({clarissaPct}%)</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                Deve pagar: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{formatCurrency(clarissaShouldPay)}</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Pagou: <span style={{ color: 'var(--outcome)', fontWeight: 600 }}>{formatCurrency(clarissaPaid)}</span>
              </div>
            </div>
          </div>
          {transferAmount > 0 && (
            <div style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '0.9375rem',
            }}>
              <ArrowRightLeft size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text)' }}>{transferFrom}</strong> deve transferir{' '}
                <strong style={{ color: 'var(--accent)' }}>{formatCurrency(transferAmount)}</strong> para{' '}
                <strong style={{ color: 'var(--text)' }}>{transferTo}</strong>
              </span>
            </div>
          )}
        </div>
      )}

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
          <label className="form-label">Responsavel</label>
          <select className="form-select" value={filters.responsible ?? ''}
            onChange={e => dispatch(setFilters({ ...filters, responsible: (e.target.value as People) || undefined }))}>
            <option value="">Todos</option>
            {PEOPLE.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ flex: '1 1 160px' }}>
          <label className="form-label">Parcelas</label>
          <select className="form-select" value={filters.installment_group_id ?? ''}
            onChange={e => dispatch(setFilters({ ...filters, installment_group_id: e.target.value || undefined }))}>
            <option value="">Todas</option>
            {installmentGroups.map(ig => (
              <option key={ig.id} value={ig.id}>
                {ig.installments}x {formatCurrency(ig.installment_value)} - {ig.description ?? 'Sem descricao'}
              </option>
            ))}
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
                <th>Responsável</th>
                <th>Método</th>
                <th>Observações</th>
                <th>Parcelas</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th style={{ width: 48 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="loading-row">
                  <td colSpan={8}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-muted)' }}>
                      <Loader2 size={18} className="spin" /> Carregando...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8}>
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
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {record.responsible ?? '—'}
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
                    <td>
                      {record.installment_group_id && record.installment_number ? (() => {
                        const group = installmentGroups.find(g => g.id === record.installment_group_id);
                        const total = group?.installments ?? '?';
                        return (
                          <span className="badge badge-credit" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                            {record.installment_number}/{total}
                          </span>
                        );
                      })() : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8125rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.9375rem',
                      color: isIncome ? 'var(--income)' : 'var(--outcome)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {isIncome ? '+' : '-'}{formatCurrency(record.value)}
                    </td>
                    <td>
                      <button className="btn-icon" style={{ borderColor: 'transparent' }}
                        onClick={() => handleDelete(record)} title="Remover">
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
