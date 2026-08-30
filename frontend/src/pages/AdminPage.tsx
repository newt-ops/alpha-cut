import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { CreateProposalStudio } from '@components/admin/CreateProposalStudio';
import { CreateInvoiceStudio } from '@components/admin/CreateInvoiceStudio';
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
  IconTelegram,
  IconEye,
  IconClock,
} from '@icons/icons';

export const AdminPage: React.FC = () => {
  const { apiFetch } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);

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
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [projectViewMode, setProjectViewMode] = useState<'table' | 'kanban'>('table');
  const [projectFilterTab, setProjectFilterTab] = useState('all');
  const [contractFilterTab, setContractFilterTab] = useState('all');
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClientForDetail, setSelectedClientForDetail] = useState<any>(null);
  const [adminNotesText, setAdminNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState('all');
  const [portfolioStyleFilter, setPortfolioStyleFilter] = useState('all');
  const [portfolioFormatFilter, setPortfolioFormatFilter] = useState('all');
  const [reviewStarFilter, setReviewStarFilter] = useState('all');
  const [expandedContractIds, setExpandedContractIds] = useState<string[]>([]);

  const toggleContractExpanded = (contractId: string) => {
    setExpandedContractIds((prev) =>
      prev.includes(contractId) ? prev.filter((id) => id !== contractId) : [...prev, contractId]
    );
  };

  const getClientTelegramHref = (clientIdentifier?: any) => {
    if (!clientIdentifier) return 'https://t.me/AlphaCutCoBot';
    const idStr = typeof clientIdentifier === 'string'
      ? clientIdentifier
      : typeof clientIdentifier === 'object' && clientIdentifier !== null
        ? String(clientIdentifier._id || clientIdentifier.email || '')
        : String(clientIdentifier);

    if (!idStr) return 'https://t.me/AlphaCutCoBot';

    const found = clients.find(
      (cl) =>
        cl._id === idStr ||
        (cl.email && typeof cl.email === 'string' && cl.email.toLowerCase() === idStr.toLowerCase())
    );
    if (found?.telegramChatId) {
      return `tg://user?id=${found.telegramChatId}`;
    }
    return 'https://t.me/AlphaCutCoBot';
  };

  const handleOpenProposalModal = () => {
    setIsCreatingProposal(true);
  };

  // Client Filter Search, Status & Sort State
  const [clientFilterText, setClientFilterText] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState('all');
  const [clientSortBy, setClientSortBy] = useState('recent');

  // New Client Account Registration State
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientTelegram, setNewClientTelegram] = useState('');
  const [creatingClient, setCreatingClient] = useState(false);

  const getClientLTV = useCallback(
    (clientId: string) => {
      const userProjects = projects.filter(
        (p) => p.clientId === clientId && (p.status === 'in_progress' || p.status === 'delivered' || p.status === 'completed')
      );
      const userContracts = contracts.filter(
        (c) => c.clientId === clientId && (c.status === 'active' || c.status === 'completed')
      );

      const projTotal = userProjects.reduce((sum, p) => sum + (p.price || 0), 0);
      const contractTotal = userContracts.reduce(
        (sum, c) => sum + (c.monthlyPrice || 0) * (c.durationMonths || 1),
        0
      );
      return projTotal + contractTotal;
    },
    [projects, contracts]
  );

  const handleCreateNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) {
      toast({ message: 'Client name and email are required', type: 'error' });
      return;
    }
    try {
      setCreatingClient(true);
      const res = await apiFetch('/api/admin/clients', {
        method: 'POST',
        body: JSON.stringify({
          name: newClientName,
          email: newClientEmail,
          telegramChatId: newClientTelegram || undefined,
        }),
      });
      if (res.success) {
        toast({ message: `Client account created for ${newClientName}!`, type: 'success' });
        setNewClientModalOpen(false);
        setNewClientName('');
        setNewClientEmail('');
        setNewClientTelegram('');
        fetchAdminData();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to create client account', type: 'error' });
    } finally {
      setCreatingClient(false);
    }
  };

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
  const [portfolioModalMode, setPortfolioModalMode] = useState<'general' | 'hero1' | 'hero2' | 'beforeAfter'>('general');
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [portTitle, setPortTitle] = useState('');
  const [portStyleName, setPortStyleName] = useState('Viral Animation Breakdown');
  const [portFormat, setPortFormat] = useState('short');
  const [portDuration, setPortDuration] = useState('0:60');
  const [portClientType, setPortClientType] = useState('Tech Creator');
  const [portVideoUrl, setPortVideoUrl] = useState('');
  const [portThumbnailUrl, setPortThumbnailUrl] = useState('');
  const [portRawVideoUrl, setPortRawVideoUrl] = useState('');
  const [portRawThumbnailUrl, setPortRawThumbnailUrl] = useState('');
  const [portIsBeforeAfterFeatured, setPortIsBeforeAfterFeatured] = useState(false);
  const [portHeroSlot, setPortHeroSlot] = useState(0);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [uploadingRawVideo, setUploadingRawVideo] = useState(false);
  const [rawVideoProgress, setRawVideoProgress] = useState(0);
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

  // Delete Retainer Deliverable Video
  const handleDeleteDeliverable = async (contractId: string, deliverableId: string) => {
    if (!window.confirm('Are you sure you want to delete this deliverable video?')) return;
    try {
      const res = await apiFetch(`/api/admin/contracts/${contractId}/deliverables/${deliverableId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        toast({ message: 'Deliverable video deleted.', type: 'info' });
        fetchAdminData();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to delete deliverable', type: 'error' });
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

  // Upload Video File to Cloudinary
  const handleVideoUpload = async (file: File, isRaw: boolean = false) => {
    try {
      if (isRaw) {
        setUploadingRawVideo(true);
        setRawVideoProgress(0);
      } else {
        setUploadingVideo(true);
        setVideoProgress(0);
      }

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
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigRes.cloudName}/video/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            if (isRaw) setRawVideoProgress(percent);
            else setVideoProgress(percent);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed with status ' + xhr.status));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during video upload'));
        xhr.send(formData);
      });

      if (cloudData.secure_url) {
        if (isRaw) {
          setPortRawVideoUrl(cloudData.secure_url);
          toast({ message: 'Raw camera video uploaded to Cloudinary!', type: 'success' });
        } else {
          setPortVideoUrl(cloudData.secure_url);
          toast({ message: 'Edited video uploaded to Cloudinary!', type: 'success' });
        }
      }
    } catch (err: any) {
      toast({ message: err.message || 'Video upload failed', type: 'error' });
    } finally {
      if (isRaw) {
        setUploadingRawVideo(false);
        setRawVideoProgress(0);
      } else {
        setUploadingVideo(false);
        setVideoProgress(0);
      }
    }
  };

  // Quick One-Click Placement Toggle
  const handleQuickPlacementToggle = async (item: any, type: 'hero1' | 'hero2' | 'beforeAfter') => {
    try {
      let updatePayload: any = {};
      if (type === 'hero1') {
        const newSlot = item.heroSlot === 1 ? 0 : 1;
        updatePayload = { heroSlot: newSlot, isHeroFeatured: newSlot === 1 };
      } else if (type === 'hero2') {
        const newSlot = item.heroSlot === 2 ? 0 : 2;
        updatePayload = { heroSlot: newSlot, isHeroFeatured: newSlot === 2 };
      } else if (type === 'beforeAfter') {
        updatePayload = { isBeforeAfterFeatured: !item.isBeforeAfterFeatured };
      }

      const res = await apiFetch(`/api/admin/portfolio/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      });

      if (res.success) {
        toast({ message: 'Placement updated successfully!', type: 'success' });
        fetchAdminData();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to update placement', type: 'error' });
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
        rawVideoUrl: portRawVideoUrl,
        rawThumbnailUrl: portRawThumbnailUrl,
        heroSlot: Number(portHeroSlot),
        isBeforeAfterFeatured: portIsBeforeAfterFeatured,
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
    setPortRawVideoUrl('');
    setPortRawThumbnailUrl('');
    setPortIsBeforeAfterFeatured(false);
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
    setPortRawVideoUrl(item.rawVideoUrl || '');
    setPortRawThumbnailUrl(item.rawThumbnailUrl || '');
    setPortIsBeforeAfterFeatured(!!item.isBeforeAfterFeatured);
    setPortHeroSlot(item.heroSlot || 0);
    setPortfolioModalMode('general');
    setPortfolioModalOpen(true);
  };

  const handleOpenHero1Modal = () => {
    resetPortfolioForm();
    const hero1 = portfolioItems.find((p) => p.heroSlot === 1 || p.isHeroFeatured) || portfolioItems[0];
    if (hero1) {
      setEditingPortfolioId(hero1._id);
      setPortTitle(hero1.title);
      setPortStyleName(hero1.styleName || 'Viral Animation Breakdown');
      setPortVideoUrl(hero1.videoUrl || '');
      setPortThumbnailUrl(hero1.thumbnailUrl || '');
      setPortDuration(hero1.duration || '0:58');
      setPortClientType(hero1.clientType || 'Tech Creator');
    } else {
      setPortTitle('Top Hero Reel #1');
    }
    setPortHeroSlot(1);
    setPortfolioModalMode('hero1');
    setPortfolioModalOpen(true);
  };

  const handleOpenHero2Modal = () => {
    resetPortfolioForm();
    const hero2 = portfolioItems.find((p) => p.heroSlot === 2) || portfolioItems[1];
    if (hero2) {
      setEditingPortfolioId(hero2._id);
      setPortTitle(hero2.title);
      setPortStyleName(hero2.styleName || 'Cinematic Short-Film');
      setPortVideoUrl(hero2.videoUrl || '');
      setPortThumbnailUrl(hero2.thumbnailUrl || '');
      setPortDuration(hero2.duration || '1:15');
      setPortClientType(hero2.clientType || 'Founder Brand');
    } else {
      setPortTitle('Top Hero Reel #2');
    }
    setPortHeroSlot(2);
    setPortfolioModalMode('hero2');
    setPortfolioModalOpen(true);
  };

  const handleOpenBeforeAfterModal = () => {
    resetPortfolioForm();
    const ba = portfolioItems.find((p) => p.isBeforeAfterFeatured) || portfolioItems[0];
    if (ba) {
      setEditingPortfolioId(ba._id);
      setPortTitle(ba.title);
      setPortStyleName(ba.styleName || 'Viral Animation Breakdown');
      setPortVideoUrl(ba.videoUrl || '');
      setPortThumbnailUrl(ba.thumbnailUrl || '');
      setPortRawVideoUrl(ba.rawVideoUrl || '');
      setPortRawThumbnailUrl(ba.rawThumbnailUrl || '');
    } else {
      setPortTitle('Raw Footage vs. Alpha Cut Retention Edit');
    }
    setPortIsBeforeAfterFeatured(true);
    setPortfolioModalMode('beforeAfter');
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
      const res = await apiFetch(`/api/ratings/${selectedRatingForFeature._id}/feature`, {
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
          <p>Loading Alpha Cut Operations Hub...</p>
        </div>
      </AdminLayout>
    );
  }

  if (isCreatingProposal) {
    return (
      <AdminLayout
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setIsCreatingProposal(false);
          setActiveTab(tab);
        }}
        notifications={notifications}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      >
        <CreateProposalStudio
          apiFetch={apiFetch}
          toast={toast}
          onBack={() => setIsCreatingProposal(false)}
          onSuccess={() => {
            setIsCreatingProposal(false);
            fetchAdminData();
          }}
          exchangeRate={exchangeRate}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      clients={clients}
      projects={projects}
      contracts={contracts}
      notifications={notifications}
      onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
    >
      <div style={{ display: 'grid', gap: '32px' }} className="admin-page-container">
        {/* 1. OVERVIEW & ANALYTICS EXECUTIVE TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: '32px' }}>
            <AnalyticsCharts
              stats={stats}
              loading={loading}
              onOpenInvoiceModal={() => setActiveTab('create_invoice')}
            />
          </div>
        )}

        {/* DEDICATED FULL-PAGE INVOICE GENERATOR STUDIO */}
        {activeTab === 'create_invoice' && (
          <CreateInvoiceStudio
            clients={clients}
            projects={projects}
            contracts={contracts}
            onCancel={() => setActiveTab('overview')}
            onInvoiceCreated={fetchAdminData}
          />
        )}

        {/* 2. PROJECT MANAGEMENT & KANBAN TAB */}
        {activeTab === 'projects' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AdminSectionHeader
              title="Project Operations Pipeline"
              subtitle="Track active video edits, milestone statuses, and delivery workflows."
              actionLabel="New Proposal Offer"
              onAction={handleOpenProposalModal}
            />

            {/* Quick Projects Pipeline Metrics Summary Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--surface)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 800 }}>TOTAL ORDERS</span>
                  <h3 className="font-display" style={{ fontSize: '26px', margin: '4px 0 0 0', fontWeight: 800 }}>{projects.length}</h3>
                </div>
                <Badge variant="surface">ALL</Badge>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800 }}>PROPOSALS SENT</span>
                  <h3 className="font-display" style={{ fontSize: '26px', margin: '4px 0 0 0', fontWeight: 800 }}>
                    {projects.filter((p) => p.status === 'proposal_sent').length}
                  </h3>
                </div>
                <Badge variant="gold">PROPOSED</Badge>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px -5px rgba(201, 160, 107, 0.2)' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800 }}>IN EDITING PIPELINE</span>
                  <h3 className="font-display" style={{ fontSize: '26px', margin: '4px 0 0 0', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {projects.filter((p) => p.status === 'in_progress' || p.status === 'revision_requested').length}
                  </h3>
                </div>
                <Badge variant="gold">EDITING</Badge>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '11px', color: '#10B981', fontWeight: 800 }}>COMPLETED & DELIVERED</span>
                  <h3 className="font-display" style={{ fontSize: '26px', margin: '4px 0 0 0', fontWeight: 800 }}>
                    {projects.filter((p) => p.status === 'completed' || p.status === 'delivered').length}
                  </h3>
                </div>
                <Badge variant="success">DONE</Badge>
              </div>
            </div>

            {/* View Mode Switcher Pill Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', backgroundColor: 'var(--surface)', padding: '10px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg)', padding: '4px', borderRadius: '100px', border: '1px solid var(--line)' }}>
                <button
                  type="button"
                  onClick={() => setProjectViewMode('table')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '100px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    backgroundColor: projectViewMode === 'table' ? 'var(--accent-gold)' : 'transparent',
                    color: projectViewMode === 'table' ? '#170B06' : 'var(--ink-soft)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  Table View
                </button>
                <button
                  type="button"
                  onClick={() => setProjectViewMode('kanban')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '100px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    backgroundColor: projectViewMode === 'kanban' ? 'var(--accent-gold)' : 'transparent',
                    color: projectViewMode === 'kanban' ? '#170B06' : 'var(--ink-soft)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  Kanban Board View
                </button>
              </div>

              <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                Showing <strong style={{ color: 'var(--ink)' }}>{projects.length}</strong> active video projects
              </span>
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
            />
            <NotionCalendar projects={projects} contracts={contracts} />
          </div>
        )}

        {/* 4. RETAINER CONTRACTS TAB */}
        {activeTab === 'contracts' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AdminSectionHeader
              title="Monthly Retainer Engagements"
              subtitle="Manage ongoing client retainer contracts, video deliverable tracking, and render handovers."
              actionLabel="New Retainer Contract"
              onAction={() => setIsCreatingProposal(true)}
            />

            {/* Quick Retainers KPI Summary Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--surface)', padding: '18px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '11px', color: '#10B981', fontWeight: 800 }}>ACTIVE RETAINERS</span>
                  <h3 className="font-display" style={{ fontSize: '26px', margin: '4px 0 0 0', fontWeight: 800 }}>
                    {contracts.filter((c) => c.status === 'active').length}
                  </h3>
                </div>
                <Badge variant="success">RUNNING</Badge>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', padding: '18px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800 }}>RECURRING MRR</span>
                  <h3 className="font-display" style={{ fontSize: '26px', margin: '4px 0 0 0', fontWeight: 800 }}>
                    {contracts
                      .filter((c) => c.status === 'active')
                      .reduce((acc, c) => acc + (Number(c.monthlyPrice) || 0), 0)
                      .toLocaleString()}{' '}
                    <span style={{ fontSize: '13px', color: 'var(--accent-gold)' }}>ETB/mo</span>
                  </h3>
                </div>
                <Badge variant="gold">MRR</Badge>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', padding: '18px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 800 }}>DELIVERED RENDERS</span>
                  <h3 className="font-display" style={{ fontSize: '26px', margin: '4px 0 0 0', fontWeight: 800 }}>
                    {contracts.reduce((acc, c) => acc + (c.deliverables?.length || 0), 0)}
                  </h3>
                </div>
                <Badge variant="surface">TERM TOTAL</Badge>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', padding: '18px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 800 }}>PROPOSED OFFERS</span>
                  <h3 className="font-display" style={{ fontSize: '26px', margin: '4px 0 0 0', fontWeight: 800 }}>
                    {contracts.filter((c) => c.status === 'proposed').length}
                  </h3>
                </div>
                <Badge variant="gold">PENDING</Badge>
              </div>
            </div>

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
            </div>            {/* Retainer Contracts List Grid */}
            <div style={{ display: 'grid', gap: '16px' }}>
              {contracts
                .filter((c) => contractFilterTab === 'all' || c.status === contractFilterTab)
                .filter((c) => !clientFilterText || c.clientName?.toLowerCase().includes(clientFilterText.toLowerCase()) || c.clientEmail?.toLowerCase().includes(clientFilterText.toLowerCase()))
                .map((c) => {
                  const isExpanded = expandedContractIds.includes(c._id);
                  const deliveredCount = c.deliverables?.length || 0;
                  const totalPlanned = c.totalVideosPlanned || 8;
                  const progressPct = Math.min(Math.round((deliveredCount / totalPlanned) * 100), 100);

                  return (
                    <div
                      key={c._id}
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: 'var(--radius-lg)',
                        border: `1.5px solid ${isExpanded ? 'var(--accent-gold)' : 'var(--line)'}`,
                        padding: '18px 22px',
                        boxShadow: isExpanded ? '0 8px 30px -10px rgba(201, 160, 107, 0.2)' : 'var(--shadow-sm)',
                        transition: 'all 0.25s ease',
                      }}
                    >
                      {/* Compact 1-Line Client Header Row (Always Visible & Clickable) */}
                      <div
                        onClick={() => toggleContractExpanded(c._id)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '14px',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(201, 160, 107, 0.18)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '17px' }}>
                            {c.clientName ? c.clientName.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Badge variant={c.status === 'active' ? 'success' : c.status === 'completed' ? 'surface' : 'gold'}>
                                {c.status.toUpperCase()}
                              </Badge>
                              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800 }}>
                                {(c.packageTier || 'Professional').toUpperCase()} TIER
                              </span>
                            </div>
                            <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--ink)' }}>
                              {c.clientName}
                            </h3>
                            <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{c.clientEmail}</span>
                          </div>
                        </div>                        {/* Middle Quick Progress Pill (Shown when collapsed) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-soft)', backgroundColor: 'var(--bg)', padding: '6px 12px', borderRadius: '100px', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <IconFilm size={14} color="var(--accent-gold)" />
                            <span>{deliveredCount} / {totalPlanned} Videos ({progressPct}%)</span>
                          </span>

                          <span className="font-mono" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-gold)', backgroundColor: 'rgba(201, 160, 107, 0.12)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--accent-gold)' }}>
                            {c.monthlyPrice} {c.currency} / mo
                          </span>

                          <a
                            href={getClientTelegramHref(c.clientEmail || c.clientId)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              backgroundColor: 'var(--bg)',
                              color: 'var(--accent-gold)',
                              border: '1px solid var(--accent-gold)',
                              padding: '6px 14px',
                              borderRadius: '100px',
                              fontSize: '12px',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <IconTelegram size={14} color="var(--accent-gold)" />
                            <span>Telegram</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleContractExpanded(c._id);
                            }}
                            style={{
                              backgroundColor: isExpanded ? 'var(--accent-gold)' : 'var(--bg)',
                              color: isExpanded ? '#170B06' : 'var(--ink-soft)',
                              border: '1px solid var(--line)',
                              padding: '6px 14px',
                              borderRadius: '100px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {isExpanded ? 'Collapse ▲' : 'Details ▾'}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Contract Details Body */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden', display: 'grid', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--line)', marginTop: '16px' }}
                          >
                            {/* Video Deliverables Term Progress Bar */}
                            <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', display: 'grid', gap: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                <span style={{ fontWeight: 700, color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <IconFilm size={14} color="var(--accent-gold)" />
                                  <span>RETAINER TERM DELIVERABLES ({deliveredCount} / {totalPlanned} Videos Delivered)</span>
                                </span>
                                <span className="font-mono" style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>
                                  {progressPct}% COMPLETE
                                </span>
                              </div>
                              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface)', borderRadius: '100px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                                <div
                                  style={{
                                    width: `${progressPct}%`,
                                    height: '100%',
                                    backgroundColor: 'var(--accent-gold)',
                                    borderRadius: '100px',
                                    transition: 'width 0.4s ease',
                                  }}
                                />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                                <span>Frequency: <strong>{c.frequency}</strong></span>
                                <span>Start Date: <strong>{c.startDate ? new Date(c.startDate).toLocaleDateString() : 'Active'}</strong></span>
                                <span>Duration: <strong>{c.durationMonths || 1} Month(s)</strong></span>
                              </div>
                            </div>

                            {/* Deliverables List Handoff Table */}
                            {c.deliverables && c.deliverables.length > 0 && (
                              <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', display: 'grid', gap: '10px' }}>
                                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800 }}>
                                  UPLOADED VIDEO DELIVERABLES ({c.deliverables.length})
                                </span>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                  {c.deliverables.map((del: any) => (
                                    <div
                                      key={del._id}
                                      style={{
                                        padding: '10px 14px',
                                        backgroundColor: 'var(--surface)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--line)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '8px',
                                      }}
                                    >
                                      <div>
                                        <strong style={{ fontSize: '13px', color: 'var(--ink)', display: 'block' }}>
                                          #{del.sequenceNumber || 1} — {del.title}
                                        </strong>
                                        <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                                          Delivered: {new Date(del.deliveredAt || Date.now()).toLocaleDateString()}
                                        </span>
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {del.deliverableUrl && (
                                          <a
                                            href={del.deliverableUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                              color: 'var(--accent-gold)',
                                              fontSize: '12px',
                                              fontWeight: 700,
                                              textDecoration: 'none',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              backgroundColor: 'rgba(201, 160, 107, 0.12)',
                                              padding: '4px 10px',
                                              borderRadius: '6px',
                                              border: '1px solid rgba(201, 160, 107, 0.3)',
                                            }}
                                          >
                                            <IconEye size={14} color="var(--accent-gold)" />
                                            <span>View Render Link</span>
                                          </a>
                                        )}
                                        <Badge variant={del.status === 'approved' ? 'success' : 'gold'}>
                                          {(del.status || 'delivered').toUpperCase()}
                                        </Badge>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteDeliverable(c._id, del._id)}
                                          style={{
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            color: '#EF4444',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            fontWeight: 700,
                                          }}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Card Bottom Action Bar */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
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
                                    + Upload Video Deliverable
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={async () => {
                                      if (!window.confirm('Mark this retainer contract term as COMPLETED?')) return;
                                      try {
                                        await apiFetch(`/api/admin/contracts/${c._id}/complete`, { method: 'POST' });
                                        toast({ message: 'Retainer contract marked as COMPLETED!', type: 'success' });
                                        fetchAdminData();
                                      } catch (err: any) {
                                        toast({ message: err.message || 'Failed to complete contract', type: 'error' });
                                      }
                                    }}
                                  >
                                    Complete Retainer Term
                                  </Button>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 5. CLIENT CRM TAB */}
        {activeTab === 'clients' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AdminSectionHeader
              title="Client CRM Directory"
              subtitle="Search registered client profiles, inspect lifetime engagement metrics, and issue invoices or proposals."
            />

            {/* TOP-LEVEL 3-METRIC SUMMARY STRIP */}
            {(() => {
              const totalClientsCount = clients.length;
              const activeRetainerClientsCount = clients.filter((c) =>
                contracts.some((con) => con.clientId === c._id && con.status === 'active')
              ).length;
              const totalLtvSum = clients.reduce((acc, c) => acc + getClientLTV(c._id), 0);
              const avgClientLTV = totalClientsCount > 0 ? Math.round(totalLtvSum / totalClientsCount) : 0;

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '18px 20px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                    <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                      TOTAL REGISTERED CLIENTS
                    </span>
                    <h3 className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                      {totalClientsCount}
                    </h3>
                  </div>

                  <div style={{ padding: '18px 20px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                    <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                      ACTIVE RETAINER CLIENTS
                    </span>
                    <h3 className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: '#10B981', margin: 0 }}>
                      {activeRetainerClientsCount}
                    </h3>
                  </div>

                  <div style={{ padding: '18px 20px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--accent-gold)', boxShadow: 'var(--shadow-sm)' }}>
                    <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                      AVERAGE CLIENT LTV
                    </span>
                    <h3 className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-gold)', margin: 0 }}>
                      {avgClientLTV.toLocaleString()} ETB
                    </h3>
                  </div>
                </div>
              );
            })()}

            {/* SEARCH & FILTER CONTROLS BAR */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <Input
                  placeholder="Filter clients by name or email..."
                  value={clientFilterText}
                  onChange={(e) => setClientFilterText(e.target.value)}
                  icon={IconSearch}
                />
              </div>

              <div style={{ width: '180px' }}>
                <Select
                  value={clientStatusFilter}
                  onChange={(val: any) => setClientStatusFilter(typeof val === 'object' && val?.target ? val.target.value : val)}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'active_retainer', label: 'Active Retainer' },
                    { value: 'active_projects', label: 'Active Projects' },
                    { value: 'inactive', label: 'Inactive Account' },
                  ]}
                />
              </div>

              <div style={{ width: '180px' }}>
                <Select
                  value={clientSortBy}
                  onChange={(val: any) => setClientSortBy(typeof val === 'object' && val?.target ? val.target.value : val)}
                  options={[
                    { value: 'recent', label: 'Sort: Most Recent' },
                    { value: 'ltv', label: 'Sort: Highest LTV' },
                    { value: 'alphabetical', label: 'Sort: A-Z Name' },
                  ]}
                />
              </div>
            </div>

            {/* UPGRADED DATA-RICH CLIENT CARDS GRID */}
            {(() => {
              const filteredClients = clients
                .filter((c) => {
                  const matchesText =
                    !clientFilterText ||
                    c.name?.toLowerCase().includes(clientFilterText.toLowerCase()) ||
                    c.email?.toLowerCase().includes(clientFilterText.toLowerCase());

                  const userProjects = projects.filter((p) => p.clientId === c._id);
                  const userContracts = contracts.filter((con) => con.clientId === c._id);
                  const hasActiveRetainer = userContracts.some((con) => con.status === 'active');
                  const hasActiveProjects = userProjects.some((p) => p.status === 'in_progress' || p.status === 'proposal_sent' || p.status === 'delivered');

                  if (clientStatusFilter === 'active_retainer' && !hasActiveRetainer) return false;
                  if (clientStatusFilter === 'active_projects' && !hasActiveProjects) return false;
                  if (clientStatusFilter === 'inactive' && (hasActiveRetainer || hasActiveProjects)) return false;

                  return matchesText;
                })
                .sort((a, b) => {
                  if (clientSortBy === 'ltv') {
                    return getClientLTV(b._id) - getClientLTV(a._id);
                  }
                  if (clientSortBy === 'alphabetical') {
                    return (a.name || '').localeCompare(b.name || '');
                  }
                  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                });

              if (filteredClients.length === 0) {
                return (
                  <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--ink-soft)', fontSize: '14px', margin: 0 }}>No client accounts found matching the selected filter criteria.</p>
                  </div>
                );
              }

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {filteredClients.map((client) => {
                    const userProjects = projects.filter((p) => p.clientId === client._id);
                    const userContracts = contracts.filter((c) => c.clientId === client._id);
                    const activeContract = userContracts.find((c) => c.status === 'active');
                    const activeProjects = userProjects.filter((p) => p.status === 'in_progress' || p.status === 'proposal_sent' || p.status === 'delivered');
                    const ltv = getClientLTV(client._id);

                    return (
                      <div
                        key={client._id}
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--line)',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '16px',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'border-color var(--transition-fast)',
                        }}
                      >
                        <div>
                          {/* Card Header: Badge + Quick Actions */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            {activeContract ? (
                              <Badge variant="maroon" size="small">
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <IconCheck size={11} /> Active Retainer
                                </span>
                              </Badge>
                            ) : activeProjects.length > 0 ? (
                              <Badge variant="gold" size="small">
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <IconClock size={11} /> {activeProjects.length} Active {activeProjects.length === 1 ? 'Edit' : 'Edits'}
                                </span>
                              </Badge>
                            ) : (
                              <Badge variant="surface" size="small">
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <IconUser size={11} /> Inactive Account
                                </span>
                              </Badge>
                            )}

                            {/* Quick Action Icon Buttons */}
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('create_invoice');
                                }}
                                style={{
                                  background: 'var(--bg)',
                                  border: '1px solid var(--line)',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  color: 'var(--accent-gold)',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                                title="Issue Client Invoice"
                              >
                                <IconFileText size={12} />
                                <span>Invoice</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedClient(client);
                                  setClientSearchText(client.email);
                                  setIsCreatingProposal(true);
                                }}
                                style={{
                                  background: 'var(--bg)',
                                  border: '1px solid var(--line)',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  color: 'var(--ink)',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                                title="Create Proposal Offer"
                              >
                                <IconPlus size={12} />
                                <span>Proposal</span>
                              </button>
                            </div>
                          </div>

                          {/* Client Avatar & Contact Details */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                            {client.avatarUrl ? (
                              <img src={client.avatarUrl} alt={client.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-gold)' }} />
                            ) : (
                              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(201, 160, 107, 0.2)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '18px' }}>
                                {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                              </div>
                            )}
                            <div>
                              <h4 className="font-display" style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                                {client.name}
                              </h4>
                              <span style={{ fontSize: '12px', color: 'var(--ink-soft)', wordBreak: 'break-all' }}>{client.email}</span>
                              {client.telegramChatId && (
                                <span className="font-mono" style={{ fontSize: '10px', color: '#24A1DE', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: 700 }}>
                                  <IconTelegram size={11} color="#24A1DE" /> Telegram Linked
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Commercial Metrics Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '12px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                            <div>
                              <span className="font-mono" style={{ fontSize: '9.5px', color: 'var(--ink-soft)', display: 'block', marginBottom: '2px' }}>
                                LIFETIME VALUE (LTV)
                              </span>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                                {ltv.toLocaleString()} ETB
                              </span>
                            </div>

                            <div>
                              <span className="font-mono" style={{ fontSize: '9.5px', color: 'var(--ink-soft)', display: 'block', marginBottom: '2px' }}>
                                ACTIVE WORKLOAD
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                                {activeContract ? '1 Active Retainer' : `${activeProjects.length} Active ${activeProjects.length === 1 ? 'Edit' : 'Edits'}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Primary Action Button */}
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
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* 6. PORTFOLIO SHOWCASE MANAGEMENT TAB */}
        {activeTab === 'portfolio' && (
          <div style={{ display: 'grid', gap: '32px' }}>
            <AdminSectionHeader
              title="Portfolio Showcase Manager"
              subtitle="Manage video content separately across Homepage Hero frames, Before/After comparison slider, and the general agency gallery."
              actionLabel="+ Add New Portfolio Item"
              onAction={() => {
                resetPortfolioForm();
                setPortfolioModalMode('general');
                setPortfolioModalOpen(true);
              }}
            />

            {/* SECTION A: HOMEPAGE TOP HERO REELS (2 FRAMES) */}
            <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <Badge variant="gold" size="small">HOMEPAGE TOP HERO</Badge>
                  <h3 className="font-display" style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>
                    Top Hero Showcase Reels (2 Frames)
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                    Configure the dual 3D floating phone frames displayed at the very top of the homepage.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Hero Slot 1 Card */}
                {(() => {
                  const hero1 = portfolioItems.find((p) => p.heroSlot === 1 || p.isHeroFeatured) || portfolioItems[0];
                  return (
                    <div style={{ backgroundColor: 'var(--bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--accent-gold)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <Badge variant="gold" size="small">REEL #1 (LEFT FRAME)</Badge>
                        <h4 className="font-display" style={{ fontSize: '16px', fontWeight: 700, marginTop: '8px' }}>
                          {hero1?.title || 'Top Hero Reel #1'}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                          Style: {hero1?.styleName || 'Viral Animation'} • Video: {hero1?.videoUrl ? 'Linked ✓' : 'Not Set'}
                        </p>
                      </div>
                      <Button variant="primary" size="small" style={{ marginTop: '16px' }} onClick={handleOpenHero1Modal}>
                        Configure Reel #1 Video
                      </Button>
                    </div>
                  );
                })()}

                {/* Hero Slot 2 Card */}
                {(() => {
                  const hero2 = portfolioItems.find((p) => p.heroSlot === 2) || portfolioItems[1];
                  return (
                    <div style={{ backgroundColor: 'var(--bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--accent-gold)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <Badge variant="gold" size="small">REEL #2 (RIGHT FRAME)</Badge>
                        <h4 className="font-display" style={{ fontSize: '16px', fontWeight: 700, marginTop: '8px' }}>
                          {hero2?.title || 'Top Hero Reel #2'}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                          Style: {hero2?.styleName || 'Cinematic Short'} • Video: {hero2?.videoUrl ? 'Linked ✓' : 'Not Set'}
                        </p>
                      </div>
                      <Button variant="primary" size="small" style={{ marginTop: '16px' }} onClick={handleOpenHero2Modal}>
                        Configure Reel #2 Video
                      </Button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* SECTION B: HOMEPAGE BEFORE / AFTER COMPARISON SLIDER */}
            <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
              {(() => {
                const ba = portfolioItems.find((p) => p.isBeforeAfterFeatured) || portfolioItems[0];
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div>
                      <Badge variant="gold" size="small">HOMEPAGE COMPARISON</Badge>
                      <h3 className="font-display" style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>
                        Visual Proof Before / After Transformation
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                        Active Pair: <strong style={{ color: 'var(--ink)' }}>{ba?.title || 'Raw vs. Alpha Cut Edit'}</strong>
                      </p>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: 'var(--ink-soft)' }}>
                        <span>• Raw Video (Before): <strong style={{ color: 'var(--accent-gold)' }}>{ba?.rawVideoUrl ? 'Configured ✓' : 'Not Set'}</strong></span>
                        <span>• Edited Video (After): <strong style={{ color: 'var(--accent-gold)' }}>{ba?.videoUrl ? 'Configured ✓' : 'Not Set'}</strong></span>
                      </div>
                    </div>

                    <Button variant="primary" size="medium" onClick={handleOpenBeforeAfterModal}>
                      Configure Before / After Video Pair
                    </Button>
                  </div>
                );
              })()}
            </div>

            {/* SECTION C: MAIN AGENCY PORTFOLIO SHOWCASE GALLERY */}
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 className="font-display" style={{ fontSize: '20px', fontWeight: 800 }}>
                    Main Agency Portfolio Showcase Gallery
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                    All video samples published on the public portfolio page and editing styles catalog.
                  </p>
                </div>

                {/* Categorized Placement Filter Tabs */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', backgroundColor: 'var(--surface)', padding: '5px', borderRadius: '100px', border: '1px solid var(--line)' }}>
                  {[
                    { id: 'all', label: `All (${portfolioItems.length})` },
                    { id: 'short', label: `Short 9:16 (${portfolioItems.filter((i) => i.format === 'short').length})` },
                    { id: 'long', label: `Long 16:9 (${portfolioItems.filter((i) => i.format === 'long').length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPortfolioCategoryFilter(tab.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '100px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: portfolioCategoryFilter === tab.id ? 'var(--accent-gold)' : 'transparent',
                        color: portfolioCategoryFilter === tab.id ? '#170B06' : 'var(--ink-soft)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorized Portfolio Showcase Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {portfolioItems
                  .filter((item) => {
                    if (portfolioCategoryFilter === 'short') return item.format === 'short';
                    if (portfolioCategoryFilter === 'long') return item.format === 'long';
                    return true;
                  })
                  .map((item) => (
                    <div
                      key={item._id}
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--line)',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <Badge variant="gold" size="small">{item.styleName}</Badge>
                          <Badge variant="surface" size="small">{item.format === 'short' ? '9:16' : '16:9'}</Badge>
                        </div>
                        <h4 className="font-display" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                          {item.title}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                          Duration: {item.duration || '0:60'} • {item.clientType || 'Creator'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <Button variant="secondary" size="small" fullWidth onClick={() => handleEditPortfolioItem(item)}>
                          Edit Item
                        </Button>
                        <Button variant="ghost" size="small" onClick={() => handleDeletePortfolioItem(item._id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. RATINGS & REVIEWS MODERATION TAB */}
        {(activeTab === 'moderation' || activeTab === 'ratings') && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AdminSectionHeader
              title="Client Testimonials & Moderation"
              subtitle="Inspect client ratings, moderate feedback visibility, and select signature testimonials to feature on the homepage."
            />

            {/* MODERATION SUMMARY METRICS STRIP */}
            {(() => {
              const totalRev = ratings.length;
              const featuredRev = ratings.filter((r) => r.featured).length;
              const hiddenRev = ratings.filter((r) => r.hidden).length;
              const avgRating = totalRev > 0 ? (ratings.reduce((sum, r) => sum + (r.stars || 5), 0) / totalRev).toFixed(1) : '5.0';

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '18px 20px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
                    <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                      TOTAL CLIENT REVIEWS
                    </span>
                    <h3 className="font-display" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                      {totalRev}
                    </h3>
                  </div>

                  <div style={{ padding: '18px 20px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--accent-gold)' }}>
                    <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                      AVERAGE SATISFACTION
                    </span>
                    <h3 className="font-display" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-gold)', margin: 0 }}>
                      {avgRating} / 5.0 ⭐
                    </h3>
                  </div>

                  <div style={{ padding: '18px 20px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
                    <span className="font-mono" style={{ fontSize: '10.5px', color: '#10B981', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                      HOMEPAGE FEATURED
                    </span>
                    <h3 className="font-display" style={{ fontSize: '26px', fontWeight: 800, color: '#10B981', margin: 0 }}>
                      {featuredRev}
                    </h3>
                  </div>

                  <div style={{ padding: '18px 20px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
                    <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--ink-soft)', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                      HIDDEN FROM PUBLIC
                    </span>
                    <h3 className="font-display" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink-soft)', margin: 0 }}>
                      {hiddenRev}
                    </h3>
                  </div>
                </div>
              );
            })()}

            {/* REVIEWS LIST */}
            {ratings.length === 0 ? (
              <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center' }}>
                <p style={{ color: 'var(--ink-soft)', fontSize: '14px', margin: 0 }}>No client reviews or ratings submitted yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {ratings.map((rev) => (
                  <div
                    key={rev._id}
                    style={{
                      backgroundColor: 'var(--surface)',
                      padding: '20px',
                      borderRadius: 'var(--radius-lg)',
                      border: rev.featured ? '1.5px solid var(--accent-gold)' : '1px solid var(--line)',
                      opacity: rev.hidden ? 0.6 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <StarRating rating={rev.stars} size={16} />
                        {rev.featured && <Badge variant="gold" size="small">Featured ⭐</Badge>}
                        {rev.hidden && <Badge variant="surface" size="small">Hidden 👁️</Badge>}
                      </div>
                      <p style={{ fontSize: '14px', fontStyle: 'italic', margin: '12px 0', color: 'var(--ink)' }}>"{rev.review}"</p>
                      <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--ink)', display: 'block' }}>{rev.clientName || rev.clientEmail || 'Anonymous Client'}</span>
                        <span>{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                      <Button
                        variant={rev.featured ? 'primary' : 'secondary'}
                        size="small"
                        onClick={() => {
                          setSelectedRatingForFeature(rev);
                          setFeatureClientTitle(rev.clientTitle || '');
                          setFeaturedModalOpen(true);
                        }}
                      >
                        {rev.featured ? 'Featured ✓' : 'Feature Review'}
                      </Button>

                      <Button
                        variant="secondary"
                        size="small"
                        onClick={async () => {
                          try {
                            const res = await apiFetch(`/api/ratings/${rev._id}/hide`, { method: 'POST' });
                            if (res.success) {
                              toast({ message: rev.hidden ? 'Review is now public!' : 'Review hidden from public site.', type: 'success' });
                              fetchAdminData();
                            }
                          } catch (err: any) {
                            toast({ message: err.message || 'Failed to update visibility', type: 'error' });
                          }
                        }}
                      >
                        {rev.hidden ? 'Unhide' : 'Hide'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 8. PRICING PACKAGES & EXCHANGE RATE SETTINGS TAB */}
        {(activeTab === 'pricing' || activeTab === 'packages') && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AdminSectionHeader
              title="Packages & Pricing Tier Settings"
              subtitle="Set per-video rate ranges for Basic, Professional, and Premium editing tiers across ETB and USD."
            />

            <div style={{ backgroundColor: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', maxWidth: '640px' }}>
              <form onSubmit={handleSavePackages} style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <h4 className="font-display" style={{ fontSize: '16px', margin: 0, fontWeight: 700 }}>1. Basic Tier Rate (ETB / video)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                    <Input label="Min Rate (ETB)" value={basicMin} onChange={(e) => setBasicMin(e.target.value)} type="number" required />
                    <Input label="Max Rate (ETB)" value={basicMax} onChange={(e) => setBasicMax(e.target.value)} type="number" required />
                  </div>
                </div>

                <div>
                  <h4 className="font-display" style={{ fontSize: '16px', margin: 0, fontWeight: 700 }}>2. Professional Tier Rate (ETB / video)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                    <Input label="Min Rate (ETB)" value={professionalMin} onChange={(e) => setProfessionalMin(e.target.value)} type="number" required />
                    <Input label="Max Rate (ETB)" value={professionalMax} onChange={(e) => setProfessionalMax(e.target.value)} type="number" required />
                  </div>
                </div>

                <div>
                  <h4 className="font-display" style={{ fontSize: '16px', margin: 0, fontWeight: 700 }}>3. Premium Tier Rate (ETB / video)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                    <Input label="Min Rate (ETB)" value={premiumMin} onChange={(e) => setPremiumMin(e.target.value)} type="number" required />
                    <Input label="Max Rate (ETB)" value={premiumMax} onChange={(e) => setPremiumMax(e.target.value)} type="number" required />
                  </div>
                </div>

                <Button type="submit" variant="primary" isLoading={savingPackages} iconLeft={IconCheck}>
                  Save Package Rate Settings
                </Button>
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
      <Modal
        isOpen={portfolioModalOpen}
        onClose={() => setPortfolioModalOpen(false)}
        title={
          portfolioModalMode === 'hero1'
            ? 'Configure Top Hero Reel #1 (Left Phone Frame)'
            : portfolioModalMode === 'hero2'
            ? 'Configure Top Hero Reel #2 (Right Phone Frame)'
            : portfolioModalMode === 'beforeAfter'
            ? 'Configure Before / After Transformation Pair'
            : editingPortfolioId
            ? 'Edit Showcase Item'
            : 'Add New Portfolio Showcase Item'
        }
      >
        <form onSubmit={handleSavePortfolioItem} style={{ display: 'grid', gap: '16px' }}>
          <Input label="Project Title" placeholder="e.g. AI Revolution Breakdown" value={portTitle} onChange={(e) => setPortTitle(e.target.value)} required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Editing Style"
              options={EDITING_STYLES.map((s) => ({ label: s.name, value: s.name }))}
              value={portStyleName}
              onChange={(v) => setPortStyleName(v)}
            />
            <Select
              label="Video Format"
              options={[
                { label: '9:16 Vertical Short-Form', value: 'short' },
                { label: '16:9 Widescreen Long-Form', value: 'long' },
              ]}
              value={portFormat}
              onChange={(v) => setPortFormat(v as any)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Video Duration" placeholder="e.g. 0:58" value={portDuration} onChange={(e) => setPortDuration(e.target.value)} />
            <Input label="Client Industry" placeholder="e.g. Tech Creator" value={portClientType} onChange={(e) => setPortClientType(e.target.value)} />
          </div>

          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg)', border: '1px solid var(--line)', display: 'grid', gap: '12px' }}>
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)' }}>FINAL EDITED MEDIA (AFTER)</span>
            <Input label="Edited Video URL (MP4, YouTube, Cloudinary)" placeholder="https://..." value={portVideoUrl} onChange={(e) => setPortVideoUrl(e.target.value)} />
            
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600 }}>Upload Edited Video File to Cloudinary</label>
              <Dropzone onFileSelect={(file) => handleVideoUpload(file, false)} label={uploadingVideo ? `Uploading Video (${videoProgress}%)...` : "Drop Video MP4 / MOV to Upload to Cloudinary"} />
            </div>

            <Input label="Edited Thumbnail Cover URL" placeholder="https://..." value={portThumbnailUrl} onChange={(e) => setPortThumbnailUrl(e.target.value)} />
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600 }}>Upload Cover Thumbnail Image</label>
              <Dropzone onFileSelect={(file) => handleCoverUpload(file)} label={uploadingCover ? `Uploading Cover (${coverProgress}%)...` : "Drop Image JPG / PNG to Upload Cover"} />
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg)', border: '1px solid var(--line)', display: 'grid', gap: '12px' }}>
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-soft)' }}>UN-EDITED CAMERA MEDIA (BEFORE)</span>
            <Input label="Raw Camera Video URL (Un-edited MP4)" placeholder="https://..." value={portRawVideoUrl} onChange={(e) => setPortRawVideoUrl(e.target.value)} />
            
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600 }}>Upload Raw Un-edited Video to Cloudinary</label>
              <Dropzone onFileSelect={(file) => handleVideoUpload(file, true)} label={uploadingRawVideo ? `Uploading Raw Video (${rawVideoProgress}%)...` : "Drop Raw Video to Upload to Cloudinary"} />
            </div>

            <Input label="Raw Camera Thumbnail Cover URL" placeholder="https://..." value={portRawThumbnailUrl} onChange={(e) => setPortRawThumbnailUrl(e.target.value)} />
          </div>

          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface)', border: '1px solid var(--accent-gold)', display: 'grid', gap: '12px' }}>
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)' }}>HOMEPAGE FEATURED PLACEMENTS</span>
            
            <Select
              label="Top Hero Frame Slot Placement"
              options={[
                { label: 'Do Not Feature in Top Hero Frames', value: '0' },
                { label: 'Top Hero Reel #1 (Left Floating Frame)', value: '1' },
                { label: 'Top Hero Reel #2 (Right Floating Frame)', value: '2' },
              ]}
              value={portHeroSlot.toString()}
              onChange={(v) => setPortHeroSlot(Number(v))}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '4px' }}>
              <input
                type="checkbox"
                id="isBeforeAfterFeatured"
                checked={portIsBeforeAfterFeatured}
                onChange={(e) => setPortIsBeforeAfterFeatured(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
              />
              <label htmlFor="isBeforeAfterFeatured" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>
                Feature as Live Homepage Before / After Comparison Slider
              </label>
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={submittingPortfolio}>Save Showcase Item</Button>
        </form>
      </Modal>

      {/* PROJECT CRM DETAIL INSPECTOR MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Project CRM Inspector — ${selectedProjectForDetail?.editingStyle || 'Order Details'}`}
        maxWidth="640px"
      >
        {selectedProjectForDetail && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Top Badge & Rate Row (Responsive Flex Wrap) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase' }}>
                  {(selectedProjectForDetail.packageTier || 'Short-Form').toUpperCase()} TIER
                </span>
                <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0' }}>
                  {selectedProjectForDetail.editingStyle}
                </h3>
              </div>
              <span className="font-mono" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold)', backgroundColor: 'rgba(201, 160, 107, 0.15)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--accent-gold)' }}>
                {selectedProjectForDetail.price} {selectedProjectForDetail.currency}
              </span>
            </div>

            {/* Client Revision Alert Box */}
            {selectedProjectForDetail.revisionNotes && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                <span className="font-mono" style={{ fontSize: '11px', color: '#EF4444', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                  🚨 CLIENT REVISION REQUESTED
                </span>
                <p style={{ fontSize: '13px', color: '#EF4444', margin: 0, fontWeight: 600, lineHeight: 1.4 }}>
                  "{selectedProjectForDetail.revisionNotes}"
                </p>
              </div>
            )}

            {/* Pipeline Stepper (Touch Overflow Scroll for Mobile) */}
            <div style={{ padding: '16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 800, display: 'block', marginBottom: '12px' }}>
                PROJECT LIFECYCLE STAGE
              </span>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
                <Stepper
                  currentStep={
                    selectedProjectForDetail.status === 'completed'
                      ? 3
                      : selectedProjectForDetail.status === 'delivered'
                      ? 2
                      : selectedProjectForDetail.status === 'in_progress' || selectedProjectForDetail.status === 'revision_requested'
                      ? 1
                      : 0
                  }
                  steps={[
                    { label: 'Proposal Sent' },
                    { label: 'In Progress' },
                    { label: 'Render Delivered' },
                    { label: 'Completed' },
                  ]}
                />
              </div>
            </div>

            {/* Client Info Card (Responsive Wrap) */}
            <div style={{ display: 'grid', gap: '10px', backgroundColor: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 800 }}>CLIENT DETAILS</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{selectedProjectForDetail.clientName}</h4>
                  <span style={{ fontSize: '12.5px', color: 'var(--ink-soft)', wordBreak: 'break-all' }}>{selectedProjectForDetail.clientEmail}</span>
                </div>
                <a
                  href={getClientTelegramHref(selectedProjectForDetail.clientEmail || selectedProjectForDetail.clientId)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: 'rgba(201, 160, 107, 0.12)',
                    color: 'var(--accent-gold)',
                    border: '1px solid var(--accent-gold)',
                    padding: '6px 14px',
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <IconTelegram size={14} color="var(--accent-gold)" />
                  <span>Telegram Chat</span>
                </a>
              </div>
            </div>

            {/* Reference Brief / Instructions */}
            {selectedProjectForDetail.referenceBrief && (
              <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 800, display: 'block', marginBottom: '6px' }}>CLIENT VIDEO BRIEF</span>
                <p style={{ fontSize: '13px', color: 'var(--ink)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{selectedProjectForDetail.referenceBrief}</p>
              </div>
            )}

            {/* Render Delivery Link */}
            {(selectedProjectForDetail.status === 'in_progress' || selectedProjectForDetail.status === 'revision_requested' || selectedProjectForDetail.status === 'delivered') && (
              <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--accent-gold)', display: 'grid', gap: '12px' }}>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800 }}>DELIVER VIDEO RENDER</span>
                
                {selectedProjectForDetail.deliveryLink && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--ink-soft)', backgroundColor: 'var(--bg)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                    <span>Active Render:</span>
                    <a
                      href={selectedProjectForDetail.deliveryLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: 'var(--accent-gold)',
                        fontSize: '12px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'rgba(201, 160, 107, 0.12)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(201, 160, 107, 0.3)',
                      }}
                    >
                      <IconEye size={14} color="var(--accent-gold)" />
                      <span>View Delivery Render</span>
                    </a>
                  </div>
                )}

                <Input
                  label="Render Link (Google Drive, Frame.io, Cloudinary)"
                  placeholder="https://drive.google.com/..."
                  value={deliverableUrl || selectedProjectForDetail.deliveryLink || ''}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                />

                <Button
                  variant="primary"
                  fullWidth
                  onClick={async () => {
                    const linkToUse = deliverableUrl || selectedProjectForDetail.deliveryLink;
                    if (!linkToUse) {
                      toast({ message: 'Please provide a valid delivery URL.', type: 'error' });
                      return;
                    }
                    try {
                      const res = await apiFetch(`/api/admin/projects/${selectedProjectForDetail._id}/deliver`, {
                        method: 'POST',
                        body: JSON.stringify({ deliveryLink: linkToUse }),
                      });
                      if (res.success) {
                        toast({ message: 'Project status updated to DELIVERED!', type: 'success' });
                        setDetailModalOpen(false);
                        setDeliverableUrl('');
                        fetchAdminData();
                      }
                    } catch (err: any) {
                      toast({ message: err.message || 'Failed to deliver project', type: 'error' });
                    }
                  }}
                >
                  Deliver Render to Client
                </Button>
              </div>
            )}

            {/* Private Internal Admin Notes */}
            <div style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', display: 'grid', gap: '10px' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 800 }}>INTERNAL AGENCY CRM NOTES</span>
              <Textarea
                rows={3}
                placeholder="Write private notes visible only to studio admins..."
                value={adminNotesText}
                onChange={(e) => setAdminNotesText(e.target.value)}
              />
              <Button
                variant="secondary"
                size="small"
                isLoading={savingNotes}
                onClick={() => handleSaveProjectNotes(selectedProjectForDetail._id, adminNotesText)}
              >
                Save Private Agency Notes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* New Client Account Registration Modal */}
      <Modal isOpen={newClientModalOpen} onClose={() => setNewClientModalOpen(false)} title="Register New Client Account">
        <form onSubmit={handleCreateNewClient} style={{ display: 'grid', gap: '16px' }}>
          <Input label="Full Name *" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} required />
          <Input label="Email Address *" type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} required />
          <Input label="Telegram Chat ID (Optional)" value={newClientTelegram} onChange={(e) => setNewClientTelegram(e.target.value)} placeholder="e.g. 123456789" />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button type="button" variant="secondary" onClick={() => setNewClientModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={creatingClient} iconLeft={IconPlus}>
              Create Client Account
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};
