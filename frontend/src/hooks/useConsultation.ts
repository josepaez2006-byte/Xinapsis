import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Finding    { id?: number; description: string }
export interface Diagnosis  { id?: number; description: string; codeCIE10: string }
export interface Treatment  { id?: number; medication: string; dosage: string; instructions: string }
export interface ExamReq    {
  id?: number;
  name: string;
  status: string;
  type: 'LABORATORIO' | 'IMAGENES' | 'OTROS';
  referenceValues: string;
  results?: string;
  labExamDetailId?: number;
}

export interface MedicalHistoryForm {
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

export interface TriageForm {
  weight: string;
  height: string;
  bloodPressure: string;
  heartRate: string;
  occupation: string;
  reason: string;
  symptoms: string;
}

export const emptyTriage: TriageForm = {
  weight: '', height: '', bloodPressure: '', heartRate: '',
  occupation: '', reason: '', symptoms: '',
};

export const emptyHistory: MedicalHistoryForm = {
  fatherHistory: '', fatherIsAlive: true, fatherCauseOfDeath: '',
  motherHistory: '', motherIsAlive: true, motherCauseOfDeath: '',
  bloodType: '', chronicDiseases: '', surgeries: '',
  sedentary: false, alcohol: false, smoking: false, drugs: false, otherToxicHabits: '',
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useConsultation(id: string | undefined) {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();

  const mode         = id ? 'view' : 'create';
  const appointmentId = parseInt(searchParams.get('appointmentId') || '0');

  const [patientId,              setPatientId]              = useState<number>(parseInt(searchParams.get('patientId') || '0'));
  const [doctorIdFromAppointment, setDoctorIdFromAppointment] = useState<number | null>(null);
  const [patientName,            setPatientName]            = useState('');
  const [patientDni,             setPatientDni]             = useState('');
  const [isLoading,              setIsLoading]              = useState(true);
  const [isSaving,               setIsSaving]               = useState(false);
  const [isDirty,                setIsDirty]                = useState(false);
  const [labTemplates,           setLabTemplates]           = useState<any[]>([]);

  // Form state
  const [triage,     setTriage]     = useState<TriageForm>(emptyTriage);
  const [history,    setHistory]    = useState<MedicalHistoryForm>(emptyHistory);
  const [findings,   setFindings]   = useState<Finding[]>([{ description: '' }]);
  const [diagnoses,  setDiagnoses]  = useState<Diagnosis[]>([{ description: '', codeCIE10: '' }]);
  const [treatments, setTreatments] = useState<Treatment[]>([{ medication: '', dosage: '', instructions: '' }]);
  const [exams,      setExams]      = useState<ExamReq[]>([{ name: '', status: 'PENDING', type: 'LABORATORIO', referenceValues: '' }]);

  const markDirty = useCallback(() => setIsDirty(prev => prev ? prev : true), []);

  // ── Load lab templates ────────────────────────────────────────────────────────
  useEffect(() => {
    api.get<any[]>('/lab-exams')
      .then(data => setLabTemplates(data))
      .catch(err  => console.error('Error fetching templates:', err));
  }, []);

  // ── Load patient data ─────────────────────────────────────────────────────────
  const loadPatientData = useCallback(async (pId: number) => {
    try {
      const p = await api.get<any>(`/patients/${pId}`);
      setPatientName(`${p.firstName} ${p.lastName}`);
      setPatientDni(p.dni);

      setHistory(p.medicalHistory ? {
        fatherHistory:      p.medicalHistory.fatherHistory || '',
        fatherIsAlive:      p.medicalHistory.fatherIsAlive ?? true,
        fatherCauseOfDeath: p.medicalHistory.fatherCauseOfDeath || '',
        motherHistory:      p.medicalHistory.motherHistory || '',
        motherIsAlive:      p.medicalHistory.motherIsAlive ?? true,
        motherCauseOfDeath: p.medicalHistory.motherCauseOfDeath || '',
        bloodType:          p.medicalHistory.bloodType || '',
        chronicDiseases:    p.medicalHistory.chronicDiseases || '',
        surgeries:          p.medicalHistory.surgeries || '',
        sedentary:          p.medicalHistory.sedentary ?? false,
        alcohol:            p.medicalHistory.alcohol ?? false,
        smoking:            p.medicalHistory.smoking ?? false,
        drugs:              p.medicalHistory.drugs ?? false,
        otherToxicHabits:   p.medicalHistory.otherToxicHabits || '',
      } : { ...emptyHistory });
    } catch (err) {
      console.error('Error loading patient data:', err);
    }
  }, []);

  // ── Load existing consultation ────────────────────────────────────────────────
  const loadConsultation = useCallback(async (cId: number) => {
    try {
      const c = await api.get<any>(`/consultations/${cId}`);
      setPatientId(c.patientId);
      await loadPatientData(c.patientId);

      setTriage({
        weight:        c.weight?.toString()      || '',
        height:        c.height?.toString()      || '',
        bloodPressure: c.bloodPressure           || '',
        heartRate:     c.heartRate?.toString()   || '',
        occupation:    c.occupation              || '',
        reason:        c.reason                  || '',
        symptoms:      c.symptoms                || '',
      });

      setFindings(  c.findings?.length    ? c.findings                                                                                                                          : [{ description: '' }]);
      setDiagnoses( c.diagnoses?.length   ? c.diagnoses.map( (d: any) => ({ ...d, codeCIE10:    d.codeCIE10    || '' }))                                                        : [{ description: '', codeCIE10: '' }]);
      setTreatments(c.treatments?.length  ? c.treatments.map((t: any) => ({ ...t, dosage:       t.dosage       || '', instructions: t.instructions || '' }))                    : [{ medication: '', dosage: '', instructions: '' }]);
      setExams(     c.examsRequested?.length ? c.examsRequested.map((e: any) => ({ ...e, type:  e.type         || 'LABORATORIO', referenceValues: e.referenceValues || '' })) : [{ name: '', status: 'PENDING', type: 'LABORATORIO', referenceValues: '' }]);

      setIsDirty(false);
    } catch (err) {
      console.error('Error loading consultation:', err);
    }
  }, [loadPatientData]);

  // ── Init ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      if (mode === 'create') {
        if (patientId) await loadPatientData(patientId);
        if (appointmentId) {
          try {
            const appt = await api.get<any>(`/appointments/${appointmentId}`);
            if (appt.consultation) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, patientId]);

  // ── Prevent data loss ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // ── Discard ───────────────────────────────────────────────────────────────────
  const handleDiscard = async () => {
    if (!isDirty) return;

    let confirmed = false;
    try {
      confirmed = window.confirm('¿Estás seguro de que deseas descartar los cambios no guardados? Se restaurarán los datos originales.');
    } catch { confirmed = true; }
    if (!confirmed) return;

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
      }
    } catch (err) {
      console.error('Error discarding changes:', err);
      alert('Hubo un error al descartar los cambios.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!triage.reason.trim()) {
      alert('El motivo de consulta es obligatorio.');
      return 'triage'; // Return tab to switch to
    }

    setIsSaving(true);
    try {
      let currentConsultationId = mode === 'view' ? parseInt(id!) : null;

      const consultationPayload = {
        ...(appointmentId && { appointmentId }),
        patientId: mode === 'create' ? patientId : undefined,
        doctorId:  doctorIdFromAppointment || user?.doctorId,
        weight:        triage.weight       ? parseFloat(triage.weight)      : null,
        height:        triage.height       ? parseFloat(triage.height)      : null,
        bloodPressure: triage.bloodPressure || null,
        heartRate:     triage.heartRate    ? parseInt(triage.heartRate)     : null,
        occupation:    triage.occupation   || null,
        reason:        triage.reason,
        symptoms:      triage.symptoms     || null,
        findings:   findings.filter(  f => f.description.trim()),
        diagnoses:  diagnoses.filter( d => d.description.trim()),
        treatments: treatments.filter(t => t.medication.trim()),
        exams:      exams.filter(     e => e.name.trim()),
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

      // Upsert historial médico
      try {
        await api.put(`/medical-histories/patient/${patientId}`, {
          fatherHistory:      history.fatherHistory      || null,
          fatherIsAlive:      history.fatherIsAlive,
          fatherCauseOfDeath: history.fatherCauseOfDeath || null,
          motherHistory:      history.motherHistory      || null,
          motherIsAlive:      history.motherIsAlive,
          motherCauseOfDeath: history.motherCauseOfDeath || null,
          bloodType:          history.bloodType          || null,
          chronicDiseases:    history.chronicDiseases    || null,
          surgeries:          history.surgeries          || null,
          sedentary:          history.sedentary,
          alcohol:            history.alcohol,
          smoking:            history.smoking,
          drugs:              history.drugs,
          otherToxicHabits:   history.otherToxicHabits  || null,
        });
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

      return null; // No tab switch needed
    } catch (err: any) {
      alert(`Error al guardar la consulta: ${err.message}`);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // ── Template helper ───────────────────────────────────────────────────────────
  const handleAddTemplateExams = useCallback((templateId: number) => {
    const template = labTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newExams: ExamReq[] = template.details.map((d: any) => ({
      name:             d.name,
      status:           'PENDING',
      type:             'LABORATORIO' as const,
      referenceValues:  d.referenceValue,
      labExamDetailId:  d.id,
    }));

    setExams(prev => [...prev.filter(e => e.name.trim()), ...newExams]);
    markDirty();
  }, [labTemplates, markDirty]);

  return {
    // State
    mode, patientId, patientName, patientDni,
    appointmentId, isLoading, isSaving, isDirty,
    labTemplates,
    // Form state
    triage, setTriage,
    history, setHistory,
    findings, setFindings,
    diagnoses, setDiagnoses,
    treatments, setTreatments,
    exams, setExams,
    // Actions
    markDirty, handleSave, handleDiscard, handleAddTemplateExams,
    navigate,
  };
}
