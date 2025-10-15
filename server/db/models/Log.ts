import mongoose, { Schema, Document } from 'mongoose';
import { Log as LogType, LogAction } from '@shared/schema';

export interface ILog extends Omit<LogType, 'id'>, Document {}

const logSchema = new Schema<ILog>({
  action: { 
    type: String, 
    enum: Object.values(LogAction), 
    required: true 
  },
  userId: { type: String, required: true },
  targetUserId: { type: String },
  shiftId: { type: String, default: null },
  details: { type: String },
  metadata: { type: Schema.Types.Mixed },
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

logSchema.index({ userId: 1 });
logSchema.index({ action: 1 });
logSchema.index({ createdAt: -1 });

export const LogModel = mongoose.model<ILog>('Log', logSchema);
