import mongoose, { Schema, Document } from 'mongoose';
import { Covenant as CovenantType } from '@shared/schema';

export interface ICovenant extends Omit<CovenantType, 'id'>, Document {}

const covenantSchema = new Schema<ICovenant>({
  organizationName: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  totalSeconds: { type: Number, required: true },
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

export const CovenantModel = mongoose.model<ICovenant>('Covenant', covenantSchema);
