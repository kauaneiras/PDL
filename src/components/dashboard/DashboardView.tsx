import React, { useState, useMemo } from 'react';
import { useAml } from '../../context/AmlContext';
import { mockDashboardData } from '../../data/mock-data';
import {
  Calendar,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { casos, navigateTo, setActiveCaseId } = useAml();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Filtros de Data e Período
  const [periodoFiltro, setPeriodoFiltro] = useState<'Hoje' | '7D' | '30D' | 'MesAtual' | 'Custom'>('MesAtual');
  const [dataInicio, setDataInicio] = useState<string>('2026-08-01');
  const [dataFim, setDataFim] = useState<string>('2026-08-24');

  // Dynamic counts based on live context
  const pendingCases = useMemo(
    () => casos.filter((c) => c.status === 'Pendente' || c.status === 'Em Análise'),
    [casos]
  );
  const coafCount = useMemo(
    () => casos.filter((c) => c.status === 'Comunicado COAF').length + mockDashboardData.kpis.casosComunicadosCoafMes,
    [casos]
  );
  const archivedCount = useMemo(
    () => casos.filter((c) => c.status === 'Arquivado').length + mockDashboardData.kpis.falsosPositivosArquivados,
    [casos]
  );

  const maxVolume = Math.max(...mockDashboardData.volumePorDia.map((d) => d.volume));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto max-h-[calc(100vh-3.5rem)] bg-zinc-50 font-sans">
      {/* Top Banner & Header com Filtro de Data */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-zinc-950 tracking-tight">
              Painel Gerencial de PLD/FT
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFCC01] text-zinc-950">
              Visão Executiva
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Métricas de conformidade, volume de atipicidades financeiras e cumprimento de prazos regulatórios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor Rápido de Período */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-md p-0.5 text-xs font-semibold">
            {(['Hoje', '7D', '30D', 'MesAtual'] as const).map((p) => {
              const labels: Record<string, string> = {
                Hoje: 'Hoje',
                '7D': 'Últimos 7 dias',
                '30D': '30 dias',
                MesAtual: 'Mês Atual (Ago/2026)',
              };
              return (
                <button
                  key={p}
                  onClick={() => setPeriodoFiltro(p)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    periodoFiltro === p
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          {/* Inputs de Data Início / Fim */}
          <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-md px-2 py-1 text-xs text-zinc-700">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => {
                setDataInicio(e.target.value);
                setPeriodoFiltro('Custom');
              }}
              className="bg-transparent text-xs text-zinc-800 outline-none cursor-pointer"
            />
            <span className="text-zinc-400">até</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => {
                setDataFim(e.target.value);
                setPeriodoFiltro('Custom');
              }}
              className="bg-transparent text-xs text-zinc-800 outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => navigateTo('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FFCC01] hover:bg-[#E5B700] text-black font-bold text-xs border border-[#E5B700] transition-colors cursor-pointer shadow-xs"
          >
            <span>Ver Fila ({casos.length})</span>
            <ChevronRight className="w-3.5 h-3.5 text-black" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Alertas Pendentes */}
        <div className="p-4 rounded-lg bg-white border border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Alertas Pendentes
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-950 font-mono">{pendingCases.length}</span>
            <span className="text-[11px] text-zinc-700 font-bold bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">
              5 Críticos
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Exigem deliberação em até 24h
          </p>
        </div>

        {/* KPI 2: Casos Comunicados ao COAF */}
        <div className="p-4 rounded-lg bg-white border border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Comunicados COAF
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-950 font-mono">{coafCount}</span>
            <span className="text-[11px] text-zinc-700 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3 text-zinc-600" /> +18% vs mês anterior
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Comunicações transmitidas via SISCOAF
          </p>
        </div>

        {/* KPI 3: Falsos Positivos Arquivados */}
        <div className="p-4 rounded-lg bg-white border border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Arquivamentos Justificados
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-950 font-mono">{archivedCount}</span>
            <span className="text-[11px] text-zinc-700 font-bold">
              82% da triagem
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Atipicidades justificadas e registradas
          </p>
        </div>

        {/* KPI 4: SLA Médio de Resolução */}
        <div className="p-4 rounded-lg bg-white border border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              SLA Médio de Análise
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-950 font-mono">
              {mockDashboardData.kpis.slaMedioHoras}h
            </span>
            <span className="text-[11px] text-zinc-700 font-bold">
              Meta: &lt; 24h
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            98.4% de conformidade tempestiva
          </p>
        </div>
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Bar Chart of Financial Volume */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-white border border-zinc-200 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200">
              <div>
                <h2 className="text-sm font-bold text-zinc-950">
                  Volume Financeiro Monitorado por Dia
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Montante monetário acumulado em operações com alerta
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-500 block">Total do Período</span>
                <span className="text-sm font-bold text-zinc-950 font-mono">
                  {formatCurrency(mockDashboardData.kpis.volumeMonitoradoSemana)}
                </span>
              </div>
            </div>

            {/* Custom High-Contrast Interactive Bar Chart */}
            <div className="mt-6 pt-4 pb-2">
              <div className="h-48 flex items-end gap-3 sm:gap-6 justify-between px-2">
                {mockDashboardData.volumePorDia.map((item, idx) => {
                  const heightPercent = Math.max(12, Math.round((item.volume / maxVolume) * 100));
                  const isHovered = selectedDayIndex === idx;

                  return (
                    <div
                      key={item.dia}
                      onMouseEnter={() => setSelectedDayIndex(idx)}
                      onMouseLeave={() => setSelectedDayIndex(null)}
                      className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative h-full justify-end"
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-12 z-30 bg-zinc-900 text-white border border-zinc-700 rounded p-1.5 text-center shadow-lg min-w-[120px] pointer-events-none text-xs">
                          <div className="text-[10px] text-zinc-400">{item.dia}</div>
                          <div className="font-bold text-[#FFCC01] font-mono">
                            {formatCurrency(item.volume)}
                          </div>
                          <div className="text-[10px] text-zinc-300">
                            {item.alertas} alertas ({item.criticos} críticos)
                          </div>
                        </div>
                      )}

                      {/* Top value */}
                      <span className="text-[10px] font-mono text-zinc-500 font-medium">
                        {(item.volume / 1000).toFixed(0)}k
                      </span>

                      {/* Bar Column */}
                      <div
                        className="w-full max-w-[38px] bg-zinc-100 rounded-t relative overflow-hidden flex flex-col justify-end transition-all group-hover:bg-zinc-200"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div
                          className="w-full bg-[#FFCC01] hover:bg-[#E5B700] transition-colors rounded-t"
                          style={{ height: '100%' }}
                        />
                        {item.criticos > 0 && (
                          <div className="absolute top-0 inset-x-0 h-1 bg-zinc-900" title="Contém alertas críticos" />
                        )}
                      </div>

                      {/* Day Label */}
                      <span className="text-[11px] font-medium text-zinc-600 truncate max-w-full text-center">
                        {item.dia.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-200 mt-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#FFCC01] border border-amber-400" />
                Volume Monitorado (BRL)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-zinc-900" />
                Alerta Crítico Presente
              </span>
            </div>
            <span className="font-mono text-[11px]">Atualizado a cada 5 minutos</span>
          </div>
        </div>

        {/* Right Col: Risk Matrix & Most Common Typologies */}
        <div className="space-y-4 flex flex-col">
          {/* Risk Level Distribution */}
          <div className="p-5 rounded-lg bg-white border border-zinc-200">
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider mb-3">
              Distribuição por Nível de Risco
            </h3>

            <div className="space-y-2.5">
              {mockDashboardData.distribuicaoRisco.map((item) => (
                <div key={item.nivel} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-700">
                      {item.nivel}
                    </span>
                    <span className="font-mono text-zinc-600">
                      {item.total} casos ({item.percentual}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-zinc-800 transition-all"
                      style={{ width: `${item.percentual}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Typologies */}
          <div className="p-5 rounded-lg bg-white border border-zinc-200 flex-1">
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider mb-3">
              Tipologias Mais Frequentes
            </h3>

            <div className="space-y-2 text-xs">
              {mockDashboardData.tipologiasFrequentes.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-zinc-50 border border-zinc-200 flex items-center justify-between"
                >
                  <span className="text-zinc-700 font-medium truncate max-w-[200px]" title={tip.nome}>
                    {tip.nome}
                  </span>
                  <span className="font-mono font-bold text-zinc-900 bg-white border border-zinc-200 px-2 py-0.5 rounded text-[11px]">
                    {tip.perc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Cases Queue preview */}
      <div className="p-5 rounded-lg bg-white border border-zinc-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-950">
              Casos Prioritários com SLA Crítico (&lt; 24 Horas)
            </h2>
            <p className="text-xs text-zinc-500">
              Selecione o registro para abrir diretamente a Ficha de Investigação
            </p>
          </div>
          <button
            onClick={() => navigateTo('/')}
            className="px-3 py-1.5 rounded-md bg-[#FFCC01] hover:bg-[#E5B700] text-black font-bold text-xs border border-[#E5B700] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          >
            <span>Ver todos ({casos.length})</span>
            <ChevronRight className="w-3.5 h-3.5 text-black" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {casos.map((caso) => (
            <div
              key={caso.id}
              onClick={() => setActiveCaseId(caso.id)}
              className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 hover:border-zinc-400 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-zinc-950 truncate max-w-[180px]">
                  {caso.nome}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-zinc-200 text-zinc-900">
                  {caso.risco}
                </span>
              </div>

              <p className="text-[11px] text-zinc-600 line-clamp-1 mb-2">
                {caso.regraDisparada}
              </p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200 text-zinc-600 font-mono">
                <span className="font-medium text-zinc-900">{formatCurrency(caso.valorEnvolvido)}</span>
                <span className="font-bold text-zinc-900">
                  SLA: {caso.slaHorasRestantes}h
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
