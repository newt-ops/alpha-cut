import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { AdminLayout } from '@components/layout/AdminLayout';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input, Textarea } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { Modal } from '@components/ui/Modal';
import { DatePicker } from '@components/ui/DatePicker';
import { StarRating } from '@components/ui/StarRating';
import { Dropzone } from '@components/ui/Dropzone';
import { NotionCalendar } from '@components/calendar/NotionCalendar';
import { EDITING_STYLES } from '../data/editingStyles';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';
import { AdminHeaderBar } from '@components/admin/AdminHeaderBar';
import { AdminSectionHeader } from '@components/admin/AdminSectionHeader';
import { AnalyticsCharts } from '@components/admin/AnalyticsCharts';
import { DataTable } from '@components/admin/DataTable';
import { ProjectsKanbanBoard } from '@components/admin/ProjectsKanbanBoard';
import { Stepper } from '@components/ui/Stepper';
import {
  IconSearch,
  IconUser,
  IconDollar,
  IconShield,
  IconSparkles,
  IconUpload,
  IconExternalLink,
  IconCheck,
  IconStar,
  IconFileText,
  IconBarChart,
  IconPlus,
  IconClose,
  IconFilm,
  IconCalendar,
} from '@icons/icons';

export const AdminPage: React.FC = () => {
  const { apiFetch } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & Data State
  const [stats, setStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState({ usdToEtb: 128.5, etbToUsd: 0.00778 });
  const [loading, setLoading] = useState(true);

  // New Full System Dashboard State
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [projectViewMode, setProjectViewMode] = useState<'table' | 'kanban'>('table');
  const [projectFilterTab, setProjectFilterTab] = useState('all');
  const [contractFilterTab, setContractFilterTab] = useState('all');
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClientForDetail, setSelectedClientForDetail] = useState<any>(null);
  const [adminNotesText, setAdminNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [portfolioStyleFilter, setPortfolioStyleFilter] = useState('all');
  const [portfolioFormatFilter, setPortfolioFormatFilter] = useState('all');
  const [reviewStarFilter, setReviewStarFilter] = useState('all');

  const handleOpenProposalModal = () => {
    setProposalModalOpen(true);
  };

  // Client Filter Search State
  const [clientFilterText, setClientFilterText] = useState('');

  // Proposal Form Branching State ('project' | 'contract')
  const [proposalType, setProposalType] = useState<'project' | 'contract'>('project');

  // New Proposal Form State (One-off Project)
  const [clientSearchText, setClientSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [editingStyle, setEditingStyle] = useState(EDITING_STYLES[0].name);
  const [contentLength, setContentLength] = useState('short');
  const [packageTier, setPackageTier] = useState('professional');
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');
  const [price, setPrice] = useState('900');
  const [referenceBrief, setReferenceBrief] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // New Retainer Contract Form State
  const [contractFrequency, setContractFrequency] = useState('weekly-2');
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractDurationMonths, setContractDurationMonths] = useState('1');
  const [contractMonthlyPrice, setContractMonthlyPrice] = useState('7200');

  // Add Deliverable Modal State
  const [addDeliverableModalOpen, setAddDeliverableModalOpen] = useState(false);
  const [selectedContractForDeliverable, setSelectedContractForDeliverable] = useState<any>(null);
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');
  const [uploadingDeliverable, setUploadingDeliverable] = useState(false);
  const [deliverableProgress, setDeliverableProgress] = useState(0);
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);

  // Portfolio Management Form & Modal State
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [portTitle, setPortTitle] = useState('');
  const [portStyleName, setPortStyleName] = useState('Viral Animation Breakdown');
  const [portFormat, setPortFormat] = useState('short');
  const [portDuration, setPortDuration] = useState('0:60');
  const [portClientType, setPortClientType] = useState('Tech Creator');
  const [portVideoUrl, setPortVideoUrl] = useState('');
  const [portThumbnailUrl, setPortThumbnailUrl] = useState('');
  const [portHeroSlot, setPortHeroSlot] = useState(0);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [submittingPortfolio, setSubmittingPortfolio] = useState(false);

  // Featured Rating Modal State
  const [featuredModalOpen, setFeaturedModalOpen] = useState(false);
  const [selectedRatingForFeature, setSelectedRatingForFeature] = useState<any>(null);
  const [featureClientTitle, setFeatureClientTitle] = useState('');
  const [submittingFeature, setSubmittingFeature] = useState(false);

  // Package Settings State (3 Tiers)
  const [basicMin, setBasicMin] = useState('500');
  const [basicMax, setBasicMax] = useState('800');
  const [professionalMin, setProfessionalMin] = useState('900');
  const [professionalMax, setProfessionalMax] = useState('1400');
  const [premiumMin, setPremiumMin] = useState('1600');
  const [premiumMax, setPremiumMax] = useState('2400');
  const [savingPackages, setSavingPackages] = useState(false);

  // Detail Modal State
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, projRes, contractRes, ratRes, clientRes, pkgRes, portRes, rateRes, notifRes] = await Promise.all([
        apiFetch('/api/admin/stats').catch(() => ({ success: false })),
        apiFetch('/api/admin/projects').catch(() => ({ success: false })),
        apiFetch('/api/admin/contracts').catch(() => ({ success: false, contracts: [] })),
        apiFetch('/api/ratings').catch(() => ({ success: false })),
        apiFetch('/api/admin/clients').catch(() => ({ success: false, clients: [] })),
        apiFetch('/api/admin/packages').catch(() => ({ success: false, configs: [] })),
        apiFetch('/api/portfolio').catch(() => ({ success: false, items: [] })),
        apiFetch('/api/packages/exchange-rate').catch(() => ({ success: false })),
        apiFetch('/api/notifications').catch(() => ({ success: false, notifications: [] })),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (projRes.success) setProjects(projRes.projects);
      if (contractRes.success) setContracts(contractRes.contracts);
      if (ratRes.success) setRatings(ratRes.ratings);
      if (clientRes.success) setClients(clientRes.clients);
      if (portRes.success) setPortfolioItems(portRes.items);
      if (notifRes.success) setNotifications(notifRes.notifications);

      if (rateRes.success && rateRes.usdToEtb) {
        setExchangeRate({ usdToEtb: rateRes.usdToEtb, etbToUsd: rateRes.etbToUsd });
      }

      if (pkgRes.success) {
        setPackages(pkgRes.configs);

        const basicConfig = pkgRes.configs.find((c: any) => c.tier === 'basic' && c.currency === 'ETB');
        if (basicConfig) {
          if (basicConfig.priceMin) setBasicMin(basicConfig.priceMin.toString());
          if (basicConfig.priceMax) setBasicMax(basicConfig.priceMax.toString());
        }

        const profConfig = pkgRes.configs.find((c: any) => c.tier === 'professional' && c.currency === 'ETB');
        if (profConfig) {
          if (profConfig.priceMin) setProfessionalMin(profConfig.priceMin.toString());
          if (profConfig.priceMax) setProfessionalMax(profConfig.priceMax.toString());
        }

        const premiumConfig = pkgRes.configs.find((c: any) => c.tier === 'premium' && c.currency === 'ETB');
        if (premiumConfig) {
          if (premiumConfig.priceMin) setPremiumMin(premiumConfig.priceMin.toString());
          if (premiumConfig.priceMax) setPremiumMax(premiumConfig.priceMax.toString());
        }
      }
    } catch (err) {
      toast({ message: 'Failed to load admin panel data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [apiFetch, toast]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Mark all activity notifications as read
  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({ message: 'All notifications marked as read', type: 'info' });
    try {
      await apiFetch('/api/notifications/read-all', { method: 'POST' });
    } catch (err) {
      // Backend route pending deployment fallback
    }
  };

  // Save private CRM notes for a project
  const handleSaveProjectNotes = async (projectId: string, adminNotes: string) => {
    try {
      setSavingNotes(true);
      const res = await apiFetch(`/api/admin/projects/${projectId}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ adminNotes }),
      });
      if (res.success) {
        toast({ message: 'Private project notes saved!', type: 'success' });
        fetchAdminData();
        if (selectedProjectForDetail && selectedProjectForDetail._id === projectId) {
          setSelectedProjectForDetail((prev: any) => ({ ...prev, adminNotes }));
        }
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to save notes', type: 'error' });
    } finally {
      setSavingNotes(false);
    }
  };

  // Save private CRM notes for a client
  const handleSaveClientNotes = async (clientId: string, adminNotes: string) => {
    try {
      setSavingNotes(true);
      const res = await apiFetch(`/api/admin/clients/${clientId}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ adminNotes }),
      });
      if (res.success) {
        toast({ message: 'Private client CRM notes saved!', type: 'success' });
        fetchAdminData();
        if (selectedClientForDetail && selectedClientForDetail._id === clientId) {
          setSelectedClientForDetail((prev: any) => ({ ...prev, adminNotes }));
        }
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to save notes', type: 'error' });
    } finally {
      setSavingNotes(false);
    }
  };

  // Auto-calculate suggested monthly price based on frequency and selected tier
  useEffect(() => {
    let videosPerMonth = 8;
    switch (contractFrequency) {
      case 'weekly-1': videosPerMonth = 4; break;
      case 'weekly-2': videosPerMonth = 8; break;
      case 'weekly-3-4': videosPerMonth = 14; break;
      case 'daily-1': videosPerMonth = 30; break;
      case 'daily-2': videosPerMonth = 60; break;
      default: videosPerMonth = 8;
    }

    let minRate = 900;
    if (packageTier === 'basic') minRate = Number(basicMin) || 500;
    else if (packageTier === 'professional') minRate = Number(professionalMin) || 900;
    else if (packageTier === 'premium') minRate = Number(premiumMin) || 1600;

    let computedPriceETB = videosPerMonth * minRate;
    if (currency === 'USD') {
      setContractMonthlyPrice((Math.round(computedPriceETB * exchangeRate.etbToUsd)).toString());
    } else {
      setContractMonthlyPrice(computedPriceETB.toString());
    }
  }, [contractFrequency, packageTier, currency, basicMin, professionalMin, premiumMin, exchangeRate]);

  // Client Typeahead Search
  useEffect(() => {
    if (!clientSearchText || clientSearchText.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch(`/api/admin/users/search?email=${encodeURIComponent(clientSearchText)}`);
        if (res.success) setSearchResults(res.users);
      } catch (err) {
        // Search error
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [clientSearchText, apiFetch]);

  // Submit One-off Project Proposal
  const handleCreateProjectProposal = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast({ message: 'Please select a valid client from the search results.', type: 'error' });
      return;
    }
    if (!price || !deadline) {
      toast({ message: 'Please enter price and deadline date.', type: 'error' });
      return;
    }

    try {
      setSubmittingProposal(true);
      const res = await apiFetch('/api/admin/proposals', {
        method: 'POST',
        body: JSON.stringify({
          clientId: selectedClient._id,
          clientEmail: selectedClient.email.toLowerCase().trim(),
          editingStyle,
          contentLength,
          packageTier,
          currency,
          price: Number(price),
          referenceBrief,
          deadline,
          notes,
        }),
      });

      if (res.success) {
        toast({ message: 'Proposal created & sent to client via Telegram/Email!', type: 'success' });
        setProposalModalOpen(false);
        resetProposalForm();
        fetchAdminData();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to create proposal', type: 'error' });
    } finally {
      setSubmittingProposal(false);
    }
  };

  // Submit Retainer Contract Proposal
  const handleCreateContractProposal = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast({ message: 'Please select a valid client from the search results.', type: 'error' });
      return;
    }
    if (!contractStartDate || !contractMonthlyPrice) {
      toast({ message: 'Please specify start date and monthly price.', type: 'error' });
      return;
    }

    try {
      setSubmittingProposal(true);
      const res = await apiFetch('/api/admin/contracts', {
        method: 'POST',
        body: JSON.stringify({
          clientId: selectedClient._id,
          clientEmail: selectedClient.email.toLowerCase().trim(),
          packageTier,
          frequency: contractFrequency,
          monthlyPrice: Number(contractMonthlyPrice),
          currency,
          startDate: contractStartDate,
          durationMonths: Number(contractDurationMonths),
          notes,
        }),
      });

      if (res.success) {
        toast({ message: 'Retainer contract proposal sent to client!', type: 'success' });
        setProposalModalOpen(false);
        resetProposalForm();
        fetchAdminData();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to create contract', type: 'error' });
    } finally {
      setSubmittingProposal(false);
    }
  };

  const resetProposalForm = () => {
    setSelectedClient(null);
    setClientSearchText('');
    setSearchResults([]);
    setPrice('900');
    setReferenceBrief('');
    setDeadline('');
    setNotes('');
  };

  // Mark Project as Delivered
  const handleMarkDelivered = async (projectId: string) => {
    const deliveryLink = window.prompt('Enter Google Drive / Frame.io video render link:');
    if (!deliveryLink) return;

    try {
      const res = await apiFetch(`/api/admin/projects/${projectId}/deliver`, {
        method: 'POST',
        body: JSON.stringify({ deliveryLink }),
      });
      if (res.success) {
        toast({ message: 'Project status updated to Delivered!', type: 'success' });
        fetchAdminData();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to update project', type: 'error' });
    }
  };

  // Submit New Retainer Deliverable Video
  const handleAddDeliverable = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedContractForDeliverable || !deliverableTitle.trim() || !deliverableUrl.trim()) {
      toast({ message: 'Title and video delivery URL are required.', type: 'error' });
      return;
    }

    try {
      setSubmittingDeliverable(true);
      const res = await apiFetch(`/api/admin/contracts/${selectedContractForDeliverable._id}/deliverables`, {
        method: 'POST',
        body: JSON.stringify({
          title: deliverableTitle.trim(),
          deliveryUrl: deliverableUrl.trim(),
          notes: deliverableNotes.trim(),
        }),
      });

      if (res.success) {
        toast({ message: 'Deliverable video registered & sent to client!', type: 'success' });
        setAddDeliverableModalOpen(false);
        setDeliverableTitle('');
        setDeliverableUrl('');
        setDeliverableNotes('');
        fetchAdminData();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to add deliverable', type: 'error' });
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  // Upload Cover Image for Portfolio Item
  const handleCoverUpload = async (file: File) => {
    try {
      setUploadingCover(true);
      setCoverProgress(0);

      const sigRes = await apiFetch('/api/uploads/signature', { method: 'POST' });
      if (!sigRes.success) throw new Error('Failed to obtain Cloudinary signature');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigRes.apiKey);
      formData.append('timestamp', sigRes.timestamp);
      formData.append('signature', sigRes.signature);
      formData.append('folder', sigRes.folder);

      const cloudData: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigRes.cloudName}/image/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setCoverProgress(percent);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed with status ' + xhr.status));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });

      if (cloudData.secure_url) {
        setPortThumbnailUrl(cloudData.secure_url);
        toast({ message: 'Cover thumbnail uploaded!', type: 'success' });
      }
    } catch (err: any) {
      toast({ message: err.message || 'Upload failed', type: 'error' });
    } finally {
      setUploadingCover(false);
      setCoverProgress(0);
    }
  };

  // Create / Edit Portfolio Item
  const handleSavePortfolioItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!portTitle.trim()) {
      toast({ message: 'Title is required.', type: 'error' });
      return;
    }

    try {
      setSubmittingPortfolio(true);
      const payload = {
        title: portTitle.trim(),
        styleName: portStyleName,
        format: portFormat,
        duration: portDuration,
        clientType: portClientType,
        videoUrl: portVideoUrl,
        thumbnailUrl: portThumbnailUrl,
        heroSlot: Number(portHeroSlot),
      };

      let res;
      if (editingPortfolioId) {
        res = await apiFetch(`/api/admin/portfolio/${editingPortfolioId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch('/api/admin/portfolio', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.success) {
        toast({ message: editingPortfolioId ? 'Portfolio item updated!' : 'Portfolio item created!', type: 'success' });
        setPortfolioModalOpen(false);
        resetPortfolioForm();
        fetchAdminData();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to save portfolio item', type: 'error' });
    } finally {
      setSubmittingPortfolio(false);
    }
  };

  const resetPortfolioForm = () => {
    setEditingPortfolioId(null);
    setPortTitle('');
    setPortStyleName('Viral Animation Breakdown');
    setPortFormat('short');
    setPortDuration('0:60');
    setPortClientType('Tech Creator');
    setPortVideoUrl('');
    setPortThumbnailUrl('');
    setPortHeroSlot(0);
    setCoverProgress(0);
    setUploadingCover(false);
  };

  const handleEditPortfolioItem = (item: any) => {
    setEditingPortfolioId(item._id);
    setPortTitle(item.title);
    setPortStyleName(item.styleName || 'Viral Animation Breakdown');
    setPortFormat(item.format || 'short');
    setPortDuration(item.duration || '0:60');
    setPortClientType(item.clientType || 'Tech Creator');
    setPortVideoUrl(item.videoUrl || '');
    setPortThumbnailUrl(item.thumbnailUrl || '');
    setPortHeroSlot(item.heroSlot || 0);
    setPortfolioModalOpen(true);
  };

  const handleDeletePortfolioItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this portfolio showcase item?')) return;
    try {
      const res = await apiFetch(`/api/admin/portfolio/${id}`, { method: 'DELETE' });
      if (res.success) {
        toast({ message: 'Portfolio item deleted.', type: 'info' });
        fetchAdminData();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to delete item', type: 'error' });
    }
  };

  // Toggle Rating Featured Status
  const handleToggleFeaturedRating = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRatingForFeature) return;

    try {
      setSubmittingFeature(true);
      const isCurrentlyFeatured = selectedRatingForFeature.featured;
      const res = await apiFetch(`/api/admin/ratings/${selectedRatingForFeature._id}/feature`, {
        method: 'PUT',
        body: JSON.stringify({
          featured: !isCurrentlyFeatured,
          clientTitle: featureClientTitle.trim(),
        }),
      });

      if (res.success) {
        toast({ message: !isCurrentlyFeatured ? 'Review featured on public homepage!' : 'Review unfeatured.', type: 'success' });
        setFeaturedModalOpen(false);
        setSelectedRatingForFeature(null);
        setFeatureClientTitle('');
        fetchAdminData();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to update rating', type: 'error' });
    } finally {
      setSubmittingFeature(false);
    }
  };

  // Save Pricing Tier Ranges
  const handleSavePackages = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSavingPackages(true);
      const updates = [
        { tier: 'basic', currency: 'ETB', length: 'short', priceMin: Number(basicMin), priceMax: Number(basicMax) },
        { tier: 'professional', currency: 'ETB', length: 'short', priceMin: Number(professionalMin), priceMax: Number(professionalMax) },
        { tier: 'premium', currency: 'ETB', length: 'short', priceMin: Number(premiumMin), priceMax: Number(premiumMax) },
      ];

      const res = await apiFetch('/api/admin/packages', {
        method: 'PUT',
        body: JSON.stringify({ configs: updates }),
      });

      if (res.success) {
        toast({ message: 'Pricing tiers updated across main website & calculator!', type: 'success' });
        fetchAdminData();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to save package settings', type: 'error' });
    } finally {
      setSavingPackages(false);
    }
  };

  const projectColumns = [
    {
      key: 'editingStyle',
      label: 'STYLE & TIER',
      sortable: true,
      render: (val: any, row: any) => (
        <div>
          <span style={{ fontWeight: 700, display: 'block' }}>{val}</span>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>
            {(row.packageTier || 'Short-Form').toUpperCase()}
          </span>
        </div>
      ),
    },
    { key: 'clientName', label: 'CLIENT', sortable: true },
    {
      key: 'price',
      label: 'RATE',
      sortable: true,
      render: (val: any, row: any) => (
        <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
          {val} {row.currency}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      sortable: true,
      render: (val: any) => {
        let variant: 'gold' | 'success' | 'surface' | 'maroon' = 'gold';
        if (val === 'completed') variant = 'success';
        if (val === 'in_progress') variant = 'gold';
        if (val === 'delivered') variant = 'maroon';
        return <Badge variant={variant} size="small">{val ? val.replace('_', ' ').toUpperCase() : 'UNKNOWN'}</Badge>;
      },
    },
    {
      key: 'deadline',
      label: 'DEADLINE',
      sortable: true,
      render: (val: any) => (val ? new Date(val).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (_: any, row: any) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {(row.status === 'in_progress' || row.status === 'revision_requested') && (
            <Button
              variant="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkDelivered(row._id);
              }}
            >
              Deliver Render
            </Button>
          )}

          <Button
            variant="secondary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProjectForDetail(row);
              setAdminNotesText(row.adminNotes || '');
              setDetailModalOpen(true);
            }}
          >
            Inspect CRM
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout activeTab={activeTab} onChangeTab={setActiveTab}>
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-soft)' }}>
          <p>Loading Alpha Cut ERP Operations Hub...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab={activeTab} onChangeTab={setActiveTab}>
      <div style={{ display: 'grid', gap: '32px' }} className="admin-page-container">
        {/* TOP SYSTEM BAR & NOTIFICATIONS ACCESS */}
        <AdminHeaderBar
          onOpenProposalModal={handleOpenProposalModal}
          notifications={notifications}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        />

        {/* 1. OVERVIEW & ANALYTICS EXECUTIVE TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: '32px' }}>
            <AdminSectionHeader
              title="Agency Performance Analytics"
              subtitle="Real-time revenue metrics, client conversion pipeline, and delivery stats."
              badge="EXECUTIVE DASHBOARD"
              actionLabel="New Proposal"
              onAction={handleOpenProposalModal}
            />

            <AnalyticsCharts stats={stats} />
          </div>
        )}

        {/* 2. PROJECT MANAGEMENT & KANBAN TAB */}
        {activeTab === 'projects' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AdminSectionHeader
              title="Project Operations Pipeline"
              subtitle="Track active video edits, milestone statuses, and delivery workflows."
              badge="PROJECT MANAGEMENT"
              actionLabel="New Proposal"
              onAction={handleOpenProposalModal}
            />

            {/* View Mode & Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant={projectViewMode === 'table' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => setProjectViewMode('table')}
                >
                  Table View
                </Button>
                <Button
                  variant={projectViewMode === 'kanban' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => setProjectViewMode('kanban')}
                >
                  Kanban Board View
                </Button>
              </div>
            </div>

            {projectViewMode === 'table' ? (
              <DataTable
                columns={projectColumns}
                data={projects}
                searchPlaceholder="Search projects by client or style..."
                searchKeys={['clientName', 'editingStyle', 'packageTier']}
                filterTabs={[
                  { label: 'All Projects', value: 'all', count: projects.length },
                  { label: 'Proposal Sent', value: 'proposal_sent', count: projects.filter((p) => p.status === 'proposal_sent').length },
                  { label: 'In Progress', value: 'in_progress', count: projects.filter((p) => p.status === 'in_progress').length },
                  { label: 'Delivered', value: 'delivered', count: projects.filter((p) => p.status === 'delivered').length },
                  { label: 'Completed', value: 'completed', count: projects.filter((p) => p.status === 'completed').length },
                ]}
                activeFilterTab={projectFilterTab}
                onFilterTabChange={setProjectFilterTab}
              />
            ) : (
              <ProjectsKanbanBoard
                projects={projects}
                onSelectProject={(p) => {
                  setSelectedProjectForDetail(p);
                  setAdminNotesText(p.adminNotes || '');
                  setDetailModalOpen(true);
                }}
                onMarkDelivered={handleMarkDelivered}
              />
            )}
          </div>
        )}

        {/* 3. CALENDAR & DEADLINES TAB */}
        {activeTab === 'calendar' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AdminSectionHeader
              title="Editorial Content Calendar"
              subtitle="Visual scheduling for video editing deadlines, retainer delivery cycles, and client milestones."
              badge="NOTION-STYLE CALENDAR"
            />
            <NotionCalendar projects={projects} contracts={contracts} />
          </div>
        )}

        {/* 4. RETAINER CONTRACTS TAB */}
        {activeTab === 'contracts' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AdminSectionHeader
              title="Monthly Retainer Engagements"
              subtitle="Manage ongoing client retainer contracts and register handed-over video renders."
              badge="RETAINERS CRM"
              actionLabel="New Retainer Contract"
              onAction={() => {
                setProposalType('contract');
                setProposalModalOpen(true);
              }}
            />

            {/* Contract Search & Status Filter Bar */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ maxWidth: '320px', width: '100%' }}>
                <Input
                  placeholder="Search retainers by client name or email..."
                  value={clientFilterText}
                  onChange={(e) => setClientFilterText(e.target.value)}
                  icon={IconSearch}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'proposed', 'active', 'completed', 'declined', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setContractFilterTab(st)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: contractFilterTab === st ? 'var(--accent-gold)' : 'var(--surface)',
                      color: contractFilterTab === st ? '#170B06' : 'var(--ink)',
                      border: `1px solid ${contractFilterTab === st ? 'var(--accent-gold)' : 'var(--line)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {st === 'all' ? 'All Retainers' : st.toUpperCase()} ({st === 'all' ? contracts.length : contracts.filter((c) => c.status === st).length})
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {contracts
                .filter((c) => contractFilterTab === 'all' || c.status === contractFilterTab)
                .filter((c) => !clientFilterText || c.clientName?.toLowerCase().includes(clientFilterText.toLowerCase()) || c.clientEmail?.toLowerCase().includes(clientFilterText.toLowerCase()))
                .map((c) => (
                  <div key={c._id} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <Badge variant={c.status === 'active' ? 'success' : 'gold'}>{c.status.toUpperCase()}</Badge>
                        <h3 className="font-display" style={{ fontSize: '20px', marginTop: '6px' }}>{c.clientName} — {c.packageTier?.toUpperCase()} Retainer</h3>
                        <span style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 700 }}>{c.monthlyPrice} {c.currency} / month ({c.frequency})</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {c.status === 'active' && (
                          <>
                            <Button
                              variant="primary"
                              size="small"
                              iconLeft={IconPlus}
                              onClick={() => {
                                setSelectedContractForDeliverable(c);
                                setAddDeliverableModalOpen(true);
                              }}
                            >
                              Add Deliverable
                            </Button>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={async () => {
                                try {
                                  await apiFetch(`/api/admin/contracts/${c._id}/complete`, { method: 'POST' });
                                  toast({ message: 'Retainer contract marked as COMPLETED!', type: 'success' });
                                  fetchAdminData();
                                } catch (err: any) {
                                  toast({ message: err.message || 'Failed to complete contract', type: 'error' });
                                }
                              }}
                            >
                              Complete Term
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 5. CLIENT CRM TAB */}
        {activeTab === 'clients' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AdminSectionHeader
              title="Client CRM Directory"
              subtitle="Search registered client profiles, inspect engagement history, and maintain private agency notes."
              badge="CLIENT CRM"
            />

            <div style={{ maxWidth: '340px' }}>
              <Input
                placeholder="Filter clients by name or email..."
                value={clientFilterText}
                onChange={(e) => setClientFilterText(e.target.value)}
                icon={IconSearch}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {clients
                .filter((c) => !clientFilterText || c.name?.toLowerCase().includes(clientFilterText.toLowerCase()) || c.email?.toLowerCase().includes(clientFilterText.toLowerCase()))
                .map((client) => (
                  <div key={client._id} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      {client.avatarUrl ? (
                        <img src={client.avatarUrl} alt={client.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(201, 160, 107, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: 800 }}>
                          {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-display" style={{ fontSize: '16px', margin: 0 }}>{client.name}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{client.email}</span>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      fullWidth
                      size="small"
                      onClick={() => {
                        setSelectedClientForDetail(client);
                        setAdminNotesText(client.adminNotes || '');
                        setClientModalOpen(true);
                      }}
                    >
                      Inspect Client CRM Profile
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 6. PORTFOLIO SHOWCASE MANAGEMENT TAB */}
        {activeTab === 'portfolio' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AdminSectionHeader
              title="Portfolio Showcase Manager"
              subtitle="Add, edit, or feature video editing samples displayed on the public agency showcase page."
              badge="MEDIA PORTFOLIO"
              actionLabel="Add Portfolio Item"
              onAction={() => {
                resetPortfolioForm();
                setPortfolioModalOpen(true);
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {portfolioItems.map((item) => (
                <div key={item._id} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', padding: '20px' }}>
                  <Badge variant="gold" size="small">{item.styleName}</Badge>
                  <h3 className="font-display" style={{ fontSize: '18px', marginTop: '8px' }}>{item.title}</h3>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <Button variant="secondary" size="small" onClick={() => handleEditPortfolioItem(item)}>Edit</Button>
                    <Button variant="ghost" size="small" onClick={() => handleDeletePortfolioItem(item._id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. RATINGS & REVIEWS MANAGEMENT TAB */}
        {activeTab === 'ratings' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AdminSectionHeader
              title="Client Testimonials & Ratings"
              subtitle="Inspect client reviews and select signature testimonials to feature on the homepage."
              badge="REVIEWS & RATINGS"
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {ratings.map((rev) => (
                <div key={rev._id} style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
                  <StarRating rating={rev.stars} size={16} />
                  <p style={{ fontSize: '14px', fontStyle: 'italic', margin: '12px 0' }}>"{rev.review}"</p>
                  <Button
                    variant={rev.featured ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => {
                      setSelectedRatingForFeature(rev);
                      setFeatureClientTitle(rev.clientTitle || '');
                      setFeaturedModalOpen(true);
                    }}
                  >
                    {rev.featured ? 'Featured on Homepage' : 'Feature Review'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. PRICING PACKAGES & EXCHANGE RATE SETTINGS TAB */}
        {activeTab === 'packages' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AdminSectionHeader
              title="Packages & Pricing Tier Settings"
              subtitle="Set per-video rate ranges for Basic, Professional, and Premium editing tiers."
              badge="GLOBAL PRICING CONFIG"
            />

            <div style={{ backgroundColor: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', maxWidth: '640px' }}>
              <form onSubmit={handleSavePackages} style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <h4 className="font-display" style={{ fontSize: '16px' }}>1. Basic Tier Rate (ETB / video)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                    <Input label="Min Rate (ETB)" value={basicMin} onChange={(e) => setBasicMin(e.target.value)} type="number" required />
                    <Input label="Max Rate (ETB)" value={basicMax} onChange={(e) => setBasicMax(e.target.value)} type="number" required />
                  </div>
                </div>

                <div>
                  <h4 className="font-display" style={{ fontSize: '16px' }}>2. Professional Tier Rate (ETB / video)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                    <Input label="Min Rate (ETB)" value={professionalMin} onChange={(e) => setProfessionalMin(e.target.value)} type="number" required />
                    <Input label="Max Rate (ETB)" value={professionalMax} onChange={(e) => setProfessionalMax(e.target.value)} type="number" required />
                  </div>
                </div>

                <div>
                  <h4 className="font-display" style={{ fontSize: '16px' }}>3. Premium Tier Rate (ETB / video)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                    <Input label="Min Rate (ETB)" value={premiumMin} onChange={(e) => setPremiumMin(e.target.value)} type="number" required />
                    <Input label="Max Rate (ETB)" value={premiumMax} onChange={(e) => setPremiumMax(e.target.value)} type="number" required />
                  </div>
                </div>

                <Button type="submit" variant="primary" isLoading={savingPackages}>Save Package Rate Settings</Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* CREATE PROPOSAL MODAL */}
      <Modal isOpen={proposalModalOpen} onClose={() => setProposalModalOpen(false)} title="Create Proposal or Retainer Contract">
        <form onSubmit={proposalType === 'project' ? handleCreateProjectProposal : handleCreateContractProposal} style={{ display: 'grid', gap: '16px' }}>
          <Select
            label="Proposal Type"
            options={[
              { label: 'One-off Video Project Proposal', value: 'project' },
              { label: 'Monthly Retainer Contract Proposal', value: 'contract' },
            ]}
            value={proposalType}
            onChange={(v) => setProposalType(v as any)}
          />

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '4px', display: 'block' }}>Search & Select Client</label>
            <Input placeholder="Type client email or name..." value={clientSearchText} onChange={(e) => setClientSearchText(e.target.value)} icon={IconSearch} />
            {searchResults.length > 0 && (
              <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', marginTop: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                {searchResults.map((u) => (
                  <div key={u._id} onClick={() => { setSelectedClient(u); setClientSearchText(u.email); setSearchResults([]); }} style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid var(--line)' }}>
                    {u.name} ({u.email})
                  </div>
                ))}
              </div>
            )}
            {selectedClient && <div style={{ fontSize: '12px', color: 'var(--accent-gold)', marginTop: '4px', fontWeight: 700 }}>Selected: {selectedClient.name} ({selectedClient.email})</div>}
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={submittingProposal}>Send Proposal Offer</Button>
        </form>
      </Modal>

      {/* ADD DELIVERABLE MODAL */}
      <Modal isOpen={addDeliverableModalOpen} onClose={() => setAddDeliverableModalOpen(false)} title="Add Retainer Deliverable Video">
        <form onSubmit={handleAddDeliverable} style={{ display: 'grid', gap: '16px' }}>
          <Input label="Video Title" placeholder="e.g. Episode #3 Short Edit" value={deliverableTitle} onChange={(e) => setDeliverableTitle(e.target.value)} required />
          <Input label="Delivery Render Link (Google Drive / Frame.io)" placeholder="https://drive.google.com/..." value={deliverableUrl} onChange={(e) => setDeliverableUrl(e.target.value)} required />
          <Button type="submit" variant="primary" fullWidth isLoading={submittingDeliverable}>Register Deliverable</Button>
        </form>
      </Modal>

      {/* PORTFOLIO MODAL */}
      <Modal isOpen={portfolioModalOpen} onClose={() => setPortfolioModalOpen(false)} title={editingPortfolioId ? 'Edit Portfolio Showcase' : 'Add New Portfolio Showcase'}>
        <form onSubmit={handleSavePortfolioItem} style={{ display: 'grid', gap: '16px' }}>
          <Input label="Project Title" value={portTitle} onChange={(e) => setPortTitle(e.target.value)} required />
          <Input label="Video URL" value={portVideoUrl} onChange={(e) => setPortVideoUrl(e.target.value)} />
          <Button type="submit" variant="primary" fullWidth isLoading={submittingPortfolio}>Save Showcase Item</Button>
        </form>
      </Modal>
    </AdminLayout>
  );
};
