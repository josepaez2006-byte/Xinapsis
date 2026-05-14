import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from 'lucide-react';
import { api } from '../utils/api';
import { AddAppointmentModal } from '../components/AddAppointmentModal';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SearchableSelect } from '../components/SearchableSelect';
import './AppointmentsManagement.css';

interface Doctor { id: number; firstName: string; lastName: string; specialty: string; }
interface Office { id: number; name: string; }

interface Appointment {
  id: number;
  datetime: string;
  duration: number;
  type: 'PRIMERA_VEZ' | 'CONTROL' | 'EMERGENCIA' | 'PROCEDIMIENTO';
  status: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO';
  isConfirmed: boolean;
  notes?: string;
  patientId: number;
  doctorId: number;
  officeId: number;
  patient: { id: number; firstName: string, lastName: string };
  doctor: { id: number; firstName: string, lastName: string; specialty: string };
  office: { id: number; name: string };
  consultation?: { id: number };
}

export const AppointmentsManagement: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters State
  const [filterDoctorId, setFilterDoctorId] = useState<string>('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('');
  const [filterOfficeId, setFilterOfficeId] = useState<string>('');

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Generate days for the current week view
  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    start.setDate(diff);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: 14 }).map((_, i) => i + 7); // 7 AM to 8 PM

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      const [appData, docData, offData] = await Promise.all([
        api.get<Appointment[]>('/appointments'),
        api.get<Doctor[]>('/doctors'),
        api.get<Office[]>('/offices')
      ]);
      setAppointments(appData);
      setDoctors(docData);
      setOffices(offData);

      const uniqueSpecialties = Array.from(new Set(docData.map(d => d.specialty).filter(Boolean)));
      setSpecialties(uniqueSpecialties);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    let matches = true;
    if (filterDoctorId) {
      matches = matches && app.doctorId.toString() === filterDoctorId;
    }
    if (filterSpecialty) {
      matches = matches && app.doctor?.specialty === filterSpecialty;
    }
    if (filterOfficeId) {
      matches = matches && app.officeId.toString() === filterOfficeId;
    }
    return matches;
  });

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleAppointmentClick = (app: Appointment) => {
    if (user?.role === 'DOCTOR') {
      if (app.status === 'COMPLETADO' && app.consultation) {
        navigate(`/dashboard/consultations/${app.consultation.id}`);
      } else if (app.status === 'PENDIENTE') {
        const pId = app.patientId || app.patient.id;
        navigate(`/dashboard/consultations/new?patientId=${pId}&appointmentId=${app.id}`);
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PRIMERA_VEZ': return '#38bdf8'; // Sky blue
      case 'CONTROL': return '#22c55e';    // Green
      case 'EMERGENCIA': return '#ef4444'; // Red
      case 'PROCEDIMIENTO': return '#a855f7'; // Purple
      default: return 'var(--accent-color)';
    }
  };

  const getStatusOpacity = (status: string) => {
    return status === 'CANCELADO' ? 0.5 : 1;
  };

  return (
    <div className="appointments-container">
      {/* Header Section */}
      <div className="calendar-header">
        <div className="header-left">
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Agenda Médica</h1>
          <div className="date-display">
            {weekDays[0].toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="header-controls">
          <div className="view-switcher">
            <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>Día</button>
            <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>Semana</button>
          </div>

          <div className="navigation-btns">
            <button className="icon-btn" onClick={prevWeek}><ChevronLeft size={20} /></button>
            <button className="btn-secondary" onClick={() => setCurrentDate(new Date())}>Hoy</button>
            <button className="icon-btn" onClick={nextWeek}><ChevronRight size={20} /></button>
          </div>

          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', position: 'relative', zIndex: 10 }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Especialidad</label>
          <select className="input-field" value={filterSpecialty} onChange={e => { setFilterSpecialty(e.target.value); setFilterDoctorId(''); }}>
            <option value="">Todas las especialidades</option>
            {specialties.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Médico</label>
          <SearchableSelect
            options={[
              { value: '', label: 'Todos los médicos' },
              ...doctors
                .filter(d => !filterSpecialty || d.specialty === filterSpecialty)
                .map(d => ({ value: d.id.toString(), label: `Dr. ${d.firstName} ${d.lastName}` }))
            ]}
            value={filterDoctorId}
            onChange={setFilterDoctorId}
            placeholder="Seleccionar médico..."
          />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Consultorio</label>
          <select className="input-field" value={filterOfficeId} onChange={e => setFilterOfficeId(e.target.value)}>
            <option value="">Todos los consultorios</option>
            {offices.map(o => (
              <option key={o.id} value={o.id.toString()}>{o.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-body glass-panel">
        <div className="calendar-grid">
          {/* Timeline Column */}
          <div className="time-column">
            <div className="time-header-cell"></div>
            {hours.map(hour => (
              <div key={hour} className="time-cell">
                {hour}:00
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {(view === 'week' ? weekDays : [currentDate]).map((day, dayIndex) => (
            <div key={dayIndex} className="day-column">
              <div className={`day-header-cell ${day.toDateString() === new Date().toDateString() ? 'today' : ''}`}>
                <span className="day-name">{day.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <span className="day-number">{day.getDate()}</span>
              </div>

              <div className="slots-container">
                {/* Hourly background lines */}
                {hours.map(hour => (
                  <div key={hour} className="slot-line"></div>
                ))}

                {/* Appointments Overlay */}
                {filteredAppointments.filter(app => {
                  const appDate = new Date(app.datetime);
                  return appDate.toDateString() === day.toDateString();
                }).map(app => {
                  const appDate = new Date(app.datetime);
                  const startHour = appDate.getHours();
                  const startMin = appDate.getMinutes();

                  // Calculate top position (relative to 7 AM start)
                  const top = ((startHour - 7) * 60 + startMin) * (60 / 60); // 1px per minute
                  const height = app.duration; // 1px per minute

                  return (
                    <div
                      key={app.id}
                      className={`appointment-block ${app.status.toLowerCase()}`}
                      onClick={() => handleAppointmentClick(app)}
                      title={`Consulta:\n${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}hs\n${app.patient.firstName} ${app.patient.lastName}\nDr. ${app.doctor.firstName} ${app.doctor.lastName} (${app.doctor.specialty || 'N/A'})\n${app.office.name}`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        borderLeftColor: getTypeColor(app.type),
                        opacity: getStatusOpacity(app.status),
                        cursor: (user?.role === 'DOCTOR' && app.status === 'PENDIENTE') ? 'pointer' : 'default'
                      }}
                    >
                      <div className="app-title">
                        {app.patient.firstName} {app.patient.lastName}
                      </div>
                      <div className="app-info">
                        <span><Clock size={10} /> {startHour}:{startMin.toString().padStart(2, '0')}</span>
                        <span><MapPin size={10} /> {app.office.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <AddAppointmentModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }}
          initialDoctorId={filterDoctorId}
        />
      )}

    </div>
  );
};
