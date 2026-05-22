import { Router } from 'express';
import { labExamController } from '../controllers/lab-exam.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// Require auth for all routes
router.use(authMiddleware);

// Doctor and Admin can also read templates to request them in consultations
router.get('/', roleMiddleware(['LABORATORY', 'DOCTOR', 'ADMIN']), labExamController.getAll.bind(labExamController));
router.get('/:id', roleMiddleware(['LABORATORY', 'DOCTOR', 'ADMIN']), labExamController.getById.bind(labExamController));

// Only Laboratory staff and Admin can create, modify, or delete templates
router.post('/', roleMiddleware(['LABORATORY', 'ADMIN']), labExamController.create.bind(labExamController));
router.put('/:id', roleMiddleware(['LABORATORY', 'ADMIN']), labExamController.update.bind(labExamController));
router.delete('/:id', roleMiddleware(['LABORATORY', 'ADMIN']), labExamController.delete.bind(labExamController));

export default router;
