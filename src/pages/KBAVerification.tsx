import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import {
  getVerificationQuestions,
  submitVerificationAnswers,
} from '../api/client.ts';
import type { KBAQuestion, KBAStatus, APIError } from '../types/index.ts';
import Button from '../components/common/Button.tsx';
import Alert from '../components/common/Alert.tsx';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';

const MAX_ATTEMPTS = 3;

type PageState = 'loading' | 'questions' | 'submitting' | 'success' | 'locked' | 'thin-file' | 'error';

export default function KBAVerificationPage() {
  const { kbaPassed, handleKBAPassed } = useAuth();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [questions, setQuestions] = useState<KBAQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [attempt, setAttempt] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [round, setRound] = useState(1);

  // If already verified, redirect to dashboard
  useEffect(() => {
    if (kbaPassed) {
      navigate('/dashboard', { replace: true });
    }
  }, [kbaPassed, navigate]);

  const fetchQuestions = useCallback(async () => {
    setPageState('loading');
    setErrorMessage('');
    setSelectedAnswers({});

    try {
      const data = await getVerificationQuestions();
      if (!Array.isArray(data) || data.length === 0) {
        setPageState('error');
        setErrorMessage(
          'No verification questions available. Please contact support.',
        );
        return;
      }
      setQuestions(data);
      setPageState('questions');
    } catch (err) {
      const apiErr = err as APIError;
      setPageState('error');
      setErrorMessage(
        apiErr.message || 'Unable to load verification questions. Please try again.',
      );
    }
  }, []);

  useEffect(() => {
    if (!kbaPassed) {
      fetchQuestions();
    }
  }, [kbaPassed, fetchQuestions]);

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const allAnswered = questions.length > 0 && questions.every((q) => selectedAnswers[q.questionId]);

  const handleSubmit = async () => {
    if (!allAnswered) return;

    setPageState('submitting');
    setErrorMessage('');

    const answers = questions.map((q) => ({
      questionId: q.questionId,
      answer: selectedAnswers[q.questionId] ?? '',
    }));

    try {
      const resp = await submitVerificationAnswers({ answers });
      const status: KBAStatus = resp.status;

      switch (status) {
        case 'Correct':
          setPageState('success');
          handleKBAPassed();
          // Auto-navigate after brief success message
          setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
          break;

        case 'MoreQuestions':
          setRound((prev) => prev + 1);
          setSelectedAnswers({});
          // Fetch the next set of questions
          fetchQuestions();
          break;

        case 'Incorrect': {
          const nextAttempt = attempt + 1;
          if (nextAttempt > MAX_ATTEMPTS) {
            setPageState('locked');
          } else {
            setAttempt(nextAttempt);
            setPageState('questions');
            setSelectedAnswers({});
            setErrorMessage(
              `Some answers were incorrect. You have ${MAX_ATTEMPTS - attempt} attempt${
                MAX_ATTEMPTS - attempt === 1 ? '' : 's'
              } remaining.`,
            );
            // Fetch fresh questions for retry
            fetchQuestions();
          }
          break;
        }

        case 'accountCodeMissing':
          setPageState('thin-file');
          break;

        default:
          setPageState('error');
          setErrorMessage(
            resp.message || 'An unexpected response was received. Please contact support.',
          );
      }
    } catch (err) {
      const apiErr = err as APIError;
      setPageState('questions');
      setErrorMessage(
        apiErr.message || 'Unable to verify your answers. Please try again.',
      );
    }
  };

  // ─── Render states ────────────────────────────

  if (pageState === 'loading') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <LoadingSpinner size="lg" label="Loading verification questions..." className="min-h-[300px]" />
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <svg
              className="h-8 w-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Identity Verified</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your identity has been successfully confirmed. Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (pageState === 'locked') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Verification Locked</h2>
          <p className="mt-2 text-sm text-slate-500">
            You&apos;ve reached the maximum number of verification attempts.
            For your security, please contact our support team to complete verification.
          </p>
          <div className="mt-6">
            <Alert variant="info">
              Please allow 24 hours before attempting verification again, or contact support for assistance.
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (pageState === 'thin-file') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-xl border border-yellow-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Unable to Verify Identity
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            We were unable to generate verification questions based on your credit history.
            This can happen if you have a limited credit file.
          </p>
          <div className="mt-6">
            <Alert variant="warning">
              Please contact our support team for alternative verification methods.
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (pageState === 'error' && questions.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Alert variant="error" className="mb-6">
            {errorMessage || 'Something went wrong. Please try again.'}
          </Alert>
          <Button onClick={fetchQuestions}>Retry</Button>
        </div>
      </div>
    );
  }

  // ─── Questions view ────────────────────────────

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Verify Your Identity</h1>
        <p className="mt-2 text-sm text-slate-500">
          Please answer the following questions to confirm your identity.
          {round > 1 && ' (Additional questions required)'}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-xs text-slate-400">
            Attempt {attempt} of {MAX_ATTEMPTS}
          </span>
          {round > 1 && (
            <span className="text-xs text-blue-500">
              &middot; Round {round}
            </span>
          )}
        </div>
      </div>

      {errorMessage && (
        <Alert variant="warning" className="mb-6" onDismiss={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <div className="space-y-6">
        {questions.map((question, idx) => (
          <div
            key={question.questionId}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="mb-3 text-sm font-semibold text-slate-900">
              <span className="mr-2 text-blue-600">{idx + 1}.</span>
              {question.text}
            </p>
            <div className="space-y-2">
              {(question.choices ?? []).map((choice) => {
                const isSelected = selectedAnswers[question.questionId] === choice;
                return (
                  <label
                    key={choice}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.questionId}
                      value={choice}
                      checked={isSelected}
                      onChange={() => handleSelectAnswer(question.questionId, choice)}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                      disabled={pageState === 'submitting'}
                    />
                    <span
                      className={`text-sm ${
                        isSelected ? 'font-medium text-blue-900' : 'text-slate-700'
                      }`}
                    >
                      {choice}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Button
          onClick={handleSubmit}
          loading={pageState === 'submitting'}
          disabled={!allAnswered}
          className="w-full"
          size="lg"
        >
          {pageState === 'submitting' ? 'Verifying...' : 'Submit Answers'}
        </Button>
        {!allAnswered && (
          <p className="mt-2 text-center text-xs text-slate-400">
            Please answer all questions to continue
          </p>
        )}
      </div>

      <div className="mt-6 rounded-lg bg-slate-50 p-4">
        <p className="text-xs text-slate-500">
          <strong>Why are we asking these questions?</strong> These questions are
          based on information from your credit file and help us confirm your
          identity. This is a standard security measure used by financial
          institutions.
        </p>
      </div>
    </div>
  );
}
