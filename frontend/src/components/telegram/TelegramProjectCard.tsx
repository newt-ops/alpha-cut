import React, { useState } from 'react';
import { Project } from '../../types';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { triggerHaptic, triggerHapticSelection } from '../../utils/telegramSdk';
import { IconCheck, IconZap, IconStar, IconFileText, IconClock, IconFilm } from '@icons/icons';

interface TelegramProjectCardProps {
  project: Project;
  onAcceptProposal?: (project: Project) => void;
  onRequestRevision?: (project: Project) => void;
  onConfirmDelivery?: (project: Project) => void;
  onRateProject?: (project: Project) => void;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'proposal_sent':
      return 'gold';
    case 'in_progress':
      return 'info';
    case 'delivered':
      return 'warning';
    case 'revision_requested':
      return 'warning';
    case 'completed':
      return 'success';
    default:
      return 'neutral';
  }
};

const formatStatusText = (status: string) => {
  switch (status) {
    case 'proposal_sent':
      return 'PROPOSAL OFFER';
    case 'in_progress':
      return 'IN PRODUCTION';
    case 'delivered':
      return 'DELIVERED (READY)';
    case 'revision_requested':
      return 'REVISION IN PROGRESS';
    case 'completed':
      return 'COMPLETED';
    default:
      return status.replace(/_/g, ' ').toUpperCase();
  }
};

export const TelegramProjectCard: React.FC<TelegramProjectCardProps> = ({
  project,
  onAcceptProposal,
  onRequestRevision,
  onConfirmDelivery,
  onRateProject,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    triggerHapticSelection();
    setExpanded(!expanded);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '16px',
        border: '1px solid var(--line)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header Row: Style & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <IconFilm size={15} color="var(--accent-gold)" />
            <h3 className="font-display" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
              {project.editingStyle}
            </h3>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {project.packageTier || 'STANDARD'} • {project.contentLength || 'SHORT-FORM'}
          </span>
        </div>
        <Badge variant={getStatusBadgeVariant(project.status) as any} size="small">
          {formatStatusText(project.status)}
        </Badge>
      </div>

      {/* Info Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          padding: '10px 12px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div>
          <span style={{ fontSize: '10px', color: 'var(--ink-soft)', display: 'block', textTransform: 'uppercase' }}>RATE</span>
          <strong style={{ fontSize: '14px', color: 'var(--accent-gold)' }}>
            {project.price} {project.currency}
          </strong>
        </div>
        <div>
          <span style={{ fontSize: '10px', color: 'var(--ink-soft)', display: 'block', textTransform: 'uppercase' }}>DEADLINE</span>
          <span style={{ fontSize: '13px', color: 'var(--ink)' }}>
            {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Deliverable Link if available */}
      {project.deliverableUrl && (
        <div style={{ padding: '8px 12px', backgroundColor: 'rgba(36, 161, 222, 0.08)', borderRadius: '10px', border: '1px solid rgba(36, 161, 222, 0.2)' }}>
          <span style={{ fontSize: '11px', color: '#24A1DE', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            🎬 DELIVERABLE LINK READY
          </span>
          <a
            href={project.deliverableUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '12px', color: 'var(--ink)', textDecoration: 'underline', wordBreak: 'break-all' }}
            onClick={() => triggerHaptic('light')}
          >
            {project.deliverableUrl}
          </a>
        </div>
      )}

      {/* Expandable Brief / Notes */}
      {project.referenceBrief && (
        <div>
          <button
            type="button"
            onClick={toggleExpand}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-gold)',
              fontSize: '12px',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <IconFileText size={13} />
            {expanded ? 'Hide Brief Notes' : 'View Reference Brief'}
          </button>
          {expanded && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--ink-soft)',
                lineHeight: 1.5,
                marginTop: '6px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '8px 10px',
                borderRadius: '8px',
              }}
            >
              {project.referenceBrief}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons based on status */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        {project.status === 'proposal_sent' && onAcceptProposal && (
          <Button
            variant="telegram"
            size="small"
            fullWidth
            onClick={() => {
              triggerHaptic('medium');
              onAcceptProposal(project);
            }}
          >
            Accept Proposal ({project.price} {project.currency})
          </Button>
        )}

        {project.status === 'delivered' && (
          <>
            {onRequestRevision && (
              <Button
                variant="secondary"
                size="small"
                style={{ flex: 1 }}
                onClick={() => {
                  triggerHaptic('light');
                  onRequestRevision(project);
                }}
              >
                Request Revision
              </Button>
            )}
            {onConfirmDelivery && (
              <Button
                variant="telegram"
                size="small"
                style={{ flex: 1 }}
                iconRight={IconCheck}
                onClick={() => {
                  triggerHaptic('heavy');
                  onConfirmDelivery(project);
                }}
              >
                Approve & Complete
              </Button>
            )}
          </>
        )}

        {project.status === 'completed' && onRateProject && (
          <Button
            variant="secondary"
            size="small"
            fullWidth
            iconRight={IconStar}
            onClick={() => {
              triggerHaptic('medium');
              onRateProject(project);
            }}
          >
            Submit Review
          </Button>
        )}
      </div>
    </div>
  );
};
