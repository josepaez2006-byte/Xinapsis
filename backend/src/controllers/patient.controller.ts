import { Request, Response } from 'express';
import { patientService } from '../services/patient.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PatientController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const clinicId = req.user!.clinicId!;
      res.json(await patientService.getAll(clinicId));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      const patient = await patientService.getById(id, req.user!.clinicId!);
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
      res.json(patient);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      res.status(201).json(await patientService.create(req.body, req.user!.clinicId!));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      res.json(await patientService.update(id, req.body, req.user!.clinicId!));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      await patientService.delete(id, req.user!.clinicId!);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const patientController = new PatientController();
