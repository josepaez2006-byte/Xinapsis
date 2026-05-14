import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController {
  async register(req: AuthRequest, res: Response) {
    try {
      const requestingUser = req.user!; // Garantizado por authMiddleware
      const user = await authService.registerForClinic(
        req.body,
        requestingUser.clinicId!,    // clinicId del JWT, no del body
        requestingUser.role          // para validar si puede crear ADMIN
      );
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }
}

export const authController = new AuthController();
