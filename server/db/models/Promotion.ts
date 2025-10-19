import mongoose, { Schema, Document } from 'mongoose';
import { Promotion as PromotionType, UserRole } from '@shared/schema';

export interface IPromotion extends Omit<PromotionType, 'id'>, Document {}

const promotionSchema = new Schema<IPromotion>({
  userId: { type: String, required: true },
  promotedBy: { type: String, required: true },
  fromRole: { 
    type: String, 
    enum: Object.values(UserRole), 
    required: true 
  },
  toRole: { 
    type: String, 
    enum: Object.values(UserRole), 
    required: true 
  },
  shiftId: { type: String, default: null },
  notes: { type: String },
  madeChiefSurgeon: { type: Boolean, default: false },
  wasChiefSurgeon: { type: Boolean, default: false },
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

promotionSchema.index({ userId: 1 });

export const PromotionModel = mongoose.model<IPromotion>('Promotion', promotionSchema);
