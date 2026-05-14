import { Router } from 'express';
import { doctorController } from '../controllers/doctor.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.get('/', authMiddleware, doctorController.getAll.bind(doctorController));
router.get('/:id', authMiddleware, doctorController.getById.bind(doctorController));
router.post('/', authMiddleware, roleMiddleware(['ADMIN']), doctorController.create.bind(doctorController));
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), doctorController.update.bind(doctorController));
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), doctorController.delete.bind(doctorController));

export default router;
