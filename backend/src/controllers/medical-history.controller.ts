import { Request, Response } from 'express';
import { medicalHistoryService } from '../services/medical-history.service';

export class MedicalHistoryController {
  async getAll(req: Request, res: Response) {
    try {
      const histories = await medicalHistoryService.getAll();
      res.json(histories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const history = await medicalHistoryService.getById(id);
      if (!history) return res.status(404).json({ message: 'Medical history not found' });
      
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getByPatientId(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.patientId as string, 10);
      if (isNaN(patientId)) return res.status(400).json({ message: "Invalid Patient ID" });
      
      const history = await medicalHistoryService.getByPatientId(patientId);
      if (!history) return res.status(404).json({ message: 'Medical history not found for this patient' });
      
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const history = await medicalHistoryService.create(req.body);
      res.status(201).json(history);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const history = await medicalHistoryService.update(id, req.body);
      res.json(history);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      await medicalHistoryService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async upsert(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.patientId as string, 10);
      if (isNaN(patientId)) return res.status(400).json({ message: "Invalid Patient ID" });
      
      const history = await medicalHistoryService.upsert(patientId, req.body);
      res.status(200).json(history);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const medicalHistoryController = new MedicalHistoryController();
