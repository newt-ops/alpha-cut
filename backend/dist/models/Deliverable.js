import mongoose, { Schema } from 'mongoose';
const deliverableSchema = new Schema({
    contractId: {
        type: Schema.Types.ObjectId,
        ref: 'Contract',
        required: true,
    },
    sequenceNumber: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        default: '',
    },
    deliverableUrl: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['delivered', 'approved'],
        default: 'delivered',
    },
    deliveredAt: {
        type: Date,
        default: Date.now,
    },
    approvedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
export const Deliverable = mongoose.models.Deliverable || mongoose.model('Deliverable', deliverableSchema);
