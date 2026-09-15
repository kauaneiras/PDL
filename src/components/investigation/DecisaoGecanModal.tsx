import React, { useState } from 'react';
import { CasoInvestigacao, DecisaoGecan } from '../../types';
import { useAml } from '../../context/AmlContext';
import { coafTipologias } from '../../data/mock-data';
import { X, CheckCircle2, AlertTriangle, Send, FileCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface DecisaoGecanModalProps {
  caso: CasoInvestigacao;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DecisaoGecanModal: React.FC<DecisaoGecanModalProps> = ({
  caso,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { encerrarFicha, showToast } = useAml();

  const [decisao, setDecisao] = useState<'COMUNICAR_COAF' | 'SEM_OCORRENCIA' | 'DILIGENCIA_EXTERNA'>(
    caso.risco === 'Crítico' ? 'COMUNICAR_COAF' : 'SEM_OCORRENCIA'
  );

  const [tipologiaCoaf, setTipologiaCoaf] = useState<string>(
    caso.parecer?.tipologiaCoaf || coafTipologias[0]
  );

  const [recomendacaoGecan, setRecomendacaoGecan] = useState<string>(
    decisao === 'COMUNICAR_COAF'
      ? 'Comunicação mandatória ao SISCOAF por movimentação atípica incompatível com capacidade econômico-financeira. Sugerido bloqueio cautelar e encerramento do relacionamento caso não comprovada a origem lícita.'
      : 'Atipicidade documentalmente justificada por comprovação de origem lícita (Declaração de IR, holerites e contrato correlato). Operação arquivada sem necessidade de reporte ao COAF.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Validações
    if (decisao === 'COMUNICAR_COAF' && !tipologiaCoaf) {
      showToast('Por favor, selecione o enquadramento / tipologia COAF.', 'error');
      return;
    }

    if (!recomendacaoGecan.trim()) {
      showToast('A fundamentação e recomendação da GECAN são obrigatórias para o encerramento.', 'error');
      return;
    }

    setIsSubmitting(true);

    const decisaoPayload: DecisaoGecan = {
      decisao,
      tipologiaCoafCodigo: decisao === 'COMUNICAR_COAF' ? tipologiaCoaf.split(' - ')[0] || '1.1.1' : undefined,
      tipologiaCoafDescricao: decisao === 'COMUNICAR_COAF' ? tipologiaCoaf : undefined,
      recomendacaoGecan: recomendacaoGecan.trim(),
      decididoPor: 'Comitê GECAN / Maísa Ramos',
      dtDecisao: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setTimeout(() => {
      encerrarFicha(
        caso.id,
        decisao === 'COMUNICAR_COAF' ? 'COMUNICAR_COAF' : 'SEM_OCORRENCIA',
        recomendacaoGecan.trim(),
        {
          tipologiaCoafCodigo: decisao === 'COMUNICAR_COAF' ? tipologiaCoaf.split(' - ')[0] || '1.1.1' : undefined,
          tipologiaCoafDescricao: decisao === 'COMUNICAR_COAF' ? tipologiaCoaf : undefined,
          recomendacaoGecan: recomendacaoGecan.trim(),
        }
      );
      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-zinc-300 w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-zinc-900 text-[#FFCC01] flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
                Encerramento de Ficha com Deliberação GECAN (RF-20, RF-21, RN-03)
              </h2>
              <p className="text-xs text-zinc-500">
                Julgamento colegiado permanente em <code className="font-mono bg-zinc-200 px-1 py-0.5 rounded text-zinc-800">SCH_PLDFT.TB_Decisao_GECAN</code>
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
        <div className="p-6 space-y-4 text-xs text-zinc-800">
          {/* Alerta de Imutabilidade */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-amber-950 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Regra de Imutabilidade & Validação Executiva (RNF02, RF14):</strong> Ao encerrar com decisão de <em>"Comunicar ao COAF"</em>, os dados do dossiê serão imediatamente congelados em modo somente-leitura e encaminhados para a <strong>Esteira de Aprovação da Diretoria (DIREX)</strong>. A exportação no lote SISCOAF (RF09) será liberada mediante aposição de assinatura digital ICP-Brasil pela Diretoria.
            </div>
          </div>

          {/* Dados do Investigado */}
          <div className="bg-zinc-50 border border-zinc-200 rounded p-3 flex justify-between items-center">
            <div>
              <span className="font-bold text-zinc-900 block text-xs">{caso.nome}</span>
              <span className="text-zinc-500 text-[11px] font-mono">{caso.cpf} • {caso.kyc.cidadeUf}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Score Atual</span>
              <span className="text-sm font-bold text-zinc-900">{caso.scoreRisco} pts ({caso.risco})</span>
            </div>
          </div>

          {/* Tipo de Deliberação */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
              Deliberação Colegiada GECAN
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDecisao('COMUNICAR_COAF');
                  setRecomendacaoGecan('Comunicação mandatória ao SISCOAF por movimentação atípica incompatível com capacidade econômico-financeira. Sugerido bloqueio cautelar e encerramento do relacionamento.');
                }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  decisao === 'COMUNICAR_COAF'
                    ? 'border-red-500 bg-red-50/70 text-red-950 font-bold ring-1 ring-red-400'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-red-800">
                  <Send className="w-3.5 h-3.5 text-red-600" />
                  <span>Comunicar ao COAF (SISCOAF)</span>
                </div>
                <p className="text-[10px] font-normal text-zinc-600 mt-1">
                  Atipicidade confirmada sem comprovação de lastro lícito. Gera protocolo SISCOAF automático.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDecisao('SEM_OCORRENCIA');
                  setRecomendacaoGecan('Atipicidade documentalmente justificada por comprovação de origem lícita (Declaração de IR, holerites e contrato correlato). Operação arquivada sem necessidade de reporte ao COAF.');
                }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  decisao === 'SEM_OCORRENCIA'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-400'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sem Ocorrência (Arquivamento)</span>
                </div>
                <p className="text-[10px] font-normal text-zinc-600 mt-1">
                  Atipicidade fundamentada e elidida por lastro documental idôneo. Ficha arquivada com evidências.
                </p>
              </button>
            </div>
          </div>

          {/* Enquadramento e Tipologia COAF se COMUNICAR_COAF */}
          {decisao === 'COMUNICAR_COAF' && (
            <div className="p-3 bg-red-50/50 border border-red-200 rounded-lg space-y-2 animate-in fade-in duration-150">
              <label className="text-[11px] font-bold text-red-900 block uppercase">
                Tipologia & Enquadramento COAF (Mandatório)
              </label>
              <select
                value={tipologiaCoaf}
                onChange={(e) => setTipologiaCoaf(e.target.value)}
                className="w-full bg-white border border-red-300 rounded p-2 text-xs font-semibold text-zinc-900 outline-none"
              >
                {coafTipologias.map((tip, idx) => (
                  <option key={idx} value={tip}>{tip}</option>
                ))}
              </select>
              <div className="text-[10px] text-red-800">
                * Um número de protocolo SISCOAF com checksum seguro será gerado e vinculado permanentemente à ficha no encerramento.
              </div>
            </div>
          )}

          {/* Recomendações e Fundamentação da GECAN */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
              Recomendações e Fundamentação Colegiada da GECAN (Obrigatório)
            </label>
            <textarea
              value={recomendacaoGecan}
              onChange={(e) => setRecomendacaoGecan(e.target.value)}
              rows={3}
              className="w-full bg-white border border-zinc-300 rounded p-2.5 text-xs text-zinc-900 outline-none focus:border-zinc-500 resize-none font-medium"
              placeholder="Descreva as medidas administrativas e a fundamentação da decisão..."
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
            disabled={isSubmitting}
            className="px-4 py-2 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black font-black text-xs flex items-center gap-1.5 border border-[#E5B700] cursor-pointer transition-all shadow-xs disabled:opacity-50"
          >
            <FileCheck className="w-4 h-4 text-black" />
            <span>{isSubmitting ? 'Gravando Encerramento...' : 'Confirmar Encerramento da Ficha'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
