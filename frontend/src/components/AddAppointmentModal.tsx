import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../utils/api';
import { SearchableSelect } from './SearchableSelect';

interface Patient { id: number; firstName: string; lastName: string; dni: string; }
interface Doctor { id: number; firstName: string; lastName: string; }
interface Office { id: number; name: string; }

interface AddAppointmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialDoctorId?: string;
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ onClose, onSuccess, initialDoctorId }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState(initialDoctorId || '');
  const [officeId, setOfficeId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00');
  const [duration, setDuration] = useState('30');
  const [type, setType] = useState('CONTROL');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, d, o] = await Promise.all([
          api.get<Patient[]>('/patients'),
          api.get<Doctor[]>('/doctors'),
          api.get<Office[]>('/offices')
        ]);
        setPatients(p);
        setDoctors(d);
        setOffices(o);
        
        if (d.length > 0 && !initialDoctorId) setDoctorId(d[0].id.toString());
        if (o.length > 0) setOfficeId(o[0].id.toString());
      } catch (err) {
        console.error('Error loading form data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId || !officeId) {
      setError('Por favor selecciona paciente, doctor y consultorio');
      return;
    }

    setIsLoading(true);
    setError('');

    const datetime = new Date(`${date}T${time}`).toISOString();

    try {
      await api.post('/appointments', {
        patientId: parseInt(patientId),
        doctorId: parseInt(doctorId),
        officeId: parseInt(officeId),
        datetime,
        duration: parseInt(duration),
        type,
        notes
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear la cita');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginBottom: '1.5rem' }}>Programar Cita</h2>
        
        {error && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 60 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Paciente</label>
            <SearchableSelect
              options={patients.map(p => ({ value: p.id.toString(), label: `${p.firstName} ${p.lastName} - C.I: ${p.dni || 'N/A'}` }))}
              value={patientId}
              onChange={setPatientId}
              placeholder="Buscar por nombre o cédula..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', zIndex: 50 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Doctor</label>
              <SearchableSelect
                options={doctors.map(d => ({ value: d.id.toString(), label: `Dr. ${d.firstName} ${d.lastName}` }))}
                value={doctorId}
                onChange={setDoctorId}
                placeholder="Buscar doctor..."
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Consultorio</label>
              <select className="input-field" value={officeId} onChange={e => setOfficeId(e.target.value)} required>
                {offices.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Fecha</label>
              <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Hora</label>
              <input type="time" className="input-field" value={time} onChange={e => setTime(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Duración (min)</label>
              <select className="input-field" value={duration} onChange={e => setDuration(e.target.value)}>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hora</option>
                <option value="90">1.5 horas</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Tipo de Cita</label>
              <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
                <option value="PRIMERA_VEZ">Primera Vez</option>
                <option value="CONTROL">Control</option>
                <option value="EMERGENCIA">Emergencia</option>
                <option value="PROCEDIMIENTO">Procedimiento</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Notas / Motivo</label>
            <textarea 
              className="input-field" 
              style={{ minHeight: '80px', resize: 'none' }} 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              placeholder="Opcional..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Programar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
