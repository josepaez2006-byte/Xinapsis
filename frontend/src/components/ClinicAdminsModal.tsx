import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Shield, Loader } from 'lucide-react';
import { api } from '../utils/api';

interface AdminUser {
  id: number;
  email: string;
  createdAt: string;
}

interface Clinic {
  id: number;
  name: string;
}

export const ClinicAdminsModal: React.FC<{ clinic: Clinic, onClose: () => void }> = ({ clinic, onClose }) => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get<AdminUser[]>(`/clinics/${clinic.id}/admins`);
      setAdmins(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los administradores');
    } finally {
      setLoading(false);
    }
  }, [clinic.id]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;

    try {
      setAddLoading(true);
      setError('');
      await api.post(`/clinics/${clinic.id}/admins`, {
        email: newEmail,
        password: newPassword
      });
      setNewEmail('');
      setNewPassword('');
      setIsAdding(false);
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Error al crear administrador');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    if (!window.confirm('¿Seguro que deseas revocar a este administrador? No podrá iniciar sesión.')) return;
    try {
      setLoading(true);
      await api.delete(`/clinics/${clinic.id}/admins/${adminId}`);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield color="#0ea5e9" size={24} />
          Admins de {clinic.name}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Estos usuarios tienen control total sobre la clínica, su personal y configuración.
        </p>

        {error && <div className="error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}

        {/* Form to add new admin */}
        {isAdding ? (
          <form onSubmit={handleAddAdmin} style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', marginTop: 0 }}>Registrar Nuevo Admin</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Email de acceso</label>
                <input type="email" required className="input-field" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="admin@clinica.com" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Contraseña temporal</label>
                <input type="password" required minLength={8} className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary">Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={addLoading}>
                {addLoading ? 'Creando...' : 'Crear Admin'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
              <Plus size={16} /> Añadir Administrador
            </button>
          </div>
        )}

        {/* Admins List */}
        <div style={{ borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Usuario (Email)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Fecha de Registro</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && !admins.length ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Loader className="spin" size={24} style={{ margin: '0 auto 1rem' }} />
                    Cargando administradores...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay administradores registrados para esta clínica.
                  </td>
                </tr>
              ) : (
                admins.map(admin => (
                  <tr key={admin.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{admin.email}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem', color: '#ef4444', borderColor: 'transparent', marginLeft: 'auto' }} 
                        title="Revocar acceso"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
