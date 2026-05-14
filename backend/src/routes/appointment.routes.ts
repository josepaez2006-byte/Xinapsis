import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.get('/', authMiddleware, appointmentController.getAll);
router.get('/:id', authMiddleware, appointmentController.getById);
router.post('/', authMiddleware, roleMiddleware(['ADMIN', 'ASSISTANT']), appointmentController.create);
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN', 'ASSISTANT']), appointmentController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN', 'ASSISTANT']), appointmentController.delete);

export default router;
