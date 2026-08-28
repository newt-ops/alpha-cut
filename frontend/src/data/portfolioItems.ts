export interface PortfolioDataItem {
  id: string;
  title: string;
  styleId: string;
  styleName: string;
  format: 'short' | 'long';
  duration: string;
  clientType: string;
  videoUrl: string | null;
  thumbnailUrl?: string;
  isHeroFeatured?: boolean;
  heroSlot?: number;
}

export const PORTFOLIO_ITEMS: PortfolioDataItem[] = [
  {
    id: 'port-1',
    title: 'The AI Revolution in 60 Seconds',
    styleId: 'viral-animation',
    styleName: 'Viral Animation Breakdown',
    format: 'short',
    duration: '0:58',
    clientType: 'Tech Creator',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=480&q=75',
    isHeroFeatured: true,
    heroSlot: 1,
  },
  {
    id: 'port-2',
    title: 'How I Built a $1M Agency from Scratch',
    styleId: 'cinematic-storytelling',
    styleName: 'Cinematic Short-Film',
    format: 'short',
    duration: '1:15',
    clientType: 'Founder Brand',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=480&q=75',
    isHeroFeatured: true,
    heroSlot: 2,
  },
  {
    id: 'port-3',
    title: 'SaaS Platform Feature Walkthrough',
    styleId: 'saas-animation',
    styleName: 'SaaS & App Animation',
    format: 'long',
    duration: '3:45',
    clientType: 'B2B Software',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=480&q=75',
  },
  {
    id: 'port-4',
    title: 'Stop Wasting 4 Hours Every Day',
    styleId: 'jota-hook',
    styleName: 'David Jota Hook Style',
    format: 'short',
    duration: '0:45',
    clientType: 'Productivity Influencer',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=480&q=75',
  },
  {
    id: 'port-5',
    title: 'Deep Work Mastery & Focus Systems',
    styleId: 'abdaal-style',
    styleName: 'Ali Abdaal Storytelling',
    format: 'short',
    duration: '1:30',
    clientType: 'Educational Creator',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=480&q=75',
  },
  {
    id: 'port-6',
    title: 'Why Most Startups Fail in Year 1',
    styleId: 'viral-animation',
    styleName: 'Viral Animation Breakdown',
    format: 'short',
    duration: '0:52',
    clientType: 'Venture Studio',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=480&q=75',
  },
  {
    id: 'port-7',
    title: 'Building Alpha Cut: Behind The Craft',
    styleId: 'cinematic-storytelling',
    styleName: 'Cinematic Short-Film',
    format: 'long',
    duration: '4:20',
    clientType: 'Agency Documentary',
    videoUrl: null,
  },
  {
    id: 'port-8',
    title: '3 Hook Formulas That Guarantee Views',
    styleId: 'jota-hook',
    styleName: 'David Jota Hook Style',
    format: 'short',
    duration: '0:40',
    clientType: 'Growth Marketer',
    videoUrl: null,
  },
];
