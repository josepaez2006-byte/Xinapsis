import { Router } from 'express';
import { consultationController } from '../controllers/consultation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware, roleMiddleware(['ADMIN', 'DOCTOR']));

router.get('/', consultationController.getAll);
router.get('/:id', consultationController.getById);
router.post('/', consultationController.create);
router.put('/:id', consultationController.update);
router.delete('/:id', consultationController.delete);

export default router;
