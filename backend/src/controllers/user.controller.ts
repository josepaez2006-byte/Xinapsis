import { Response } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class UserController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      res.json(await userService.getAll(req.user!.clinicId!));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      const result = await userService.update(id, req.user!.clinicId!, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {

    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      await userService.delete(id, req.user!.clinicId!);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const userController = new UserController();
