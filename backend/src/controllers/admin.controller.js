import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Rating } from '../models/Rating.js';
import { PackageConfig } from '../models/PackageConfig.js';
import { Notification } from '../models/Notification.js';
import * as lifecycleService from '../services/lifecycle.service.js';

export const searchUsers = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email || email.trim().length === 0) {
      return res.status(200).json({ success: true, users: [] });
    }

    const users = await User.find({
      email: { $regex: email, $options: 'i' },
    })
      .select('name email avatarUrl')
      .limit(10);

    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

export const createProposal = async (req, res, next) => {
  try {
    const project = await lifecycleService.createProposal(req.user._id, req.body);
    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

export const getAllProjects = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { clientEmail: { $regex: search, $options: 'i' } },
        { editingStyle: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, projects });
  } catch (err) {
    next(err);
  }
};

export const markDelivered = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deliverableUrl } = req.body;
    const project = await lifecycleService.markDelivered(id, req.user._id, deliverableUrl);
    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const clientCount = await User.countDocuments({ role: 'client' });
    const allProjects = await Project.find({});

    const revenueETB = allProjects
      .filter((p) => (p.status === 'completed' || p.status === 'in_progress' || p.status === 'delivered') && p.currency === 'ETB')
      .reduce((sum, p) => sum + p.price, 0);

    const revenueUSD = allProjects
      .filter((p) => (p.status === 'completed' || p.status === 'in_progress' || p.status === 'delivered') && p.currency === 'USD')
      .reduce((sum, p) => sum + p.price, 0);

    const statusCounts = {
      proposal_sent: allProjects.filter((p) => p.status === 'proposal_sent').length,
      in_progress: allProjects.filter((p) => p.status === 'in_progress').length,
      delivered: allProjects.filter((p) => p.status === 'delivered').length,
      completed: allProjects.filter((p) => p.status === 'completed').length,
      declined: allProjects.filter((p) => p.status === 'declined').length,
    };

    const ratings = await Rating.find({ hidden: false });
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1)
      : '5.0';

    const recentActivity = await Notification.find({}).sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      stats: {
        revenueETB,
        revenueUSD,
        clientCount,
        statusCounts,
        avgRating,
        totalReviews: ratings.length,
        recentActivity,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updatePackageConfig = async (req, res, next) => {
  try {
    const { tier, length, currency, priceMin, priceMax, features } = req.body;

    const config = await PackageConfig.findOneAndUpdate(
      { tier, length, currency },
      { priceMin, priceMax, features },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, config });
  } catch (err) {
    next(err);
  }
};

export const getAllPackageConfigs = async (req, res, next) => {
  try {
    const configs = await PackageConfig.find({});
    res.status(200).json({ success: true, configs });
  } catch (err) {
    next(err);
  }
};
