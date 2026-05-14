import { Response } from 'express';
import { appointmentService } from '../services/appointment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AppointmentController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      res.json(await appointmentService.getAll(req.user!.clinicId!));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      const appt = await appointmentService.getById(id, req.user!.clinicId!);
      if (!appt) return res.status(404).json({ message: 'Appointment not found' });
      res.json(appt);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      res.status(201).json(await appointmentService.create(req.body, req.user!.clinicId!));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      res.json(await appointmentService.update(id, req.body, req.user!.clinicId!));
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
      await appointmentService.delete(id, req.user!.clinicId!);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const appointmentController = new AppointmentController();
