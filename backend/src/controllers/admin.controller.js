import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Rating } from '../models/Rating.js';
import { PackageConfig } from '../models/PackageConfig.js';
import { Notification } from '../models/Notification.js';
import * as lifecycleService from '../services/lifecycle.service.js';

const INITIAL_PACKAGE_SEEDS = [
  // Short-Form ETB
  { tier: 'basic', length: 'short', currency: 'ETB', priceMin: 500, priceMax: 800 },
  { tier: 'professional', length: 'short', currency: 'ETB', priceMin: 900, priceMax: 1400 },
  { tier: 'premium', length: 'short', currency: 'ETB', priceMin: 1600, priceMax: 2400 },
  // Long-Form ETB
  { tier: 'basic', length: 'long', currency: 'ETB', priceMin: 4000, priceMax: 6500 },
  { tier: 'professional', length: 'long', currency: 'ETB', priceMin: 7500, priceMax: 11000 },
  { tier: 'premium', length: 'long', currency: 'ETB', priceMin: 13000, priceMax: 18000 },
];

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

export const getAllClients = async (req, res, next) => {
  try {
    const clients = await User.find({ role: 'client' })
      .select('name email avatarUrl telegramChatId telegramLinkedAt createdAt')
      .sort({ createdAt: -1 });

    const clientIds = clients.map((c) => c._id);
    const projects = await Project.find({ clientId: { $in: clientIds } }).select('clientId status');

    const clientsWithStats = clients.map((client) => {
      const userProjects = projects.filter((p) => p.clientId.toString() === client._id.toString());
      return {
        ...client.toObject(),
        projectCount: userProjects.length,
        activeProjectCount: userProjects.filter((p) => p.status === 'in_progress' || p.status === 'proposal_sent').length,
      };
    });

    res.status(200).json({ success: true, clients: clientsWithStats });
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
    const project = await lifecycleService.markDelivered(id, req.user._id);
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
      .filter((p) => (p.status === 'delivered' || p.status === 'completed') && p.currency === 'ETB')
      .reduce((sum, p) => sum + p.price, 0);

    const revenueUSD = allProjects
      .filter((p) => (p.status === 'delivered' || p.status === 'completed') && p.currency === 'USD')
      .reduce((sum, p) => sum + p.price, 0);

    const statusCounts = {
      proposal_sent: allProjects.filter((p) => p.status === 'proposal_sent').length,
      in_progress: allProjects.filter((p) => p.status === 'in_progress').length,
      delivered: allProjects.filter((p) => p.status === 'delivered').length,
      completed: allProjects.filter((p) => p.status === 'completed').length,
      declined: allProjects.filter((p) => p.status === 'declined').length,
    };

    const totalProposals = statusCounts.proposal_sent + statusCounts.in_progress + statusCounts.delivered + statusCounts.completed + statusCounts.declined;
    const acceptedProposals = statusCounts.in_progress + statusCounts.delivered + statusCounts.completed;
    const conversionRate = totalProposals > 0 ? ((acceptedProposals / totalProposals) * 100).toFixed(1) + '%' : '0%';

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
        conversionRate,
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
    let configs = await PackageConfig.find({});

    // Seed any missing tier configs
    for (const seed of INITIAL_PACKAGE_SEEDS) {
      const exists = configs.some((c) => c.tier === seed.tier && c.length === seed.length && c.currency === seed.currency);
      if (!exists) {
        await PackageConfig.create(seed);
      }
    }

    configs = await PackageConfig.find({});
    res.status(200).json({ success: true, configs });
  } catch (err) {
    next(err);
  }
};

// Live Exchange Rate Fetcher
export const getLiveExchangeRate = async (req, res, next) => {
  try {
    let usdToEtbRate = 128.5; // Canonical Ethiopian exchange rate fallback

    try {
      const apiRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data && data.rates && data.rates.ETB) {
          usdToEtbRate = Number(data.rates.ETB.toFixed(2));
        }
      }
    } catch (e) {
      // Use fallback
    }

    const etbToUsdRate = Number((1 / usdToEtbRate).toFixed(5));

    res.status(200).json({
      success: true,
      usdToEtb: usdToEtbRate,
      etbToUsd: etbToUsdRate,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};
