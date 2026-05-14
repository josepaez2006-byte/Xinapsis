import { Request, Response } from 'express';
import { clinicService } from '../services/clinic.service';

export class ClinicController {
  async getAll(req: Request, res: Response) {
    try {
      res.json(await clinicService.getAll());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      const clinic = await clinicService.getById(id);
      if (!clinic) return res.status(404).json({ message: 'Clinic not found' });
      res.json(clinic);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      res.status(201).json(await clinicService.create(req.body));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      res.json(await clinicService.update(id, req.body));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      await clinicService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // ── Admin Management ────────────────────────────────────────────────────────

  async getAdmins(req: Request, res: Response) {
    try {
      const clinicId = parseInt(req.params.id as string, 10);
      if (isNaN(clinicId)) return res.status(400).json({ message: 'Invalid Clinic ID' });
      res.json(await clinicService.getAdmins(clinicId));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async createAdmin(req: Request, res: Response) {
    try {
      const clinicId = parseInt(req.params.id as string, 10);
      if (isNaN(clinicId)) return res.status(400).json({ message: 'Invalid Clinic ID' });
      res.status(201).json(await clinicService.createAdmin(clinicId, req.body));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteAdmin(req: Request, res: Response) {
    try {
      const clinicId = parseInt(req.params.id as string, 10);
      const adminId = parseInt(req.params.adminId as string, 10);
      if (isNaN(clinicId) || isNaN(adminId)) return res.status(400).json({ message: 'Invalid IDs' });
      
      await clinicService.deleteAdmin(clinicId, adminId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const clinicController = new ClinicController();
