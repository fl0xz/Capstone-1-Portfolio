import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { HourlyDataPoint } from '../types';
import { formatCurrency, formatNumber } from '../utils/format';

interface AnalyticsChartProps {
  data: HourlyDataPoint[];
  metric: 'revenue' | 'orders' | 'views';
  color?: string;
  height?: number;
}

export function AnalyticsChart({ data, metric, color = '#0071E3', height = 200 }: AnalyticsChartProps) {
  const labels = {
    revenue: 'Revenue',
    orders: 'Orders',
    views: 'Views',
  };

  const formatValue = (value: number) => {
    if (metric === 'revenue') return formatCurrency(value);
    return formatNumber(value);
  };

  return (
    <div className="chart-container" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E8ED" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 11, fill: '#86868B' }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#86868B' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (metric === 'revenue' ? `£${v}` : formatNumber(v))}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid #E8E8ED',
              borderRadius: 12,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              fontSize: 13,
            }}
            formatter={(value) => [formatValue(Number(value ?? 0)), labels[metric]]}
            labelStyle={{ color: '#86868B', marginBottom: 4 }}
          />
          <Area
            type="monotone"
            dataKey={metric}
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${metric})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
