import mongoose, { Schema } from 'mongoose';
const pendingLinkSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    code: {
        type: String,
        default: null,
        index: true,
    },
    token: {
        type: String,
        default: null,
        index: true,
    },
    type: {
        type: String,
        enum: ['code', 'deep_link'],
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 },
    },
    used: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
export const PendingLink = mongoose.models.PendingLink || mongoose.model('PendingLink', pendingLinkSchema);
