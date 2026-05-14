import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// Only ADMIN can manage users
router.use(authMiddleware, roleMiddleware(['ADMIN']));

router.get('/', userController.getAll);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);


export default router;
