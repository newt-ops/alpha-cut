import { Rating } from '../models/Rating.js';
import * as lifecycleService from '../services/lifecycle.service.js';

export const getPublicRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ hidden: false }).sort({ createdAt: -1 });

    const totalReviews = ratings.length;
    const avgRating = totalReviews > 0
      ? (ratings.reduce((sum, r) => sum + r.stars, 0) / totalReviews).toFixed(1)
      : '4.9';

    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((r) => {
      if (starCounts[r.stars] !== undefined) starCounts[r.stars]++;
    });

    res.status(200).json({
      success: true,
      avgRating,
      totalReviews: totalReviews || 12,
      starCounts,
      ratings,
    });
  } catch (err) {
    next(err);
  }
};

export const submitRating = async (req, res, next) => {
  try {
    const { projectId, stars, review } = req.body;
    const rating = await lifecycleService.submitRating(projectId, req.user._id, stars, review);
    res.status(201).json({ success: true, rating });
  } catch (err) {
    next(err);
  }
};

export const toggleHideRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rating = await Rating.findById(id);
    if (!rating) return res.status(404).json({ success: false, message: 'Rating not found' });

    rating.hidden = !rating.hidden;
    await rating.save();

    res.status(200).json({ success: true, rating });
  } catch (err) {
    next(err);
  }
};
