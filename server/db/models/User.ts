import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType, UserRole } from '@shared/schema';

export interface IUser extends Omit<UserType, 'id'>, Document {}

const userSchema = new Schema<IUser>({
  accessCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: Object.values(UserRole), 
    required: true 
  },
  shiftId: { type: String, default: null },
  isChiefSurgeon: { type: Boolean, default: false },
  narniaName: { type: String },
  phone: { type: String }
}, {
  timestamps: true,
  toJSON: {
    transform: (_: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const UserModel = mongoose.model<IUser>('User', userSchema);
