import mongoose, { Schema } from 'mongoose';
const paymentSchema = new Schema({
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
        default: function () {
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
}, { timestamps: true });
export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
