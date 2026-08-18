import React from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { IconCheck, IconStar, IconSparkles } from '@icons/icons';

const KANBAN_COLUMNS = [
  { id: 'proposal_sent', title: 'Proposal Sent', badge: 'neutral' },
  { id: 'in_progress', title: 'In Progress', badge: 'gold' },
  { id: 'delivered', title: 'Delivered', badge: 'gold' },
  { id: 'revision_requested', title: 'Revision Requested', badge: 'gold' },
  { id: 'completed', title: 'Completed', badge: 'success' },
];

export const ProjectsKanbanBoard = ({
  projects = [],
  onSelectProject = () => {},
  onMarkDelivered = () => {},
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        alignItems: 'start',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '12px',
      }}
    >
      {KANBAN_COLUMNS.map((col) => {
        const colProjects = projects.filter((p) => p.status === col.id);

        return (
          <div
            key={col.id}
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)',
              padding: '16px',
              boxShadow: 'var(--shadow)',
              minHeight: '420px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Column Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{col.title}</span>
              <Badge variant={col.badge} size="small">{colProjects.length}</Badge>
            </div>

            {/* Column Items Stack */}
            {colProjects.length === 0 ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '12px' }}>
                No projects in this stage
              </div>
            ) : (
              colProjects.map((p) => (
                <div
                  key={p._id}
                  onClick={() => onSelectProject(p)}
                  style={{
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    cursor: 'pointer',
                    display: 'grid',
                    gap: '8px',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                  className="kanban-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                      {p.packageTier || 'Short-Form'}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                      {p.price} {p.currency}
                    </span>
                  </div>

                  <h4 className="font-display" style={{ fontSize: '14px', color: 'var(--ink)', margin: 0 }}>
                    {p.editingStyle}
                  </h4>

                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: 0 }}>
                    Client: {p.clientName}
                  </p>

                  {p.revisionNotes && (
                    <div style={{ fontSize: '11px', color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', padding: '6px 8px', borderRadius: '4px' }}>
                      "{p.revisionNotes.length > 50 ? p.revisionNotes.substring(0, 50) + '...' : p.revisionNotes}"
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--ink-soft)' }}>
                    <span>Deadline: {new Date(p.deadline).toLocaleDateString()}</span>
                    
                    {(p.status === 'in_progress' || p.status === 'revision_requested') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkDelivered(p._id);
                        }}
                        style={{
                          backgroundColor: 'var(--accent-gold)',
                          color: '#170B06',
                          border: 'none',
                          borderRadius: '100px',
                          padding: '3px 8px',
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Deliver
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
};
