import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input, Textarea } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { Modal } from '@components/ui/Modal';
import { Tabs } from '@components/ui/Tabs';
import { DatePicker } from '@components/ui/DatePicker';
import { Dropzone } from '@components/ui/Dropzone';
import { StarRating } from '@components/ui/StarRating';
import { EDITING_STYLES } from '../data/editingStyles';
import { useToast } from '@components/ui/Toast';
import { customFetch } from '../utils/api';
import { IconCheck, IconSearch, IconUser, IconDollar, IconShield, IconSparkles, IconUpload, IconExternalLink } from '@icons/icons';

export const AdminPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats State
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Proposal Form State
  const [clientSearchText, setClientSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingStyle, setEditingStyle] = useState(EDITING_STYLES[0].name);
  const [contentLength, setContentLength] = useState('short');
  const [packageTier, setPackageTier] = useState('premium');
  const [currency, setCurrency] = useState('ETB');
  const [price, setPrice] = useState('450');
  const [referenceBrief, setReferenceBrief] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Mark Delivered Modal State
  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [selectedProjectForDeliver, setSelectedProjectForDeliver] = useState(null);
  const [deliverableUrl, setDeliverableUrl] = useState('');

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, projRes, ratRes] = await Promise.all([
        customFetch('/api/admin/stats'),
        customFetch('/api/admin/projects'),
        customFetch('/api/ratings'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (projRes.success) setProjects(projRes.projects);
      if (ratRes.success) setRatings(ratRes.ratings);
    } catch (err) {
      toast({ message: 'Failed to load admin panel data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Client Typeahead Search
  useEffect(() => {
    if (!clientSearchText || clientSearchText.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await customFetch(`/api/admin/users/search?email=${encodeURIComponent(clientSearchText)}`);
        if (res.success) setSearchResults(res.users);
      } catch (err) {
        // Search error
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [clientSearchText]);

  // Submit Proposal
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
      const res = await customFetch('/api/admin/projects', {
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
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmittingProposal(false);
    }
  };

  // Mark Delivered
  const handleMarkDelivered = async () => {
    if (!selectedProjectForDeliver || !deliverableUrl) {
      toast({ message: 'Please enter a valid deliverable URL.', type: 'error' });
      return;
    }
    try {
      const res = await customFetch(`/api/admin/projects/${selectedProjectForDeliver._id}/deliver`, {
        method: 'POST',
        body: JSON.stringify({ deliverableUrl }),
      });

      if (res.success) {
        toast({ message: 'Work marked as delivered! Client notified.', type: 'success' });
        setDeliverModalOpen(false);
        setDeliverableUrl('');
        fetchAdminData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    }
  };

  // Toggle Hide Rating
  const handleToggleHideRating = async (ratingId) => {
    try {
      const res = await customFetch(`/api/ratings/${ratingId}/hide`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Rating visibility updated.', type: 'info' });
        fetchAdminData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    }
  };

  const adminTabs = [
    { id: 'overview', label: 'Admin Dashboard' },
    { id: 'proposal', label: '+ New Proposal' },
    { id: 'board', label: 'Project Board' },
    { id: 'moderation', label: 'Ratings Moderation' },
  ];

  return (
    <div style={{ padding: '20px 0 60px 0' }} className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Badge variant="maroon">Agency Control Panel</Badge>
          <h1 className="font-display" style={{ fontSize: '32px', marginTop: '8px' }}>
            Alpha Cut Admin Workspace
          </h1>
        </div>
        <Tabs tabs={adminTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Revenue Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>REVENUE (ETB)</span>
              <h3 className="font-display" style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--ink)' }}>
                {stats?.revenueETB?.toLocaleString() || 0} ETB
              </h3>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>REVENUE (USD)</span>
              <h3 className="font-display" style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--ink)' }}>
                ${stats?.revenueUSD?.toLocaleString() || 0} USD
              </h3>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>REGISTERED CLIENTS</span>
              <h3 className="font-display" style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--ink)' }}>
                {stats?.clientCount || 0}
              </h3>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>AVERAGE RATING</span>
              <h3 className="font-display" style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--ink)' }}>
                {stats?.avgRating || '5.0'} ★
              </h3>
            </div>
          </div>

          {/* Project Status Breakdown */}
          <div style={{ backgroundColor: 'var(--surface)', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
            <h3 className="font-display" style={{ fontSize: '20px', marginBottom: '16px' }}>Project Status Breakdown</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Badge variant="gold">Proposals Sent: {stats?.statusCounts?.proposal_sent || 0}</Badge>
              <Badge variant="maroon">In Progress: {stats?.statusCounts?.in_progress || 0}</Badge>
              <Badge variant="surface">Work Delivered: {stats?.statusCounts?.delivered || 0}</Badge>
              <Badge variant="success">Completed: {stats?.statusCounts?.completed || 0}</Badge>
            </div>
          </div>
        </div>
      )}

      {/* NEW PROPOSAL FORM TAB */}
      {activeTab === 'proposal' && (
        <div style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: 'var(--surface)', padding: '36px 30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h2 className="font-display" style={{ fontSize: '24px', marginBottom: '20px' }}>Create New Client Proposal</h2>

          <form onSubmit={handleCreateProposal}>
            {/* Registered Client Email Typeahead Search */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Input
                label="Client Registered Email (Required)"
                placeholder="Search registered client email..."
                value={clientSearchText}
                onChange={(e) => {
                  setClientSearchText(e.target.value);
                  setSelectedClient(null);
                }}
                icon={IconSearch}
                required
              />

              {/* Typeahead Results */}
              {searchResults.length > 0 && !selectedClient && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', maxHeight: '180px', overflowY: 'auto' }}>
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => {
                        setSelectedClient(user);
                        setClientSearchText(user.email);
                        setSearchResults([]);
                      }}
                      style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--line)', fontSize: '14px' }}
                    >
                      <strong>{user.name}</strong> ({user.email})
                    </div>
                  ))}
                </div>
              )}

              {selectedClient && (
                <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                  Selected Client: {selectedClient.name} ({selectedClient.email})
                </div>
              )}
            </div>

            <Select
              label="Editing Style"
              options={EDITING_STYLES.map((s) => ({ label: s.name, value: s.name }))}
              value={editingStyle}
              onChange={setEditingStyle}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <Select
                label="Content Length"
                options={[{ label: 'Short-Form (9:16)', value: 'short' }, { label: 'Long-Form (16:9)', value: 'long' }]}
                value={contentLength}
                onChange={setContentLength}
              />
              <Select
                label="Package Tier"
                options={[{ label: 'Basic Tier', value: 'basic' }, { label: 'Premium Tier', value: 'premium' }]}
                value={packageTier}
                onChange={setPackageTier}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
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

            <Textarea
              label="Reference / Brief Notes"
              placeholder="Paste raw video link or instructions..."
              value={referenceBrief}
              onChange={(e) => setReferenceBrief(e.target.value)}
            />

            <div style={{ marginTop: '24px' }}>
              <Button type="submit" variant="primary" fullWidth isLoading={submittingProposal} iconRight={IconSparkles}>
                Send Proposal to Client
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* PROJECT BOARD TAB */}
      {activeTab === 'board' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <h2 className="font-display" style={{ fontSize: '24px' }}>All Client Projects</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {projects.map((proj) => (
              <div key={proj._id} style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Badge variant={proj.status === 'completed' ? 'success' : 'gold'}>{proj.status.toUpperCase()}</Badge>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)' }}>{proj.price} {proj.currency}</span>
                </div>
                <h3 className="font-display" style={{ fontSize: '18px' }}>{proj.editingStyle}</h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>Client: {proj.clientName} ({proj.clientEmail})</p>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                  {proj.status === 'in_progress' && (
                    <Button
                      variant="primary"
                      fullWidth
                      iconRight={IconUpload}
                      onClick={() => {
                        setSelectedProjectForDeliver(proj);
                        setDeliverModalOpen(true);
                      }}
                    >
                      Mark Work Delivered
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RATINGS MODERATION TAB */}
      {activeTab === 'moderation' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <h2 className="font-display" style={{ fontSize: '24px' }}>Client Reviews & Moderation</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {ratings.map((r) => (
              <div key={r._id} style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <StarRating rating={r.stars} size={16} />
                  <p style={{ fontSize: '14px', marginTop: '6px', fontStyle: 'italic' }}>"{r.review}"</p>
                  <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>— {r.clientName} ({r.editingStyle})</span>
                </div>
                <Button variant="secondary" size="small" onClick={() => handleToggleHideRating(r._id)}>
                  {r.hidden ? 'Unhide' : 'Hide'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mark Delivered Modal */}
      <Modal isOpen={deliverModalOpen} onClose={() => setDeliverModalOpen(false)} title="Attach Deliverable & Deliver">
        <Input
          label="Deliverable Video / Cloudinary Link"
          placeholder="https://cloudinary.com/v12345/video.mp4"
          value={deliverableUrl}
          onChange={(e) => setDeliverableUrl(e.target.value)}
          required
        />
        <div style={{ marginTop: '20px' }}>
          <Dropzone label="Upload deliverable video file directly" />
        </div>
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setDeliverModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleMarkDelivered}>Confirm Delivery</Button>
        </div>
      </Modal>
    </div>
  );
};
