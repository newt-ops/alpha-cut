import React, { useState } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { IconChevronRight, IconCalendar, IconCheck, IconSparkles } from '@icons/icons';

export interface NotionCalendarProps {
  projects?: any[];
  contracts?: any[];
  onSelectProject?: (project: any) => void;
}

export const NotionCalendar: React.FC<NotionCalendarProps> = ({ projects = [], contracts = [], onSelectProject }) => {
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: number; events: any[] } | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const handlePrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));
  const handleJumpToToday = () => setViewDate(new Date());

  const today = new Date();

  // Helper to find projects, retainer contracts & deliverable handoffs on a given day
  const getEventsForDay = (day: number) => {
    const projEvents = projects.filter((p) => {
      const d = p.deadline ? new Date(p.deadline) : null;
      const c = p.createdAt ? new Date(p.createdAt) : null;

      const isDeadline = d && d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      const isCreated = c && c.getDate() === day && c.getMonth() === currentMonth && c.getFullYear() === currentYear;

      return isDeadline || isCreated;
    });

    const contractEvents: any[] = [];
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
        c.deliverables.forEach((d: any) => {
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

  const handleDayClick = (day: number, events: any[]) => {
    if (events.length > 0) {
      setSelectedDayEvents({ day, events });
      setEventModalOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
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
      {/* Calendar Top Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IconCalendar size={22} color="var(--accent-gold)" />
          <h2 className="font-display" style={{ fontSize: '20px', color: 'var(--ink)' }}>
            {monthNames[currentMonth]} {currentYear}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="secondary" size="small" onClick={handleJumpToToday}>
            Today
          </Button>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={handlePrevMonth}
              type="button"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--ink)',
                transform: 'rotate(180deg)',
              }}
            >
              <IconChevronRight size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              type="button"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--ink)',
              }}
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Titles Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '12px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
          <div key={i} className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 600, textTransform: 'uppercase' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Month Days Grid Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} style={{ minHeight: '90px', backgroundColor: 'transparent' }} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEvents = getEventsForDay(day);

          const isToday =
            today.getDate() === day &&
            today.getMonth() === currentMonth &&
            today.getFullYear() === currentYear;

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day, dayEvents)}
              style={{
                minHeight: '90px',
                maxHeight: '110px',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isToday ? 'rgba(201, 160, 107, 0.08)' : 'var(--bg)',
                border: `1px solid ${isToday ? 'var(--accent-gold)' : 'var(--line)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: dayEvents.length > 0 ? 'pointer' : 'default',
                transition: 'border-color var(--transition-fast)',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: isToday ? 800 : 600,
                    color: isToday ? 'var(--accent-gold)' : 'var(--ink)',
                  }}
                >
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-gold)',
                    }}
                  />
                )}
              </div>

              {/* Event Cards inside Day Cell */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', overflow: 'hidden' }}>
                {dayEvents.slice(0, 2).map((ev: any, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '3px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface)',
                      borderLeft: `3px solid ${getStatusColor(ev.status)}`,
                      fontSize: '10px',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {ev.editingStyle || 'Project'}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <span style={{ fontSize: '9px', color: 'var(--ink-soft)', paddingLeft: '2px' }}>
                    +{dayEvents.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Events Modal Details */}
      <Modal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        title={selectedDayEvents ? `Events for ${monthNames[currentMonth]} ${selectedDayEvents.day}, ${currentYear}` : 'Events'}
      >
        {selectedDayEvents && (
          <div style={{ display: 'grid', gap: '12px' }}>
            {selectedDayEvents.events.map((ev: any) => (
              <div
                key={ev._id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Badge variant="gold" size="small">
                    {ev.status ? ev.status.replace('_', ' ').toUpperCase() : 'EVENT'}
                  </Badge>
                  <h4 className="font-display" style={{ fontSize: '15px', marginTop: '6px', color: 'var(--ink)' }}>
                    {ev.editingStyle}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                    Client: {ev.clientName || ev.clientEmail || 'Client'}
                  </p>
                </div>
                {onSelectProject && (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setEventModalOpen(false);
                      onSelectProject(ev);
                    }}
                  >
                    View Record
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
