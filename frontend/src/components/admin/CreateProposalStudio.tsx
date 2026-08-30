import React, { useState, useEffect, FormEvent } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input, Textarea } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { Modal } from '@components/ui/Modal';
import {
  IconSearch,
  IconCheck,
  IconFilm,
  IconZap,
  IconFileText,
  IconCalendar,
  IconUser,
  IconDollar,
  IconShield,
  IconEye,
} from '@icons/icons';

export interface CreateProposalStudioProps {
  apiFetch: (url: string, options?: any) => Promise<any>;
  toast: (opts: { message: string; type?: 'success' | 'error' | 'info' }) => void;
  onBack: () => void;
  onSuccess: () => void;
}

const AVAILABLE_SERVICES = [
  'Clean Cuts & Trimming',
  'Animated Captions & Kinetic Typography',
  'Sound Design & Audio SFX',
  'Color Correction & Grading',
  'Motion Graphics & B-Roll Overlays',
  'Viral Hook Visual FX',
  'Thumbnail Design',
  'Priority 24-48h Turnaround',
];

const AVAILABLE_EXCLUSIONS = [
  'Original Filming & Camera Capture',
  'Voiceover Voice Acting',
  'Scriptwriting & Content Research',
  'Account Channel Management',
];

export const CreateProposalStudio: React.FC<CreateProposalStudioProps> = ({
  apiFetch,
  toast,
  onBack,
  onSuccess,
}) => {
  // Proposal Form Mode ('project' | 'contract')
  const [proposalType, setProposalType] = useState<'project' | 'contract'>('project');
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);

  // Client Directory Lookup State
  const [clientSearchText, setClientSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchingClient, setSearchingClient] = useState(false);

  // Package Configs Fetched from Server Settings (`GET /api/packages`)
  const [packageConfigs, setPackageConfigs] = useState<any[]>([]);

  // Proposal Agreement Extended Metadata
  const [proposalTitle, setProposalTitle] = useState('Short-Form Video Content Package');
  const [quantity, setQuantity] = useState('10');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1' | '4:5'>('9:16');
  const [resolution, setResolution] = useState('1080p Full HD');
  const [targetPlatform, setTargetPlatform] = useState('Multi-Platform');

  // Payment Terms
  const [paymentTermsOption, setPaymentTermsOption] = useState('50% upfront, 50% on delivery');
  const [customPaymentTerms, setCustomPaymentTerms] = useState('');

  // Included Services
  const [includedServices, setIncludedServices] = useState<string[]>([
    'Clean Cuts & Trimming',
    'Animated Captions & Kinetic Typography',
    'Sound Design & Audio SFX',
    'Color Correction & Grading',
  ]);
  const [includedRevisions, setIncludedRevisions] = useState('2');
  const [paymentStructure, setPaymentStructure] = useState<'upfront_100' | 'deposit_50_50' | 'monthly_upfront'>('upfront_100');

  // Expiration Date (default +7 days)
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const [clientResponsibilities, setClientResponsibilities] = useState(
    'Client provides raw footage, assets, brand guidelines, and timely feedback within 48h of preview.'
  );

  // Common Fields
  const [packageTier, setPackageTier] = useState<'basic' | 'professional' | 'premium' | 'custom'>('professional');
  const [contentLength, setContentLength] = useState<'short' | 'long'>('short');
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // One-Off Project Fields
  const [price, setPrice] = useState('9000');
  const [referenceBrief, setReferenceBrief] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });

  // Retainer Contract Fields
  const [contractFrequency, setContractFrequency] = useState('weekly-2');
  const [contractStartDate, setContractStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [contractDurationMonths, setContractDurationMonths] = useState('1');
  const [contractMonthlyPrice, setContractMonthlyPrice] = useState('7200');

  // Fetch PackageConfigs from Server (`GET /api/packages`)
  useEffect(() => {
    let isMounted = true;
    const fetchConfigs = async () => {
      try {
        const res = await apiFetch('/api/packages');
        if (res.success && Array.isArray(res.configs) && isMounted) {
          setPackageConfigs(res.configs);
        }
      } catch (err) {
        // Fallback to local suggestions
      }
    };
    fetchConfigs();
    return () => {
      isMounted = false;
    };
  }, [apiFetch]);

  // Auto-update proposal document title when switching mode or tier
  useEffect(() => {
    const tierLabel = packageTier === 'custom' ? 'Custom Package' : `${packageTier.toUpperCase()} Tier`;
    if (proposalType === 'project') {
      setProposalTitle(`${quantity}x Video Package — ${tierLabel}`);
    } else {
      setProposalTitle(`Monthly Retainer Proposal — ${tierLabel}`);
    }
  }, [proposalType, quantity, packageTier]);

  // Dynamic Pricing Engine derived from PackageConfig settings & Contract Duration Discount
  useEffect(() => {
    if (packageTier === 'custom') return; // Preserves manual pricing when Custom Package is selected

    const matchConfig = packageConfigs.find(
      (c) => c.tier === packageTier && c.length === contentLength && c.currency === currency
    );

    let baseSuggestedRate = matchConfig?.priceMin || matchConfig?.priceMax || 900;

    if (proposalType === 'project') {
      const qty = Number(quantity) || 1;
      const computedTotal = baseSuggestedRate * qty;
      setPrice(computedTotal.toString());
    } else {
      let videosPerMonth = 8;
      switch (contractFrequency) {
        case 'weekly-1': videosPerMonth = 4; break;
        case 'weekly-2': videosPerMonth = 8; break;
        case 'weekly-3-4': videosPerMonth = 14; break;
        case 'daily-1': videosPerMonth = 30; break;
        case 'daily-2': videosPerMonth = 60; break;
        default: videosPerMonth = 8;
      }

      let discountFactor = 1.0;
      if (contractDurationMonths === '3') discountFactor = 0.95;
      if (contractDurationMonths === '6') discountFactor = 0.90;
      if (contractDurationMonths === '12') discountFactor = 0.85;

      const baseMonthly = baseSuggestedRate * videosPerMonth;
      const discountedMonthly = Math.round(baseMonthly * discountFactor);
      setContractMonthlyPrice(discountedMonthly.toString());
    }
  }, [proposalType, packageTier, contentLength, contractFrequency, currency, quantity, contractDurationMonths, packageConfigs]);

  // Client Search Debounce
  useEffect(() => {
    if (!clientSearchText || clientSearchText.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearchingClient(true);
        const res = await apiFetch(`/api/admin/users/search?email=${encodeURIComponent(clientSearchText)}`);
        if (res.success) setSearchResults(res.users);
      } catch (err) {
      } finally {
        setSearchingClient(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [clientSearchText, apiFetch]);

  const toggleService = (service: string) => {
    if (includedServices.includes(service)) {
      setIncludedServices(includedServices.filter((s) => s !== service));
    } else {
      setIncludedServices([...includedServices, service]);
    }
  };

  const effectivePaymentTerms =
    paymentTermsOption === 'Custom' ? customPaymentTerms || 'Custom Payment Terms' : paymentTermsOption;

  // Submit Handler
  const handleSubmitProposal = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast({ message: 'Please search and select a registered client partner first.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);

      const commonProposalData = {
        clientId: selectedClient._id,
        clientEmail: selectedClient.email.toLowerCase().trim(),
        proposalTitle,
        aspectRatio,
        resolution,
        targetPlatform,
        includedServices,
        excludedServices: [],
        includedRevisions: Number(includedRevisions),
        paymentStructure,
        paymentTerms: effectivePaymentTerms,
        customPaymentTerms: paymentTermsOption === 'Custom' ? customPaymentTerms : '',
        validUntil,
        clientResponsibilities,
        packageTier,
        contentLength,
        currency,
        notes,
      };

      if (proposalType === 'project') {
        if (!price || !deadline) {
          toast({ message: 'Please specify the project rate and target deadline date.', type: 'error' });
          return;
        }

        const res = await apiFetch('/api/admin/proposals', {
          method: 'POST',
          body: JSON.stringify({
            ...commonProposalData,
            editingStyle: 'As Instructed by Client',
            quantity: Number(quantity),
            price: Number(price),
            referenceBrief,
            deadline,
          }),
        });

        if (res.success) {
          toast({ message: 'Project Proposal offer dispatched to client!', type: 'success' });
          onSuccess();
        }
      } else {
        if (!contractStartDate || !contractMonthlyPrice) {
          toast({ message: 'Please specify the start date and monthly retainer rate.', type: 'error' });
          return;
        }

        const res = await apiFetch('/api/admin/contracts', {
          method: 'POST',
          body: JSON.stringify({
            ...commonProposalData,
            editingStyle: 'As Instructed by Client',
            frequency: contractFrequency,
            monthlyPrice: Number(contractMonthlyPrice),
            startDate: contractStartDate,
            durationMonths: Number(contractDurationMonths),
          }),
        });

        if (res.success) {
          toast({ message: 'Monthly Retainer Proposal dispatched to client!', type: 'success' });
          onSuccess();
        }
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to dispatch proposal offer.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '24px' }} className="create-proposal-studio-container">
      {/* Executive Control Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div>
          <button
            type="button"
            onClick={onBack}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--accent-gold)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '6px',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Back to Operations Hub
          </button>
          <h1 className="font-display" style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
            Agency Proposal Agreement Studio
          </h1>
        </div>

        {/* Top Control Mode Segment */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--surface)',
              borderRadius: '12px',
              padding: '4px',
              border: '1px solid var(--line)',
            }}
          >
            <button
              type="button"
              onClick={() => setProposalType('project')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: proposalType === 'project' ? 'var(--accent-gold)' : 'transparent',
                color: proposalType === 'project' ? 'var(--signal-ink)' : 'var(--ink-soft)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <IconFilm size={16} />
              <span>One-Off Project Proposal</span>
            </button>
            <button
              type="button"
              onClick={() => setProposalType('contract')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: proposalType === 'contract' ? 'var(--accent-gold)' : 'transparent',
                color: proposalType === 'contract' ? 'var(--signal-ink)' : 'var(--ink-soft)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <IconZap size={16} />
              <span>Retainer Agreement Proposal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Two-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
        className="proposal-main-grid"
      >
        {/* LEFT COLUMN: UNIFIED FORM SHEET */}
        <form
          onSubmit={handleSubmitProposal}
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* SECTION 1: RECIPIENT CLIENT PARTNER */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800 }}>
                01. RECIPIENT CLIENT PARTNER
              </span>
              {selectedClient && <Badge variant="gold">CLIENT VERIFIED ✓</Badge>}
            </div>

            <div style={{ display: 'grid', gap: '14px', marginBottom: '16px' }}>
              {!selectedClient ? (
                <div>
                  <Input
                    label="Select Registered Client Partner"
                    placeholder="Search client directory by name or email (e.g. alex@creator.com)..."
                    value={clientSearchText}
                    onChange={(e) => setClientSearchText(e.target.value)}
                    icon={IconSearch}
                  />

                  {searchingClient && (
                    <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginTop: '6px' }}>
                      Searching client directory...
                    </span>
                  )}

                  {searchResults.length > 0 && (
                    <div
                      style={{
                        backgroundColor: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '10px',
                        marginTop: '8px',
                        maxHeight: '180px',
                        overflowY: 'auto',
                      }}
                    >
                      {searchResults.map((u) => (
                        <div
                          key={u._id}
                          onClick={() => {
                            setSelectedClient(u);
                            setClientSearchText(u.email);
                            setSearchResults([]);
                          }}
                          style={{
                            padding: '12px 14px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--line)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <strong style={{ color: 'var(--ink)', display: 'block' }}>{u.name}</strong>
                            <span style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>{u.email}</span>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                            Select Client →
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    backgroundColor: 'rgba(201, 168, 76, 0.08)',
                    border: '1px solid var(--accent-gold)',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {selectedClient.avatarUrl ? (
                      <img
                        src={selectedClient.avatarUrl}
                        alt={selectedClient.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-gold)',
                          color: 'var(--signal-ink)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '16px',
                        }}
                      >
                        {selectedClient.name ? selectedClient.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                    )}

                    <div>
                      <strong style={{ fontSize: '15px', color: 'var(--ink)', display: 'block' }}>
                        {selectedClient.name}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{selectedClient.email}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient(null);
                      setClientSearchText('');
                    }}
                    style={{
                      fontSize: '12px',
                      color: 'var(--ink-soft)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      border: 'none',
                      background: 'none',
                    }}
                  >
                    Change Client
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />

          {/* SECTION 2: DELIVERABLE SCOPE & SPECS */}
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '12px' }}>
              02. DELIVERABLE SCOPE & SPECS
            </span>

            {/* Tier Selector Pills including Custom Package */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              {[
                { id: 'basic' as const, name: 'Basic Tier', desc: 'Essential cuts & polish' },
                { id: 'professional' as const, name: 'Professional Tier', desc: 'SFX & motion graphics' },
                { id: 'premium' as const, name: 'Premium Tier', desc: 'Custom 2D/3D & hooks' },
                { id: 'custom' as const, name: 'Custom Package', desc: 'Bespoke client scope & rate' },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setPackageTier(t.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1.5px solid ${packageTier === t.id ? 'var(--accent-gold)' : 'var(--line)'}`,
                    backgroundColor: packageTier === t.id ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <strong style={{ fontSize: '13px', display: 'block', color: packageTier === t.id ? 'var(--accent-gold)' : 'var(--ink)' }}>
                    {t.name}
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block', marginTop: '2px' }}>
                    {t.desc}
                  </span>
                </div>
              ))}
            </div>

            {/* Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '16px' }}>
              {proposalType === 'project' ? (
                <Input
                  label="Number of Video Deliverables"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 10"
                  required
                />
              ) : (
                <Select
                  label="Monthly Delivery Frequency"
                  options={[
                    { label: '1 Video / Week (4 Videos / Mo)', value: 'weekly-1' },
                    { label: '2 Videos / Week (8 Videos / Mo — Recommended)', value: 'weekly-2' },
                    { label: '3-4 Videos / Week (14 Videos / Mo)', value: 'weekly-3-4' },
                    { label: '1 Daily Video (30 Videos / Mo)', value: 'daily-1' },
                    { label: '2 Daily Videos (60 Videos / Mo)', value: 'daily-2' },
                  ]}
                  value={contractFrequency}
                  onChange={(v) => setContractFrequency(v)}
                />
              )}

              <Select
                label="Aspect Ratio Framing"
                options={[
                  { label: '9:16 Vertical (Reels, TikTok, Shorts)', value: '9:16' },
                  { label: '16:9 Widescreen (YouTube, Courses)', value: '16:9' },
                  { label: '1:1 Square (Instagram Post)', value: '1:1' },
                  { label: '4:5 Portrait (Social Feed)', value: '4:5' },
                ]}
                value={aspectRatio}
                onChange={(v) => setAspectRatio(v as any)}
              />

              <Select
                label="Master Video Resolution"
                options={[
                  { label: '1080p Full HD (Standard)', value: '1080p Full HD' },
                  { label: '4K Ultra HD (High Detail)', value: '4K Ultra HD' },
                  { label: '720p HD', value: '720p HD' },
                ]}
                value={resolution}
                onChange={(v) => setResolution(v)}
              />

              <Select
                label="Primary Target Platform"
                options={[
                  { label: 'Multi-Platform (TikTok, Reels, Shorts)', value: 'Multi-Platform' },
                  { label: 'TikTok', value: 'TikTok' },
                  { label: 'Instagram Reels', value: 'Instagram Reels' },
                  { label: 'YouTube Shorts', value: 'YouTube Shorts' },
                  { label: 'YouTube Main Channel', value: 'YouTube Main Channel' },
                ]}
                value={targetPlatform}
                onChange={(v) => setTargetPlatform(v)}
              />

              <Select
                label="Included Revision Rounds"
                options={[
                  { label: '1 Round of Revisions Included', value: '1' },
                  { label: '2 Rounds of Revisions Included (Standard)', value: '2' },
                  { label: '3 Rounds of Revisions Included', value: '3' },
                ]}
                value={includedRevisions}
                onChange={(v) => setIncludedRevisions(v)}
              />
            </div>

            {/* Included Services Checklist */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                Included Services Checklist
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {AVAILABLE_SERVICES.map((srv) => {
                  const isChecked = includedServices.includes(srv);
                  return (
                    <div
                      key={srv}
                      onClick={() => toggleService(srv)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${isChecked ? 'var(--accent-gold)' : 'var(--line)'}`,
                        backgroundColor: isChecked ? 'rgba(201, 168, 76, 0.08)' : 'var(--bg)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: isChecked ? 'var(--ink)' : 'var(--ink-soft)',
                      }}
                    >
                      <span>{srv}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />

          {/* SECTION 3: FINANCIAL TERMS & TIMELINE */}
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '12px' }}>
              03. FINANCIAL TERMS & TIMELINE
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '14px' }}>
              <Select
                label="Offer Currency"
                options={[
                  { label: 'Ethiopian Birr (ETB)', value: 'ETB' },
                  { label: 'United States Dollar (USD $)', value: 'USD' },
                ]}
                value={currency}
                onChange={(v) => setCurrency(v as any)}
              />

              <Select
                label="Payment Terms"
                options={[
                  { label: '50% upfront, 50% on delivery', value: '50% upfront, 50% on delivery' },
                  { label: 'Full payment on delivery', value: 'Full payment on delivery' },
                  { label: '100% upfront payment', value: '100% upfront payment' },
                  { label: 'Monthly upfront billing', value: 'Monthly upfront billing' },
                  { label: 'Custom (specify in notes)', value: 'Custom' },
                ]}
                value={paymentTermsOption}
                onChange={(v) => setPaymentTermsOption(v)}
              />
            </div>

            {paymentTermsOption === 'Custom' && (
              <div style={{ marginBottom: '14px' }}>
                <Input
                  label="Specify Custom Payment Terms"
                  placeholder="e.g. 30% deposit, 40% milestone 1, 30% final..."
                  value={customPaymentTerms}
                  onChange={(e) => setCustomPaymentTerms(e.target.value)}
                  required
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: proposalType === 'contract' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '14px', marginBottom: '14px' }}>
              {proposalType === 'project' ? (
                <Input
                  label={`Total Project Rate (${currency})`}
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 9000"
                  required
                />
              ) : (
                <>
                  <Input
                    label={`Monthly Retainer Rate (${currency})`}
                    type="number"
                    value={contractMonthlyPrice}
                    onChange={(e) => setContractMonthlyPrice(e.target.value)}
                    placeholder="e.g. 7200"
                    required
                  />
                  <Select
                    label="Contract Commitment Term"
                    options={[
                      { label: '1 Month Commitment (Standard)', value: '1' },
                      { label: '3 Months Commitment (5% Discount Applied)', value: '3' },
                      { label: '6 Months Commitment (10% Discount Applied)', value: '6' },
                      { label: '12 Months Commitment (15% Discount Applied)', value: '12' },
                    ]}
                    value={contractDurationMonths}
                    onChange={(v) => setContractDurationMonths(v)}
                  />
                </>
              )}

              {proposalType === 'project' ? (
                <Input
                  label="Target Delivery Deadline Date"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              ) : (
                <Input
                  label="Contract Start Date"
                  type="date"
                  value={contractStartDate}
                  onChange={(e) => setContractStartDate(e.target.value)}
                  required
                />
              )}

              <Input
                label="Proposal Valid Until (Expiration)"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />

          {/* SECTION 4: CLIENT RESPONSIBILITIES & PRIVATE NOTES */}
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '12px' }}>
              04. CLIENT RESPONSIBILITIES & PRIVATE NOTES
            </span>

            <div style={{ display: 'grid', gap: '14px' }}>
              <Textarea
                label="Client Responsibilities Statement"
                rows={2}
                value={clientResponsibilities}
                onChange={(e) => setClientResponsibilities(e.target.value)}
              />

              {proposalType === 'project' && (
                <Textarea
                  label="Creative Brief & Reference Links"
                  rows={2}
                  placeholder="Reference links, Drive folders, style notes..."
                  value={referenceBrief}
                  onChange={(e) => setReferenceBrief(e.target.value)}
                />
              )}

              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)', padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--ink-soft)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  🔒 INTERNAL ONLY (SANITIZED FROM CLIENT API RESPONSES)
                </span>
                <Textarea
                  placeholder="Private agency notes visible only to admins..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" size="large" fullWidth isLoading={submitting}>
            Dispatch Official Proposal Offer to Client
          </Button>
        </form>

        {/* RIGHT COLUMN: REALISTIC CLIENT PROPOSAL AGREEMENT PREVIEW (DESKTOP) */}
        <div className="desktop-preview-col" style={{ position: 'sticky', top: '90px' }}>
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              border: '1.5px solid var(--accent-gold)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 12px 36px -8px rgba(201, 168, 76, 0.25)',
            }}
          >
            {/* Header Document Ticket */}
            <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px', textAlign: 'center' }}>
              <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '1px' }}>
                ALPHA CUT • OFFICIAL PROPOSAL AGREEMENT
              </span>
              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 800, margin: '6px 0 2px 0', color: 'var(--ink)' }}>
                {proposalTitle || 'Video Production Proposal'}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                Prepared for: <strong style={{ color: 'var(--accent-gold)' }}>{selectedClient ? selectedClient.name : 'Client Partner'}</strong>
              </span>
            </div>

            {/* Scope Summary */}
            <div
              style={{
                backgroundColor: 'var(--bg)',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12.5px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Deliverables</span>
                <strong style={{ color: 'var(--ink)' }}>
                  {proposalType === 'project' ? `${typeof quantity === 'object' ? (quantity as any).value : quantity}x Video Deliverable(s)` : `${typeof contractFrequency === 'object' ? (contractFrequency as any).value : contractFrequency} Retainer`}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Specs & Tier</span>
                <strong style={{ color: 'var(--ink)' }}>
                  {typeof aspectRatio === 'object' ? (aspectRatio as any).value : aspectRatio} • {typeof resolution === 'object' ? (resolution as any).value : resolution} • {String(typeof packageTier === 'object' ? (packageTier as any).value : packageTier).toUpperCase()}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Target Platform</span>
                <strong style={{ color: 'var(--ink)' }}>{typeof targetPlatform === 'object' ? (targetPlatform as any).value : targetPlatform}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Revisions Included</span>
                <strong style={{ color: 'var(--ink)' }}>{typeof includedRevisions === 'object' ? (includedRevisions as any).value : includedRevisions} Round(s)</strong>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--line)', margin: '4px 0' }} />

              <div>
                <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  INCLUDED SERVICES ({includedServices.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {includedServices.slice(0, 4).map((s) => (
                    <span key={s} style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>
                      ✓ {s}
                    </span>
                  ))}
                  {includedServices.length > 4 && (
                    <span style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>+ {includedServices.length - 4} more services</span>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Investment */}
            <div style={{ backgroundColor: 'rgba(201, 168, 76, 0.08)', padding: '14px', borderRadius: '12px', border: '1px solid var(--accent-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 800 }}>COMMERCIAL INVESTMENT</span>
                <span style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block', marginTop: '2px' }}>
                  {effectivePaymentTerms}
                </span>
              </div>

              <span className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                {proposalType === 'project' ? `${price} ${currency}` : `${contractMonthlyPrice} ${currency} / mo`}
              </span>
            </div>

            {/* Notification Rails */}
            <div style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'grid', gap: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} color="var(--accent-gold)" /> Telegram Bot Notification Channel
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} color="var(--accent-gold)" /> Transactional Email Offer Dispatch
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} color="var(--accent-gold)" /> Client Web & Mini App Portal Response
              </span>
            </div>

            {/* Expiration Note */}
            <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.5, borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
              Proposal valid until <strong>{new Date(validUntil).toLocaleDateString()}</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING PREVIEW TRIGGER BAR */}
      <div className="mobile-preview-trigger-bar" style={{ position: 'fixed', bottom: '20px', left: '16px', right: '16px', zIndex: 90, justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => setShowMobilePreviewModal(true)}
          style={{
            backgroundColor: 'var(--accent-gold)',
            color: 'var(--signal-ink)',
            border: 'none',
            borderRadius: '100px',
            padding: '12px 24px',
            fontWeight: 800,
            fontSize: '13.5px',
            boxShadow: '0 8px 24px rgba(201, 168, 76, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <IconEye size={18} />
          <span>Preview Live Proposal Offer</span>
        </button>
      </div>

      {/* MOBILE FULL PROPOSAL PREVIEW MODAL */}
      <Modal isOpen={showMobilePreviewModal} onClose={() => setShowMobilePreviewModal(false)} title="Live Proposal Agreement Preview">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px 0' }}>
          <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px', textAlign: 'center' }}>
            <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '1px' }}>
              ALPHA CUT • OFFICIAL PROPOSAL AGREEMENT
            </span>
            <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 800, margin: '6px 0 2px 0', color: 'var(--ink)' }}>
              {proposalTitle || 'Video Production Proposal'}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
              Prepared for: <strong style={{ color: 'var(--accent-gold)' }}>{selectedClient ? selectedClient.name : 'Client Partner'}</strong>
            </span>
          </div>

          <div style={{ backgroundColor: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--line)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--ink-soft)' }}>Deliverables</span>
              <strong style={{ color: 'var(--ink)' }}>{proposalType === 'project' ? `${typeof quantity === 'object' ? (quantity as any).value : quantity}x Video Deliverable(s)` : `${typeof contractFrequency === 'object' ? (contractFrequency as any).value : contractFrequency} Retainer`}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--ink-soft)' }}>Specs & Tier</span>
              <strong style={{ color: 'var(--ink)' }}>{typeof aspectRatio === 'object' ? (aspectRatio as any).value : aspectRatio} • {typeof resolution === 'object' ? (resolution as any).value : resolution} • {String(typeof packageTier === 'object' ? (packageTier as any).value : packageTier).toUpperCase()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--ink-soft)' }}>Revisions Included</span>
              <strong style={{ color: 'var(--ink)' }}>{typeof includedRevisions === 'object' ? (includedRevisions as any).value : includedRevisions} Round(s)</strong>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(201, 168, 76, 0.08)', padding: '14px', borderRadius: '12px', border: '1px solid var(--accent-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 800 }}>COMMERCIAL INVESTMENT</span>
              <span style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block', marginTop: '2px' }}>{effectivePaymentTerms}</span>
            </div>
            <span className="font-mono" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {proposalType === 'project' ? `${price} ${currency}` : `${contractMonthlyPrice} ${currency} / mo`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowMobilePreviewModal(false)}
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--accent-gold)',
              color: 'var(--signal-ink)',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Close Preview
          </button>
        </div>
      </Modal>
    </div>
  );
};
