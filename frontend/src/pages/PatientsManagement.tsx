import React, { useState, useEffect } from 'react';
import { AddPatientModal } from '../components/AddPatientModal';
import { Plus, Trash2, Edit2, Search, RefreshCw, User, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  dateOfBirth: string;
  sex: 'MASCULINO' | 'FEMENINO';
  phone: string;
  email: string;
  createdAt: string;
}

export const PatientsManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.get<Patient[]>('/patients');
      setPatients(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este paciente? Se eliminarán también sus historias médicas asociadas.')) return;
    try {
      await api.delete(`/patients/${id}`);
      setPatients(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el paciente');
    }
  };

  const handleEdit = (patient: Patient) => {
    setCurrentPatient(patient);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentPatient(null);
    setIsModalOpen(true);
  };

  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Gestión de Pacientes</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Administra la base de datos de pacientes de la clínica.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchPatients} disabled={isLoading} title="Recargar">
            <RefreshCw size={18} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button className="btn btn-primary" onClick={handleAddNew}>
            <Plus size={20} />
            Añadir Paciente
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', flex: 1, height: '45px' }}>
          <Search size={20} style={{ color: 'var(--text-secondary)', marginRight: '0.75rem' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', color: 'var(--text-primary)' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
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
              <th style={{ padding: '1rem' }}>Paciente</th>
              <th style={{ padding: '1rem' }}>C.I.</th>
              <th style={{ padding: '1rem' }}>Edad / Sexo</th>
              <th style={{ padding: '1rem' }}>Teléfono</th>
              <th style={{ padding: '1rem' }}>F. Nacimiento</th>
              <th style={{ padding: '1rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Cargando pacientes...
                </td>
              </tr>
            )}
            {!isLoading && filteredPatients.map(patient => (
              <tr key={patient.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                      <User size={18} />
                    </div>
                    <div style={{ fontWeight: 500 }}>{patient.firstName} {patient.lastName}</div>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>{patient.dni}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.875rem' }}>{patient.phone || '-'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{patient.email || '-'}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: patient.sex === 'MASCULINO' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                    color: patient.sex === 'MASCULINO' ? '#0ea5e9' : '#ec4899'
                  }}>
                    {patient.sex}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  {new Date(patient.dateOfBirth).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => navigate(`/dashboard/patients/${patient.id}`)} className="btn btn-secondary" style={{ padding: '0.4rem', borderColor: 'transparent' }} title="Ver Perfil">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => handleEdit(patient)} className="btn btn-secondary" style={{ padding: '0.4rem', borderColor: 'transparent' }} title="Editar">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(patient.id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: '#ef4444', borderColor: 'transparent' }} title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && filteredPatients.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {searchTerm ? 'No se encontraron pacientes que coincidan con la búsqueda' : 'No hay pacientes registrados'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <AddPatientModal
          onClose={() => setIsModalOpen(false)}
          patientToEdit={currentPatient}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchPatients();
          }}
        />
      )}
    </div>
  );
};
