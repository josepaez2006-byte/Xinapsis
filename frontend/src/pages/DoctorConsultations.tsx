import React, { useState, useEffect } from 'react';
import { Stethoscope, Search, FileText, Eye, ClipboardList, TrendingUp, CalendarDays } from 'lucide-react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import './DoctorConsultations.css';

interface Consultation {
  id: number;
  datetime: string;
  reason: string;
  weight?: number;
  height?: number;
  bloodPressure?: string;
  heartRate?: number;
  patient: { id: number; firstName: string; lastName: string; dni: string };
  doctor: { firstName: string; lastName: string };
  appointment?: { id: number; type: string };
  diagnoses: { id: number; description: string; codeCIE10?: string }[];
  findings: { id: number; description: string }[];
  treatments: { id: number; medication: string; dosage?: string; instructions?: string }[];
  examsRequested: { id: number; name: string; status: string }[];
}

export const DoctorConsultations: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filtered, setFiltered] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      consultations.filter(c =>
        `${c.patient?.firstName || ''} ${c.patient?.lastName || ''}`.toLowerCase().includes(q) ||
        (c.reason || '').toLowerCase().includes(q) ||
        (c.diagnoses || []).some(d => (d.description || '').toLowerCase().includes(q))
      )
    );
  }, [search, consultations]);

  const fetchConsultations = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Consultation[]>('/consultations');
      setConsultations(data);
      setFiltered(data);
    } catch (err) {
      console.error('Error fetching consultations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openDrawer = (consultation: Consultation) => {
    navigate(`/dashboard/consultations/${consultation.id}`);
  };

  const stats = {
    total: consultations.length,
    thisMonth: consultations.filter(c => {
      if (!c.datetime) return false;
      const d = new Date(c.datetime);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    withDiagnosis: consultations.filter(c => (c.diagnoses?.length || 0) > 0).length,
    withExams: consultations.filter(c => (c.examsRequested?.length || 0) > 0).length,
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="consultations-page">
      {/* Header */}
      <div className="consultations-header">
        <div className="consultations-title">
          <h1>Mis Consultas</h1>
          <p>Historial completo de consultas médicas atendidas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="consultations-stats">
        <div className="stat-card">
          <div className="stat-icon blue"><ClipboardList size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total consultas</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CalendarDays size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.thisMonth}</span>
            <span className="stat-label">Este mes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Stethoscope size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.withDiagnosis}</span>
            <span className="stat-label">Con diagnóstico</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><TrendingUp size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.withExams}</span>
            <span className="stat-label">Con exámenes</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="consultations-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por paciente, motivo o diagnóstico..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="consultations-table-wrap">
        <table className="consultations-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Fecha y Hora</th>
              <th>Motivo</th>
              <th>Diagnósticos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td><div className="skeleton-line" style={{ width: '160px' }} /></td>
                  <td><div className="skeleton-line" style={{ width: '110px' }} /></td>
                  <td><div className="skeleton-line" style={{ width: '200px' }} /></td>
                  <td><div className="skeleton-line" style={{ width: '140px' }} /></td>
                  <td><div className="skeleton-line" style={{ width: '80px' }} /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <FileText size={48} />
                    <h3>No hay consultas registradas</h3>
                    <p>{search ? 'No se encontraron resultados para la búsqueda.' : 'Las consultas aparecerán aquí una vez que atiendas pacientes desde tu Agenda.'}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} onClick={() => openDrawer(c)}>
                  <td>
                    <div className="patient-cell">
                      <span className="patient-name">{c.patient?.firstName || '—'} {c.patient?.lastName || ''}</span>
                      <span className="patient-sub">CI: {c.patient?.dni || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="patient-cell">
                      <span className="patient-name">{formatDate(c.datetime)}</span>
                      <span className="patient-sub">{formatTime(c.datetime)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="reason-text" title={c.reason}>{c.reason}</span>
                  </td>
                  <td>
                    {(c.diagnoses?.length || 0) > 0 ? (
                      <div className="diagnoses-list">
                        {c.diagnoses!.slice(0, 2).map(d => (
                          <span key={d.id} className="diagnosis-pill">
                            {d.codeCIE10 ? `${d.codeCIE10}: ` : ''}{(d.description || '').substring(0, 30)}{(d.description || '').length > 30 ? '…' : ''}
                          </span>
                        ))}
                        {c.diagnoses!.length > 2 && (
                          <span className="diagnosis-pill">+{c.diagnoses!.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sin diagnóstico</span>
                    )}
                  </td>
                  <td>
                    <button className="action-btn" onClick={e => { e.stopPropagation(); openDrawer(c); }}>
                      <Eye size={14} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
