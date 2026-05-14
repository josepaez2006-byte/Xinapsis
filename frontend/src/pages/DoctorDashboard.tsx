import React, { useState, useEffect } from 'react';
import {
  Calendar,
  FileText,
  Activity,
  Clock,
  ChevronRight,
  ClipboardList,
  UserPlus,
  Search
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import './DoctorDashboard.css';

interface Appointment {
  id: number;
  datetime: string;
  duration: number;
  type: string;
  status: string;
  patient: { id: number; firstName: string; lastName: string };
  office: { name: string };
  patientId: number;
  consultation?: { id: number };
}

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      // Get today's appointments for this doctor
      const data = await api.get<Appointment[]>('/appointments');
      // Filter for current doctor and today
      const today = new Date().toISOString().split('T')[0];
      const filtered = data.filter(a =>
        a.datetime.startsWith(today) &&
        a.status !== 'CANCELADO'
      );
      setAppointments(filtered);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttend = (appointment: Appointment) => {
    if (appointment.consultation) {
      navigate(`/dashboard/consultations/${appointment.consultation.id}`);
    } else {
      navigate(`/dashboard/consultations/new?patientId=${appointment.patientId}&appointmentId=${appointment.id}`);
    }
  };

  const stats = {
    today: appointments.length,
    pending: appointments.filter(a => a.status === 'PENDIENTE').length,
    completed: appointments.filter(a => a.status === 'COMPLETADO').length,
  };

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Panel de Control</h1>
          <p>Bienvenido de nuevo, Dr. {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email.split('@')[0]}</p>
        </div>
        <div className="date-display glass-panel" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar size={18} color="var(--accent-color)" />
          <span style={{ fontWeight: 500 }}>
            {new Date().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="dashboard-stats">
        <div className="stat-card glass-panel">
          <div className="stat-icon blue"><Calendar size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.today}</span>
            <span className="stat-label">Citas hoy</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon orange"><Clock size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pendientes</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon green"><Activity size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Atendidos hoy</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Agenda Section */}
        <div className="dashboard-section glass-panel">
          <div className="section-header">
            <h2 className="section-title"><Clock size={20} color="var(--accent-color)" /> Próximas Citas</h2>
            <Link to="/dashboard/appointments" style={{ color: 'var(--accent-color)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>Ver agenda completa</Link>
          </div>

          <div className="agenda-list">
            {isLoading ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Cargando agenda...</p>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <Calendar size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>No tienes citas programadas para hoy.</p>
              </div>
            ) : (
              appointments.map(app => (
                <div key={app.id} className="agenda-item" onClick={() => handleAttend(app)}>
                  <div className="agenda-time">
                    {new Date(app.datetime).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="agenda-patient">
                    <span className="patient-name">{app.patient.firstName} {app.patient.lastName}</span>
                    <span className="patient-type">{app.type.replace('_', ' ')} • {app.office.name}</span>
                  </div>
                  <div className="agenda-status">
                    <span className={`status-indicator ${app.status.toLowerCase() === 'pendiente' ? 'pending' : 'completed'}`} />
                    {app.status}
                    <ChevronRight size={16} style={{ marginLeft: '0.5rem', opacity: 0.5 }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="dashboard-section glass-panel" style={{ height: 'fit-content' }}>
          <h2 className="section-title"><Activity size={20} color="var(--accent-color)" /> Accesos Rápidos</h2>
          <div className="quick-actions">
            <Link to="/dashboard/patients" className="action-card">
              <div className="action-icon"><Search size={20} /></div>
              <span className="action-text">Buscar Paciente</span>
            </Link>
            <Link to="/dashboard/patients" className="action-card">
              <div className="action-icon"><UserPlus size={20} /></div>
              <span className="action-text">Registrar Nuevo Paciente</span>
            </Link>
            <Link to="/dashboard/medical-histories" className="action-card">
              <div className="action-icon"><ClipboardList size={20} /></div>
              <span className="action-text">Ver Consultas Recientes</span>
            </Link>
            <Link to="/dashboard/medical-histories" className="action-card">
              <div className="action-icon"><FileText size={20} /></div>
              <span className="action-text">Historias Médicas</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};
