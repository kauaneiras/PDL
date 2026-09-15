import React, { useState } from 'react';
import { useAml } from '../../context/AmlContext';
import { X, RefreshCw, CheckCircle2, FileText, ArrowRight, ShieldCheck, FolderSync } from 'lucide-react';

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MigrationModal: React.FC<MigrationModalProps> = ({ isOpen, onClose }) => {
  const { executarMigracaoLegado } = useAml();

  const [isProcessing, setIsProcessing] = useState(false);
  const [migracaoConcluida, setMigracaoConcluida] = useState(false);
  const [stats, setStats] = useState<{ totalMigrados: number; parciais: number } | null>(null);

  if (!isOpen) return null;

  const handleExecutar = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = executarMigracaoLegado();
      setStats(res);
      setIsProcessing(false);
      setMigracaoConcluida(true);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-zinc-300 w-full max-w-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-zinc-900 text-[#FFCC01] flex items-center justify-center font-bold">
              <FolderSync className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
                Migração de Fichas Antigas para Acervo Permanente (RF-34, RF-35)
              </h2>
              <p className="text-xs text-zinc-500">
                Integração do histórico legado de arquivos e planilhas no modelo <code className="bg-zinc-200 text-zinc-800 px-1 py-0.5 rounded font-mono">SCH_PLDFT.TB_Ficha</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-md hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-zinc-800">
          <div className="bg-zinc-100 border border-zinc-300 rounded-lg p-3 text-zinc-950">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-zinc-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#FFCC01] stroke-[2.5]" />
              Diretrizes de Migração e Preservação de Evidências (RNF-06 / BACEN)
            </h4>
            <p className="text-[11px] text-zinc-700 leading-relaxed">
              Fichas históricas cujo detalhamento analítico esteja integralmente disponível são migradas com todos os dados estruturados (cadastrais, transacionais e parecer). Fichas com estruturas incompletas recebem a classificação de <strong>Migração Parcial (RF-35)</strong>, indexando o PDF original no banco com metadados de busca preservados.
            </p>
          </div>

          <div className="border border-zinc-200 rounded-lg p-4 space-y-3 bg-zinc-50">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-700 border-b border-zinc-200 pb-2">
              <span>Lote Legado Identificado</span>
              <span className="font-mono text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-300">
                GESIN_PLDFT_MSAC_2026_TESTE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 bg-white border border-zinc-200 rounded">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total de Fichas Mapeadas</span>
                <span className="text-base font-bold text-zinc-900">1.352 registros</span>
              </div>
              <div className="p-2.5 bg-white border border-zinc-200 rounded">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Período de Cobertura</span>
                <span className="text-base font-bold text-zinc-900">01/2024 até 07/2026</span>
              </div>
            </div>

            {migracaoConcluida && stats && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-950 space-y-2 animate-in fade-in duration-200">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Migração Executada com Sucesso!
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-emerald-200">
                  <span>Estruturação Completa:</span>
                  <strong className="text-emerald-900">{stats.totalMigrados - stats.parciais} fichas</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Migração Parcial com PDF indexado (RF-35):</span>
                  <strong className="text-amber-800">{stats.parciais} fichas</strong>
                </div>
                <div className="text-[10px] text-emerald-800 italic mt-1">
                  Todas as fichas agora estão pesquisáveis no módulo "Consulta & Auditoria Histórica".
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="bg-[#FFCC01] hover:bg-[#E5B700] text-black font-bold px-3 py-1.5 rounded border border-[#E5B700] transition-colors cursor-pointer text-xs"
          >
            {migracaoConcluida ? 'Concluir' : 'Cancelar'}
          </button>
          {!migracaoConcluida && (
            <button
              onClick={handleExecutar}
              disabled={isProcessing}
              className="bg-[#FFCC01] hover:bg-[#E5B700] text-black font-bold px-4 py-1.5 rounded border border-[#E5B700] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs shadow-xs"
            >
              {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" /> : <ArrowRight className="w-3.5 h-3.5 text-black" />}
              {isProcessing ? 'Processando Migração...' : 'Iniciar Migração para o Acervo'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
