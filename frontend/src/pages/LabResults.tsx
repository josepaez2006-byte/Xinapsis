import React, { useState } from 'react';
import { Search, Save, CheckCircle, AlertCircle, FlaskConical, User } from 'lucide-react';
import { api } from '../utils/api';
import './LabResults.css';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  dateOfBirth: string;
  sex: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
}

interface Consultation {
  id: number;
  datetime: string;
  patient: Patient;
  doctor: Doctor;
}

interface PendingExam {
  id: number;
  name: string;
  type: string;
  status: string;
  referenceValues: string;
  results: string | null;
  requestedInConsultation: Consultation;
}

export const LabResults: React.FC = () => {
  const [dni, setDni] = useState('');
  const [exams, setExams] = useState<PendingExam[]>([]);
  const [resultsValues, setResultsValues] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');
    setExams([]);
    setResultsValues({});

    try {
      // Fetch pending exams of type LABORATORIO by patient DNI
      const pendingExams = await api.get<PendingExam[]>(`/exams?pending=true&dni=${dni.trim()}`);
      setExams(pendingExams);
      
      // Initialize inputs state
      const initialValues: Record<number, string> = {};
      pendingExams.forEach(e => {
        initialValues[e.id] = '';
      });
      setResultsValues(initialValues);
      setSearched(true);
    } catch (err: any) {
      setError(err.message || 'Error al buscar los exámenes del paciente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultChange = (examId: number, val: string) => {
    setResultsValues(prev => ({
      ...prev,
      [examId]: val
    }));
  };

  const handleSaveResults = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if any results are empty
    const filledExams = exams.filter(exam => resultsValues[exam.id]?.trim() !== '');
    if (filledExams.length === 0) {
      setError('Por favor complete al menos un resultado.');
      return;
    }

    setIsSaving(true);
    try {
      // Save each result individually
      for (const exam of filledExams) {
        await api.put(`/exams/${exam.id}`, {
          status: 'COMPLETED',
          results: resultsValues[exam.id].trim()
        });
      }

      setSuccess('Resultados cargados exitosamente.');
      // Remove successfully completed exams from the current screen view
      const remainingExams = exams.filter(exam => !filledExams.find(fe => fe.id === exam.id));
      setExams(remainingExams);
      
      // Clean values
      const updatedValues = { ...resultsValues };
      filledExams.forEach(fe => {
        delete updatedValues[fe.id];
      });
      setResultsValues(updatedValues);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar los resultados.');
    } finally {
      setIsSaving(false);
    }
  };

  // Group exams by Consultation to show patient info clearly
  const patient = exams.length > 0 ? exams[0].requestedInConsultation.patient : null;
  const doctor = exams.length > 0 ? exams[0].requestedInConsultation.doctor : null;
  const consultationDate = exams.length > 0 ? new Date(exams[0].requestedInConsultation.datetime).toLocaleDateString('es-VE') : '';

  const calculateAge = (dob: string) => {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <div className="lab-results-page">
      <div className="search-section glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <FlaskConical size={24} color="var(--accent-color)" />
          <h3>Cargar Resultados de Laboratorio</h3>
        </div>

        <form onSubmit={handleSearch} className="search-bar-row">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Ingrese la Cédula (DNI) del paciente..."
              className="input-field search-input"
              value={dni}
              onChange={e => setDni(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Buscando...' : 'Buscar Paciente'}
          </button>
        </form>

        {error && (
          <div className="alert-message error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-message success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}
      </div>

      {searched && (
        <div className="results-worklist-section">
          {exams.length === 0 ? (
            <div className="empty-results glass-panel">
              <CheckCircle size={48} color="var(--accent-color)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h4>No se encontraron exámenes de laboratorio pendientes</h4>
              <p>El paciente con C.I. {dni} no posee solicitudes de laboratorio activas sin procesar.</p>
            </div>
          ) : (
            <form onSubmit={handleSaveResults} className="results-form-layout">
              {/* Patient Info Header */}
              {patient && (
                <div className="patient-summary-banner glass-panel">
                  <div className="banner-avatar">
                    <User size={30} color="var(--accent-color)" />
                  </div>
                  <div className="banner-details">
                    <div className="patient-name-title">
                      <h4>{patient.firstName} {patient.lastName}</h4>
                      <span className="badge-gender">{patient.sex}</span>
                    </div>
                    <div className="patient-meta-grid">
                      <span><strong>C.I.:</strong> {patient.dni}</span>
                      <span><strong>Edad:</strong> {calculateAge(patient.dateOfBirth)} años</span>
                      <span><strong>Médico Solicitante:</strong> Dr. {doctor?.firstName} {doctor?.lastName}</span>
                      <span><strong>Fecha Solicitud:</strong> {consultationDate}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Indicators Checklist */}
              <div className="pending-exams-list glass-panel">
                <div className="list-header-row">
                  <span>Examen / Indicador Solicitado</span>
                  <span>Rango de Referencia</span>
                  <span>Resultado</span>
                </div>

                <div className="exams-inputs-list">
                  {exams.map(exam => (
                    <div key={exam.id} className="exam-input-item-row">
                      <div className="exam-label-col">
                        <strong>{exam.name}</strong>
                      </div>
                      <div className="exam-ref-col">
                        <span className="ref-badge">{exam.referenceValues || 'N/A'}</span>
                      </div>
                      <div className="exam-input-col">
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Ingrese el valor..."
                          value={resultsValues[exam.id] || ''}
                          onChange={e => handleResultChange(exam.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-actions-footer">
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    <Save size={18} /> {isSaving ? 'Guardando...' : 'Cargar y Guardar Resultados'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
