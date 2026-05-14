import { Router } from 'express';
import { diagnosisController } from '../controllers/diagnosis.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware, roleMiddleware(['ADMIN', 'DOCTOR']));

router.get('/', diagnosisController.getAll);
router.get('/:id', diagnosisController.getById);
router.post('/', diagnosisController.create);
router.put('/:id', diagnosisController.update);
router.delete('/:id', diagnosisController.delete);

export default router;
