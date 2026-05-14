import { Router } from 'express';
import { clinicController } from '../controllers/clinic.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { superAdminMiddleware } from '../middlewares/role.middleware';

const router = Router();

// All clinic management is SUPER_ADMIN only
router.use(authMiddleware, superAdminMiddleware);

router.get('/', clinicController.getAll);
router.get('/:id', clinicController.getById);
router.post('/', clinicController.create);
router.put('/:id', clinicController.update);
router.delete('/:id', clinicController.delete);

// Admin Management within a clinic
router.get('/:id/admins', clinicController.getAdmins);
router.post('/:id/admins', clinicController.createAdmin);
router.delete('/:id/admins/:adminId', clinicController.deleteAdmin);

export default router;
