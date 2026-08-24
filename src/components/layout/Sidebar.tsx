import React from 'react';
import { useAml } from '../../context/AmlContext';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { currentRoute, navigateTo, activeCaseId, casos, setActiveCaseId } = useAml();

  const isInvestigation = currentRoute.startsWith('/investigacao');
  const pendingCount = casos.filter((c) => c.status === 'Pendente').length;

  return (
    <aside className="w-56 bg-white border-r border-zinc-200 flex flex-col justify-between h-[calc(100vh-3.5rem)] shrink-0 select-none z-20">
      <div className="py-3 px-3 flex flex-col gap-4 overflow-y-auto">
        {/* Navigation Sections */}
        <div>
          <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
            Módulos
          </div>
          <nav className="space-y-0.5">
            {/* Triagem */}
            <button
              onClick={() => navigateTo('/')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                currentRoute === '/' || currentRoute === '/triagem' || currentRoute === '/alertas'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <span>Fila de Triagem</span>
              {pendingCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  currentRoute === '/' || currentRoute === '/triagem' || currentRoute === '/alertas'
                    ? 'bg-[#FFCC01] text-zinc-950'
                    : 'bg-zinc-200 text-zinc-800'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Regras */}
            <button
              onClick={() => navigateTo('/regras')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                currentRoute === '/regras'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <span>Motor de Regras</span>
            </button>

            {/* Lotes COE */}
            <button
              onClick={() => navigateTo('/lotes-coe')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                currentRoute === '/lotes-coe'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <span>Lotes COE (Espécie)</span>
            </button>

            {/* Dashboard */}
            <button
              onClick={() => navigateTo('/dashboard')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                currentRoute === '/dashboard'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <span>Painel Gerencial</span>
            </button>
          </nav>
        </div>

        {/* Investigação em Andamento / Seletor Rápido */}
        <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 font-mono">
              Casos em Aberto
            </span>
            <span className="text-[10px] font-mono text-zinc-600">{casos.length}</span>
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5">
            {casos.map((caso) => {
              const isSelected = activeCaseId === caso.id && isInvestigation;
              return (
                <div
                  key={caso.id}
                  onClick={() => {
                    setActiveCaseId(caso.id);
                    navigateTo(`/investigacao/${caso.id}`);
                  }}
                  className={`p-2 rounded text-left cursor-pointer transition-colors border ${
                    isSelected
                      ? 'bg-white border-zinc-900 ring-1 ring-zinc-900'
                      : 'bg-white border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-950 truncate max-w-[110px]">
                      {caso.nome.split(' ')[0]} {caso.nome.split(' ')[1] || ''}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase text-zinc-700">
                      {caso.risco}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-500 font-mono">
                    <span>{caso.cpf}</span>
                    <span className="font-medium text-zinc-800">
                      SLA: {caso.slaHorasRestantes}h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-zinc-200 bg-zinc-50 text-[11px] text-zinc-500 flex justify-between font-mono">
        <span>PLD/FT</span>
        <span>v3.4</span>
      </div>
    </aside>
  );
};
