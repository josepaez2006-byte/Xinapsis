import { Response } from 'express';
import { medicalHistoryService } from '../services/medical-history.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class MedicalHistoryController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const clinicId = req.user!.clinicId!;
      const histories = await medicalHistoryService.getAll(clinicId);
      res.json(histories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const clinicId = req.user!.clinicId!;
      const history = await medicalHistoryService.getById(id, clinicId);
      if (!history) return res.status(404).json({ message: 'Medical history not found' });
      
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getByPatientId(req: AuthRequest, res: Response) {
    try {
      const patientId = parseInt(req.params.patientId as string, 10);
      if (isNaN(patientId)) return res.status(400).json({ message: "Invalid Patient ID" });
      
      const clinicId = req.user!.clinicId!;
      const history = await medicalHistoryService.getByPatientId(patientId, clinicId);
      if (!history) return res.status(404).json({ message: 'Medical history not found for this patient' });
      
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const clinicId = req.user!.clinicId!;
      const history = await medicalHistoryService.create(req.body, clinicId);
      res.status(201).json(history);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const clinicId = req.user!.clinicId!;
      const history = await medicalHistoryService.update(id, req.body, clinicId);
      res.json(history);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const clinicId = req.user!.clinicId!;
      await medicalHistoryService.delete(id, clinicId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async upsert(req: AuthRequest, res: Response) {
    try {
      const patientId = parseInt(req.params.patientId as string, 10);
      if (isNaN(patientId)) return res.status(400).json({ message: "Invalid Patient ID" });
      
      const clinicId = req.user!.clinicId!;
      const history = await medicalHistoryService.upsert(patientId, req.body, clinicId);
      res.status(200).json(history);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const medicalHistoryController = new MedicalHistoryController();
