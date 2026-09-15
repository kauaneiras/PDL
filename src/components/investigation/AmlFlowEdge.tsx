import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath
} from '@xyflow/react';
import { GraphEdgeData } from '../../types';
import { AlertTriangle, ArrowRight, ArrowLeftRight, ShieldCheck, DollarSign } from 'lucide-react';

export const AmlFlowEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerStart,
  markerEnd,
  data,
  selected
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const edgeData = (data || {}) as GraphEdgeData;
  const isBidirecional = edgeData.isBidirecional || edgeData.tipoFluxo === 'BIDIRECIONAL';
  const isTitularidade = edgeData.tipoFluxo === 'TITULARIDADE';
  const isAtributo = edgeData.tipoFluxo === 'ATRIBUTO';
  const isSuspeita = edgeData.isSuspeita;
  const valor = edgeData.valor;
  const quantidade = edgeData.quantidade;
  const metodo = edgeData.metodo;

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  // Se for apenas ligação de atributo KYC (ex: endereço, documento), renderiza sem label pesado
  if (isAtributo) {
    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          markerStart={markerStart}
          markerEnd={markerEnd}
          style={{
            stroke: '#94A3B8',
            strokeWidth: 2,
            strokeDasharray: '4,4',
            ...style
          }}
        />
      </>
    );
  }

  // Linha de Titularidade (Investigado -> Conta Corrente)
  if (isTitularidade) {
    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          markerStart={markerStart}
          markerEnd={markerEnd}
          style={{
            stroke: '#0F172A',
            strokeWidth: 4.5,
            ...style
          }}
        />
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all'
            }}
            className="nodrag nopan select-none cursor-pointer"
          >
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all shadow-md ${
                selected
                  ? 'bg-slate-950 text-amber-400 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                  : 'bg-[#0F172A] text-white border-slate-700 hover:border-amber-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Titularidade 100%</span>
              {valor && (
                <span className="font-mono text-[#FFCC01] ml-0.5 font-black">
                  • {formatCurrency(valor)}
                </span>
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      </>
    );
  }

  // Cor principal do fluxo financeiro
  const customStyle = (style || {}) as Record<string, any>;
  const strokeProp = typeof customStyle.stroke === 'string' ? customStyle.stroke : '';
  const isHighRisk = isSuspeita || strokeProp.includes('#EF4444') || strokeProp.includes('#DC2626');
  const strokeColor = isHighRisk ? '#EF4444' : strokeProp || '#2563EB';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth: typeof customStyle.strokeWidth === 'number' ? customStyle.strokeWidth : 2.5,
          ...style
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all'
          }}
          className="nodrag nopan select-none cursor-pointer group"
        >
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold border transition-all shadow-md ${
              selected
                ? 'bg-slate-950 text-white ring-2 ring-amber-400 scale-105 border-amber-400 z-30'
                : isHighRisk
                ? 'bg-white text-red-950 border-red-400 hover:border-red-600 hover:shadow-lg'
                : 'bg-white text-slate-900 border-slate-300 hover:border-zinc-800 hover:shadow-lg'
            }`}
          >
            {/* Ícone de Direção: Bidirecional (⇄) ou Unidirecional (→) */}
            <span
              className={`flex items-center justify-center w-4 h-4 rounded-full text-[8.5px] font-black shrink-0 ${
                isHighRisk
                  ? 'bg-red-100 text-red-700'
                  : isBidirecional
                  ? 'bg-[#FFCC01]/40 text-black'
                  : 'bg-slate-100 text-slate-700'
              }`}
              title={isBidirecional ? 'Fluxo Financeiro Bidirecional / Recíproco' : 'Fluxo Financeiro Unidirecional'}
            >
              {isBidirecional ? (
                <ArrowLeftRight className="w-2.5 h-2.5 stroke-[2.5]" />
              ) : (
                <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
              )}
            </span>

            {/* Quantidade de Vezes / Frequência Transacional */}
            {quantidade !== undefined && quantidade > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded font-mono font-black text-[9px] ${
                  isHighRisk
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-white'
                }`}
                title={`${quantidade} transações identificadas neste elo`}
              >
                {quantidade}x
              </span>
            )}

            {/* Método (PIX / TED / Espécie / Offshore) */}
            {metodo && (
              <span className="text-[8.5px] text-zinc-500 font-semibold uppercase">
                {metodo}
              </span>
            )}

            {/* Volume Financeiro Formatado */}
            {valor !== undefined && (
              <span
                className={`font-mono font-black text-[10px] tracking-tight ${
                  isHighRisk ? 'text-red-700' : 'text-zinc-950'
                }`}
              >
                {formatCurrency(valor)}
              </span>
            )}

            {/* Alerta de Suspeita */}
            {isHighRisk && (
              <AlertTriangle className="w-3 h-3 text-red-600 stroke-[2.5] shrink-0" />
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
