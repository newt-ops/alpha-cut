import React, { useState, useEffect, useCallback } from 'react';
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

export const AdminPage = () => {
  const { apiFetch } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & Data State
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [clients, setClients] = useState([]);
  const [packages, setPackages] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [exchangeRate, setExchangeRate] = useState({ usdToEtb: 128.5, etbToUsd: 0.00778 });
  const [loading, setLoading] = useState(true);

  // Client Filter Search State
  const [clientFilterText, setClientFilterText] = useState('');

  // Proposal Form Branching State ('project' | 'contract')
  const [proposalType, setProposalType] = useState('project');

  // New Proposal Form State (One-off Project)
  const [clientSearchText, setClientSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingStyle, setEditingStyle] = useState(EDITING_STYLES[0].name);
  const [contentLength, setContentLength] = useState('short');
  const [packageTier, setPackageTier] = useState('professional');
  const [currency, setCurrency] = useState('ETB');
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
  const [selectedContractForDeliverable, setSelectedContractForDeliverable] = useState(null);
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');
  const [uploadingDeliverable, setUploadingDeliverable] = useState(false);
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);

  // Portfolio Management Form & Modal State
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState(null);
  const [portTitle, setPortTitle] = useState('');
  const [portStyleName, setPortStyleName] = useState('Viral Animation Breakdown');
  const [portFormat, setPortFormat] = useState('short');
  const [portDuration, setPortDuration] = useState('0:60');
  const [portClientType, setPortClientType] = useState('Tech Creator');
  const [portVideoUrl, setPortVideoUrl] = useState('');
  const [portThumbnailUrl, setPortThumbnailUrl] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submittingPortfolio, setSubmittingPortfolio] = useState(false);

  // Featured Rating Modal State
  const [featuredModalOpen, setFeaturedModalOpen] = useState(false);
  const [selectedRatingForFeature, setSelectedRatingForFeature] = useState(null);
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
  const [chapaTestModeEnabled, setChapaTestModeEnabled] = useState(true);

  // Detail Modal State
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, projRes, contractRes, ratRes, clientRes, pkgRes, portRes, rateRes, chapaRes] = await Promise.all([
        apiFetch('/api/admin/stats').catch(() => ({ success: false })),
        apiFetch('/api/admin/projects').catch(() => ({ success: false })),
        apiFetch('/api/admin/contracts').catch(() => ({ success: false, contracts: [] })),
        apiFetch('/api/ratings').catch(() => ({ success: false })),
        apiFetch('/api/admin/clients').catch(() => ({ success: false, clients: [] })),
        apiFetch('/api/admin/packages').catch(() => ({ success: false, configs: [] })),
        apiFetch('/api/portfolio').catch(() => ({ success: false, items: [] })),
        apiFetch('/api/packages/exchange-rate').catch(() => ({ success: false })),
        apiFetch('/api/payments/chapa/status').catch(() => ({ success: false })),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (projRes.success) setProjects(projRes.projects);
      if (contractRes.success) setContracts(contractRes.contracts);
      if (ratRes.success) setRatings(ratRes.ratings);
      if (clientRes.success) setClients(clientRes.clients);
      if (portRes.success) setPortfolioItems(portRes.items);
      if (chapaRes.success) setChapaTestModeEnabled(chapaRes.enabled);
      if (rateRes.success && rateRes.usdToEtb) {
        setExchangeRate({ usdToEtb: rateRes.usdToEtb, etbToUsd: rateRes.etbToUsd });
      }

      if (pkgRes.success) {
        setPackages(pkgRes.configs);

        const basicConfig = pkgRes.configs.find((c) => c.tier === 'basic' && c.currency === 'ETB');
        if (basicConfig) {
          if (basicConfig.priceMin) setBasicMin(basicConfig.priceMin.toString());
          if (basicConfig.priceMax) setBasicMax(basicConfig.priceMax.toString());
        }

        const profConfig = pkgRes.configs.find((c) => c.tier === 'professional' && c.currency === 'ETB');
        if (profConfig) {
          if (profConfig.priceMin) setProfessionalMin(profConfig.priceMin.toString());
          if (profConfig.priceMax) setProfessionalMax(profConfig.priceMax.toString());
        }

        const premiumConfig = pkgRes.configs.find((c) => c.tier === 'premium' && c.currency === 'ETB');
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
  const handleCreateProposal = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      toast({ message: 'Please select a registered client from the email search list.', type: 'error' });
      return;
    }
    if (!price || !deadline) {
      toast({ message: 'Please provide price and deadline date.', type: 'error' });
      return;
    }

    try {
      setSubmittingProposal(true);
      const res = await apiFetch('/api/admin/projects', {
        method: 'POST',
        body: JSON.stringify({
          clientEmail: selectedClient.email,
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
        toast({ message: `Proposal created and sent to ${selectedClient.name}!`, type: 'success' });
        setSelectedClient(null);
        setClientSearchText('');
        setReferenceBrief('');
        setNotes('');
        fetchAdminData();
        setActiveTab('board');
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmittingProposal(false);
    }
  };

  // Submit Retainer Contract Proposal
  const handleCreateContractProposal = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      toast({ message: 'Please select a registered client from the email search list.', type: 'error' });
      return;
    }
    if (!contractMonthlyPrice || !contractStartDate) {
      toast({ message: 'Please provide monthly price and start date.', type: 'error' });
      return;
    }

    try {
      setSubmittingProposal(true);
      const res = await apiFetch('/api/admin/contracts', {
        method: 'POST',
        body: JSON.stringify({
          clientEmail: selectedClient.email,
          packageTier,
          contentLength,
          frequency: contractFrequency,
          currency,
          monthlyPrice: Number(contractMonthlyPrice),
          startDate: contractStartDate,
          durationMonths: Number(contractDurationMonths) || 1,
          notes: referenceBrief || notes,
        }),
      });

      if (res.success) {
        toast({ message: `Retainer contract proposal sent to ${selectedClient.name}!`, type: 'success' });
        setSelectedClient(null);
        setClientSearchText('');
        setNotes('');
        fetchAdminData();
        setActiveTab('contracts');
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmittingProposal(false);
    }
  };

  // Add Deliverable Video under Retainer Contract
  const handleAddDeliverableSubmit = async (e) => {
    e.preventDefault();
    if (!selectedContractForDeliverable || !deliverableUrl) {
      toast({ message: 'Please provide a deliverable video link or upload file.', type: 'error' });
      return;
    }

    try {
      setSubmittingDeliverable(true);
      const res = await apiFetch(`/api/admin/contracts/${selectedContractForDeliverable._id}/deliverables`, {
        method: 'POST',
        body: JSON.stringify({
          title: deliverableTitle,
          deliverableUrl,
          notes: deliverableNotes,
        }),
      });

      if (res.success) {
        toast({ message: 'Deliverable video added and client notified!', type: 'success' });
        setAddDeliverableModalOpen(false);
        setDeliverableTitle('');
        setDeliverableUrl('');
        setDeliverableNotes('');
        fetchAdminData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  // Complete Retainer Contract Term
  const handleCompleteContract = async (contractId) => {
    try {
      const res = await apiFetch(`/api/admin/contracts/${contractId}/complete`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Retainer contract marked as COMPLETED! Rating unlocked for client.', type: 'success' });
        fetchAdminData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    }
  };

  // Delete Deliverable Video from Contract
  const handleDeleteDeliverable = async (contractId, deliverableId) => {
    if (!window.confirm('Are you sure you want to delete this deliverable video?')) return;
    try {
      const res = await apiFetch(`/api/admin/contracts/${contractId}/deliverables/${deliverableId}`, { method: 'DELETE' });
      if (res.success) {
        toast({ message: 'Deliverable video deleted.', type: 'info' });
        fetchAdminData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    }
  };

  // Cancel Retainer Contract
  const handleCancelContract = async (contractId) => {
    if (!window.confirm('Are you sure you want to cancel this retainer contract?')) return;
    try {
      const res = await apiFetch(`/api/admin/contracts/${contractId}/cancel`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Retainer contract cancelled.', type: 'info' });
        fetchAdminData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    }
  };

  // Portfolio Cover Cloudinary Upload Handler
  const handlePortfolioCoverUpload = async (file) => {
    try {
      setUploadingCover(true);
      const sigRes = await apiFetch('/api/uploads/signature', { method: 'POST' });
      if (!sigRes.success) throw new Error('Failed to obtain upload signature');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigRes.apiKey);
      formData.append('timestamp', sigRes.timestamp);
      formData.append('signature', sigRes.signature);
      formData.append('folder', sigRes.folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigRes.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const cloudData = await cloudRes.json();
      if (cloudData.secure_url) {
        setPortThumbnailUrl(cloudData.secure_url);
        toast({ message: 'Cover thumbnail uploaded to Cloudinary!', type: 'success' });
      }
    } catch (err) {
      toast({ message: err.message || 'Thumbnail upload failed', type: 'error' });
    } finally {
      setUploadingCover(false);
    }
  };

  // Deliverable Cloudinary Video Render Upload Handler
  const handleDeliverableUpload = async (file) => {
    try {
      setUploadingDeliverable(true);
      const sigRes = await apiFetch('/api/uploads/signature', { method: 'POST' });
      if (!sigRes.success) throw new Error('Failed to obtain upload signature');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigRes.apiKey);
      formData.append('timestamp', sigRes.timestamp);
      formData.append('signature', sigRes.signature);
      formData.append('folder', sigRes.folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigRes.cloudName}/video/upload`, {
        method: 'POST',
        body: formData,
      });

      const cloudData = await cloudRes.json();
      if (cloudData.secure_url) {
        setDeliverableUrl(cloudData.secure_url);
        toast({ message: 'Video deliverable uploaded to Cloudinary!', type: 'success' });
      }
    } catch (err) {
      toast({ message: err.message || 'Video upload failed', type: 'error' });
    } finally {
      setUploadingDeliverable(false);
    }
  };

  // Open Create/Edit Portfolio Modal
  const handleOpenPortfolioModal = (item = null) => {
    if (item) {
      setEditingPortfolioId(item._id);
      setPortTitle(item.title || '');
      setPortStyleName(item.styleName || 'Viral Animation Breakdown');
      setPortFormat(item.format || 'short');
      setPortDuration(item.duration || '0:60');
      setPortClientType(item.clientType || 'Tech Creator');
      setPortVideoUrl(item.videoUrl || '');
      setPortThumbnailUrl(item.thumbnailUrl || '');
    } else {
      setEditingPortfolioId(null);
      setPortTitle('');
      setPortStyleName('Viral Animation Breakdown');
      setPortFormat('short');
      setPortDuration('0:60');
      setPortClientType('Tech Creator');
      setPortVideoUrl('');
      setPortThumbnailUrl('');
    }
    setPortfolioModalOpen(true);
  };

  // Save / Submit Portfolio Item
  const handleSavePortfolioItem = async (e) => {
    e.preventDefault();
    if (!portTitle) {
      toast({ message: 'Please enter a title for the sample video.', type: 'error' });
      return;
    }

    try {
      setSubmittingPortfolio(true);
      const payload = {
        title: portTitle,
        styleName: portStyleName,
        format: portFormat,
        duration: portDuration,
        clientType: portClientType,
        videoUrl: portVideoUrl,
        thumbnailUrl: portThumbnailUrl,
      };

      let res;
      if (editingPortfolioId) {
        res = await apiFetch(`/api/portfolio/${editingPortfolioId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch('/api/portfolio', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.success) {
        toast({ message: `Portfolio sample ${editingPortfolioId ? 'updated' : 'added'} successfully!`, type: 'success' });
        setPortfolioModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      toast({ message: err.message || 'Failed to save portfolio sample', type: 'error' });
    } finally {
      setSubmittingPortfolio(false);
    }
  };

  // Delete Portfolio Item
  const handleDeletePortfolioItem = async (id) => {
    try {
      const res = await apiFetch(`/api/portfolio/${id}`, { method: 'DELETE' });
      if (res.success) {
        toast({ message: 'Portfolio sample deleted.', type: 'info' });
        fetchAdminData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    }
  };

  // Open Featured Rating Modal
  const handleOpenFeaturedModal = (rating) => {
    setSelectedRatingForFeature(rating);
    setFeatureClientTitle(rating.clientTitle || `${rating.clientName} — Verified Client`);
    setFeaturedModalOpen(true);
  };

  // Submit Featured Rating with Custom Client Title Tag
  const handleSaveFeaturedRating = async (e) => {
    e.preventDefault();
    if (!selectedRatingForFeature) return;

    try {
      setSubmittingFeature(true);
      const res = await apiFetch(`/api/ratings/${selectedRatingForFeature._id}/feature`, {
        method: 'POST',
        body: JSON.stringify({
          featured: true,
          clientTitle: featureClientTitle,
        }),
      });

      if (res.success) {
        toast({ message: `Rating featured with title: "${featureClientTitle}"!`, type: 'success' });
        setFeaturedModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      toast({ message: err.message || 'Failed to feature rating', type: 'error' });
    } finally {
      setSubmittingFeature(false);
    }
  };

  const [chapaSecretKeyInput, setChapaSecretKeyInput] = useState('');

  const handleToggleChapaTestMode = async () => {
    try {
      const res = await apiFetch('/api/payments/chapa/toggle-test-mode', {
        method: 'POST',
        body: JSON.stringify({ enabled: !chapaTestModeEnabled }),
      });
      if (res.success) {
        setChapaTestModeEnabled(res.enabled);
        toast({ message: res.message, type: 'info' });
      }
    } catch (err) {
      toast({ message: err.message || 'Failed to toggle Chapa test mode', type: 'error' });
    }
  };

  const handleSaveChapaKey = async () => {
    if (!chapaSecretKeyInput.trim()) {
      return toast({ message: 'Please enter a valid Chapa Secret Key (e.g. CHASECK_TEST-...)', type: 'error' });
    }

    try {
      const res = await apiFetch('/api/payments/chapa/toggle-test-mode', {
        method: 'POST',
        body: JSON.stringify({ enabled: chapaTestModeEnabled, secretKey: chapaSecretKeyInput.trim() }),
      });
      if (res.success) {
        toast({ message: 'Chapa Secret Key updated successfully!', type: 'success' });
        setChapaSecretKeyInput('');
      }
    } catch (err) {
      toast({ message: err.message || 'Failed to save Chapa key', type: 'error' });
    }
  };

  // Save Package Configurations (Canonical ETB Base Rates)
  const handleSavePackageSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingPackages(true);

      await Promise.all([
        apiFetch('/api/admin/packages', {
          method: 'PUT',
          body: JSON.stringify({
            tier: 'basic',
            length: 'short',
            currency: 'ETB',
            priceMin: Number(basicMin),
            priceMax: Number(basicMax),
          }),
        }),
        apiFetch('/api/admin/packages', {
          method: 'PUT',
          body: JSON.stringify({
            tier: 'professional',
            length: 'short',
            currency: 'ETB',
            priceMin: Number(professionalMin),
            priceMax: Number(professionalMax),
          }),
        }),
        apiFetch('/api/admin/packages', {
          method: 'PUT',
          body: JSON.stringify({
            tier: 'premium',
            length: 'short',
            currency: 'ETB',
            priceMin: Number(premiumMin),
            priceMax: Number(premiumMax),
          }),
        }),
      ]);

      toast({ message: 'Package ETB pricing updated successfully! Live USD rates recalculate automatically.', type: 'success' });
      fetchAdminData();
    } catch (err) {
      toast({ message: err.message || 'Failed to update package pricing', type: 'error' });
    } finally {
      setSavingPackages(false);
    }
  };

  // Mark Delivered
  const handleMarkDelivered = async (projectId) => {
    try {
      const res = await apiFetch(`/api/admin/projects/${projectId}/deliver`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Project status updated to DELIVERED. Client notified.', type: 'success' });
        if (selectedProjectForDetail && selectedProjectForDetail._id === projectId) {
          setSelectedProjectForDetail(res.project);
        }
        fetchAdminData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    }
  };

  // Toggle Hide Rating
  const handleToggleHideRating = async (ratingId) => {
    try {
      const res = await apiFetch(`/api/ratings/${ratingId}/hide`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Rating visibility updated.', type: 'info' });
        fetchAdminData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'proposal_sent': return 'gold';
      case 'proposed': return 'gold';
      case 'in_progress': return 'maroon';
      case 'active': return 'maroon';
      case 'delivered': return 'surface';
      case 'completed': return 'success';
      case 'declined': return 'maroon';
      default: return 'surface';
    }
  };

  const totalProjectCount = (stats?.statusCounts?.proposal_sent || 0) +
    (stats?.statusCounts?.in_progress || 0) +
    (stats?.statusCounts?.delivered || 0) +
    (stats?.statusCounts?.completed || 0) +
    (stats?.statusCounts?.declined || 0);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientFilterText.toLowerCase()) ||
    c.email.toLowerCase().includes(clientFilterText.toLowerCase())
  );

  return (
    <AdminLayout activeTab={activeTab} onChangeTab={setActiveTab}>
      {/* OVERVIEW / ANALYTICS TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Metric Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                borderTop: '3px solid var(--accent-gold)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                TOTAL EARNED REVENUE (ETB)
              </span>
              <h3 className="font-display" style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px', color: 'var(--ink)' }}>
                {stats?.revenueETB?.toLocaleString() || 0} ETB
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block', marginTop: '4px' }}>
                Projects: {stats?.projRevenueETB?.toLocaleString() || 0} ETB • Retainers: {stats?.contractRevenueETB?.toLocaleString() || 0} ETB
              </span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                borderTop: '3px solid var(--accent-gold)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                TOTAL EARNED REVENUE (USD)
              </span>
              <h3 className="font-display" style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px', color: 'var(--ink)' }}>
                ${stats?.revenueUSD?.toLocaleString() || 0} USD
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block', marginTop: '4px' }}>
                Projects: ${stats?.projRevenueUSD?.toLocaleString() || 0} USD • Retainers: ${stats?.contractRevenueUSD?.toLocaleString() || 0} USD
              </span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                borderTop: '3px solid #38A169',
                boxShadow: 'var(--shadow)',
              }}
            >
              <span className="font-mono" style={{ fontSize: '10px', color: '#38A169', textTransform: 'uppercase', letterSpacing: '1px' }}>
                RECURRING MONTHLY (ETB)
              </span>
              <h3 className="font-display" style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px', color: 'var(--ink)' }}>
                {stats?.recurringRevenueETB?.toLocaleString() || 0} ETB
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{stats?.activeContractsCount || 0} active retainers</span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                borderTop: '3px solid #38A169',
                boxShadow: 'var(--shadow)',
              }}
            >
              <span className="font-mono" style={{ fontSize: '10px', color: '#38A169', textTransform: 'uppercase', letterSpacing: '1px' }}>
                RECURRING MONTHLY (USD)
              </span>
              <h3 className="font-display" style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px', color: 'var(--ink)' }}>
                ${stats?.recurringRevenueUSD?.toLocaleString() || 0} USD
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{stats?.activeContractsCount || 0} active retainers</span>
            </div>
          </div>

          {/* Project Lifecycle Progress Scannable Breakdown */}
          <div style={{ backgroundColor: 'var(--surface)', padding: '32px 28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--ink)' }}>Project Lifecycle Breakdown</h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '2px' }}>Scannable status metrics across active and past proposals</p>
              </div>
              <span className="font-mono" style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>Total Projects: {totalProjectCount}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Proposals Sent', count: stats?.statusCounts?.proposal_sent || 0, color: 'var(--accent-gold)' },
                { label: 'In Progress', count: stats?.statusCounts?.in_progress || 0, color: '#3182CE' },
                { label: 'Work Delivered', count: stats?.statusCounts?.delivered || 0, color: '#805AD5' },
                { label: 'Completed', count: stats?.statusCounts?.completed || 0, color: '#38A169' },
                { label: 'Declined', count: stats?.statusCounts?.declined || 0, color: '#E53E3E' },
              ].map((item, idx) => {
                const pct = totalProjectCount > 0 ? Math.round((item.count / totalProjectCount) * 100) : 0;
                return (
                  <div key={idx} style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{item.label}</span>
                      <span className="font-mono" style={{ color: 'var(--ink-soft)' }}>{item.count} ({pct}%)</span>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ height: '6px', backgroundColor: 'var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: item.color, transition: 'width 0.5s ease-in-out' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RETAINER CONTRACTS MANAGEMENT CONSOLE TAB */}
      {activeTab === 'contracts' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)' }}>Retainer Contracts Management Console</h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                Track active recurring retainer agreements, add video deliverables, and manage retainer completion.
              </p>
            </div>
            <Button variant="primary" iconRight={IconPlus} onClick={() => setActiveTab('proposal')}>
              New Retainer Contract
            </Button>
          </div>

          {contracts.length === 0 ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>No retainer contracts created yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {contracts.map((contract) => {
                const delCount = contract.deliveredCount || 0;
                const planned = contract.totalVideosPlanned || 8;
                const pct = Math.min(100, Math.round((delCount / planned) * 100));

                return (
                  <div
                    key={contract._id}
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--line)',
                      padding: '24px 28px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <Badge variant={getStatusBadgeVariant(contract.status)}>
                          RETAINER • {contract.status.toUpperCase()}
                        </Badge>
                        <h3 className="font-display" style={{ fontSize: '20px', marginTop: '6px' }}>
                          {contract.clientName} ({contract.clientEmail})
                        </h3>
                        <span style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                          {contract.monthlyPrice} {contract.currency} / month ({contract.packageTier?.toUpperCase()} — {contract.frequency})
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {contract.status === 'active' && (
                          <>
                            <Button
                              variant="primary"
                              size="small"
                              iconRight={IconPlus}
                              onClick={() => {
                                setSelectedContractForDeliverable(contract);
                                setAddDeliverableModalOpen(true);
                              }}
                            >
                              Add Deliverable Video
                            </Button>

                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => handleCompleteContract(contract._id)}
                            >
                              Mark Completed
                            </Button>
                          </>
                        )}

                        {(contract.status === 'proposed' || contract.status === 'active') && (
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => handleCancelContract(contract._id)}
                          >
                            Cancel Contract
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Contract Notes / Brief */}
                    {contract.notes && (
                      <div style={{ backgroundColor: 'var(--bg)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '16px' }}>
                        <strong>Brief Notes:</strong> {contract.notes}
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '6px' }}>
                        <span>Deliverables Progress: {delCount} / {planned} Videos Handed Over</span>
                        <span className="font-mono">{pct}%</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-gold)', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>

                    {/* Deliverables List */}
                    {contract.deliverables && contract.deliverables.length > 0 && (
                      <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', marginTop: '16px' }}>
                        <h4 className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', marginBottom: '10px' }}>HANDED OVER DELIVERABLES ({contract.deliverables.length}):</h4>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {contract.deliverables.map((d) => (
                            <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid var(--line)', paddingBottom: '6px' }}>
                              <div>
                                <strong>#{d.sequenceNumber}: {d.title || `Video #${d.sequenceNumber}`}</strong>
                                {d.deliverableUrl && (
                                  <a href={d.deliverableUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '10px', color: 'var(--accent-gold)', fontSize: '12px' }}>
                                    View Render Link ↗
                                  </a>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Badge variant={d.status === 'approved' ? 'success' : 'surface'} size="small">
                                  {d.status.toUpperCase()}
                                </Badge>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDeliverable(contract._id, d._id)}
                                  style={{ background: 'none', border: 'none', color: '#E53E3E', fontSize: '12px', cursor: 'pointer', opacity: 0.8 }}
                                  title="Delete deliverable video"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* NOTION-STYLE CALENDAR SCHEDULE TAB */}
      {activeTab === 'calendar' && (
        <NotionCalendar
          projects={projects}
          contracts={contracts}
          onSelectProject={(proj) => {
            setSelectedProjectForDetail(proj);
            setDetailModalOpen(true);
          }}
        />
      )}

      {/* CREATE PROPOSAL FORM TAB (BRANCHES TO PROJECT OR CONTRACT) */}
      {activeTab === 'proposal' && (
        <div style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: 'var(--surface)', padding: '36px 30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          {/* Proposal Type Switcher */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', backgroundColor: 'var(--bg)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <Button
              variant={proposalType === 'project' ? 'primary' : 'ghost'}
              fullWidth
              size="small"
              onClick={() => setProposalType('project')}
            >
              One-Off Project Proposal
            </Button>
            <Button
              variant={proposalType === 'contract' ? 'primary' : 'ghost'}
              fullWidth
              size="small"
              onClick={() => setProposalType('contract')}
            >
              Recurring Retainer Contract
            </Button>
          </div>

          <h2 className="font-display" style={{ fontSize: '24px', marginBottom: '20px', color: 'var(--ink)' }}>
            {proposalType === 'project' ? 'Issue One-Off Project Proposal' : 'Issue Recurring Retainer Contract'}
          </h2>

          <form onSubmit={proposalType === 'project' ? handleCreateProposal : handleCreateContractProposal}>
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              {!selectedClient ? (
                <>
                  <Input
                    label="Registered Client Email (Required)"
                    placeholder="Search registered client email..."
                    value={clientSearchText}
                    onChange={(e) => setClientSearchText(e.target.value)}
                    icon={IconSearch}
                    required
                  />

                  {searchResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', maxHeight: '200px', overflowY: 'auto' }}>
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => {
                            setSelectedClient(user);
                            setClientSearchText(user.email);
                            setSearchResults([]);
                          }}
                          style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--line)', fontSize: '14px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '12px' }}
                        >
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(201,160,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: 700, fontSize: '12px' }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <strong>{user.name}</strong> <span style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>({user.email})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: '8px' }}>
                    Targeted Client Profile
                  </label>
                  <div
                    style={{
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--accent-gold)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(201, 160, 107, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-gold)',
                          fontWeight: 800,
                          fontSize: '16px',
                          border: '1px solid var(--accent-gold)',
                        }}
                      >
                        {selectedClient.avatarUrl ? (
                          <img src={selectedClient.avatarUrl} alt={selectedClient.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          selectedClient.name ? selectedClient.name.charAt(0).toUpperCase() : 'U'
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {selectedClient.name}
                          <IconCheck size={16} color="var(--accent-gold)" />
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{selectedClient.email}</div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => {
                        setSelectedClient(null);
                        setClientSearchText('');
                      }}
                      style={{ color: 'var(--ink-soft)', fontSize: '12px' }}
                    >
                      Change Client
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {proposalType === 'project' ? (
              <>
                <Select
                  label="Editing Style"
                  options={EDITING_STYLES.map((s) => ({ label: s.name, value: s.name }))}
                  value={editingStyle}
                  onChange={setEditingStyle}
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <Select
                    label="Content Length"
                    options={[{ label: 'Short-Form (9:16)', value: 'short' }, { label: 'Long-Form (16:9)', value: 'long' }]}
                    value={contentLength}
                    onChange={setContentLength}
                  />
                  <Select
                    label="Package Tier"
                    options={[
                      { label: 'Basic Tier', value: 'basic' },
                      { label: 'Professional Tier (Popular)', value: 'professional' },
                      { label: 'Premium Tier', value: 'premium' },
                    ]}
                    value={packageTier}
                    onChange={setPackageTier}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <Select
                    label="Currency"
                    options={[{ label: 'ETB', value: 'ETB' }, { label: 'USD', value: 'USD' }]}
                    value={currency}
                    onChange={setCurrency}
                  />
                  <Input
                    label="Agreed Price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <DatePicker
                  label="Project Deadline"
                  value={deadline}
                  onChange={setDeadline}
                  required
                />
              </>
            ) : (
              <>
                {/* RETAINER CONTRACT FORM FIELDS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <Select
                    label="Package Tier"
                    options={[
                      { label: 'Basic Tier', value: 'basic' },
                      { label: 'Professional Tier', value: 'professional' },
                      { label: 'Premium Tier', value: 'premium' },
                    ]}
                    value={packageTier}
                    onChange={setPackageTier}
                  />
                  <Select
                    label="Publishing Frequency"
                    options={[
                      { label: '1 Video / Week (4/mo)', value: 'weekly-1' },
                      { label: '2 Videos / Week (8/mo)', value: 'weekly-2' },
                      { label: '3-4 Videos / Week (14/mo)', value: 'weekly-3-4' },
                      { label: '1 Video / Day (30/mo)', value: 'daily-1' },
                      { label: '2 Videos / Day (60/mo)', value: 'daily-2' },
                    ]}
                    value={contractFrequency}
                    onChange={setContractFrequency}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <Select
                    label="Currency"
                    options={[{ label: 'ETB', value: 'ETB' }, { label: 'USD', value: 'USD' }]}
                    value={currency}
                    onChange={setCurrency}
                  />
                  <Input
                    label="Monthly Agreed Price"
                    type="number"
                    value={contractMonthlyPrice}
                    onChange={(e) => setContractMonthlyPrice(e.target.value)}
                    helperText="Pre-filled from pricing engine, admin override allowed"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <DatePicker
                    label="Retainer Start Date"
                    value={contractStartDate}
                    onChange={setContractStartDate}
                    required
                  />
                  <Input
                    label="Duration (Months)"
                    type="number"
                    value={contractDurationMonths}
                    onChange={(e) => setContractDurationMonths(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <Textarea
              label="Reference / Brief Notes (External Drive / Scope)"
              placeholder="Enter external Google Drive or project brief notes..."
              value={referenceBrief}
              onChange={(e) => setReferenceBrief(e.target.value)}
            />

            <div style={{ marginTop: '24px' }}>
              <Button type="submit" variant="primary" fullWidth isLoading={submittingProposal} iconRight={IconSparkles}>
                {proposalType === 'project' ? 'Send Project Proposal' : 'Send Retainer Contract Proposal'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* DYNAMIC PORTFOLIO SHOWCASE MANAGEMENT CONSOLE */}
      {activeTab === 'portfolio' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)' }}>Portfolio Sample Videos Management</h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                Create, update, and manage agency sample videos displayed live on the public website.
              </p>
            </div>
            <Button variant="primary" iconRight={IconPlus} onClick={() => handleOpenPortfolioModal()}>
              Add Sample Video
            </Button>
          </div>

          {portfolioItems.length === 0 ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>No portfolio sample videos created yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {portfolioItems.map((item) => (
                <div
                  key={item._id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--line)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <Badge variant={item.format === 'short' ? 'gold' : 'maroon'}>
                        {item.format?.toUpperCase()} ({item.duration})
                      </Badge>
                      <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{item.clientType}</span>
                    </div>

                    <h3 className="font-display" style={{ fontSize: '18px', marginBottom: '6px', color: 'var(--ink)' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--accent-gold)', marginBottom: '12px', fontWeight: 600 }}>
                      Style: {item.styleName}
                    </p>

                    {item.thumbnailUrl && (
                      <div style={{ marginBottom: '12px', height: '120px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--line)' }}>
                        <img src={item.thumbnailUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}

                    {item.videoUrl && (
                      <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Link: <a href={item.videoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-gold)' }}>{item.videoUrl}</a>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                    <Button variant="secondary" size="small" onClick={() => handleOpenPortfolioModal(item)}>
                      Edit Details
                    </Button>
                    <Button variant="ghost" size="small" onClick={() => handleDeletePortfolioItem(item._id)} style={{ color: '#E53E3E' }}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROJECT BOARD TAB WITH DETAIL VIEW MODAL */}
      {activeTab === 'board' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)' }}>All Client Projects & Proposals</h2>
            <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Click any card to inspect full details</span>
          </div>

          {projects.length === 0 ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
              <h3 className="font-display" style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--ink)' }}>No Proposals Issued Yet</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '20px' }}>Create your first client proposal to populate the project board.</p>
              <Button variant="primary" iconRight={IconPlus} onClick={() => setActiveTab('proposal')}>
                Create Proposal
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {projects.map((proj) => (
                <div
                  key={proj._id}
                  onClick={() => {
                    setSelectedProjectForDetail(proj);
                    setDetailModalOpen(true);
                  }}
                  style={{
                    backgroundColor: 'var(--surface)',
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--line)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow)',
                    transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <Badge variant={getStatusBadgeVariant(proj.status)}>
                      {proj.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                      {proj.price} {proj.currency}
                    </span>
                  </div>

                  <h3 className="font-display" style={{ fontSize: '18px', marginBottom: '4px', color: 'var(--ink)' }}>
                    {proj.editingStyle}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '16px' }}>
                    Client: {proj.clientName} ({proj.clientEmail})
                  </p>

                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)', borderTop: '1px solid var(--line)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Deadline: {new Date(proj.deadline).toLocaleDateString()}</span>
                    {proj.status === 'in_progress' && (
                      <Button
                        variant="primary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkDelivered(proj._id);
                        }}
                      >
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REGISTERED CLIENTS DIRECTORY TAB */}
      {activeTab === 'clients' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)' }}>Registered Clients Directory</h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                Manage all registered client user profiles and issue targeted project proposals directly.
              </p>
            </div>

            <div style={{ width: '320px' }}>
              <Input
                placeholder="Search clients by name or email..."
                value={clientFilterText}
                onChange={(e) => setClientFilterText(e.target.value)}
                icon={IconSearch}
              />
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>No registered clients match your search filter.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {filteredClients.map((client) => (
                <div
                  key={client._id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--line)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                      {client.avatarUrl ? (
                        <img
                          src={client.avatarUrl}
                          alt={client.name}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-gold)' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(201, 160, 107, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-gold)',
                            fontWeight: 800,
                            fontSize: '18px',
                          }}
                        >
                          {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                      )}
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>{client.name}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>{client.email}</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', backgroundColor: 'var(--bg)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', fontSize: '12px' }}>
                      <div>
                        <span style={{ color: 'var(--ink-soft)', display: 'block' }}>Telegram Status</span>
                        {client.telegramChatId ? (
                          <Badge variant="success" size="small">CONNECTED</Badge>
                        ) : (
                          <Badge variant="maroon" size="small">NOT LINKED</Badge>
                        )}
                      </div>
                      <div>
                        <span style={{ color: 'var(--ink-soft)', display: 'block' }}>Proposals / Projects</span>
                        <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{client.projectCount || 0}</strong>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="small"
                    iconRight={IconPlus}
                    onClick={() => {
                      setSelectedClient(client);
                      setClientSearchText(client.email);
                      setActiveTab('proposal');
                    }}
                  >
                    Issue Proposal to {client.name.split(' ')[0]}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3-TIER PACKAGE PRICING CONSOLE WITH LIVE EXCHANGE RATE */}
      {activeTab === 'pricing' && (
        <div style={{ maxWidth: '760px', margin: '0 auto', backgroundColor: 'var(--surface)', padding: '36px 32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <h2 className="font-display" style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--ink)' }}>Package Pricing Configurations (3 Tiers)</h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '20px', lineHeight: 1.6 }}>
            Dynamically update base rates for Basic, Professional, and Premium tiers. Live ETB to USD conversion rates update in real-time.
          </p>

          {/* Live Exchange Rate Status Banner */}
          <div
            style={{
              backgroundColor: 'rgba(201, 160, 107, 0.12)',
              border: '1px solid var(--accent-gold)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
            }}
          >
            <div>
              <strong style={{ color: 'var(--accent-gold)' }}>Live Exchange Rate Feed:</strong> 1 USD = {exchangeRate.usdToEtb} ETB (1 ETB = ${exchangeRate.etbToUsd} USD)
            </div>
            <Badge variant="gold" size="small">LIVE API</Badge>
          </div>

          {/* CHAPA PAYMENT GATEWAY TEST MODE SETTINGS */}
          <div
            style={{
              backgroundColor: 'var(--bg)',
              border: `2px solid ${chapaTestModeEnabled ? 'var(--accent-gold)' : 'var(--line)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <Badge variant={chapaTestModeEnabled ? 'gold' : 'surface'}>
                  CHAPA.CO • {chapaTestModeEnabled ? 'TEST MODE ENABLED' : 'FEATURE DISABLED'}
                </Badge>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginTop: '6px' }}>
                  Official Chapa Hosted Payment Gateway (checkout.chapa.co)
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                  Real test mode API integration for Telebirr, CBE Birr, Awash Birr & Cards.
                </p>
              </div>

              <Button
                variant={chapaTestModeEnabled ? 'secondary' : 'primary'}
                size="small"
                onClick={handleToggleChapaTestMode}
              >
                {chapaTestModeEnabled ? 'Disable Chapa Feature' : 'Enable Chapa Test Mode'}
              </Button>
            </div>

            {/* Secret Key Input Row */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <Input
                  placeholder="Paste Chapa Secret Key (e.g. CHASECK_TEST-xxxx)"
                  value={chapaSecretKeyInput}
                  onChange={(e) => setChapaSecretKeyInput(e.target.value)}
                />
              </div>
              <Button variant="primary" size="small" onClick={handleSaveChapaKey}>
                Save Key
              </Button>
            </div>
          </div>

          <form onSubmit={handleSavePackageSettings} style={{ display: 'grid', gap: '24px' }}>
            {/* Basic Tier Box */}
            <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Basic Edit Tier</h3>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Standard captions, limited b-roll, basic sound effects, 1 revision</p>
                </div>
                <Badge variant="surface">BASIC</Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <Input
                  label="Minimum Rate (ETB / video)"
                  type="number"
                  value={basicMin}
                  onChange={(e) => setBasicMin(e.target.value)}
                  helperText={`Converted Live USD: ~$${Math.round(Number(basicMin) * exchangeRate.etbToUsd)} USD`}
                  required
                />
                <Input
                  label="Maximum Rate (ETB / video)"
                  type="number"
                  value={basicMax}
                  onChange={(e) => setBasicMax(e.target.value)}
                  helperText={`Converted Live USD: ~$${Math.round(Number(basicMax) * exchangeRate.etbToUsd)} USD`}
                  required
                />
              </div>
            </div>

            {/* Professional Tier Box (Recommended) */}
            <div style={{ backgroundColor: 'var(--bg)', border: '2px solid var(--accent-gold)', borderRadius: 'var(--radius-md)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Professional Tier (Recommended)</h3>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Advanced kinetic captions, extended b-roll, audio mix, 2 revisions</p>
                </div>
                <Badge variant="gold">RECOMMENDED</Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <Input
                  label="Minimum Rate (ETB / video)"
                  type="number"
                  value={professionalMin}
                  onChange={(e) => setProfessionalMin(e.target.value)}
                  helperText={`Converted Live USD: ~$${Math.round(Number(professionalMin) * exchangeRate.etbToUsd)} USD`}
                  required
                />
                <Input
                  label="Maximum Rate (ETB / video)"
                  type="number"
                  value={professionalMax}
                  onChange={(e) => setProfessionalMax(e.target.value)}
                  helperText={`Converted Live USD: ~$${Math.round(Number(professionalMax) * exchangeRate.etbToUsd)} USD`}
                  required
                />
              </div>
            </div>

            {/* Premium Tier Box */}
            <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Premium Edit Tier</h3>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Custom animated captions, extensive b-roll, heavy custom 3D graphics, 3 revisions</p>
                </div>
                <Badge variant="gold">PREMIUM</Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <Input
                  label="Minimum Rate (ETB / video)"
                  type="number"
                  value={premiumMin}
                  onChange={(e) => setPremiumMin(e.target.value)}
                  helperText={`Converted Live USD: ~$${Math.round(Number(premiumMin) * exchangeRate.etbToUsd)} USD`}
                  required
                />
                <Input
                  label="Maximum Rate (ETB / video)"
                  type="number"
                  value={premiumMax}
                  onChange={(e) => setPremiumMax(e.target.value)}
                  helperText={`Converted Live USD: ~$${Math.round(Number(premiumMax) * exchangeRate.etbToUsd)} USD`}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <Button type="submit" variant="primary" fullWidth isLoading={savingPackages} iconRight={IconCheck}>
                Save 3-Tier Pricing & Live USD Rates
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* RATINGS & MODERATION TAB */}
      {activeTab === 'moderation' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <h2 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)' }}>Client Reviews & Moderation</h2>
          {ratings.length === 0 ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center' }}>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>No client reviews submitted yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {ratings.map((r) => (
                <div
                  key={r._id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    padding: '20px 24px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <StarRating rating={r.stars} size={16} />
                      {r.featured && <Badge variant="gold">FEATURED ON HOME</Badge>}
                      {r.hidden && <Badge variant="maroon">HIDDEN</Badge>}
                    </div>
                    <p style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '6px', color: 'var(--ink)' }}>"{r.review}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--ink-soft)' }}>
                      <strong>{r.clientName || 'Verified Client'}</strong>
                      {r.clientTitle && <span style={{ color: 'var(--accent-gold)' }}>({r.clientTitle})</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant={r.featured ? 'primary' : 'secondary'}
                      size="small"
                      onClick={() => handleOpenFeaturedModal(r)}
                    >
                      {r.featured ? 'Edit Featured Title' : 'Mark Featured'}
                    </Button>
                    <Button variant="secondary" size="small" onClick={() => handleToggleHideRating(r._id)}>
                      {r.hidden ? 'Unhide' : 'Hide Review'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD DELIVERABLE MODAL */}
      <Modal
        isOpen={addDeliverableModalOpen}
        onClose={() => setAddDeliverableModalOpen(false)}
        title={`Add Deliverable Video — ${selectedContractForDeliverable?.clientName}`}
      >
        <form onSubmit={handleAddDeliverableSubmit} style={{ display: 'grid', gap: '16px' }}>
          <Input
            label="Deliverable Video Title (Optional)"
            placeholder="e.g. Reel #4 — Sound FX & Kinetic Captions"
            value={deliverableTitle}
            onChange={(e) => setDeliverableTitle(e.target.value)}
          />

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: '8px' }}>
              Video Render Upload (Cloudinary Signed Upload)
            </label>
            <Dropzone
              onFileSelect={handleDeliverableUpload}
              isLoading={uploadingDeliverable}
              accept="video/*,image/*"
              label="Drag & drop video render file here..."
            />
          </div>

          <Input
            label="Or Enter Direct Video URL"
            placeholder="https://res.cloudinary.com/..."
            value={deliverableUrl}
            onChange={(e) => setDeliverableUrl(e.target.value)}
            required
          />

          <Textarea
            label="Deliverable Notes"
            placeholder="e.g. Rendered in 4K 9:16 format with custom motion transitions..."
            value={deliverableNotes}
            onChange={(e) => setDeliverableNotes(e.target.value)}
          />

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="secondary" onClick={() => setAddDeliverableModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={submittingDeliverable} iconRight={IconCheck}>
              Add Deliverable & Notify Client
            </Button>
          </div>
        </form>
      </Modal>

      {/* PORTFOLIO ITEM CREATE / EDIT MODAL */}
      <Modal
        isOpen={portfolioModalOpen}
        onClose={() => setPortfolioModalOpen(false)}
        title={editingPortfolioId ? 'Edit Portfolio Sample Video' : 'Add New Portfolio Sample Video'}
      >
        <form onSubmit={handleSavePortfolioItem} style={{ display: 'grid', gap: '16px' }}>
          <Input
            label="Sample Video Title (Required)"
            placeholder="e.g., The AI Revolution in 60 Seconds"
            value={portTitle}
            onChange={(e) => setPortTitle(e.target.value)}
            required
          />

          <Select
            label="Editing Style Category"
            options={EDITING_STYLES.map((s) => ({ label: s.name, value: s.name }))}
            value={portStyleName}
            onChange={setPortStyleName}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select
              label="Format"
              options={[{ label: 'Short-Form (9:16)', value: 'short' }, { label: 'Long-Form (16:9)', value: 'long' }]}
              value={portFormat}
              onChange={setPortFormat}
            />
            <Input
              label="Video Duration"
              placeholder="e.g. 0:58"
              value={portDuration}
              onChange={(e) => setPortDuration(e.target.value)}
            />
          </div>

          <Input
            label="Target Client Category"
            placeholder="e.g. Tech Creator, B2B SaaS, Founder Brand"
            value={portClientType}
            onChange={(e) => setPortClientType(e.target.value)}
          />

          <Input
            label="Video Preview URL (YouTube, Vimeo, Google Drive, MP4)"
            placeholder="https://..."
            value={portVideoUrl}
            onChange={(e) => setPortVideoUrl(e.target.value)}
          />

          {/* Cloudinary Cover Image Uploader */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: '8px' }}>
              Custom Cover Thumbnail Image (Cloudinary Direct Upload)
            </label>
            <Dropzone
              onFileSelect={handlePortfolioCoverUpload}
              isLoading={uploadingCover}
              accept="image/*"
              label="Drag & drop custom cover thumbnail image here..."
            />
            {portThumbnailUrl && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={portThumbnailUrl}
                  alt="Thumbnail Preview"
                  style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--line)' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>Cover uploaded to Cloudinary</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="secondary" onClick={() => setPortfolioModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={submittingPortfolio} iconRight={IconCheck}>
              {editingPortfolioId ? 'Save Changes' : 'Publish Sample Video'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* FEATURED RATING MODAL WITH CLIENT TITLE TAG */}
      <Modal
        isOpen={featuredModalOpen}
        onClose={() => setFeaturedModalOpen(false)}
        title="Mark Rating Featured & Set Client Title"
      >
        <form onSubmit={handleSaveFeaturedRating} style={{ display: 'grid', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
            Set the client's custom title tag (e.g. <em>"CEO / Founder of Tesla, SpaceX"</em> or <em>"Lead Tech Creator"</em>) to be displayed on the Home Page.
          </p>

          <Input
            label="Client Custom Title / Tagline"
            placeholder="e.g. CEO / Founder of Tesla, SpaceX"
            value={featureClientTitle}
            onChange={(e) => setFeatureClientTitle(e.target.value)}
            required
          />

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="secondary" onClick={() => setFeaturedModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={submittingFeature} iconRight={IconStar}>
              Feature Rating on Home
            </Button>
          </div>
        </form>
      </Modal>

      {/* Project Detail Modal */}
      {selectedProjectForDetail && (
        <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Project & Proposal Specifications">
          <div style={{ display: 'grid', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge variant={getStatusBadgeVariant(selectedProjectForDetail.status)}>
                {selectedProjectForDetail.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                {selectedProjectForDetail.price} {selectedProjectForDetail.currency}
              </span>
            </div>

            <div>
              <strong>Editing Style:</strong> {selectedProjectForDetail.editingStyle}
            </div>
            <div>
              <strong>Client:</strong> {selectedProjectForDetail.clientName} ({selectedProjectForDetail.clientEmail})
            </div>
            <div>
              <strong>Package Tier:</strong> {selectedProjectForDetail.packageTier?.toUpperCase()} ({selectedProjectForDetail.contentLength?.toUpperCase()})
            </div>
            <div>
              <strong>Deadline:</strong> {new Date(selectedProjectForDetail.deadline).toLocaleDateString()}
            </div>

            {selectedProjectForDetail.referenceBrief && (
              <div style={{ backgroundColor: 'var(--bg)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                <strong>Brief Notes / Reference:</strong>
                <p style={{ marginTop: '4px', color: 'var(--ink-soft)' }}>{selectedProjectForDetail.referenceBrief}</p>
              </div>
            )}

            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--line)', fontSize: '12px', color: 'var(--ink-soft)' }}>
              <div>Created: {new Date(selectedProjectForDetail.createdAt).toLocaleString()}</div>
              {selectedProjectForDetail.acceptedAt && <div>Accepted: {new Date(selectedProjectForDetail.acceptedAt).toLocaleString()}</div>}
              {selectedProjectForDetail.deliveredAt && <div>Delivered: {new Date(selectedProjectForDetail.deliveredAt).toLocaleString()}</div>}
              {selectedProjectForDetail.completedAt && <div>Completed: {new Date(selectedProjectForDetail.completedAt).toLocaleString()}</div>}
            </div>

            {selectedProjectForDetail.status === 'in_progress' && (
              <div style={{ marginTop: '16px' }}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleMarkDelivered(selectedProjectForDetail._id)}
                >
                  Mark Work Delivered
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};
