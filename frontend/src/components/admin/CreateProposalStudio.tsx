import React, { useState, useEffect, FormEvent } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input, Textarea } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { EDITING_STYLES } from '../../data/editingStyles';
import { IconSearch, IconCheck, IconSparkles, IconFileText, IconCalendar, IconUser, IconDollar } from '@icons/icons';

export interface CreateProposalStudioProps {
  apiFetch: (url: string, options?: any) => Promise<any>;
  toast: (opts: { message: string; type?: 'success' | 'error' | 'info' }) => void;
  onBack: () => void;
  onSuccess: () => void;
  exchangeRate?: { usdToEtb: number; etbToUsd: number };
}

export const CreateProposalStudio: React.FC<CreateProposalStudioProps> = ({
  apiFetch,
  toast,
  onBack,
  onSuccess,
  exchangeRate = { usdToEtb: 128.5, etbToUsd: 0.00778 },
}) => {
  // Proposal Form Mode ('project' | 'contract')
  const [proposalType, setProposalType] = useState<'project' | 'contract'>('project');

  // Client Directory Lookup State
  const [clientSearchText, setClientSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchingClient, setSearchingClient] = useState(false);

  // Common Fields
  const [packageTier, setPackageTier] = useState<'basic' | 'professional' | 'premium'>('professional');
  const [contentLength, setContentLength] = useState<'short' | 'long'>('short');
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // One-Off Project Fields
  const [editingStyle, setEditingStyle] = useState(EDITING_STYLES[0].name);
  const [price, setPrice] = useState('900');
  const [referenceBrief, setReferenceBrief] = useState('');
  const [deadline, setDeadline] = useState('');

  // Retainer Contract Fields
  const [contractFrequency, setContractFrequency] = useState('weekly-2');
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractDurationMonths, setContractDurationMonths] = useState('1');
  const [contractMonthlyPrice, setContractMonthlyPrice] = useState('7200');

  // Auto-suggest pricing calculation based on Tier & Frequency
  useEffect(() => {
    if (proposalType === 'project') {
      let baseRate = 900;
      if (packageTier === 'basic') baseRate = 500;
      if (packageTier === 'premium') baseRate = 1600;
      if (contentLength === 'long') baseRate *= 4;

      if (currency === 'USD') {
        setPrice((Math.round(baseRate * exchangeRate.etbToUsd)).toString());
      } else {
        setPrice(baseRate.toString());
      }
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

      let minRate = 900;
      if (packageTier === 'basic') minRate = 500;
      if (packageTier === 'premium') minRate = 1600;

      let computedETB = videosPerMonth * minRate;
      if (currency === 'USD') {
        setContractMonthlyPrice((Math.round(computedETB * exchangeRate.etbToUsd)).toString());
      } else {
        setContractMonthlyPrice(computedETB.toString());
      }
    }
  }, [proposalType, packageTier, contentLength, contractFrequency, currency, exchangeRate]);

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

  // Submit Handler
  const handleSubmitProposal = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast({ message: 'Please search and select a registered client partner first.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);

      if (proposalType === 'project') {
        if (!price || !deadline) {
          toast({ message: 'Please specify the project rate and target deadline date.', type: 'error' });
          return;
        }

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
            clientId: selectedClient._id,
            clientEmail: selectedClient.email.toLowerCase().trim(),
            packageTier,
            contentLength,
            frequency: contractFrequency,
            monthlyPrice: Number(contractMonthlyPrice),
            currency,
            startDate: contractStartDate,
            durationMonths: Number(contractDurationMonths),
            notes,
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
            Proposal & Deal Studio
          </h1>
        </div>

        {/* Top Control Segment & Ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Segmented Switcher Pill */}
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
              }}
            >
              🎬 One-Off Project
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
              }}
            >
              📦 Monthly Retainer
            </button>
          </div>

          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, backgroundColor: 'rgba(201,168,76,0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.2)' }}>
            1 USD = {exchangeRate.usdToEtb} ETB
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
        {/* LEFT COLUMN: UNIFIED PROFESSIONAL DASHBOARD FORM SHEET */}
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
          {/* SECTION 1: CLIENT SELECTION */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800 }}>
                01. CLIENT RECIPIENT
              </span>
              {selectedClient && <Badge variant="gold">PARTNER VERIFIED ✓</Badge>}
            </div>

            {!selectedClient ? (
              <div>
                <Input
                  placeholder="Search client directory by name or email (e.g. alex@creator.com)..."
                  value={clientSearchText}
                  onChange={(e) => setClientSearchText(e.target.value)}
                  icon={IconSearch}
                />

                {searchingClient && (
                  <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginTop: '6px' }}>
                    Searching database...
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
                          Select →
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

          <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />

          {/* SECTION 2: DELIVERABLE SPECIFICATIONS */}
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '12px' }}>
              02. DELIVERABLE SPECIFICATIONS
            </span>

            {/* Tier Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {[
                { id: 'basic' as const, name: 'Basic Edit Tier', desc: 'Essential cuts & polish' },
                { id: 'professional' as const, name: 'Professional Tier', desc: 'SFX & motion graphics' },
                { id: 'premium' as const, name: 'Premium Tier', desc: 'Custom 2D/3D & hooks' },
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {proposalType === 'project' && (
                <Select
                  label="Editing Style"
                  options={EDITING_STYLES.map((s) => ({ label: s.name, value: s.name }))}
                  value={editingStyle}
                  onChange={(v) => setEditingStyle(v)}
                />
              )}

              <Select
                label="Video Format"
                options={[
                  { label: '9:16 Vertical Short-Form (Reels, Shorts)', value: 'short' },
                  { label: '16:9 Widescreen Long-Form (YouTube)', value: 'long' },
                ]}
                value={contentLength}
                onChange={(v) => setContentLength(v as any)}
              />

              {proposalType === 'contract' && (
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
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />

          {/* SECTION 3: FINANCIAL TERMS & SCHEDULE */}
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '12px' }}>
              03. FINANCIAL TERMS & TIMELINE
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '14px' }}>
              <Select
                label="Currency"
                options={[
                  { label: 'Ethiopian Birr (ETB)', value: 'ETB' },
                  { label: 'United States Dollar (USD $)', value: 'USD' },
                ]}
                value={currency}
                onChange={(v) => setCurrency(v as any)}
              />

              {proposalType === 'project' ? (
                <Input
                  label={`Agreed Project Rate (${currency})`}
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 900"
                  required
                />
              ) : (
                <Input
                  label={`Monthly Retainer Price (${currency})`}
                  type="number"
                  value={contractMonthlyPrice}
                  onChange={(e) => setContractMonthlyPrice(e.target.value)}
                  placeholder="e.g. 7200"
                  required
                />
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: proposalType === 'contract' ? 'repeat(2, 1fr)' : '1fr', gap: '14px' }}>
              {proposalType === 'project' ? (
                <Input
                  label="Target Project Deadline Date"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              ) : (
                <>
                  <Input
                    label="Contract Commitment Start Date"
                    type="date"
                    value={contractStartDate}
                    onChange={(e) => setContractStartDate(e.target.value)}
                    required
                  />
                  <Select
                    label="Contract Duration Term"
                    options={[
                      { label: '1 Month Commitment', value: '1' },
                      { label: '3 Months Commitment (5% Discount)', value: '3' },
                      { label: '6 Months Commitment (10% Discount)', value: '6' },
                      { label: '12 Months Commitment (15% Discount)', value: '12' },
                    ]}
                    value={contractDurationMonths}
                    onChange={(v) => setContractDurationMonths(v)}
                  />
                </>
              )}
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--line)' }} />

          {/* SECTION 4: BRIEF & STUDIO NOTES */}
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '12px' }}>
              04. VIDEO BRIEF & STUDIO NOTES
            </span>

            <div style={{ display: 'grid', gap: '14px' }}>
              {proposalType === 'project' && (
                <Textarea
                  label="Reference Brief & Project Notes"
                  rows={2}
                  placeholder="Reference links, raw footage Drive folders, style guidelines..."
                  value={referenceBrief}
                  onChange={(e) => setReferenceBrief(e.target.value)}
                />
              )}

              <Textarea
                label="Private Studio Notes (Internal Only)"
                rows={2}
                placeholder="Internal notes visible only to agency admins..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="large" fullWidth isLoading={submitting}>
            🚀 Dispatch Official Proposal Offer to Client
          </Button>
        </form>

        {/* RIGHT COLUMN: LIVE PROPOSAL DEAL TICKET PREVIEW */}
        <div style={{ position: 'sticky', top: '90px' }}>
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
            {/* Header Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800 }}>
                DEAL TICKET PREVIEW
              </span>
              <Badge variant="gold">{proposalType === 'project' ? 'ONE-OFF PROJECT' : 'RETAINER CONTRACT'}</Badge>
            </div>

            {/* Recipient Details */}
            <div>
              <span style={{ fontSize: '11px', color: 'var(--ink-soft)', textTransform: 'uppercase', display: 'block' }}>RECIPIENT PARTNER</span>
              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--ink)' }}>
                {selectedClient ? selectedClient.name : 'Select Client...'}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                {selectedClient ? selectedClient.email : 'No client selected'}
              </span>
            </div>

            {/* Terms Summary Grid */}
            <div
              style={{
                backgroundColor: 'var(--bg)',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>Tier</span>
                <Badge variant="gold">{packageTier.toUpperCase()}</Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>Spec</span>
                <strong style={{ color: 'var(--ink)' }}>
                  {proposalType === 'project' ? editingStyle : `${contractFrequency}`}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>Format</span>
                <strong style={{ color: 'var(--ink)' }}>
                  {contentLength === 'short' ? '9:16 Short-Form' : '16:9 Long-Form'}
                </strong>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--line)', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '11px' }}>OFFER RATE</span>
                <strong className="font-mono" style={{ fontSize: '18px', color: 'var(--accent-gold)' }}>
                  {proposalType === 'project' ? `${price} ${currency}` : `${contractMonthlyPrice} ${currency} / mo`}
                </strong>
              </div>
            </div>

            {/* Notification Rails */}
            <div style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'grid', gap: '6px' }}>
              <span>• Telegram Bot Notification: <strong style={{ color: 'var(--accent-gold)' }}>Active ✓</strong></span>
              <span>• Transactional Email Offer: <strong style={{ color: 'var(--accent-gold)' }}>Active ✓</strong></span>
              <span>• Client Portal Response: <strong style={{ color: 'var(--accent-gold)' }}>Active ✓</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
