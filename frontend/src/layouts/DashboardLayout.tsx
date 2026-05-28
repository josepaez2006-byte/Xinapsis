import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { UserRound, Stethoscope, ShieldCheck, ClipboardList, UserCog, FlaskConical } from 'lucide-react';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const getRoleBadge = () => {
    const role = user?.role || '';
    let MainIcon = <UserRound size={18} />;
    let SubIcon = <UserCog size={12} />;
    let label = role;
    let color = '#64748b';
    let bgColor = 'rgba(100, 116, 139, 0.1)';

    if (role === 'SUPER_DOCTOR') {
      SubIcon = <Stethoscope size={12} />;
      label = 'Súper Médico';
      color = '#0ea5e9';
      bgColor = 'rgba(14, 165, 233, 0.1)';
    } else if (role === 'DOCTOR') {
      SubIcon = <Stethoscope size={12} />;
      label = 'Médico Especialista';
      color = '#0ea5e9';
      bgColor = 'rgba(14, 165, 233, 0.1)';
    } else if (role === 'ASSISTANT') {
      SubIcon = <ClipboardList size={12} />;
      label = 'Asistente Clínico';
      color = '#22c55e';
      bgColor = 'rgba(34, 197, 94, 0.1)';
    } else if (role === 'LABORATORY') {
      SubIcon = <FlaskConical size={12} />;
      label = 'Bioanalista / Laboratorio';
      color = '#eab308';
      bgColor = 'rgba(234, 179, 8, 0.1)';
    } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      SubIcon = <ShieldCheck size={12} />;
      label = role === 'SUPER_ADMIN' ? 'Súper Admin' : 'Administrador';
      color = '#a855f7';
      bgColor = 'rgba(168, 85, 247, 0.1)';
    }

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.4rem 0.8rem',
        borderRadius: '12px',
        backgroundColor: bgColor,
        color: color,
        fontSize: '0.8rem',
        fontWeight: 600,
        width: 'fit-content',
        marginTop: '0.5rem',
        border: `1px solid ${color}20`
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {MainIcon}
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-4px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '50%',
            padding: '1px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${color}`
          }}>
            {React.cloneElement(SubIcon as React.ReactElement<any>, { size: 10, color: color })}
          </div>
        </div>
        <span style={{ marginLeft: '4px' }}>{label}</span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar userRole={user?.role || ''} />

      <main style={{ flex: 1, padding: '2rem', marginLeft: '250px', display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Hola, {user?.firstName ? (['DOCTOR', 'SUPER_DOCTOR'].includes(user?.role || '') ? 'Dr. ' : '') + `${user.firstName} ${user.lastName}` : user?.email.split('@')[0]}
            </h2>
            {getRoleBadge()}
          </div>
          <ThemeToggle />
        </header>

        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
};
