export type ProjectStatus = 'proposal_sent' | 'in_progress' | 'declined' | 'delivered' | 'completed';
export type ContractStatus = 'proposed' | 'active' | 'completed' | 'declined' | 'cancelled';
export type PackageTier = 'basic' | 'professional' | 'premium';
export type Currency = 'USD' | 'ETB';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
  avatarUrl?: string;
  telegramId?: string;
  telegramUsername?: string;
  telegramChatId?: string;
  createdAt: string;
}

export interface Project {
  _id: string;
  clientId: string | { _id: string; name: string; email: string; avatarUrl?: string; telegramChatId?: string };
  createdByAdminId: string;
  status: ProjectStatus;
  editingStyle: string;
  contentLength: 'short' | 'long';
  packageTier: PackageTier;
  currency: Currency;
  price: number;
  referenceBrief?: string;
  deadline: string;
  notes?: string;
  deliverableUrl?: string;
  revisionNotes?: string;
  revisionCount?: number;
  proposalSentAt: string;
  acceptedAt?: string;
  declinedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  rated: boolean;
  createdAt: string;
}

export interface Deliverable {
  _id: string;
  title: string;
  videoUrl: string;
  notes?: string;
  approved: boolean;
  approvedAt?: string;
  createdAt: string;
}

export interface Contract {
  _id: string;
  clientId: string | { _id: string; name: string; email: string; avatarUrl?: string };
  packageTier: PackageTier;
  frequency: 'weekly-1' | 'weekly-2' | 'weekly-3' | 'custom';
  monthlyPrice: number;
  currency: Currency;
  totalVideosPlanned: number;
  deliveredCount: number;
  status: ContractStatus;
  deliverables: Deliverable[];
  startDate: string;
  endDate?: string;
  rated?: boolean;
  createdAt: string;
}

export interface RatingItem {
  _id: string;
  projectId?: string | { _id: string; editingStyle: string; packageTier: string };
  contractId?: string;
  clientId: string | { _id: string; name: string; avatarUrl?: string };
  clientName?: string;
  clientTitle?: string;
  clientAvatarUrl?: string;
  stars: number;
  review: string;
  featured?: boolean;
  packageTier?: string;
  editingStyle?: string;
  hidden: boolean;
  createdAt: string;
}

export interface RatingsAggregate {
  avgRating: string;
  totalReviews: number;
  totalPages?: number;
  currentPage?: number;
  starCounts: Record<number, number>;
}

export interface PortfolioItem {
  _id: string;
  title: string;
  styleName: string;
  format: 'short' | 'long';
  duration: string;
  clientType: string;
  videoUrl: string;
  thumbnailUrl: string;
  heroFeatured?: boolean;
  featuredHome?: boolean;
  heroSlot?: number;
  order?: number;
  createdAt?: string;
}

export interface PackageConfigItem {
  _id: string;
  tier: PackageTier;
  length: 'short' | 'long';
  currency: Currency;
  priceMin?: number | null;
  priceMax?: number | null;
  features: Record<string, string | boolean>;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  type: string;
  message: string;
  projectId?: string;
  contractId?: string;
  read: boolean;
  createdAt: string;
}

export interface AdminStats {
  revenueETB: number;
  revenueUSD: number;
  projRevenueETB: number;
  projRevenueUSD: number;
  contractRevenueETB: number;
  contractRevenueUSD: number;
  recurringRevenueETB: number;
  recurringRevenueUSD: number;
  activeContractsCount: number;
  totalContractsCount: number;
  clientCount: number;
  statusCounts: Record<string, number>;
  conversionRate: string;
  avgRating: string;
  totalReviews: number;
  revenueByTier: Record<PackageTier, { USD: number; ETB: number }>;
  revenueByStyle: Array<{ style: string; USD: number; ETB: number }>;
  topClients: Array<{ name: string; count: number; totalUSD: number; totalETB: number }>;
  revenueTrends: Array<{ label: string; USD: number; ETB: number }>;
}
