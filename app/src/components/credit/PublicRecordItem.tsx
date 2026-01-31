import type { PublicRecord } from '../../types/index.ts';
import { formatDate, formatCurrency, safeDisplay } from '../../utils/formatters.ts';

interface Props {
  record: PublicRecord;
}

export default function PublicRecordItem({ record }: Props) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50/30 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-slate-900">
            {safeDisplay(record.type, 'Public Record')}
          </h4>
          {record.court_name && (
            <p className="text-xs text-slate-600">{record.court_name}</p>
          )}
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <p className="text-sm font-medium text-slate-700">
                {safeDisplay(record.status)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Date Filed</p>
              <p className="text-sm font-medium text-slate-700">
                {formatDate(record.date_filed)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Amount</p>
              <p className="text-sm font-medium text-slate-700">
                {formatCurrency(record.amount)}
              </p>
            </div>
          </div>
          {record.bureau && (
            <p className="mt-1 text-xs text-slate-400">
              Reported by {record.bureau}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
