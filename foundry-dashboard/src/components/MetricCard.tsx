import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../utils/format';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  format?: 'currency' | 'number' | 'percent' | 'raw';
  subtitle?: string;
  accent?: string;
}

export function MetricCard({ label, value, change, format = 'raw', subtitle, accent }: MetricCardProps) {
  let displayValue: string;
  if (format === 'currency') displayValue = formatCurrency(Number(value));
  else if (format === 'number') displayValue = formatNumber(Number(value));
  else if (format === 'percent') displayValue = `${Number(value).toFixed(1)}%`;
  else displayValue = String(value);

  const isPositive = change !== undefined && change >= 0;
  const hasChange = change !== undefined;

  return (
    <div className="metric-card" style={accent ? { borderTop: `3px solid ${accent}` } : undefined}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{displayValue}</span>
      {hasChange && (
        <div className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{formatPercent(change!)}</span>
          <span className="metric-period">vs yesterday</span>
        </div>
      )}
      {subtitle && <span className="metric-subtitle">{subtitle}</span>}
    </div>
  );
}
