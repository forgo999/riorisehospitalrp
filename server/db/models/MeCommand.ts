import mongoose, { Schema, Document } from 'mongoose';
import { MeCommand as MeCommandType } from '@shared/schema';

export interface IMeCommand extends Omit<MeCommandType, 'id'>, Document {}

const meCommandSchema = new Schema<IMeCommand>({
  text: { type: String, required: true },
  categoryId: { type: String, default: null },
  type: { type: String, enum: ['general', 'shift'], required: true },
  shiftId: { type: String, default: null },
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

export const MeCommandModel = mongoose.model<IMeCommand>('MeCommand', meCommandSchema);
