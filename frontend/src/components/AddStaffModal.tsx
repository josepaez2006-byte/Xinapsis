import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../utils/api';

export const AddStaffModal: React.FC<{ onClose: () => void, onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [roleName, setRoleName] = useState<'ASSISTANT' | 'DOCTOR'>('ASSISTANT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Doctor fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [medicalLicense, setMedicalLicense] = useState('');
  const [rif, setRif] = useState('');
  const [phone, setPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  // Assistant fields (some shared)
  const [dni, setDni] = useState('');
  const [schedule, setSchedule] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // El clinicId NO se envía en el payload — el backend lo extrae del JWT del admin autenticado
    const payload = {
      email,
      password,
      roleName,
      ...(roleName === 'DOCTOR' ? {
        doctorData: { firstName, lastName, specialty, medicalLicense, rif, phone, contactEmail }
      } : {}),
      ...(roleName === 'ASSISTANT' ? {
        assistantData: { firstName, lastName, dni, phone, schedule }
      } : {})
    };

    try {
      await api.post('/auth/register', payload);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
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
        
        <h2 style={{ marginBottom: '1.5rem' }}>Añadir Nuevo Empleado</h2>
        
        {error && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Rol del Empleado</label>
            <select className="input-field" value={roleName} onChange={(e) => setRoleName(e.target.value as any)}>
              <option value="ASSISTANT">Asistente / Recepcionista</option>
              <option value="DOCTOR">Doctor / Médico</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
              <input type="email" required className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Contraseña Temporal</label>
              <input type="password" required minLength={8} className="input-field" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          {roleName === 'DOCTOR' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Perfil Médico</h3>
              
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
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Especialidad</label>
                  <input type="text" required className="input-field" placeholder="Ej. Cardiología" value={specialty} onChange={e => setSpecialty(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nro. de Colegiado</label>
                  <input type="text" required className="input-field" value={medicalLicense} onChange={e => setMedicalLicense(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>RIF</label>
                  <input type="text" className="input-field" placeholder="Opcional" value={rif} onChange={e => setRif(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Teléfono</label>
                  <input type="text" className="input-field" placeholder="Opcional" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Correo de Contacto Secundario</label>
                  <input type="email" className="input-field" placeholder="Opcional" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {roleName === 'ASSISTANT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Perfil Asistente</h3>
              
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
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Cédula</label>
                  <input type="text" required className="input-field" value={dni} onChange={e => setDni(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Teléfono</label>
                  <input type="text" className="input-field" placeholder="Opcional" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Horario de Trabajo</label>
                  <input type="text" className="input-field" placeholder="Ej. Lunes a Viernes, 8am a 4pm" value={schedule} onChange={e => setSchedule(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Crear Empleado'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
