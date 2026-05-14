import { Response } from 'express';
import { officeService } from '../services/office.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class OfficeController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      res.json(await officeService.getAll(req.user!.clinicId!));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      const office = await officeService.getById(id, req.user!.clinicId!);
      if (!office) return res.status(404).json({ message: 'Office not found' });
      res.json(office);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      res.status(201).json(await officeService.create(req.body, req.user!.clinicId!));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      res.json(await officeService.update(id, req.body, req.user!.clinicId!));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      await officeService.delete(id, req.user!.clinicId!);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const officeController = new OfficeController();
