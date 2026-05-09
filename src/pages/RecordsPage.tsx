import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchRecords, createRecord, updateRecord, deleteRecord, deleteRecordByInstallmentGroup, updateRecordByInstallmentGroup, fetchSummary, fetchInstallmentGroups } from '../store/slices/recordsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { formatCurrency, formatDate, methodLabel } from '../utils/formatters';
import { useToast } from '../components/ui/Toast';
import { Plus, Pencil, Trash2, X, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import type { CreateRecordDto, PaymentMethod, Record } from '../types';

const METHODS: PaymentMethod[] = ['Pix', 'Credit', 'Debit'];

const emptyForm = (): CreateRecordDto => ({
  category_id: '',
  value: 0,
  responsible: 'Pedro',
  method: 'Pix',
  date: new Date().toISOString().split('T')[0],
  notes: '',
  installments: undefined,
});

export const RecordsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, installmentGroups } = useAppSelector(s => s.records);
  const { items: categories } = useAppSelector(s => s.categories);
  const { show } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record | null>(null);
  const [form, setForm] = useState<CreateRecordDto>(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchRecords());
    dispatch(fetchInstallmentGroups());
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
      installments: undefined,
    });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id) return show('Selecione uma categoria', 'error');
    if (!form.value || form.value <= 0) return show('Informe um valor valido', 'error');
    setSaving(true);
    try {
      if (editing) {
        if (editing.installment_group_id) {
          const group = installmentGroups.find(g => g.id === editing.installment_group_id);
          const total = group?.installments ?? '?';
          const current = editing.installment_number ?? '?';
          const editAll = confirm(`Esta e a parcela ${current}/${total}. Deseja editar TODAS as parcelas?`);
          if (editAll) {
            await dispatch(updateRecordByInstallmentGroup({
              installmentGroupId: editing.installment_group_id,
              dto: { category_id: form.category_id, value: form.value, notes: form.notes },
            })).unwrap();
            show('Parcelas atualizadas', 'success');
          } else {
            return;
          }
        } else {
          await dispatch(updateRecord({ id: editing.id, dto: form })).unwrap();
          show('Registro atualizado', 'success');
        }
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

  const handleDelete = async (record: Record) => {
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
        show('Erro ao remover', 'error');
      }
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
                <th>Parcelas</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th style={{ width: 88 }}></th>
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
                    <td>
                      {r.installment_group_id && r.installment_number ? (() => {
                        const group = installmentGroups.find(g => g.id === r.installment_group_id);
                        const total = group?.installments ?? '?';
                        return (
                          <span className="badge badge-credit" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                            {r.installment_number}/{total}
                          </span>
                        );
                      })() : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8125rem' }}>—</span>
                      )}
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
                        <button className="btn-icon" onClick={() => handleDelete(r)} title="Remover"
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
                      onChange={e => { set('method', e.target.value as PaymentMethod); if (e.target.value !== 'Credit') set('installments', undefined); }}>
                      {METHODS.map(m => <option key={m} value={m}>{methodLabel[m]}</option>)}
                    </select>
                  </div>

                  {!editing && form.method === 'Credit' && (
                    <div className="form-group">
                      <label className="form-label">Parcelas</label>
                      <select className="form-select" value={form.installments ?? 1}
                        onChange={e => set('installments', parseInt(e.target.value) || undefined)}>
                        <option value={1}>A vista</option>
                        {Array.from({ length: 23 }, (_, i) => i + 2).map(n => (
                          <option key={n} value={n}>{n}x</option>
                        ))}
                      </select>
                    </div>
                  )}

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
