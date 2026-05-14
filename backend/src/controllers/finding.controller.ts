import { Request, Response } from 'express';
import { findingService } from '../services/finding.service';

export class FindingController {
  async getAll(req: Request, res: Response) {
    try {
      // Allow filtering by consultationId via query params
      if (req.query.consultationId) {
        const findings = await findingService.getByConsultationId(Number(req.query.consultationId));
        return res.json(findings);
      }
      const findings = await findingService.getAll();
      res.json(findings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const finding = await findingService.getById(id);
      if (!finding) return res.status(404).json({ message: 'Finding not found' });
      
      res.json(finding);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const finding = await findingService.create(req.body);
      res.status(201).json(finding);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const finding = await findingService.update(id, req.body);
      res.json(finding);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      await findingService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const findingController = new FindingController();
