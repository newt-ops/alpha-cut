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
  // Proposal Form Branching State ('project' | 'contract')
  const [proposalType, setProposalType] = useState<'project' | 'contract'>('project');

  // Client Search & Selection State
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

  // Client Typeahead Search
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
        // Search error
      } finally {
        setSearchingClient(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [clientSearchText, apiFetch]);

  // Form Submit Handler
  const handleSubmitProposal = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast({ message: 'Please search and select a registered client first.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);

      if (proposalType === 'project') {
        if (!price || !deadline) {
          toast({ message: 'Please specify the project rate and deadline date.', type: 'error' });
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
          toast({ message: 'One-off Project Proposal dispatched to client!', type: 'success' });
          onSuccess();
        }
      } else {
        if (!contractStartDate || !contractMonthlyPrice) {
          toast({ message: 'Please specify the contract start date and monthly price.', type: 'error' });
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
    <div style={{ display: 'grid', gap: '32px' }} className="create-proposal-studio-container">
      {/* Top Header & Navigation Bar */}
      <div className="proposal-header">
        <div>
          <button
            type="button"
            onClick={onBack}
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--line)',
              color: 'var(--ink-soft)',
              padding: '6px 14px',
              borderRadius: '100px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Back to Operations Hub
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Badge variant="gold">PROPOSAL CREATION STUDIO</Badge>
            <h1 className="font-display proposal-title" style={{ fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
              Draft Official Client Proposal Offer
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: '4px 0 0 0' }}>
            Configure custom video editing deliverables, package tiers, pricing terms, and send live offers.
          </p>
        </div>

        {/* Currency & Type Quick Indicator */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--surface)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
          <span className="font-mono" style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 800 }}>
            STUDIO RATE: 1 USD = {exchangeRate.usdToEtb} ETB
          </span>
        </div>
      </div>

      {/* Proposal Type Selector Tabs */}
      <div className="proposal-type-grid">
        <div
          onClick={() => setProposalType('project')}
          style={{
            backgroundColor: proposalType === 'project' ? 'var(--surface)' : 'var(--bg)',
            border: `2px solid ${proposalType === 'project' ? 'var(--accent-gold)' : 'var(--line)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: proposalType === 'project' ? '0 10px 30px -10px rgba(201, 160, 107, 0.3)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
              One-off Video Project Proposal
            </h3>
            {proposalType === 'project' && <Badge variant="gold">SELECTED</Badge>}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
            Single video deliverable order with a target deadline date (e.g. Viral Animation Edit or YouTube Video).
          </p>
        </div>

        <div
          onClick={() => setProposalType('contract')}
          style={{
            backgroundColor: proposalType === 'contract' ? 'var(--surface)' : 'var(--bg)',
            border: `2px solid ${proposalType === 'contract' ? 'var(--accent-gold)' : 'var(--line)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: proposalType === 'contract' ? '0 10px 30px -10px rgba(201, 160, 107, 0.3)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
              Monthly Retainer Contract Proposal
            </h3>
            {proposalType === 'contract' && <Badge variant="gold">SELECTED</Badge>}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
            Ongoing monthly content partner commitment with fixed video delivery frequencies and recurring billing.
          </p>
        </div>
      </div>

      {/* Main Studio Grid (Form Column + Live Preview Column) */}
      <div className="proposal-main-grid">
        
        {/* LEFT COLUMN: INTERACTIVE FORM BUILDER */}
        <form onSubmit={handleSubmitProposal} style={{ display: 'grid', gap: '28px' }}>
          
          {/* STEP 1: CLIENT CRM LOOKUP */}
          <div className="proposal-step-card" style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', color: '#170B06', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>1</span>
              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Select Registered Client</h3>
            </div>

            <div>
              <Input
                label="Search Client Directory by Email or Name"
                placeholder="Type client email (e.g. client@example.com)..."
                value={clientSearchText}
                onChange={(e) => setClientSearchText(e.target.value)}
                icon={IconSearch}
              />

              {searchingClient && <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginTop: '4px' }}>Searching client database...</span>}

              {searchResults.length > 0 && (
                <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', marginTop: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                  {searchResults.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => {
                        setSelectedClient(u);
                        setClientSearchText(u.email);
                        setSearchResults([]);
                      }}
                      style={{
                        padding: '10px 14px',
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
                      <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700 }}>Select Client →</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedClient && (
                <div style={{ marginTop: '12px', padding: '16px', backgroundColor: 'rgba(201, 160, 107, 0.12)', border: '1px solid var(--accent-gold)', borderRadius: 'var(--radius-md)', display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {selectedClient.avatarUrl ? (
                        <img src={selectedClient.avatarUrl} alt={selectedClient.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-gold)' }} />
                      ) : (
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(201, 160, 107, 0.2)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '16px' }}>
                          {selectedClient.name ? selectedClient.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>Selected Client Partner</span>
                        <strong style={{ fontSize: '16px', color: 'var(--ink)', display: 'block' }}>{selectedClient.name}</strong>
                        <span style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>{selectedClient.email}</span>
                      </div>
                    </div>
                    <Badge variant="gold">PROFILE LOADED ✓</Badge>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--line)', fontSize: '11.5px' }}>
                    <span style={{ color: selectedClient.telegramChatId ? '#24A1DE' : 'var(--ink-soft)', fontWeight: 700 }}>
                      {selectedClient.telegramChatId ? '✈️ Telegram Channel Linked' : 'Telegram Not Linked'}
                    </span>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                      Account Status: Active Client
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: PACKAGE TIER & EDITING STYLE */}
          <div className="proposal-step-card" style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'grid', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', color: '#170B06', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>2</span>
              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Configure Package Tier & Style</h3>
            </div>

            {/* 3 Tier Selector Cards */}
            <div className="proposal-tier-grid">
              {[
                { id: 'basic' as const, name: 'Basic Edit Tier', desc: 'Clean, essential cutting & standard visual polish', color: '#3B82F6' },
                { id: 'professional' as const, name: 'Professional Tier', desc: 'Advanced captions, sound design & SFX (Popular)', color: '#F59E0B' },
                { id: 'premium' as const, name: 'Premium Edit Tier', desc: 'Custom animations, cinematic grading & viral hooks', color: '#10B981' },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setPackageTier(t.id)}
                  style={{
                    backgroundColor: packageTier === t.id ? 'var(--bg)' : 'transparent',
                    border: `1.5px solid ${packageTier === t.id ? t.color : 'var(--line)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: t.color, display: 'inline-block', marginBottom: '6px' }} />
                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>{t.name}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--ink-soft)', margin: '4px 0 0 0' }}>{t.desc}</p>
                </div>
              ))}
            </div>

            {/* Editing Style & Content Format Pickers */}
            <div className="proposal-two-col">
              {proposalType === 'project' && (
                <Select
                  label="Editing Style"
                  options={EDITING_STYLES.map((s) => ({ label: s.name, value: s.name }))}
                  value={editingStyle}
                  onChange={(v) => setEditingStyle(v)}
                />
              )}

              <Select
                label="Content Video Format"
                options={[
                  { label: '9:16 Vertical Short-Form (Reels, TikTok, Shorts)', value: 'short' },
                  { label: '16:9 Widescreen Long-Form (YouTube, Courses)', value: 'long' },
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

          {/* STEP 3: FINANCIAL TERMS & CURRENCY */}
          <div className="proposal-step-card" style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'grid', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', color: '#170B06', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>3</span>
              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Financial Terms & Currency</h3>
            </div>

            <div className="proposal-two-col">
              <Select
                label="Offer Currency"
                options={[
                  { label: 'Ethiopian Birr (ETB)', value: 'ETB' },
                  { label: 'United States Dollar (USD $)', value: 'USD' },
                ]}
                value={currency}
                onChange={(v) => setCurrency(v as any)}
              />

              {proposalType === 'project' ? (
                <Input
                  label={`Agreed Rate (${currency})`}
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
          </div>

          {/* STEP 4: TIMELINE, BRIEF & NOTES */}
          <div className="proposal-step-card" style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'grid', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', color: '#170B06', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>4</span>
              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Timeline & Video Brief</h3>
            </div>

            <div className={proposalType === 'contract' ? 'proposal-two-col' : ''} style={proposalType === 'project' ? { display: 'grid', gridTemplateColumns: '1fr', gap: '16px' } : undefined}>
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
                    label="Contract Term Duration"
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

            {proposalType === 'project' && (
              <Textarea
                label="Client Video Brief & References"
                rows={3}
                placeholder="Include reference links, raw footage Drive folders, style notes..."
                value={referenceBrief}
                onChange={(e) => setReferenceBrief(e.target.value)}
              />
            )}

            <Textarea
              label="Private Studio Notes (Internal Only)"
              rows={2}
              placeholder="Internal notes visible only to admins..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" size="large" fullWidth isLoading={submitting}>
            🚀 Dispatch Proposal Offer to Client
          </Button>
        </form>

        {/* RIGHT COLUMN: LIVE PROPOSAL CLIENT PREVIEW CARD */}
        <div className="proposal-preview-col">
          <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--accent-gold)', boxShadow: '0 10px 40px -10px rgba(201, 160, 107, 0.3)', display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase' }}>
                CLIENT PROPOSAL PREVIEW
              </span>
              <Badge variant="gold">{proposalType === 'project' ? 'ONE-OFF PROJECT' : 'MONTHLY RETAINER'}</Badge>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>CLIENT RECIPIENT</span>
              <h3 className="font-display" style={{ fontSize: '20px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--ink)' }}>
                {selectedClient ? selectedClient.name : 'Select a client...'}
              </h3>
              <span style={{ fontSize: '12.5px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                {selectedClient ? selectedClient.email : 'No client selected'}
              </span>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 700 }}>PACKAGE TIER</span>
                <Badge variant="gold">{packageTier.toUpperCase()}</Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 700 }}>SPECIFICATION</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                  {proposalType === 'project' ? editingStyle : `${contractFrequency} Retainer`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 700 }}>FORMAT</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                  {contentLength === 'short' ? '9:16 Vertical Short-Form' : '16:9 Widescreen Long-Form'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800 }}>OFFER RATE</span>
                <span className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  {proposalType === 'project' ? `${price} ${currency}` : `${contractMonthlyPrice} ${currency} / mo`}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'grid', gap: '6px' }}>
              <span>• Telegram Notification: <strong style={{ color: 'var(--accent-gold)' }}>Active ✓</strong></span>
              <span>• Transactional Email: <strong style={{ color: 'var(--accent-gold)' }}>Active ✓</strong></span>
              <span>• Client Portal Acceptance: <strong style={{ color: 'var(--accent-gold)' }}>Active ✓</strong></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
