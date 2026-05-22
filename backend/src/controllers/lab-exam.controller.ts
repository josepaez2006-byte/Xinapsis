import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { labExamService } from '../services/lab-exam.service';

export class LabExamController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const clinicId = req.user!.clinicId!;
      const templates = await labExamService.getAll(clinicId);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

      const clinicId = req.user!.clinicId!;
      const template = await labExamService.getById(id, clinicId);
      if (!template) return res.status(404).json({ message: 'Lab exam template not found' });

      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const clinicId = req.user!.clinicId!;
      const template = await labExamService.create(req.body, clinicId);
      res.status(201).json(template);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

      const clinicId = req.user!.clinicId!;
      const template = await labExamService.update(id, req.body, clinicId);
      res.json(template);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

      const clinicId = req.user!.clinicId!;
      await labExamService.delete(id, clinicId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const labExamController = new LabExamController();
