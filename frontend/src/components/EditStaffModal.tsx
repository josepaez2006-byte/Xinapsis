import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../utils/api';

interface StaffUser {
  id: number;
  email: string;
  role: { name: string };
  doctor?: {
    firstName: string;
    lastName: string;
    specialty: string;
    medicalLicense: string;
    rif?: string | null;
    phone?: string | null;
    contactEmail?: string | null;
    otherSpecialties?: string | null;
  };
  assistant?: {
    firstName: string;
    lastName: string;
    dni: string;
    phone?: string | null;
    schedule?: string | null;
  };
}

export const EditStaffModal: React.FC<{ 
  staff: StaffUser, 
  onClose: () => void, 
  onSuccess: () => void 
}> = ({ staff, onClose, onSuccess }) => {
  const [email, setEmail] = useState(staff.email);
  
  // Doctor fields
  const [firstName, setFirstName] = useState(staff.doctor?.firstName || staff.assistant?.firstName || '');
  const [lastName, setLastName] = useState(staff.doctor?.lastName || staff.assistant?.lastName || '');
  const [specialty, setSpecialty] = useState(staff.doctor?.specialty || '');
  const [medicalLicense, setMedicalLicense] = useState(staff.doctor?.medicalLicense || '');
  const [rif, setRif] = useState(staff.doctor?.rif || '');
  const [phone, setPhone] = useState(staff.doctor?.phone || staff.assistant?.phone || '');
  const [contactEmail, setContactEmail] = useState(staff.doctor?.contactEmail || '');
  const [otherSpecialties, setOtherSpecialties] = useState(staff.doctor?.otherSpecialties || '');
  
  // Assistant fields
  const [dni, setDni] = useState(staff.assistant?.dni || '');
  const [schedule, setSchedule] = useState(staff.assistant?.schedule || '');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const roleName = staff.role.name;

    const payload = {
      email: email.trim(),
      ...(roleName === 'DOCTOR' ? {
        doctorData: { 
          firstName: firstName.trim(), 
          lastName: lastName.trim(), 
          specialty: specialty.trim(), 
          medicalLicense: medicalLicense.trim(), 
          rif: rif?.trim() || null, 
          phone: phone?.trim() || null, 
          contactEmail: contactEmail?.trim() || null, 
          otherSpecialties: otherSpecialties?.trim() || null 
        }
      } : {}),
      ...(roleName === 'ASSISTANT' ? {
        assistantData: { 
          firstName: firstName.trim(), 
          lastName: lastName.trim(), 
          dni: dni.trim(), 
          phone: phone?.trim() || null, 
          schedule: schedule?.trim() || null 
        }
      } : {})
    };

    try {
      await api.put(`/users/${staff.id}`, payload);
      onSuccess();
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || err.message || 'Error al actualizar usuario');
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
        
        <h2 style={{ marginBottom: '1.5rem' }}>Editar Empleado</h2>
        
        {error && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
            <input type="email" required className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

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

          {staff.role.name === 'DOCTOR' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Especialidad</label>
                  <input type="text" required className="input-field" value={specialty} onChange={e => setSpecialty(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Colegiado</label>
                  <input type="text" required className="input-field" value={medicalLicense} onChange={e => setMedicalLicense(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>RIF</label>
                  <input type="text" className="input-field" value={rif} onChange={e => setRif(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Teléfono</label>
                  <input type="text" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Correo Secundario</label>
                  <input type="email" className="input-field" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Otras Especialidades</label>
                  <input type="text" className="input-field" value={otherSpecialties} onChange={e => setOtherSpecialties(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {staff.role.name === 'ASSISTANT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Cédula</label>
                  <input type="text" required className="input-field" value={dni} onChange={e => setDni(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Teléfono</label>
                  <input type="text" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Horario</label>
                <input type="text" className="input-field" value={schedule} onChange={e => setSchedule(e.target.value)} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
