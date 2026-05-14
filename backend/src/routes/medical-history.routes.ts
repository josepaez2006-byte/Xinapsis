import { Router } from 'express';
import { medicalHistoryController } from '../controllers/medical-history.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router({ mergeParams: true });

router.use(authMiddleware, roleMiddleware(['ADMIN', 'DOCTOR']));

// Specific endpoints by patient
router.get('/patient/:patientId', medicalHistoryController.getByPatientId.bind(medicalHistoryController));
router.put('/patient/:patientId', medicalHistoryController.upsert.bind(medicalHistoryController));

// Standard CRUD endpoints
router.get('/', medicalHistoryController.getAll.bind(medicalHistoryController));
router.get('/:id', medicalHistoryController.getById.bind(medicalHistoryController));
router.post('/', medicalHistoryController.create.bind(medicalHistoryController));
router.put('/:id', medicalHistoryController.update.bind(medicalHistoryController));
router.delete('/:id', medicalHistoryController.delete.bind(medicalHistoryController));

export default router;
