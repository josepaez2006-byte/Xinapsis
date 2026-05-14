import { Request, Response } from 'express';
import { diagnosisService } from '../services/diagnosis.service';

export class DiagnosisController {
  async getAll(req: Request, res: Response) {
    try {
      if (req.query.consultationId) {
        const diagnoses = await diagnosisService.getByConsultationId(Number(req.query.consultationId));
        return res.json(diagnoses);
      }
      const diagnoses = await diagnosisService.getAll();
      res.json(diagnoses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const diagnosis = await diagnosisService.getById(id);
      if (!diagnosis) return res.status(404).json({ message: 'Diagnosis not found' });
      
      res.json(diagnosis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const diagnosis = await diagnosisService.create(req.body);
      res.status(201).json(diagnosis);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const diagnosis = await diagnosisService.update(id, req.body);
      res.json(diagnosis);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      await diagnosisService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const diagnosisController = new DiagnosisController();
