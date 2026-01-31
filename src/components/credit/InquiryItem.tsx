import type { Inquiry } from '../../types/index.ts';
import { formatDate, safeDisplay } from '../../utils/formatters.ts';

interface Props {
  inquiry: Inquiry;
}

export default function InquiryItem({ inquiry }: Props) {
  const isHard = inquiry.type?.toLowerCase() !== 'soft';

  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
          isHard ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
        }`}
      >
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
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {safeDisplay(inquiry.creditor_name, 'Unknown Creditor')}
        </p>
        <p className="text-xs text-slate-500">
          {formatDate(inquiry.date)}
          {inquiry.bureau && <> &middot; {inquiry.bureau}</>}
        </p>
      </div>
      <span
        className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isHard
            ? 'bg-orange-50 text-orange-700'
            : 'bg-blue-50 text-blue-700'
        }`}
      >
        {isHard ? 'Hard' : 'Soft'}
      </span>
    </div>
  );
}
