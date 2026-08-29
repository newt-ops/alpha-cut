import React, { useState } from 'react';
import { Project } from '../../types';
import { triggerHaptic, triggerHapticSelection } from '../../utils/telegramSdk';
import { IconCheck, IconStar, IconFileText, IconFilm, IconChevronRight } from '@icons/icons';

interface TelegramProjectCardProps {
  project: Project;
  onAcceptProposal?: (project: Project) => void;
  onRequestRevision?: (project: Project) => void;
  onConfirmDelivery?: (project: Project) => void;
  onRateProject?: (project: Project) => void;
}

const formatStatusText = (status: string) => {
  switch (status) {
    case 'proposal_sent':
      return 'Proposal Offered';
    case 'in_progress':
      return 'In Production';
    case 'delivered':
      return 'Ready for Review';
    case 'revision_requested':
      return 'Revision in Progress';
    case 'completed':
      return 'Completed';
    default:
      return status.replace(/_/g, ' ');
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

  const isProposal = project.status === 'proposal_sent';
  const isDelivered = project.status === 'delivered';
  const isCompleted = project.status === 'completed';

  return (
    <div
      style={{
        backgroundColor: 'var(--tg-theme-secondary-bg-color, var(--tg-secondary-bg, #232e3c))',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Row: Project Style & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconFilm size={18} color="var(--tg-theme-link-color, var(--tg-link, #64b5ef))" />
          <div>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {project.editingStyle}
            </h3>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))',
              }}
            >
              {project.packageTier || 'Standard'} • {project.contentLength || 'Short-Form'}
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: isProposal
              ? 'var(--tg-theme-link-color, var(--tg-link, #64b5ef))'
              : isDelivered
              ? 'var(--tg-theme-button-color, var(--tg-button, #5288c1))'
              : isCompleted
              ? '#34c759'
              : 'var(--tg-theme-hint-color, var(--tg-hint, #708499))',
            backgroundColor: 'rgba(120, 120, 128, 0.12)',
            padding: '3px 8px',
            borderRadius: '6px',
          }}
        >
          {formatStatusText(project.status)}
        </span>
      </div>

      <div style={{ height: '1px', backgroundColor: 'rgba(120, 120, 128, 0.15)' }} />

      {/* Grid Specs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
        <div>
          <span style={{ color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))', fontSize: '11px', display: 'block' }}>
            Rate
          </span>
          <strong style={{ color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>
            {project.price} {project.currency}
          </strong>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))', fontSize: '11px', display: 'block' }}>
            Deadline
          </span>
          <span style={{ color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))' }}>
            {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Deliverable URL if present */}
      {project.deliverableUrl && (
        <div style={{ marginTop: '2px' }}>
          <a
            href={project.deliverableUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic('light')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--tg-theme-link-color, var(--tg-link, #64b5ef))',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              wordBreak: 'break-all',
            }}
          >
            <span>Open Deliverable Video</span>
            <IconChevronRight size={14} />
          </a>
        </div>
      )}

      {/* Brief Notes Accordion */}
      {project.referenceBrief && (
        <div>
          <button
            type="button"
            onClick={toggleExpand}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '2px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <IconFileText size={13} />
            <span>{expanded ? 'Hide Brief' : 'View Reference Brief'}</span>
          </button>
          {expanded && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--tg-theme-hint-color, var(--tg-hint, #708499))',
                lineHeight: 1.4,
                marginTop: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                padding: '8px 10px',
                borderRadius: '8px',
                margin: '4px 0 0 0',
              }}
            >
              {project.referenceBrief}
            </p>
          )}
        </div>
      )}

      {/* Native Telegram Action Buttons */}
      {(isProposal || isDelivered || (isCompleted && onRateProject)) && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          {isProposal && onAcceptProposal && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onAcceptProposal(project);
              }}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--tg-theme-button-color, var(--tg-button, #5288c1))',
                color: 'var(--tg-theme-button-text-color, var(--tg-button-text, #ffffff))',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Accept Proposal ({project.price} {project.currency})
            </button>
          )}

          {isDelivered && (
            <>
              {onRequestRevision && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onRequestRevision(project);
                  }}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '10px',
                    border: '1px solid rgba(120, 120, 128, 0.2)',
                    backgroundColor: 'transparent',
                    color: 'var(--tg-theme-text-color, var(--tg-text, #ffffff))',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Request Revision
                </button>
              )}
              {onConfirmDelivery && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('heavy');
                    onConfirmDelivery(project);
                  }}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'var(--tg-theme-button-color, var(--tg-button, #5288c1))',
                    color: 'var(--tg-theme-button-text-color, var(--tg-button-text, #ffffff))',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <IconCheck size={16} />
                  <span>Approve</span>
                </button>
              )}
            </>
          )}

          {isCompleted && onRateProject && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onRateProject(project);
              }}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '10px',
                border: '1px solid rgba(120, 120, 128, 0.2)',
                backgroundColor: 'transparent',
                color: 'var(--tg-theme-link-color, var(--tg-link, #64b5ef))',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <IconStar size={16} />
              <span>Submit Review</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
