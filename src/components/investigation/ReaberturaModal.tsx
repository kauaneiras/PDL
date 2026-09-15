import React, { useState } from 'react';
import { CasoInvestigacao } from '../../types';
import { useAml } from '../../context/AmlContext';
import { X, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ReaberturaModalProps {
  caso: CasoInvestigacao;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReaberturaModal: React.FC<ReaberturaModalProps> = ({
  caso,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { reabrirFicha, showToast } = useAml();

  const [justificativa, setJustificativa] = useState('');
  const [solicitadoPor, setSolicitadoPor] = useState('Comitê GECAN / Maísa Ramos');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (justificativa.trim().length < 20) {
      showToast('A justificativa de reabertura deve conter no mínimo 20 caracteres.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      reabrirFicha(caso.id, justificativa.trim(), solicitadoPor);
      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-zinc-300 w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-amber-500 text-black flex items-center justify-center font-bold">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
                Reabertura de Ficha Concluída (RF-22, RF-23, RN-04)
              </h2>
              <p className="text-xs text-zinc-500">
                Auditoria de desencerramento em <code className="font-mono bg-zinc-200 px-1 py-0.5 rounded text-zinc-800">TB_Ficha_StatusHistorico</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-zinc-800">
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-amber-950 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Atenção Regulatória (RN-04):</strong> A reabertura restaura o status da ficha para <em>Em Análise</em>, permitindo inclusão de novos documentos e nova versão de parecer. Essa ação é registrada de forma indelével na trilha de auditoria para fins de fiscalização do Banco Central do Brasil.
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
              Responsável pela Solicitação (GECAN / Auditoria)
            </label>
            <input
              type="text"
              value={solicitadoPor}
              onChange={(e) => setSolicitadoPor(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded p-2 text-xs font-semibold text-zinc-900 outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-zinc-700 uppercase">
                Justificativa Formal Obrigatória (Mínimo 20 caracteres)
              </label>
              <span className={`text-[10px] font-mono ${justificativa.length < 20 ? 'text-red-600 font-bold' : 'text-zinc-500'}`}>
                {justificativa.length} / 20 mín.
              </span>
            </div>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              rows={4}
              placeholder="Ex.: Apresentação de novos documentos fiscais pelo associado que comprovam a licitude da origem de recursos anteriormente considerada atípica..."
              className="w-full bg-white border border-zinc-300 rounded p-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="bg-[#FFCC01] hover:bg-[#E5B700] text-black font-bold px-3 py-1.5 rounded border border-[#E5B700] transition-colors cursor-pointer text-xs"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || justificativa.trim().length < 20}
            className="px-4 py-2 rounded font-bold text-xs bg-[#FFCC01] hover:bg-[#E5B700] text-black flex items-center gap-1.5 border border-[#E5B700] cursor-pointer disabled:opacity-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-black" />
            <span>{isSubmitting ? 'Processando...' : 'Confirmar Reabertura da Ficha'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
