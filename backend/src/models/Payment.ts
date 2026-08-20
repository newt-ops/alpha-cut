import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type PaymentSubjectType = 'project' | 'contract';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface IPayment extends Document {
  subjectType: PaymentSubjectType;
  subjectId: Types.ObjectId;
  subjectModel: 'Project' | 'Contract';
  clientId: Types.ObjectId;
  amount: number;
  currency: 'ETB' | 'USD';
  txRef: string;
  chapaReference?: string | null;
  status: PaymentStatus;
  verifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    subjectType: {
      type: String,
      enum: ['project', 'contract'],
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'subjectModel',
    },
    subjectModel: {
      type: String,
      enum: ['Project', 'Contract'],
      default: function (this: IPayment) {
        return this.subjectType === 'contract' ? 'Contract' : 'Project';
      },
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ['ETB', 'USD'],
      default: 'ETB',
    },
    txRef: {
      type: String,
      required: true,
      unique: true,
    },
    chapaReference: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);
