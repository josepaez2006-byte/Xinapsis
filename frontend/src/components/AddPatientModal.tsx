import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../utils/api';

interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  dni: string;
  dateOfBirth: string;
  sex: 'MASCULINO' | 'FEMENINO';
  phone: string;
  email: string;
}

interface AddPatientModalProps {
  onClose: () => void;
  onSuccess: () => void;
  patientToEdit?: Patient | null;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ onClose, onSuccess, patientToEdit }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState<'MASCULINO' | 'FEMENINO'>('MASCULINO');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patientToEdit) {
      setFirstName(patientToEdit.firstName);
      setLastName(patientToEdit.lastName);
      setDni(patientToEdit.dni);
      // Format date to YYYY-MM-DD for input type="date"
      const date = new Date(patientToEdit.dateOfBirth);
      setDateOfBirth(date.toISOString().split('T')[0]);
      setSex(patientToEdit.sex);
      setPhone(patientToEdit.phone || '');
      setEmail(patientToEdit.email || '');
    }
  }, [patientToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const payload = {
      firstName,
      lastName,
      dni,
      dateOfBirth,
      sex,
      phone,
      email
    };

    try {
      if (patientToEdit?.id) {
        await api.put(`/patients/${patientToEdit.id}`, payload);
      } else {
        await api.post('/patients', payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar paciente');
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginBottom: '1.5rem' }}>{patientToEdit ? 'Editar Paciente' : 'Añadir Nuevo Paciente'}</h2>
        
        {error && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nombre</label>
              <input type="text" required className="input-field" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Apellido</label>
              <input type="text" required className="input-field" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>C.I.</label>
              <input type="text" required className="input-field" value={dni} onChange={e => setDni(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Sexo</label>
              <select className="input-field" value={sex} onChange={(e) => setSex(e.target.value as any)}>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Fecha de Nacimiento</label>
              <input type="date" required className="input-field" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Teléfono</label>
              <input type="text" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar Paciente'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
