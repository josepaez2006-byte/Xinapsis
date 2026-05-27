import { Response } from 'express';
import { findingService } from '../services/finding.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class FindingController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const clinicId = req.user!.clinicId!;
      // Allow filtering by consultationId via query params
      if (req.query.consultationId) {
        const findings = await findingService.getByConsultationId(Number(req.query.consultationId), clinicId);
        return res.json(findings);
      }
      const findings = await findingService.getAll(clinicId);
      res.json(findings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const clinicId = req.user!.clinicId!;
      const finding = await findingService.getById(id, clinicId);
      if (!finding) return res.status(404).json({ message: 'Finding not found' });
      
      res.json(finding);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const clinicId = req.user!.clinicId!;
      const finding = await findingService.create(req.body, clinicId);
      res.status(201).json(finding);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const clinicId = req.user!.clinicId!;
      const finding = await findingService.update(id, req.body, clinicId);
      res.json(finding);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const clinicId = req.user!.clinicId!;
      await findingService.delete(id, clinicId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const findingController = new FindingController();
