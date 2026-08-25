import React from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';

const KANBAN_COLUMNS = [
  { id: 'proposal_sent', title: 'Proposal Sent', badge: 'gold' as const, accentColor: '#C9A06B' },
  { id: 'in_progress', title: 'In Progress', badge: 'gold' as const, accentColor: '#3B82F6' },
  { id: 'delivered', title: 'Delivered Render', badge: 'gold' as const, accentColor: '#F59E0B' },
  { id: 'revision_requested', title: 'Revision Requested', badge: 'maroon' as const, accentColor: '#EF4444' },
  { id: 'completed', title: 'Completed Order', badge: 'success' as const, accentColor: '#10B981' },
];

export interface ProjectsKanbanBoardProps {
  projects?: any[];
  onSelectProject?: (project: any) => void;
  onMarkDelivered?: (projectId: string) => void;
}

export const ProjectsKanbanBoard: React.FC<ProjectsKanbanBoardProps> = ({
  projects = [],
  onSelectProject = () => {},
  onMarkDelivered = () => {},
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
        gap: '20px',
        alignItems: 'start',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '16px',
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
              padding: '18px',
              boxShadow: 'var(--shadow-sm)',
              minHeight: '440px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Column Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.accentColor }} />
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--ink)' }}>{col.title}</span>
              </div>
              <Badge variant={col.badge} size="small">{colProjects.length}</Badge>
            </div>

            {/* Column Items Stack */}
            {colProjects.length === 0 ? (
              <div style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '12.5px' }}>
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
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'grid',
                    gap: '10px',
                    transition: 'all var(--transition-fast)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                  className="kanban-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {(p.packageTier || 'Short-Form').toUpperCase()} TIER
                    </span>
                    <span className="font-mono" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)', backgroundColor: 'rgba(201, 160, 107, 0.12)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--accent-gold)' }}>
                      {p.price} {p.currency}
                    </span>
                  </div>

                  <h4 className="font-display" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', margin: 0, lineHeight: 1.3 }}>
                    {p.editingStyle}
                  </h4>

                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                    Client: <strong style={{ color: 'var(--ink)' }}>{p.clientName}</strong>
                  </div>

                  {p.revisionNotes && (
                    <div style={{ fontSize: '11.5px', color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 10px', borderRadius: '6px' }}>
                      <strong>Revision Note:</strong> "{p.revisionNotes.length > 60 ? p.revisionNotes.substring(0, 60) + '...' : p.revisionNotes}"
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11.5px', color: 'var(--ink-soft)', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                    <span>Deadline: <strong style={{ color: 'var(--ink)' }}>{p.deadline ? new Date(p.deadline).toLocaleDateString() : '—'}</strong></span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(p.status === 'in_progress' || p.status === 'revision_requested') && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkDelivered(p._id);
                          }}
                          style={{
                            backgroundColor: 'var(--accent-gold)',
                            color: '#170B06',
                            border: 'none',
                            borderRadius: '100px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Deliver Render
                        </button>
                      )}
                    </div>
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
