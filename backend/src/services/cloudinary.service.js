import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';

if (config.cloudinaryCloudName) {
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  });
}

export const uploadMedia = async (fileString, folder = 'alpha-cut') => {
  if (!config.cloudinaryCloudName) {
    console.log(`[DEV MODE] Cloudinary upload bypassed for folder: ${folder}`);
    return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800';
  }

  try {
    const res = await cloudinary.uploader.upload(fileString, {
      folder,
      resource_type: 'auto',
    });
    return res.secure_url;
  } catch (err) {
    console.error('Cloudinary Upload Error:', err.message);
    throw new Error('Failed to upload file to Cloudinary');
  }
};
