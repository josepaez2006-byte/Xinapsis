import { Router } from 'express';
import { officeController } from '../controllers/office.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

router.get('/', authMiddleware, officeController.getAll.bind(officeController));
router.get('/:id', authMiddleware, officeController.getById.bind(officeController));
router.post('/', authMiddleware, roleMiddleware(['ADMIN']), officeController.create.bind(officeController));
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), officeController.update.bind(officeController));
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), officeController.delete.bind(officeController));

export default router;
