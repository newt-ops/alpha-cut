import mongoose, { Schema } from 'mongoose';
const notificationSchema = new Schema({
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
}, {
    timestamps: true,
});
export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
