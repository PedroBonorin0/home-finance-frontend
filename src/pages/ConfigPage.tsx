import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchConfig, updateConfig } from '../store/slices/configSlice';
import { useToast } from '../components/ui/Toast';
import { Settings, Loader2, Save } from 'lucide-react';

export const ConfigPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { config, loading, saving } = useAppSelector(s => s.config);
  const { show } = useToast();

  const [pedroPct, setPedroPct] = useState(50);
  const [clarissaPct, setClarissaPct] = useState(50);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    dispatch(fetchConfig());
  }, [dispatch]);

  useEffect(() => {
    if (config) {
      setPedroPct(config.pedro_percentage);
      setClarissaPct(config.clarissa_percentage);
      setDirty(false);
    }
  }, [config]);

  const handlePedroChange = (value: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(value)));
    setPedroPct(clamped);
    setClarissaPct(100 - clamped);
    setDirty(true);
  };

  const handleClarissaChange = (value: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(value)));
    setClarissaPct(clamped);
    setPedroPct(100 - clamped);
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateConfig({
        pedro_percentage: pedroPct,
        clarissa_percentage: clarissaPct,
      })).unwrap();
      setDirty(false);
      show('Configuração salva', 'success');
    } catch {
      show('Erro ao salvar configuração', 'error');
    }
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', marginBottom: 4 }}>
          Configurações
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          Defina a proporção de divisão das despesas entre Pedro e Clarissa
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: 40, justifyContent: 'center' }}>
          <Loader2 size={18} className="spin" /> Carregando...
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Pedro (%)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    max={100}
                    value={pedroPct}
                    onChange={e => handlePedroChange(Number(e.target.value))}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', minWidth: 30 }}>{pedroPct}%</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Clarissa (%)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    max={100}
                    value={clarissaPct}
                    onChange={e => handleClarissaChange(Number(e.target.value))}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', minWidth: 30 }}>{clarissaPct}%</span>
                </div>
              </div>
            </div>

            <div style={{
              height: 24,
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              display: 'flex',
              background: 'var(--bg-elevated)',
            }}>
              <div style={{
                width: `${pedroPct}%`,
                background: 'var(--accent)',
                transition: 'width 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: pedroPct > 15 ? '#0f0e0d' : 'transparent',
                overflow: 'hidden',
              }}>
                Pedro {pedroPct}%
              </div>
              <div style={{
                width: `${clarissaPct}%`,
                background: 'var(--income)',
                transition: 'width 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: clarissaPct > 15 ? '#0f0e0d' : 'transparent',
                overflow: 'hidden',
              }}>
                Clarissa {clarissaPct}%
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !dirty}>
                {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
