import React, { useState } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { IconChevronRight, IconCalendar, IconCheck, IconSparkles } from '@icons/icons';

export const NotionCalendar = ({ projects = [], contracts = [], onSelectProject }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const handlePrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));
  const handleJumpToToday = () => setViewDate(new Date());

  const today = new Date();

  // Helper to find projects, retainer contracts & deliverable handoffs on a given day
  const getEventsForDay = (day) => {
    const projEvents = projects.filter((p) => {
      const d = p.deadline ? new Date(p.deadline) : null;
      const c = p.createdAt ? new Date(p.createdAt) : null;

      const isDeadline = d && d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      const isCreated = c && c.getDate() === day && c.getMonth() === currentMonth && c.getFullYear() === currentYear;

      return isDeadline || isCreated;
    });

    const contractEvents = [];
    (contracts || []).forEach((c) => {
      const s = c.startDate ? new Date(c.startDate) : null;
      if (s && s.getDate() === day && s.getMonth() === currentMonth && s.getFullYear() === currentYear) {
        contractEvents.push({
          ...c,
          editingStyle: `[Retainer Start] ${c.packageTier?.toUpperCase()}`,
          status: c.status === 'active' ? 'in_progress' : c.status,
          isContract: true,
        });
      }

      if (c.deliverables && c.deliverables.length > 0) {
        c.deliverables.forEach((d) => {
          const date = d.deliveredAt ? new Date(d.deliveredAt) : (d.createdAt ? new Date(d.createdAt) : null);
          if (date && date.getDate() === day && date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            contractEvents.push({
              _id: d._id,
              editingStyle: `[Render #${d.sequenceNumber}] ${d.title || 'Deliverable'}`,
              clientName: c.clientName,
              clientEmail: c.clientEmail,
              price: c.monthlyPrice,
              currency: c.currency,
              packageTier: c.packageTier,
              status: d.status === 'approved' ? 'completed' : 'delivered',
              isDeliverable: true,
            });
          }
        });
      }
    });

    return [...projEvents, ...contractEvents];
  };

  const handleDayClick = (day, events) => {
    if (events.length > 0) {
      setSelectedDayEvents({ day, events });
      setEventModalOpen(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'proposal_sent': return 'var(--accent-gold)';
      case 'in_progress': return '#3182CE';
      case 'delivered': return '#805AD5';
      case 'completed': return '#38A169';
      case 'declined': return '#E53E3E';
      default: return 'var(--accent-gold)';
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--line)',
        padding: '24px',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Calendar Header Control Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IconCalendar size={22} color="var(--accent-gold)" />
          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)' }}>
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <Badge variant="gold">Notion Schedule</Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="secondary" size="small" onClick={handleJumpToToday}>
            Jump to Today
          </Button>
          <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                padding: '8px 12px',
                background: 'var(--bg)',
                border: 'none',
                borderRight: '1px solid var(--line)',
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              ←
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                padding: '8px 12px',
                background: 'var(--bg)',
                border: 'none',
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Container for Mobile Viewports */}
      <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: '600px' }}>
          {/* Weekday Column Headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '10px',
              textAlign: 'center',
            }}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w, idx) => (
              <span key={idx} className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                {w}
              </span>
            ))}
          </div>

          {/* Notion Grid Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: 'var(--line)', marginTop: '1px' }}>
            {/* Empty leading cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ backgroundColor: 'var(--bg)', minHeight: '100px', opacity: 0.3 }} />
            ))}

        {/* Month Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
          const events = getEventsForDay(day);

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day, events)}
              style={{
                backgroundColor: isToday ? 'rgba(201, 160, 107, 0.06)' : 'var(--surface)',
                minHeight: '110px',
                maxHeight: '110px',
                overflow: 'hidden',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: events.length > 0 ? 'pointer' : 'default',
                border: isToday ? '1px solid var(--accent-gold)' : 'none',
                position: 'relative',
                transition: 'background-color var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isToday ? 800 : 600,
                    color: isToday ? 'var(--accent-gold)' : 'var(--ink)',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isToday ? 'rgba(201, 160, 107, 0.2)' : 'transparent',
                  }}
                >
                  {day}
                </span>

                {isToday && (
                  <span className="font-mono" style={{ fontSize: '9px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                    TODAY
                  </span>
                )}
              </div>

              {/* Event Pill Badges inside Day Cell */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', overflow: 'hidden' }}>
                {events.slice(0, 2).map((proj) => (
                  <div
                    key={proj._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectProject) onSelectProject(proj);
                    }}
                    style={{
                      fontSize: '10px',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg)',
                      borderLeft: `3px solid ${getStatusColor(proj.status)}`,
                      color: 'var(--ink)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {proj.editingStyle || proj.clientName}
                  </div>
                ))}
                {events.length > 2 && (
                  <div style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: 700, marginTop: '1px' }}>
                    +{events.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>

      {/* Notion Day Activity Inspector Modal */}
      {selectedDayEvents && (
        <Modal
          isOpen={eventModalOpen}
          onClose={() => setEventModalOpen(false)}
          title={`Activity Schedule — ${monthNames[currentMonth]} ${selectedDayEvents.day}, ${currentYear}`}
        >
          <div style={{ display: 'grid', gap: '16px' }}>
            {selectedDayEvents.events.map((proj) => (
              <div
                key={proj._id}
                style={{
                  backgroundColor: 'var(--bg)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--line)',
                  borderLeft: `4px solid ${getStatusColor(proj.status)}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>{proj.editingStyle}</h4>
                  <Badge variant="gold">{proj.status.replace('_', ' ').toUpperCase()}</Badge>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                  Client: {proj.clientName} ({proj.clientEmail})
                </div>
                <div style={{ fontSize: '13px', color: 'var(--accent-gold)', marginTop: '4px', fontWeight: 700 }}>
                  Terms: {proj.price} {proj.currency} ({proj.packageTier?.toUpperCase()})
                </div>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setEventModalOpen(false);
                      if (onSelectProject) onSelectProject(proj);
                    }}
                  >
                    Inspect Full Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};
