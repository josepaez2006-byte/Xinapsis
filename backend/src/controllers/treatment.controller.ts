import { Request, Response } from 'express';
import { treatmentService } from '../services/treatment.service';

export class TreatmentController {
  async getAll(req: Request, res: Response) {
    try {
      if (req.query.consultationId) {
        const treatments = await treatmentService.getByConsultationId(Number(req.query.consultationId));
        return res.json(treatments);
      }
      const treatments = await treatmentService.getAll();
      res.json(treatments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const treatment = await treatmentService.getById(id);
      if (!treatment) return res.status(404).json({ message: 'Treatment not found' });
      
      res.json(treatment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const treatment = await treatmentService.create(req.body);
      res.status(201).json(treatment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const treatment = await treatmentService.update(id, req.body);
      res.json(treatment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      await treatmentService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const treatmentController = new TreatmentController();
