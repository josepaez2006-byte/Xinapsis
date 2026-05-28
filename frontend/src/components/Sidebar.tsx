import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, FileText, LogOut, Activity, Building2, LayoutDashboard, ClipboardList, FlaskConical } from 'lucide-react';
import './Sidebar.css';

export const Sidebar: React.FC<{ userRole: string }> = ({ userRole }) => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Activity color="var(--accent-color)" size={32} />
        <h1>Xinapsis</h1>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Inicio
        </NavLink>

        {userRole === 'SUPER_ADMIN' && (
          <NavLink to="/dashboard/clinics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Building2 size={20} />
            Clínicas
          </NavLink>
        )}

        {['ADMIN', 'SUPER_DOCTOR'].includes(userRole) && (
          <NavLink to="/dashboard/staff" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            Personal
          </NavLink>
        )}

        {['ADMIN', 'SUPER_DOCTOR'].includes(userRole) && (
          <NavLink to="/dashboard/offices" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Building2 size={20} />
            Consultorios
          </NavLink>
        )}

        {userRole === 'ASSISTANT' && (
          <NavLink to="/dashboard/patients" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            Pacientes
          </NavLink>
        )}

        {userRole !== 'SUPER_ADMIN' && userRole !== 'LABORATORY' && (
          <NavLink to="/dashboard/appointments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Calendar size={20} />
            Citas y Agenda
          </NavLink>
        )}

        {(userRole === 'ADMIN' || userRole === 'DOCTOR' || userRole === 'SUPER_DOCTOR') && (
          <NavLink to="/dashboard/patients" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            Historias Médicas
          </NavLink>
        )}

        {(userRole === 'ADMIN' || userRole === 'DOCTOR' || userRole === 'SUPER_DOCTOR') && (
          <NavLink to="/dashboard/my-consultations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <ClipboardList size={20} />
            Mis Consultas
          </NavLink>
        )}

        {userRole === 'LABORATORY' && (
          <>
            <NavLink to="/dashboard/lab-results" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ClipboardList size={20} />
              Cargar Resultados
            </NavLink>
            <NavLink to="/dashboard/lab-templates" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FlaskConical size={20} />
              Plantillas de Examen
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="sidebar-link logout-btn">
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};
