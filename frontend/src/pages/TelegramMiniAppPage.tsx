import React, { useState, useEffect, useCallback } from 'react';
import { TelegramAppLayout, TELEGRAM_BLUE } from '@components/layout/TelegramAppLayout';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { Input } from '@components/ui/Input';
import { customFetch } from '../utils/api';
import { useToast } from '@components/ui/Toast';
import {
  triggerHaptic,
  triggerHapticNotification,
  showTelegramConfirm,
} from '../utils/telegramSdk';
import { StarRating } from '@components/ui/StarRating';
import { useProjectsQuery } from '../hooks/useProjects';
import { useContractsQuery } from '../hooks/useContracts';
import { Project, Contract } from '../types';
import {
  IconCheck,
  IconExternalLink,
  IconShield,
  IconUser,
  IconFileText,
  IconZap,
  IconSliders,
  IconClock,
  IconFilm,
  IconStar,
  IconRefreshCw,
  IconPlay,
} from '@icons/icons';

export const TelegramMiniAppPage: React.FC = () => {
  const { toast } = useToast();
  const { data: projects = [], refetch: refetchProjects } = useProjectsQuery();
  const { data: contracts = [], refetch: refetchContracts } = useContractsQuery();

  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  // Active Bottom Navigation Tab: 'work' | 'profile'
  const [activeNavTab, setActiveNavTab] = useState<'work' | 'profile'>('work');

  // Deep Link Target Item State
  const [targetItem, setTargetItem] = useState<Project | Contract | null>(null);
  const [targetType, setTargetType] = useState<string>('summary');

  // Account Linking Form State
  const [linkCode, setLinkCode] = useState('');
  const [submittingLink, setSubmittingLink] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Revision Modal State
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionProject, setRevisionProject] = useState<Project | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  // Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingProject, setRatingProject] = useState<Project | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingReview, setRatingReview] = useState('');

  const parseStartParam = (startParam: string | null, fetchedProjects: Project[], fetchedContracts: Contract[]) => {
    if (!startParam) return;

    if (startParam.startsWith('proposal_') || startParam.startsWith('delivery_')) {
      const projId = startParam.replace('proposal_', '').replace('delivery_', '');
      const foundProj = fetchedProjects.find((p) => p._id === projId);
      if (foundProj) {
        setTargetItem(foundProj);
        setTargetType(startParam.startsWith('delivery_') ? 'delivery' : 'proposal');
      }
    } else if (startParam.startsWith('contract_')) {
      const contractId = startParam.replace('contract_', '');
      const foundContract = fetchedContracts.find((c) => c._id === contractId);
      if (foundContract) {
        setTargetItem(foundContract);
        setTargetType('contract');
      }
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const meRes = await customFetch('/api/auth/me').catch(() => ({ success: false }));
        if (meRes.success && meRes.user) {
          setUser(meRes.user);
          setIsAuthenticated(true);
        }
      } catch (e) {}
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setTelegramUser(tg.initDataUnsafe.user);
    }
    const startParam = tg?.initDataUnsafe?.start_param || new URLSearchParams(window.location.search).get('startapp');
    parseStartParam(startParam, projects, contracts);
  }, [projects, contracts]);

  const handleManualRefresh = async () => {
    try {
      triggerHaptic('medium');
      setRefreshing(true);
      await Promise.all([refetchProjects(), refetchContracts()]);
      triggerHapticNotification('success');
      toast({ message: 'Workspace refreshed', type: 'success' });
    } catch (e) {
      toast({ message: 'Refresh failed', type: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkCode.trim()) {
      toast({ message: 'Please enter a valid link code', type: 'error' });
      return;
    }

    try {
      setSubmittingLink(true);
      triggerHaptic('medium');
      const res = await customFetch('/api/auth/telegram/link-code', {
        method: 'POST',
        body: JSON.stringify({ code: linkCode.trim().toUpperCase() }),
      });

      if (res.success) {
        triggerHapticNotification('success');
        toast({ message: 'Account linked successfully!', type: 'success' });
        window.location.reload();
      }
    } catch (err: any) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Account linking failed', type: 'error' });
    } finally {
      setSubmittingLink(false);
    }
  };

  return (
    <TelegramAppLayout activeTab={activeNavTab} onTabChange={(tab) => setActiveNavTab(tab as any)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <Badge variant="gold" size="small">MINI APP WORKSPACE</Badge>
          <h1 className="font-display" style={{ fontSize: '24px', marginTop: '4px', color: 'var(--ink)' }}>
            Alpha Cut Client
          </h1>
        </div>
        <Button variant="secondary" size="small" isLoading={refreshing} onClick={handleManualRefresh} iconRight={IconRefreshCw}>
          Sync
        </Button>
      </div>

      {!user ? (
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h3 className="font-display" style={{ fontSize: '18px', marginBottom: '8px' }}>Link Your Account</h3>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '16px' }}>
            Enter your 6-digit link code generated from your web account dashboard.
          </p>
          <form onSubmit={handleLinkAccount} style={{ display: 'grid', gap: '12px' }}>
            <Input
              placeholder="e.g. AC-9821"
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value)}
              required
            />
            <Button variant="primary" type="submit" isLoading={submittingLink} fullWidth>
              Link Telegram Account
            </Button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-gold)' }} />
              ) : (
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(201,160,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: 800 }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                </div>
              )}
              <div>
                <span style={{ fontSize: '15px', fontWeight: 700, display: 'block', color: 'var(--ink)' }}>{user.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>{user.email}</span>
              </div>
            </div>
          </div>

          <h2 className="font-display" style={{ fontSize: '18px', color: 'var(--ink)' }}>Active Retainer Contracts & Proposals</h2>

          {projects.length === 0 && contracts.length === 0 ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--line)' }}>
              <p style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>No active proposals or retainer contracts found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {projects.map((p) => (
                <div key={p._id} style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 className="font-display" style={{ fontSize: '16px' }}>{p.editingStyle}</h3>
                    <Badge variant={p.status === 'completed' ? 'success' : 'gold'} size="small">
                      {p.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                    Price: <strong>{p.price} {p.currency}</strong> • Deadline: {new Date(p.deadline).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </TelegramAppLayout>
  );
};
