import { Response } from 'express';
import { doctorService } from '../services/doctor.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class DoctorController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      res.json(await doctorService.getAll(req.user!.clinicId!));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      const doctor = await doctorService.getById(id, req.user!.clinicId!);
      if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
      res.json(doctor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      res.status(201).json(await doctorService.create(req.body, req.user!.clinicId!));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      res.json(await doctorService.update(id, req.body, req.user!.clinicId!));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      await doctorService.delete(id, req.user!.clinicId!);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const doctorController = new DoctorController();
