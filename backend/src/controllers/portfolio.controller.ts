import { Request, Response, NextFunction } from 'express';
import { PortfolioItem } from '../models/PortfolioItem.js';

const INITIAL_SEED_ITEMS = [
  {
    title: 'The AI Revolution in 60 Seconds',
    styleName: 'Viral Animation Breakdown',
    format: 'short',
    duration: '0:58',
    clientType: 'Tech Creator',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    isHeroFeatured: true,
    heroSlot: 1,
    order: 1,
  },
  {
    title: 'How I Built a $1M Agency from Scratch',
    styleName: 'Cinematic Short-Film',
    format: 'short',
    duration: '1:15',
    clientType: 'Founder Brand',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80',
    isHeroFeatured: true,
    heroSlot: 2,
    order: 2,
  },
  {
    title: 'Software Platform Feature Walkthrough',
    styleName: 'SaaS & App Animation',
    format: 'long',
    duration: '3:45',
    clientType: 'B2B Software',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    order: 3,
  },
  {
    title: 'Stop Wasting 4 Hours Every Day',
    styleName: 'David Jota Hook Style',
    format: 'short',
    duration: '0:45',
    clientType: 'Productivity Influencer',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    order: 4,
  },
  {
    title: 'Deep Work Mastery & Focus Systems',
    styleName: 'Ali Abdaal Storytelling',
    format: 'short',
    duration: '1:30',
    clientType: 'Educational Creator',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80',
    order: 5,
  },
  {
    title: 'Why Most Startups Fail in Year 1',
    styleName: 'Viral Animation Breakdown',
    format: 'short',
    duration: '0:52',
    clientType: 'Venture Studio',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    order: 6,
  },
];

export const getPortfolioItems = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    let items = await PortfolioItem.find({}).sort({ order: 1, createdAt: -1 });

    if (items.length === 0) {
      items = (await PortfolioItem.insertMany(INITIAL_SEED_ITEMS as any)) as any;
    }

    res.status(200).json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

export const createPortfolioItem = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const item = await PortfolioItem.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

export const updatePortfolioItem = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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

export const deletePortfolioItem = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
