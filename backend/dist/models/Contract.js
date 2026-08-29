import mongoose, { Schema } from 'mongoose';
const contractSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdByAdminId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['proposed', 'active', 'declined', 'completed', 'cancelled'],
        default: 'proposed',
    },
    // Extended Proposal Agreement Schema
    proposalTitle: {
        type: String,
        default: 'Monthly Content Partner Retainer',
    },
    videosPerMonth: {
        type: Number,
        default: 8,
    },
    editingStyle: {
        type: String,
        default: 'Flexible / Multiple Styles',
    },
    aspectRatio: {
        type: String,
        enum: ['9:16', '16:9', '1:1', '4:5'],
        default: '9:16',
    },
    resolution: {
        type: String,
        default: '1080p Full HD',
    },
    targetPlatform: {
        type: String,
        default: 'Multi-Platform',
    },
    includedServices: {
        type: [String],
        default: ['Clean Cuts & Trimming', 'Animated Captions', 'Sound Design & SFX', 'Color Correction', 'Priority Turnaround'],
    },
    excludedServices: {
        type: [String],
        default: ['Original Filming', 'Voiceover Recording', 'Thumbnail Design'],
    },
    includedRevisions: {
        type: Number,
        default: 2,
    },
    paymentStructure: {
        type: String,
        enum: ['upfront_100', 'deposit_50_50', 'monthly_upfront'],
        default: 'monthly_upfront',
    },
    paymentTerms: {
        type: String,
        default: 'Monthly upfront billing',
    },
    customPaymentTerms: {
        type: String,
        default: '',
    },
    validUntil: {
        type: Date,
        default: null,
    },
    clientResponsibilities: {
        type: String,
        default: 'Client provides monthly footage batch, creative direction, and timely feedback.',
    },
    packageTier: {
        type: String,
        enum: ['basic', 'professional', 'premium'],
        required: true,
    },
    contentLength: {
        type: String,
        enum: ['short', 'long'],
        default: 'short',
    },
    frequency: {
        type: String,
        enum: ['weekly-1', 'weekly-2', 'weekly-3-4', 'daily-1', 'daily-2'],
        default: 'weekly-2',
    },
    currency: {
        type: String,
        enum: ['USD', 'ETB'],
        default: 'ETB',
    },
    monthlyPrice: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    durationMonths: {
        type: Number,
        default: 1,
    },
    totalVideosPlanned: {
        type: Number,
        required: true,
    },
    clientName: {
        type: String,
        required: true,
    },
    clientEmail: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
        default: '',
    },
    telegramStatusMessageId: {
        type: String,
        default: null,
    },
    rated: {
        type: Boolean,
        default: false,
    },
    proposedAt: {
        type: Date,
        default: Date.now,
    },
    acceptedAt: {
        type: Date,
        default: null,
    },
    declinedAt: {
        type: Date,
        default: null,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    cancelledAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
export const Contract = mongoose.models.Contract || mongoose.model('Contract', contractSchema);
