import React, { useState } from 'react';
import { CasoInvestigacao } from '../../types';
import { 
  getAlertsForCase, 
  PERSON_ANALYSIS_ALERTS 
} from '../../data/personAnalysisAlerts';
import { 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  FileText, 
  ExternalLink, 
  BookOpen, 
  Info,
  CheckCircle2,
  HelpCircle,
  ListChecks
} from 'lucide-react';
import { PersonAnalysisMatrixModal } from '../alerts/PersonAnalysisMatrixModal';

interface PersonAnalysisActionGuideProps {
  caso: CasoInvestigacao;
  onAppendParecer?: (texto: string) => void;
  // Regulatory general checklist integration
  checklist?: {
    qualificacaoKyc: boolean;
    capacidadeFinanceira: boolean;
    listasRestritivas: boolean;
    enquadramentoPep: boolean;
    vinculosSocietarios: boolean;
    origemDestinoRecursos: boolean;
    midiasDesabonadoras: boolean;
    analiseFracionamento: boolean;
    contasPassagem: boolean;
  };
  onToggleCheck?: (key: any) => void;
  isCaseClosed?: boolean;
}

const REGULATORY_ITEMS = [
  {
    key: 'qualificacaoKyc',
    title: 'Identificação & KYC',
    helpTitle: 'Identificação e Qualificação (KYC)',
    content: 'Checagem de documentação cadastral atualizada, renda formal, endereço comprovado e capacidade civil do associado.',
    reg: 'Art. 13 a 17 da Circular BACEN nº 3.978/2020',
  },
  {
    key: 'capacidadeFinanceira',
    title: 'Compatibilidade de Renda',
    helpTitle: 'Compatibilidade Financeira',
    content: 'Aferição de compatibilidade entre o volume financeiro movimentado e o patrimônio ou renda declarada do associado.',
    reg: 'Art. 38, Inciso I da Circular BACEN nº 3.978/2020',
  },
  {
    key: 'listasRestritivas',
    title: 'Listas Restritivas (OFAC/CEIS)',
    helpTitle: 'Listas Restritivas & Sanções',
    content: 'Cruzamento em bases de sanções internacionais e nacionais: OFAC, CSNU, CEIS, CNEP, CEPIM e mandados de prisão.',
    reg: 'Lei Federal nº 13.810/2019 e Carta Circular BACEN nº 3.978',
  },
  {
    key: 'enquadramentoPep',
    title: 'Checagem PEP e Vinculados',
    helpTitle: 'Pessoas Expostas Politicamente (PEP)',
    content: 'Identificação de enquadramento PEP próprio, familiares de 1º e 2º graus e estreitos colaboradores de agentes públicos.',
    reg: 'Art. 25 a 29 da Circular BACEN nº 3.978/2020 e Resolução COAF nº 40/2021',
  },
  {
    key: 'vinculosSocietarios',
    title: 'Vínculos Societários & QSA',
    helpTitle: 'Vínculos Societários & Beneficiário Final',
    content: 'Mapeamento da cadeia societária até a identificação da pessoa natural que detém controle direto ou indireto (UBO).',
    reg: 'Art. 16 da Circular BACEN nº 3.978/2020',
  },
  {
    key: 'origemDestinoRecursos',
    title: 'Rastreabilidade Origem/Destino',
    helpTitle: 'Rastreabilidade de Recursos',
    content: 'Identificação de ordenadores e beneficiários finais das transferências, PIX, TEDs e depósitos recebidos/enviados.',
    reg: 'Art. 38, Inciso II da Circular BACEN nº 3.978/2020',
  },
  {
    key: 'midiasDesabonadoras',
    title: 'Mídias Desabonadoras',
    helpTitle: 'Mídias Desabonadoras & Processos',
    content: 'Pesquisa reputacional ampla em veículos jornalísticos e certidões judiciais cíveis e criminais.',
    reg: 'Art. 18 da Circular BACEN nº 3.978/2020',
  },
  {
    key: 'analiseFracionamento',
    title: 'Fracionamento / Smurfing',
    helpTitle: 'Fracionamento / Smurfing',
    content: 'Detecção de movimentações sucessivas de valores fracionados que busquem burlar comunicações de reporte obrigatório.',
    reg: 'Carta Circular BACEN nº 4.001/2020 item 1.1',
  },
  {
    key: 'contasPassagem',
    title: 'Conta de Passagem (In & Out)',
    helpTitle: 'Conta de Passagem',
    content: 'Verificação de padrão in & out onde recursos creditados são repassados no mesmo dia, mantendo saldo residual zerado.',
    reg: 'Carta Circular BACEN nº 4.001/2020 item 1.3',
  },
];

export const PersonAnalysisActionGuide: React.FC<PersonAnalysisActionGuideProps> = ({
  caso,
  onAppendParecer,
  checklist,
  onToggleCheck,
  isCaseClosed = false
}) => {
  const matchingAlerts = getAlertsForCase(caso);
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'DIRETRIZ_CASO' | 'REGULATORIO'>('DIRETRIZ_CASO');
  const [hoveredHelp, setHoveredHelp] = useState<string | null>(null);

  const currentAlert = matchingAlerts[activeAlertIndex] || matchingAlerts[0] || PERSON_ANALYSIS_ALERTS[0];

  const toggleStep = (stepText: string) => {
    if (isCaseClosed) return;
    setCheckedSteps(prev => ({
      ...prev,
      [stepText]: !prev[stepText]
    }));
  };

  const handleInsertInParecer = () => {
    if (!onAppendParecer) return;

    const completed = currentAlert.checklistPassos.filter(s => checkedSteps[s]);
    let textToInsert = `\n\n[DIRETRIZ DE ANÁLISE DE PESSOA - ${currentAlert.filtroAlerta.toUpperCase()}]\n`;
    textToInsert += `Status: ${currentAlert.statusLabel} | Categoria: ${currentAlert.categoria}\n`;
    textToInsert += `Ação Prática Executada: ${currentAlert.acaoPratica}\n`;
    
    if (completed.length > 0) {
      textToInsert += `Etapas Práticas Validadas pelo Analista:\n`;
      completed.forEach(s => {
        textToInsert += `  [OK] ${s}\n`;
      });
    }

    textToInsert += `Fundamentação:\n${currentAlert.snippetTexto}\n`;

    onAppendParecer(textToInsert);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Stats for badge
  const totalCaseSteps = currentAlert.checklistPassos.length;
  const completedCaseSteps = currentAlert.checklistPassos.filter(s => checkedSteps[s]).length;

  const totalRegSteps = REGULATORY_ITEMS.length;
  const completedRegSteps = checklist ? Object.values(checklist).filter(Boolean).length : 0;

  return (
    <div 
      className="bg-[#FFFFFF] border border-[#D1D5DB] rounded-sm p-3.5 shadow-xs space-y-3"
      id="person-analysis-action-guide"
    >
      {/* Header Title: Checklist do Analista */}
      <div className="border-b border-[#E5E7EB] pb-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#FFCC01] text-black font-black flex items-center justify-center text-xs shadow-2xs">
              <CheckSquare className="w-3.5 h-3.5 text-black" />
            </div>
            <div>
              <h2 className="font-bold text-[#111827] text-xs uppercase tracking-wide">
                Checklist do Analista & Diretrizes
              </h2>
              <div className="text-[10.5px] text-zinc-500">
                Roteiro de ação vinculante e verificação PLD/FT
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMatrixModalOpen(true)}
            className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold rounded border border-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
            title="Consultar Matriz com todas as 16 diretrizes"
          >
            <BookOpen className="w-3 h-3 text-zinc-700" />
            <span className="hidden sm:inline">16 Diretrizes</span>
            <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
          </button>
        </div>

        {/* Navigation Tabs between Diretrizes do Alerta and Checklist Geral BACEN */}
        <div className="grid grid-cols-2 gap-1.5 mt-2.5 bg-zinc-100 p-1 rounded">
          <button
            type="button"
            onClick={() => setActiveTab('DIRETRIZ_CASO')}
            className={`py-1 px-2 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'DIRETRIZ_CASO'
                ? 'bg-[#FFCC01] text-black shadow-2xs font-black'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>Alerta do Caso</span>
            <span className="text-[9.5px] font-mono px-1 rounded bg-black/10">
              {completedCaseSteps}/{totalCaseSteps}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REGULATORIO')}
            className={`py-1 px-2 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'REGULATORIO'
                ? 'bg-[#FFCC01] text-black shadow-2xs font-black'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>Requisitos BACEN</span>
            <span className="text-[9.5px] font-mono px-1 rounded bg-black/10">
              {completedRegSteps}/{totalRegSteps}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: DIRETRIZ ESPECÍFICA DO CASO */}
      {activeTab === 'DIRETRIZ_CASO' && (
        <div className="space-y-3">
          {/* Matched alert pills if case matches multiple alerts */}
          {matchingAlerts.length > 1 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              <span className="text-zinc-500 font-bold whitespace-nowrap text-[10px]">
                Diretrizes:
              </span>
              {matchingAlerts.map((al, idx) => (
                <button
                  key={al.id}
                  type="button"
                  onClick={() => setActiveAlertIndex(idx)}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                    activeAlertIndex === idx
                      ? 'bg-zinc-900 text-[#FFCC01] border-zinc-900 shadow-2xs'
                      : 'bg-white text-zinc-700 hover:bg-zinc-100 border-zinc-300'
                  }`}
                >
                  {al.filtroAlerta}
                </button>
              ))}
            </div>
          )}

          {/* Active Directive Card */}
          <div className="bg-zinc-50 border border-zinc-200 rounded p-2.5 space-y-2">
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <span className="font-black text-xs text-[#111827]">
                {currentAlert.filtroAlerta}
              </span>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-200 text-zinc-800 border border-zinc-300">
                  {currentAlert.categoria}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  currentAlert.status === 'ATUAL'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {currentAlert.statusLabel}
                </span>
              </div>
            </div>

            {/* Ação Prática Obrigatória */}
            <div className="p-2 bg-white border-l-3 border-[#FFCC01] rounded-r text-[11px] text-zinc-800 leading-relaxed shadow-2xs">
              <span className="font-bold text-[#111827] block text-[10px] uppercase mb-0.5">
                Ação Prática Obrigatória do Analista:
              </span>
              <p>{currentAlert.acaoPratica}</p>
            </div>

            {/* Practical Checklist Steps for this case */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide block">
                Passos de Verificação do Alerta:
              </span>
              <div className="space-y-1">
                {currentAlert.checklistPassos.map((step, idx) => {
                  const isChecked = !!checkedSteps[step];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleStep(step)}
                      disabled={isCaseClosed}
                      className={`w-full flex items-start gap-2 p-2 rounded text-left text-[11px] transition-colors border cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                          : 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-100'
                      } ${isCaseClosed ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-400" />
                        )}
                      </span>
                      <span className={`leading-snug ${isChecked ? 'line-through text-emerald-900/70' : ''}`}>
                        {step}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Insert in Parecer Button */}
            {onAppendParecer && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleInsertInParecer}
                  disabled={isCaseClosed}
                  className="w-full py-1.5 px-3 bg-[#FFCC01] hover:bg-[#E5B700] text-black text-[11px] font-black rounded border border-[#E5B700] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  title="Inserir conclusões do checklist no parecer abaixo"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Inserido com Sucesso no Parecer!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 text-black" />
                      <span>Inserir Fundamentação no Parecer</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REQUISITOS REGULATÓRIOS GERAIS (BACEN / COAF) */}
      {activeTab === 'REGULATORIO' && checklist && onToggleCheck && (
        <div className="space-y-1.5 text-xs">
          {REGULATORY_ITEMS.map((item) => {
            const isChecked = !!(checklist as any)[item.key];
            return (
              <div
                key={item.key}
                className="flex items-center justify-between py-1 px-2 rounded hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-bold text-[#111827] text-[11px]">
                  <span
                    onClick={() => !isCaseClosed && onToggleCheck(item.key)}
                    className="cursor-pointer hover:underline"
                  >
                    {item.title}
                  </span>
                  <div className="relative group">
                    <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-zinc-700 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block z-50 w-56 p-2 bg-zinc-900 text-white rounded text-[10px] font-normal shadow-lg leading-tight pointer-events-none">
                      <strong className="block font-bold text-[#FFCC01] mb-0.5">{item.helpTitle}</strong>
                      <p className="text-zinc-200">{item.content}</p>
                      <div className="mt-1 pt-1 border-t border-zinc-700 text-[9px] text-zinc-400 font-mono">
                        {item.reg}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => !isCaseClosed && onToggleCheck(item.key)}
                  disabled={isCaseClosed}
                  className="cursor-pointer shrink-0 ml-2"
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal with all 16 guidelines */}
      <PersonAnalysisMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
      />
    </div>
  );
};
