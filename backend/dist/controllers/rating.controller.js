import { Rating } from '../models/Rating.js';
import * as lifecycleService from '../services/lifecycle.service.js';
export const getPublicRatings = async (req, res, next) => {
    try {
        const { featured, page, limit } = req.query;
        const filter = { hidden: false };
        if (featured === 'true') {
            filter.featured = true;
        }
        const allRatings = await Rating.find(filter).sort({ createdAt: -1 });
        const totalReviews = allRatings.length;
        const avgRating = totalReviews > 0
            ? (allRatings.reduce((sum, r) => sum + r.stars, 0) / totalReviews).toFixed(1)
            : '5.0';
        const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        allRatings.forEach((r) => {
            if (starCounts[r.stars] !== undefined)
                starCounts[r.stars]++;
        });
        let paginatedRatings = allRatings;
        let currentPage = 1;
        let pageLimit = totalReviews;
        let totalPages = 1;
        if (page || limit) {
            currentPage = parseInt(page, 10) || 1;
            pageLimit = parseInt(limit, 10) || 6;
            totalPages = Math.ceil(totalReviews / pageLimit) || 1;
            const startIndex = (currentPage - 1) * pageLimit;
            paginatedRatings = allRatings.slice(startIndex, startIndex + pageLimit);
        }
        res.status(200).json({
            success: true,
            avgRating,
            totalReviews,
            totalPages,
            currentPage,
            limit: pageLimit,
            starCounts,
            ratings: paginatedRatings,
        });
    }
    catch (err) {
        next(err);
    }
};
export const submitRating = async (req, res, next) => {
    try {
        const { projectId, contractId, subjectType, subjectId, stars, review } = req.body;
        const userId = req.user ? req.user._id : '';
        if (subjectType === 'contract' || contractId) {
            const targetContractId = contractId || subjectId;
            const rating = await lifecycleService.submitContractRating(targetContractId, userId, stars, review);
            return res.status(201).json({ success: true, rating });
        }
        const targetProjectId = projectId || subjectId;
        const rating = await lifecycleService.submitRating(targetProjectId, userId, stars, review);
        res.status(201).json({ success: true, rating });
    }
    catch (err) {
        next(err);
    }
};
export const toggleHideRating = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rating = await Rating.findById(id);
        if (!rating)
            return res.status(404).json({ success: false, message: 'Rating not found' });
        rating.hidden = !rating.hidden;
        await rating.save();
        res.status(200).json({ success: true, rating });
    }
    catch (err) {
        next(err);
    }
};
export const toggleFeatureRating = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { featured, clientTitle } = req.body || {};
        const rating = await Rating.findById(id);
        if (!rating)
            return res.status(404).json({ success: false, message: 'Rating not found' });
        if (typeof featured === 'boolean') {
            rating.featured = featured;
        }
        else {
            rating.featured = !rating.featured;
        }
        if (clientTitle !== undefined) {
            rating.clientTitle = clientTitle;
        }
        await rating.save();
        res.status(200).json({ success: true, rating });
    }
    catch (err) {
        next(err);
    }
};
export const deleteRating = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rating = await Rating.findByIdAndDelete(id);
        if (!rating)
            return res.status(404).json({ success: false, message: 'Rating not found' });
        res.status(200).json({ success: true, message: 'Rating deleted permanently' });
    }
    catch (err) {
        next(err);
    }
};
