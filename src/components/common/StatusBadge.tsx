type Status = 'verified' | 'pending' | 'failed' | 'locked' | 'unknown';

interface Props {
  status: Status;
  label?: string;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  locked: 'bg-slate-100 text-slate-600 border-slate-300',
  unknown: 'bg-slate-50 text-slate-500 border-slate-200',
};

const defaultLabels: Record<Status, string> = {
  verified: 'Verified',
  pending: 'Pending',
  failed: 'Failed',
  locked: 'Locked',
  unknown: 'Unknown',
};

export default function StatusBadge({ status, label, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]} ${className}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          status === 'verified'
            ? 'bg-emerald-500'
            : status === 'pending'
              ? 'bg-yellow-500'
              : status === 'failed'
                ? 'bg-red-500'
                : 'bg-slate-400'
        }`}
        aria-hidden="true"
      />
      {label ?? defaultLabels[status]}
    </span>
  );
}
