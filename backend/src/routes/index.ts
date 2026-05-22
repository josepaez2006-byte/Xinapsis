import { Router } from 'express';
import patientRoutes from './patient.routes';
import medicalHistoryRoutes from './medical-history.routes';
import doctorRoutes from './doctor.routes';
import officeRoutes from './office.routes';
import authRoutes from './auth.routes';
import appointmentRoutes from './appointment.routes';
import consultationRoutes from './consultation.routes';
import findingRoutes from './finding.routes';
import diagnosisRoutes from './diagnosis.routes';
import treatmentRoutes from './treatment.routes';
import examRoutes from './exam.routes';
import userRoutes from './user.routes';
import clinicRoutes from './clinic.routes';
import labExamRoutes from './lab-exam.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Xinapsis Backend is running perfectly' });
});

router.use('/auth', authRoutes);
router.use('/clinics', clinicRoutes);     // SUPER_ADMIN only
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/medical-histories', medicalHistoryRoutes);
router.use('/doctors', doctorRoutes);
router.use('/offices', officeRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/consultations', consultationRoutes);
router.use('/findings', findingRoutes);
router.use('/diagnoses', diagnosisRoutes);
router.use('/treatments', treatmentRoutes);
router.use('/exams', examRoutes);
router.use('/lab-exams', labExamRoutes);

export default router;
