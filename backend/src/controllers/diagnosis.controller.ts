import { Response } from 'express';
import { diagnosisService } from '../services/diagnosis.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class DiagnosisController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const clinicId = req.user!.clinicId!;
      if (req.query.consultationId) {
        const diagnoses = await diagnosisService.getByConsultationId(Number(req.query.consultationId), clinicId);
        return res.json(diagnoses);
      }
      const diagnoses = await diagnosisService.getAll(clinicId);
      res.json(diagnoses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const clinicId = req.user!.clinicId!;
      const diagnosis = await diagnosisService.getById(id, clinicId);
      if (!diagnosis) return res.status(404).json({ message: 'Diagnosis not found' });
      
      res.json(diagnosis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const clinicId = req.user!.clinicId!;
      const diagnosis = await diagnosisService.create(req.body, clinicId);
      res.status(201).json(diagnosis);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const clinicId = req.user!.clinicId!;
      const diagnosis = await diagnosisService.update(id, req.body, clinicId);
      res.json(diagnosis);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const clinicId = req.user!.clinicId!;
      await diagnosisService.delete(id, clinicId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const diagnosisController = new DiagnosisController();
