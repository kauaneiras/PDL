import React, { useState, useMemo } from 'react';
import { useAml } from '../../context/AmlContext';
import { GraphView } from './GraphView';
import { DossierExportModal } from './DossierExportModal';
import { mockSnippets, coafTipologias } from '../../data/mock-data';
import { generateCanonicalPldGraph } from '../../utils/graphPldGenerator';
import { CasoInvestigacao } from '../../types';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Sparkles,
  Save,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  Send,
  History,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Building,
  UserCheck,
  DollarSign,
  Share2,
  Filter,
  Users,
  Search,
  FileDown,
  Printer
} from 'lucide-react';

export const InvestigationView: React.FC = () => {
  const { activeCase, saveDraft, finalizeDeliberation, showToast, navigateTo } = useAml();

  // Accordions states (Capacidade Financeira & Grafo open by default)
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    kyc: false,
    alerta: false,
    bancarios: false,
    capacidade: true,
    grafo: true,
    extrato: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // PLD / AML Regulatory Checklist
  const [checklist, setChecklist] = useState({
    qualificacaoKyc: activeCase.resumoPldChecklist?.qualificacaoKyc ?? true,
    capacidadeFinanceira: activeCase.resumoPldChecklist?.capacidadeFinanceira ?? false,
    listasRestritivas: activeCase.resumoPldChecklist?.listasRestritivas ?? true,
    enquadramentoPep: activeCase.resumoPldChecklist?.enquadramentoPep ?? true,
    vinculosSocietarios: activeCase.resumoPldChecklist?.vinculosSocietarios ?? true,
    origemDestinoRecursos: activeCase.resumoPldChecklist?.origemDestinoRecursos ?? false,
    midiasDesabonadoras: activeCase.resumoPldChecklist?.midiasDesabonadoras ?? true,
    analiseFracionamento: activeCase.resumoPldChecklist?.analiseFracionamento ?? true,
    contasPassagem: activeCase.resumoPldChecklist?.contasPassagem ?? true,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Anotações / Parecer PLD
  const [anotacoes, setAnotacoes] = useState(
    activeCase.parecer.texto ||
    (activeCase.status === 'Arquivado'
      ? 'Operação analisada pela equipe de PLD/FT. Constatada mesma titularidade e regularidade fiscal/patrimonial, sem indícios de ocultação de valores ou burla regulatória. Parecer pelo arquivamento.'
      : activeCase.status === 'Comunicado COAF'
      ? 'Identificada movimentação atípica sem lastro econômico e rápida evasão de recursos. Operação formalmente comunicada ao SISCOAF nos termos da Lei 9.613/98.'
      : 'Iniciada análise de atipicidade. Verificada incompatibilidade entre a movimentação financeira registrada no período e a renda declarada no cadastro. Procedendo com a checagem de contrapartes e extrato.')
  );

  const [deliberacao, setDeliberacao] = useState<'ARQUIVAR' | 'DILIGENCIA' | 'COMUNICAR_COAF' | 'BLOQUEIO_CAUTELAR'>(
    activeCase.parecer.deliberacao === 'COMUNICAR_COAF'
      ? 'COMUNICAR_COAF'
      : activeCase.parecer.deliberacao === 'DILIGENCIA'
      ? 'DILIGENCIA'
      : activeCase.parecer.deliberacao === 'ARQUIVAR'
      ? 'ARQUIVAR'
      : activeCase.risco === 'Crítico'
      ? 'COMUNICAR_COAF'
      : 'ARQUIVAR'
  );

  const [tipologiaCoaf, setTipologiaCoaf] = useState(activeCase.parecer.tipologiaCoaf || coafTipologias[0]);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [isGraphExpanded, setIsGraphExpanded] = useState(false);
  const [lastInsertedSnippet, setLastInsertedSnippet] = useState<string | null>(null);

  // Filtros de Extrato de Transações PLD
  const [extratoFilterType, setExtratoFilterType] = useState<'SUSPEITAS' | 'TODAS' | 'FAMILIARES' | 'TERCEIROS' | 'EMPRESAS' | 'ESPECIE'>('SUSPEITAS');
  const [extratoSearch, setExtratoSearch] = useState<string>('');
  const [extratoPersonFilter, setExtratoPersonFilter] = useState<string | null>(null);

  // Dataset do Grafo Canônico com Milhares de Transações PLD
  const canonicalGraph = useMemo(() => {
    return generateCanonicalPldGraph(activeCase);
  }, [activeCase]);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleSelectPersonFromGraph = (personLabel: string) => {
    setExtratoPersonFilter(personLabel);
    setOpenSections((prev) => ({ ...prev, extrato: true }));
    showToast(`Extrato filtrado para: ${personLabel}`, 'info');
  };

  const handleAddGraphNoteToReport = (note: string) => {
    setAnotacoes((prev) => {
      const sep = prev.trim() ? '\n\n' : '';
      return prev + sep + note;
    });
    showToast('Apontamento do grafo inserido no parecer!', 'info');
  };

  // Lista de Transações Filtradas para o Accordion de Extrato
  const filteredTransactions = useMemo(() => {
    let list = canonicalGraph.todasTransacoes;

    if (extratoPersonFilter) {
      const cleanFilter = extratoPersonFilter.toLowerCase().split('(')[0].trim();
      list = list.filter(
        (t) =>
          t.contraparte?.toLowerCase().includes(cleanFilter) ||
          t.contraparteCpfCnpj?.includes(cleanFilter) ||
          t.origem?.toLowerCase().includes(cleanFilter)
      );
    } else {
      if (extratoFilterType === 'SUSPEITAS') {
        list = list.filter((t) => t.isSuspeita);
      } else if (extratoFilterType === 'FAMILIARES') {
        const familiarNames = ['mariana', 'lucas', 'rodrigo', 'helena', 'prado', 'cônjuge', 'filho', 'irmão', 'mãe'];
        list = list.filter((t) => familiarNames.some((fn) => t.contraparte?.toLowerCase().includes(fn)));
      } else if (extratoFilterType === 'TERCEIROS') {
        const thirdTerms = ['atm', 'joaquim', 'ana beatriz', 'caixa 04', 'rodoviária', 'não identificado'];
        list = list.filter((t) => thirdTerms.some((tt) => t.contraparte?.toLowerCase().includes(tt)));
      } else if (extratoFilterType === 'EMPRESAS') {
        const empTerms = ['santos distribuidora', 'posto', 'pantanal', 'delta', 'mineradora', 'bebidas', 'ltda', 'me', 'eireli'];
        list = list.filter((t) => empTerms.some((et) => t.contraparte?.toLowerCase().includes(et)));
      } else if (extratoFilterType === 'ESPECIE') {
        list = list.filter((t) => t.metodo === 'Espécie' || t.categoria === 'Espécie');
      }
    }

    if (extratoSearch.trim()) {
      const q = extratoSearch.toLowerCase();
      list = list.filter(
        (t) =>
          t.contraparte?.toLowerCase().includes(q) ||
          t.origem?.toLowerCase().includes(q) ||
          t.contraparteCpfCnpj?.toLowerCase().includes(q) ||
          t.motivoSuspeita?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [canonicalGraph.todasTransacoes, extratoFilterType, extratoSearch, extratoPersonFilter]);

  const handleInsertSnippet = (snippetText: string, snippetId: string) => {
    const formatted = snippetText
      .replace('{VALOR}', formatCurrency(activeCase.volumeAtipicoPeriodo || activeCase.valorEnvolvido))
      .replace('{RENDA}', formatCurrency(activeCase.capacidadeFinanceira?.rendaDeclarada || activeCase.renda));

    setAnotacoes((prev) => {
      const sep = prev.trim() ? '\n\n' : '';
      return prev + sep + formatted;
    });
    setLastInsertedSnippet(snippetId);
    setTimeout(() => setLastInsertedSnippet(null), 2000);
    showToast('Snippet inserido no parecer PLD com sucesso!', 'info');
  };

  const handleSave = () => {
    saveDraft(activeCase.id);
  };

  const handleFinalize = () => {
    if (!anotacoes.trim()) {
      showToast('Por favor, preencha a fundamentação do parecer antes de finalizar.', 'error');
      return;
    }

    finalizeDeliberation(activeCase.id, deliberacao, anotacoes, {
      tipologiaCoaf,
      motivoArquivamento: anotacoes,
    });

    if (deliberacao === 'ARQUIVAR') {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 }, colors: ['#16A34A', '#FFCC01'] });
    } else if (deliberacao === 'COMUNICAR_COAF' || deliberacao === 'BLOQUEIO_CAUTELAR') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#DC2626', '#FFCC01'] });
    }
  };

  // Caso preparado em tempo real para exportação oficial em PDF (com deliberação e parecer atualizados)
  const liveCaseForExport: CasoInvestigacao = useMemo(() => ({
    ...activeCase,
    parecer: {
      ...activeCase.parecer,
      deliberacao: deliberacao || activeCase.parecer?.deliberacao || null,
      texto: anotacoes || activeCase.parecer?.texto || '',
      tipologiaCoaf: tipologiaCoaf || activeCase.parecer?.tipologiaCoaf,
      dataHora: activeCase.parecer?.dataHora || (deliberacao ? new Date().toISOString() : undefined),
      analista: activeCase.analistaNome || 'Maísa Ramos',
    },
    resumoPldChecklist: checklist,
  }), [activeCase, deliberacao, anotacoes, tipologiaCoaf, checklist]);

  const cap = activeCase.capacidadeFinanceira || {
    rendaDeclarada: activeCase.kyc.rendaDeclarada || 4200.0,
    patrimonioDeclarado: activeCase.kyc.patrimonioDeclarado || 60000.0,
    volumeTransacionadoMes: activeCase.volumeAtipicoPeriodo || 98450.0,
    fatorIncompatibilidade: 23.4,
    tipoComprovacao: 'Não Comprovada',
    dataUltimaAtualizacao: '04/01/2024',
    fonteRenda: 'Comércio / Atividade Autônoma',
    cnpjFontePagadora: '38.102.944/0001-19',
    origemRecursosDeclarada: 'Vendas Comerciais',
    capacidadeMensalEstimada: 5000.0,
    desvioPadraoMovimentacao: '+1.860% acima da média histórica',
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#222222] font-sans pb-20">
      {/* Top Banner Navigation */}
      <div className="bg-[#E5E7EB] border-b border-[#D1D5DB] px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
        {/* Yellow Back Button */}
        <button
          onClick={() => navigateTo('/')}
          className="px-5 py-1.5 bg-[#FFCC01] hover:bg-[#E5B700] text-[#111827] text-xs font-black rounded-md flex items-center gap-1.5 shadow-xs border border-[#E5B700] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar</span>
        </button>

        {/* Centered Title */}
        <div className="text-center flex-1">
          <h1 className="text-sm sm:text-base font-black text-[#111827] tracking-tight">
            Parecer Técnico PLD/FT - Análise de Atipicidade Financeira
          </h1>
        </div>

        {/* Quick Tools & PDF Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAuditModal(true)}
            className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F3F4F6] text-[#374151] text-xs font-bold rounded-md border border-[#D1D5DB] shadow-xs flex items-center gap-1"
          >
            <History className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Trilha de Auditoria</span>
          </button>

          {/* Destaque: Botão Principal de Exportação para PDF */}
          <button
            onClick={() => setShowDossierModal(true)}
            className="px-4 py-1.5 bg-[#FFCC01] hover:bg-[#E5B700] text-[#111827] text-xs font-black rounded-md border border-[#E5B700] shadow-xs flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
            title="Exportar Ficha Oficial COAF em PDF conforme Lei 9.613/98"
          >
            <FileDown className="w-4 h-4 stroke-[2.5]" />
            <span>Exportar como PDF</span>
          </button>
        </div>
      </div>

      {/* Info Subheader Bar */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E7EB] px-6 py-3 shadow-2xs">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Status */}
          <div>
            <span className="text-zinc-500 font-bold block text-[11px]">Status PLD</span>
            <span
              className={`inline-block px-3 py-0.5 mt-0.5 rounded-full text-[11px] font-bold text-white shadow-xs ${
                activeCase.status === 'Arquivado'
                  ? 'bg-[#16A34A]'
                  : activeCase.status === 'Comunicado COAF'
                  ? 'bg-[#DC2626]'
                  : activeCase.status === 'Diligência'
                  ? 'bg-[#EA580C]'
                  : 'bg-[#2563EB]'
              }`}
            >
              {activeCase.status}
            </span>
          </div>

          {/* Risco e Score */}
          <div>
            <span className="text-zinc-500 font-bold block text-[11px]">Classificação de Risco</span>
            <span className="font-bold text-[#111827]">
              {activeCase.risco} (Score: {activeCase.scoreRisco}/100)
            </span>
          </div>

          {/* Analista Responsável */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#CBD5E1] text-[#1E293B] font-bold flex items-center justify-center text-xs shadow-xs">
              {activeCase.analistaIniciais || 'M'}
            </div>
            <div>
              <span className="text-zinc-500 font-bold block text-[11px]">Analista Responsável</span>
              <span className="font-bold text-[#111827]">{activeCase.analistaNome || 'Maísa Ramos (Analista PLD)'}</span>
            </div>
          </div>

          {/* Assumida em */}
          <div>
            <span className="text-zinc-500 font-bold block text-[11px]">Assumida em</span>
            <span className="font-bold text-[#111827]">{activeCase.assumidaEm || '20/08/2026 09:15'}</span>
          </div>

          {/* Investigado / CPF */}
          <div className="text-right">
            <span className="text-zinc-500 font-bold block text-[11px]">Investigado / Titular</span>
            <span className="font-black text-[#111827] uppercase">{activeCase.nome}</span>
            <span className="text-zinc-600 font-medium ml-2">({activeCase.cpf})</span>
          </div>
        </div>
      </div>

      {/* Main Two Column Layout */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================================= */}
          {/* LEFT ACCORDIONS COLUMN (Takes ~70% width: lg:col-span-8)                 */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 space-y-4">
            {/* Accordion 1: Informações Cadastrais & Perfil de Risco (KYC) */}
            <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-sm overflow-hidden shadow-xs">
              <button
                onClick={() => toggleSection('kyc')}
                className="w-full bg-[#E5E7EB] hover:bg-[#DCDFE4] p-3 text-left flex items-center justify-between text-xs font-bold text-[#111827] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Informações Cadastrais & Perfil de Risco (KYC)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-[#374151]" />
                </div>
                <div className="w-5 h-5 rounded bg-[#FFCC01] flex items-center justify-center text-[#111827]">
                  {openSections.kyc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {openSections.kyc && (
                <div className="p-4 space-y-4 text-xs border-t border-[#E5E7EB] bg-[#FFFFFF]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-zinc-500 font-bold block text-[11px]">Nome Completo</span>
                      <span className="font-bold text-[#111827]">{activeCase.kyc.nomeCompleto}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-bold block text-[11px]">CPF Completo</span>
                      <span className="font-bold font-mono text-[#111827]">{activeCase.kyc.cpfCompleto}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-bold block text-[11px]">Data de Nascimento / Idade</span>
                      <span className="font-bold text-[#111827]">{activeCase.kyc.dataNascimento} ({activeCase.kyc.idade} anos)</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-bold block text-[11px]">Profissão / Ocupação</span>
                      <span className="font-bold text-[#111827]">{activeCase.kyc.profissao}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-bold block text-[11px]">Enquadramento PEP</span>
                      <span className={`font-bold ${activeCase.isPep ? 'text-purple-700' : 'text-zinc-700'}`}>
                        {activeCase.isPep ? `SIM (${activeCase.pepCargo || 'Pessoa Exposta Politicamente'})` : 'NÃO PEP'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-bold block text-[11px]">Classificação Risco BACEN</span>
                      <span className="font-bold text-red-700">{activeCase.kyc.riscoBacen}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-zinc-500 font-bold block text-[11px]">Endereço Cadastral</span>
                      <span className="font-medium text-[#111827]">{activeCase.kyc.endereco}, {activeCase.kyc.cidadeUf}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-bold block text-[11px]">Tempo de Relacionamento</span>
                      <span className="font-bold text-[#111827]">{activeCase.kyc.dataAssociacao}</span>
                    </div>
                  </div>

                  {/* Vínculos Societários (QSA) */}
                  {activeCase.kyc.qsaVinculos && activeCase.kyc.qsaVinculos.length > 0 && (
                    <div className="pt-3 border-t border-[#E5E7EB]">
                      <span className="text-zinc-700 font-bold block text-[11px] mb-2 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Vínculos Societários & Participações em Empresas (QSA):</span>
                      </span>
                      <div className="space-y-2">
                        {activeCase.kyc.qsaVinculos.map((soc, idx) => (
                          <div key={idx} className="p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded flex items-center justify-between">
                            <div>
                              <div className="font-bold text-[#111827]">{soc.razaoSocial} ({soc.cnpj})</div>
                              <div className="text-zinc-600 text-[11px]">{soc.cargo} • Participação: {soc.participacao}</div>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-800 border border-red-200">
                              {soc.situacaoCadastral}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mídias Desabonadoras */}
                  {activeCase.kyc.midiasDesabonadoras && activeCase.kyc.midiasDesabonadoras.length > 0 && (
                    <div className="pt-3 border-t border-[#E5E7EB]">
                      <span className="text-red-700 font-bold block text-[11px] mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        <span>Apontamentos em Mídias Desabonadoras & Processos:</span>
                      </span>
                      <ul className="space-y-1">
                        {activeCase.kyc.midiasDesabonadoras.map((midia, idx) => (
                          <li key={idx} className="p-2 bg-red-50 text-red-900 border border-red-200 rounded text-[11px]">
                            {midia}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 2: Alerta & Enquadramento Regulatório (BACEN / COAF) */}
            <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-sm overflow-hidden shadow-xs">
              <button
                onClick={() => toggleSection('alerta')}
                className="w-full bg-[#E5E7EB] hover:bg-[#DCDFE4] p-3 text-left flex items-center justify-between text-xs font-bold text-[#111827] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Alerta & Enquadramento Regulatório (BACEN / COAF)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-[#374151]" />
                </div>
                <div className="w-5 h-5 rounded bg-[#FFCC01] flex items-center justify-center text-[#111827]">
                  {openSections.alerta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {openSections.alerta && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border-t border-[#E5E7EB] bg-[#FFFFFF]">
                  <div>
                    <span className="text-zinc-500 font-bold block text-[11px]">Tipologia PLD/FT</span>
                    <span className="font-bold text-[#111827]">{activeCase.tipologiaPld}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold block text-[11px]">Regra Circular BACEN 3.978</span>
                    <span className="font-bold text-[#111827]">{activeCase.regraDisparada}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold block text-[11px]">Enquadramento Carta-Circular 4.001</span>
                    <span className="font-bold text-[#111827]">{activeCase.artigoRegulatorio || 'Item 1.1'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-zinc-500 font-bold block text-[11px]">Gatilho de Detecção Automática</span>
                    <span className="font-bold text-red-800">{activeCase.gatilhoAlerta}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold block text-[11px]">Prazo Regulatório (SLA)</span>
                    <span className="font-bold text-[#111827]">{activeCase.slaLimite} ({activeCase.slaHorasRestantes}h restantes)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Contas, Chaves PIX & Dispositivos Vinculados */}
            <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-sm overflow-hidden shadow-xs">
              <button
                onClick={() => toggleSection('bancarios')}
                className="w-full bg-[#E5E7EB] hover:bg-[#DCDFE4] p-3 text-left flex items-center justify-between text-xs font-bold text-[#111827] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Contas, Chaves PIX & Dispositivos Vinculados</span>
                  <HelpCircle className="w-3.5 h-3.5 text-[#374151]" />
                </div>
                <div className="w-5 h-5 rounded bg-[#FFCC01] flex items-center justify-center text-[#111827]">
                  {openSections.bancarios ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {openSections.bancarios && (
                <div className="p-4 space-y-3 text-xs border-t border-[#E5E7EB] bg-[#FFFFFF]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCase.kyc.contasVinculadas.map((conta, i) => (
                      <div key={i} className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded">
                        <div className="font-bold text-[#111827]">{conta.banco}</div>
                        <div className="text-zinc-600 font-mono mt-0.5">Agência: {conta.agencia} • Conta: {conta.conta}</div>
                        <div className="text-zinc-500 text-[11px] mt-0.5">{conta.tipo}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <span className="text-zinc-500 font-bold block text-[11px] mb-1">Chaves PIX no DICT:</span>
                    <div className="flex flex-wrap gap-2">
                      {activeCase.kyc.chavesPix.map((pix, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded bg-[#F3F4F6] text-zinc-700 font-mono text-[11px] border border-[#E5E7EB]">
                          {pix}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 4: Capacidade Financeira & Origem dos Recursos (Expanded by default with top yellow line) */}
            <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-sm overflow-hidden shadow-xs border-t-2 border-t-[#FFCC01]">
              <button
                onClick={() => toggleSection('capacidade')}
                className="w-full bg-[#E5E7EB] hover:bg-[#DCDFE4] p-3 text-left flex items-center justify-between text-xs font-bold text-[#111827] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Capacidade Financeira & Origem dos Recursos</span>
                  <HelpCircle className="w-3.5 h-3.5 text-[#374151]" />
                </div>
                <div className="w-5 h-5 rounded bg-[#FFCC01] flex items-center justify-center text-[#111827]">
                  {openSections.capacidade ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {openSections.capacidade && (
                <div className="p-5 text-xs bg-[#FFFFFF] space-y-5">
                  {/* Row 1: Renda Declarada, Patrimônio Declarado, Volume no Mês, Fator de Incompatibilidade */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-zinc-700 font-bold text-[11px]">
                        <span>Renda Mensal Declarada</span>
                        <HelpCircle className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="font-bold text-[#111827] text-sm mt-1 font-mono">{formatCurrency(cap.rendaDeclarada)}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-zinc-700 font-bold text-[11px]">
                        <span>Patrimônio Declarado</span>
                        <HelpCircle className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="font-bold text-[#111827] text-sm mt-1 font-mono">{formatCurrency(cap.patrimonioDeclarado)}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-zinc-700 font-bold text-[11px]">
                        <span>Volume no Período (R$)</span>
                        <HelpCircle className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="font-bold text-red-700 text-sm mt-1 font-mono">{formatCurrency(cap.volumeTransacionadoMes)}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-zinc-700 font-bold text-[11px]">
                        <span>Incompatibilidade</span>
                        <HelpCircle className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="font-bold text-red-700 text-sm mt-1">
                        {cap.fatorIncompatibilidade.toFixed(1)}x superior
                      </div>
                    </div>
                  </div>

                  <hr className="border-[#E5E7EB]" />

                  {/* Row 2: Tipo de Comprovação, Data da Atualização, Fonte da Renda */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-zinc-700 font-bold text-[11px]">
                        <span>Tipo de Comprovação</span>
                        <HelpCircle className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="font-bold text-[#111827] mt-1">{cap.tipoComprovacao}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-zinc-700 font-bold text-[11px]">
                        <span>Última Atualização</span>
                        <HelpCircle className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="font-bold text-[#111827] mt-1">{cap.dataUltimaAtualizacao}</div>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center gap-1 text-zinc-700 font-bold text-[11px]">
                        <span>Fonte de Renda / Ocupação</span>
                        <HelpCircle className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="font-bold text-[#111827] mt-1">{cap.fonteRenda}</div>
                    </div>
                  </div>

                  <hr className="border-[#E5E7EB]" />

                  {/* Row 3: CNPJ Pagador, Origem Declarada, Desvio Padrão */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-zinc-700 font-bold text-[11px]">
                        <span>CNPJ Fonte Pagadora</span>
                        <HelpCircle className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="font-bold text-[#111827] mt-1 font-mono">{cap.cnpjFontePagadora || 'NÃO INFORMADO'}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-zinc-700 font-bold text-[11px]">
                        <span>Origem Declarada</span>
                        <HelpCircle className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="font-bold text-[#111827] mt-1">{cap.origemRecursosDeclarada}</div>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center gap-1 text-zinc-700 font-bold text-[11px]">
                        <span>Desvio em Relação ao Histórico</span>
                        <HelpCircle className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="font-bold text-red-700 mt-1">{cap.desvioPadraoMovimentacao}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 5: Grafo de Vínculos & Rastreamento Financeiro */}
            <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-sm overflow-hidden shadow-xs">
              <button
                onClick={() => toggleSection('grafo')}
                className="w-full bg-[#E5E7EB] hover:bg-[#DCDFE4] p-3 text-left flex items-center justify-between text-xs font-bold text-[#111827] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Grafo de Vínculos & Rastreamento Financeiro (Topologia Redonda)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-[#374151]" />
                  <span className="ml-2 px-2 py-0.5 bg-[#FEF08A] text-[#854D0E] rounded text-[10px] font-bold">
                    {canonicalGraph.nodes.length} Entidades • {canonicalGraph.estatisticas.familiaresCount} Familiares • {canonicalGraph.estatisticas.naoFamiliaresCount} Não-Familiares • {canonicalGraph.estatisticas.empresasCount} PJs
                  </span>
                </div>
                <div className="w-5 h-5 rounded bg-[#FFCC01] flex items-center justify-center text-[#111827]">
                  {openSections.grafo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {openSections.grafo && (
                <div className="p-4 bg-[#FFFFFF] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
                    <span className="text-zinc-700 font-medium">
                      Topologia radial com nós circulares: Alvo Central, HUB de Conta Corrente (CC), familiares, não-familiares, empresas e 2º alvo crítico:
                    </span>
                    <button
                      onClick={() => setIsGraphExpanded(!isGraphExpanded)}
                      className="px-2.5 py-1 rounded bg-[#F3F4F6] hover:bg-[#E5E7EB] text-zinc-700 font-bold flex items-center gap-1 border border-[#D1D5DB]"
                    >
                      {isGraphExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                      <span>{isGraphExpanded ? 'Reduzir Altura' : 'Expandir Altura'}</span>
                    </button>
                  </div>

                  <div className={`w-full rounded-xl border border-[#CBD5E1] overflow-hidden shadow-inner ${isGraphExpanded ? 'h-[640px]' : 'h-[520px]'}`}>
                    <GraphView
                      nodes={canonicalGraph.nodes}
                      edges={canonicalGraph.edges}
                      onSelectPersonFilter={handleSelectPersonFromGraph}
                      onAddNoteToReport={handleAddGraphNoteToReport}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 6: Extrato Analítico de Transações Suspeitas & Carga PLD */}
            <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-sm overflow-hidden shadow-xs">
              <button
                onClick={() => toggleSection('extrato')}
                className="w-full bg-[#E5E7EB] hover:bg-[#DCDFE4] p-3 text-left flex items-center justify-between text-xs font-bold text-[#111827] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Extrato Analítico de Transações ({filteredTransactions.length} exibidas de {canonicalGraph.totalTransacoesAvaliadas.toLocaleString('pt-BR')} avaliadas)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-[#374151]" />
                  {extratoPersonFilter && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-900 rounded-full text-[10px] font-bold border border-blue-300">
                      Filtrado: {extratoPersonFilter}
                    </span>
                  )}
                </div>
                <div className="w-5 h-5 rounded bg-[#FFCC01] flex items-center justify-center text-[#111827]">
                  {openSections.extrato ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {openSections.extrato && (
                <div className="p-4 bg-[#FFFFFF] space-y-3">
                  {/* Filter Toolbar for Analytical Statement */}
                  <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => {
                          setExtratoFilterType('SUSPEITAS');
                          setExtratoPersonFilter(null);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                          extratoFilterType === 'SUSPEITAS' && !extratoPersonFilter
                            ? 'bg-red-700 text-white shadow-xs'
                            : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-300'
                        }`}
                      >
                        ⚠️ Suspeitas & Atípicas
                      </button>

                      <button
                        onClick={() => {
                          setExtratoFilterType('FAMILIARES');
                          setExtratoPersonFilter(null);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                          extratoFilterType === 'FAMILIARES' && !extratoPersonFilter
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-300'
                        }`}
                      >
                        Familiares (Cônjuge/Filhos)
                      </button>

                      <button
                        onClick={() => {
                          setExtratoFilterType('TERCEIROS');
                          setExtratoPersonFilter(null);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                          extratoFilterType === 'TERCEIROS' && !extratoPersonFilter
                            ? 'bg-zinc-800 text-white shadow-xs'
                            : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-300'
                        }`}
                      >
                        Não-Familiares / ATMs
                      </button>

                      <button
                        onClick={() => {
                          setExtratoFilterType('EMPRESAS');
                          setExtratoPersonFilter(null);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                          extratoFilterType === 'EMPRESAS' && !extratoPersonFilter
                            ? 'bg-amber-700 text-white shadow-xs'
                            : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-300'
                        }`}
                      >
                        Empresas & PJs
                      </button>

                      <button
                        onClick={() => {
                          setExtratoFilterType('ESPECIE');
                          setExtratoPersonFilter(null);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                          extratoFilterType === 'ESPECIE' && !extratoPersonFilter
                            ? 'bg-blue-800 text-white shadow-xs'
                            : 'bg-white text-blue-800 hover:bg-blue-50 border border-blue-300'
                        }`}
                      >
                        Espécie (Dinheiro)
                      </button>

                      <button
                        onClick={() => {
                          setExtratoFilterType('TODAS');
                          setExtratoPersonFilter(null);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                          extratoFilterType === 'TODAS' && !extratoPersonFilter
                            ? 'bg-zinc-900 text-white shadow-xs'
                            : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-300'
                        }`}
                      >
                        Universo Completo ({canonicalGraph.totalTransacoesAvaliadas.toLocaleString('pt-BR')})
                      </button>
                    </div>

                    {/* Search & Reset */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={extratoSearch}
                          onChange={(e) => setExtratoSearch(e.target.value)}
                          placeholder="Buscar no extrato..."
                          className="pl-8 pr-3 py-1 bg-white border border-zinc-300 rounded text-xs text-zinc-800 w-44"
                        />
                      </div>

                      {extratoPersonFilter && (
                        <button
                          onClick={() => setExtratoPersonFilter(null)}
                          className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded font-bold text-xs border border-red-300"
                        >
                          Limpar Filtro
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Transactions Table */}
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-xs bg-zinc-50 rounded border border-dashed border-zinc-300">
                      Nenhuma transação localizada com os filtros selecionados.
                    </div>
                  ) : (
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-lg">
                      {filteredTransactions.slice(0, 150).map((tx) => (
                        <div key={tx.id} className="p-3 hover:bg-[#F9FAFB] transition-colors flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#111827]">{tx.contraparte}</span>
                              {tx.contraparteCpfCnpj && (
                                <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded">
                                  {tx.contraparteCpfCnpj}
                                </span>
                              )}
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  tx.metodo === 'Espécie'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : tx.metodo === 'PIX'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                                }`}
                              >
                                {tx.metodo || 'PIX'}
                              </span>
                            </div>
                            <div className="text-zinc-500 text-[11px]">
                              {tx.data} {tx.hora || ''} • {tx.origem} • Saldo Posterior: {formatCurrency(tx.saldoApos)}
                            </div>
                            {tx.isSuspeita && (
                              <div className="text-red-700 font-bold text-[11px] flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="w-3 h-3 text-red-600 inline" />
                                <span>{tx.motivoSuspeita}</span>
                              </div>
                            )}
                          </div>
                          <div className={`font-mono font-bold text-sm ${tx.tipo === 'Crédito' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                            {tx.tipo === 'Crédito' ? '+' : ''}{formatCurrency(tx.valor)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredTransactions.length > 150 && (
                    <div className="text-center text-[11px] text-zinc-500 py-1">
                      Exibindo as primeiras 150 transações mais atípicas do lote de {filteredTransactions.length.toLocaleString('pt-BR')} avaliadas.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT SIDEBAR COLUMN: Resumo da Análise PLD/FT                            */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-sm p-4 shadow-xs space-y-4">
              {/* Header Title */}
              <h2 className="text-center font-bold text-[#111827] text-xs uppercase tracking-wide border-b border-[#E5E7EB] pb-2">
                Resumo da Análise PLD/FT
              </h2>

              {/* PLD Regulatory Checklist */}
              <div className="space-y-2.5 text-xs">
                {/* 1. Identificação e Qualificação (KYC) */}
                <div className="flex items-center justify-between cursor-pointer py-1" onClick={() => toggleCheck('qualificacaoKyc')}>
                  <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                    <span>Identificação e Qualificação (KYC)</span>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  {checklist.qualificacaoKyc ? (
                    <CheckSquare className="w-5 h-5 text-[#16A34A]" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-400" />
                  )}
                </div>

                {/* 2. Compatibilidade Renda / Faturamento */}
                <div className="flex items-center justify-between cursor-pointer py-1" onClick={() => toggleCheck('capacidadeFinanceira')}>
                  <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                    <span>Compatibilidade Renda / Faturamento</span>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  {checklist.capacidadeFinanceira ? (
                    <CheckSquare className="w-5 h-5 text-[#16A34A]" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-400" />
                  )}
                </div>

                {/* 3. Consulta a Listas Restritivas (OFAC/CEIS) */}
                <div className="flex items-center justify-between cursor-pointer py-1" onClick={() => toggleCheck('listasRestritivas')}>
                  <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                    <span>Consulta a Listas Restritivas (OFAC/CEIS)</span>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  {checklist.listasRestritivas ? (
                    <CheckSquare className="w-5 h-5 text-[#16A34A]" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-400" />
                  )}
                </div>

                {/* 4. Checagem PEP e Pessoas Vinculadas */}
                <div className="flex items-center justify-between cursor-pointer py-1" onClick={() => toggleCheck('enquadramentoPep')}>
                  <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                    <span>Checagem PEP e Vinculados</span>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  {checklist.enquadramentoPep ? (
                    <CheckSquare className="w-5 h-5 text-[#16A34A]" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-400" />
                  )}
                </div>

                {/* 5. Vínculos Societários & QSA */}
                <div className="flex items-center justify-between cursor-pointer py-1" onClick={() => toggleCheck('vinculosSocietarios')}>
                  <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                    <span>Vínculos Societários & QSA</span>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  {checklist.vinculosSocietarios ? (
                    <CheckSquare className="w-5 h-5 text-[#16A34A]" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-400" />
                  )}
                </div>

                {/* 6. Rastreabilidade de Origem e Destino */}
                <div className="flex items-center justify-between cursor-pointer py-1" onClick={() => toggleCheck('origemDestinoRecursos')}>
                  <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                    <span>Rastreabilidade de Origem e Destino</span>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  {checklist.origemDestinoRecursos ? (
                    <CheckSquare className="w-5 h-5 text-[#16A34A]" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-400" />
                  )}
                </div>

                {/* 7. Mídias Desabonadoras & Processos */}
                <div className="flex items-center justify-between cursor-pointer py-1" onClick={() => toggleCheck('midiasDesabonadoras')}>
                  <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                    <span>Mídias Desabonadoras & Processos</span>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  {checklist.midiasDesabonadoras ? (
                    <CheckSquare className="w-5 h-5 text-[#16A34A]" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-400" />
                  )}
                </div>

                {/* 8. Análise de Fracionamento / Smurfing */}
                <div className="flex items-center justify-between cursor-pointer py-1" onClick={() => toggleCheck('analiseFracionamento')}>
                  <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                    <span>Análise de Fracionamento / Smurfing</span>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  {checklist.analiseFracionamento ? (
                    <CheckSquare className="w-5 h-5 text-[#16A34A]" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-400" />
                  )}
                </div>

                {/* 9. Verificação de Contas de Passagem */}
                <div className="flex items-center justify-between cursor-pointer py-1" onClick={() => toggleCheck('contasPassagem')}>
                  <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                    <span>Verificação de Conta de Passagem</span>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  {checklist.contasPassagem ? (
                    <CheckSquare className="w-5 h-5 text-[#16A34A]" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
              </div>

              {/* Smart Snippets Quick Insertion Box */}
              <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#111827]">
                    <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Snippets de Parecer PLD:</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">Clique para inserir</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {mockSnippets.map((snip) => (
                    <button
                      key={snip.id}
                      onClick={() => handleInsertSnippet(snip.texto, snip.id)}
                      className={`p-1.5 rounded text-left border text-[10px] font-semibold transition-all ${
                        lastInsertedSnippet === snip.id
                          ? 'bg-[#DCFCE7] border-[#22C55E] text-[#15803D]'
                          : 'bg-[#F9FAFB] hover:bg-[#FEF9C3] border-[#E5E7EB] text-[#374151] hover:text-[#111827]'
                      }`}
                      title={snip.texto}
                    >
                      <div className="font-bold truncate">{snip.titulo}</div>
                      <div className="text-[9px] text-zinc-500 truncate">{snip.categoria}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Anotações / Parecer Técnico */}
              <div className="space-y-1 pt-1">
                <label className="block text-xs font-bold text-[#111827]">Anotações / Fundamentação do Parecer PLD</label>
                <textarea
                  value={anotacoes}
                  onChange={(e) => setAnotacoes(e.target.value)}
                  placeholder="Ex.: Operação atípica em desacordo com o faturamento declarado..."
                  rows={4}
                  className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded p-2.5 text-xs text-[#111827] placeholder-zinc-400 focus:outline-none focus:border-[#FFCC01] focus:ring-1 focus:ring-[#FFCC01] resize-none"
                />
              </div>

              {/* Motivo / Deliberação Regulatória */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#111827]">Deliberação Regulatória:</label>
                <select
                  value={deliberacao}
                  onChange={(e) => setDeliberacao(e.target.value as any)}
                  className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded p-2 text-xs text-[#111827] font-semibold focus:outline-none focus:border-[#FFCC01]"
                >
                  <option value="ARQUIVAR">Arquivar (Falso Positivo / Atipicidade Justificada)</option>
                  <option value="DILIGENCIA">Solicitar Diligência (Exigência Documental)</option>
                  <option value="COMUNICAR_COAF">Comunicar ao COAF (Comunicação SISCOAF)</option>
                  <option value="BLOQUEIO_CAUTELAR">Bloqueio Cautelar / Encerramento</option>
                </select>
              </div>

              {/* COAF Specific Category */}
              {(deliberacao === 'COMUNICAR_COAF' || deliberacao === 'BLOQUEIO_CAUTELAR') && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 space-y-1">
                  <label className="text-[11px] font-bold text-red-800 block">Enquadramento / Tipologia COAF:</label>
                  <select
                    value={tipologiaCoaf}
                    onChange={(e) => setTipologiaCoaf(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-red-300 text-[11px] rounded p-1.5 text-[#111827]"
                  >
                    {coafTipologias.map((tip, idx) => (
                      <option key={idx} value={tip}>
                        {tip}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Final Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleFinalize}
                  className="w-full py-2.5 bg-[#FFCC01] hover:bg-[#E5B700] text-[#111827] text-xs font-black rounded shadow-xs border border-[#E5B700] transition-colors flex items-center justify-center gap-1.5 active:scale-[0.99]"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Finalizar Parecer PLD</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSave}
                    className="py-2 bg-[#FFFFFF] hover:bg-[#F3F4F6] text-[#374151] text-xs font-bold rounded border border-[#D1D5DB] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Salvar Rascunho</span>
                  </button>

                  <button
                    onClick={() => setShowDossierModal(true)}
                    className="py-2 bg-[#111827] hover:bg-black text-[#FFCC01] text-xs font-black rounded border border-[#111827] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    title="Exportar Ficha Oficial COAF com a Avaliação Atual"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Exportar PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dossier PDF Modal */}
      {showDossierModal && (
        <DossierExportModal caso={liveCaseForExport} onClose={() => setShowDossierModal(false)} />
      )}

      {/* Audit Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-md max-w-lg w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
              <h3 className="font-bold text-sm text-[#111827] flex items-center gap-2">
                <History className="w-4 h-4 text-[#F59E0B]" />
                <span>Trilha de Auditoria PLD - {activeCase.nome}</span>
              </h3>
              <button onClick={() => setShowAuditModal(false)} className="text-zinc-500 font-bold hover:text-black">✕</button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto text-xs">
              {activeCase.auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded space-y-1">
                  <div className="flex justify-between font-bold text-[#111827]">
                    <span>{log.acao}</span>
                    <span className="text-zinc-500 font-mono text-[10px]">{log.timestamp}</span>
                  </div>
                  <p className="text-zinc-600 text-[11px]">{log.detalhes}</p>
                  <div className="text-zinc-500 text-[10px]">Analista: {log.analista}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAuditModal(false)}
              className="w-full py-2 bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#111827] font-bold text-xs rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
