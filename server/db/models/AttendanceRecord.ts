import mongoose, { Schema, Document } from 'mongoose';
import { AttendanceRecord as AttendanceRecordType } from '@shared/schema';

export interface IAttendanceRecord extends Omit<AttendanceRecordType, 'id'>, Document {}

const attendanceRecordSchema = new Schema<IAttendanceRecord>({
  userId: { type: String, required: true },
  shiftId: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['presente', 'faltou'], required: true },
  notes: { type: String },
  createdAt: { type: String, required: true },
  createdBy: { type: String, required: true }
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

attendanceRecordSchema.index({ userId: 1, shiftId: 1, date: 1 });

export const AttendanceRecordModel = mongoose.model<IAttendanceRecord>('AttendanceRecord', attendanceRecordSchema);
