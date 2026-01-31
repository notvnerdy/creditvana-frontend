import type { Tradeline } from '../../types/index.ts';
import { formatCurrency, formatDate, safeDisplay, maskAccountNumber } from '../../utils/formatters.ts';

interface Props {
  tradeline: Tradeline;
}

export default function TradelineItem({ tradeline }: Props) {
  const statusColor =
    tradeline.payment_status?.toLowerCase() === 'current' ||
    tradeline.status?.toLowerCase() === 'open'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : tradeline.payment_status?.toLowerCase()?.includes('late') ||
          tradeline.status?.toLowerCase() === 'derogatory'
        ? 'text-red-600 bg-red-50 border-red-200'
        : 'text-slate-600 bg-slate-50 border-slate-200';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Account info */}
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-slate-900">
            {safeDisplay(tradeline.creditor_name, 'Unknown Creditor')}
          </h4>
          <p className="mt-0.5 text-xs text-slate-500">
            {safeDisplay(tradeline.account_type)} &middot;{' '}
            {maskAccountNumber(tradeline.account_number)}
          </p>
          {tradeline.bureau && (
            <p className="mt-0.5 text-xs text-slate-400">
              Reported by {tradeline.bureau}
            </p>
          )}
        </div>

        {/* Right: Status */}
        <span
          className={`inline-flex items-center self-start rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
        >
          {safeDisplay(tradeline.payment_status ?? tradeline.status, 'Unknown')}
        </span>
      </div>

      {/* Details grid */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        <div>
          <p className="text-xs text-slate-400">Balance</p>
          <p className="text-sm font-medium text-slate-700">
            {formatCurrency(tradeline.balance)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Credit Limit</p>
          <p className="text-sm font-medium text-slate-700">
            {formatCurrency(tradeline.credit_limit)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Monthly Payment</p>
          <p className="text-sm font-medium text-slate-700">
            {formatCurrency(tradeline.monthly_payment)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Date Opened</p>
          <p className="text-sm font-medium text-slate-700">
            {formatDate(tradeline.date_opened)}
          </p>
        </div>
      </div>

      {tradeline.remarks && (
        <p className="mt-2 text-xs text-slate-500">
          <span className="font-medium">Remarks:</span> {tradeline.remarks}
        </p>
      )}
    </div>
  );
}
