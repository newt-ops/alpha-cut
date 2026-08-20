import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: string;
  message: string;
  projectId?: Types.ObjectId | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
