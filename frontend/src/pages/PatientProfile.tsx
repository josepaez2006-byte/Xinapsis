import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Phone, 
  Dna, 
  Activity, 
  History, 
  ChevronLeft,
  FileText,
  Stethoscope
} from 'lucide-react';
import { api } from '../utils/api';
import './PatientProfile.css';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  dateOfBirth: string;
  sex: string;
  phone: string;
  email: string;
  medicalHistory?: any;
}

interface Consultation {
  id: number;
  datetime: string;
  reason: string;
  diagnoses: any[];
  doctor: { firstName: string, lastName: string };
}

export const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    setIsLoading(true);
    try {
      const p = await api.get<Patient>(`/patients/${id}`);
      setPatient(p);
      
      // Fetch consultations for this patient
      // (Assuming the backend supports filtering consultations by patientId)
      const allConsultations = await api.get<Consultation[]>('/consultations');
      const patientConsultations = allConsultations.filter(c => (c as any).patientId === parseInt(id!));
      setConsultations(patientConsultations.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()));
    } catch (err) {
      console.error('Error fetching patient data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openConsultation = (cId: number) => {
    navigate(`/dashboard/consultations/${cId}`);
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando información del paciente...</div>;
  if (!patient) return <div style={{ padding: '2rem', textAlign: 'center' }}>Paciente no encontrado.</div>;

  const calculateAge = (dob: string) => {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <div className="patient-profile">
      <div className="profile-header">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} /> Volver
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/appointments')}>
            <Calendar size={18} /> Agendar Cita
          </button>
        </div>
      </div>

      <div className="profile-summary glass-panel">
        <div className="avatar-large">
          <User size={40} />
        </div>
        <div className="patient-info-main">
          <h1>{patient.firstName} {patient.lastName}</h1>
          <div className="patient-meta">
            <span className="meta-item"><Dna size={14} /> CI: {patient.dni}</span>
            <span className="meta-item"><Calendar size={14} /> {calculateAge(patient.dateOfBirth)} años</span>
            <span className="meta-item"><Activity size={14} /> {patient.sex}</span>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left Column: Fixed Info */}
        <div className="profile-sidebar">
          <div className="info-section glass-panel">
            <h3><Phone size={18} color="var(--accent-color)" /> Contacto</h3>
            <div className="data-row">
              <span className="data-label">Teléfono</span>
              <span className="data-value">{patient.phone || 'No registrado'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Email</span>
              <span className="data-value">{patient.email || 'No registrado'}</span>
            </div>
          </div>

          <div className="info-section glass-panel" style={{ marginTop: '1.5rem' }}>
            <h3><History size={18} color="var(--accent-color)" /> Antecedentes Médicos</h3>
            {patient.medicalHistory ? (
              <>
                <div className="data-row">
                  <span className="data-label">Grupo Sanguíneo</span>
                  <span className="data-value">{patient.medicalHistory.bloodType || 'Desconocido'}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Enfermedades Crónicas</span>
                  <span className="data-value" style={{ fontSize: '0.875rem' }}>{patient.medicalHistory.chronicDiseases || 'Ninguna'}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Cirugías</span>
                  <span className="data-value" style={{ fontSize: '0.875rem' }}>{patient.medicalHistory.surgeries || 'Ninguna'}</span>
                </div>
              </>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No hay antecedentes registrados.</p>
            )}
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="profile-main">
          <div className="info-section glass-panel">
            <h3><Stethoscope size={18} color="var(--accent-color)" /> Historia de Consultas</h3>
            
            {consultations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <FileText size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p>No hay consultas previas registradas.</p>
              </div>
            ) : (
              <div className="timeline">
                {consultations.map(c => (
                  <div key={c.id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content" onClick={() => openConsultation(c.id)}>
                      <div className="timeline-header">
                        <span className="timeline-reason">{c.reason}</span>
                        <span className="timeline-date">
                          {new Date(c.datetime).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="timeline-details">
                        Dr. {c.doctor.firstName} {c.doctor.lastName} • 
                        {c.diagnoses.length > 0 ? ` ${c.diagnoses.map(d => d.description).join(', ')}` : ' Sin diagnóstico'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
