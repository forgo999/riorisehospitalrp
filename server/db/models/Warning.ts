import mongoose, { Schema, Document } from 'mongoose';
import { Warning as WarningType, WarningOccurrenceType } from '@shared/schema';

export interface IWarning extends Omit<WarningType, 'id'>, Document {}

const warningSchema = new Schema<IWarning>({
  userId: { type: String, required: true },
  issuedBy: { type: String, required: true },
  shiftId: { type: String, default: null },
  reason: { type: String, required: true },
  occurrenceType: { 
    type: String, 
    enum: Object.values(WarningOccurrenceType), 
    required: true 
  },
  occurrenceDate: { type: String, required: true },
  notes: { type: String },
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

warningSchema.index({ userId: 1 });
warningSchema.index({ shiftId: 1 });

export const WarningModel = mongoose.model<IWarning>('Warning', warningSchema);
