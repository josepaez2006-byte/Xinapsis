import { Router } from 'express';
import { findingController } from '../controllers/finding.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware, roleMiddleware(['ADMIN', 'DOCTOR']));

router.get('/', findingController.getAll);
router.get('/:id', findingController.getById);
router.post('/', findingController.create);
router.put('/:id', findingController.update);
router.delete('/:id', findingController.delete);

export default router;
