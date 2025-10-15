import mongoose, { Schema, Document } from 'mongoose';
import { Shift as ShiftType } from '@shared/schema';

export interface IShift extends Omit<ShiftType, 'id'>, Document {}

const shiftSchema = new Schema<IShift>({
  name: { type: String, required: true },
  viceDirectorId: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: String, required: true }
}, {
  timestamps: false,
  toJSON: {
    transform: (_: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const ShiftModel = mongoose.model<IShift>('Shift', shiftSchema);
