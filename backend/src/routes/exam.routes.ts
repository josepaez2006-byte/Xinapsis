import { Router } from 'express';
import { examController } from '../controllers/exam.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware, roleMiddleware(['ADMIN', 'DOCTOR']));

router.get('/', examController.getAll);
router.get('/:id', examController.getById);
router.post('/', examController.create);
router.put('/:id', examController.update);
router.delete('/:id', examController.delete);

export default router;
