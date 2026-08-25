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
import { Button } from '@components/ui/Button';
import { IconFileText } from '@icons/icons';
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
  basic: '#3B82F6',        // Essential Vivid Sapphire Blue
  professional: '#F59E0B', // High Growth Vivid Studio Gold
  premium: '#10B981',      // Enterprise Vivid Emerald Green
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
  loading?: boolean;
  onOpenInvoiceModal?: () => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats, loading = false, onOpenInvoiceModal }) => {
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

  const exchangeRate = 128.5; // Studio Exchange Rate: 1 USD = 128.5 ETB

  const calcUSD = (usdVal: any, etbVal: any) => {
    const numUsd = Number(usdVal) || 0;
    const numEtb = Number(etbVal) || 0;
    if (numUsd > 0) return numUsd;
    return Number((numEtb / exchangeRate).toFixed(2));
  };

  const finalRevenueUSD = calcUSD(revenueUSD, revenueETB);
  const finalProjRevenueUSD = calcUSD(projRevenueUSD, projRevenueETB);
  const finalContractRevenueUSD = calcUSD(contractRevenueUSD, contractRevenueETB);
  const finalRecurringRevenueUSD = calcUSD(recurringRevenueUSD, recurringRevenueETB);

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
  const tierLabels = ['Basic Tier', 'Professional Tier', 'Premium Tier'];
  const tierValues = [
    currency === 'USD' ? calcUSD(safeTier.basic?.USD, safeTier.basic?.ETB) : safeTier.basic?.ETB || 0,
    currency === 'USD' ? calcUSD(safeTier.professional?.USD, safeTier.professional?.ETB) : safeTier.professional?.ETB || 0,
    currency === 'USD' ? calcUSD(safeTier.premium?.USD, safeTier.premium?.ETB) : safeTier.premium?.ETB || 0,
  ];

  const totalTierRev = tierValues.reduce((a, b) => a + b, 0);

  const tierChartData = {
    labels: tierLabels,
    datasets: [
      {
        data: tierValues,
        backgroundColor: ['#3B82F6', '#F59E0B', '#10B981'],
        borderWidth: 0,
      },
    ],
  };

  // Style Revenue Data
  const styleLabels = (revenueByStyle || []).map((s) => s.style || 'Other');
  const styleValues = (revenueByStyle || []).map((s) => (currency === 'USD' ? calcUSD(s.USD, s.ETB) : s.ETB || 0));

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
  const trendValues = (revenueTrends || []).map((t) => (currency === 'USD' ? calcUSD(t.USD, t.ETB) : t.ETB || 0));

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

            {onOpenInvoiceModal && (
              <Button variant="secondary" size="small" iconLeft={IconFileText} onClick={onOpenInvoiceModal}>
                Issue Invoice
              </Button>
            )}
          </div>
        }
      />

      {/* Primary Financial Stat Cards (Equalized Height & Flex Layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Stat Card 1: Total Revenue */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--accent-gold)',
            boxShadow: '0 10px 30px -10px rgba(201, 160, 107, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '160px',
          }}
        >
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '6px', letterSpacing: '0.06em' }}>
              TOTAL AGENCY REVENUE
            </span>
            <h3 className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              {currency === 'USD' ? `$${finalRevenueUSD.toLocaleString()}` : `${revenueETB.toLocaleString()} ETB`}
            </h3>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '11.5px',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                padding: '4px 10px',
                borderRadius: '100px',
                color: 'var(--ink-soft)',
              }}
            >
              One-off: <strong style={{ color: 'var(--ink)' }}>{currency === 'USD' ? `$${finalProjRevenueUSD.toLocaleString()}` : `${projRevenueETB.toLocaleString()} ETB`}</strong>
            </span>
            <span
              style={{
                fontSize: '11.5px',
                backgroundColor: 'rgba(201, 160, 107, 0.12)',
                border: '1px solid var(--accent-gold)',
                padding: '4px 10px',
                borderRadius: '100px',
                color: 'var(--accent-gold)',
                fontWeight: 600,
              }}
            >
              Retainers: <strong>{currency === 'USD' ? `$${finalContractRevenueUSD.toLocaleString()}` : `${contractRevenueETB.toLocaleString()} ETB`}</strong>
            </span>
          </div>
        </div>

        {/* Stat Card 2: Monthly Recurring Revenue */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '160px',
          }}
        >
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '6px', letterSpacing: '0.06em' }}>
              MONTHLY RECURRING (MRR)
            </span>
            <h3 className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              {currency === 'USD' ? `$${finalRecurringRevenueUSD.toLocaleString()}` : `${recurringRevenueETB.toLocaleString()} ETB`}
            </h3>
          </div>
          <div style={{ marginTop: '16px' }}>
            <span
              style={{
                fontSize: '11.5px',
                color: 'var(--ink-soft)',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                padding: '4px 12px',
                borderRadius: '100px',
                display: 'inline-block',
              }}
            >
              From <strong style={{ color: 'var(--accent-gold)' }}>{activeContractsCount}</strong> Active Retainers
            </span>
          </div>
        </div>

        {/* Stat Card 3: Proposal Conversion */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '160px',
          }}
        >
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '6px', letterSpacing: '0.06em' }}>
              PROPOSAL CONVERSION
            </span>
            <h3 className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              {conversionRate}
            </h3>
          </div>
          <div style={{ marginTop: '16px' }}>
            <span
              style={{
                fontSize: '11.5px',
                color: 'var(--ink-soft)',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                padding: '4px 12px',
                borderRadius: '100px',
                display: 'inline-block',
              }}
            >
              Accepted Client Proposals Rate
            </span>
          </div>
        </div>

        {/* Stat Card 4: Client Satisfaction */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '160px',
          }}
        >
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '6px', letterSpacing: '0.06em' }}>
              CLIENT SATISFACTION SCORE
            </span>
            <h3 className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-gold)', margin: 0 }}>
              ★ {avgRating}
            </h3>
          </div>
          <div style={{ marginTop: '16px' }}>
            <span
              style={{
                fontSize: '11.5px',
                color: 'var(--ink-soft)',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                padding: '4px 12px',
                borderRadius: '100px',
                display: 'inline-block',
              }}
            >
              Based on <strong style={{ color: 'var(--ink)' }}>{totalReviews}</strong> Verified Client Ratings
            </span>
          </div>
        </div>
      </div>

      {/* Chart Grid (Equalized Container Heights with Skeleton/Empty States) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Revenue Trend Line Chart */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <h4 className="font-display" style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Revenue Growth Trend</h4>
            <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginTop: '4px' }}>6-Month agency billing trajectory</span>
          </div>

          <div style={{ height: '240px', marginTop: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? (
              <div style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg)', animation: 'pulse 1.5s infinite ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Waking up analytics engine...</span>
              </div>
            ) : trendValues.every((v) => v === 0) ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📈</span>
                <span style={{ fontSize: '13px', color: 'var(--ink-soft)', fontWeight: 600 }}>No revenue trend recorded yet</span>
                <span style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block', marginTop: '4px' }}>Approved client proposals will plot here</span>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* Status Funnel Bar Chart */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <h4 className="font-display" style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Project Status Breakdown</h4>
            <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginTop: '4px' }}>Active proposals & deliverable states</span>
          </div>

          <div style={{ height: '240px', marginTop: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? (
              <div style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg)', animation: 'pulse 1.5s infinite ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Syncing pipeline stats...</span>
              </div>
            ) : statusValues.every((v) => v === 0) ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📊</span>
                <span style={{ fontSize: '13px', color: 'var(--ink-soft)', fontWeight: 600 }}>No project status activity</span>
                <span style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block', marginTop: '4px' }}>Create proposals to activate status tracking</span>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* Revenue by Tier Doughnut */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 className="font-display" style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Revenue by Tier</h4>
            <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginTop: '4px' }}>Package tier revenue distribution</span>
          </div>
          <div style={{ height: '170px', display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
            <Doughnut
              data={tierChartData}
              options={{
                ...baseChartOptions,
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
          <div style={{ marginTop: '12px', display: 'grid', gap: '6px' }}>
            {[
              { label: 'Basic Tier', val: tierValues[0], color: '#3B82F6' },
              { label: 'Professional Tier', val: tierValues[1], color: '#F59E0B' },
              { label: 'Premium Tier', val: tierValues[2], color: '#10B981' },
            ].map((t, idx) => {
              const pct = totalTierRev > 0 ? Math.round((t.val / totalTierRev) * 100) : 0;
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 10px', backgroundColor: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: t.color }} />
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.label}</span>
                  </div>
                  <span className="font-mono" style={{ color: 'var(--ink-soft)' }}>
                    {currency === 'USD' ? `$${t.val.toLocaleString()}` : `${t.val.toLocaleString()} ETB`} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Clients Ranking */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 className="font-display" style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Top Valued Clients</h4>
            <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginTop: '4px' }}>Highest lifetime spending clients</span>
          </div>
          <div style={{ flex: 1, marginTop: '16px', overflowY: 'auto' }}>
            {topClients.length === 0 ? (
              <p style={{ color: 'var(--ink-soft)', fontSize: '13px', textAlign: 'center', marginTop: '32px' }}>No client spending recorded yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '8px' }}>
                {topClients.slice(0, 5).map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                    <div>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)', display: 'block' }}>{c.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{c.count} Active Orders</span>
                    </div>
                    <span className="font-mono" style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 800, backgroundColor: 'rgba(201, 160, 107, 0.12)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--accent-gold)' }}>
                      {currency === 'USD' ? `$${calcUSD(c.totalUSD, c.totalETB).toLocaleString()}` : `${c.totalETB.toLocaleString()} ETB`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
