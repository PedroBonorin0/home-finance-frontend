import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchRecords, createRecord, updateRecord, deleteRecord, fetchSummary } from '../store/slices/recordsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { formatCurrency, formatDate, methodLabel } from '../utils/formatters';
import { useToast } from '../components/ui/Toast';
import { Plus, Pencil, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import type { CreateRecordDto, PaymentMethod, Record } from '../types';

const METHODS: PaymentMethod[] = ['Pix', 'Credit', 'Debit'];

const emptyForm = (): CreateRecordDto => ({
  category_id: '',
  value: 0,
  responsible: 'Pedro',
  method: 'Pix',
  date: new Date().toISOString().split('T')[0],
  notes: '',
});

export const RecordsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector(s => s.records);
  const { items: categories } = useAppSelector(s => s.categories);
  const { show } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record | null>(null);
  const [form, setForm] = useState<CreateRecordDto>(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchRecords());
  }, [dispatch]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (r: Record) => {
    setEditing(r);
    setForm({
      category_id: r.category_id,
      value: r.value,
      responsible: r.responsible,
      method: r.method,
      date: r.date,
      notes: r.notes ?? '',
    });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id) return show('Selecione uma categoria', 'error');
    if (!form.value || form.value <= 0) return show('Informe um valor válido', 'error');
    setSaving(true);
    try {
      if (editing) {
        await dispatch(updateRecord({ id: editing.id, dto: form })).unwrap();
        show('Registro atualizado', 'success');
      } else {
        await dispatch(createRecord(form)).unwrap();
        dispatch(fetchSummary());
        show('Registro criado', 'success');
      }
      closeModal();
    } catch (err: any) {
      show(err?.message ?? 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este registro?')) return;
    try {
      await dispatch(deleteRecord(id)).unwrap();
      dispatch(fetchSummary());
      show('Registro removido', 'success');
    } catch {
      show('Erro ao remover', 'error');
    }
  };

  const set = (k: keyof CreateRecordDto, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', marginBottom: 4 }}>
            Registros
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Gerencie suas receitas e despesas
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Novo Registro
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Categoria</th>
                <th>Responsável</th>
                <th>Tipo</th>
                <th>Método</th>
                <th>Observações</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th style={{ width: 88 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="loading-row">
                  <td colSpan={7}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-muted)' }}>
                      <Loader2 size={18} className="spin" /> Carregando...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <AlertCircle size={36} />
                      <p>Nenhum registro cadastrado ainda</p>
                      <button className="btn btn-ghost" onClick={openNew} style={{ marginTop: 8 }}>
                        <Plus size={14} /> Criar primeiro registro
                      </button>
                    </div>
                  </td>
                </tr>
              ) : items.map(r => {
                const isIncome = r.categories?.type === 'income';
                return (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {formatDate(r.date)}
                    </td>
                    <td>{r.categories?.name ?? '—'}</td>
                    <td>{r.responsible ?? '—'}</td>
                    <td>
                      <span className={`badge badge-${isIncome ? 'income' : 'outcome'}`}>
                        {isIncome ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${r.method.toLowerCase()}`}>
                        {methodLabel[r.method]}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 200 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {r.notes || '—'}
                      </span>
                    </td>
                    <td style={{
                      textAlign: 'right', fontWeight: 600,
                      color: isIncome ? 'var(--income)' : 'var(--outcome)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {isIncome ? '+' : '-'}{formatCurrency(r.value)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn-icon" onClick={() => openEdit(r)} title="Editar">
                          <Pencil size={14} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(r.id)} title="Remover"
                          style={{ color: 'var(--outcome)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && items.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
            {items.length} {items.length === 1 ? 'registro' : 'registros'}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Editar Registro' : 'Novo Registro'}</h2>
              <button className="btn-icon" style={{ border: 'none' }} onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Categoria *</label>
                    <select className="form-select" value={form.category_id} required
                      onChange={e => set('category_id', e.target.value)}>
                      <option value="">Selecione uma categoria</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type === 'income' ? 'Receita' : 'Despesa'})
                        </option>
                      ))}
                    </select>

                    <label className="form-label">Responsável *</label>
                    <select className="form-select" value={form.responsible} required
                      onChange={e => set('responsible', e.target.value)}>
                      {['Pedro', 'Clarissa'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Valor (R$) *</label>
                    <input className="form-input" type="number" min="0.01" step="0.01" required
                      value={form.value || ''} placeholder="0,00"
                      onChange={e => set('value', parseFloat(e.target.value))} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Método *</label>
                    <select className="form-select" value={form.method}
                      onChange={e => set('method', e.target.value as PaymentMethod)}>
                      {METHODS.map(m => <option key={m} value={m}>{methodLabel[m]}</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Data *</label>
                    <input className="form-input" type="date" required value={form.date}
                      onChange={e => set('date', e.target.value)} />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Observações</label>
                    <textarea className="form-textarea" value={form.notes} placeholder="Opcional..."
                      onChange={e => set('notes', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={14} className="spin" /> Salvando...</> : (editing ? 'Salvar' : 'Criar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
