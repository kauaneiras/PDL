import React, { useState, useMemo } from 'react';
import { useAml } from '../../context/AmlContext';
import { mockVendasImoveis, mockBairrosReferencia } from '../../data/mock-bi-data';
import { VendaImovelCruzamento } from '../../types';
import {
  Home,
  Building,
  Filter,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  MapPin,
  Search,
  FileText,
  ExternalLink,
  ShieldAlert,
  Coins
} from 'lucide-react';

export const RealEstateCrossView: React.FC = () => {
  const { casos, setActiveCaseId, navigateTo, showToast } = useAml();

  const [bairroFiltro, setBairroFiltro] = useState<string>('TODOS');
  const [incompatibilidadeFiltro, setIncompatibilidadeFiltro] = useState<string>('TODOS');
  const [buscaTexto, setBuscaTexto] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<VendaImovelCruzamento | null>(mockVendasImoveis[0] || null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const bairrosDisponiveis = useMemo(() => {
    const list = Array.from(new Set(mockVendasImoveis.map((v) => v.bairro)));
    return list;
  }, []);

  const vendasFiltradas = useMemo(() => {
    return mockVendasImoveis.filter((v) => {
      if (bairroFiltro !== 'TODOS' && v.bairro !== bairroFiltro) return false;
      if (incompatibilidadeFiltro !== 'TODOS') {
        if (incompatibilidadeFiltro === 'INCOMPATIVEL' && v.capacidadeCompativel) return false;
        if (incompatibilidadeFiltro === 'SUBFATURAMENTO' && v.discrepanciaPercentual >= -20) return false;
        if (incompatibilidadeFiltro === 'SUPERFATURAMENTO' && v.discrepanciaPercentual <= 20) return false;
        if (incompatibilidadeFiltro === 'COMPATIVEL' && !v.capacidadeCompativel) return false;
      }
      if (buscaTexto.trim() !== '') {
        const q = buscaTexto.toLowerCase();
        const match =
          v.nomeEnvolvido.toLowerCase().includes(q) ||
          v.cpfEnvolvido.includes(q) ||
          v.bairro.toLowerCase().includes(q) ||
          v.cartorioOficio.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [bairroFiltro, incompatibilidadeFiltro, buscaTexto]);

  // Estatísticas do bairro selecionado
  const estatisticasBairro = useMemo(() => {
    const ref = mockBairrosReferencia.find((b) => b.nome === bairroFiltro);
    const m2Medio = ref ? ref.valorM2 : 12500;
    const totalVendas = vendasFiltradas.length;
    const totalVolumeDeclarado = vendasFiltradas.reduce((acc, v) => acc + v.valorDeclarado, 0);
    const totalVolumeEstimado = vendasFiltradas.reduce((acc, v) => acc + v.valorEstimadoMercado, 0);
    const totalIncompativeis = vendasFiltradas.filter((v) => !v.capacidadeCompativel).length;

    return {
      m2Medio,
      totalVendas,
      totalVolumeDeclarado,
      totalVolumeEstimado,
      totalIncompativeis
    };
  }, [bairroFiltro, vendasFiltradas]);

  const handleVerFicha = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    const caso = casos.find((c) => c.cpf.replace(/\D/g, '') === cleanCpf || c.nome.toLowerCase() === selectedRecord?.nomeEnvolvido.toLowerCase());
    if (caso) {
      setActiveCaseId(caso.id);
      navigateTo('/investigacao');
      showToast(`Ficha de investigação de ${caso.nome} aberta.`, 'info');
    } else {
      showToast('Cooperado não possui ficha aberta na competência corrente. Criando alerta de monitoramento.', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-800 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building className="w-4 h-4 text-indigo-600" />
            Módulo de Inteligência Imobiliária & Cartórios (DOI / ITBI)
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Cruzamento de Vendas Imobiliárias por Bairro & Capacidade Financeira
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Identifique subfaturamento (pagamentos em espécie "por fora"), superfaturamento para lavagem de capital ou aquisições incompatíveis com a renda cadastral declarada na cooperativa.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Bairro selector */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <select
              id="select-bairro-imovel"
              value={bairroFiltro}
              onChange={(e) => setBairroFiltro(e.target.value)}
              className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODOS">Todos os Bairros Monitorados</option>
              {bairrosDisponiveis.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Incompatibilidade filter */}
          <select
            id="select-incompatibilidade-filtro"
            value={incompatibilidadeFiltro}
            onChange={(e) => setIncompatibilidadeFiltro(e.target.value)}
            className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TODOS">Todas as Situações</option>
            <option value="INCOMPATIVEL">Apenas Incompatíveis com Renda</option>
            <option value="SUBFATURAMENTO">Subfaturamento Cartório (&lt; -20%)</option>
            <option value="SUPERFATURAMENTO">Superfaturamento (&gt; +20%)</option>
            <option value="COMPATIVEL">Compatíveis / Regulares</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              placeholder="Buscar por nome, CPF ou cartório..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white w-64 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Mostrando <span className="font-bold text-slate-800">{vendasFiltradas.length}</span> registros de cartório
        </div>
      </div>

      {/* KPI Cards for the filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Preço Médio M² (Bairro)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(estatisticasBairro.m2Medio)}/m²
          </div>
          <div className="text-xs text-slate-400 mt-1">Base oficial ITBI / Creci / Cartórios</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Volume Declarado em Cartório</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(estatisticasBairro.totalVolumeDeclarado)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{estatisticasBairro.totalVendas} transações no recorte</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Valor Estimado de Mercado</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(estatisticasBairro.totalVolumeEstimado)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Ponderado por metragem e região</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Incompatibilidades / Atipicidades</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {estatisticasBairro.totalIncompativeis} casos
          </div>
          <div className="text-xs text-red-500 mt-1 font-medium">Requerem apuração e parecer COAF</div>
        </div>
      </div>

      {/* Main Table and Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table of records */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Registros de Transações Imobiliárias Auditadas</h3>
            <span className="text-xs text-slate-500 font-mono">Fonte: DOI / SISCOAF / Cartórios</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Envolvido / CPF</th>
                  <th className="py-2.5 px-3">Bairro / Imóvel</th>
                  <th className="py-2.5 px-3 text-right">Valor Declarado</th>
                  <th className="py-2.5 px-3 text-right">Valor Mercado</th>
                  <th className="py-2.5 px-3 text-center">Discrepância</th>
                  <th className="py-2.5 px-3 text-center">Diagnóstico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendasFiltradas.map((v) => {
                  const isSelected = selectedRecord?.id === v.id;
                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedRecord(v)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/70 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{v.nomeEnvolvido}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {v.cpfEnvolvido} &bull; <span className="text-slate-600">{v.tipoPapel}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800">{v.bairro} ({v.cidadeUf.split('/')[1]?.trim()})</div>
                        <div className="text-[11px] text-slate-500">
                          {v.tipoImovel} ({v.areaM2} m²)
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-900">
                        {formatCurrency(v.valorDeclarado)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {formatCurrency(v.valorEstimadoMercado)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                            v.discrepanciaPercentual < -20
                              ? 'bg-red-100 text-red-800'
                              : v.discrepanciaPercentual > 20
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {v.discrepanciaPercentual > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : v.discrepanciaPercentual < 0 ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : null}
                          {v.discrepanciaPercentual > 0 ? `+${v.discrepanciaPercentual}%` : `${v.discrepanciaPercentual}%`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            v.capacidadeCompativel
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {v.capacidadeCompativel ? 'Compatível' : 'Incompatível'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Record Inspection Card */}
        <div className="lg:col-span-4 space-y-4">
          {selectedRecord ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Home className="w-4 h-4 text-indigo-600" />
                  Detalhes do Registro Cartorial
                </div>
                <span className="font-mono text-[11px] text-slate-500">{selectedRecord.id}</span>
              </div>

              {/* Alert description */}
              <div
                className={`p-3.5 rounded-lg border leading-relaxed ${
                  !selectedRecord.capacidadeCompativel
                    ? 'bg-red-50/70 border-red-200 text-red-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1 text-xs">
                  {!selectedRecord.capacidadeCompativel ? (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {selectedRecord.grauIncompatibilidade.replace(/_/g, ' ')}
                </div>
                {selectedRecord.alertaDescricao}
              </div>

              {/* Cross-Check Comparison Box */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                  Capacidade Financeira do Associado (Cooperativa)
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Renda Mensal Declarada:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {formatCurrency(selectedRecord.rendaMensalDeclarada)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patrimônio Declarado:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {formatCurrency(selectedRecord.patrimonioDeclarado)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500">Valor Imóvel (Avaliação m²):</span>
                  <span className="font-bold text-indigo-700 font-mono">
                    {formatCurrency(selectedRecord.valorEstimadoMercado)}
                  </span>
                </div>
              </div>

              {/* Cartório Data */}
              <div className="space-y-1.5 text-slate-600 border-t border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cartório / Ofício:</span>
                  <span className="font-medium text-slate-800 text-right">{selectedRecord.cartorioOficio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Matrícula:</span>
                  <span className="font-mono text-slate-800">{selectedRecord.matriculaCartorio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Data Transação:</span>
                  <span className="text-slate-800">{selectedRecord.dataTransacao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Área / Tipo:</span>
                  <span className="text-slate-800">
                    {selectedRecord.areaM2} m² &bull; {selectedRecord.tipoImovel}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  id="btn-ver-ficha-cooperado"
                  onClick={() => handleVerFicha(selectedRecord.cpfEnvolvido)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir Dossiê do Cooperado na Investigação
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
              Selecione um registro imobiliário para visualizar a análise cruzada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
