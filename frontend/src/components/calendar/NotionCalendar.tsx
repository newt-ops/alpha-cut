import React, { useState, useEffect } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { IconChevronRight, IconCalendar, IconEye, IconCheck, IconSparkles } from '@icons/icons';

export interface NotionCalendarProps {
  projects?: any[];
  contracts?: any[];
  onSelectProject?: (project: any) => void;
}

export const NotionCalendar: React.FC<NotionCalendarProps> = ({
  projects = [],
  contracts = [],
  onSelectProject,
}) => {
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDay(null);
  };
  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDay(null);
  };
  const handleJumpToToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDay(now.getDate());
  };

  const today = new Date();

  // Helper to find projects, retainer contracts & deliverable handoffs on a given day
  const getEventsForDay = (day: number) => {
    const projEvents = projects.filter((p) => {
      const d = p.deadline ? new Date(p.deadline) : null;
      const c = p.createdAt ? new Date(p.createdAt) : null;

      const isDeadline = d && d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      const isCreated = c && c.getDate() === day && c.getMonth() === currentMonth && c.getFullYear() === currentYear;

      return isDeadline || isCreated;
    }).map((p) => ({
      ...p,
      title: p.editingStyle || 'Video Project',
      type: p.status === 'delivered' ? 'DELIVERABLE READY' : 'PROJECT DEADLINE',
    }));

    const contractEvents: any[] = [];
    (contracts || []).forEach((c) => {
      const s = c.startDate ? new Date(c.startDate) : null;
      if (s && s.getDate() === day && s.getMonth() === currentMonth && s.getFullYear() === currentYear) {
        contractEvents.push({
          ...c,
          title: `[Retainer Start] ${c.packageTier?.toUpperCase()} (${c.frequency || 'Monthly'})`,
          type: 'RETAINER START',
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
              title: `[Render #${d.sequenceNumber}] ${d.title || 'Video Deliverable'}`,
              type: 'RENDER HANDOFF',
              price: c.monthlyPrice,
              currency: c.currency,
              packageTier: c.packageTier,
              status: d.status === 'approved' ? 'completed' : 'delivered',
              deliverableUrl: d.deliverableUrl || d.deliveryLink,
              isDeliverable: true,
            });
          }
        });
      }
    });

    return [...projEvents, ...contractEvents];
  };

  // Get all month events for Timeline view
  const getAllMonthEvents = () => {
    const monthEvents: { day: number; events: any[] }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const evs = getEventsForDay(day);
      if (evs.length > 0) {
        monthEvents.push({ day, events: evs });
      }
    }
    return monthEvents;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposal_sent': return 'var(--accent-gold)';
      case 'in_progress': return '#3182CE';
      case 'delivered': return '#805AD5';
      case 'completed': return '#10B981';
      case 'declined': return '#EF4444';
      default: return 'var(--accent-gold)';
    }
  };

  const allMonthEvents = getAllMonthEvents();
  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--line)',
        padding: isMobile ? '16px 12px' : '24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'grid',
        gap: '20px',
      }}
    >
      {/* Calendar Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: isMobile ? '32px' : '38px',
              height: isMobile ? '32px' : '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(201, 160, 107, 0.15)',
              border: '1px solid var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)',
            }}
          >
            <IconCalendar size={isMobile ? 16 : 20} />
          </div>
          <div>
            <h2 className="font-display" style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 600 }}>
              {allMonthEvents.reduce((acc, curr) => acc + curr.events.length, 0)} Scheduled Handoffs & Deadlines
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg)', borderRadius: '100px', padding: '2.5px', border: '1px solid var(--line)' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: isMobile ? '4px 10px' : '5px 14px',
                borderRadius: '100px',
                fontSize: '11.5px',
                fontWeight: 700,
                backgroundColor: viewMode === 'grid' ? 'var(--accent-gold)' : 'transparent',
                color: viewMode === 'grid' ? '#170B06' : 'var(--ink-soft)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              style={{
                padding: isMobile ? '4px 10px' : '5px 14px',
                borderRadius: '100px',
                fontSize: '11.5px',
                fontWeight: 700,
                backgroundColor: viewMode === 'timeline' ? 'var(--accent-gold)' : 'transparent',
                color: viewMode === 'timeline' ? '#170B06' : 'var(--ink-soft)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Timeline
            </button>
          </div>

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
              title="Previous Month"
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
              title="Next Month"
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* TIMELINE FEED VIEW */}
      {viewMode === 'timeline' ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          {allMonthEvents.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--line)' }}>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0 }}>
                No scheduled video deadlines or deliverable handovers for {monthNames[currentMonth]} {currentYear}.
              </p>
            </div>
          ) : (
            allMonthEvents.map(({ day, events }) => (
              <div
                key={day}
                style={{
                  backgroundColor: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--line)',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                  <span className="font-mono" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {monthNames[currentMonth].toUpperCase()} {day}, {currentYear}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                    ({events.length} {events.length === 1 ? 'event' : 'events'})
                  </span>
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {events.map((ev: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--surface)',
                        borderLeft: `4px solid ${getStatusColor(ev.status)}`,
                        border: '1px solid var(--line)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Badge variant="gold" size="small">
                            {ev.type || 'SCHEDULED'}
                          </Badge>
                          <span style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                            {ev.status ? ev.status.replace('_', ' ').toUpperCase() : 'ACTIVE'}
                          </span>
                        </div>
                        <h4 className="font-display" style={{ fontSize: '14.5px', color: 'var(--ink)', margin: 0, fontWeight: 800 }}>
                          {ev.title || ev.editingStyle}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {(ev.deliverableUrl || ev.deliveryLink) && (
                          <a href={ev.deliverableUrl || ev.deliveryLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="primary" size="small" iconLeft={IconEye}>
                              View Render
                            </Button>
                          </a>
                        )}

                        {onSelectProject && (
                          <Button variant="secondary" size="small" onClick={() => onSelectProject(ev)}>
                            Details
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* GRID VIEW WITH INLINE DAY AGENDA PANEL */
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Weekday Titles Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: isMobile ? '4px' : '8px', textAlign: 'center' }}>
            {(isMobile ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((d, i) => (
              <div
                key={i}
                className="font-mono"
                style={{
                  fontSize: isMobile ? '10px' : '11px',
                  color: 'var(--accent-gold)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '4px 0',
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Month Days Grid Container */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: isMobile ? '4px' : '8px' }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: isMobile ? '48px' : '84px', backgroundColor: 'transparent' }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);

              const isToday =
                today.getDate() === day &&
                today.getMonth() === currentMonth &&
                today.getFullYear() === currentYear;

              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    minHeight: isMobile ? '54px' : '88px',
                    padding: isMobile ? '6px 5px' : '10px 8px',
                    borderRadius: '10px',
                    backgroundColor: isSelected
                      ? 'rgba(201, 160, 107, 0.22)'
                      : isToday
                      ? 'rgba(201, 160, 107, 0.08)'
                      : 'var(--bg)',
                    border: isSelected
                      ? '2px solid var(--accent-gold)'
                      : isToday
                      ? '1.5px solid var(--accent-gold)'
                      : dayEvents.length > 0
                      ? '1px solid rgba(201, 160, 107, 0.4)'
                      : '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isSelected
                      ? '0 0 16px rgba(201, 160, 107, 0.35)'
                      : dayEvents.length > 0
                      ? '0 2px 8px rgba(0, 0, 0, 0.15)'
                      : 'none',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Top Bar inside Date Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span
                        style={{
                          fontSize: isMobile ? '12px' : '13px',
                          fontWeight: isSelected || isToday ? 800 : 700,
                          color: isSelected || isToday ? 'var(--accent-gold)' : 'var(--ink)',
                        }}
                      >
                        {day}
                      </span>
                      {isToday && (
                        <span
                          className="font-mono"
                          style={{
                            fontSize: '8px',
                            backgroundColor: 'var(--accent-gold)',
                            color: '#170B06',
                            padding: '1px 4px',
                            borderRadius: '100px',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                          }}
                        >
                          TODAY
                        </span>
                      )}
                    </div>

                    {!isMobile && dayEvents.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <IconSparkles size={12} color="var(--accent-gold)" />
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            color: 'var(--accent-gold)',
                            backgroundColor: 'rgba(201, 160, 107, 0.2)',
                            padding: '1px 5px',
                            borderRadius: '100px',
                            border: '1px solid rgba(201, 160, 107, 0.3)',
                          }}
                        >
                          {dayEvents.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cell Events list indicator */}
                  {isMobile ? (
                    dayEvents.length > 0 && (
                      <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                        {dayEvents.slice(0, 3).map((ev: any, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: getStatusColor(ev.status),
                              boxShadow: `0 0 4px ${getStatusColor(ev.status)}`,
                            }}
                          />
                        ))}
                      </div>
                    )
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', overflow: 'hidden' }}>
                      {dayEvents.slice(0, 2).map((ev: any, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '3px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--surface)',
                            borderLeft: `3px solid ${getStatusColor(ev.status)}`,
                            fontSize: '9.5px',
                            fontWeight: 700,
                            color: 'var(--ink)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            boxShadow: 'var(--shadow-sm)',
                          }}
                        >
                          {ev.title || ev.editingStyle}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span style={{ fontSize: '9px', color: 'var(--ink-soft)', fontWeight: 600, paddingLeft: '2px' }}>
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* INLINE SELECTED DAY AGENDA PANEL */}
          {selectedDay && (
            <div
              style={{
                backgroundColor: 'var(--bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent-gold)',
                padding: '16px',
                marginTop: '8px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="font-mono" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  SCHEDULE FOR {monthNames[currentMonth].toUpperCase()} {selectedDay}, {currentYear}
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                  {selectedEvents.length} {selectedEvents.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {selectedEvents.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0, fontStyle: 'italic' }}>
                  No video handoffs or deadlines scheduled for this day.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {selectedEvents.map((ev: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--surface)',
                        borderLeft: `4px solid ${getStatusColor(ev.status)}`,
                        border: '1px solid var(--line)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Badge variant="gold" size="small">
                            {ev.type || 'SCHEDULED'}
                          </Badge>
                          <span style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                            {ev.status ? ev.status.replace('_', ' ').toUpperCase() : 'ACTIVE'}
                          </span>
                        </div>
                        <h4 className="font-display" style={{ fontSize: '14.5px', color: 'var(--ink)', margin: 0, fontWeight: 800 }}>
                          {ev.title || ev.editingStyle}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {(ev.deliverableUrl || ev.deliveryLink) && (
                          <a href={ev.deliverableUrl || ev.deliveryLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="primary" size="small" iconLeft={IconEye}>
                              View Render
                            </Button>
                          </a>
                        )}

                        {onSelectProject && (
                          <Button variant="secondary" size="small" onClick={() => onSelectProject(ev)}>
                            Details
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
