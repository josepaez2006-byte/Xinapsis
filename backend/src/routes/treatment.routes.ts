import { Router } from 'express';
import { treatmentController } from '../controllers/treatment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware, roleMiddleware(['ADMIN', 'DOCTOR']));

router.get('/', treatmentController.getAll);
router.get('/:id', treatmentController.getById);
router.post('/', treatmentController.create);
router.put('/:id', treatmentController.update);
router.delete('/:id', treatmentController.delete);

export default router;
