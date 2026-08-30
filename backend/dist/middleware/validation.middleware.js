import { z } from 'zod';
export const validateRequest = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            const issue = err.errors[0]?.message || 'Validation failed';
            return res.status(400).json({ success: false, message: issue });
        }
        next(err);
    }
};
export const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    turnstileToken: z.string().optional(),
    'cf-turnstile-response': z.string().optional(),
}).passthrough();
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    turnstileToken: z.string().optional(),
    'cf-turnstile-response': z.string().optional(),
}).passthrough();
export const verifyEmailSchema = z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'Verification code must be 6 digits'),
    turnstileToken: z.string().optional(),
    'cf-turnstile-response': z.string().optional(),
}).passthrough();
export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    turnstileToken: z.string().optional(),
    'cf-turnstile-response': z.string().optional(),
}).passthrough();
export const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'Reset code must be 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    turnstileToken: z.string().optional(),
    'cf-turnstile-response': z.string().optional(),
}).passthrough();
export const createProposalSchema = z.object({
    clientEmail: z.string().email('Invalid client email address'),
    editingStyle: z.string().min(1, 'Editing style is required'),
    contentLength: z.enum(['short', 'long']),
    packageTier: z.enum(['basic', 'professional', 'premium', 'custom']),
    currency: z.enum(['USD', 'ETB']),
    price: z.number().positive('Price must be greater than 0'),
    referenceBrief: z.string().optional(),
    deadline: z.string().min(1, 'Deadline date is required'),
    notes: z.string().optional(),
});
export const createContractSchema = z.object({
    clientEmail: z.string().email('Invalid client email address'),
    packageTier: z.enum(['basic', 'professional', 'premium', 'custom']),
    contentLength: z.enum(['short', 'long']).optional(),
    frequency: z.string().min(1, 'Contract frequency is required'),
    currency: z.enum(['USD', 'ETB']).optional(),
    monthlyPrice: z.number().positive('Monthly price must be greater than 0'),
    startDate: z.string().optional(),
    durationMonths: z.number().positive().optional(),
    notes: z.string().optional(),
});
export const markDeliveredSchema = z.object({
    deliverableUrl: z.string().optional(),
    deliveryLink: z.string().optional(),
    deliveryUrl: z.string().optional(),
}).passthrough();
export const submitRatingSchema = z.object({
    subjectType: z.enum(['project', 'contract']).optional(),
    subjectId: z.string().optional(),
    projectId: z.string().optional(),
    contractId: z.string().optional(),
    stars: z.number().min(1, 'Rating stars must be between 1 and 5').max(5, 'Rating stars must be between 1 and 5'),
    review: z.string().min(5, 'Review must be at least 5 characters'),
});
