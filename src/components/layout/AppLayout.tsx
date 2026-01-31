import { Outlet } from 'react-router-dom';
import Header from './Header.tsx';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-sm text-slate-500">
              CreditVana &mdash; Secure Credit Monitoring
            </p>
            <p className="text-xs text-slate-400">
              Your data is encrypted and protected
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
