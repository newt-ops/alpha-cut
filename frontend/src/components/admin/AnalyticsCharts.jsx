import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Badge } from '@components/ui/Badge';
import { IconDollar, IconBarChart, IconUsers, IconSparkles } from '@icons/icons';

const STATUS_COLORS = {
  proposal_sent: '#E2E8F0',
  in_progress: '#3182CE',
  delivered: '#DD6B20',
  revision_requested: '#D69E2E',
  completed: '#38A169',
  declined: '#E53E3E',
};

const TIER_COLORS = {
  basic: '#A0AEC0',
  professional: '#C9A06B',
  premium: '#D69E2E',
};

import { AdminSectionHeader } from './AdminSectionHeader';

export const AnalyticsCharts = ({ stats }) => {
  const [currency, setCurrency] = useState('ETB');
  const [trendRange, setTrendRange] = useState('30d');

  const safeStats = stats || {};
  const {
    revenueETB = 0,
    revenueUSD = 0,
    projRevenueETB = 0,
    projRevenueUSD = 0,
    contractRevenueETB = 0,
    contractRevenueUSD = 0,
    recurringRevenueETB = 0,
    recurringRevenueUSD = 0,
    activeContractsCount = 0,
    totalContractsCount = 0,
    clientCount = 0,
    statusCounts = {},
    conversionRate = '0%',
    avgRating = '5.0',
    totalReviews = 0,
    revenueByTier = { basic: { USD: 0, ETB: 0 }, professional: { USD: 0, ETB: 0 }, premium: { USD: 0, ETB: 0 } },
    revenueByStyle = [],
    topClients = [],
    revenueTrends = [],
  } = safeStats;

  const safeStatusCounts = statusCounts || {};
  const safeTier = revenueByTier || { basic: { USD: 0, ETB: 0 }, professional: { USD: 0, ETB: 0 }, premium: { USD: 0, ETB: 0 } };
  const safeStyles = Array.isArray(revenueByStyle) ? revenueByStyle : [];
  const safeTopClients = Array.isArray(topClients) ? topClients : [];
  const safeTrends = Array.isArray(revenueTrends) ? revenueTrends : [];

  // Format Status Donut Data
  const statusPieData = [
    { name: 'Proposal Sent', value: safeStatusCounts.proposal_sent || 0, color: STATUS_COLORS.proposal_sent },
    { name: 'In Progress', value: safeStatusCounts.in_progress || 0, color: STATUS_COLORS.in_progress },
    { name: 'Delivered', value: safeStatusCounts.delivered || 0, color: STATUS_COLORS.delivered },
    { name: 'Revision Requested', value: safeStatusCounts.revision_requested || 0, color: STATUS_COLORS.revision_requested },
    { name: 'Completed', value: safeStatusCounts.completed || 0, color: STATUS_COLORS.completed },
    { name: 'Declined', value: safeStatusCounts.declined || 0, color: STATUS_COLORS.declined },
  ].filter((d) => d.value > 0);

  // Format Package Tier Bar Data
  const tierBarData = [
    { tier: 'Basic', value: safeTier.basic ? safeTier.basic[currency] : 0, fill: TIER_COLORS.basic },
    { tier: 'Professional', value: safeTier.professional ? safeTier.professional[currency] : 0, fill: TIER_COLORS.professional },
    { tier: 'Premium', value: safeTier.premium ? safeTier.premium[currency] : 0, fill: TIER_COLORS.premium },
  ];

  // Format Editing Style Bar Data
  const styleBarData = safeStyles.map((s) => ({
    style: s.style?.length > 15 ? s.style.substring(0, 15) + '...' : s.style || 'Custom',
    value: s[currency] || 0,
  }));

  const currentRev = currency === 'USD' ? revenueUSD : revenueETB;
  const projRev = currency === 'USD' ? projRevenueUSD : projRevenueETB;
  const contractRev = currency === 'USD' ? contractRevenueUSD : contractRevenueETB;

  return (
    <div style={{ display: 'grid', gap: '28px' }}>
      <AdminSectionHeader
        title="System Performance & Revenue Analytics"
        subtitle="Real-time financial metrics, status conversion funnels, and client revenue distribution."
        action={
          <div style={{ backgroundColor: 'var(--surface)', padding: '4px', borderRadius: '100px', border: '1px solid var(--line)', display: 'flex' }}>
            <button
              onClick={() => setCurrency('USD')}
              style={{
                padding: '6px 16px',
                borderRadius: '100px',
                border: 'none',
                backgroundColor: currency === 'USD' ? 'var(--accent-gold)' : 'transparent',
                color: currency === 'USD' ? '#170B06' : 'var(--ink-soft)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('ETB')}
              style={{
                padding: '6px 16px',
                borderRadius: '100px',
                border: 'none',
                backgroundColor: currency === 'ETB' ? 'var(--accent-gold)' : 'transparent',
                color: currency === 'ETB' ? '#170B06' : 'var(--ink-soft)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ETB (Br)
            </button>
          </div>
        }
      />

      {/* Primary 4 Stat Cards with Period Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginBottom: '4px' }}>Total Revenue ({currency})</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-gold)' }}>
            {currency === 'USD' ? `$${revenueUSD.toLocaleString()}` : `${revenueETB.toLocaleString()} ETB`}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '6px', display: 'block' }}>
            Projects: {currency === 'USD' ? `$${projRevenueUSD}` : `${projRevenueETB} ETB`} • Retainers: {currency === 'USD' ? `$${contractRevenueUSD}` : `${contractRevenueETB} ETB`}
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginBottom: '4px' }}>Active Retainers</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)' }}>{activeContractsCount}</div>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '6px', display: 'block' }}>
            MRR: {currency === 'USD' ? `$${recurringRevenueUSD}` : `${recurringRevenueETB} ETB`}/mo
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginBottom: '4px' }}>Proposal Conversion Rate</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)' }}>{conversionRate}</div>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '6px', display: 'block' }}>
            Accepted: {(safeStatusCounts.completed || 0) + (safeStatusCounts.in_progress || 0) + (safeStatusCounts.delivered || 0)} / Total: {Object.values(safeStatusCounts).reduce((a, b) => a + b, 0)}
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginBottom: '4px' }}>Average Review Score</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-gold)' }}>{avgRating} / 5.0</div>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '6px', display: 'block' }}>
            Based on {totalReviews} published client reviews
          </span>
        </div>
      </div>

      {/* Row 1 Charts: Revenue Trend Line/Area Chart & Project Status Donut Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Revenue Trend Area Chart */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Revenue Growth Trend</h3>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Monthly cumulative revenue ({currency})</span>
            </div>
            <Badge variant="gold" size="small">Recharts Live</Badge>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A06B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C9A06B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" opacity={0.5} />
                <XAxis dataKey="label" stroke="#8B949E" fontSize={12} tickLine={false} />
                <YAxis stroke="#8B949E" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363D', color: '#F0F6FC', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey={currency} stroke="#C9A06B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Breakdown Donut Chart */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Project Lifecycle Status</h3>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Live status distribution</span>
            </div>
            <Badge variant="gold" size="small">Status Funnel</Badge>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            {statusPieData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink-soft)', fontSize: '13px' }}>
                No active projects or contracts in system.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" isAnimationActive={false}>
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363D', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#8B949E' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Revenue by Tier & Revenue by Editing Style Bar Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Revenue by Package Tier */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>Revenue by Package Tier</h3>
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginBottom: '20px' }}>Basic vs Professional vs Premium ({currency})</span>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" opacity={0.5} />
                <XAxis dataKey="tier" stroke="#8B949E" fontSize={12} tickLine={false} />
                <YAxis stroke="#8B949E" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363D', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#C9A06B" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Editing Style */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>Revenue by Editing Style</h3>
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginBottom: '20px' }}>Performance by video format category ({currency})</span>

          <div style={{ width: '100%', height: 220 }}>
            {styleBarData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink-soft)', fontSize: '13px' }}>
                No style revenue data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={styleBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" opacity={0.5} />
                  <XAxis dataKey="style" stroke="#8B949E" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8B949E" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363D', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#C9A06B" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Top Clients Leaderboard & Projects vs Retainers Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Top Clients Leaderboard */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Top Clients Leaderboard</h3>
            <Badge variant="gold" size="small">CRM Top 5</Badge>
          </div>

          {safeTopClients.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', textAlign: 'center', padding: '20px 0' }}>
              No registered client spend recorded yet.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {safeTopClients.map((client, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: idx === 0 ? 'var(--accent-gold)' : 'rgba(201, 160, 107, 0.2)',
                        color: idx === 0 ? '#170B06' : 'var(--accent-gold)',
                        fontWeight: 800,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{client.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{client.count} engagements</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                      {client.totalUSD > 0 ? `$${client.totalUSD.toLocaleString()}` : `${client.totalETB.toLocaleString()} ETB`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects vs Retainers Split */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>Revenue Source Split</h3>
          <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginBottom: '24px' }}>One-Off Projects vs Retainer Contracts</span>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>One-Off Projects</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                  {currency === 'USD' ? `$${projRevenueUSD.toLocaleString()}` : `${projRevenueETB.toLocaleString()} ETB`}
                </span>
              </div>
              <div style={{ height: '10px', backgroundColor: 'var(--bg)', borderRadius: '100px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${currentRev > 0 ? Math.round((projRev / currentRev) * 100) : 0}%`,
                    backgroundColor: 'var(--accent-gold)',
                    borderRadius: '100px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Retainer Contracts</span>
                <span style={{ fontWeight: 700, color: '#3182CE' }}>
                  {currency === 'USD' ? `$${contractRevenueUSD.toLocaleString()}` : `${contractRevenueETB.toLocaleString()} ETB`}
                </span>
              </div>
              <div style={{ height: '10px', backgroundColor: 'var(--bg)', borderRadius: '100px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${currentRev > 0 ? Math.round((contractRev / currentRev) * 100) : 0}%`,
                    backgroundColor: '#3182CE',
                    borderRadius: '100px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
