import { Router } from 'express';
import { processDictado } from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Protegido: solo usuarios autenticados pueden usar el proxy AI
router.post('/dictado', authMiddleware, processDictado);

export default router;
