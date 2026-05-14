import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, PowerOff, Building2, Users, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../utils/api';
import { ClinicModal } from '../components/ClinicModal';
import { ClinicAdminsModal } from '../components/ClinicAdminsModal';
import './ClinicsManagement.css';

interface Clinic {
  id: number;
  name: string;
  rif?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  _count?: { users: number; patients: number };
}

export const ClinicsManagement: React.FC = () => {
  const [clinics, setClinics]         = useState<Clinic[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [adminsModalClinic, setAdminsModalClinic] = useState<Clinic | null>(null);

  const fetchClinics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<Clinic[]>('/clinics');
      setClinics(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clínicas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClinics(); }, [fetchClinics]);

  const handleToggleActive = async (clinic: Clinic) => {
    const action = clinic.isActive ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Seguro que deseas ${action} la clínica "${clinic.name}"?`)) return;
    try {
      await api.put(`/clinics/${clinic.id}`, { isActive: !clinic.isActive });
      fetchClinics();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openCreate = () => { setEditingClinic(null); setModalOpen(true); };
  const openEdit   = (c: Clinic) => { setEditingClinic(c); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingClinic(null); };
  const onSuccess  = () => { closeModal(); fetchClinics(); };

  // Stats
  const totalClinics  = clinics.length;
  const activeClinics = clinics.filter(c => c.isActive).length;
  const totalUsers    = clinics.reduce((s, c) => s + (c._count?.users ?? 0), 0);
  const totalPatients = clinics.reduce((s, c) => s + (c._count?.patients ?? 0), 0);

  return (
    <div className="clinics-page">
      {/* Header */}
      <div className="clinics-header">
        <div>
          <h1>Gestión de Clínicas</h1>
          <p>Panel exclusivo de SUPER_ADMIN · Administra todos los tenants de Xinapsis</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Nueva Clínica
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: 'Total Clínicas',  value: totalClinics,  color: '#0ea5e9', Icon: Building2 },
          { label: 'Activas',         value: activeClinics, color: '#22c55e', Icon: CheckCircle },
          { label: 'Total Usuarios',  value: totalUsers,    color: '#a855f7', Icon: Users },
          { label: 'Total Pacientes', value: totalPatients, color: '#f59e0b', Icon: Users },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="glass-panel stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${color}18` }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <h3>{value}</h3>
              <p>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && <div className="error-banner">{error}</div>}

      {/* Table */}
      <div className="glass-panel clinics-table-wrapper">
        {loading ? (
          <div className="empty-state">
            <p>Cargando clínicas...</p>
          </div>
        ) : (
          <table className="clinics-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Clínica</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Usuarios</th>
                <th>Pacientes</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clinics.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <Building2 size={48} />
                      <p>No hay clínicas registradas aún.</p>
                      <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openCreate}>
                        <Plus size={16} /> Crear la primera clínica
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                clinics.map(clinic => (
                  <tr key={clinic.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>#{clinic.id}</td>
                    <td>
                      <p className="clinic-name">{clinic.name}</p>
                      {clinic.rif && <p className="clinic-rif">RIF: {clinic.rif}</p>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {clinic.phone || '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '200px' }}>
                      {clinic.address || '—'}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{clinic._count?.users ?? 0}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{clinic._count?.patients ?? 0}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${clinic.isActive ? 'active' : 'inactive'}`}>
                        {clinic.isActive
                          ? <><CheckCircle size={12} /> Activa</>
                          : <><XCircle size={12} /> Inactiva</>
                        }
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="action-btn"
                          onClick={() => setAdminsModalClinic(clinic)}
                          title="Gestionar Administradores"
                        >
                          <Users size={16} />
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => openEdit(clinic)}
                          title="Editar clínica"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className={`action-btn ${clinic.isActive ? 'danger' : ''}`}
                          onClick={() => handleToggleActive(clinic)}
                          title={clinic.isActive ? 'Desactivar' : 'Activar'}
                          style={{ color: clinic.isActive ? undefined : '#22c55e' }}
                        >
                          <PowerOff size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {modalOpen && (
        <ClinicModal
          clinic={editingClinic}
          onClose={closeModal}
          onSuccess={onSuccess}
        />
      )}
      
      {adminsModalClinic && (
        <ClinicAdminsModal
          clinic={adminsModalClinic}
          onClose={() => {
            setAdminsModalClinic(null);
            fetchClinics();
          }}
        />
      )}
    </div>
  );
};
