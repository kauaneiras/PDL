import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GraphNode, GraphEdge, GraphNodeData, GraphEdgeData, Transaction } from '../../types';
import {
  CircularMainNode,
  CircularHubNode,
  CircularPersonNode,
  CircularAttributeNode
} from './CircularGraphNodes';
import { AmlFlowEdge } from './AmlFlowEdge';
import {
  Users,
  Building2,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  Banknote,
  DollarSign,
  ArrowRight,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Info,
  Maximize2,
  Minimize2,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';

const nodeTypes = {
  MAIN: CircularMainNode,
  HIGH_RISK: CircularMainNode,
  HUB_CC: CircularHubNode,
  FAMILY: CircularPersonNode,
  COMPANY: CircularPersonNode,
  COUNTERPARTY: CircularPersonNode,
  PEP: CircularPersonNode,
  BANK: CircularPersonNode,
  CRYPTO: CircularPersonNode,
  ATTRIBUTE: CircularAttributeNode
};

const edgeTypes = {
  amlFlow: AmlFlowEdge
};

interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectPersonFilter?: (personName: string) => void;
  onAddNoteToReport?: (note: string) => void;
}

export const GraphView: React.FC<GraphViewProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  onSelectPersonFilter,
  onAddNoteToReport
}) => {
  const [selectedNodeData, setSelectedNodeData] = useState<GraphNodeData | null>(null);
  const [selectedEdgeData, setSelectedEdgeData] = useState<{
    edge: GraphEdge;
    sourceNode?: GraphNodeData;
    targetNode?: GraphNodeData;
  } | null>(null);

  const [filterRelation, setFilterRelation] = useState<'ALL' | 'FAMILY' | 'COUNTERPARTY' | 'COMPANY' | 'HIGH_RISK' | 'ATTRIBUTE'>('ALL');
  const [minVolume, setMinVolume] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState(false);

  // Filtra nós dinamicamente conforme os filtros de investigação PLD
  const filteredNodesList = useMemo(() => {
    return initialNodes.filter((node) => {
      const data = node.data;
      const rel = data.relationType || (data.type === 'FAMILY' ? 'familiar' : data.type === 'COMPANY' ? 'empresa' : data.type === 'MAIN' ? 'investigado' : 'nao_familiar');

      // Sempre mantém o Investigado e o HUB CC visíveis para coerência da topologia
      if (node.id === 'node-investigado' || node.id === 'node-hub-cc' || data.type === 'MAIN' || data.type === 'HUB_CC') {
        return true;
      }

      // Filtro por Tipo de Relação
      if (filterRelation === 'FAMILY' && rel !== 'familiar' && data.type !== 'FAMILY') return false;
      if (filterRelation === 'COUNTERPARTY' && rel !== 'nao_familiar' && data.type !== 'COUNTERPARTY') return false;
      if (filterRelation === 'COMPANY' && rel !== 'empresa' && data.type !== 'COMPANY') return false;
      if (filterRelation === 'HIGH_RISK' && rel !== 'alto_risco' && data.type !== 'HIGH_RISK') return false;
      if (filterRelation === 'ATTRIBUTE' && rel !== 'atributo' && data.type !== 'ATTRIBUTE') return false;

      // Filtro por Volume Mínimo
      if (minVolume > 0 && (data.totalVolume || 0) < minVolume && data.type !== 'ATTRIBUTE') {
        return false;
      }

      // Busca textual
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchLabel = data.label?.toLowerCase().includes(query);
        const matchSub = data.subLabel?.toLowerCase().includes(query);
        const matchDoc = data.cpfCnpj?.toLowerCase().includes(query);
        if (!matchLabel && !matchSub && !matchDoc) return false;
      }

      return true;
    });
  }, [initialNodes, filterRelation, minVolume, searchTerm]);

  // Mantém apenas as arestas conectadas a nós visíveis
  const visibleNodeIds = useMemo(() => new Set(filteredNodesList.map((n) => n.id)), [filteredNodesList]);

  const formattedNodes = useMemo(() => {
    return filteredNodesList.map((n) => ({
      id: n.id,
      type: n.type || (n.data?.type as string) || 'COUNTERPARTY',
      position: n.position || { x: 200, y: 150 },
      data: n.data
    }));
  }, [filteredNodesList]);

  const formattedEdges = useMemo(() => {
    return initialEdges
      .filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
      .map((e) => {
        const edgeData = (e.data || {}) as GraphEdgeData;
        const isBidirecional = edgeData.isBidirecional || edgeData.tipoFluxo === 'BIDIRECIONAL';
        const isAtributo = edgeData.tipoFluxo === 'ATRIBUTO';
        const isSusp = edgeData.isSuspeita || (e.style?.stroke as string)?.includes('#EF4444');
        const strokeColor = isSusp ? '#EF4444' : (e.style?.stroke as string) || '#2563EB';

        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'amlFlow',
          animated: false,
          data: {
            ...edgeData,
            label: e.label
          },
          style: {
            stroke: strokeColor,
            strokeWidth: e.style?.strokeWidth || 2.5,
            ...e.style
          },
          markerEnd: isAtributo ? undefined : {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: 13,
            height: 13
          },
          markerStart: isBidirecional ? {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: 13,
            height: 13
          } : undefined
        };
      });
  }, [initialEdges, visibleNodeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(formattedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(formattedEdges);

  React.useEffect(() => {
    setNodes(formattedNodes);
    setEdges(formattedEdges);
  }, [formattedNodes, formattedEdges, setNodes, setEdges]);

  const onNodeClick = (_: React.MouseEvent, node: any) => {
    setSelectedEdgeData(null);
    setSelectedNodeData(node.data as GraphNodeData);
  };

  const onEdgeClick = (_: React.MouseEvent, edge: any) => {
    setSelectedNodeData(null);
    const srcNode = initialNodes.find((n) => n.id === edge.source)?.data;
    const tgtNode = initialNodes.find((n) => n.id === edge.target)?.data;
    setSelectedEdgeData({
      edge: edge as GraphEdge,
      sourceNode: srcNode,
      targetNode: tgtNode
    });
  };

  const handleCopyCpf = (cpf?: string) => {
    if (!cpf) return;
    navigator.clipboard.writeText(cpf);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  // Métricas Consolidadas do Grafo
  const totalVolumeGeral = useMemo(() => {
    return initialNodes.reduce((acc, n) => acc + (n.data.totalVolume || 0), 0);
  }, [initialNodes]);

  const totalTransacoesCount = useMemo(() => {
    return initialNodes.reduce((acc, n) => acc + (n.data.transacoesCount || 0), 0);
  }, [initialNodes]);

  return (
    <div className="relative w-full h-full min-h-[540px] flex flex-col bg-[#F8FAFC] rounded-xl overflow-hidden border border-[#CBD5E1] shadow-inner select-none font-sans">
      {/* Top Filter and Investigation Toolbar */}
      <div className="bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 z-10 shadow-2xs">
        {/* Left: Quick Relation Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-zinc-500 font-bold flex items-center gap-1 mr-1 text-[11px]">
            <Filter className="w-3.5 h-3.5 text-zinc-600" /> Vínculo:
          </span>

          <button
            onClick={() => setFilterRelation('ALL')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
              filterRelation === 'ALL'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
            }`}
          >
            Todos ({initialNodes.length})
          </button>

          <button
            onClick={() => setFilterRelation('FAMILY')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
              filterRelation === 'FAMILY'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Familiares
          </button>

          <button
            onClick={() => setFilterRelation('COUNTERPARTY')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
              filterRelation === 'COUNTERPARTY'
                ? 'bg-zinc-700 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-zinc-400" />
            Não-Familiares / Terceiros
          </button>

          <button
            onClick={() => setFilterRelation('COMPANY')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
              filterRelation === 'COMPANY'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Empresas & PJs
          </button>

          <button
            onClick={() => setFilterRelation('HIGH_RISK')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
              filterRelation === 'HIGH_RISK'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Alvos Críticos
          </button>

          <button
            onClick={() => setFilterRelation('ATTRIBUTE')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
              filterRelation === 'ATTRIBUTE'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            Atributos & Dossiê
          </button>
        </div>

        {/* Right: Search & Volume Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar pessoa, CPF ou empresa..."
              className="pl-8 pr-3 py-1 bg-zinc-50 hover:bg-zinc-100 focus:bg-white border border-zinc-300 rounded-lg text-xs text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-amber-400 w-48 sm:w-60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200">
            <span className="text-zinc-500 text-[10px] font-bold">Volume:</span>
            <select
              value={minVolume}
              onChange={(e) => setMinVolume(Number(e.target.value))}
              className="bg-transparent text-zinc-800 font-bold text-xs focus:outline-hidden cursor-pointer"
            >
              <option value={0}>Todos os Valores</option>
              <option value={20000}>&ge; R$ 20.000</option>
              <option value={50000}>&ge; R$ 50.000 (COE)</option>
              <option value={100000}>&ge; R$ 100.000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Flow Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[460px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.25}
          maxZoom={2.0}
          attributionPosition="bottom-left"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#CBD5E1" />
          <Controls className="!bg-[#FFFFFF] !border !border-[#CBD5E1] !text-[#0F172A] !shadow-md !rounded-lg" />
          <MiniMap
            nodeStrokeWidth={2}
            nodeColor={(n: any) => {
              const d = n.data || {};
              if (d.type === 'MAIN' || d.type === 'HIGH_RISK') return '#EF4444';
              if (d.type === 'HUB_CC') return '#2563EB';
              if (d.relationType === 'familiar' || d.type === 'FAMILY') return '#22C55E';
              if (d.relationType === 'empresa' || d.type === 'COMPANY') return '#F97316';
              if (d.relationType === 'atributo' || d.type === 'ATTRIBUTE') return '#3B82F6';
              return '#94A3B8';
            }}
            maskColor="rgba(241, 245, 249, 0.75)"
            className="!bg-[#FFFFFF] !border-[#CBD5E1] !shadow-md !rounded-lg"
          />
        </ReactFlow>

        {/* Floating PLD Investigation Context Banner (Top Left) */}
        <div className="absolute top-3 left-3 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#CBD5E1] rounded-xl p-3 text-xs shadow-md z-10 max-w-xs pointer-events-auto">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-1.5">
            <span className="font-bold text-zinc-900 flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Monitoramento PLD/FT
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[9px] border border-amber-300">
              Escala de Rede
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
            <div className="bg-zinc-50 p-1.5 rounded border border-zinc-200">
              <span className="text-zinc-500 block text-[9px]">Transações</span>
              <span className="font-black text-zinc-900 font-mono text-xs">
                {totalTransacoesCount > 0 ? totalTransacoesCount.toLocaleString('pt-BR') : '2.840+'}
              </span>
            </div>
            <div className="bg-zinc-50 p-1.5 rounded border border-zinc-200">
              <span className="text-zinc-500 block text-[9px]">Volume Auditado</span>
              <span className="font-black text-zinc-950 font-mono text-xs">
                R$ {(totalVolumeGeral || 2485900).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Entity Detailed X-Ray Drawer (Bottom Right) */}
        {selectedNodeData && (
          <div className="absolute bottom-3 right-3 w-96 max-w-[calc(100vw-32px)] max-h-[460px] bg-[#FFFFFF]/98 backdrop-blur-md border-2 border-amber-400 rounded-2xl p-4 shadow-2xl z-30 flex flex-col text-xs overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-2.5 border-b border-zinc-200">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-xs ${
                    selectedNodeData.relationType === 'familiar' || selectedNodeData.type === 'FAMILY'
                      ? 'bg-emerald-600'
                      : selectedNodeData.relationType === 'empresa' || selectedNodeData.type === 'COMPANY'
                      ? 'bg-amber-600'
                      : selectedNodeData.type === 'MAIN' || selectedNodeData.type === 'HIGH_RISK'
                      ? 'bg-red-600'
                      : selectedNodeData.type === 'HUB_CC'
                      ? 'bg-zinc-900 text-[#FFCC01]'
                      : 'bg-zinc-600'
                  }`}
                >
                  {selectedNodeData.type === 'HUB_CC' ? 'CC' : <Users className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-black text-zinc-900 text-sm leading-tight">
                    {selectedNodeData.label}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-medium">
                    {selectedNodeData.subLabel || 'Entidade Mapeada'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedNodeData(null)}
                className="text-zinc-400 hover:text-zinc-800 font-bold p-1 rounded-md hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            {/* Body Info Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              {/* Document and Risk Badge */}
              <div className="flex items-center justify-between text-[11px] bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                {selectedNodeData.cpfCnpj ? (
                  <div className="flex items-center gap-1.5 font-mono text-zinc-700">
                    <span className="font-bold text-zinc-500">Doc:</span>
                    <span>{selectedNodeData.cpfCnpj}</span>
                    <button
                      onClick={() => handleCopyCpf(selectedNodeData.cpfCnpj)}
                      className="p-1 hover:bg-zinc-200 rounded text-zinc-500"
                      title="Copiar Documento"
                    >
                      {copiedId ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ) : (
                  <span className="text-zinc-400 italic">Identificação não cadastrada</span>
                )}

                {selectedNodeData.risk && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedNodeData.risk === 'Crítico'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : selectedNodeData.risk === 'Alto'
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : selectedNodeData.risk === 'Médio'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    Risco: {selectedNodeData.risk}
                  </span>
                )}
              </div>

              {/* Financial Metrics */}
              {selectedNodeData.totalVolume !== undefined && (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-zinc-100 border border-zinc-300 rounded-lg">
                    <span className="text-zinc-700 text-[10px] font-bold block">Volume Transacionado</span>
                    <span className="font-black text-zinc-950 font-mono text-xs">
                      R$ {selectedNodeData.totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-lg">
                    <span className="text-amber-800 text-[10px] font-bold block">Qtd. Transações</span>
                    <span className="font-black text-amber-950 font-mono text-xs">
                      {selectedNodeData.transacoesCount || selectedNodeData.transactionsSample?.length || 1} op.
                    </span>
                  </div>
                </div>
              )}

              {/* Grau de Parentesco / Relação */}
              {selectedNodeData.grauParentesco && (
                <div className="p-2 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px]">
                  <span className="text-emerald-900 font-bold">Vínculo Familiar:</span>
                  <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                    {selectedNodeData.grauParentesco}
                  </span>
                </div>
              )}

              {/* Notes / Investigação */}
              {selectedNodeData.notes && (
                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-[11px] text-zinc-700">
                  <span className="font-bold text-zinc-900 block mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-zinc-500" />
                    Apontamento Investigativo:
                  </span>
                  <p className="text-zinc-600 leading-relaxed">{selectedNodeData.notes}</p>
                </div>
              )}

              {/* Sample Transactions Table */}
              {selectedNodeData.transactionsSample && selectedNodeData.transactionsSample.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-800 mb-1.5">
                    <span>Amostra de Transações Auditadas:</span>
                    <span className="text-zinc-500 font-normal">
                      Exibindo {Math.min(4, selectedNodeData.transactionsSample.length)} de {selectedNodeData.transactionsSample.length}
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedNodeData.transactionsSample.slice(0, 5).map((tx, idx) => (
                      <div
                        key={idx}
                        className={`p-1.5 rounded border text-[10.5px] flex items-center justify-between ${
                          tx.isSuspeita
                            ? 'bg-red-50/70 border-red-200 text-red-900'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                        }`}
                      >
                        <div>
                          <div className="font-mono font-bold">{tx.data} • {tx.metodo || 'PIX'}</div>
                          <div className="text-[9.5px] text-zinc-500 truncate max-w-[180px]">
                            {tx.motivoSuspeita || tx.origem}
                          </div>
                        </div>
                        <div className="font-mono font-black text-right">
                          <span className={tx.valor < 0 ? 'text-red-700' : 'text-emerald-700'}>
                            {tx.valor < 0 ? '-' : '+'} R$ {Math.abs(tx.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-2.5 border-t border-zinc-200 flex items-center gap-2">
              {onSelectPersonFilter && (
                <button
                  onClick={() => onSelectPersonFilter(selectedNodeData.label)}
                  className="flex-1 px-3 py-1.5 bg-[#0F172A] hover:bg-zinc-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  Filtrar Extrato
                </button>
              )}

              {onAddNoteToReport && selectedNodeData.notes && (
                <button
                  onClick={() => onAddNoteToReport(`[Grafo] ${selectedNodeData.label}: ${selectedNodeData.notes}`)}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                  title="Inserir no Parecer"
                >
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  + Parecer
                </button>
              )}
            </div>
          </div>
        )}

        {/* Selected Flow / Edge Deep Inspection Drawer */}
        {selectedEdgeData && (
          <div className="absolute bottom-3 right-3 w-96 max-w-[calc(100vw-32px)] max-h-[460px] bg-[#FFFFFF]/98 backdrop-blur-md border-2 border-zinc-800 rounded-2xl p-4 shadow-2xl z-30 flex flex-col text-xs overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-2.5 border-b border-zinc-200">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-xs ${
                    selectedEdgeData.edge.data?.isSuspeita
                      ? 'bg-red-600'
                      : selectedEdgeData.edge.data?.isBidirecional
                      ? 'bg-zinc-900 text-[#FFCC01]'
                      : 'bg-slate-800'
                  }`}
                >
                  {selectedEdgeData.edge.data?.isBidirecional ? (
                    <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <div className="font-black text-zinc-900 text-sm leading-tight">
                    {selectedEdgeData.edge.data?.tipoFluxo === 'TITULARIDADE'
                      ? 'Vínculo de Titularidade 100%'
                      : selectedEdgeData.edge.data?.isBidirecional
                      ? 'Fluxo Recíproco / Bidirecional'
                      : 'Fluxo Unidirecional'}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-medium truncate max-w-[210px]">
                    {selectedEdgeData.sourceNode?.label || 'Origem'} ➔ {selectedEdgeData.targetNode?.label || 'Destino'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedEdgeData(null)}
                className="text-zinc-400 hover:text-zinc-800 font-bold p-1 rounded-md hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-zinc-100 border border-zinc-300 rounded-lg">
                  <span className="text-zinc-700 text-[10px] font-bold block">Volume Total Auditado</span>
                  <span className="font-black text-zinc-950 font-mono text-xs">
                    R$ {(selectedEdgeData.edge.data?.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-2 bg-slate-100 border border-slate-300 rounded-lg">
                  <span className="text-slate-700 text-[10px] font-bold block">Qtd. Operações</span>
                  <span className="font-black text-slate-900 font-mono text-xs">
                    {selectedEdgeData.edge.data?.quantidade || 1}x ({selectedEdgeData.edge.data?.metodo || 'PIX/TED'})
                  </span>
                </div>
              </div>

              {/* Suspicious Alert Reason */}
              {selectedEdgeData.edge.data?.detalhe && (
                <div className={`p-2.5 rounded-lg border text-[11px] ${
                  selectedEdgeData.edge.data?.isSuspeita
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}>
                  <span className="font-bold block mb-1 flex items-center gap-1">
                    {selectedEdgeData.edge.data?.isSuspeita ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-zinc-600" />
                    )}
                    Característica do Elo Transacional:
                  </span>
                  <p className="leading-relaxed">{selectedEdgeData.edge.data.detalhe}</p>
                </div>
              )}

              {/* Sample Transactions */}
              {selectedEdgeData.edge.data?.transactionsSample && selectedEdgeData.edge.data.transactionsSample.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-800 mb-1.5">
                    <span>Amostra de Transações deste Elo:</span>
                    <span className="text-zinc-500 font-normal">
                      Exibindo {Math.min(4, selectedEdgeData.edge.data.transactionsSample.length)} de {selectedEdgeData.edge.data.transactionsSample.length}
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedEdgeData.edge.data.transactionsSample.slice(0, 5).map((tx, idx) => (
                      <div
                        key={idx}
                        className={`p-1.5 rounded border text-[10.5px] flex items-center justify-between ${
                          tx.isSuspeita
                            ? 'bg-red-50/70 border-red-200 text-red-900'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                        }`}
                      >
                        <div>
                          <div className="font-mono font-bold">{tx.data} • {tx.metodo || 'PIX'}</div>
                          <div className="text-[9.5px] text-zinc-500 truncate max-w-[180px]">
                            {tx.motivoSuspeita || tx.origem}
                          </div>
                        </div>
                        <div className="font-mono font-black text-right">
                          <span className={tx.valor < 0 ? 'text-red-700' : 'text-emerald-700'}>
                            {tx.valor < 0 ? '-' : '+'} R$ {Math.abs(tx.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-2.5 border-t border-zinc-200 flex items-center gap-2">
              {onSelectPersonFilter && (
                <button
                  onClick={() => onSelectPersonFilter(selectedEdgeData.targetNode?.label || '')}
                  className="flex-1 px-3 py-1.5 bg-[#0F172A] hover:bg-zinc-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  Filtrar no Extrato
                </button>
              )}

              {onAddNoteToReport && selectedEdgeData.edge.data?.detalhe && (
                <button
                  onClick={() =>
                    onAddNoteToReport(
                      `[Elo Transacional] ${selectedEdgeData.sourceNode?.label || 'Origem'} ⇄ ${
                        selectedEdgeData.targetNode?.label || 'Destino'
                      }: ${selectedEdgeData.edge.data?.quantidade || 1}x, R$ ${(
                        selectedEdgeData.edge.data?.valor || 0
                      ).toLocaleString('pt-BR')} (${selectedEdgeData.edge.data?.detalhe})`
                    )
                  }
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                  title="Inserir no Parecer"
                >
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  + Parecer
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Bottom Color & Typology Legend Bar */}
      <div className="bg-[#FFFFFF] border-t border-[#E2E8F0] px-4 py-2.5 z-10 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs">
          {/* Legend Title */}
          <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-[11px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="uppercase tracking-wider text-zinc-500 font-extrabold text-[10px]">Padrão Topológico PLD:</span>
          </div>

          {/* Color Items Grid/Flex */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-700 font-medium">
            {/* Investigated / Critical Target */}
            <div className="flex items-center gap-1.5 bg-red-50/80 px-2 py-0.5 rounded border border-red-200">
              <span className="w-4 h-4 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </span>
              <span className="font-bold text-red-900">Alvo Crítico</span>
            </div>

            {/* CC Hub */}
            <div className="flex items-center gap-1.5 bg-[#FFCC01]/15 px-2 py-0.5 rounded border border-[#E5B700]">
              <span className="w-4 h-4 rounded-full bg-[#111827] text-[#FFCC01] font-black text-[7.5px] flex items-center justify-center shadow-2xs">
                CC
              </span>
              <span className="font-bold text-zinc-950">HUB Conta Corrente</span>
            </div>

            {/* Family Members */}
            <div className="flex items-center gap-1.5 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-600 flex items-center justify-center text-white text-[8px] font-bold shadow-2xs">
                ●
              </span>
              <span className="font-bold text-emerald-900">Familiares</span>
            </div>

            {/* Companies */}
            <div className="flex items-center gap-1.5 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-600 flex items-center justify-center text-white text-[8px] font-bold shadow-2xs">
                ●
              </span>
              <span className="font-bold text-amber-900">Empresas & PJs</span>
            </div>

            {/* Non-Family / Third-Party */}
            <div className="flex items-center gap-1.5 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
              <span className="w-3.5 h-3.5 rounded-full bg-zinc-400 border border-zinc-500 flex items-center justify-center text-white text-[8px] font-bold shadow-2xs">
                ●
              </span>
              <span className="font-bold text-zinc-800">Terceiros / ATMs</span>
            </div>

            {/* Edge Indicators */}
            <div className="flex items-center gap-3 pl-2 border-l border-zinc-300 text-[10.5px]">
              <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                <ArrowLeftRight className="w-3 h-3 text-zinc-800 stroke-[2.5]" />
                <span className="text-zinc-700 font-bold">⇄ Bidirecional (Recíproco)</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                <ArrowRight className="w-3 h-3 text-slate-700 stroke-[2.5]" />
                <span className="text-zinc-700 font-bold">→ Unidirecional</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 text-white px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                64x
                <span className="text-slate-300 font-sans font-normal ml-0.5 text-[9.5px]">Qtd. Transações</span>
              </div>

              <div className="flex items-center gap-1 bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded border border-zinc-300 font-mono font-bold text-[10px]">
                R$ Volume
                <span className="text-zinc-600 font-sans font-normal ml-0.5 text-[9.5px]">(Espessura)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
