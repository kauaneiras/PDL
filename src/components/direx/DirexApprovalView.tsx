import React, { useState } from 'react';
import { useAml } from '../../context/AmlContext';
import { CasoInvestigacao } from '../../types';
import {
  ShieldAlert,
  CheckCircle2,
  Lock,
  FileCheck,
  FileText,
  AlertTriangle,
  RotateCcw,
  Search,
  Download,
  KeyRound,
  UserCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  FileSpreadsheet,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { BatchExportModal } from '../export/BatchExportModal';

export const DirexApprovalView: React.FC = () => {
  const {
    casos,
    currentUserRole,
    setCurrentUserRole,
    assinarDirex,
    assinarDirexLote,
    rejeitarDirex,
    setActiveCaseId,
    navigateTo,
    showToast,
  } = useAml();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'TODOS' | 'PENDENTES_DIREX' | 'HOMOLOGADOS'>('PENDENTES_DIREX');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // Modal de Assinatura Individual
  const [selectedCaseToSign, setSelectedCaseToSign] = useState<CasoInvestigacao | null>(null);
  const [despachoText, setDespachoText] = useState(
    'Homologação executiva deferida. Dossiê em estrita conformidade com a Circular BACEN nº 3.978/2020 e Lei nº 9.613/1998. Autorizada a exportação SISCOAF.'
  );
  const [diretorResponsavel, setDiretorResponsavel] = useState('Dr. Roberto Guimarães');
  const [cargoDiretor, setCargoDiretor] = useState('Diretor de Riscos, Compliance e Governança (DIREX)');
  const [certificadoSelecionado, setCertificadoSelecionado] = useState('ICP-Brasil A3 (Token TokenSafeNet - Serial 89102-BR)');

  // Modal de Devolução / Rejeição
  const [caseToReject, setCaseToReject] = useState<CasoInvestigacao | null>(null);
  const [motivoDevolucao, setMotivoDevolucao] = useState('');

  // Modal de Exportação SISCOAF
  const [showExportModal, setShowExportModal] = useState(false);

  // Casos relevantes: Qualquer caso que tenha deliberação de COMUNICAR_COAF ou status Aguardando Assinatura DIREX ou Comunicado COAF
  const casosCoaf = casos.filter(
    (c) =>
      c.status === 'Aguardando Assinatura DIREX' ||
      c.status === 'Comunicado COAF' ||
      c.parecer?.deliberacao === 'COMUNICAR_COAF' ||
      c.decisaoGecanDetalhada?.decisao === 'COMUNICAR_COAF'
  );

  const pendentesDirex = casosCoaf.filter(
    (c) => c.status === 'Aguardando Assinatura DIREX' || !c.deliberacaoDirex?.aprovadoPor
  );

  const homologadosDirex = casosCoaf.filter(
    (c) => c.status === 'Comunicado COAF' && c.deliberacaoDirex?.aprovadoPor
  );

  const filteredCasos = casosCoaf.filter((c) => {
    // Filtro da aba
    if (filterTab === 'PENDENTES_DIREX') {
      if (c.status !== 'Aguardando Assinatura DIREX' && c.deliberacaoDirex?.aprovadoPor) return false;
    } else if (filterTab === 'HOMOLOGADOS') {
      if (!c.deliberacaoDirex?.aprovadoPor) return false;
    }

    // Busca textual
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.nome.toLowerCase().includes(term) ||
      c.cpf.includes(term) ||
      c.matricula.toLowerCase().includes(term) ||
      (c.decisaoGecanDetalhada?.tipologiaCoafCodigo || '').toLowerCase().includes(term) ||
      c.regraDisparada.toLowerCase().includes(term)
    );
  });

  const totalVolumeCoaf = casosCoaf.reduce(
    (acc, c) => acc + (c.volumeAtipicoPeriodo || c.valorEnvolvido || 0),
    0
  );

  const handleOpenSignModal = (caso: CasoInvestigacao) => {
    setSelectedCaseToSign(caso);
    setDespachoText(
      `Homologada comunicação ao SISCOAF referente ao cooperado ${caso.nome} (CPF ${caso.cpf}). Atipicidade fundamentada em relatório analítico de PLD/FT conforme Resolução BCB nº 3.978/2020. Liberação de arquivo em lote concedida.`
    );
  };

  const handleConfirmSign = () => {
    if (!selectedCaseToSign) return;
    assinarDirex(selectedCaseToSign.id, {
      diretorNome: diretorResponsavel,
      cargo: cargoDiretor,
      despacho: despachoText,
    });
    setSelectedCaseToSign(null);
  };

  const handleSignAllPending = () => {
    const ids = pendentesDirex.map((c) => c.id);
    if (ids.length === 0) {
      showToast('Nenhum dossiê pendente de assinatura da Diretoria.', 'info');
      return;
    }
    assinarDirexLote(ids, {
      diretorNome: diretorResponsavel,
      cargo: cargoDiretor,
      despacho: 'Homologação executiva em lote concedida pela Diretoria de Riscos e Compliance. Dossiês autorizados para integração SISCOAF.',
    });
  };

  const handleConfirmDevolucao = () => {
    if (!caseToReject || !motivoDevolucao.trim()) {
      showToast('Por favor, informe a justificativa para devolução do dossiê.', 'error');
      return;
    }
    rejeitarDirex(caseToReject.id, motivoDevolucao);
    setCaseToReject(null);
    setMotivoDevolucao('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner: RF14 & UC04 Explanation */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 text-[#FFCC01] flex items-center justify-center shrink-0 font-bold shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-zinc-950 uppercase tracking-tight">
                Esteira de Aprovação Executiva DIREX (RF-14 / UC-04)
              </h1>
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-[#FFCC01] text-[10px] font-mono font-black uppercase">
                COAF / SISCOAF
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-1 max-w-3xl leading-relaxed">
              Área restrita de validação executiva e governança. Os dossiês finalizados pelos analistas com parecer conclusivo de <strong>"Comunicar COAF"</strong> são direcionados exclusivamente a esta esteira. A assinatura digital de um membro da <strong>Diretoria Executiva (DIREX)</strong> é pré-requisito legal compulsório para liberar a geração do arquivo XML/CSV do SISCOAF (RF-09).
            </p>
          </div>
        </div>

        {/* Role Switcher Widget */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold text-zinc-600 uppercase">Perfil em Uso:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                currentUserRole === 'DIRETORIA'
                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                  : 'bg-zinc-100 text-zinc-900 border border-zinc-300'
              }`}
            >
              {currentUserRole === 'DIRETORIA' ? '🛡️ Diretoria (DIREX)' : '👤 Analista de PLD'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setCurrentUserRole('ANALISTA');
                showToast('Perfil alternado para Analista de PLD (Maísa Ramos)', 'info');
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                currentUserRole === 'ANALISTA'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-300'
              }`}
            >
              Analista
            </button>
            <button
              onClick={() => {
                setCurrentUserRole('DIRETORIA');
                showToast('Perfil alternado para Diretoria Executiva (Dr. Roberto Guimarães)', 'success');
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                currentUserRole === 'DIRETORIA'
                  ? 'bg-[#FFCC01] text-black border border-[#E5B700] shadow-xs'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-300'
              }`}
            >
              Diretoria (DIREX)
            </button>
          </div>
        </div>
      </div>

      {/* Role Notice */}
      {currentUserRole !== 'DIRETORIA' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <strong>Atenção Regulamentar (RF-14):</strong> Você está no perfil de <em>Analista de PLD</em>. Você pode visualizar a fila de deliberação executiva, mas a aplicação de assinatura digital e despacho liberatório do lote SISCOAF exige privilégios de <strong>Diretoria</strong>.
            </div>
          </div>
          <button
            onClick={() => {
              setCurrentUserRole('DIRETORIA');
              showToast('Perfil alternado para Diretoria Executiva.', 'success');
            }}
            className="px-3 py-1.5 bg-[#FFCC01] hover:bg-[#E5B700] text-black font-bold text-xs rounded border border-[#E5B700] shrink-0 cursor-pointer shadow-xs"
          >
            Assumir Perfil DIREX
          </button>
        </div>
      ) : (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3.5 flex items-center justify-between gap-3 text-xs text-purple-950">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-700 shrink-0" />
            <div>
              <strong>Sessão de Diretoria Autorizada:</strong> Dr. Roberto Guimarães (Diretor de Riscos e Compliance) • Certificado A3 conectado com suporte a assinatura ICP-Brasil.
            </div>
          </div>
          <button
            onClick={handleSignAllPending}
            disabled={pendentesDirex.length === 0}
            className="px-3.5 py-1.5 bg-[#FFCC01] hover:bg-[#E5B700] text-black font-bold text-xs rounded border border-[#E5B700] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-40"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Assinar Todos os Pendentes ({pendentesDirex.length})</span>
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase">Total na Esteira COAF</span>
            <FileText className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-950">{casosCoaf.length}</span>
            <span className="text-xs text-zinc-500">dossiês</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            Encaminhados para comunicação formal
          </div>
        </div>

        <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase">Aguardando DIREX (Bloqueados)</span>
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-950">{pendentesDirex.length}</span>
            <span className="text-xs font-bold text-amber-700">RF-14 pendente</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-800">
            Exportação SISCOAF bloqueada até assinatura
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-lg p-4 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase">Homologados DIREX (Liberados)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-950">{homologadosDirex.length}</span>
            <span className="text-xs font-bold text-emerald-700">Prontos p/ SISCOAF</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-800">
            Assinatura digital ICP-Brasil aplicada
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase">Volume Atípico Acumulado</span>
            <Building2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-black text-zinc-950">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalVolumeCoaf)}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            Operações sob suspeição e reporte
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterTab('PENDENTES_DIREX')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'PENDENTES_DIREX'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Aguardando Assinatura DIREX ({pendentesDirex.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('HOMOLOGADOS')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'HOMOLOGADOS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Homologados & Assinados ({homologadosDirex.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('TODOS')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'TODOS'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <span>Todos na Esteira ({casosCoaf.length})</span>
          </button>
        </div>

        {/* Search & Export Button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, CPF, tipologia..."
              className="pl-8 pr-3 py-1.5 bg-white border border-zinc-300 rounded text-xs text-zinc-800 w-60 outline-none focus:border-zinc-500"
            />
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-1.5 bg-[#FFCC01] hover:bg-[#E5B700] text-black font-bold text-xs rounded border border-[#E5B700] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Exportação SISCOAF (RF-09)</span>
          </button>
        </div>
      </div>

      {/* Main Table / Cases List */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-800 uppercase tracking-wide">
            Dossiês Conclusivos com Recomendação de Comunicação SISCOAF ({filteredCasos.length})
          </span>
          <span className="text-zinc-500 text-[11px]">
            Conformidade Art. 38 Circular BACEN 3.978/2020 e Art. 11 Lei 9.613/1998
          </span>
        </div>

        {filteredCasos.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs">
            Nenhum dossiê localizado para os critérios selecionados nesta esteira.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {filteredCasos.map((caso) => {
              const isAssinado = !!caso.deliberacaoDirex?.aprovadoPor;
              const isExpanded = expandedCaseId === caso.id;

              return (
                <div key={caso.id} className="p-4 hover:bg-zinc-50/70 transition-colors space-y-3">
                  {/* Primary Row */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Left: Associate & Case Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-zinc-950">{caso.nome}</span>
                        <span className="font-mono text-xs text-zinc-500">{caso.cpf}</span>
                        <span className="text-xs bg-zinc-200 text-zinc-800 px-1.5 py-0.2 rounded font-mono font-bold">
                          {caso.matricula}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            caso.risco === 'Crítico'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          Score {caso.scoreRisco} pts ({caso.risco})
                        </span>

                        {isAssinado ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Homologado DIREX (Liberado SISCOAF)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-700" />
                            Pendente Assinatura DIREX (Exportação Bloqueada)
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-zinc-600 flex items-center gap-3 flex-wrap">
                        <span>
                          Alerta: <strong>{caso.alertaId}</strong> ({caso.regraDisparada})
                        </span>
                        <span>•</span>
                        <span>
                          Volume Atípico: <strong className="text-red-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(caso.volumeAtipicoPeriodo || caso.valorEnvolvido)}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Tipologia COAF: <strong>{caso.decisaoGecanDetalhada?.tipologiaCoafCodigo || caso.parecer?.tipologiaCoaf || '1.1.1'}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Analista: <strong>{caso.analistaNome || 'Maísa Ramos'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setActiveCaseId(caso.id);
                          navigateTo('/investigacao');
                        }}
                        className="px-2.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold rounded border border-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Ver dossiê detalhado completo"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-600" />
                        <span>Ver Dossiê</span>
                      </button>

                      <button
                        onClick={() => setExpandedCaseId(isExpanded ? null : caso.id)}
                        className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded border border-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Parecer & Deliberação</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {!isAssinado && (
                        <>
                          <button
                            onClick={() => handleOpenSignModal(caso)}
                            disabled={currentUserRole !== 'DIRETORIA'}
                            className="px-3.5 py-1.5 bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-black rounded border border-[#E5B700] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title={
                              currentUserRole !== 'DIRETORIA'
                                ? 'Requer perfil Diretoria para assinar'
                                : 'Assinar digitalmente com ICP-Brasil e homologar envio'
                            }
                          >
                            <KeyRound className="w-3.5 h-3.5 text-black" />
                            <span>Assinar Digitalmente (DIREX)</span>
                          </button>

                          <button
                            onClick={() => setCaseToReject(caso)}
                            disabled={currentUserRole !== 'DIRETORIA'}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold rounded border border-red-300 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                            title="Devolver dossiê para reanálise do analista"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Devolver</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Signature Details Box (If Signed) */}
                  {isAssinado && (
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded p-2.5 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <strong>Homologado por:</strong> {caso.deliberacaoDirex?.aprovadoPor} ({caso.deliberacaoDirex?.cargoAprovador}) em {caso.deliberacaoDirex?.dataHoraAssinatura}
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-emerald-800">
                        Token: {caso.deliberacaoDirex?.certificadoIcpBrasilToken} • Hash: {caso.deliberacaoDirex?.hashAssinaturaDigital?.substring(0, 16)}...
                      </div>
                    </div>
                  )}

                  {/* Expandable Section: Parecer & Despacho */}
                  {isExpanded && (
                    <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs space-y-3 animate-in fade-in duration-150">
                      <div>
                        <div className="font-bold text-zinc-900 uppercase text-[11px] mb-1">
                          Parecer Técnico Conclusivo do Analista:
                        </div>
                        <div className="bg-white p-3 border border-zinc-300 rounded text-zinc-800 whitespace-pre-line font-serif text-[12px] leading-relaxed">
                          {caso.parecer?.texto || 'Parecer técnico em fase de consolidação analítica.'}
                        </div>
                      </div>

                      {caso.deliberacaoDirex && (
                        <div>
                          <div className="font-bold text-zinc-900 uppercase text-[11px] mb-1">
                            Despacho Executivo da Diretoria:
                          </div>
                          <div className="bg-white p-3 border border-zinc-300 rounded text-zinc-800 text-[12px]">
                            {caso.deliberacaoDirex.textoDeliberacao}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Assinatura Digital DIREX (RF-14, UC-04) */}
      {selectedCaseToSign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-zinc-300 w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#FFCC01] text-black flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wide">
                    Assinatura Digital & Homologação SISCOAF (RF-14)
                  </h2>
                  <p className="text-xs text-zinc-300">
                    Validação Executiva de Comunicação Compulsória ao COAF
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCaseToSign(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs text-zinc-800">
              {/* Associado Info */}
              <div className="bg-zinc-50 border border-zinc-200 rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-zinc-950 text-sm">{selectedCaseToSign.nome}</div>
                  <div className="text-zinc-500 font-mono text-xs">
                    CPF: {selectedCaseToSign.cpf} • Matrícula: {selectedCaseToSign.matricula}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Volume Reportado</div>
                  <div className="font-black text-red-700 text-sm">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedCaseToSign.volumeAtipicoPeriodo || selectedCaseToSign.valorEnvolvido)}
                  </div>
                </div>
              </div>

              {/* Certificado Digital */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                  Certificado Digital de Assinatura (ICP-Brasil)
                </label>
                <select
                  value={certificadoSelecionado}
                  onChange={(e) => setCertificadoSelecionado(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded p-2 text-xs font-semibold text-zinc-900 outline-none"
                >
                  <option value="ICP-Brasil A3 (Token SafeNet - Serial 89102-BR)">
                    ICP-Brasil A3 (Token SafeNet - Serial 89102-BR - Dr. Roberto Guimarães)
                  </option>
                  <option value="Certisign Nuvem ID (Certificado Corporativo DIREX)">
                    Certisign Nuvem ID (Certificado Corporativo DIREX - Válido até 2027)
                  </option>
                </select>
              </div>

              {/* Despacho da Diretoria */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                  Despacho Executivo da Diretoria (Obrigatório)
                </label>
                <textarea
                  value={despachoText}
                  onChange={(e) => setDespachoText(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-zinc-300 rounded p-2 text-xs text-zinc-900 outline-none resize-none"
                />
              </div>

              {/* Aviso Regulatório */}
              <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-emerald-950 text-[11px] leading-relaxed">
                <strong>Efeito Legal da Homologação (RF-09, RF-14):</strong> Ao aplicar sua assinatura, este dossiê receberá protocolo criptográfico imutável e será <strong>liberado para extração no arquivo XML/CSV do SISCOAF</strong>. A comunicação será mantida sob sigilo bancário nos termos da Lei Complementar nº 105/2001.
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCaseToSign(null)}
                className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold rounded border border-zinc-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSign}
                className="px-4 py-2 bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-black rounded border border-[#E5B700] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Aplicar Assinatura Digital & Liberar SISCOAF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Devolução / Diligência Adicional */}
      {caseToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-zinc-300 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-zinc-200 bg-red-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-red-600" />
                <h2 className="text-sm font-bold text-red-950 uppercase">
                  Devolver Dossiê para o Analista
                </h2>
              </div>
              <button
                onClick={() => setCaseToReject(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs text-zinc-800">
              <p>
                Informe as razões pelas quais o dossiê de <strong>{caseToReject.nome}</strong> está sendo devolvido para complementação de análise e diligências:
              </p>
              <textarea
                value={motivoDevolucao}
                onChange={(e) => setMotivoDevolucao(e.target.value)}
                placeholder="Ex: Necessária comprovação de capacidade financeira ou esclarecimento sobre beneficiário final..."
                rows={4}
                className="w-full bg-white border border-zinc-300 rounded p-2 text-xs text-zinc-900 outline-none resize-none"
              />
            </div>

            <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setCaseToReject(null)}
                className="px-3 py-1.5 bg-white border border-zinc-300 rounded text-zinc-700 font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDevolucao}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors"
              >
                Confirmar Devolução
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Export Modal */}
      {showExportModal && (
        <BatchExportModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};
