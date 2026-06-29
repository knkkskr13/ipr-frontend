import type { ReactNode } from 'react';
import { Emblem } from './Emblem';

interface AuthLayoutProps {
  tagline: string;
  children: ReactNode;
  cardClassName?: string;
}

export function AuthLayout({ tagline, children, cardClassName = 'max-w-md' }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{
        background: 'linear-gradient(135deg, #1a3a8f 0%, #2952cc 50%, #1e40af 100%)',
      }}
    >
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="flex items-center gap-3 mb-1">
          <Emblem className="w-14 h-14 drop-shadow-md" />
          <div className="text-left">
            <p className="text-white font-bold text-xl leading-tight">Government of Tripura</p>
            <p className="text-blue-200 font-bold text-lg">National Informatics Centre (NIC)</p>
          </div>
        </div>
        <p className="text-blue-100 underline font-bold text-lg mt-2 tracking-wide">{tagline}</p>
      </div>

      <div className={`bg-white rounded-2xl shadow-2xl w-full ${cardClassName} px-8 py-7`}>
        {children}
      </div>

      <p className="text-blue-200 text-xs mt-6">© 2026 Government of Tripura. All rights reserved.</p>
    </div>
  );
}
