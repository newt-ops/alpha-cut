import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Badge } from '@components/ui/Badge';
import { AdminSectionHeader } from './AdminSectionHeader';
import { AdminStats } from '../../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  ChartTooltip,
  ChartLegend
);

const STATUS_COLORS: Record<string, string> = {
  proposal_sent: '#E2E8F0',
  in_progress: '#3182CE',
  delivered: '#DD6B20',
  revision_requested: '#D69E2E',
  completed: '#38A169',
  declined: '#E53E3E',
};

const TIER_COLORS: Record<string, string> = {
  basic: '#A0AEC0',
  professional: '#C9A06B',
  premium: '#D69E2E',
};

// Shared Chart.js defaults for dark theme
const darkGridColor = 'rgba(48, 54, 61, 0.5)';
const darkTickColor = '#8B949E';
const darkTooltipBg = '#161B22';
const darkTooltipBorder = '#30363D';
const goldAccent = '#C9A06B';

const baseScaleOptions = {
  grid: { color: darkGridColor, drawBorder: false },
  ticks: { color: darkTickColor, font: { size: 12 } },
};

const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: darkTooltipBg,
      borderColor: darkTooltipBorder,
      borderWidth: 1,
      titleColor: '#F0F6FC',
      bodyColor: '#F0F6FC',
      cornerRadius: 8,
      padding: 10,
    },
  },
};

export interface AnalyticsChartsProps {
  stats?: Partial<AdminStats>;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats }) => {
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');

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

  // Status Funnel Data
  const statusLabels = ['Proposal Sent', 'In Progress', 'Delivered', 'Completed', 'Declined'];
  const statusKeys = ['proposal_sent', 'in_progress', 'delivered', 'completed', 'declined'];
  const statusValues = statusKeys.map((k) => safeStatusCounts[k] || 0);

  const statusChartData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusValues,
        backgroundColor: statusKeys.map((k) => STATUS_COLORS[k] || goldAccent),
        borderRadius: 6,
      },
    ],
  };

  // Tier Revenue Data
  const tierLabels = ['Basic', 'Professional', 'Premium'];
  const tierValues = [
    currency === 'USD' ? safeTier.basic?.USD || 0 : safeTier.basic?.ETB || 0,
    currency === 'USD' ? safeTier.professional?.USD || 0 : safeTier.professional?.ETB || 0,
    currency === 'USD' ? safeTier.premium?.USD || 0 : safeTier.premium?.ETB || 0,
  ];

  const tierChartData = {
    labels: tierLabels,
    datasets: [
      {
        data: tierValues,
        backgroundColor: ['#A0AEC0', goldAccent, '#D69E2E'],
        borderWidth: 0,
      },
    ],
  };

  // Style Revenue Data
  const styleLabels = (revenueByStyle || []).map((s) => s.style || 'Other');
  const styleValues = (revenueByStyle || []).map((s) => (currency === 'USD' ? s.USD || 0 : s.ETB || 0));

  const styleChartData = {
    labels: styleLabels.length > 0 ? styleLabels : ['No Data'],
    datasets: [
      {
        data: styleValues.length > 0 ? styleValues : [0],
        backgroundColor: goldAccent,
        borderRadius: 6,
      },
    ],
  };

  // Monthly Revenue Trend Data
  const trendLabels = (revenueTrends || []).map((t) => t.label || '');
  const trendValues = (revenueTrends || []).map((t) => (currency === 'USD' ? t.USD || 0 : t.ETB || 0));

  const trendChartData = {
    labels: trendLabels.length > 0 ? trendLabels : ['Month 1'],
    datasets: [
      {
        data: trendValues.length > 0 ? trendValues : [0],
        borderColor: goldAccent,
        backgroundColor: 'rgba(201, 160, 107, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: goldAccent,
      },
    ],
  };

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <AdminSectionHeader
        title="Revenue & Analytics Control Center"
        subtitle="Real-time financial performance and client pipeline stats"
        action={
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <button
              onClick={() => setCurrency('ETB')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: currency === 'ETB' ? 'var(--accent-gold)' : 'transparent',
                color: currency === 'ETB' ? '#170B06' : 'var(--ink-soft)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ETB
            </button>
            <button
              onClick={() => setCurrency('USD')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: currency === 'USD' ? 'var(--accent-gold)' : 'transparent',
                color: currency === 'USD' ? '#170B06' : 'var(--ink-soft)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              USD ($)
            </button>
          </div>
        }
      />

      {/* Primary Financial Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginBottom: '4px' }}>TOTAL REVENUE</span>
          <h3 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)' }}>
            {currency === 'USD' ? `$${revenueUSD.toLocaleString()}` : `${revenueETB.toLocaleString()} ETB`}
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Projects + Retainers</span>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginBottom: '4px' }}>RECURRING RETAINER REVENUE</span>
          <h3 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)' }}>
            {currency === 'USD' ? `$${recurringRevenueUSD.toLocaleString()}` : `${recurringRevenueETB.toLocaleString()} ETB`}
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{activeContractsCount} Active Retainers</span>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginBottom: '4px' }}>PROPOSAL CONVERSION</span>
          <h3 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)' }}>{conversionRate}</h3>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Accepted Proposals</span>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginBottom: '4px' }}>CLIENT SATISFACTION</span>
          <h3 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)' }}>★ {avgRating}</h3>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>From {totalReviews} Reviews</span>
        </div>
      </div>

      {/* Chart Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Revenue Trend Line Chart */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h4 className="font-display" style={{ fontSize: '16px', marginBottom: '16px' }}>Revenue Growth Trend</h4>
          <div style={{ height: '220px' }}>
            <Line
              data={trendChartData}
              options={{
                ...baseChartOptions,
                scales: {
                  x: baseScaleOptions,
                  y: baseScaleOptions,
                },
              }}
            />
          </div>
        </div>

        {/* Status Funnel Bar Chart */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h4 className="font-display" style={{ fontSize: '16px', marginBottom: '16px' }}>Project Status Breakdown</h4>
          <div style={{ height: '220px' }}>
            <Bar
              data={statusChartData}
              options={{
                ...baseChartOptions,
                scales: {
                  x: baseScaleOptions,
                  y: baseScaleOptions,
                },
              }}
            />
          </div>
        </div>

        {/* Revenue by Tier Doughnut */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h4 className="font-display" style={{ fontSize: '16px', marginBottom: '16px' }}>Revenue by Tier</h4>
          <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut
              data={tierChartData}
              options={{
                ...baseChartOptions,
                plugins: {
                  legend: { display: true, position: 'bottom', labels: { color: darkTickColor } },
                },
              }}
            />
          </div>
        </div>

        {/* Top Clients Ranking */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
          <h4 className="font-display" style={{ fontSize: '16px', marginBottom: '16px' }}>Top Valued Clients</h4>
          {topClients.length === 0 ? (
            <p style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>No client spending recorded yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {topClients.slice(0, 5).map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{c.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block' }}>{c.count} Orders</span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                    {currency === 'USD' ? `$${c.totalUSD}` : `${c.totalETB} ETB`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
