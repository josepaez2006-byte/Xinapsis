import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../utils/api';

interface Office {
  id?: number;
  name: string;
  location?: string;
}

interface AddOfficeModalProps {
  onClose: () => void;
  onSuccess: () => void;
  officeToEdit?: Office | null;
}

export const AddOfficeModal: React.FC<AddOfficeModalProps> = ({ onClose, onSuccess, officeToEdit }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (officeToEdit) {
      setName(officeToEdit.name);
      setLocation(officeToEdit.location || '');
    }
  }, [officeToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const payload = { name, location };

    try {
      if (officeToEdit?.id) {
        await api.put(`/offices/${officeToEdit.id}`, payload);
      } else {
        await api.post('/offices', payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar consultorio');
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginBottom: '1.5rem' }}>{officeToEdit ? 'Editar Consultorio' : 'Nuevo Consultorio'}</h2>
        
        {error && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nombre del Consultorio</label>
            <input type="text" required placeholder="Ej. Consultorio 101" className="input-field" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Ubicación / Piso</label>
            <input type="text" placeholder="Ej. Piso 2, Ala Norte" className="input-field" value={location} onChange={e => setLocation(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
