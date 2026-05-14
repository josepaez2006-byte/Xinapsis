import React, { useState, useEffect } from 'react';
import { AddOfficeModal } from '../components/AddOfficeModal';
import { Plus, Trash2, Edit2, RefreshCw, Building } from 'lucide-react';
import { api } from '../utils/api';

interface Office {
  id: number;
  name: string;
  location?: string;
}

export const OfficesManagement: React.FC = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOffice, setCurrentOffice] = useState<Office | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.get<Office[]>('/offices');
      setOffices(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los consultorios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este consultorio?')) return;
    try {
      await api.delete(`/offices/${id}`);
      setOffices(prev => prev.filter(o => o.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el consultorio');
    }
  };

  const handleEdit = (office: Office) => {
    setCurrentOffice(office);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentOffice(null);
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Gestión de Consultorios</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Administra los espacios físicos de la clínica.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchOffices} disabled={isLoading} title="Recargar">
            <RefreshCw size={18} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button className="btn btn-primary" onClick={handleAddNew}>
            <Plus size={20} />
            Añadir Consultorio
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {!isLoading && offices.map(office => (
          <div key={office.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{office.name}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{office.location || 'Sin ubicación específica'}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button onClick={() => handleEdit(office)} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                <Edit2 size={16} />
                Editar
              </button>
              <button onClick={() => handleDelete(office.id)} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.875rem', color: '#ef4444' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {!isLoading && offices.length === 0 && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No hay consultorios registrados. Empieza añadiendo uno.
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddOfficeModal
          onClose={() => setIsModalOpen(false)}
          officeToEdit={currentOffice}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchOffices();
          }}
        />
      )}
    </div>
  );
};
