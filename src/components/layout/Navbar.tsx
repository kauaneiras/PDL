import React from 'react';
import { useAml } from '../../context/AmlContext';
import { ArrowLeft } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentRoute, navigateTo, casos, currentUserRole, setCurrentUserRole, showToast } = useAml();

  const pendingCount = casos.filter((c) => c.status === 'Pendente' || c.status === 'Em Análise' || c.status === 'Diligência').length;
  const direxPendingCount = casos.filter(
    (c) => c.status === 'Aguardando Assinatura DIREX' || (c.status === 'Comunicado COAF' && !c.deliberacaoDirex?.aprovadoPor)
  ).length;
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
      id: 'direx',
      route: '/direx',
      label: 'Aprovação DIREX',
      badge: direxPendingCount > 0 ? `${direxPendingCount} pendentes` : null,
      badgeColor: 'bg-purple-100 text-purple-900 border border-purple-300 font-bold',
    },
    {
      id: 'bi',
      route: '/bi',
      label: 'Business Intelligence & BI',
      badge: 'Novo',
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
    },
    {
      id: 'flow-manager',
      route: '/flow-manager',
      label: 'Flow Manager (Scores)',
      badge: 'SQL Proc',
      badgeColor: 'bg-zinc-100 text-zinc-800 border border-zinc-300 font-bold',
    },
    {
      id: 'imoveis',
      route: '/imoveis',
      label: 'Cruzamento Imóveis',
    },
    {
      id: 'auditoria',
      route: '/auditoria',
      label: 'Consulta & Auditoria Histórica',
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
    <>
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40 select-none">
        {/* Top Main Row */}
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Title or Back button */}
          <div className="flex items-center gap-4">
            {isInvestigation ? (
              <button
                onClick={() => navigateTo('/')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-bold border border-[#E5B700] transition-colors cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 text-black" />
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

          {/* Right: Active Role & Profile Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 mr-2">
              <button
                onClick={() => {
                  const nextRole = currentUserRole === 'ANALISTA' ? 'DIRETORIA' : 'ANALISTA';
                  setCurrentUserRole(nextRole);
                  showToast(
                    nextRole === 'DIRETORIA'
                      ? 'Perfil alternado para Diretoria Executiva (DIREX - Dr. Roberto Guimarães)'
                      : 'Perfil alternado para Analista de PLD (Maísa Ramos)',
                    'info'
                  );
                }}
                className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 shadow-2xs ${
                  currentUserRole === 'DIRETORIA'
                    ? 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                    : 'bg-zinc-100 text-zinc-900 border-zinc-300 hover:bg-zinc-200'
                }`}
                title="Alternar entre perfil de Analista e Diretoria (DIREX)"
              >
                <span>{currentUserRole === 'DIRETORIA' ? '🛡️ DIREX' : '👤 Analista'}</span>
                <span className="text-[10px] text-zinc-500 font-normal">⇄</span>
              </button>
            </div>

            <div className="text-right hidden sm:block">
              <div className="font-bold text-zinc-900">
                {currentUserRole === 'DIRETORIA' ? 'Dr. Roberto Guimarães' : 'Maísa Ramos'}
              </div>
              <div className="text-[10px] text-zinc-500">
                {currentUserRole === 'DIRETORIA' ? 'Diretor de Riscos (DIREX)' : 'Compliance PLD/FT'}
              </div>
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-xs ${
                currentUserRole === 'DIRETORIA'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-[#FFCC01] border border-[#E5B700] text-black font-black'
              }`}
            >
              {currentUserRole === 'DIRETORIA' ? 'RG' : 'MR'}
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
    </>
  );
};
