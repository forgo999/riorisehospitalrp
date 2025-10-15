import mongoose, { Schema, Document } from 'mongoose';
import { Rule as RuleType } from '@shared/schema';

export interface IRule extends Omit<RuleType, 'id'>, Document {}

const ruleSchema = new Schema<IRule>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['general', 'shift'], required: true },
  shiftId: { type: String, default: null },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true }
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

export const RuleModel = mongoose.model<IRule>('Rule', ruleSchema);
