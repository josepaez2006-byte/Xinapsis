import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// Todos los usuarios pueden leer (GET), pero solo ADMIN y ASSISTANT pueden crear/editar/borrar
router.get('/', authMiddleware, patientController.getAll.bind(patientController));
router.get('/:id', authMiddleware, patientController.getById.bind(patientController));

router.post('/', authMiddleware, roleMiddleware(['ADMIN', 'ASSISTANT']), patientController.create.bind(patientController));
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN', 'ASSISTANT']), patientController.update.bind(patientController));
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN', 'ASSISTANT']), patientController.delete.bind(patientController));

export default router;
