import Card from '../common/Card.tsx';

interface Props {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  description?: string;
  status?: 'good' | 'neutral' | 'warning' | 'critical';
}

const statusColors = {
  good: 'text-emerald-600',
  neutral: 'text-slate-700',
  warning: 'text-yellow-600',
  critical: 'text-red-600',
};

export default function CreditFactorCard({
  icon,
  label,
  value,
  description,
  status = 'neutral',
}: Props) {
  const displayValue = value != null && value !== '' ? String(value) : 'N/A';

  return (
    <Card className="flex items-start gap-4">
      <div className="flex-shrink-0 rounded-lg bg-blue-50 p-2.5 text-blue-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className={`mt-0.5 text-2xl font-bold ${statusColors[status]}`}>
          {displayValue}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        )}
      </div>
    </Card>
  );
}
