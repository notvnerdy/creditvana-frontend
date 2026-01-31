import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCreditScore, orderCreditScore } from '../api/client.ts';
import type { CreditScoreResponse, APIError } from '../types/index.ts';
import CreditScoreGauge from '../components/credit/CreditScoreGauge.tsx';
import CreditFactorCard from '../components/credit/CreditFactorCard.tsx';
import Card from '../components/common/Card.tsx';
import Button from '../components/common/Button.tsx';
import Alert from '../components/common/Alert.tsx';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import StatusBadge from '../components/common/StatusBadge.tsx';
import { formatDate, parseUtilization, getScoreRating, ratingBgColor, ratingLabel } from '../utils/formatters.ts';

export default function DashboardPage() {
  const [data, setData] = useState<CreditScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchScore = useCallback(async () => {
    setError('');
    try {
      const resp = await getCreditScore();
      setData(resp);
    } catch (err) {
      const apiErr = err as APIError;
      setError(apiErr.message || 'Unable to load your credit data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      const resp = await orderCreditScore();
      setData(resp);
    } catch (err) {
      const apiErr = err as APIError;
      setError(apiErr.message || 'Unable to refresh your score. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <LoadingSpinner size="lg" label="Loading your credit dashboard..." className="min-h-[400px]" />
      </div>
    );
  }

  const score = data?.credit_score ?? null;
  const quickView = data?.quick_view;
  const scoreDate = data?.date;
  const rating = getScoreRating(score);
  const utilization = parseUtilization(quickView?.utilization);

  // Determine utilization status
  const utilStatus: 'good' | 'warning' | 'critical' | 'neutral' =
    utilization == null
      ? 'neutral'
      : utilization <= 30
        ? 'good'
        : utilization <= 50
          ? 'warning'
          : 'critical';

  // Determine inquiry status
  const inquiryCount = quickView?.inquiries;
  const inquiryStatus: 'good' | 'warning' | 'critical' | 'neutral' =
    inquiryCount == null
      ? 'neutral'
      : inquiryCount <= 2
        ? 'good'
        : inquiryCount <= 5
          ? 'warning'
          : 'critical';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Credit Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your credit score overview and key factors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh Score
          </Button>
          <Link to="/report">
            <Button size="sm">View Full Report</Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Score card */}
      <Card className="mb-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-12">
          {/* Gauge */}
          <div className="flex flex-col items-center">
            <CreditScoreGauge score={score} />
          </div>

          {/* Score meta */}
          <div className="flex flex-1 flex-col items-center gap-4 text-center md:items-start md:pt-4 md:text-left">
            <div>
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${ratingBgColor(rating)}`}>
                  {ratingLabel(rating)}
                </span>
                {score != null && (
                  <StatusBadge status="verified" label="Score Available" />
                )}
                {score == null && (
                  <StatusBadge status="pending" label="Score Pending" />
                )}
              </div>
            </div>

            {quickView?.bureau && (
              <div className="text-sm text-slate-600">
                <span className="font-medium">Bureau:</span> {quickView.bureau}
              </div>
            )}

            {scoreDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last updated {formatDate(scoreDate)}
              </div>
            )}

            {score != null && (
              <div className="max-w-sm text-sm text-slate-500">
                {score >= 740
                  ? 'Your score is in great shape. Keep up the good work with on-time payments and low credit utilization.'
                  : score >= 670
                    ? 'Your score is solid. Focus on reducing balances and avoiding new hard inquiries to improve further.'
                    : score >= 580
                      ? 'Your score has room for improvement. Pay all bills on time and work on reducing outstanding balances.'
                      : 'Focus on building your credit by making on-time payments and keeping credit card balances low.'}
              </div>
            )}

            {score == null && (
              <div className="max-w-sm text-sm text-slate-500">
                Your credit score is being processed. This may take a moment.
                Try refreshing if your score doesn&apos;t appear shortly.
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Quick view factor cards */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Key Factors</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CreditFactorCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            }
            label="Credit Utilization"
            value={quickView?.utilization ?? null}
            description={
              utilization != null
                ? utilization <= 30
                  ? 'Utilization is in a healthy range'
                  : 'Consider paying down balances'
                : undefined
            }
            status={utilStatus}
          />

          <CreditFactorCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            }
            label="Hard Inquiries"
            value={inquiryCount ?? null}
            description={
              inquiryCount != null
                ? inquiryCount <= 2
                  ? 'Low number of inquiries'
                  : 'Multiple recent inquiries detected'
                : undefined
            }
            status={inquiryStatus}
          />

          <CreditFactorCard
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            }
            label="Public Records"
            value={quickView?.public_records ?? null}
            description={
              quickView?.public_records != null
                ? quickView.public_records === 0
                  ? 'No public records found'
                  : 'Public records may affect your score'
                : undefined
            }
            status={
              quickView?.public_records == null
                ? 'neutral'
                : quickView.public_records === 0
                  ? 'good'
                  : 'critical'
            }
          />
        </div>
      </div>

      {/* Actions */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Want to see more details?
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              View your complete credit report including all tradelines, inquiries,
              and public records.
            </p>
          </div>
          <Link to="/report" className="flex-shrink-0">
            <Button>View Credit Report</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
