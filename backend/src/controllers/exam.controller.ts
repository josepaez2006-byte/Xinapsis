import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { examService } from '../services/exam.service';

export class ExamController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(400).json({ message: "Clinic ID is required" });

      if (req.query.pending === 'true' && req.query.dni) {
        const exams = await examService.getPendingByPatientDni(req.query.dni as string, clinicId);
        return res.json(exams);
      }

      if (req.query.requestedInConsultationId) {
        const exams = await examService.getByRequestedConsultationId(Number(req.query.requestedInConsultationId), clinicId);
        return res.json(exams);
      }
      const exams = await examService.getAll(clinicId);
      res.json(exams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(400).json({ message: "Clinic ID is required" });

      const exam = await examService.getById(id, clinicId);
      if (!exam) return res.status(404).json({ message: 'Exam not found' });
      
      res.json(exam);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(400).json({ message: "Clinic ID is required" });

      const exam = await examService.create(req.body, clinicId);
      res.status(201).json(exam);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(400).json({ message: "Clinic ID is required" });

      const exam = await examService.update(id, req.body, clinicId);
      res.json(exam);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(400).json({ message: "Clinic ID is required" });

      await examService.delete(id, clinicId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const examController = new ExamController();
