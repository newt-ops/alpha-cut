import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '../middleware/auth.middleware.js';
import { config } from '../config/env.js';
const router = express.Router();
router.use(requireAuth);
router.post('/signature', (req, res) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = 'alpha-cut/avatars';
        const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, config.cloudinaryApiSecret || '');
        res.status(200).json({
            success: true,
            timestamp,
            signature,
            apiKey: config.cloudinaryApiKey,
            cloudName: config.cloudinaryCloudName,
            folder,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Failed to generate upload signature' });
    }
});
export default router;
