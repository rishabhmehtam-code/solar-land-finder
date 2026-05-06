import { ReactNode } from 'react';
import { UserButton } from '@clerk/nextjs';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-blue-600">☀️</span>
            <span className="font-semibold text-slate-900">Solar Land Finder</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
