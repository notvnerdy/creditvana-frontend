import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({ children, className = '', padding = 'md' }: Props) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
