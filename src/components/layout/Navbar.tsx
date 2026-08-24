import React from 'react';
import { useAml } from '../../context/AmlContext';
import {
  Search,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentRoute, navigateTo, casos, resetToDefaults } = useAml();

  const pendingCount = casos.filter((c) => c.status === 'Pendente' || c.status === 'Em Análise').length;
  const isInvestigation = currentRoute.startsWith('/investigacao');

  const navItems = [
    {
      id: 'triagem',
      route: '/',
      label: 'Fila de Triagem',
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-zinc-900 text-[#FFCC01]',
    },
    {
      id: 'regras',
      route: '/regras',
      label: 'Motor de Regras & Simulador',
    },
    {
      id: 'lotes-coe',
      route: '/lotes-coe',
      label: 'Lotes COE (Espécie >= 50k)',
      badge: 'SISCOAF',
      badgeColor: 'bg-zinc-100 text-zinc-800 border border-zinc-300 font-bold',
    },
    {
      id: 'dashboard',
      route: '/dashboard',
      label: 'Painel Gerencial',
    },
  ];

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-40 select-none">
      {/* Top Main Row */}
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Title sem logos nem subtitulo poluente */}
        <div className="flex items-center gap-4">
          {isInvestigation ? (
            <button
              onClick={() => navigateTo('/')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para a Triagem</span>
            </button>
          ) : (
            <div 
              onClick={() => navigateTo('/')}
              className="cursor-pointer"
            >
              <h1 className="font-black text-sm tracking-tight text-zinc-950 uppercase">
                Prevenção a Lavagem de Dinheiro
              </h1>
            </div>
          )}
        </div>

        {/* Center Search bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Nome, CPF/CNPJ ou Alerta..."
              className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-400 text-xs text-zinc-900 rounded-md pl-8 pr-3 py-1.5 placeholder-zinc-400 transition-colors outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.toLowerCase();
                  const found = casos.find(
                    (c) =>
                      c.nome.toLowerCase().includes(val) ||
                      c.cpf.includes(val) ||
                      c.alertaId.toLowerCase().includes(val) ||
                      c.kyc.cidadeUf.toLowerCase().includes(val)
                  );
                  if (found) {
                    navigateTo(`/investigacao/${found.id}`);
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Right Tools & User */}
        <div className="flex items-center gap-3">
          {/* Reset Mock */}
          <button
            onClick={resetToDefaults}
            title="Restaurar dados de demonstração"
            className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Restaurar</span>
          </button>

          {/* Analyst Profile */}
          <div className="flex items-center gap-2 pl-3 border-l border-zinc-200 text-xs">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-zinc-900">Maísa Ramos</div>
              <div className="text-[10px] text-zinc-500">Compliance PLD/FT</div>
            </div>
            <div className="w-7 h-7 rounded bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-800">
              MR
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Tabs Row */}
      {!isInvestigation && (
        <div className="px-6 bg-zinc-50 border-t border-zinc-200 flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive =
              item.route === '/'
                ? currentRoute === '/' || currentRoute === '' || currentRoute === '/triagem'
                : currentRoute.startsWith(item.route);

            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.route)}
                className={`py-2 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#FFCC01] text-zinc-950 bg-white'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${item.badgeColor || 'bg-zinc-200 text-zinc-800'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
