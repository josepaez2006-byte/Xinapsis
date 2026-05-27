import { Response } from 'express';
import { treatmentService } from '../services/treatment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class TreatmentController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const clinicId = req.user!.clinicId!;
      if (req.query.consultationId) {
        const treatments = await treatmentService.getByConsultationId(Number(req.query.consultationId), clinicId);
        return res.json(treatments);
      }
      const treatments = await treatmentService.getAll(clinicId);
      res.json(treatments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const clinicId = req.user!.clinicId!;
      const treatment = await treatmentService.getById(id, clinicId);
      if (!treatment) return res.status(404).json({ message: 'Treatment not found' });
      
      res.json(treatment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const clinicId = req.user!.clinicId!;
      const treatment = await treatmentService.create(req.body, clinicId);
      res.status(201).json(treatment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const clinicId = req.user!.clinicId!;
      const treatment = await treatmentService.update(id, req.body, clinicId);
      res.json(treatment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const clinicId = req.user!.clinicId!;
      await treatmentService.delete(id, clinicId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const treatmentController = new TreatmentController();
