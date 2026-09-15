import React, { useState } from 'react';
import { useAml } from '../../context/AmlContext';
import { TipoFicha } from '../../types';
import { X, Play, RefreshCw, CheckCircle2, Layers, Calendar, BarChart3, Database } from 'lucide-react';

interface RemessasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RemessasModal: React.FC<RemessasModalProps> = ({ isOpen, onClose }) => {
  const { remessas, gerarRemessaMensal, simularRemessaMensal, showToast } = useAml();

  const [mesAno, setMesAno] = useState<string>('09/2026');
  const [tipoFicha, setTipoFicha] = useState<TipoFicha>('Operações');
  const [isSimulando, setIsSimulando] = useState(false);
  const [resultadoSimulacao, setResultadoSimulacao] = useState<{ total: number; criticos: number; volume: number } | null>(null);
  const [isGerando, setIsGerando] = useState(false);

  if (!isOpen) return null;

  const handleSimular = () => {
    setIsSimulando(true);
    setTimeout(() => {
      const res = simularRemessaMensal(mesAno, tipoFicha);
      setResultadoSimulacao(res);
      setIsSimulando(false);
      showToast('Simulação de seleção mensal T-SQL concluída com sucesso.', 'info');
    }, 450);
  };

  const handleGerar = () => {
    setIsGerando(true);
    setTimeout(() => {
      gerarRemessaMensal(mesAno, tipoFicha);
      setIsGerando(false);
      setResultadoSimulacao(null);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-zinc-300 w-full max-w-4xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-zinc-900 text-[#FFCC01] flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
                Gestão & Seleção de Remessas Mensais (RF-01 a RF-03 / RF-47)
              </h2>
              <p className="text-xs text-zinc-500">
                Execução centralizada da procedure <code className="bg-zinc-200 text-zinc-800 px-1 py-0.5 rounded font-mono">STP_PLDFT_GERAR_REMESSA</code>
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
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-800">
          {/* Action Box: Simulação e Geração */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-zinc-700" />
                Disparo de Nova Seleção Mensal
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">
                Regra de Idempotência Ativa (RN-01): associados já cadastrados no mês são preservados
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Mês de Referência</label>
                <input
                  type="text"
                  value={mesAno}
                  onChange={(e) => setMesAno(e.target.value)}
                  placeholder="MM/AAAA"
                  className="w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-xs font-semibold text-zinc-900 focus:border-zinc-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Tipo de Ficha</label>
                <select
                  value={tipoFicha}
                  onChange={(e) => setTipoFicha(e.target.value as TipoFicha)}
                  className="w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-xs font-semibold text-zinc-900 focus:border-zinc-500 outline-none"
                >
                  <option value="Operações">Operações (Crédito, Investimentos, Garantias)</option>
                  <option value="Conta Corrente">Conta Corrente / Digital (Transacional)</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleSimular}
                  disabled={isSimulando}
                  className="flex-1 bg-[#FFCC01] hover:bg-[#E5B700] text-black font-bold py-1.5 px-3 rounded border border-[#E5B700] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isSimulando ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" /> : <BarChart3 className="w-3.5 h-3.5 text-black" />}
                  Simular (RF-47)
                </button>
                <button
                  onClick={handleGerar}
                  disabled={isGerando}
                  className="flex-1 bg-[#FFCC01] hover:bg-[#E5B700] text-black font-bold py-1.5 px-3 rounded border border-[#E5B700] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isGerando ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" /> : <Play className="w-3.5 h-3.5 text-black fill-black" />}
                  Gerar Remessa
                </button>
              </div>
            </div>

            {/* Resultado da Simulação Prévia (RF-47) */}
            {resultadoSimulacao && (
              <div className="bg-amber-50/70 border border-amber-200 rounded p-3 text-amber-950 animate-in fade-in duration-200">
                <div className="font-bold text-xs flex items-center gap-1.5 mb-1 text-amber-900">
                  <CheckCircle2 className="w-4 h-4 text-amber-700" />
                  Resultado da Simulação Prévia ({mesAno} - {tipoFicha})
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-amber-200/60 text-center">
                  <div>
                    <span className="text-[10px] text-amber-800 uppercase block font-semibold">Total de Fichas</span>
                    <span className="text-base font-bold text-amber-950">{resultadoSimulacao.total} associados</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-800 uppercase block font-semibold">Risco Crítico / Alto</span>
                    <span className="text-base font-bold text-amber-950">{resultadoSimulacao.criticos} casos</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-800 uppercase block font-semibold">Volume Atípico Estimado</span>
                    <span className="text-base font-bold text-amber-950">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resultadoSimulacao.volume)}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-amber-800 mt-2 italic">
                  * Nenhuma gravação definitiva foi realizada no banco durante a simulação. Clique em "Gerar Remessa" para materializar o acervo.
                </p>
              </div>
            )}
          </div>

          {/* Histórico de Remessas Mensais Geradas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-zinc-900 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-zinc-700" />
                Histórico de Remessas Mensais Materializadas (TB_Remessa)
              </h3>
              <span className="text-[11px] text-zinc-500">{remessas.length} lotes registrados</span>
            </div>

            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-200 text-[11px] font-bold text-zinc-700 uppercase">
                    <th className="p-2.5">Referência</th>
                    <th className="p-2.5">Tipo de Ficha</th>
                    <th className="p-2.5">Data de Geração</th>
                    <th className="p-2.5 text-center">Total Fichas</th>
                    <th className="p-2.5 text-center">Novas</th>
                    <th className="p-2.5 text-center">Existentes</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {remessas.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="p-2.5 font-bold text-zinc-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {r.dataReferencia}
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {r.tipoFicha}
                        </span>
                      </td>
                      <td className="p-2.5 text-zinc-600 font-mono text-[11px]">{r.dtGeracao}</td>
                      <td className="p-2.5 text-center font-bold text-zinc-900">{r.totalFichas}</td>
                      <td className="p-2.5 text-center text-emerald-700 font-semibold">+{r.fichasNovas}</td>
                      <td className="p-2.5 text-center text-zinc-600 font-semibold">{r.fichasJaExistentes}</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'Concluída'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500">
            Mapeamento permanente no banco: <code className="font-mono text-zinc-800">SCH_PLDFT.TB_Remessa</code>
          </div>
          <button
            onClick={onClose}
            className="bg-[#FFCC01] hover:bg-[#E5B700] text-black font-bold px-4 py-1.5 rounded border border-[#E5B700] transition-colors cursor-pointer text-xs shadow-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
