import React, { useState, useEffect } from 'react';
import { TelegramAppLayout } from '@components/layout/TelegramAppLayout';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { Skeleton } from '@components/ui/Skeleton';
import { StarRating } from '@components/ui/StarRating';
import { useToast } from '@components/ui/Toast';
import { useTelegramAuth } from '../hooks/useTelegramAuth';
import { useProjectsQuery } from '../hooks/useProjects';
import { useContractsQuery } from '../hooks/useContracts';
import { TelegramLinkScreen } from '../components/telegram/TelegramLinkScreen';
import { TelegramProjectCard } from '../components/telegram/TelegramProjectCard';
import { TelegramContractCard } from '../components/telegram/TelegramContractCard';
import { TelegramProfileView } from '../components/telegram/TelegramProfileView';
import { Project, Contract } from '../types';
import {
  triggerHaptic,
  triggerHapticNotification,
} from '../utils/telegramSdk';
import {
  IconRefreshCw,
  IconFilm,
  IconZap,
  IconStar,
  IconCheck,
} from '@icons/icons';

import { TelegramRedirectNotice } from '../components/telegram/TelegramRedirectNotice';

const checkIsTelegramEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('dev') === 'true' || urlParams.get('test') === 'true') return true;

  const tg = (window as any).Telegram?.WebApp;
  return Boolean(
    tg &&
      (tg.initData ||
        tg.initDataUnsafe?.user ||
        (window as any).TelegramWebviewProxy ||
        (tg.platform && tg.platform !== 'unknown'))
  );
};

export const TelegramMiniAppPage: React.FC = () => {
  const isTelegramEnv = checkIsTelegramEnvironment();

  if (!isTelegramEnv) {
    return <TelegramRedirectNotice />;
  }

  const { toast } = useToast();
  const {
    user,
    telegramUser,
    isAuthenticated,
    isUnlinked,
    isLoading: authLoading,
    linkAccount,
    linkAccountWithCredentials,
    unlinkAccount,
    tgFetch,
  } = useTelegramAuth();

  const { data: projects = [], refetch: refetchProjects, isLoading: projectsLoading } = useProjectsQuery();
  const { data: contracts = [], refetch: refetchContracts, isLoading: contractsLoading } = useContractsQuery();

  const [refreshing, setRefreshing] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'projects' | 'contracts' | 'profile'>('projects');

  // Deep link routing based on Telegram start_param (e.g. proposal_id or contract_id)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = (window as any).Telegram?.WebApp;
    const startParam =
      tg?.initDataUnsafe?.start_param ||
      new URLSearchParams(window.location.search).get('startapp') ||
      new URLSearchParams(window.location.search).get('tgWebAppStartParam');

    if (startParam) {
      if (startParam.startsWith('contract_')) {
        setActiveNavTab('contracts');
      } else if (startParam.startsWith('proposal_') || startParam.startsWith('delivery_') || startParam.startsWith('project_')) {
        setActiveNavTab('projects');
      }
    }
  }, []);

  // Revision Modal State
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionProject, setRevisionProject] = useState<Project | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);

  // Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingProject, setRatingProject] = useState<Project | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingReview, setRatingReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const handleManualRefresh = async () => {
    try {
      triggerHaptic('medium');
      setRefreshing(true);
      await Promise.all([refetchProjects(), refetchContracts()]);
      triggerHapticNotification('success');
      toast({ message: 'Workspace synced', type: 'success' });
    } catch (e) {
      toast({ message: 'Sync failed', type: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcceptProposal = async (project: Project) => {
    try {
      triggerHaptic('medium');
      await tgFetch(`/api/projects/${project._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'in_progress' }),
      });
      triggerHapticNotification('success');
      toast({ message: 'Proposal accepted! Project is now in production.', type: 'success' });
      refetchProjects();
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Failed to accept proposal', type: 'error' });
    }
  };

  const handleOpenRevisionModal = (project: Project) => {
    setRevisionProject(project);
    setRevisionNotes('');
    setShowRevisionModal(true);
  };

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionProject || !revisionNotes.trim()) {
      toast({ message: 'Please provide revision notes for the editor', type: 'error' });
      return;
    }

    try {
      setSubmittingRevision(true);
      triggerHaptic('medium');
      await tgFetch(`/api/projects/${revisionProject._id}/revision`, {
        method: 'POST',
        body: JSON.stringify({ notes: revisionNotes.trim() }),
      });
      triggerHapticNotification('success');
      toast({ message: 'Revision request sent to editing team!', type: 'success' });
      setShowRevisionModal(false);
      refetchProjects();
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Failed to submit revision', type: 'error' });
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleConfirmDelivery = async (project: Project) => {
    try {
      triggerHaptic('heavy');
      await tgFetch(`/api/projects/${project._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'completed' }),
      });
      triggerHapticNotification('success');
      toast({ message: 'Delivery confirmed! Project marked completed.', type: 'success' });
      refetchProjects();
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Failed to confirm delivery', type: 'error' });
    }
  };

  const handleOpenRatingModal = (project: Project) => {
    setRatingProject(project);
    setRatingStars(5);
    setRatingReview('');
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingProject || !ratingReview.trim()) {
      toast({ message: 'Please enter a short review comment', type: 'error' });
      return;
    }

    try {
      setSubmittingRating(true);
      triggerHaptic('medium');
      await tgFetch('/api/ratings', {
        method: 'POST',
        body: JSON.stringify({
          projectId: ratingProject._id,
          stars: ratingStars,
          review: ratingReview.trim(),
        }),
      });
      triggerHapticNotification('success');
      toast({ message: 'Thank you for rating your video edit!', type: 'success' });
      setShowRatingModal(false);
      refetchProjects();
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Failed to submit rating', type: 'error' });
    } finally {
      setSubmittingRating(false);
    }
  };

  if (authLoading) {
    return (
      <TelegramAppLayout>
        <div style={{ padding: '24px 0', display: 'grid', gap: '16px' }}>
          <Skeleton height="36px" width="60%" />
          <Skeleton height="140px" style={{ borderRadius: '16px' }} />
          <Skeleton height="140px" style={{ borderRadius: '16px' }} />
        </div>
      </TelegramAppLayout>
    );
  }

  if (isUnlinked || !user) {
    return (
      <TelegramAppLayout>
        <TelegramLinkScreen
          onLinkSubmit={linkAccount}
          telegramUser={telegramUser}
        />
      </TelegramAppLayout>
    );
  }

  return (
    <TelegramAppLayout activeTab={activeNavTab} onTabChange={(tab) => setActiveNavTab(tab as any)}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>
            Alpha Cut
          </h1>
          <span style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))' }}>
            {user?.name || 'Client Workspace'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={refreshing}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--tg-theme-link-color, var(--tg-link, #64b5ef))',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <IconRefreshCw size={14} />
          <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeNavTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))',
              paddingLeft: '4px',
              letterSpacing: '0.4px',
            }}
          >
            VIDEO PROJECTS ({projects.length})
          </div>

          {projectsLoading ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              <Skeleton height="120px" style={{ borderRadius: '12px' }} />
              <Skeleton height="120px" style={{ borderRadius: '12px' }} />
            </div>
          ) : projects.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color, var(--tg-secondary-bg, #232e3c))',
                padding: '32px 20px',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <IconFilm size={32} color="var(--tg-theme-hint-color, var(--tg-hint, #708499))" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 6px 0', color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>
                No Active Projects
              </h3>
              <p style={{ color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))', fontSize: '13px', margin: 0 }}>
                When your proposal offers or video edits are sent, they will appear right here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projects.map((project) => (
                <TelegramProjectCard
                  key={project._id}
                  project={project}
                  onAcceptProposal={handleAcceptProposal}
                  onRequestRevision={handleOpenRevisionModal}
                  onConfirmDelivery={handleConfirmDelivery}
                  onRateProject={handleOpenRatingModal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeNavTab === 'contracts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))',
              paddingLeft: '4px',
              letterSpacing: '0.4px',
            }}
          >
            RETAINER CONTRACTS ({contracts.length})
          </div>

          {contractsLoading ? (
            <Skeleton height="120px" style={{ borderRadius: '12px' }} />
          ) : contracts.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color, var(--tg-secondary-bg, #232e3c))',
                padding: '32px 20px',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <IconZap size={32} color="var(--tg-theme-hint-color, var(--tg-hint, #708499))" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 6px 0', color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>
                No Active Retainers
              </h3>
              <p style={{ color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))', fontSize: '13px', margin: 0 }}>
                You currently have no monthly video editing retainer contracts running.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {contracts.map((contract) => (
                <TelegramContractCard key={contract._id} contract={contract} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeNavTab === 'profile' && (
        <TelegramProfileView
          user={user}
          telegramUser={telegramUser}
          projects={projects}
          contracts={contracts}
          onUnlinkAccount={unlinkAccount}
        />
      )}

      {/* Revision Modal */}
      <Modal isOpen={showRevisionModal} onClose={() => setShowRevisionModal(false)} title="Request Edit Revision">
        <form onSubmit={handleSubmitRevision} style={{ display: 'grid', gap: '14px' }}>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
            Describe the exact timestamps and changes you want revised for <strong>{revisionProject?.editingStyle}</strong>.
          </p>
          <textarea
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            placeholder="e.g. At 0:14 change caption highlight to gold, add sound effect at 0:28..."
            rows={4}
            required
            style={{
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--line)',
              borderRadius: '10px',
              padding: '12px',
              color: 'var(--ink)',
              fontSize: '13px',
              outline: 'none',
              resize: 'vertical',
            }}
          />
          <Button variant="primary" type="submit" isLoading={submittingRevision} fullWidth>
            Submit Revision Request
          </Button>
        </form>
      </Modal>

      {/* Rating Modal */}
      <Modal isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} title="Rate Your Video Edit">
        <form onSubmit={handleSubmitRating} style={{ display: 'grid', gap: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
            How satisfied are you with the final render for <strong>{ratingProject?.editingStyle}</strong>?
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <StarRating rating={ratingStars} onChange={(stars) => setRatingStars(stars)} size={28} />
          </div>

          <textarea
            value={ratingReview}
            onChange={(e) => setRatingReview(e.target.value)}
            placeholder="Write a brief comment about the editing quality, pacing, or turnaround..."
            rows={3}
            required
            style={{
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--line)',
              borderRadius: '10px',
              padding: '12px',
              color: 'var(--ink)',
              fontSize: '13px',
              outline: 'none',
              resize: 'vertical',
            }}
          />

          <Button variant="primary" type="submit" isLoading={submittingRating} fullWidth iconRight={IconCheck}>
            Submit Review
          </Button>
        </form>
      </Modal>
    </TelegramAppLayout>
  );
};
