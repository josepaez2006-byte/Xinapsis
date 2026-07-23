import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Save, Activity, Heart, ClipboardList, Pill, FlaskConical,
  Plus, Trash2, Stethoscope, User, ChevronLeft, AlertCircle, Printer, RotateCcw, Mic, MicOff, Loader2
} from 'lucide-react';
import { useConsultation } from '../hooks/useConsultation';
import { useVoiceToText } from '../hooks/useVoiceToText';
import './ConsultationPage.css';

// ─── Voz a Texto: configuración específica para Xinapsis ──────────────────────

interface DictadoResult {
  reason:     string;
  symptoms:   string;
  findings:   string[];
  diagnoses:  Array<{ description: string; codeCIE10: string }>;
}

const DICTADO_INITIAL: DictadoResult = {
  reason: '', symptoms: '', findings: [], diagnoses: [],
};

const buildDictadoPrompt = (transcript: string) => `
Eres un asistente médico clínico. Analiza el siguiente dictado de un médico y extrae
la información clasificada en cuatro campos:
- "reason": motivo principal de consulta (breve, 1-2 oraciones).
- "symptoms": síntomas y evolución del cuadro clínico (más detallado).
- "findings": array de strings, cada uno con un hallazgo al examen físico.
- "diagnoses": array de objetos {"description": string, "codeCIE10": string}.
  Intenta inferir el código CIE-10 más probable; si no sabes, deja "codeCIE10" vacío.

Dictado del médico:
"${transcript}"

Devuelve ÚNICAMENTE un JSON válido con las llaves: reason, symptoms, findings, diagnoses.
`;

const parseDictadoResponse = (json: Record<string, unknown>): DictadoResult => ({
  reason:    typeof json.reason    === 'string' ? json.reason    : '',
  symptoms:  typeof json.symptoms  === 'string' ? json.symptoms  : '',
  findings:  Array.isArray(json.findings)
    ? (json.findings as unknown[]).filter((f): f is string => typeof f === 'string')
    : [],
  diagnoses: Array.isArray(json.diagnoses)
    ? (json.diagnoses as unknown[]).map((d) => ({
        description: typeof (d as any).description === 'string' ? (d as any).description : '',
        codeCIE10:   typeof (d as any).codeCIE10   === 'string' ? (d as any).codeCIE10   : '',
      }))
    : [],
});

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'triage',   label: 'Motivo y Triaje',   icon: Activity   },
  { key: 'history',  label: 'Antecedentes',       icon: User       },
  { key: 'clinical', label: 'Examen y Dx',        icon: Stethoscope },
  { key: 'rx',       label: 'Plan y Tratamiento', icon: Pill       },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const ConsultationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('triage');

  const c = useConsultation(id);

  const voice = useVoiceToText<DictadoResult>({
    language:      'es-ES',
    buildPrompt:   buildDictadoPrompt,
    parseResponse: parseDictadoResponse,
    initialResult: DICTADO_INITIAL,
  });

  const handleVoiceApply = useCallback(() => {
    if (!voice.result) return;
    const r = voice.result;
    if (r.reason.trim())       { c.setTriage(p => ({ ...p, reason:   r.reason   })); c.markDirty(); }
    if (r.symptoms.trim())     { c.setTriage(p => ({ ...p, symptoms: r.symptoms })); c.markDirty(); }
    if (r.findings.length > 0) {
      c.setFindings(prev => [...prev.filter(f => f.description.trim()), ...r.findings.map(d => ({ description: d }))]);
      c.markDirty();
    }
    if (r.diagnoses.length > 0) {
      c.setDiagnoses(prev => [...prev.filter(d => d.description.trim()), ...r.diagnoses]);
      c.markDirty();
    }
    voice.reset();
  }, [voice, c]);

  const handleBack = () => {
    if (c.isDirty) {
      if (window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que deseas salir? Los datos se perderán.')) {
        c.navigate(-1);
      }
    } else {
      c.navigate(-1);
    }
  };

  const handleSaveClick = async () => {
    const tabToSwitch = await c.handleSave();
    if (tabToSwitch) setActiveTab(tabToSwitch);
  };

  const handlePrint = (type: 'report' | 'recipe' | 'exams') => {
    if (c.isDirty) { alert('Por favor, guarda los cambios de la consulta antes de imprimir.'); return; }
    window.open(`/print/consultations/${id}?type=${type}`, '_blank');
  };

  if (c.isLoading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Cargando información médica...</div>;

  return (
    <div className="consultation-page">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="consultation-header">
        <div className="consultation-title-area">
          <button className="btn-back" onClick={handleBack}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: '0.5rem', padding: 0 }}>
            <ChevronLeft size={20} /> Volver sin guardar
          </button>
          <h1>{c.mode === 'create' ? 'Nueva Consulta' : 'Detalle de Consulta'}</h1>
          <div className="patient-brief">
            <User size={16} />
            <strong>{c.patientName}</strong>
            <span className="dot" />
            <span>C.I.: {c.patientDni}</span>
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {c.mode === 'view' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => handlePrint('report')}><Printer size={18} /> Informe</button>
              <button className="btn btn-secondary" onClick={() => handlePrint('recipe')}><Printer size={18} /> Récipe</button>
              <button className="btn btn-secondary" onClick={() => handlePrint('exams')}> <Printer size={18} /> Órdenes</button>
            </div>
          )}
          {c.isDirty && (
            <button type="button" className="btn btn-secondary" onClick={c.handleDiscard}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RotateCcw size={18} /> Descartar cambios
            </button>
          )}
          <button className="btn btn-primary" onClick={handleSaveClick} disabled={c.isSaving}
            style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            <Save size={20} /> {c.isSaving ? 'Guardando...' : 'Finalizar y Guardar'}
          </button>
        </div>
      </div>

      {c.isDirty && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
          <AlertCircle size={16} /> Tienes cambios sin guardar en esta consulta.
        </div>
      )}

      <div className="consultation-form-card">
        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <nav className="consultation-tabs">
          {TABS.map(tab => (
            <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              <tab.icon size={20} />{tab.label}
            </button>
          ))}
        </nav>

        <main className="form-content">

          {/* ── Tab: Triaje ───────────────────────────────────────────── */}
          {activeTab === 'triage' && (
            <div className="form-section">
              <div className="section-title"><Activity size={18} /> Signos Vitales y Triaje</div>
              <div className="form-grid cols-4">
                <div className="field-group">
                  <label className="field-label">Peso (kg)</label>
                  <input className="input-field" type="number" value={c.triage.weight} onChange={e => { c.setTriage(p => ({ ...p, weight: e.target.value })); c.markDirty(); }} placeholder="0.0" />
                </div>
                <div className="field-group">
                  <label className="field-label">Talla (cm)</label>
                  <input className="input-field" type="number" value={c.triage.height} onChange={e => { c.setTriage(p => ({ ...p, height: e.target.value })); c.markDirty(); }} placeholder="0" />
                </div>
                <div className="field-group">
                  <label className="field-label">T. Arterial</label>
                  <input className="input-field" type="text"   value={c.triage.bloodPressure} onChange={e => { c.setTriage(p => ({ ...p, bloodPressure: e.target.value })); c.markDirty(); }} placeholder="120/80" />
                </div>
                <div className="field-group">
                  <label className="field-label">F. Cardíaca</label>
                  <input className="input-field" type="number" value={c.triage.heartRate} onChange={e => { c.setTriage(p => ({ ...p, heartRate: e.target.value })); c.markDirty(); }} placeholder="72" />
                </div>
              </div>

              <div className="form-section" style={{ marginTop: '1rem' }}>
                <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><Heart size={18} /> Anamnesis (Motivo y Síntomas)</span>

                  {/* ── Dictado por Voz ─────────────────────────────── */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {voice.error && (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {voice.error}
                      </span>
                    )}
                    {voice.isRecording && voice.transcript && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                        "{voice.transcript}"
                      </span>
                    )}
                    <button id="btn-voice-dictado" type="button" onClick={voice.toggleRecording}
                      disabled={voice.isProcessing || !voice.isSupported}
                      title={voice.isSupported ? (voice.isRecording ? 'Detener dictado' : 'Dictar con voz') : 'Navegador no compatible'}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none',
                        cursor: voice.isSupported ? 'pointer' : 'not-allowed',
                        fontSize: '0.825rem', fontWeight: 600, transition: 'all 0.2s',
                        background: voice.isRecording ? 'rgba(239,68,68,0.12)' : voice.isProcessing ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.1)',
                        color: voice.isRecording ? '#ef4444' : '#6366f1',
                        boxShadow: voice.isRecording ? '0 0 0 2px rgba(239,68,68,0.3)' : 'none',
                        animation: voice.isRecording ? 'pulse 1.5s infinite' : 'none',
                      }}>
                      {voice.isProcessing ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analizando...</>
                        : voice.isRecording ? <><MicOff size={15} /> Detener dictado</>
                        : <><Mic size={15} /> Dictar con voz</>}
                    </button>
                    {voice.result && !voice.isProcessing &&
                      (voice.result.reason || voice.result.symptoms || voice.result.findings.length > 0 || voice.result.diagnoses.length > 0) && (
                      <button id="btn-voice-apply" type="button" onClick={handleVoiceApply}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600, background: 'rgba(34,197,94,0.12)', color: '#16a34a' }}>
                        ✓ Aplicar resultado
                      </button>
                    )}
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Ocupación del Paciente</label>
                  <input className="input-field" type="text" value={c.triage.occupation} onChange={e => { c.setTriage(p => ({ ...p, occupation: e.target.value })); c.markDirty(); }} placeholder="Profesión u oficio..." />
                </div>
                <div className="field-group">
                  <label className="field-label">Motivo de consulta *</label>
                  <textarea className="input-field" rows={3} value={c.triage.reason} onChange={e => { c.setTriage(p => ({ ...p, reason: e.target.value })); c.markDirty(); }} placeholder="¿Por qué acude el paciente?" />
                </div>
                <div className="field-group">
                  <label className="field-label">Síntomas y Evolución</label>
                  <textarea className="input-field" rows={4} value={c.triage.symptoms} onChange={e => { c.setTriage(p => ({ ...p, symptoms: e.target.value })); c.markDirty(); }} placeholder="Detalle de los síntomas referidos..." />
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Antecedentes ─────────────────────────────────────── */}
          {activeTab === 'history' && (
            <div className="form-section">
              <div className="section-title"><Activity size={18} /> Información Médica Base</div>
              <div className="form-grid cols-3">
                <div className="field-group">
                  <label className="field-label">Grupo Sanguíneo</label>
                  <select className="input-field" value={c.history.bloodType} onChange={e => { c.setHistory(p => ({ ...p, bloodType: e.target.value })); c.markDirty(); }}>
                    <option value="">Desconocido</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">Enfermedades Crónicas</label>
                  <input className="input-field" type="text" value={c.history.chronicDiseases} onChange={e => { c.setHistory(p => ({ ...p, chronicDiseases: e.target.value })); c.markDirty(); }} placeholder="Diabetes, HTA, etc..." />
                </div>
                <div className="field-group">
                  <label className="field-label">Cirugías Previas</label>
                  <input className="input-field" type="text" value={c.history.surgeries} onChange={e => { c.setHistory(p => ({ ...p, surgeries: e.target.value })); c.markDirty(); }} placeholder="Detalle intervenciones..." />
                </div>
              </div>

              <div className="form-section" style={{ marginTop: '2rem' }}>
                <div className="section-title">Antecedentes Familiares</div>
                <div className="form-grid">
                  {/* Madre */}
                  <div className="field-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="field-label">Línea Materna</label>
                      <label className="habit-check" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>
                        <input type="checkbox" checked={c.history.motherIsAlive} onChange={e => { c.setHistory(p => ({ ...p, motherIsAlive: e.target.checked })); c.markDirty(); }} /> ¿Vive?
                      </label>
                    </div>
                    <textarea className="input-field" rows={3} value={c.history.motherHistory} onChange={e => { c.setHistory(p => ({ ...p, motherHistory: e.target.value })); c.markDirty(); }} placeholder="Enfermedades hereditarias..." />
                    {!c.history.motherIsAlive && (
                      <input className="input-field" style={{ marginTop: '0.5rem' }} type="text" placeholder="Causa de muerte" value={c.history.motherCauseOfDeath} onChange={e => { c.setHistory(p => ({ ...p, motherCauseOfDeath: e.target.value })); c.markDirty(); }} />
                    )}
                  </div>
                  {/* Padre */}
                  <div className="field-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="field-label">Línea Paterna</label>
                      <label className="habit-check" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>
                        <input type="checkbox" checked={c.history.fatherIsAlive} onChange={e => { c.setHistory(p => ({ ...p, fatherIsAlive: e.target.checked })); c.markDirty(); }} /> ¿Vive?
                      </label>
                    </div>
                    <textarea className="input-field" rows={3} value={c.history.fatherHistory} onChange={e => { c.setHistory(p => ({ ...p, fatherHistory: e.target.value })); c.markDirty(); }} placeholder="Enfermedades hereditarias..." />
                    {!c.history.fatherIsAlive && (
                      <input className="input-field" style={{ marginTop: '0.5rem' }} type="text" placeholder="Causa de muerte" value={c.history.fatherCauseOfDeath} onChange={e => { c.setHistory(p => ({ ...p, fatherCauseOfDeath: e.target.value })); c.markDirty(); }} />
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section" style={{ marginTop: '2rem' }}>
                <div className="section-title">Hábitos del Paciente</div>
                <div className="habits-grid" style={{ gap: '1.5rem' }}>
                  {[
                    { k: 'sedentary', l: 'Sedentarismo' },
                    { k: 'alcohol',   l: 'Consumo de Alcohol' },
                    { k: 'smoking',   l: 'Tabaquismo' },
                    { k: 'drugs',     l: 'Uso de Drogas' },
                  ].map(h => (
                    <label key={h.k} className="habit-check">
                      <input type="checkbox" checked={(c.history as any)[h.k]} onChange={e => { c.setHistory(p => ({ ...p, [h.k]: e.target.checked })); c.markDirty(); }} />
                      {h.l}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Examen y Dx ──────────────────────────────────────── */}
          {activeTab === 'clinical' && (
            <div className="form-section">
              <div className="section-title"><ClipboardList size={18} /> Hallazgos al Examen Físico</div>
              <div className="list-container">
                {c.findings.map((f, i) => (
                  <div key={i} className="list-item">
                    <div className="item-fields">
                      <textarea className="input-field" rows={2} value={f.description}
                        onChange={e => { c.setFindings(p => p.map((item, idx) => idx === i ? { ...item, description: e.target.value } : item)); c.markDirty(); }}
                        placeholder="Describa el hallazgo clínico..." />
                    </div>
                    <button className="delete-btn" onClick={() => { c.setFindings(p => p.filter((_, idx) => idx !== i)); c.markDirty(); }}><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
              <button className="add-btn" onClick={() => { c.setFindings(p => [...p, { description: '' }]); c.markDirty(); }}><Plus size={18} /> Agregar hallazgo</button>

              <div className="form-section" style={{ marginTop: '2rem' }}>
                <div className="section-title"><Stethoscope size={18} /> Diagnósticos Presuntivos / Definitivos</div>
                <div className="list-container">
                  {c.diagnoses.map((d, i) => (
                    <div key={i} className="list-item">
                      <div className="item-fields">
                        <div className="form-grid">
                          <input className="input-field" type="text" placeholder="Código CIE-10" value={d.codeCIE10}
                            onChange={e => { c.setDiagnoses(p => p.map((item, idx) => idx === i ? { ...item, codeCIE10: e.target.value } : item)); c.markDirty(); }} />
                        </div>
                        <textarea className="input-field" rows={2} value={d.description}
                          onChange={e => { c.setDiagnoses(p => p.map((item, idx) => idx === i ? { ...item, description: e.target.value } : item)); c.markDirty(); }}
                          placeholder="Descripción del diagnóstico..." />
                      </div>
                      <button className="delete-btn" onClick={() => { c.setDiagnoses(p => p.filter((_, idx) => idx !== i)); c.markDirty(); }}><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
                <button className="add-btn" onClick={() => { c.setDiagnoses(p => [...p, { description: '', codeCIE10: '' }]); c.markDirty(); }}><Plus size={18} /> Agregar diagnóstico</button>
              </div>
            </div>
          )}

          {/* ── Tab: Plan y Tratamiento ───────────────────────────────── */}
          {activeTab === 'rx' && (
            <div className="form-section">
              <div className="section-title"><Pill size={18} /> Plan de Tratamiento y Farmacología</div>
              <div className="list-container">
                {c.treatments.map((t, i) => (
                  <div key={i} className="list-item">
                    <div className="item-fields">
                      <div className="form-grid">
                        <input className="input-field" type="text" placeholder="Medicamento" value={t.medication}
                          onChange={e => { c.setTreatments(p => p.map((item, idx) => idx === i ? { ...item, medication: e.target.value } : item)); c.markDirty(); }} />
                        <input className="input-field" type="text" placeholder="Dosis / Frecuencia" value={t.dosage}
                          onChange={e => { c.setTreatments(p => p.map((item, idx) => idx === i ? { ...item, dosage: e.target.value } : item)); c.markDirty(); }} />
                      </div>
                      <textarea className="input-field" rows={2} value={t.instructions}
                        onChange={e => { c.setTreatments(p => p.map((item, idx) => idx === i ? { ...item, instructions: e.target.value } : item)); c.markDirty(); }}
                        placeholder="Instrucciones para el paciente..." />
                    </div>
                    <button className="delete-btn" onClick={() => { c.setTreatments(p => p.filter((_, idx) => idx !== i)); c.markDirty(); }}><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
              <button className="add-btn" onClick={() => { c.setTreatments(p => [...p, { medication: '', dosage: '', instructions: '' }]); c.markDirty(); }}><Plus size={18} /> Agregar medicamento</button>

              <div className="section-title" style={{ marginTop: '2rem' }}><FlaskConical size={18} /> Exámenes y Paraclínicos Solicitados</div>
              <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Cargar desde Plantilla:</span>
                <select className="input-field" style={{ maxWidth: '300px' }} defaultValue=""
                  onChange={ev => { if (ev.target.value) { c.handleAddTemplateExams(Number(ev.target.value)); ev.target.value = ''; } }}>
                  <option value="">-- Seleccionar Plantilla --</option>
                  {c.labTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="list-container">
                {c.exams.map((e, i) => (
                  <div key={i} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
                    <div className="item-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: '1rem', alignItems: 'center' }}>
                      <select className="input-field" value={e.type} onChange={ev => { c.setExams(p => p.map((item, idx) => idx === i ? { ...item, type: ev.target.value as any } : item)); c.markDirty(); }}>
                        <option value="LABORATORIO">Laboratorio</option>
                        <option value="IMAGENES">Imágenes</option>
                        <option value="OTROS">Otros</option>
                      </select>
                      <input className="input-field" type="text" placeholder="Ej. Hemoglobina..." value={e.name}
                        onChange={ev => { c.setExams(p => p.map((item, idx) => idx === i ? { ...item, name: ev.target.value } : item)); c.markDirty(); }}
                        disabled={!!e.labExamDetailId} />
                      <input className="input-field" type="text" placeholder="Valor de referencia (opcional)..." value={e.referenceValues || ''}
                        onChange={ev => { c.setExams(p => p.map((item, idx) => idx === i ? { ...item, referenceValues: ev.target.value } : item)); c.markDirty(); }}
                        disabled={!!e.labExamDetailId} />
                    </div>

                    {e.type === 'LABORATORIO' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                          Estado: <span style={{ color: e.status === 'COMPLETED' ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                            {e.status === 'COMPLETED' ? 'Completado' : 'Pendiente de Carga'}
                          </span>
                        </span>
                        {e.status === 'COMPLETED' ? (
                          <span style={{ fontSize: '0.85rem' }}>
                            <strong>Resultado: </strong>
                            <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontWeight: 700 }}>
                              {e.results}
                            </span>
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>Esperando resultados del laboratorio</span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                      <button className="delete-btn" onClick={() => { c.setExams(p => p.filter((_, idx) => idx !== i)); c.markDirty(); }}><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="add-btn" onClick={() => { c.setExams(p => [...p, { name: '', status: 'PENDING', type: 'LABORATORIO', referenceValues: '' }]); c.markDirty(); }}><Plus size={18} /> Solicitar examen</button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
