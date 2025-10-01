import mongoose from 'mongoose';
import Appointment, { IAppointment } from '../models/Appointment';

export interface IAppointmentRepository {
  findByUser(userId: string): Promise<IAppointment[]>;
  findByVeterinarian(vetId: string): Promise<IAppointment[]>;
  findByIdForRole(appointmentId: string, userId: string, role: 'user' | 'veterinarian'): Promise<IAppointment | null>;
  findConflict(vetId: string, date: Date, time: string, excludeId?: string): Promise<IAppointment | null>;
  create(data: Partial<IAppointment>): Promise<IAppointment>;
  updateById(id: string, patch: Partial<IAppointment>): Promise<IAppointment | null>;
}

export class AppointmentRepository implements IAppointmentRepository {
  async findByUser(userId: string): Promise<IAppointment[]> {
    return Appointment.find({ user: userId })
      .populate('user', 'name email contact')
      .populate('pet', 'name type breed age weight')
      .populate('veterinarian', 'name email specialization')
      .sort({ date: -1 });
  }

  async findByVeterinarian(vetId: string): Promise<IAppointment[]> {
    return Appointment.find({ veterinarian: vetId })
      .populate('user', 'name email contact')
      .populate('pet', 'name type breed age weight')
      .populate('veterinarian', 'name email specialization')
      .sort({ date: -1 });
  }

  async findByIdForRole(appointmentId: string, userId: string, role: 'user' | 'veterinarian'): Promise<IAppointment | null> {
    const query: any = { _id: appointmentId };
    if (role === 'user') query.user = userId; else query.veterinarian = userId;

    return Appointment.findOne(query)
      .populate('user', 'name email contact')
      .populate('pet', 'name type breed age weight color medicalHistory')
      .populate('veterinarian', 'name email specialization experience consultationFeeRange');
  }

  async findConflict(vetId: string, date: Date, time: string, excludeId?: string): Promise<IAppointment | null> {
    const q: any = { veterinarian: vetId, date, time, status: { $nin: ['CANCELLED', 'REJECTED'] } };
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) q._id = { $ne: excludeId };
    return Appointment.findOne(q);
  }

  async create(data: Partial<IAppointment>): Promise<IAppointment> {
    const appointment = new Appointment(data);
    await appointment.save();
    return appointment;
  }

  async updateById(id: string, patch: Partial<IAppointment>): Promise<IAppointment | null> {
    return Appointment.findByIdAndUpdate(id, patch, { new: true })
      .populate('user', 'name email contact')
      .populate('pet', 'name type breed age weight')
      .populate('veterinarian', 'name email specialization');
  }
}