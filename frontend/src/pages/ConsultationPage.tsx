import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Save, Activity, Heart, ClipboardList, Pill, FlaskConical,
  Plus, Trash2, Stethoscope, User, ChevronLeft, AlertCircle, Printer, RotateCcw, Mic, MicOff, Loader2
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceToText } from '../hooks/useVoiceToText';
import './ConsultationPage.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Finding { id?: number; description: string }
interface Diagnosis { id?: number; description: string; codeCIE10: string }
interface Treatment { id?: number; medication: string; dosage: string; instructions: string }
interface ExamReq { id?: number; name: string; status: string; type: 'LABORATORIO' | 'IMAGNES' | 'OTROS'; referenceValues: string; results?: string; labExamDetailId?: number }

interface MedicalHistoryForm {
  fatherHistory: string;
  fatherIsAlive: boolean;
  fatherCauseOfDeath: string;
  motherHistory: string;
  motherIsAlive: boolean;
  motherCauseOfDeath: string;
  bloodType: string;
  chronicDiseases: string;
  surgeries: string;
  sedentary: boolean;
  alcohol: boolean;
  smoking: boolean;
  drugs: boolean;
  otherToxicHabits: string;
}

interface TriageForm {
  weight: string;
  height: string;
  bloodPressure: string;
  heartRate: string;
  occupation: string;
  reason: string;
  symptoms: string;
}

const emptyTriage: TriageForm = {
  weight: '', height: '', bloodPressure: '', heartRate: '',
  occupation: '', reason: '', symptoms: '',
};

const emptyHistory: MedicalHistoryForm = {
  fatherHistory: '', fatherIsAlive: true, fatherCauseOfDeath: '',
  motherHistory: '', motherIsAlive: true, motherCauseOfDeath: '',
  bloodType: '', chronicDiseases: '', surgeries: '',
  sedentary: false, alcohol: false, smoking: false, drugs: false, otherToxicHabits: '',
};

const TABS = [
  { key: 'triage', label: 'Motivo y Triaje', icon: Activity },
  { key: 'history', label: 'Antecedentes', icon: User },
  { key: 'clinical', label: 'Examen y Dx', icon: Stethoscope },
  { key: 'rx', label: 'Plan y Tratamiento', icon: Pill },
];

// ── Voz a Texto: configuración específica para Xinapsis ────────────────────────

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

export const ConsultationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const mode = id ? 'view' : 'create';
  const [patientId, setPatientId] = useState<number>(parseInt(searchParams.get('patientId') || '0'));
  const appointmentId = parseInt(searchParams.get('appointmentId') || '0');
  const [doctorIdFromAppointment, setDoctorIdFromAppointment] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState('triage');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [labTemplates, setLabTemplates] = useState<any[]>([]);

  // ── Voz a Texto ─────────────────────────────────────────────────────────────
  const voice = useVoiceToText<DictadoResult>({
    apiKey:          import.meta.env.VITE_GEMINI_API_KEY as string,
    language:        'es-ES',
    buildPrompt:     buildDictadoPrompt,
    parseResponse:   parseDictadoResponse,
    initialResult:   DICTADO_INITIAL,
  });

  // Cuando llega un resultado de voz, llenamos los campos del formulario
  const handleVoiceApply = useCallback(() => {
    if (!voice.result) return;
    const r = voice.result;

    if (r.reason.trim()) {
      setTriage(p => ({ ...p, reason: r.reason }));
      markDirty();
    }
    if (r.symptoms.trim()) {
      setTriage(p => ({ ...p, symptoms: r.symptoms }));
      markDirty();
    }
    if (r.findings.length > 0) {
      setFindings(prev => {
        const base = prev.filter(f => f.description.trim());
        return [...base, ...r.findings.map(d => ({ description: d }))];
      });
      markDirty();
    }
    if (r.diagnoses.length > 0) {
      setDiagnoses(prev => {
        const base = prev.filter(d => d.description.trim());
        return [...base, ...r.diagnoses];
      });
      markDirty();
    }
    voice.reset();
  }, [voice]);

  const [patientName, setPatientName] = useState('');
  const [patientDni, setPatientDni] = useState('');

  // Form state
  const [triage, setTriage] = useState<TriageForm>(emptyTriage);
  const [history, setHistory] = useState<MedicalHistoryForm>(emptyHistory);
  const [findings, setFindings] = useState<Finding[]>([{ description: '' }]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([{ description: '', codeCIE10: '' }]);
  const [treatments, setTreatments] = useState<Treatment[]>([{ medication: '', dosage: '', instructions: '' }]);
  const [exams, setExams] = useState<ExamReq[]>([{ name: '', status: 'PENDING', type: 'LABORATORIO', referenceValues: '' }]);

  // Load lab templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await api.get<any[]>('/lab-exams');
        setLabTemplates(data);
      } catch (err) {
        console.error('Error fetching templates:', err);
      }
    };
    fetchTemplates();
  }, []);

  const handleAddTemplateExams = (templateId: number) => {
    const template = labTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const newExams = template.details.map((d: any) => ({
      name: d.name,
      status: 'PENDING',
      type: 'LABORATORIO' as const,
      referenceValues: d.referenceValue,
      labExamDetailId: d.id
    }));

    setExams(prev => {
      // Remove empty row if it is the only one and is empty
      const filtered = prev.filter(e => e.name.trim() !== '');
      return [...filtered, ...newExams];
    });
    markDirty();
  };

  // ── Prevent Data Loss ───────────────────────────────────────────────────────

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBack = () => {
    if (isDirty) {
      if (window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que deseas salir? Los datos se perderán.')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const handleDiscard = async () => {
    if (!isDirty) return;

    let confirmDiscard = false;
    try {
      confirmDiscard = window.confirm('¿Estás seguro de que deseas descartar los cambios no guardados? Se restaurarán los datos originales.');
    } catch (e) {
      // Fallback si una extensión bloquea el window.confirm
      confirmDiscard = true;
    }
    if (!confirmDiscard) return;

    setIsLoading(true);
    try {
      if (mode === 'create') {
        if (patientId) await loadPatientData(patientId);
        setTriage({ ...emptyTriage });
        setFindings([{ description: '' }]);
        setDiagnoses([{ description: '', codeCIE10: '' }]);
        setTreatments([{ medication: '', dosage: '', instructions: '' }]);
        setExams([{ name: '', status: 'PENDING', type: 'LABORATORIO', referenceValues: '' }]);
        setIsDirty(false);
      } else if (mode === 'view' && id) {
        await loadConsultation(parseInt(id));
        // setIsDirty(false) is handled inside loadConsultation
      }
    } catch (err) {
      console.error('Error discarding changes:', err);
      alert('Hubo un error al descartar los cambios.');
    } finally {
      setIsLoading(false);
    }
  };

  const markDirty = () => !isDirty && setIsDirty(true);

  const handlePrint = (type: 'report' | 'recipe' | 'exams') => {
    if (isDirty) {
      alert('Por favor, guarda los cambios de la consulta antes de imprimir.');
      return;
    }
    window.open(`/print/consultations/${id}?type=${type}`, '_blank');
  };

  // ── Load Data ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      if (mode === 'create') {
        if (patientId) await loadPatientData(patientId);
        if (appointmentId) {
          try {
            const appt = await api.get<any>(`/appointments/${appointmentId}`);
            if (appt.consultation) {
              // Si ya tiene consulta, redirigimos al detalle en vez de crear una nueva
              navigate(`/dashboard/consultations/${appt.consultation.id}`, { replace: true });
              return;
            }
            setDoctorIdFromAppointment(appt.doctorId);
          } catch (err) {
            console.error('Error fetching appointment:', err);
          }
        }
      } else if (mode === 'view' && id) {
        await loadConsultation(parseInt(id));
      }
      setIsLoading(false);
    };
    init();
  }, [id, patientId]);

  const loadPatientData = async (pId: number) => {
    try {
      const p = await api.get<any>(`/patients/${pId}`);
      setPatientName(`${p.firstName} ${p.lastName}`);
      setPatientDni(p.dni);

      if (p.medicalHistory) {
        setHistory({
          fatherHistory: p.medicalHistory.fatherHistory || '',
          fatherIsAlive: p.medicalHistory.fatherIsAlive ?? true,
          fatherCauseOfDeath: p.medicalHistory.fatherCauseOfDeath || '',
          motherHistory: p.medicalHistory.motherHistory || '',
          motherIsAlive: p.medicalHistory.motherIsAlive ?? true,
          motherCauseOfDeath: p.medicalHistory.motherCauseOfDeath || '',
          bloodType: p.medicalHistory.bloodType || '',
          chronicDiseases: p.medicalHistory.chronicDiseases || '',
          surgeries: p.medicalHistory.surgeries || '',
          sedentary: p.medicalHistory.sedentary ?? false,
          alcohol: p.medicalHistory.alcohol ?? false,
          smoking: p.medicalHistory.smoking ?? false,
          drugs: p.medicalHistory.drugs ?? false,
          otherToxicHabits: p.medicalHistory.otherToxicHabits || '',
        });
      } else {
        setHistory({ ...emptyHistory });
      }
    } catch (err) {
      console.error('Error loading patient data:', err);
    }
  };

  const loadConsultation = async (cId: number) => {
    try {
      const c = await api.get<any>(`/consultations/${cId}`);
      setPatientId(c.patientId); // Crucial for saving medical history in view mode
      await loadPatientData(c.patientId);

      setTriage({
        weight: c.weight?.toString() || '',
        height: c.height?.toString() || '',
        bloodPressure: c.bloodPressure || '',
        heartRate: c.heartRate?.toString() || '',
        occupation: c.occupation || '',
        reason: c.reason || '',
        symptoms: c.symptoms || '',
      });
      setFindings(c.findings?.length ? c.findings : [{ description: '' }]);
      setDiagnoses(c.diagnoses?.length ? c.diagnoses.map((d: any) => ({ ...d, codeCIE10: d.codeCIE10 || '' })) : [{ description: '', codeCIE10: '' }]);
      setTreatments(c.treatments?.length ? c.treatments.map((t: any) => ({ ...t, dosage: t.dosage || '', instructions: t.instructions || '' })) : [{ medication: '', dosage: '', instructions: '' }]);
      setExams(c.examsRequested?.length ? c.examsRequested.map((e: any) => ({ ...e, type: e.type || 'LABORATORIO', referenceValues: e.referenceValues || '' })) : [{ name: '', status: 'PENDING', type: 'LABORATORIO', referenceValues: '' }]);
      setIsDirty(false); // Reset after loading existing
    } catch (err) {
      console.error('Error loading consultation:', err);
    }
  };

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!triage.reason.trim()) {
      alert('El motivo de consulta es obligatorio.');
      setActiveTab('triage');
      return;
    }

    setIsSaving(true);
    try {
      let currentConsultationId = mode === 'view' ? parseInt(id!) : null;

      const consultationPayload = {
        ...(appointmentId && { appointmentId }),
        patientId: mode === 'create' ? patientId : undefined,
        doctorId: doctorIdFromAppointment || user?.doctorId, // IMPORTANT: doctorId is required
        weight: triage.weight ? parseFloat(triage.weight) : null,
        height: triage.height ? parseFloat(triage.height) : null,
        bloodPressure: triage.bloodPressure || null,
        heartRate: triage.heartRate ? parseInt(triage.heartRate) : null,
        occupation: triage.occupation || null,
        reason: triage.reason,
        symptoms: triage.symptoms || null,
        findings: findings.filter(f => f.description.trim()),
        diagnoses: diagnoses.filter(d => d.description.trim()),
        treatments: treatments.filter(t => t.medication.trim()),
        exams: exams.filter(e => e.name.trim()),
      };

      if (!consultationPayload.doctorId && mode === 'create') {
        throw new Error('No se pudo determinar el doctor para esta consulta.');
      }

      if (mode === 'create') {
        const created = await api.post<any>('/consultations', consultationPayload);
        currentConsultationId = created.id;
        if (appointmentId) {
          await api.put(`/appointments/${appointmentId}`, { status: 'COMPLETADO' });
        }
      } else {
        await api.put(`/consultations/${currentConsultationId}`, consultationPayload);
      }

      // Medical History (Robust Upsert)
      try {
        const histPayload = {
          fatherHistory: history.fatherHistory || null,
          fatherIsAlive: history.fatherIsAlive,
          fatherCauseOfDeath: history.fatherCauseOfDeath || null,
          motherHistory: history.motherHistory || null,
          motherIsAlive: history.motherIsAlive,
          motherCauseOfDeath: history.motherCauseOfDeath || null,
          bloodType: history.bloodType || null,
          chronicDiseases: history.chronicDiseases || null,
          surgeries: history.surgeries || null,
          sedentary: history.sedentary,
          alcohol: history.alcohol,
          smoking: history.smoking,
          drugs: history.drugs,
          otherToxicHabits: history.otherToxicHabits || null,
        };
        await api.put(`/medical-histories/patient/${patientId}`, histPayload);
      } catch (err) {
        console.warn('Error saving medical history:', err);
      }

      setIsDirty(false);

      if (mode === 'create') {
        alert('Consulta guardada exitosamente. Ya puede imprimir los documentos.');
        navigate(`/dashboard/consultations/${currentConsultationId}`, { replace: true });
      } else {
        alert('Consulta actualizada exitosamente.');
      }
    } catch (err: any) {
      alert(`Error al guardar la consulta: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Cargando información médica...</div>;

  return (
    <div className="consultation-page">
      <div className="consultation-header">
        <div className="consultation-title-area">
          <button className="btn-back" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: '0.5rem', padding: 0 }}>
            <ChevronLeft size={20} /> Volver sin guardar
          </button>
          <h1>{mode === 'create' ? 'Nueva Consulta' : 'Detalle de Consulta'}</h1>
          <div className="patient-brief">
            <User size={16} />
            <strong>{patientName}</strong>
            <span className="dot" />
            <span>C.I.: {patientDni}</span>
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {mode === 'view' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => handlePrint('report')} title="Imprimir Informe">
                <Printer size={18} /> Informe
              </button>
              <button className="btn btn-secondary" onClick={() => handlePrint('recipe')} title="Imprimir Récipe">
                <Printer size={18} /> Récipe
              </button>
              <button className="btn btn-secondary" onClick={() => handlePrint('exams')} title="Imprimir Órdenes">
                <Printer size={18} /> Órdenes
              </button>
            </div>
          )}
          {isDirty && (
            <button type="button" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); handleDiscard(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RotateCcw size={18} /> Descartar cambios
            </button>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            <Save size={20} /> {isSaving ? 'Guardando...' : 'Finalizar y Guardar'}
          </button>
        </div>
      </div>

      {isDirty && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
          <AlertCircle size={16} /> Tienes cambios sin guardar en esta consulta.
        </div>
      )}

      <div className="consultation-form-card">
        <nav className="consultation-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>

        <main className="form-content">
          {activeTab === 'triage' && (
            <div className="form-section">
              <div className="section-title"><Activity size={18} /> Signos Vitales y Triaje</div>
              <div className="form-grid cols-4">
                <div className="field-group">
                  <label className="field-label">Peso (kg)</label>
                  <input className="input-field" type="number" value={triage.weight} onChange={e => { setTriage(p => ({ ...p, weight: e.target.value })); markDirty(); }} placeholder="0.0" />
                </div>
                <div className="field-group">
                  <label className="field-label">Talla (cm)</label>
                  <input className="input-field" type="number" value={triage.height} onChange={e => { setTriage(p => ({ ...p, height: e.target.value })); markDirty(); }} placeholder="0" />
                </div>
                <div className="field-group">
                  <label className="field-label">T. Arterial</label>
                  <input className="input-field" type="text" value={triage.bloodPressure} onChange={e => { setTriage(p => ({ ...p, bloodPressure: e.target.value })); markDirty(); }} placeholder="120/80" />
                </div>
                <div className="field-group">
                  <label className="field-label">F. Cardíaca</label>
                  <input className="input-field" type="number" value={triage.heartRate} onChange={e => { setTriage(p => ({ ...p, heartRate: e.target.value })); markDirty(); }} placeholder="72" />
                </div>
              </div>

              <div className="form-section" style={{ marginTop: '1rem' }}>
                <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><Heart size={18} /> Anamnesis (Motivo y Síntomas)</span>

                  {/* ── Botón de Dictado por Voz ────────────────────────── */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {voice.error && (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {voice.error}
                      </span>
                    )}

                    {/* Transcript en vivo */}
                    {voice.isRecording && voice.transcript && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                        "{voice.transcript}"
                      </span>
                    )}

                    {/* Botón principal */}
                    <button
                      id="btn-voice-dictado"
                      type="button"
                      onClick={voice.toggleRecording}
                      disabled={voice.isProcessing || !voice.isSupported}
                      title={voice.isSupported ? (voice.isRecording ? 'Detener dictado' : 'Dictar con voz') : 'Navegador no compatible'}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none',
                        cursor: voice.isSupported ? 'pointer' : 'not-allowed',
                        fontSize: '0.825rem', fontWeight: 600, transition: 'all 0.2s',
                        background: voice.isRecording
                          ? 'rgba(239,68,68,0.12)'
                          : voice.isProcessing
                          ? 'rgba(99,102,241,0.12)'
                          : 'rgba(99,102,241,0.1)',
                        color: voice.isRecording ? '#ef4444' : '#6366f1',
                        boxShadow: voice.isRecording ? '0 0 0 2px rgba(239,68,68,0.3)' : 'none',
                        animation: voice.isRecording ? 'pulse 1.5s infinite' : 'none',
                      }}
                    >
                      {voice.isProcessing ? (
                        <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analizando...</>
                      ) : voice.isRecording ? (
                        <><MicOff size={15} /> Detener dictado</>
                      ) : (
                        <><Mic size={15} /> Dictar con voz</>
                      )}
                    </button>

                    {/* Botón "Aplicar resultado" aparece cuando hay resultado listo */}
                    {voice.result && !voice.isProcessing && (
                      voice.result.reason || voice.result.symptoms ||
                      voice.result.findings.length > 0 || voice.result.diagnoses.length > 0
                    ) && (
                      <button
                        id="btn-voice-apply"
                        type="button"
                        onClick={handleVoiceApply}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none',
                          cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600,
                          background: 'rgba(34,197,94,0.12)', color: '#16a34a',
                        }}
                      >
                        ✓ Aplicar resultado
                      </button>
                    )}
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Ocupación del Paciente</label>
                  <input className="input-field" type="text" value={triage.occupation} onChange={e => { setTriage(p => ({ ...p, occupation: e.target.value })); markDirty(); }} placeholder="Profesión u oficio..." />
                </div>
                <div className="field-group">
                  <label className="field-label">Motivo de consulta *</label>
                  <textarea className="input-field" rows={3} value={triage.reason} onChange={e => { setTriage(p => ({ ...p, reason: e.target.value })); markDirty(); }} placeholder="¿Por qué acude el paciente?" />
                </div>
                <div className="field-group">
                  <label className="field-label">Síntomas y Evolución</label>
                  <textarea className="input-field" rows={4} value={triage.symptoms} onChange={e => { setTriage(p => ({ ...p, symptoms: e.target.value })); markDirty(); }} placeholder="Detalle de los síntomas referidos..." />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="form-section">
              <div className="section-title"><Activity size={18} /> Información Médica Base</div>
              <div className="form-grid cols-3">
                <div className="field-group">
                  <label className="field-label">Grupo Sanguíneo</label>
                  <select className="input-field" value={history.bloodType} onChange={e => { setHistory(p => ({ ...p, bloodType: e.target.value })); markDirty(); }}>
                    <option value="">Desconocido</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">Enfermedades Crónicas</label>
                  <input className="input-field" type="text" value={history.chronicDiseases} onChange={e => { setHistory(p => ({ ...p, chronicDiseases: e.target.value })); markDirty(); }} placeholder="Diabetes, HTA, etc..." />
                </div>
                <div className="field-group">
                  <label className="field-label">Cirugías Previas</label>
                  <input className="input-field" type="text" value={history.surgeries} onChange={e => { setHistory(p => ({ ...p, surgeries: e.target.value })); markDirty(); }} placeholder="Detalle intervenciones..." />
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
                        <input type="checkbox" checked={history.motherIsAlive} onChange={e => { setHistory(p => ({ ...p, motherIsAlive: e.target.checked })); markDirty(); }} />
                        ¿Vive?
                      </label>
                    </div>
                    <textarea className="input-field" rows={3} value={history.motherHistory} onChange={e => { setHistory(p => ({ ...p, motherHistory: e.target.value })); markDirty(); }} placeholder="Enfermedades hereditarias..." />
                    {!history.motherIsAlive && (
                      <input className="input-field" style={{ marginTop: '0.5rem' }} type="text" placeholder="Causa de muerte" value={history.motherCauseOfDeath} onChange={e => { setHistory(p => ({ ...p, motherCauseOfDeath: e.target.value })); markDirty(); }} />
                    )}
                  </div>
                  {/* Padre */}
                  <div className="field-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="field-label">Línea Paterna</label>
                      <label className="habit-check" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>
                        <input type="checkbox" checked={history.fatherIsAlive} onChange={e => { setHistory(p => ({ ...p, fatherIsAlive: e.target.checked })); markDirty(); }} />
                        ¿Vive?
                      </label>
                    </div>
                    <textarea className="input-field" rows={3} value={history.fatherHistory} onChange={e => { setHistory(p => ({ ...p, fatherHistory: e.target.value })); markDirty(); }} placeholder="Enfermedades hereditarias..." />
                    {!history.fatherIsAlive && (
                      <input className="input-field" style={{ marginTop: '0.5rem' }} type="text" placeholder="Causa de muerte" value={history.fatherCauseOfDeath} onChange={e => { setHistory(p => ({ ...p, fatherCauseOfDeath: e.target.value })); markDirty(); }} />
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section" style={{ marginTop: '2rem' }}>
                <div className="section-title">Hábitos del Paciente</div>
                <div className="habits-grid" style={{ gap: '1.5rem' }}>
                  {[
                    { k: 'sedentary', l: 'Sedentarismo' },
                    { k: 'alcohol', l: 'Consumo de Alcohol' },
                    { k: 'smoking', l: 'Tabaquismo' },
                    { k: 'drugs', l: 'Uso de Drogas' },
                  ].map(h => (
                    <label key={h.k} className="habit-check">
                      <input type="checkbox" checked={(history as any)[h.k]} onChange={e => { setHistory(p => ({ ...p, [h.k]: e.target.checked })); markDirty(); }} />
                      {h.l}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clinical' && (
            <div className="form-section">
              <div className="section-title"><ClipboardList size={18} /> Hallazgos al Examen Físico</div>
              <div className="list-container">
                {findings.map((f, i) => (
                  <div key={i} className="list-item">
                    <div className="item-fields">
                      <textarea className="input-field" rows={2} value={f.description} onChange={e => {
                        setFindings(p => p.map((item, idx) => idx === i ? { ...item, description: e.target.value } : item));
                        markDirty();
                      }} placeholder="Describa el hallazgo clínico..." />
                    </div>
                    <button className="delete-btn" onClick={() => { setFindings(p => p.filter((_, idx) => idx !== i)); markDirty(); }}><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
              <button className="add-btn" onClick={() => { setFindings(p => [...p, { description: '' }]); markDirty(); }}><Plus size={18} /> Agregar hallazgo</button>

              <div className="form-section" style={{ marginTop: '2rem' }}>
                <div className="section-title"><Stethoscope size={18} /> Diagnósticos Presuntivos / Definitivos</div>
                <div className="list-container">
                  {diagnoses.map((d, i) => (
                    <div key={i} className="list-item">
                      <div className="item-fields">
                        <div className="form-grid">
                          <input className="input-field" type="text" placeholder="Código CIE-10" value={d.codeCIE10} onChange={e => {
                            setDiagnoses(p => p.map((item, idx) => idx === i ? { ...item, codeCIE10: e.target.value } : item));
                            markDirty();
                          }} />
                        </div>
                        <textarea className="input-field" rows={2} value={d.description} onChange={e => {
                          setDiagnoses(p => p.map((item, idx) => idx === i ? { ...item, description: e.target.value } : item));
                          markDirty();
                        }} placeholder="Descripción del diagnóstico..." />
                      </div>
                      <button className="delete-btn" onClick={() => { setDiagnoses(p => p.filter((_, idx) => idx !== i)); markDirty(); }}><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
                <button className="add-btn" onClick={() => { setDiagnoses(p => [...p, { description: '', codeCIE10: '' }]); markDirty(); }}><Plus size={18} /> Agregar diagnóstico</button>
              </div>
            </div>
          )}

          {activeTab === 'rx' && (
            <div className="form-section">
              <div className="section-title"><Pill size={18} /> Plan de Tratamiento y Farmacología</div>
              <div className="list-container">
                {treatments.map((t, i) => (
                  <div key={i} className="list-item">
                    <div className="item-fields">
                      <div className="form-grid">
                        <input className="input-field" type="text" placeholder="Medicamento" value={t.medication} onChange={e => {
                          setTreatments(p => p.map((item, idx) => idx === i ? { ...item, medication: e.target.value } : item));
                          markDirty();
                        }} />
                        <input className="input-field" type="text" placeholder="Dosis / Frecuencia" value={t.dosage} onChange={e => {
                          setTreatments(p => p.map((item, idx) => idx === i ? { ...item, dosage: e.target.value } : item));
                          markDirty();
                        }} />
                      </div>
                      <textarea className="input-field" rows={2} value={t.instructions} onChange={e => {
                        setTreatments(p => p.map((item, idx) => idx === i ? { ...item, instructions: e.target.value } : item));
                        markDirty();
                      }} placeholder="Instrucciones para el paciente..." />
                    </div>
                    <button className="delete-btn" onClick={() => { setTreatments(p => p.filter((_, idx) => idx !== i)); markDirty(); }}><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
              <button className="add-btn" onClick={() => { setTreatments(p => [...p, { medication: '', dosage: '', instructions: '' }]); markDirty(); }}><Plus size={18} /> Agregar medicamento</button>


              <div className="section-title"><FlaskConical size={18} /> Exámenes y Paraclínicos Solicitados</div>
              
              <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Cargar desde Plantilla:
                </span>
                <select 
                  className="input-field" 
                  style={{ maxWidth: '300px' }}
                  defaultValue="" 
                  onChange={ev => {
                    if (ev.target.value) {
                      handleAddTemplateExams(Number(ev.target.value));
                      ev.target.value = ""; 
                    }
                  }}
                >
                  <option value="">-- Seleccionar Plantilla --</option>
                  {labTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="list-container">
                {exams.map((e, i) => (
                  <div key={i} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
                    <div className="item-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: '1rem', alignItems: 'center' }}>
                      <select className="input-field" value={e.type} onChange={ev => {
                        setExams(p => p.map((item, idx) => idx === i ? { ...item, type: ev.target.value as any } : item));
                        markDirty();
                      }}>
                        <option value="LABORATORIO">Laboratorio</option>
                        <option value="IMAGNES">Imágenes</option>
                        <option value="OTROS">Otros</option>
                      </select>
                      <input 
                        className="input-field" 
                        type="text" 
                        placeholder="Ej. Hemoglobina..." 
                        value={e.name} 
                        onChange={ev => {
                          setExams(p => p.map((item, idx) => idx === i ? { ...item, name: ev.target.value } : item));
                          markDirty();
                        }}
                        disabled={!!e.labExamDetailId}
                      />
                      <input 
                        className="input-field" 
                        type="text" 
                        placeholder="Valor de referencia (opcional)..." 
                        value={e.referenceValues || ''} 
                        onChange={ev => {
                          setExams(p => p.map((item, idx) => idx === i ? { ...item, referenceValues: ev.target.value } : item));
                          markDirty();
                        }}
                        disabled={!!e.labExamDetailId}
                      />
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
                          <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                            Esperando resultados del laboratorio
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                      <button className="delete-btn" onClick={() => { setExams(p => p.filter((_, idx) => idx !== i)); markDirty(); }}><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="add-btn" onClick={() => { setExams(p => [...p, { name: '', status: 'PENDING', type: 'LABORATORIO', referenceValues: '' }]); markDirty(); }}><Plus size={18} /> Solicitar examen</button>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};
