import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// Login es público — cualquiera puede autenticarse
router.post('/login', authController.login.bind(authController));

// Register es protegido — solo ADMIN o SUPER_ADMIN pueden crear usuarios
router.post(
  '/register',
  authMiddleware,
  roleMiddleware(['ADMIN', 'SUPER_ADMIN']),
  authController.register.bind(authController)
);

export default router;
