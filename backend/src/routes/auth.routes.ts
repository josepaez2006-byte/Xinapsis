import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// Login es público — cualquiera puede autenticarse
router.post('/login', authController.login.bind(authController));

// Register es protegido — ADMIN, SUPER_ADMIN y SUPER_DOCTOR pueden crear personal de clínica
router.post(
  '/register',
  authMiddleware,
  roleMiddleware(['ADMIN', 'SUPER_ADMIN', 'SUPER_DOCTOR']),
  authController.register.bind(authController)
);

export default router;
