import { Router } from 'express';
import { examController } from '../controllers/exam.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', roleMiddleware(['ADMIN', 'DOCTOR', 'LABORATORY']), examController.getAll.bind(examController));
router.get('/:id', roleMiddleware(['ADMIN', 'DOCTOR', 'LABORATORY']), examController.getById.bind(examController));
router.post('/', roleMiddleware(['ADMIN', 'DOCTOR']), examController.create.bind(examController));
router.put('/:id', roleMiddleware(['ADMIN', 'DOCTOR', 'LABORATORY']), examController.update.bind(examController));
router.delete('/:id', roleMiddleware(['ADMIN', 'DOCTOR']), examController.delete.bind(examController));

export default router;
