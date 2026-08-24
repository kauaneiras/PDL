import React, { useState, useMemo } from 'react';
import { useAml } from '../../context/AmlContext';
import {
  Search,
  FileSpreadsheet,
  Edit,
  Calendar
} from 'lucide-react';

export const AlertsQueueView: React.FC = () => {
  const { casos, setActiveCaseId, navigateTo } = useAml();

  const [busca, setBusca] = useState('');
  const [dataFiltro, setDataFiltro] = useState('20/08/2026');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedCategoryPill, setSelectedCategoryPill] = useState<string>('Todas');
  const [activeFilterPill, setActiveFilterPill] = useState<string | null>(null);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const pendentesCount = useMemo(() => casos.filter((c) => c.status === 'Pendente').length, [casos]);
  const emAnaliseCount = useMemo(() => casos.filter((c) => c.status === 'Em análise' || c.status === 'Em Análise').length, [casos]);
  const diligenciaCount = useMemo(() => casos.filter((c) => c.status === 'Diligência').length, [casos]);
  const coafCount = useMemo(() => casos.filter((c) => c.status === 'Comunicado COAF').length, [casos]);
  const arquivadosCount = useMemo(() => casos.filter((c) => c.status === 'Arquivado').length, [casos]);

  const filteredCasos = useMemo(() => {
    return casos.filter((caso) => {
      const matchSearch =
        busca.trim() === '' ||
        caso.nome.toLowerCase().includes(busca.toLowerCase()) ||
        caso.cpf.includes(busca) ||
        caso.tipologiaPld.toLowerCase().includes(busca.toLowerCase()) ||
        caso.regraDisparada.toLowerCase().includes(busca.toLowerCase()) ||
        (caso.regiaoNome && caso.regiaoNome.toLowerCase().includes(busca.toLowerCase())) ||
        (caso.alerta && caso.alerta.toLowerCase().includes(busca.toLowerCase()));

      let matchStatus = true;
      if (activeFilterPill) {
        if (activeFilterPill === 'Pendentes') matchStatus = caso.status === 'Pendente';
        if (activeFilterPill === 'Em analise') matchStatus = caso.status === 'Em análise' || caso.status === 'Em Análise';
        if (activeFilterPill === 'Diligência') matchStatus = caso.status === 'Diligência';
        if (activeFilterPill === 'COAF') matchStatus = caso.status === 'Comunicado COAF';
        if (activeFilterPill === 'Arquivados') matchStatus = caso.status === 'Arquivado';
      } else if (selectedStatus !== 'Todos') {
        matchStatus = caso.status.toLowerCase() === selectedStatus.toLowerCase();
      }

      let matchCategory = true;
      if (selectedCategoryPill !== 'Todas') {
        if (selectedCategoryPill === 'FronteiraMineracao') {
          matchCategory = caso.regiaoRisco === 'Fronteira' || caso.regiaoRisco === 'Mineração';
        } else if (selectedCategoryPill === 'Smurfing') {
          matchCategory = caso.tipologiaPld.toLowerCase().includes('fracionamento') || caso.regraDisparada.includes('FRAC');
        } else if (selectedCategoryPill === 'Amortizacao') {
          matchCategory = caso.isAmortizacaoAntecipada === true || caso.tipologiaPld.toLowerCase().includes('amortização');
        } else if (selectedCategoryPill === 'COE') {
          matchCategory = caso.isCoeObrigatorio === true || caso.tipologiaPld.toLowerCase().includes('coe');
        } else if (selectedCategoryPill === 'PEP_CSNU') {
          matchCategory = caso.isPep || caso.isCsnuListed === true;
        }
      }

      return matchSearch && matchStatus && matchCategory;
    });
  }, [casos, busca, selectedStatus, activeFilterPill, selectedCategoryPill]);

  const handleExport = () => {
    const csvContent = [
      ['Investigado', 'CPF', 'Risco PLD', 'Score', 'PEP', 'Fator Geográfico', 'Tipologia PLD', 'Regra BACEN/CVM', 'Volume Atipico (R$)', 'Renda Declarada (R$)', 'Data Alerta', 'SLA Horas', 'Situacao', 'Analista'],
      ...filteredCasos.map((c) => [
        c.nome,
        c.cpf,
        c.risco,
        c.scoreRisco,
        c.isPep ? `SIM (${c.pepCargo || 'PEP'})` : (c.isCsnuListed ? 'CSNU / ONU' : 'NAO'),
        c.regiaoNome || 'Padrão',
        c.tipologiaPld,
        c.regraDisparada,
        c.volumeAtipicoPeriodo || c.valorEnvolvido,
        c.capacidadeFinanceira?.rendaDeclarada || c.renda,
        c.dataAlerta,
        c.slaHorasRestantes,
        c.status,
        c.analistaNome
      ])
    ]
      .map((e) => e.join(';'))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_pld_ft_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-zinc-950 tracking-tight">
              Fila de Triagem & Investigação de Atipicidade Financeira
            </h1>
            <p className="text-xs text-zinc-500">
              Monitoramento de Limites Objetivos (COE), Fatores Geográficos (Fronteira/Mineração), Fracionamento e Listas Restritivas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('/regras')}
              className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Simular Regras no Motor
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Filter Toolbar */}
        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3 flex-1">
            {/* Buscar */}
            <div className="w-full sm:w-64">
              <label className="block text-xs font-medium text-zinc-700 mb-1">Buscar:</label>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Ex.: Cáceres, Amortização, CPF..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-400 outline-none"
              />
            </div>

            {/* Data do Alerta */}
            <div className="w-full sm:w-44">
              <label className="block text-xs font-medium text-zinc-700 mb-1">Data de Referência:</label>
              <input
                type="text"
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-zinc-900 focus:bg-white focus:border-zinc-400 outline-none"
              />
            </div>

            {/* Status */}
            <div className="w-full sm:w-44">
              <label className="block text-xs font-medium text-zinc-700 mb-1">Status PLD:</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setActiveFilterPill(null);
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-zinc-900 focus:bg-white focus:border-zinc-400 outline-none cursor-pointer"
              >
                <option value="Todos">Todos os Status</option>
                <option value="Pendente">Pendentes</option>
                <option value="Em análise">Em análise</option>
                <option value="Diligência">Diligência</option>
                <option value="Comunicado COAF">Comunicado COAF</option>
                <option value="Arquivado">Arquivados</option>
              </select>
            </div>

            {/* Pesquisar Button */}
            <button
              onClick={() => {}}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 h-[32px] cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Filtrar</span>
            </button>
          </div>

          {/* Exportar Button */}
          <div>
            <button
              onClick={handleExport}
              className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-medium rounded border border-zinc-300 transition-colors flex items-center gap-1.5 h-[32px] cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Regulatory Category Pills Toolbar */}
        <div className="bg-white p-2.5 rounded-lg border border-zinc-200 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-zinc-500 font-medium mr-1 text-[11px] uppercase tracking-wider">
            Cenários:
          </span>

          <button
            onClick={() => setSelectedCategoryPill('Todas')}
            className={`px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
              selectedCategoryPill === 'Todas'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Todos ({casos.length})
          </button>

          <button
            onClick={() => setSelectedCategoryPill('FronteiraMineracao')}
            className={`px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
              selectedCategoryPill === 'FronteiraMineracao'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Fronteira & Mineração
          </button>

          <button
            onClick={() => setSelectedCategoryPill('Smurfing')}
            className={`px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
              selectedCategoryPill === 'Smurfing'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Fracionamento (Smurfing)
          </button>

          <button
            onClick={() => setSelectedCategoryPill('Amortizacao')}
            className={`px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
              selectedCategoryPill === 'Amortizacao'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Amortização DCO / Empréstimo
          </button>

          <button
            onClick={() => setSelectedCategoryPill('COE')}
            className={`px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
              selectedCategoryPill === 'COE'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Limites Objetivos (COE &gt;= 50k)
          </button>

          <button
            onClick={() => setSelectedCategoryPill('PEP_CSNU')}
            className={`px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
              selectedCategoryPill === 'PEP_CSNU'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            PEP & CSNU / ONU
          </button>
        </div>

        {/* Status Badges Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs">
          {/* Pendentes */}
          <button
            onClick={() => setActiveFilterPill(activeFilterPill === 'Pendentes' ? null : 'Pendentes')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeFilterPill === 'Pendentes'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-700 hover:text-zinc-900'
            }`}
          >
            {pendentesCount} Pendentes
          </button>

          {/* Em análise */}
          <button
            onClick={() => setActiveFilterPill(activeFilterPill === 'Em analise' ? null : 'Em analise')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeFilterPill === 'Em analise'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-700 hover:text-zinc-900'
            }`}
          >
            {emAnaliseCount} Em Análise
          </button>

          {/* Diligência */}
          <button
            onClick={() => setActiveFilterPill(activeFilterPill === 'Diligência' ? null : 'Diligência')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeFilterPill === 'Diligência'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-700 hover:text-zinc-900'
            }`}
          >
            {diligenciaCount} Em Diligência
          </button>

          {/* Comunicado COAF */}
          <button
            onClick={() => setActiveFilterPill(activeFilterPill === 'COAF' ? null : 'COAF')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeFilterPill === 'COAF'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-700 hover:text-zinc-900'
            }`}
          >
            {coafCount} Comunicados COAF
          </button>

          {/* Arquivados */}
          <button
            onClick={() => setActiveFilterPill(activeFilterPill === 'Arquivados' ? null : 'Arquivados')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeFilterPill === 'Arquivados'
                ? 'bg-zinc-900 text-white font-bold'
                : 'text-zinc-700 hover:text-zinc-900'
            }`}
          >
            {arquivadosCount} Arquivados
          </button>
        </div>

        {/* Main Table */}
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4 min-w-[240px]">Investigado / Localização</th>
                  <th className="py-3 px-3 text-center">Risco</th>
                  <th className="py-3 px-3 text-center">Score</th>
                  <th className="py-3 px-3 text-center">Enquadramento</th>
                  <th className="py-3 px-4 min-w-[260px]">Alerta & Tipologia PLD</th>
                  <th className="py-3 px-4 text-right min-w-[180px]">Volume / Renda</th>
                  <th className="py-3 px-4 text-center min-w-[120px]">Data Alerta</th>
                  <th className="py-3 px-3 text-center">Situação</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredCasos.map((caso) => {
                  return (
                    <tr
                      key={caso.id}
                      onClick={() => {
                        setActiveCaseId(caso.id);
                        navigateTo(`/investigacao/${caso.id}`);
                      }}
                      className="hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-950 hover:underline">{caso.nome}</div>
                        <div className="font-mono text-zinc-500 text-[11px]">{caso.cpf}</div>
                        <div className="text-[11px] text-zinc-500">{caso.kyc.cidadeUf}</div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-zinc-800 text-[11px]">
                          {caso.risco}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-zinc-950 text-xs">
                          {caso.scoreRisco}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {caso.isCsnuListed ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-white">
                            CSNU / ONU
                          </span>
                        ) : caso.isPep ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200 text-zinc-900">
                            PEP
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-400 font-mono">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-900">{caso.tipologiaPld}</div>
                        <div className="font-mono text-[10px] text-zinc-500">{caso.regraDisparada}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono">
                        <div className="font-bold text-zinc-950">
                          {formatCurrency(caso.volumeAtipicoPeriodo || caso.valorEnvolvido)}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Renda: {formatCurrency(caso.capacidadeFinanceira?.rendaDeclarada || caso.renda)}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-zinc-600 text-[11px]">
                        <div>{caso.dataAlerta}</div>
                        <div className="text-[10px] text-zinc-500">SLA: {caso.slaHorasRestantes}h</div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {caso.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCaseId(caso.id);
                            navigateTo(`/investigacao/${caso.id}`);
                          }}
                          className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-medium border border-zinc-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Investigar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
