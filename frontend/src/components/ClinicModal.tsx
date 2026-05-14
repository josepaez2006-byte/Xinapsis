import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { api } from '../utils/api';

interface ClinicFormData {
  name: string;
  rif: string;
  address: string;
  phone: string;
}

interface Props {
  clinic?: { id: number; name: string; rif?: string; address?: string; phone?: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClinicModal: React.FC<Props> = ({ clinic, onClose, onSuccess }) => {
  const isEditing = Boolean(clinic);
  const [form, setForm] = useState<ClinicFormData>({
    name:    clinic?.name    ?? '',
    rif:     clinic?.rif     ?? '',
    address: clinic?.address ?? '',
    phone:   clinic?.phone   ?? '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre de la clínica es obligatorio.'); return; }
    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        await api.put(`/clinics/${clinic!.id}`, form);
      } else {
        await api.post('/clinics', form);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la clínica');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-panel modal-box">
        <div className="modal-header">
          <div>
            <h2>{isEditing ? 'Editar Clínica' : 'Nueva Clínica'}</h2>
            <p>{isEditing ? `Modificando: ${clinic!.name}` : 'Registro de un nuevo tenant en Xinapsis'}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {error && <div className="error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre de la Clínica *</label>
            <input
              id="name" name="name" type="text" required
              className="input-field"
              placeholder="Ej. Clínica Santa María"
              value={form.name} onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rif">RIF / NIT</label>
              <input
                id="rif" name="rif" type="text"
                className="input-field"
                placeholder="J-12345678-9"
                value={form.rif} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone" name="phone" type="text"
                className="input-field"
                placeholder="+58 212 555 0000"
                value={form.phone} onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Dirección</label>
            <input
              id="address" name="address" type="text"
              className="input-field"
              placeholder="Av. Principal, Edificio Médico, Piso 3"
              value={form.address} onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Building2 size={16} />
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Clínica'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
