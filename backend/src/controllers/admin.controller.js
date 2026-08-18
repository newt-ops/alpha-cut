import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Contract } from '../models/Contract.js';
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
    const [projects, contracts] = await Promise.all([
      Project.find({ clientId: { $in: clientIds } }).select('clientId status'),
      Contract.find({ clientId: { $in: clientIds } }).select('clientId status'),
    ]);

    const clientsWithStats = clients.map((client) => {
      const userProjects = projects.filter((p) => p.clientId.toString() === client._id.toString());
      const userContracts = contracts.filter((c) => c.clientId.toString() === client._id.toString());

      const activeProj = userProjects.filter((p) => p.status === 'in_progress' || p.status === 'proposal_sent').length;
      const activeContract = userContracts.filter((c) => c.status === 'active' || c.status === 'proposed').length;

      return {
        ...client.toObject(),
        projectCount: userProjects.length + userContracts.length,
        activeProjectCount: activeProj + activeContract,
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

export const updateProjectAdminNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const project = await Project.findByIdAndUpdate(id, { adminNotes }, { new: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

export const updateClientAdminNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const client = await User.findByIdAndUpdate(id, { adminNotes }, { new: true }).select('name email adminNotes');
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.status(200).json({ success: true, client });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const clientCount = await User.countDocuments({ role: 'client' });
    const allProjects = await Project.find({});
    const allContracts = await Contract.find({});

    // One-Off Projects Revenue
    const projRevenueETB = allProjects
      .filter((p) => (p.status === 'delivered' || p.status === 'completed') && p.currency === 'ETB')
      .reduce((sum, p) => sum + p.price, 0);

    const projRevenueUSD = allProjects
      .filter((p) => (p.status === 'delivered' || p.status === 'completed') && p.currency === 'USD')
      .reduce((sum, p) => sum + p.price, 0);

    // Retainer Contracts Revenue (Active & Completed)
    const contractRevenueETB = allContracts
      .filter((c) => (c.status === 'active' || c.status === 'completed') && c.currency === 'ETB')
      .reduce((sum, c) => sum + (c.monthlyPrice * (c.durationMonths || 1)), 0);

    const contractRevenueUSD = allContracts
      .filter((c) => (c.status === 'active' || c.status === 'completed') && c.currency === 'USD')
      .reduce((sum, c) => sum + (c.monthlyPrice * (c.durationMonths || 1)), 0);

    const revenueETB = projRevenueETB + contractRevenueETB;
    const revenueUSD = projRevenueUSD + contractRevenueUSD;

    const activeContracts = allContracts.filter((c) => c.status === 'active');
    const recurringRevenueETB = activeContracts
      .filter((c) => c.currency === 'ETB')
      .reduce((sum, c) => sum + c.monthlyPrice, 0);

    const recurringRevenueUSD = activeContracts
      .filter((c) => c.currency === 'USD')
      .reduce((sum, c) => sum + c.monthlyPrice, 0);

    const statusCounts = {
      proposal_sent: allProjects.filter((p) => p.status === 'proposal_sent').length + allContracts.filter((c) => c.status === 'proposed').length,
      in_progress: allProjects.filter((p) => p.status === 'in_progress').length + allContracts.filter((c) => c.status === 'active').length,
      delivered: allProjects.filter((p) => p.status === 'delivered').length,
      revision_requested: allProjects.filter((p) => p.status === 'revision_requested').length,
      completed: allProjects.filter((p) => p.status === 'completed').length + allContracts.filter((c) => c.status === 'completed').length,
      declined: allProjects.filter((p) => p.status === 'declined').length + allContracts.filter((c) => c.status === 'declined').length,
    };

    const totalProposals = statusCounts.proposal_sent + statusCounts.in_progress + statusCounts.delivered + statusCounts.revision_requested + statusCounts.completed + statusCounts.declined;
    const acceptedProposals = statusCounts.in_progress + statusCounts.delivered + statusCounts.revision_requested + statusCounts.completed;
    const conversionRate = totalProposals > 0 ? ((acceptedProposals / totalProposals) * 100).toFixed(1) + '%' : '0%';

    const ratings = await Rating.find({ hidden: false }).sort({ createdAt: 1 });
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1)
      : '5.0';

    // Revenue by Package Tier Breakdown
    const revenueByTier = {
      basic: { USD: 0, ETB: 0 },
      professional: { USD: 0, ETB: 0 },
      premium: { USD: 0, ETB: 0 },
    };

    allProjects.forEach((p) => {
      if (p.packageTier && revenueByTier[p.packageTier]) {
        revenueByTier[p.packageTier][p.currency || 'USD'] += p.price || 0;
      }
    });

    allContracts.forEach((c) => {
      if (c.packageTier && revenueByTier[c.packageTier]) {
        revenueByTier[c.packageTier][c.currency || 'USD'] += (c.monthlyPrice * (c.durationMonths || 1)) || 0;
      }
    });

    // Revenue by Editing Style Breakdown
    const revenueByStyleMap = {};
    allProjects.forEach((p) => {
      const style = p.editingStyle || 'Custom Edit';
      if (!revenueByStyleMap[style]) revenueByStyleMap[style] = { USD: 0, ETB: 0 };
      revenueByStyleMap[style][p.currency || 'USD'] += p.price || 0;
    });

    const revenueByStyle = Object.keys(revenueByStyleMap).map((style) => ({
      style,
      USD: revenueByStyleMap[style].USD,
      ETB: revenueByStyleMap[style].ETB,
    }));

    // Top Clients Leaderboard
    const clientRevenueMap = {};
    allProjects.forEach((p) => {
      const key = p.clientEmail || p.clientName;
      if (!clientRevenueMap[key]) clientRevenueMap[key] = { name: p.clientName, email: p.clientEmail, totalETB: 0, totalUSD: 0, count: 0 };
      clientRevenueMap[key].count += 1;
      if (p.currency === 'ETB') clientRevenueMap[key].totalETB += p.price;
      else clientRevenueMap[key].totalUSD += p.price;
    });

    allContracts.forEach((c) => {
      const key = c.clientEmail || c.clientName;
      if (!clientRevenueMap[key]) clientRevenueMap[key] = { name: c.clientName, email: c.clientEmail, totalETB: 0, totalUSD: 0, count: 0 };
      clientRevenueMap[key].count += 1;
      const totalVal = c.monthlyPrice * (c.durationMonths || 1);
      if (c.currency === 'ETB') clientRevenueMap[key].totalETB += totalVal;
      else clientRevenueMap[key].totalUSD += totalVal;
    });

    const topClients = Object.values(clientRevenueMap)
      .sort((a, b) => b.totalUSD + b.totalETB - (a.totalUSD + a.totalETB))
      .slice(0, 5);

    // Timeline Revenue Trend Points for Recharts (Last 6 Months / Monthly)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrendMap = {};
    
    // Seed last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      monthlyTrendMap[label] = { label, USD: 0, ETB: 0 };
    }

    allProjects.forEach((p) => {
      const d = new Date(p.createdAt);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      if (monthlyTrendMap[label]) {
        monthlyTrendMap[label][p.currency || 'USD'] += p.price || 0;
      }
    });

    allContracts.forEach((c) => {
      const d = new Date(c.createdAt);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      if (monthlyTrendMap[label]) {
        monthlyTrendMap[label][c.currency || 'USD'] += (c.monthlyPrice * (c.durationMonths || 1)) || 0;
      }
    });

    const revenueTrends = Object.values(monthlyTrendMap);

    const recentActivity = await Notification.find({}).sort({ createdAt: -1 }).limit(20);

    res.status(200).json({
      success: true,
      stats: {
        revenueETB,
        revenueUSD,
        projRevenueETB,
        projRevenueUSD,
        contractRevenueETB,
        contractRevenueUSD,
        recurringRevenueETB,
        recurringRevenueUSD,
        activeContractsCount: activeContracts.length,
        totalContractsCount: allContracts.length,
        clientCount,
        statusCounts,
        conversionRate,
        avgRating,
        totalReviews: ratings.length,
        revenueByTier,
        revenueByStyle,
        topClients,
        revenueTrends,
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
