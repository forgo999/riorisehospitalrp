import mongoose, { Schema, Document } from 'mongoose';
import { MeCategory as MeCategoryType } from '@shared/schema';

export interface IMeCategory extends Omit<MeCategoryType, 'id'>, Document {}

const meCategorySchema = new Schema<IMeCategory>({
  name: { type: String, required: true },
  description: { type: String },
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

export const MeCategoryModel = mongoose.model<IMeCategory>('MeCategory', meCategorySchema);
