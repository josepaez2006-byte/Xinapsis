import { Response } from 'express';
import { consultationService } from '../services/consultation.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ConsultationController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page  = parseInt(req.query.page  as string || '1',   10);
      const limit = parseInt(req.query.limit as string || '100', 10);
      const [data, total] = await Promise.all([
        consultationService.getAll(req.user!.clinicId!, page, limit),
        consultationService.count(req.user!.clinicId!),
      ]);
      res.json({ data, total, page, limit });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      const consult = await consultationService.getById(id, req.user!.clinicId!);
      if (!consult) return res.status(404).json({ message: 'Consultation not found' });
      res.json(consult);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      res.status(201).json(await consultationService.create(req.body, req.user!.clinicId!));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      res.json(await consultationService.update(id, req.body, req.user!.clinicId!));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      await consultationService.delete(id, req.user!.clinicId!);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const consultationController = new ConsultationController();
