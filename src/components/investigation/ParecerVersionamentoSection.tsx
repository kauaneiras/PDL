import React, { useState, useMemo } from 'react';
import { CasoInvestigacao, ParecerVersao } from '../../types';
import { useAml } from '../../context/AmlContext';
import { calcularPercentualEdicaoHumana, gerarParecerSugeridoAutomatico } from '../../utils/pldV2Helper';
import { mockSnippets } from '../../data/mock-data';
import {
  Sparkles,
  History,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ParecerVersionamentoSectionProps {
  caso: CasoInvestigacao;
  readOnly?: boolean;
  texto: string;
  onChangeTexto: (texto: string) => void;
}

export const ParecerVersionamentoSection: React.FC<ParecerVersionamentoSectionProps> = ({
  caso,
  readOnly = false,
  texto,
  onChangeTexto
}) => {
  const { showToast } = useAml();

  // Minuta base sugerida
  const minutaSugerida = useMemo(() => {
    return gerarParecerSugeridoAutomatico(caso);
  }, [caso]);

  const [lastInsertedSnippet, setLastInsertedSnippet] = useState<string | null>(null);
  const [showHistoricoVersoes, setShowHistoricoVersoes] = useState(false);

  // Percentual de edição humana em tempo real (RF-19)
  const percentualEdicaoHumana = useMemo(() => {
    return calcularPercentualEdicaoHumana(minutaSugerida, texto);
  }, [minutaSugerida, texto]);

  // Inserção de snippets rápidos
  const handleInsertSnippet = (snippetTexto: string, snippetId: string) => {
    if (readOnly) return;
    const novoTexto = texto ? `${texto}\n\n${snippetTexto}` : snippetTexto;
    onChangeTexto(novoTexto);
    setLastInsertedSnippet(snippetId);
    showToast('Snippet inserido na fundamentação do parecer!', 'info');
  };

  const versoesAnteriores = caso.versoesParecer || [];

  return (
    <div className="space-y-3 text-xs">
      {/* Header com Indicador de Versão e Edição Humana */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-zinc-900 text-[#FFCC01] flex items-center justify-center font-bold">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 uppercase text-xs">
              Parecer Técnico & Fundamentação
            </h4>
            <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2">
              <span>Versão v{caso.parecer?.versao || versoesAnteriores.length || 1}</span>
              <span>•</span>
              <span>Edição Humana: <strong className="text-zinc-900">{percentualEdicaoHumana}%</strong></span>
            </div>
          </div>
        </div>

        {readOnly && (
          <span className="text-[10px] font-bold text-zinc-700 bg-zinc-200 px-2 py-0.5 rounded">
            SOMENTE LEITURA
          </span>
        )}
      </div>

      {/* Snippets Rápidos de Fundamentação */}
      {!readOnly && (
        <div className="bg-white border border-zinc-200 rounded p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-800 text-[11px] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Inserir modelo rápido:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {mockSnippets.slice(0, 4).map((snip) => (
              <button
                key={snip.id}
                type="button"
                onClick={() => handleInsertSnippet(snip.texto, snip.id)}
                className={`p-1.5 rounded text-left border text-[10px] transition-colors cursor-pointer ${
                  lastInsertedSnippet === snip.id
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                    : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                }`}
              >
                <div className="font-bold truncate">{snip.titulo}</div>
                <div className="text-[9px] text-zinc-500 truncate">{snip.categoria}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Textarea do Parecer Técnico */}
      <div className="space-y-1">
        <textarea
          value={texto}
          onChange={(e) => onChangeTexto(e.target.value)}
          disabled={readOnly}
          rows={6}
          placeholder="Insira a fundamentação técnica da análise de PLD/FT..."
          className="w-full bg-white border border-zinc-300 rounded p-2.5 text-xs text-zinc-900 leading-relaxed font-serif placeholder-zinc-400 focus:outline-none focus:border-zinc-500 disabled:bg-zinc-100 disabled:text-zinc-600 resize-y"
        />
      </div>

      {/* Accordion de Histórico de Versões do Parecer (se houver histórico) */}
      {versoesAnteriores.length > 0 && (
        <div className="border border-zinc-200 rounded overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setShowHistoricoVersoes(!showHistoricoVersoes)}
            className="w-full p-2.5 bg-zinc-50 hover:bg-zinc-100/80 flex items-center justify-between text-xs font-bold text-zinc-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-zinc-600" />
              <span>Histórico de Versões Anteriores ({versoesAnteriores.length})</span>
            </div>
            {showHistoricoVersoes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHistoricoVersoes && (
            <div className="p-2.5 border-t border-zinc-200 space-y-2">
              {versoesAnteriores.map((v) => (
                <div
                  key={v.id}
                  className={`border rounded p-2 text-xs space-y-1 ${
                    v.vigente ? 'bg-amber-50/50 border-amber-300' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] border-b border-zinc-200 pb-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-zinc-900">Versão {v.versao}</strong>
                      {v.vigente && (
                        <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          VIGENTE
                        </span>
                      )}
                      <span className="text-zinc-500 font-mono">Por {v.analistaNome} em {v.dataCriacao}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600">
                      {v.percentualEdicaoHumana}% Edição Humana
                    </span>
                  </div>
                  <p className="text-zinc-800 leading-relaxed font-serif whitespace-pre-line text-xs bg-white p-2 rounded border border-zinc-200">
                    {v.textoFinal}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
