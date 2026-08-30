import React, { useState, useEffect } from 'react';
import { TelegramAppLayout } from '@components/layout/TelegramAppLayout';
import { Skeleton } from '@components/ui/Skeleton';
import { useToast } from '@components/ui/Toast';
import { useTelegramAuth } from '../hooks/useTelegramAuth';
import { useProjectsQuery } from '../hooks/useProjects';
import { useContractsQuery } from '../hooks/useContracts';
import {
  TelegramLinkScreen,
  TelegramProjectCard,
  TelegramContractCard,
  TelegramProfileView,
  TelegramRedirectNotice,
  RevisionModal,
  RatingModal,
} from '@components/telegram';
import { Project } from '../types';
import { triggerHaptic, triggerHapticNotification } from '../utils/telegramSdk';
import { IconRefreshCw, IconFilm, IconZap } from '@icons/icons';

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
    isUnlinked,
    isLoading: authLoading,
    linkAccount,
    unlinkAccount,
    tgFetch,
  } = useTelegramAuth();

  const { data: projects = [], refetch: refetchProjects, isLoading: projectsLoading } = useProjectsQuery(Boolean(user));
  const { data: contracts = [], refetch: refetchContracts, isLoading: contractsLoading } = useContractsQuery(Boolean(user));

  const [refreshing, setRefreshing] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'projects' | 'contracts' | 'profile'>('projects');
  const [projectFilter, setProjectFilter] = useState<'active' | 'completed'>('active');

  // Modal States
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionProject, setRevisionProject] = useState<Project | null>(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingProject, setRatingProject] = useState<Project | null>(null);

  // Deep link routing based on Telegram start_param
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
      } else if (
        startParam.startsWith('proposal_') ||
        startParam.startsWith('delivery_') ||
        startParam.startsWith('project_')
      ) {
        setActiveNavTab('projects');
      }
    }
  }, []);

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
      await tgFetch(`/api/projects/${project._id}/accept`, {
        method: 'POST',
      });
      triggerHapticNotification('success');
      toast({ message: 'Proposal accepted! Project is in production.', type: 'success' });
      refetchProjects();
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Failed to accept proposal', type: 'error' });
    }
  };

  const handleDeclineProposal = async (project: Project) => {
    try {
      triggerHaptic('medium');
      await tgFetch(`/api/projects/${project._id}/decline`, {
        method: 'POST',
      });
      triggerHapticNotification('success');
      toast({ message: 'Proposal declined.', type: 'info' });
      refetchProjects();
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Failed to decline proposal', type: 'error' });
    }
  };

  const handleConfirmDelivery = async (project: Project) => {
    try {
      triggerHaptic('heavy');
      await tgFetch(`/api/projects/${project._id}/approve`, {
        method: 'POST',
      });
      triggerHapticNotification('success');
      toast({ message: 'Delivery confirmed! Project completed.', type: 'success' });
      refetchProjects();
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Failed to confirm delivery', type: 'error' });
    }
  };

  const handleAcceptContract = async (contract: any) => {
    try {
      triggerHaptic('medium');
      await tgFetch(`/api/contracts/${contract._id}/accept`, {
        method: 'POST',
      });
      triggerHapticNotification('success');
      toast({ message: 'Retainer proposal accepted!', type: 'success' });
      refetchContracts();
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Failed to accept retainer proposal', type: 'error' });
    }
  };

  const handleDeclineContract = async (contract: any) => {
    try {
      triggerHaptic('medium');
      await tgFetch(`/api/contracts/${contract._id}/decline`, {
        method: 'POST',
      });
      triggerHapticNotification('success');
      toast({ message: 'Retainer proposal declined.', type: 'info' });
      refetchContracts();
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Failed to decline retainer proposal', type: 'error' });
    }
  };

  const handleSubmitRevisionNotes = async (notes: string) => {
    if (!revisionProject) return;
    try {
      await tgFetch(`/api/projects/${revisionProject._id}/revision`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });
      triggerHapticNotification('success');
      toast({ message: 'Revision request sent to editor!', type: 'success' });
      refetchProjects();
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Failed to submit revision', type: 'error' });
      throw err;
    }
  };

  const handleSubmitRatingReview = async (stars: number, review: string) => {
    if (!ratingProject) return;
    try {
      await tgFetch('/api/ratings', {
        method: 'POST',
        body: JSON.stringify({
          projectId: ratingProject._id,
          stars,
          review,
        }),
      });
      triggerHapticNotification('success');
      toast({ message: 'Rating submitted! Thank you.', type: 'success' });
      setShowRatingModal(false);
      setRatingProject(null);
      refetchProjects();
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Failed to submit rating', type: 'error' });
      throw err;
    }
  };

  if (authLoading) {
    return (
      <TelegramAppLayout>
        <div style={{ padding: '24px 0', display: 'grid', gap: '16px' }}>
          <Skeleton height="36px" width="60%" />
          <Skeleton height="140px" style={{ borderRadius: '12px' }} />
          <Skeleton height="140px" style={{ borderRadius: '12px' }} />
        </div>
      </TelegramAppLayout>
    );
  }

  if (isUnlinked || !user) {
    return (
      <TelegramAppLayout>
        <TelegramLinkScreen onLinkSubmit={linkAccount} telegramUser={telegramUser} />
      </TelegramAppLayout>
    );
  }

  return (
    <TelegramAppLayout activeTab={activeNavTab} onTabChange={(tab) => setActiveNavTab(tab as any)}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--tg-theme-text-color, #ffffff)' }}>
            Alpha Cut
          </h1>
          <span style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color, #708499)' }}>
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
            color: 'var(--tg-theme-link-color, #64b5ef)',
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

      {/* Tab Content: Projects */}
      {activeNavTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* iOS / Telegram Segmented Control */}
          <div
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color, #232e3c)',
              borderRadius: '10px',
              padding: '3px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                triggerHapticSelection();
                setProjectFilter('active');
              }}
              style={{
                height: '34px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: projectFilter === 'active' ? 'var(--tg-theme-button-color, #5288c1)' : 'transparent',
                color: projectFilter === 'active' ? 'var(--tg-theme-button-text-color, #ffffff)' : 'var(--tg-theme-hint-color, #708499)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Active ({projects.filter((p) => p.status !== 'completed' && p.status !== 'declined').length})
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHapticSelection();
                setProjectFilter('completed');
              }}
              style={{
                height: '34px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: projectFilter === 'completed' ? 'var(--tg-theme-button-color, #5288c1)' : 'transparent',
                color: projectFilter === 'completed' ? 'var(--tg-theme-button-text-color, #ffffff)' : 'var(--tg-theme-hint-color, #708499)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Completed ({projects.filter((p) => p.status === 'completed' || p.status === 'declined').length})
            </button>
          </div>

          {projectsLoading ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              <Skeleton height="120px" style={{ borderRadius: '12px' }} />
              <Skeleton height="120px" style={{ borderRadius: '12px' }} />
            </div>
          ) : (() => {
            const displayedProjects = projects.filter((p) => {
              if (projectFilter === 'active') return p.status !== 'completed' && p.status !== 'declined';
              return p.status === 'completed' || p.status === 'declined';
            });

            if (displayedProjects.length === 0) {
              return (
                <div
                  style={{
                    backgroundColor: 'var(--tg-theme-secondary-bg-color, #232e3c)',
                    padding: '32px 20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                  }}
                >
                  <IconFilm size={32} color="var(--tg-theme-hint-color, #708499)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 6px 0', color: 'var(--tg-theme-text-color, #ffffff)' }}>
                    {projectFilter === 'active' ? 'No Active Projects' : 'No Completed Projects'}
                  </h3>
                  <p style={{ color: 'var(--tg-theme-hint-color, #708499)', fontSize: '13px', margin: 0 }}>
                    {projectFilter === 'active'
                      ? 'When your proposal offers or video edits are in progress, they will appear here.'
                      : 'Completed video edits and past orders will be archived here.'}
                  </p>
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {displayedProjects.map((project) => (
                  <TelegramProjectCard
                    key={project._id}
                    project={project}
                    onAcceptProposal={handleAcceptProposal}
                    onDeclineProposal={handleDeclineProposal}
                    onRequestRevision={(p) => {
                      setRevisionProject(p);
                      setShowRevisionModal(true);
                    }}
                    onConfirmDelivery={handleConfirmDelivery}
                    onRateProject={(p) => {
                      setRatingProject(p);
                      setShowRatingModal(true);
                    }}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab Content: Retainers */}
      {activeNavTab === 'contracts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--tg-theme-hint-color, #708499)',
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
                backgroundColor: 'var(--tg-theme-secondary-bg-color, #232e3c)',
                padding: '32px 20px',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <IconZap size={32} color="var(--tg-theme-hint-color, #708499)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 6px 0', color: 'var(--tg-theme-text-color, #ffffff)' }}>
                No Active Retainers
              </h3>
              <p style={{ color: 'var(--tg-theme-hint-color, #708499)', fontSize: '13px', margin: 0 }}>
                You currently have no monthly video editing retainer contracts running.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {contracts.map((contract) => (
                <TelegramContractCard
                  key={contract._id}
                  contract={contract}
                  onAcceptContract={handleAcceptContract}
                  onDeclineContract={handleDeclineContract}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Account & Profile */}
      {activeNavTab === 'profile' && (
        <TelegramProfileView
          user={user}
          telegramUser={telegramUser}
          projects={projects}
          contracts={contracts}
          onUnlinkAccount={unlinkAccount}
        />
      )}

      {/* Modals */}
      <RevisionModal
        isOpen={showRevisionModal}
        onClose={() => setShowRevisionModal(false)}
        project={revisionProject}
        onSubmit={handleSubmitRevisionNotes}
      />

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        project={ratingProject}
        onSubmit={handleSubmitRatingReview}
      />
    </TelegramAppLayout>
  );
};
