import React, { useState, useEffect } from 'react';
import { AddStaffModal } from '../components/AddStaffModal';
import { EditStaffModal } from '../components/EditStaffModal';
import { Plus, Trash2, RefreshCw, Edit } from 'lucide-react';
import { api } from '../utils/api';

interface StaffUser {
  id: number;
  email: string;
  role: { name: string };
  createdAt: string;
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


export const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.get<StaffUser[]>('/users');
      setStaff(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el personal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este empleado?')) return;
    try {
      await api.delete(`/users/${id}`);
      setStaff(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el usuario');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Gestión de Personal</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchStaff} disabled={isLoading} title="Recargar">
            <RefreshCw size={18} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} />
            Añadir Personal
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Email / Nombre</th>
              <th style={{ padding: '1rem' }}>Rol</th>
              <th style={{ padding: '1rem' }}>Detalles</th>
              <th style={{ padding: '1rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Cargando personal...
                </td>
              </tr>
            )}
            {!isLoading && staff.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>#{user.id}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 500 }}>{user.email}</div>
                  {user.doctor && <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Dr. {user.doctor.firstName} {user.doctor.lastName}</div>}
                  {user.assistant && <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.assistant.firstName} {user.assistant.lastName}</div>}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: user.role.name === 'ADMIN' ? 'rgba(239, 68, 68, 0.1)' : user.role.name === 'DOCTOR' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    color: user.role.name === 'ADMIN' ? '#ef4444' : user.role.name === 'DOCTOR' ? 'var(--accent-color)' : '#22c55e'
                  }}>
                    {user.role.name}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {user.doctor ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.doctor.specialty}</div>
                      {user.doctor.rif && <div>RIF: {user.doctor.rif}</div>}
                      {user.doctor.phone && <div>Tel: {user.doctor.phone}</div>}
                      {user.doctor.contactEmail && <div>Contacto: {user.doctor.contactEmail}</div>}
                    </div>
                  ) : user.assistant ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>C.I: {user.assistant.dni}</div>
                      {user.assistant.phone && <div>Tel: {user.assistant.phone}</div>}
                      {user.assistant.schedule && <div>Horario: {user.assistant.schedule}</div>}
                    </div>
                  ) : '-'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setEditingStaff(user)} className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--accent-color)', borderColor: 'transparent' }} title="Editar">
                      <Edit size={18} />
                    </button>
                    {user.role.name !== 'ADMIN' && (
                      <button onClick={() => handleDelete(user.id)} className="btn btn-secondary" style={{ padding: '0.5rem', color: '#ef4444', borderColor: 'transparent' }} title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && staff.length === 0 && !error && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay personal registrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <AddStaffModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchStaff();
          }}
        />
      )}

      {editingStaff && (
        <EditStaffModal
          staff={editingStaff}
          onClose={() => setEditingStaff(null)}
          onSuccess={() => {
            setEditingStaff(null);
            fetchStaff();
          }}
        />
      )}
    </div>
  );
};

