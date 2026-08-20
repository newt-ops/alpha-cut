import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string | null;
  authProvider: 'local' | 'google';
  role: 'client' | 'admin';
  emailVerified: boolean;
  verificationCode?: string | null;
  verificationCodeExpires?: Date | null;
  verificationCooldown?: Date | null;
  telegramChatId?: string | null;
  telegramLinkedAt?: Date | null;
  avatarUrl?: string | null;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['client', 'admin'],
      default: 'client',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpires: {
      type: Date,
      default: null,
    },
    verificationCooldown: {
      type: Date,
      default: null,
    },
    telegramChatId: {
      type: String,
      default: null,
    },
    telegramLinkedAt: {
      type: Date,
      default: null,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.verificationCode;
  return obj;
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
