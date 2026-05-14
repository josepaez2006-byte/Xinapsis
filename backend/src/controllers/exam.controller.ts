import { Request, Response } from 'express';
import { examService } from '../services/exam.service';

export class ExamController {
  async getAll(req: Request, res: Response) {
    try {
      if (req.query.requestedInConsultationId) {
        const exams = await examService.getByRequestedConsultationId(Number(req.query.requestedInConsultationId));
        return res.json(exams);
      }
      const exams = await examService.getAll();
      res.json(exams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const exam = await examService.getById(id);
      if (!exam) return res.status(404).json({ message: 'Exam not found' });
      
      res.json(exam);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const exam = await examService.create(req.body);
      res.status(201).json(exam);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const exam = await examService.update(id, req.body);
      res.json(exam);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      await examService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const examController = new ExamController();
