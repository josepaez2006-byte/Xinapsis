import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/Login';
import { StaffManagement } from './pages/StaffManagement';
import { ClinicsManagement } from './pages/ClinicsManagement';
import { PatientsManagement } from './pages/PatientsManagement';
import { AppointmentsManagement } from './pages/AppointmentsManagement';
import { OfficesManagement } from './pages/OfficesManagement';
import { DashboardLayout } from './layouts/DashboardLayout';
import { useAuth } from './contexts/AuthContext';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { DoctorConsultations } from './pages/DoctorConsultations';
import { PatientProfile } from './pages/PatientProfile';
import { ConsultationPage } from './pages/ConsultationPage';
import { ConsultationPrintPage } from './pages/ConsultationPrintPage';
import { LabTemplates } from './pages/LabTemplates';
import { LabResults } from './pages/LabResults';

const ProtectedRoute = () => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

const PrintRoute = () => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const DashboardHome = () => {
  const { user } = useAuth();
  
  if (user?.role === 'DOCTOR' || user?.role === 'SUPER_DOCTOR') {
    return <DoctorDashboard />;
  }

  if (user?.role === 'LABORATORY') {
    return <Navigate to="/dashboard/lab-results" replace />;
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
      <p>Bienvenido al panel protegido de Xinapsis.</p>
      <p>Selecciona una opción en el menú lateral para comenzar.</p>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas de Impresión sin Layout */}
        <Route path="/print" element={<PrintRoute />}>
          <Route path="consultations/:id" element={<ConsultationPrintPage />} />
        </Route>

        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<DashboardHome />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="clinics" element={<ClinicsManagement />} />
          <Route path="patients" element={<PatientsManagement />} />
          <Route path="patients/:id" element={<PatientProfile />} />
          <Route path="offices" element={<OfficesManagement />} />
          <Route path="appointments" element={<AppointmentsManagement />} />
          <Route path="medical-histories" element={<DoctorConsultations />} />
          <Route path="my-consultations" element={<DoctorConsultations />} />
          <Route path="consultations/new" element={<ConsultationPage />} />
          <Route path="consultations/:id" element={<ConsultationPage />} />
          <Route path="lab-templates" element={<LabTemplates />} />
          <Route path="lab-results" element={<LabResults />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
