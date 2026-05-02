import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/categoriesSlice';
import { useToast } from '../components/ui/Toast';
import { Plus, Pencil, Trash2, X, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import type { Category, CategoryType, CreateCategoryDto } from '../types';

const emptyForm = (): CreateCategoryDto => ({ name: '', type: 'outcome' });

export const CategoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector(s => s.categories);
  const { show } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CreateCategoryDto>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'all' | CategoryType>('all');

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  const openNew = () => { setEditing(null); setForm(emptyForm()); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, type: c.type }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return show('Informe um nome', 'error');
    setSaving(true);
    try {
      if (editing) {
        await dispatch(updateCategory({ id: editing.id, dto: form })).unwrap();
        show('Categoria atualizada', 'success');
      } else {
        await dispatch(createCategory(form)).unwrap();
        show('Categoria criada', 'success');
      }
      closeModal();
    } catch {
      show('Erro ao salvar categoria', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`Remover "${c.name}"?`)) return;
    try {
      await dispatch(deleteCategory(c.id)).unwrap();
      show('Categoria removida', 'success');
    } catch (err: any) {
      show(err?.message ?? 'Erro ao remover categoria', 'error');
    }
  };

  const filtered = tab === 'all' ? items : items.filter(c => c.type === tab);
  const incomeCount = items.filter(c => c.type === 'income').length;
  const outcomeCount = items.filter(c => c.type === 'outcome').length;

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', marginBottom: 4 }}>
            Categorias
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Organize suas receitas e despesas
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
          <div style={{ padding: 10, borderRadius: 8, background: 'var(--income-bg)', color: 'var(--income)' }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
              Receitas
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', color: 'var(--text)' }}>
              {incomeCount} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>categorias</span>
            </div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
          <div style={{ padding: 10, borderRadius: 8, background: 'var(--outcome-bg)', color: 'var(--outcome)' }}>
            <TrendingDown size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
              Despesas
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', color: 'var(--text)' }}>
              {outcomeCount} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>categorias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: 4, width: 'fit-content' }}>
        {([['all', 'Todas'], ['income', 'Receitas'], ['outcome', 'Despesas']] as const).map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            style={{
              padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-body)',
              background: tab === val ? 'var(--bg-elevated)' : 'transparent',
              color: tab === val ? 'var(--text)' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: 'var(--text-muted)', gap: 10 }}>
          <Loader2 size={20} className="spin" /> Carregando...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Plus size={36} />
          <p>Nenhuma categoria cadastrada</p>
          <button className="btn btn-ghost" onClick={openNew} style={{ marginTop: 8 }}>
            <Plus size={14} /> Criar categoria
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {filtered.map(c => (
            <div key={c.id} className="card" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', gap: 12,
              borderLeft: `3px solid ${c.type === 'income' ? 'var(--income)' : 'var(--outcome)'}`,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </div>
                <span className={`badge badge-${c.type === 'income' ? 'income' : 'outcome'}`}
                  style={{ marginTop: 6, fontSize: '0.7rem' }}>
                  {c.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn-icon" onClick={() => openEdit(c)} title="Editar">
                  <Pencil size={13} />
                </button>
                <button className="btn-icon" onClick={() => handleDelete(c)} title="Remover"
                  style={{ color: 'var(--outcome)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button className="btn-icon" style={{ border: 'none' }} onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nome *</label>
                  <input className="form-input" type="text" required placeholder="Ex: Salário, Alimentação..."
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {([['income', 'Receita', 'var(--income)', 'var(--income-bg)', 'var(--income-border)'],
                       ['outcome', 'Despesa', 'var(--outcome)', 'var(--outcome-bg)', 'var(--outcome-border)']] as const).map(
                      ([val, label, color, bg, border]) => (
                        <button key={val} type="button"
                          onClick={() => setForm(p => ({ ...p, type: val as CategoryType }))}
                          style={{
                            padding: '12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                            border: `1px solid ${form.type === val ? border : 'var(--border)'}`,
                            background: form.type === val ? bg : 'transparent',
                            color: form.type === val ? color : 'var(--text-muted)',
                            fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500,
                            transition: 'all 0.15s',
                          }}>
                          {label}
                        </button>
                      )
                    )}
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
