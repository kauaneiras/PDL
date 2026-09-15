import React from 'react';
import { ContratoCreditoSnapshot } from '../../types';
import { Landmark, FileText, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

interface ContratosCreditoTabProps {
  contratos?: ContratoCreditoSnapshot[];
  limocAtivo?: boolean;
  limocValor?: number;
}

export const ContratosCreditoTab: React.FC<ContratosCreditoTabProps> = ({
  contratos = [],
  limocAtivo,
  limocValor
}) => {
  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const totalSaldoDevedor = contratos.reduce((acc, c) => acc + c.saldoDevedor, 0);
  const totalValorContratado = contratos.reduce((acc, c) => acc + c.valorContratado, 0);

  return (
    <div className="space-y-4 text-xs">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
        <div>
          <h4 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5 uppercase">
            <Landmark className="w-3.5 h-3.5 text-zinc-700" />
            Contratos de Crédito Ativos no Momento da Seleção (RF-09, RF-10)
          </h4>
          <p className="text-[11px] text-zinc-500">
            Snapshot congelado na geração da remessa mensal (<code className="font-mono text-zinc-700">TB_Ficha_SnapshotCadastral</code>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {limocAtivo && (
            <div className="bg-zinc-100 border border-zinc-300 text-zinc-900 px-2.5 py-1 rounded text-right">
              <span className="text-[9px] uppercase font-bold block">LIMOC Ativo</span>
              <span className="font-mono font-bold text-xs">{formatCurrency(limocValor)}</span>
            </div>
          )}
          <div className="bg-white border border-zinc-200 px-3 py-1 rounded text-right">
            <span className="text-[9px] uppercase text-zinc-500 font-bold block">Saldo Devedor Total</span>
            <span className="font-mono font-bold text-zinc-900 text-xs">{formatCurrency(totalSaldoDevedor)}</span>
          </div>
        </div>
      </div>

      {/* Lista de Contratos */}
      {contratos.length === 0 ? (
        <div className="text-center py-6 text-zinc-500 bg-zinc-50 rounded border border-dashed border-zinc-300">
          Nenhum contrato de crédito ativo registrado no momento da extração da ficha.
        </div>
      ) : (
        <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-200 text-[10px] font-bold text-zinc-600 uppercase">
                <th className="p-2.5">Contrato</th>
                <th className="p-2.5">Modalidade</th>
                <th className="p-2.5">Data Contratação</th>
                <th className="p-2.5 text-right">Valor Contratado</th>
                <th className="p-2.5 text-right">Saldo Devedor</th>
                <th className="p-2.5 text-center">Parcelas Restantes</th>
                <th className="p-2.5 text-center">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-[11px]">
              {contratos.map((ctr) => (
                <tr key={ctr.numeroContrato} className="hover:bg-zinc-50">
                  <td className="p-2.5 font-bold font-mono text-zinc-900 flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-zinc-400" />
                    {ctr.numeroContrato}
                  </td>
                  <td className="p-2.5 font-semibold text-zinc-800">{ctr.modalidade}</td>
                  <td className="p-2.5 font-mono text-zinc-600">{ctr.dataContratacao}</td>
                  <td className="p-2.5 text-right font-mono text-zinc-700">{formatCurrency(ctr.valorContratado)}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-zinc-900">{formatCurrency(ctr.saldoDevedor)}</td>
                  <td className="p-2.5 text-center font-mono text-zinc-700">{ctr.parcelasRestantes} parcelas</td>
                  <td className="p-2.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ctr.situacao === 'Adimplente'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ctr.situacao}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
