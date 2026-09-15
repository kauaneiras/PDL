import React, { useState, useMemo } from 'react';
import { useAml } from '../../context/AmlContext';
import { TipoFicha, CasoInvestigacao } from '../../types';
import {
  Search,
  FileSpreadsheet,
  Edit,
  Calendar,
  Layers,
  UserCheck,
  Filter,
  ArrowUpDown,
  Download,
  Code,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  UserPlus,
  Smartphone,
  Flame,
  ShieldAlert,
  BookOpen
} from 'lucide-react';
import { exportarFichaParaXml } from '../../utils/pldV2Helper';
import { BatchExportModal } from '../export/BatchExportModal';
import { PERSON_ANALYSIS_ALERTS } from '../../data/personAnalysisAlerts';
import { PersonAnalysisMatrixModal } from './PersonAnalysisMatrixModal';

export const AlertsQueueView: React.FC = () => {
  const { casos, setActiveCaseId, navigateTo, atribuirAnalista, registrarExportacao, showToast } = useAml();

  // Filtros
  const [busca, setBusca] = useState('');
  const [tipoFichaFilter, setTipoFichaFilter] = useState<string>('TODOS');
  const [motivoFilter, setMotivoFilter] = useState<string>('TODOS');
  const [origemRecursosFilter, setOrigemRecursosFilter] = useState<string>('TODOS');
  const [horarioJogosFilter, setHorarioJogosFilter] = useState<boolean>(false);
  const [analistaFilter, setAnalistaFilter] = useState<string>('TODOS');
  const [statusViewMode, setStatusViewMode] = useState<'PENDENTES' | 'TODOS' | 'CONCLUIDAS'>('PENDENTES'); // RF-04: Pendentes por padrão
  const [activeSubStatusPill, setActiveSubStatusPill] = useState<string | null>(null);

  // Modal de Exportação em Lote
  const [isBatchExportOpen, setIsBatchExportOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);

  const activePersonAlert = useMemo(() => {
    return PERSON_ANALYSIS_ALERTS.find((a) => a.id === motivoFilter);
  }, [motivoFilter]);

  // Ordenação (RF-07)
  const [ordenacao, setOrdenacao] = useState<'SCORE_DESC' | 'SLA_ASC' | 'VALOR_DESC'>('SCORE_DESC');

  // Seleção múltipla para Reatribuição de Analista em Lote (RF-06)
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [novoAnalista, setNovoAnalista] = useState({ nome: 'Carlos Eduardo', iniciais: 'CE' });

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Contadores dinâmicos
  const pendentesCount = useMemo(() => casos.filter((c) => c.status === 'Pendente').length, [casos]);
  const emAnaliseCount = useMemo(() => casos.filter((c) => c.status === 'Em análise' || c.status === 'Em Análise').length, [casos]);
  const diligenciaCount = useMemo(() => casos.filter((c) => c.status === 'Diligência').length, [casos]);
  const coafCount = useMemo(() => casos.filter((c) => c.status === 'Comunicado COAF').length, [casos]);
  const arquivadosCount = useMemo(() => casos.filter((c) => c.status === 'Arquivado').length, [casos]);
  const totalPendentesAtivos = pendentesCount + emAnaliseCount + diligenciaCount;

  // Analistas disponíveis
  const listaAnalistas = useMemo(() => {
    const s = new Set<string>();
    casos.forEach((c) => {
      if (c.analistaNome) s.add(c.analistaNome);
    });
    return Array.from(s);
  }, [casos]);

  // Filtragem e Ordenação
  const filteredCasos = useMemo(() => {
    let result = casos.filter((caso) => {
      // 1. Visão de Ciclo de Vida (RF-04: Fila de pendentes não mostra concluídas por padrão)
      const isConcluida = caso.status === 'Comunicado COAF' || caso.status === 'Arquivado';
      if (statusViewMode === 'PENDENTES' && isConcluida) return false;
      if (statusViewMode === 'CONCLUIDAS' && !isConcluida) return false;

      // 2. Sub-status pill
      if (activeSubStatusPill) {
        if (activeSubStatusPill === 'Pendente' && caso.status !== 'Pendente') return false;
        if (activeSubStatusPill === 'Em Análise' && caso.status !== 'Em Análise' && caso.status !== 'Em análise') return false;
        if (activeSubStatusPill === 'Diligência' && caso.status !== 'Diligência') return false;
        if (activeSubStatusPill === 'COAF' && caso.status !== 'Comunicado COAF') return false;
        if (activeSubStatusPill === 'Sem Ocorrência' && caso.status !== 'Arquivado') return false;
      }

      // 3. Busca textual
      if (busca.trim() !== '') {
        const t = busca.toLowerCase();
        const match =
          caso.nome.toLowerCase().includes(t) ||
          caso.cpf.includes(t) ||
          caso.matricula.includes(t) ||
          caso.tipologiaPld.toLowerCase().includes(t) ||
          caso.regraDisparada.toLowerCase().includes(t) ||
          (caso.kyc?.cidadeUf && caso.kyc.cidadeUf.toLowerCase().includes(t));
        if (!match) return false;
      }

      // 4. Tipo de Ficha (RF-05)
      if (tipoFichaFilter !== 'TODOS') {
        const tipo = caso.tipoFicha || 'Operações';
        if (tipo !== tipoFichaFilter) return false;
      }

      // 5. Motivo de Alerta (RF-05 + 16 Diretrizes de Análise de Pessoas)
      if (motivoFilter !== 'TODOS') {
        const matchedAlert = PERSON_ANALYSIS_ALERTS.find((a) => a.id === motivoFilter);
        if (matchedAlert) {
          if (!matchedAlert.matchFn(caso)) return false;
        } else {
          if (motivoFilter === 'PEP' && !caso.isPep) return false;
          if (motivoFilter === 'GEO' && caso.regiaoRisco !== 'Fronteira' && caso.regiaoRisco !== 'Mineração') return false;
          if (motivoFilter === 'MENOR' && caso.idade >= 18) return false;
          if (motivoFilter === 'LIMOC' && !caso.snapshotCadastral?.limocAtivo) return false;
          if (motivoFilter === 'CSNU' && !caso.isCsnuListed) return false;
          if (motivoFilter === 'TERCEIROS' && !caso.tipologiaPld.toLowerCase().includes('terceiro') && !caso.alerta.toLowerCase().includes('terceiros')) return false;
        }
      }

      // 6. Origem dos Recursos
      if (origemRecursosFilter !== 'TODOS') {
        const orig = (caso.origemRecursos || caso.capacidadeFinanceira?.origemRecursosDeclarada || '').toLowerCase();
        if (origemRecursosFilter === 'IMOVEIS' && !orig.includes('imóve') && !orig.includes('imove')) return false;
        if (origemRecursosFilter === 'SALARIO' && !orig.includes('salário') && !orig.includes('vencimento') && !orig.includes('provento')) return false;
        if (origemRecursosFilter === 'APOSTAS' && !orig.includes('aposta') && !orig.includes('jogo')) return false;
        if (origemRecursosFilter === 'EMPRESTIMOS' && !orig.includes('empréstimo') && !orig.includes('crédito')) return false;
        if (origemRecursosFilter === 'TERCEIROS' && !orig.includes('terceiro') && !orig.includes('passagem')) return false;
        if (origemRecursosFilter === 'RURAL' && !orig.includes('rural') && !orig.includes('agro')) return false;
      }

      // 7. Horário de Jogos / Apostas
      if (horarioJogosFilter) {
        const temJogos = caso.transacoes?.some((t) => t.isHorarioJogos);
        if (!temJogos) return false;
      }

      // 8. Analista Atribuído
      if (analistaFilter !== 'TODOS') {
        if (caso.analistaNome !== analistaFilter) return false;
      }

      return true;
    });

    // Ordenação (RF-07)
    result.sort((a, b) => {
      if (ordenacao === 'SCORE_DESC') return b.scoreRisco - a.scoreRisco;
      if (ordenacao === 'SLA_ASC') return a.slaHorasRestantes - b.slaHorasRestantes;
      if (ordenacao === 'VALOR_DESC') return b.valorEnvolvido - a.valorEnvolvido;
      return 0;
    });

    return result;
  }, [casos, busca, tipoFichaFilter, motivoFilter, origemRecursosFilter, horarioJogosFilter, analistaFilter, statusViewMode, activeSubStatusPill, ordenacao]);

  // Handler de Seleção de Checkboxes
  const handleToggleSelect = (id: string) => {
    setSelectedCaseIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    if (selectedCaseIds.length === filteredCasos.length) {
      setSelectedCaseIds([]);
    } else {
      setSelectedCaseIds(filteredCasos.map((c) => c.id));
    }
  };

  const handleConfirmReassign = () => {
    if (selectedCaseIds.length === 0) return;
    atribuirAnalista(selectedCaseIds, novoAnalista.nome, novoAnalista.iniciais);
    setSelectedCaseIds([]);
    setShowReassignModal(false);
  };

  // Exportação CSV com Registro de Auditoria (RF-31, RF-33, RNF-06)
  const handleExportCsv = () => {
    const headers = [
      'Investigado',
      'CPF',
      'Tipo Ficha',
      'Ref Mês',
      'Risco',
      'Score',
      'PEP',
      'Tipologia',
      'Regra Disparada',
      'Volume (R$)',
      'Renda (R$)',
      'SLA Horas',
      'Status',
      'Analista',
    ];

    const rows = filteredCasos.map((c) => [
      `"${c.nome}"`,
      c.cpf,
      c.tipoFicha || 'Operações',
      c.dataReferencia || '08/2026',
      c.risco,
      c.scoreRisco,
      c.isPep ? 'SIM' : 'NÃO',
      `"${c.tipologiaPld}"`,
      `"${c.regraDisparada}"`,
      c.valorEnvolvido,
      c.capacidadeFinanceira?.rendaDeclarada || c.renda,
      c.slaHorasRestantes,
      c.status,
      `"${c.analistaNome}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FILA_TRIAGEM_PLDFT_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    registrarExportacao(undefined, `Fila de Triagem (${filteredCasos.length} registros)`, undefined, 'CSV', 'Consulta Operacional / Fila de Alertas (RF-31)');
    showToast(`Relatório CSV exportado e registrado no log de auditoria!`, 'success');
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-zinc-950 tracking-tight flex items-center gap-2">
              <span>Fila de Triagem & Alertas Pendentes (RF-04 a RF-08)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-800">
                SCH_PLDFT.TB_Ficha
              </span>
            </h1>
            <p className="text-xs text-zinc-500">
              Tratamento tempestivo de alertas mensais de Operações e Conta Corrente conforme Circular BACEN nº 3.978/2020.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMatrixModalOpen(true)}
              className="px-3 py-1.5 rounded bg-[#111827] hover:bg-black text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-zinc-700"
              title="Abrir Matriz de Diretrizes e Ações Práticas do Analista (16 Tipologias)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#FFCC01]" />
              <span>Matriz de Pessoas (16 Alertas)</span>
              <span className="bg-zinc-800 text-[#FFCC01] border border-zinc-600 px-1.5 py-0.2 rounded text-[10px]">
                5 Novos
              </span>
            </button>

            <button
              onClick={() => navigateTo('/regras')}
              className="px-3 py-1.5 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-bold border border-[#E5B700] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit className="w-3.5 h-3.5 text-black" />
              <span>Motor de Regras</span>
            </button>

            <button
              onClick={() => setIsBatchExportOpen(true)}
              className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Exportar Lote (XML/CSV)</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-bold border border-[#E5B700] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-black" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Workspace - 100% largura fluida sem restrição max-w-7xl para visualização integral */}
      <div className="w-full px-4 sm:px-6 py-4 space-y-3">
        {/* Modos de Visão de Ciclo de Vida da Fila (RF-04 / RF-40) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-zinc-200 shadow-2xs">
          {/* Seletor de Visão Principal: Pendentes vs. Concluídas */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md text-xs font-bold">
            <button
              onClick={() => {
                setStatusViewMode('PENDENTES');
                setActiveSubStatusPill(null);
              }}
              className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusViewMode === 'PENDENTES'
                  ? 'bg-zinc-900 text-[#FFCC01] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Fila de Pendentes Ativos ({totalPendentesAtivos})</span>
            </button>

            <button
              onClick={() => {
                setStatusViewMode('CONCLUIDAS');
                setActiveSubStatusPill(null);
              }}
              className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusViewMode === 'CONCLUIDAS'
                  ? 'bg-zinc-900 text-[#FFCC01] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Fichas Concluídas ({coafCount + arquivadosCount})</span>
            </button>

            <button
              onClick={() => {
                setStatusViewMode('TODOS');
                setActiveSubStatusPill(null);
              }}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                statusViewMode === 'TODOS'
                  ? 'bg-zinc-900 text-[#FFCC01] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Todas ({casos.length})
            </button>
          </div>

          {/* Ação em lote: Reatribuir analista (RF-06) */}
          {selectedCaseIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-zinc-900">
                {selectedCaseIds.length} ficha(s) selecionada(s)
              </span>
              <button
                onClick={() => setShowReassignModal(true)}
                className="px-2.5 py-1 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-bold flex items-center gap-1.5 border border-[#E5B700] cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-black" />
                <span>Reatribuir Analista em Lote (RF-06)</span>
              </button>
            </div>
          )}

          {/* Ordenação (RF-07) */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-semibold text-zinc-700">Ordenar por:</span>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as any)}
              className="bg-zinc-50 border border-zinc-300 rounded px-2 py-0.5 text-xs font-bold text-zinc-900 outline-none"
            >
              <option value="SCORE_DESC">Score de Risco (Maior Primeiro)</option>
              <option value="SLA_ASC">Prazo SLA (Mais Urgente Primeiro)</option>
              <option value="VALOR_DESC">Volume Financeiro (Maior Primeiro)</option>
            </select>
          </div>
        </div>

        {/* Filtros em Linha (RF-05 + BI) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 bg-white p-3 rounded-lg border border-zinc-200">
          {/* Busca textual */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Busca no Lote</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome, CPF ou Matrícula..."
                className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-400 text-xs rounded pl-8 pr-2.5 py-1.5 outline-none"
              />
            </div>
          </div>

          {/* Filtro: Tipo de Ficha (RF-05) */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Tipo de Ficha</label>
            <select
              value={tipoFichaFilter}
              onChange={(e) => setTipoFichaFilter(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded px-2.5 py-1.5 font-semibold text-zinc-900 outline-none"
            >
              <option value="TODOS">Todas as Fichas</option>
              <option value="Operações">Operações</option>
              <option value="Conta Corrente">Conta Corrente / Digital</option>
            </select>
          </div>

          {/* Filtro: Motivo do Alerta (RF-05 + 16 Diretrizes de Pessoas) */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Motivo do Alerta (16)</label>
            <select
              value={motivoFilter}
              onChange={(e) => setMotivoFilter(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded px-2.5 py-1.5 font-semibold text-zinc-900 outline-none"
            >
              <option value="TODOS">Todos os Alertas (16)</option>
              <optgroup label="✅ Alertas Atuais (11)">
                {PERSON_ANALYSIS_ALERTS.filter((a) => a.status === 'ATUAL').map((al) => (
                  <option key={al.id} value={al.id}>
                    {al.filtroAlerta}
                  </option>
                ))}
              </optgroup>
              <optgroup label="⚠️ Novos Alertas (5)">
                {PERSON_ANALYSIS_ALERTS.filter((a) => a.status === 'NOVO').map((al) => (
                  <option key={al.id} value={al.id}>
                    {al.filtroAlerta} (Novo)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Filtro: Origem dos Recursos */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Origem dos Recursos</label>
            <select
              value={origemRecursosFilter}
              onChange={(e) => setOrigemRecursosFilter(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded px-2.5 py-1.5 font-semibold text-zinc-900 outline-none"
            >
              <option value="TODOS">Todas as Origens</option>
              <option value="SALARIO">Salário / Proventos</option>
              <option value="IMOVEIS">Venda de Imóveis</option>
              <option value="APOSTAS">Apostas / Prêmios</option>
              <option value="EMPRESTIMOS">Empréstimos / Crédito</option>
              <option value="TERCEIROS">Terceiros / Passagem</option>
              <option value="RURAL">Atividade Rural</option>
            </select>
          </div>

          {/* Filtro: Analista Atribuído (RF-05) */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Analista</label>
            <select
              value={analistaFilter}
              onChange={(e) => setAnalistaFilter(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded px-2.5 py-1.5 font-semibold text-zinc-900 outline-none"
            >
              <option value="TODOS">Todos Analistas</option>
              {listaAnalistas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Filtro Rápido: Horário de Jogos / Apostas */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => setHorarioJogosFilter(!horarioJogosFilter)}
              className={`w-full py-1.5 px-2 rounded text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                horarioJogosFilter
                  ? 'bg-orange-600 border-orange-700 text-white shadow-xs'
                  : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>{horarioJogosFilter ? 'Em Jogos (Ativo)' : 'Horário de Jogos'}</span>
            </button>
          </div>
        </div>

        {/* Sub-status Badges Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs">
          <span className="text-[11px] font-bold text-zinc-500 px-2 uppercase">Filtrar Sub-Status:</span>

          {statusViewMode !== 'CONCLUIDAS' && (
            <>
              <button
                onClick={() => setActiveSubStatusPill(activeSubStatusPill === 'Pendente' ? null : 'Pendente')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  activeSubStatusPill === 'Pendente'
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-700 hover:text-zinc-900'
                }`}
              >
                {pendentesCount} Pendentes
              </button>

              <button
                onClick={() => setActiveSubStatusPill(activeSubStatusPill === 'Em Análise' ? null : 'Em Análise')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  activeSubStatusPill === 'Em Análise'
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-700 hover:text-zinc-900'
                }`}
              >
                {emAnaliseCount} Em Análise
              </button>

              <button
                onClick={() => setActiveSubStatusPill(activeSubStatusPill === 'Diligência' ? null : 'Diligência')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  activeSubStatusPill === 'Diligência'
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-700 hover:text-zinc-900'
                }`}
              >
                {diligenciaCount} Em Diligência (RF-39)
              </button>
            </>
          )}

          {statusViewMode !== 'PENDENTES' && (
            <>
              <button
                onClick={() => setActiveSubStatusPill(activeSubStatusPill === 'COAF' ? null : 'COAF')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  activeSubStatusPill === 'COAF'
                    ? 'bg-red-800 text-white font-bold'
                    : 'text-red-700 hover:text-red-900'
                }`}
              >
                {coafCount} Comunicados COAF (RF-40)
              </button>

              <button
                onClick={() => setActiveSubStatusPill(activeSubStatusPill === 'Sem Ocorrência' ? null : 'Sem Ocorrência')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  activeSubStatusPill === 'Sem Ocorrência'
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-700 hover:text-zinc-900'
                }`}
              >
                {arquivadosCount} Sem Ocorrência / Arquivado (RF-40)
              </button>
            </>
          )}
        </div>

        {/* Banner de Diretriz Vinculante de Análise de Pessoa quando filtro selecionado */}
        {activePersonAlert && (
          <div className="bg-[#111827] border border-zinc-700 rounded p-4 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md animate-fadeIn">
            <div className="space-y-1.5 max-w-4xl">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-bold text-sm text-[#FFCC01] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#FFCC01]" />
                  <span>DIRETRIZ ATIVA: {activePersonAlert.filtroAlerta}</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {activePersonAlert.categoria}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  activePersonAlert.status === 'ATUAL'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}>
                  {activePersonAlert.statusLabel}
                </span>
                <span className="text-xs text-zinc-300">
                  • <strong>Foco:</strong> {activePersonAlert.focoAcao}
                </span>
              </div>
              <div className="text-xs text-zinc-200 leading-relaxed">
                <strong className="text-[#FFCC01]">Ação Prática Obrigatória do Analista:</strong> {activePersonAlert.acaoPratica}
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsMatrixModalOpen(true)}
                className="px-3 py-1.5 bg-[#FFCC01] hover:bg-[#E5B700] text-black rounded text-xs font-black flex items-center space-x-1 shadow-sm transition cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-black" />
                <span>Ver 16 Diretrizes</span>
              </button>
              <button
                onClick={() => setMotivoFilter('TODOS')}
                className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition border border-zinc-700 cursor-pointer"
              >
                Limpar
              </button>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs table-auto">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-2 text-center w-7">
                    <input
                      type="checkbox"
                      checked={selectedCaseIds.length === filteredCasos.length && filteredCasos.length > 0}
                      onChange={handleSelectAllVisible}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Tipo / Ref</th>
                  <th className="py-2.5 px-3">Investigado / Localização</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">Score & Risco</th>
                  <th className="py-2.5 px-3">Motivo & Tipologia PLD</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Volume / Renda</th>
                  <th className="py-2.5 px-2.5 text-center whitespace-nowrap">SLA Rest. (RF-08)</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">Situação</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Analista</th>
                  <th className="py-2.5 px-2.5 text-center whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredCasos.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-zinc-500">
                      Nenhuma ficha localizada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredCasos.map((caso) => {
                    const isSelected = selectedCaseIds.includes(caso.id);
                    const isConcluida = caso.status === 'Comunicado COAF' || caso.status === 'Arquivado';

                    // Cores do indicador de SLA (RF-08)
                    const isSlaCritico = caso.slaHorasRestantes <= 8;
                    const isSlaAlerta = caso.slaHorasRestantes > 8 && caso.slaHorasRestantes <= 16;

                    return (
                      <tr
                        key={caso.id}
                        className={`hover:bg-zinc-50 transition-colors ${
                          isSelected ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(caso.id)}
                            className="cursor-pointer"
                          />
                        </td>

                        {/* Tipo / Ref */}
                        <td className="py-2.5 px-2.5 whitespace-nowrap">
                          <span className="font-bold text-zinc-900 font-mono block text-[11px]">
                            {caso.dataReferencia || '08/2026'}
                          </span>
                          <span className="text-[10px] text-zinc-600 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200">
                            {caso.tipoFicha || 'Operações'}
                          </span>
                        </td>

                        {/* Investigado */}
                        <td className="py-2.5 px-3">
                          <div
                            onClick={() => setActiveCaseId(caso.id)}
                            className="font-bold text-zinc-950 hover:underline cursor-pointer flex items-center gap-1.5 leading-tight"
                          >
                            <span>{caso.nome}</span>
                          </div>
                          <div className="text-[10.5px] text-zinc-500 font-mono">
                            {caso.cpf} • {caso.kyc.cidadeUf} ({caso.regiaoPais || 'Centro-Oeste'})
                          </div>
                          {caso.device && (
                            <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <Smartphone className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span>{caso.device.modelo}</span>
                              <span
                                className={`px-1 py-0.2 rounded font-bold text-[9px] ${
                                  caso.device.scoreRiscoFraude >= 70
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                Fraude: {caso.device.scoreRiscoFraude}
                              </span>
                              {caso.device.notasAltas?.[0] && (
                                <span className="px-1 rounded text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  {caso.device.notasAltas[0]}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Score & Risco */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-black ${
                              caso.scoreRisco >= 70
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : caso.scoreRisco >= 40
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {caso.scoreRisco}
                          </span>
                          <span className="block text-[10px] text-zinc-500 font-semibold mt-0.5">
                            {caso.risco}
                          </span>
                        </td>

                        {/* Motivo & Tipologia */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {caso.isPep && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                PEP
                              </span>
                            )}
                            {(caso.regiaoRisco === 'Fronteira' || caso.regiaoRisco === 'Mineração') && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                {caso.regiaoRisco}
                              </span>
                            )}
                            {caso.snapshotCadastral?.limocAtivo && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-zinc-800 text-white border border-zinc-700">
                                LIMOC
                              </span>
                            )}
                            {caso.transacoes?.some((t) => t.isHorarioJogos) && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-200 flex items-center gap-1">
                                ⚽ Jogos
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-zinc-800 text-[11px] mt-0.5 line-clamp-1" title={caso.tipologiaPld}>
                            {caso.tipologiaPld}
                          </div>
                          <div className="text-[10px] text-zinc-500 line-clamp-1" title={caso.regraDisparada}>
                            {caso.regraDisparada}
                          </div>
                          <div className="text-[10px] text-zinc-600 line-clamp-1">
                            Origem: {caso.origemRecursos || 'Salário / Proventos'}
                          </div>
                        </td>

                        {/* Volume / Renda */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="font-bold text-zinc-950 font-mono">
                            {formatCurrency(caso.volumeAtipicoPeriodo || caso.valorEnvolvido)}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            Renda: {formatCurrency(caso.capacidadeFinanceira?.rendaDeclarada || caso.renda)}
                          </div>
                        </td>

                        {/* SLA Restante (RF-08) */}
                        <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                          {isConcluida ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Concluído
                            </span>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold inline-flex items-center gap-1 ${
                                isSlaCritico
                                  ? 'bg-red-100 text-red-900 border border-red-300 animate-pulse'
                                  : isSlaAlerta
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {caso.slaHorasRestantes}h rest.
                            </span>
                          )}
                        </td>

                        {/* Situação */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
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

                        {/* Analista */}
                        <td className="py-2.5 px-2.5 text-[11px] whitespace-nowrap">
                          <div className="font-semibold text-zinc-800">{caso.analistaNome || 'Maísa Ramos'}</div>
                          <div className="text-[10px] text-zinc-400">GECON / GESIN</div>
                        </td>

                        {/* Ações */}
                        <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setActiveCaseId(caso.id)}
                              className="px-2.5 py-1 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black text-[11px] font-bold border border-[#E5B700] transition-colors cursor-pointer shadow-xs"
                            >
                              Investigar
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
      </div>

      {/* Modal de Reatribuição de Analista em Lote (RF-06) */}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-zinc-300 w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-950 uppercase flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-zinc-700" />
                Reatribuir {selectedCaseIds.length} Ficha(s) (RF-06)
              </h3>
            </div>
            <div className="p-4 space-y-3 text-xs text-zinc-800">
              <p>
                Selecione o novo analista responsável pelas fichas selecionadas. A mudança será registrada na trilha de auditoria contínua (<code className="font-mono bg-zinc-100 px-1">TB_Ficha_StatusHistorico</code>).
              </p>
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Novo Analista</label>
                <select
                  value={novoAnalista.nome}
                  onChange={(e) => {
                    const nome = e.target.value;
                    const iniciais = nome === 'Carlos Eduardo' ? 'CE' : nome === 'Fernanda Lima' ? 'FL' : 'MR';
                    setNovoAnalista({ nome, iniciais });
                  }}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded p-2 text-xs font-semibold outline-none"
                >
                  <option value="Carlos Eduardo">Carlos Eduardo (Analista Pleno - CE)</option>
                  <option value="Fernanda Lima">Fernanda Lima (Analista Especialista - FL)</option>
                  <option value="Maísa Ramos">Maísa Ramos (Analista Sênior - MR)</option>
                </select>
              </div>
            </div>
            <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowReassignModal(false)}
                className="px-3 py-1.5 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black font-bold text-xs border border-[#E5B700] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReassign}
                className="px-4 py-1.5 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black font-bold text-xs border border-[#E5B700] cursor-pointer shadow-xs"
              >
                Confirmar Reatribuição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exportação em Lote */}
      <BatchExportModal
        isOpen={isBatchExportOpen}
        onClose={() => setIsBatchExportOpen(false)}
        initialPeriod="08/2026"
      />

      {/* Modal da Matriz de Diretrizes de Pessoas */}
      <PersonAnalysisMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        onSelectAlert={(id) => setMotivoFilter(id)}
        casos={casos}
      />
    </div>
  );
};
