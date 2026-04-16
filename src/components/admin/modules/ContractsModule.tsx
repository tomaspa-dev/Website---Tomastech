import React from 'react';
import { FileSignature, Construction } from 'lucide-react';

// TODO: Full implementation coming next
export function ContractsModule({ onNavigate }: { onNavigate?: (id: any) => void } = {}) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-slate-500">
      <Construction size={48} className="mb-4 opacity-30" />
      <h2 className="text-xl font-semibold text-slate-400 mb-1">Contracts</h2>
      <p className="text-sm">Módulo en construcción — próxima entrega</p>
    </div>
  );
}
