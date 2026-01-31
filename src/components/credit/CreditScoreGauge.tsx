import {
  getScoreRating,
  ratingLabel,
  ratingColor,
  ratingStrokeColor,
} from '../../utils/formatters.ts';

interface Props {
  score: number | null | undefined;
  maxScore?: number;
  minScore?: number;
  className?: string;
}

export default function CreditScoreGauge({
  score,
  maxScore = 850,
  minScore = 300,
  className = '',
}: Props) {
  const rating = getScoreRating(score);
  const strokeColor = ratingStrokeColor(rating);

  // SVG arc calculation
  const radius = 80;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // semicircle
  const range = maxScore - minScore;
  const normalizedScore =
    score != null && score >= minScore
      ? Math.min((score - minScore) / range, 1)
      : 0;
  const dashOffset = circumference * (1 - normalizedScore);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <svg
          width="200"
          height="120"
          viewBox="0 0 200 120"
          className="overflow-visible"
          role="img"
          aria-label={
            score != null
              ? `Credit score: ${score} out of ${maxScore}, rated ${ratingLabel(rating)}`
              : 'Credit score not available'
          }
        >
          {/* Background arc */}
          <path
            d="M 10 110 A 80 80 0 0 1 190 110"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Score arc */}
          {score != null && score >= minScore && (
            <path
              d="M 10 110 A 80 80 0 0 1 190 110"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>

        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span
            className={`text-5xl font-bold tracking-tight ${
              score != null ? ratingColor(rating) : 'text-slate-300'
            }`}
          >
            {score != null ? score : '---'}
          </span>
        </div>
      </div>

      {/* Rating label */}
      <div className="mt-1 text-center">
        <p className={`text-lg font-semibold ${ratingColor(rating)}`}>
          {ratingLabel(rating)}
        </p>
        <p className="text-xs text-slate-400">
          {minScore} – {maxScore} range
        </p>
      </div>
    </div>
  );
}
