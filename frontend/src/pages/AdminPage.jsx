import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@components/layout/AdminLayout';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input, Textarea } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { Modal } from '@components/ui/Modal';
import { DatePicker } from '@components/ui/DatePicker';
import { StarRating } from '@components/ui/StarRating';
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
} from '@icons/icons';

export const AdminPage = () => {
  const { apiFetch } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & Data State
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

  // Detail Modal State
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, projRes, ratRes] = await Promise.all([
        apiFetch('/api/admin/stats'),
        apiFetch('/api/admin/projects'),
        apiFetch('/api/ratings'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (projRes.success) setProjects(projRes.projects);
      if (ratRes.success) setRatings(ratRes.ratings);
    } catch (err) {
      toast({ message: 'Failed to load admin panel data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [apiFetch, toast]);

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
        const res = await apiFetch(`/api/admin/users/search?email=${encodeURIComponent(clientSearchText)}`);
        if (res.success) setSearchResults(res.users);
      } catch (err) {
        // Search error
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [clientSearchText, apiFetch]);

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

  // Mark Delivered (Pure Progress Tracking - No Deliverable URL required)
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

  // Toggle Feature Rating (Featured on Home Page)
  const handleToggleFeatureRating = async (ratingId) => {
    try {
      const res = await apiFetch(`/api/ratings/${ratingId}/feature`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Rating featured status updated.', type: 'success' });
        fetchAdminData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'proposal_sent': return 'gold';
      case 'in_progress': return 'maroon';
      case 'delivered': return 'surface';
      case 'completed': return 'success';
      case 'declined': return 'maroon';
      default: return 'surface';
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onChangeTab={setActiveTab}>
      {/* OVERVIEW / ANALYTICS TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Revenue Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>DELIVERED REVENUE (ETB)</span>
              <h3 className="font-display" style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--ink)' }}>
                {stats?.revenueETB?.toLocaleString() || 0} ETB
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>Booked from delivered & completed edits</p>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>DELIVERED REVENUE (USD)</span>
              <h3 className="font-display" style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--ink)' }}>
                ${stats?.revenueUSD?.toLocaleString() || 0} USD
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>Booked from delivered & completed edits</p>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>REGISTERED CLIENTS</span>
              <h3 className="font-display" style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--ink)' }}>
                {stats?.clientCount || 0}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>Total client user accounts</p>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>PROPOSAL ACCEPTANCE RATE</span>
              <h3 className="font-display" style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: 'var(--ink)' }}>
                {stats?.conversionRate || '0%'}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>Accepted vs total proposals sent</p>
            </div>
          </div>

          {/* Project Status Breakdown */}
          <div style={{ backgroundColor: 'var(--surface)', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
            <h3 className="font-display" style={{ fontSize: '20px', marginBottom: '16px' }}>Project Lifecycle Status Breakdown</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Badge variant="gold">Proposals Sent: {stats?.statusCounts?.proposal_sent || 0}</Badge>
              <Badge variant="maroon">In Progress: {stats?.statusCounts?.in_progress || 0}</Badge>
              <Badge variant="surface">Work Delivered: {stats?.statusCounts?.delivered || 0}</Badge>
              <Badge variant="success">Completed & Approved: {stats?.statusCounts?.completed || 0}</Badge>
              <Badge variant="maroon">Declined: {stats?.statusCounts?.declined || 0}</Badge>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROPOSAL FORM TAB */}
      {activeTab === 'proposal' && (
        <div style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: 'var(--surface)', padding: '36px 30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h2 className="font-display" style={{ fontSize: '24px', marginBottom: '20px' }}>Issue New Client Proposal</h2>

          <form onSubmit={handleCreateProposal}>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Input
                label="Registered Client Email (Required)"
                placeholder="Search registered client email..."
                value={clientSearchText}
                onChange={(e) => {
                  setClientSearchText(e.target.value);
                  setSelectedClient(null);
                }}
                icon={IconSearch}
                required
              />

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
              label="Reference / Brief Notes (External Drive / Instructions)"
              placeholder="Enter external Google Drive or project brief notes..."
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

      {/* PROJECT BOARD TAB WITH DETAIL VIEW MODAL */}
      {activeTab === 'board' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="font-display" style={{ fontSize: '24px' }}>All Client Projects & Proposals</h2>
            <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Click any card to inspect full details</span>
          </div>

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

                <h3 className="font-display" style={{ fontSize: '18px', marginBottom: '4px' }}>
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
        </div>
      )}

      {/* RATINGS & MODERATION TAB */}
      {activeTab === 'moderation' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <h2 className="font-display" style={{ fontSize: '24px' }}>Client Reviews & Moderation</h2>
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
                  <p style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '4px' }}>"{r.review}"</p>
                  <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>— {r.clientName} ({r.editingStyle})</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="secondary" size="small" onClick={() => handleToggleFeatureRating(r._id)}>
                    {r.featured ? 'Unfeature' : 'Mark Featured'}
                  </Button>
                  <Button variant="secondary" size="small" onClick={() => handleToggleHideRating(r._id)}>
                    {r.hidden ? 'Unhide' : 'Hide Review'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REGISTERED CLIENTS TAB */}
      {activeTab === 'clients' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <h2 className="font-display" style={{ fontSize: '24px' }}>Registered Clients Overview</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>
            Use the search box in "Create Proposal" to find client emails when issuing proposals. Total Registered Clients: {stats?.clientCount || 0}.
          </p>
        </div>
      )}

      {/* PACKAGE SETTINGS TAB */}
      {activeTab === 'pricing' && (
        <div style={{ maxWidth: '600px', backgroundColor: 'var(--surface)', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h2 className="font-display" style={{ fontSize: '24px', marginBottom: '12px' }}>Agency Package Pricing Configurations</h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
            Base pricing tiers: Basic Short-Form (350 - 400 ETB), Premium Short-Form (450 - 500 ETB). Long-form & USD rates custom configured per proposal.
          </p>
        </div>
      )}

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
