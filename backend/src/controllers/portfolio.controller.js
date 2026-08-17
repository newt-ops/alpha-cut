import { PortfolioItem } from '../models/PortfolioItem.js';

const INITIAL_SEED_ITEMS = [
  {
    title: 'The AI Revolution in 60 Seconds',
    styleName: 'Viral Animation Breakdown',
    format: 'short',
    duration: '0:58',
    clientType: 'Tech Creator',
  },
  {
    title: 'How I Built a $1M Agency from Scratch',
    styleName: 'Cinematic Short-Film',
    format: 'short',
    duration: '1:15',
    clientType: 'Founder Brand',
  },
  {
    title: 'Software Platform Feature Walkthrough',
    styleName: 'SaaS & App Animation',
    format: 'long',
    duration: '3:45',
    clientType: 'B2B Software',
  },
  {
    title: 'Stop Wasting 4 Hours Every Day',
    styleName: 'David Jota Hook Style',
    format: 'short',
    duration: '0:45',
    clientType: 'Productivity Influencer',
  },
  {
    title: 'Deep Work Mastery & Focus Systems',
    styleName: 'Ali Abdaal Storytelling',
    format: 'short',
    duration: '1:30',
    clientType: 'Educational Creator',
  },
  {
    title: 'Why Most Startups Fail in Year 1',
    styleName: 'Viral Animation Breakdown',
    format: 'short',
    duration: '0:52',
    clientType: 'Venture Studio',
  },
];

export const getPortfolioItems = async (req, res, next) => {
  try {
    let items = await PortfolioItem.find({}).sort({ order: 1, createdAt: -1 });

    // Seed database if empty on first boot
    if (items.length === 0) {
      items = await PortfolioItem.insertMany(INITIAL_SEED_ITEMS);
    }

    res.status(200).json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

export const createPortfolioItem = async (req, res, next) => {
  try {
    const item = await PortfolioItem.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

export const updatePortfolioItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await PortfolioItem.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Portfolio sample item not found' });
    }
    res.status(200).json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

export const deletePortfolioItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await PortfolioItem.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Portfolio sample item not found' });
    }
    res.status(200).json({ success: true, message: 'Portfolio item deleted successfully' });
  } catch (err) {
    next(err);
  }
};
