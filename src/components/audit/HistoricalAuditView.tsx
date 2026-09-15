import React, { useState, useMemo } from 'react';
import { useAml } from '../../context/AmlContext';
import { CasoInvestigacao, TipoFicha } from '../../types';
import {
  Search,
  Filter,
  Download,
  FileText,
  FileSpreadsheet,
  Code,
  Calendar,
  User,
  Eye,
  RotateCcw,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  History,
  FileSearch,
  ExternalLink,
  ChevronDown,
  X
} from 'lucide-react';
import { exportarFichaParaXml } from '../../utils/pldV2Helper';

export const HistoricalAuditView: React.FC = () => {
  const { casos, setActiveCaseId, registrarExportacao, showToast, exportLogs } = useAml();

  // Filters State (RF-27)
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFichaFilter, setTipoFichaFilter] = useState<string>('TODOS');
  const [motivoFilter, setMotivoFilter] = useState<string>('TODOS');
  const [periodoFilter, setPeriodoFilter] = useState<string>('TODOS');
  const [analistaFilter, setAnalistaFilter] = useState<string>('TODOS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [decisaoFilter, setDecisaoFilter] = useState<string>('TODOS');
  const [faixaValorFilter, setFaixaValorFilter] = useState<string>('TODOS');

  // Modal de Leitura de Auditoria (RF-29)
  const [auditFicha, setAuditFicha] = useState<CasoInvestigacao | null>(null);

  // Filter options lists
  const periodosDisponiveis = useMemo(() => {
    const set = new Set<string>();
    casos.forEach((c) => set.add(c.dataReferencia || '08/2026'));
    return Array.from(set).sort().reverse();
  }, [casos]);

  const analistasDisponiveis = useMemo(() => {
    const set = new Set<string>();
    casos.forEach((c) => {
      if (c.analistaNome) set.add(c.analistaNome);
    });
    return Array.from(set).sort();
  }, [casos]);

  // Filtragem dos casos
  const casosFiltrados = useMemo(() => {
    return casos.filter((c) => {
      // Busca texto
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const match =
          c.nome.toLowerCase().includes(term) ||
          c.cpf.includes(term) ||
          c.matricula.includes(term) ||
          c.alertaId.toLowerCase().includes(term) ||
          c.kyc.cidadeUf.toLowerCase().includes(term);
        if (!match) return false;
      }

      // Tipo de Ficha
      if (tipoFichaFilter !== 'TODOS') {
        const tipo = c.tipoFicha || 'Operações';
        if (tipo !== tipoFichaFilter) return false;
      }

      // Motivo de Alerta
      if (motivoFilter !== 'TODOS') {
        const matchMotivo =
          (motivoFilter === 'PEP' && c.isPep) ||
          (motivoFilter === 'GEO' && (c.regiaoRisco === 'Fronteira' || c.regiaoRisco === 'Mineração')) ||
          (motivoFilter === 'MENOR' && c.idade < 18) ||
          (motivoFilter === 'LIMOC' && c.snapshotCadastral?.limocAtivo) ||
          (motivoFilter === 'CSNU' && c.isCsnuListed);
        if (!matchMotivo) return false;
      }

      // Período
      if (periodoFilter !== 'TODOS') {
        if ((c.dataReferencia || '08/2026') !== periodoFilter) return false;
      }

      // Analista
      if (analistaFilter !== 'TODOS') {
        if (c.analistaNome !== analistaFilter) return false;
      }

      // Status
      if (statusFilter !== 'TODOS') {
        if (statusFilter === 'CONCLUIDA' && (c.status !== 'Comunicado COAF' && c.status !== 'Arquivado')) return false;
        if (statusFilter === 'PENDENTE' && (c.status !== 'Pendente' && c.status !== 'Em Análise' && c.status !== 'Diligência')) return false;
        if (statusFilter === 'COMUNICADO_COAF' && c.status !== 'Comunicado COAF') return false;
        if (statusFilter === 'SEM_OCORRENCIA' && c.status !== 'Arquivado') return false;
      }

      // Decisão GECAN
      if (decisaoFilter !== 'TODOS') {
        const decisao = c.decisaoGecanDetalhada?.decisao || (c.status === 'Comunicado COAF' ? 'COMUNICAR_COAF' : c.status === 'Arquivado' ? 'SEM_OCORRENCIA' : null);
        if (decisao !== decisaoFilter) return false;
      }

      // Faixa de valor
      if (faixaValorFilter !== 'TODOS') {
        if (faixaValorFilter === 'ATE_100K' && c.valorEnvolvido > 100000) return false;
        if (faixaValorFilter === '100K_A_500K' && (c.valorEnvolvido < 100000 || c.valorEnvolvido > 500000)) return false;
        if (faixaValorFilter === 'ACIMA_500K' && c.valorEnvolvido < 500000) return false;
      }

      return true;
    });
  }, [casos, searchTerm, tipoFichaFilter, motivoFilter, periodoFilter, analistaFilter, statusFilter, decisaoFilter, faixaValorFilter]);

  // Métricas de Gestão e Auditoria (RF-28)
  const metricas = useMemo(() => {
    const total = casosFiltrados.length;
    const concluidas = casosFiltrados.filter((c) => c.status === 'Comunicado COAF' || c.status === 'Arquivado').length;
    const comunicadasCoaf = casosFiltrados.filter((c) => c.status === 'Comunicado COAF').length;
    const arquivadasSemOcorrencia = casosFiltrados.filter((c) => c.status === 'Arquivado').length;
    const taxaCoaf = concluidas > 0 ? ((comunicadasCoaf / concluidas) * 100).toFixed(1) : '0.0';
    const volumeTotal = casosFiltrados.reduce((acc, c) => acc + c.valorEnvolvido, 0);

    return {
      total,
      concluidas,
      comunicadasCoaf,
      arquivadasSemOcorrencia,
      taxaCoaf,
      volumeTotal,
    };
  }, [casosFiltrados]);

  // Handlers de Exportação com Registro em Log (RF-31, RF-32, RF-33, RNF-06)
  const exportarCsvGeral = () => {
    const headers = [
      'ID Ficha',
      'Data Referência',
      'Tipo Ficha',
      'Nome Associado',
      'CPF/CNPJ',
      'Matrícula',
      'Cidade/UF',
      'Valor Envolvido (R$)',
      'Score Risco',
      'Nível Risco',
      'Status Atual',
      'Decisão GECAN',
      'Tipologia COAF',
      'Analista Responsável',
    ];

    const rows = casosFiltrados.map((c) => [
      c.id,
      c.dataReferencia || '08/2026',
      c.tipoFicha || 'Operações',
      `"${c.nome}"`,
      c.cpf,
      c.matricula,
      `"${c.kyc.cidadeUf}"`,
      c.valorEnvolvido,
      c.scoreRisco,
      c.risco,
      c.status,
      c.decisaoGecanDetalhada?.decisao || (c.status === 'Comunicado COAF' ? 'COMUNICAR_COAF' : c.status === 'Arquivado' ? 'SEM_OCORRENCIA' : 'EM_ANDAMENTO'),
      c.decisaoGecanDetalhada?.tipologiaCoafCodigo || '',
      `"${c.analistaNome || 'Maísa Ramos'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AUDITORIA_PLDFT_EXPORT_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    registrarExportacao(undefined, `Exportação CSV Acervo Geral (${casosFiltrados.length} fichas)`, undefined, 'CSV', 'Relatório de Auditoria e Conformidade PLD/FT');
    showToast(`Relatório CSV gerado com sucesso! (${casosFiltrados.length} fichas exportadas)`, 'success');
  };

  const exportarXmlFicha = (caso: CasoInvestigacao) => {
    const xml = exportarFichaParaXml(caso);
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DOSSIE_PLDFT_${caso.id}_${caso.cpf.replace(/\D/g, '')}.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    registrarExportacao(caso.id, caso.nome, caso.cpf, 'XML', 'Exportação Estruturada para Fiscalização Regulamentar (RF-32)');
    showToast(`Dossiê estruturado XML de ${caso.nome} exportado com sucesso!`, 'success');
  };

  const limparFiltros = () => {
    setSearchTerm('');
    setTipoFichaFilter('TODOS');
    setMotivoFilter('TODOS');
    setPeriodoFilter('TODOS');
    setAnalistaFilter('TODOS');
    setStatusFilter('TODOS');
    setDecisaoFilter('TODOS');
    setFaixaValorFilter('TODOS');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-zinc-950 uppercase tracking-wide">
              Consulta & Auditoria Histórica de Fichas (RF-26 a RF-29)
            </h1>
            <span className="bg-zinc-100 border border-zinc-300 text-zinc-800 text-[10px] font-extrabold px-2 py-0.5 rounded font-mono">
              SCH_PLDFT.TB_Ficha
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Acervo permanente unificado com rastreabilidade total de versões, deliberações e trilha contínua de auditoria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportarCsvGeral}
            className="px-3 py-1.5 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-bold border border-[#E5B700] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Exportar CSV Completo</span>
          </button>
        </div>
      </div>

      {/* Painel de Métricas de Auditoria (RF-28) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-white border border-zinc-200 rounded-lg shadow-2xs">
          <span className="text-[10px] font-bold text-zinc-500 uppercase block">Total no Acervo</span>
          <span className="text-lg font-black text-zinc-900">{metricas.total}</span>
          <span className="text-[10px] text-zinc-400 block">Fichas no filtro</span>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-lg shadow-2xs">
          <span className="text-[10px] font-bold text-zinc-500 uppercase block">Concluídas / Encerradas</span>
          <span className="text-lg font-black text-emerald-800">{metricas.concluidas}</span>
          <span className="text-[10px] text-zinc-400 block">{metricas.total - metricas.concluidas} em andamento</span>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-lg shadow-2xs">
          <span className="text-[10px] font-bold text-zinc-500 uppercase block">Comunicações COAF</span>
          <span className="text-lg font-black text-amber-700">{metricas.comunicadasCoaf}</span>
          <span className="text-[10px] text-zinc-400 block">Protocolos emitidos</span>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-lg shadow-2xs">
          <span className="text-[10px] font-bold text-zinc-500 uppercase block">Sem Ocorrência</span>
          <span className="text-lg font-black text-zinc-700">{metricas.arquivadasSemOcorrencia}</span>
          <span className="text-[10px] text-zinc-400 block">Atipicidade justificada</span>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-lg shadow-2xs">
          <span className="text-[10px] font-bold text-zinc-500 uppercase block">Taxa de Comunicação</span>
          <span className="text-lg font-black text-indigo-900">{metricas.taxaCoaf}%</span>
          <span className="text-[10px] text-zinc-400 block">Das fichas julgadas</span>
        </div>

        <div className="p-3 bg-white border border-zinc-200 rounded-lg shadow-2xs">
          <span className="text-[10px] font-bold text-zinc-500 uppercase block">Volume Analisado</span>
          <span className="text-sm font-black text-zinc-900 mt-1 block truncate" title={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.volumeTotal)}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.volumeTotal)}
          </span>
          <span className="text-[10px] text-zinc-400 block">Consolidado período</span>
        </div>
      </div>

      {/* Caixa de Filtros Avançados de Auditoria (RF-27) */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900">
            <Filter className="w-3.5 h-3.5 text-zinc-700" />
            <span>Filtros Parametrizados de Auditoria (RF-27)</span>
          </div>
          <button
            onClick={limparFiltros}
            className="px-2.5 py-1 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-bold border border-[#E5B700] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          >
            <RotateCcw className="w-3 h-3 text-black" />
            <span>Limpar Filtros</span>
          </button>
        </div>

        {/* Linha de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {/* Busca textual */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Busca Textual</label>
            <div className="relative">
              <Search className="w-3 h-3 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome, CPF, matrícula..."
                className="w-full bg-white border border-zinc-300 rounded text-xs pl-7 pr-2 py-1 text-zinc-900 focus:border-zinc-500 outline-none"
              />
            </div>
          </div>

          {/* Tipo de Ficha */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Tipo de Ficha</label>
            <select
              value={tipoFichaFilter}
              onChange={(e) => setTipoFichaFilter(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded text-xs px-2 py-1 text-zinc-900 focus:border-zinc-500 outline-none"
            >
              <option value="TODOS">Todos</option>
              <option value="Operações">Operações</option>
              <option value="Conta Corrente">Conta Corrente</option>
            </select>
          </div>

          {/* Motivo de Alerta */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Motivo</label>
            <select
              value={motivoFilter}
              onChange={(e) => setMotivoFilter(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded text-xs px-2 py-1 text-zinc-900 focus:border-zinc-500 outline-none"
            >
              <option value="TODOS">Todos</option>
              <option value="PEP">PEP</option>
              <option value="GEO">Fronteira / Mineração</option>
              <option value="MENOR">Menor de Idade</option>
              <option value="LIMOC">LIMOC</option>
              <option value="CSNU">Sanções ONU</option>
            </select>
          </div>

          {/* Período / Referência */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Período</label>
            <select
              value={periodoFilter}
              onChange={(e) => setPeriodoFilter(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded text-xs px-2 py-1 text-zinc-900 focus:border-zinc-500 outline-none"
            >
              <option value="TODOS">Todos os Meses</option>
              {periodosDisponiveis.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Analista */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Analista</label>
            <select
              value={analistaFilter}
              onChange={(e) => setAnalistaFilter(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded text-xs px-2 py-1 text-zinc-900 focus:border-zinc-500 outline-none"
            >
              <option value="TODOS">Todos</option>
              {analistasDisponiveis.map((a) => (
                <option key={a} value={a}>{a.split(' ')[0]}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded text-xs px-2 py-1 text-zinc-900 focus:border-zinc-500 outline-none"
            >
              <option value="TODOS">Todos</option>
              <option value="PENDENTE">Pendentes / Em Análise</option>
              <option value="CONCLUIDA">Concluídas (Total)</option>
              <option value="COMUNICADO_COAF">Comunicado COAF</option>
              <option value="SEM_OCORRENCIA">Sem Ocorrência</option>
            </select>
          </div>

          {/* Faixa de Valor */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Faixa de Valor</label>
            <select
              value={faixaValorFilter}
              onChange={(e) => setFaixaValorFilter(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded text-xs px-2 py-1 text-zinc-900 focus:border-zinc-500 outline-none"
            >
              <option value="TODOS">Qualquer Valor</option>
              <option value="ATE_100K">Até R$ 100k</option>
              <option value="100K_A_500K">R$ 100k - R$ 500k</option>
              <option value="ACIMA_500K">&gt; R$ 500k</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela do Acervo Histórico Completo (RF-26) */}
      <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-2xs">
        <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs">
          <div className="font-bold text-zinc-900 flex items-center gap-2">
            <span>Resultados Localizados no Banco de Dados:</span>
            <span className="font-extrabold bg-zinc-200 px-2 py-0.5 rounded text-zinc-800">
              {casosFiltrados.length} fichas
            </span>
          </div>
          <div className="text-zinc-500 text-[11px]">
            Clique em "Visualizar Ficha" para abrir no modo auditoria (somente leitura) ou "Investigar" para ação direta.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-200 text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                <th className="p-3">Ref. / Tipo</th>
                <th className="p-3">Associado / CPF</th>
                <th className="p-3">Motivo & Risco</th>
                <th className="p-3">Volume Analisado</th>
                <th className="p-3">Status</th>
                <th className="p-3">Decisão GECAN</th>
                <th className="p-3">Analista</th>
                <th className="p-3 text-right">Ações de Auditoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {casosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500 text-xs">
                    Nenhuma ficha histórica encontrada com os parâmetros informados.
                  </td>
                </tr>
              ) : (
                casosFiltrados.map((caso) => {
                  const isConcluida = caso.status === 'Comunicado COAF' || caso.status === 'Arquivado';
                  const decisao = caso.decisaoGecanDetalhada?.decisao || (caso.status === 'Comunicado COAF' ? 'COMUNICAR_COAF' : caso.status === 'Arquivado' ? 'SEM_OCORRENCIA' : null);

                  return (
                    <tr key={caso.id} className="hover:bg-zinc-50/80 transition-colors">
                      {/* Ref & Tipo */}
                      <td className="p-3">
                        <div className="font-bold text-zinc-900 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          {caso.dataReferencia || '08/2026'}
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-600 px-1.5 py-0.2 rounded bg-zinc-100 border border-zinc-200 inline-block mt-0.5">
                          {caso.tipoFicha || 'Operações'}
                        </span>
                      </td>

                      {/* Nome e CPF */}
                      <td className="p-3">
                        <div className="font-bold text-zinc-900 truncate max-w-[200px]" title={caso.nome}>
                          {caso.nome}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono">
                          {caso.cpf} • Matrícula {caso.matricula}
                        </div>
                      </td>

                      {/* Motivo & Risco */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              caso.scoreRisco >= 70
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : caso.scoreRisco >= 40
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            Score {caso.scoreRisco}
                          </span>
                          {caso.isPep && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              PEP
                            </span>
                          )}
                          {(caso.regiaoRisco === 'Fronteira' || caso.regiaoRisco === 'Mineração') && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              {caso.regiaoRisco}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate max-w-[180px] mt-0.5" title={caso.regraDisparada}>
                          {caso.regraDisparada}
                        </div>
                      </td>

                      {/* Volume Analisado */}
                      <td className="p-3">
                        <div className="font-bold text-zinc-900 font-mono">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(caso.valorEnvolvido)}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Renda: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(caso.capacidadeFinanceira?.rendaDeclarada || caso.renda)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                            caso.status === 'Comunicado COAF'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : caso.status === 'Arquivado'
                              ? 'bg-zinc-100 text-zinc-800 border border-zinc-300'
                              : caso.status === 'Diligência'
                              ? 'bg-orange-100 text-orange-900 border border-orange-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {caso.status}
                        </span>
                      </td>

                      {/* Decisão GECAN */}
                      <td className="p-3">
                        {decisao === 'COMUNICAR_COAF' ? (
                          <div>
                            <span className="text-[10px] font-bold text-red-800 flex items-center gap-1">
                              <Send className="w-3 h-3 text-red-600" />
                              Comunicado COAF
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Tipologia {caso.decisaoGecanDetalhada?.tipologiaCoafCodigo || '1.1.1'}
                            </span>
                          </div>
                        ) : decisao === 'SEM_OCORRENCIA' ? (
                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Sem Ocorrência
                            </span>
                            <span className="text-[10px] text-zinc-500">Arquivado c/ lastro</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-medium italic">Em tramitação</span>
                        )}
                      </td>

                      {/* Analista */}
                      <td className="p-3 text-[11px] text-zinc-700">
                        <div className="font-semibold">{caso.analistaNome || 'Maísa Ramos'}</div>
                        <div className="text-[10px] text-zinc-500">GECON / GESIN</div>
                      </td>

                      {/* Ações */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setAuditFicha(caso)}
                            className="px-2 py-1 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black text-[11px] font-bold border border-[#E5B700] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Ver ficha completa em modo auditoria (leitura)"
                          >
                            <Eye className="w-3 h-3 text-black" />
                            <span>Auditar</span>
                          </button>
                          <button
                            onClick={() => exportarXmlFicha(caso)}
                            className="px-2 py-1 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black text-[11px] font-bold border border-[#E5B700] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Exportar XML estruturado da ficha"
                          >
                            <Code className="w-3.5 h-3.5 text-black" />
                            <span>XML</span>
                          </button>
                          <button
                            onClick={() => setActiveCaseId(caso.id)}
                            className="px-2 py-1 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black text-[11px] font-bold border border-[#E5B700] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Abrir tela operacional da investigação"
                          >
                            <ExternalLink className="w-3 h-3 text-black" />
                            <span>Abrir</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE AUDITORIA DE FICHA COMPLETA (RF-29: SOMENTE LEITURA COM TRILHA COMPLETA) */}
      {auditFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-zinc-300 w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-zinc-900 text-[#FFCC01] flex items-center justify-center font-bold">
                  <FileSearch className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide flex items-center gap-2">
                    Visualização em Modo Auditoria (RF-29) - {auditFicha.nome}
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-zinc-200 text-zinc-800">
                      SOMENTE LEITURA
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-500 font-mono">
                    CPF {auditFicha.cpf} • {auditFicha.tipoFicha || 'Operações'} • Mês {auditFicha.dataReferencia || '08/2026'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuditFicha(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-800">
              {/* Snapshot Cadastral no Momento da Análise (RF-09, RF-10) */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-zinc-900 uppercase text-xs border-b border-zinc-200 pb-1.5 flex items-center justify-between">
                  <span>Retrato Cadastral Congelado no Banco (TB_Ficha_SnapshotCadastral)</span>
                  <span className="text-[10px] text-zinc-500 font-normal">
                    Gerado em: {auditFicha.snapshotCadastral?.dtSnapshot || '01/08/2026 04:30'}
                  </span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">Renda Declarada</span>
                    <span className="font-bold text-zinc-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(auditFicha.snapshotCadastral?.rendaDeclarada || auditFicha.renda)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">Patrimônio Declarado</span>
                    <span className="font-bold text-zinc-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(auditFicha.snapshotCadastral?.patrimonioDeclarado || auditFicha.kyc.patrimonioDeclarado)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">Profissão / Ocupação</span>
                    <span className="font-semibold text-zinc-800">{auditFicha.snapshotCadastral?.profissao || auditFicha.kyc.profissao}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">Fator Geográfico</span>
                    <span className="font-semibold text-zinc-800">{auditFicha.snapshotCadastral?.fatorGeografico || 'Padrão'}</span>
                  </div>
                </div>

                {/* Contratos Ativos de Crédito (RF-09) */}
                {auditFicha.snapshotCadastral?.contratosCreditoAtivos && auditFicha.snapshotCadastral.contratosCreditoAtivos.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase block mb-1">
                      Contratos de Crédito Ativos no Momento da Seleção (RF-09)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {auditFicha.snapshotCadastral.contratosCreditoAtivos.map((ctr) => (
                        <div key={ctr.numeroContrato} className="p-2 bg-white border border-zinc-200 rounded flex justify-between items-center text-[11px]">
                          <div>
                            <div className="font-bold text-zinc-900">{ctr.numeroContrato}</div>
                            <div className="text-zinc-500">{ctr.modalidade}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-zinc-900">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ctr.saldoDevedor)}
                            </span>
                            <div className="text-[10px] text-zinc-400">Saldo Devedor</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Histórico de Versões do Parecer Técnico (RF-18, RN-02, RN-09) */}
              <div>
                <h3 className="font-bold text-zinc-900 uppercase text-xs mb-2 flex items-center justify-between">
                  <span>Versões Registradas do Parecer Técnico (TB_Parecer - Append-Only)</span>
                  <span className="text-[11px] text-zinc-500">{auditFicha.versoesParecer?.length || 1} versão(ões)</span>
                </h3>
                <div className="space-y-3">
                  {(auditFicha.versoesParecer || []).map((v) => (
                    <div
                      key={v.id}
                      className={`border rounded-lg p-3.5 space-y-2 ${
                        v.vigente ? 'bg-amber-50/40 border-amber-300' : 'bg-zinc-50 border-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] border-b border-zinc-200/80 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">Versão {v.versao}</span>
                          {v.vigente && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                              VIGENTE
                            </span>
                          )}
                          <span className="text-zinc-500 font-mono">Por {v.analistaNome} em {v.dataCriacao}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-800">
                          {v.percentualEdicaoHumana}% Edição Humana
                        </span>
                      </div>
                      <div className="text-xs text-zinc-800 leading-relaxed whitespace-pre-line font-serif bg-white p-3 rounded border border-zinc-200">
                        {v.textoFinal}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decisão GECAN e Comunicação COAF */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                <h3 className="font-bold text-zinc-900 uppercase text-xs border-b border-zinc-200 pb-1">
                  Decisão Colegiada GECAN (TB_Decisao_GECAN)
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">Deliberação</span>
                    <span className="font-bold text-zinc-900">
                      {auditFicha.decisaoGecanDetalhada?.decisao || auditFicha.parecer.deliberacao || 'Aguardando encerramento'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">Protocolo SISCOAF</span>
                    <span className="font-mono font-bold text-zinc-900">
                      {auditFicha.decisaoGecanDetalhada?.numeroProtocoloSiscoaf || 'Não aplicável'}
                    </span>
                  </div>
                </div>
                {auditFicha.decisaoGecanDetalhada?.recomendacaoGecan && (
                  <div className="text-xs text-zinc-700 bg-white p-2.5 rounded border border-zinc-200 mt-2">
                    <span className="font-bold block text-zinc-900 mb-0.5">Recomendações Registradas da GECAN:</span>
                    {auditFicha.decisaoGecanDetalhada.recomendacaoGecan}
                  </div>
                )}
              </div>

              {/* Trilha de Auditoria Contínua de Transições de Status (RF-24, RF-25) */}
              <div>
                <h3 className="font-bold text-zinc-900 uppercase text-xs mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Trilha de Auditoria Contínua (TB_Ficha_StatusHistorico)</span>
                </h3>
                <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 border-b border-zinc-200 text-[10px] font-bold text-zinc-600 uppercase">
                        <th className="p-2.5">Data / Hora</th>
                        <th className="p-2.5">De Status</th>
                        <th className="p-2.5">Para Status</th>
                        <th className="p-2.5">Usuário</th>
                        <th className="p-2.5">Justificativa / Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
                      {(auditFicha.statusHistorico || []).map((h) => (
                        <tr key={h.id} className="hover:bg-zinc-50">
                          <td className="p-2.5 text-zinc-600">{h.dataHora}</td>
                          <td className="p-2.5 text-zinc-500">{h.deStatus}</td>
                          <td className="p-2.5 font-bold text-zinc-900">{h.paraStatus}</td>
                          <td className="p-2.5 text-zinc-700">{h.usuario}</td>
                          <td className="p-2.5 text-zinc-800 font-sans text-xs">
                            {h.justificativa ? (
                              <div>
                                <strong className="text-red-800">Justificativa: </strong>
                                <span>{h.justificativa}</span>
                              </div>
                            ) : (
                              h.detalhes || 'Transição de ciclo padrão'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="text-[11px] text-zinc-500">
                Identificador único no acervo: <code className="font-mono text-zinc-800">{auditFicha.id}</code>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportarXmlFicha(auditFicha)}
                  className="px-3 py-1.5 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-bold border border-[#E5B700] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Code className="w-3.5 h-3.5 text-black" />
                  <span>Exportar XML</span>
                </button>
                <button
                  onClick={() => {
                    setActiveCaseId(auditFicha.id);
                    setAuditFicha(null);
                  }}
                  className="px-3 py-1.5 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-bold border border-[#E5B700] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-black" />
                  <span>Abrir na Investigação</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
