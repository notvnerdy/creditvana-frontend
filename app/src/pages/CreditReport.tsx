import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCreditReport } from '../api/client.ts';
import type { CreditReportResponse, APIError } from '../types/index.ts';
import TradelineItem from '../components/credit/TradelineItem.tsx';
import InquiryItem from '../components/credit/InquiryItem.tsx';
import PublicRecordItem from '../components/credit/PublicRecordItem.tsx';
import Card from '../components/common/Card.tsx';
import Button from '../components/common/Button.tsx';
import Alert from '../components/common/Alert.tsx';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import EmptyState from '../components/common/EmptyState.tsx';

type Tab = 'tradelines' | 'inquiries' | 'public_records' | 'alerts';

export default function CreditReportPage() {
  const [report, setReport] = useState<CreditReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('tradelines');

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await getCreditReport();
      setReport(resp);
    } catch (err) {
      const apiErr = err as APIError;
      setError(
        apiErr.message || 'Unable to load your credit report. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <LoadingSpinner
          size="lg"
          label="Loading your credit report..."
          className="min-h-[400px]"
        />
      </div>
    );
  }

  const tradelines = report?.tradelines ?? [];
  const inquiries = report?.inquiries ?? [];
  const publicRecords = report?.public_records ?? [];
  const alerts = report?.alerts ?? [];

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'tradelines', label: 'Accounts', count: tradelines.length },
    { key: 'inquiries', label: 'Inquiries', count: inquiries.length },
    { key: 'public_records', label: 'Public Records', count: publicRecords.length },
    { key: 'alerts', label: 'Alerts', count: alerts.length },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Credit Report</h1>
          <p className="mt-1 text-sm text-slate-500">
            Detailed view of your credit file
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">
              Back to Dashboard
            </Button>
          </Link>
          <Button size="sm" onClick={fetchReport}>
            Refresh Report
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {!report && !error && (
        <Card>
          <EmptyState
            title="No Report Data Available"
            description="Your credit report data is not yet available. Please check back later or try refreshing."
            action={<Button onClick={fetchReport}>Retry</Button>}
          />
        </Card>
      )}

      {report && (
        <>
          {/* Summary bar */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card padding="sm" className="text-center">
              <p className="text-xs font-medium text-slate-500">Accounts</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{tradelines.length}</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-xs font-medium text-slate-500">Inquiries</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{inquiries.length}</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-xs font-medium text-slate-500">Public Records</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{publicRecords.length}</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-xs font-medium text-slate-500">Alerts</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{alerts.length}</p>
            </Card>
          </div>

          {/* Alerts banner */}
          {alerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {alerts.map((alert, idx) => (
                <Alert
                  key={idx}
                  variant={
                    alert.severity === 'critical'
                      ? 'error'
                      : alert.severity === 'warning'
                        ? 'warning'
                        : 'info'
                  }
                  title={alert.type}
                >
                  {alert.message ?? 'No additional details available.'}
                </Alert>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 border-b border-slate-200">
            <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Report sections">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                  aria-current={activeTab === tab.key ? 'page' : undefined}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activeTab === tab.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          {activeTab === 'tradelines' && (
            <div className="space-y-3">
              {tradelines.length === 0 ? (
                <EmptyState
                  title="No Accounts Found"
                  description="No tradeline or account data is currently available in your credit report."
                />
              ) : (
                tradelines.map((tl, idx) => (
                  <TradelineItem key={tl.account_number ?? idx} tradeline={tl} />
                ))
              )}
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="space-y-3">
              {inquiries.length === 0 ? (
                <EmptyState
                  title="No Inquiries"
                  description="No hard or soft inquiries found on your credit report. This is a positive indicator."
                />
              ) : (
                inquiries.map((inq, idx) => (
                  <InquiryItem key={`${inq.creditor_name}-${inq.date}-${idx}`} inquiry={inq} />
                ))
              )}
            </div>
          )}

          {activeTab === 'public_records' && (
            <div className="space-y-3">
              {publicRecords.length === 0 ? (
                <EmptyState
                  title="No Public Records"
                  description="No public records such as bankruptcies, liens, or judgments found. This is a positive indicator."
                />
              ) : (
                publicRecords.map((rec, idx) => (
                  <PublicRecordItem key={`${rec.type}-${rec.date_filed}-${idx}`} record={rec} />
                ))
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <EmptyState
                  title="No Alerts"
                  description="There are no alerts associated with your credit file at this time."
                />
              ) : (
                alerts.map((alert, idx) => (
                  <Alert
                    key={idx}
                    variant={
                      alert.severity === 'critical'
                        ? 'error'
                        : alert.severity === 'warning'
                          ? 'warning'
                          : 'info'
                    }
                    title={alert.type}
                  >
                    <div>
                      <p>{alert.message ?? 'No additional details available.'}</p>
                      {alert.date && (
                        <p className="mt-1 text-xs opacity-70">
                          {alert.date}
                        </p>
                      )}
                    </div>
                  </Alert>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
