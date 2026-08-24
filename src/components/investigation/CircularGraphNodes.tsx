import React from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { GraphNodeData, AttributeType } from '../../types';
import {
  User,
  Building2,
  Globe2,
  PiggyBank,
  Search,
  Banknote,
  Newspaper,
  Home,
  CreditCard,
  Lock,
  AlertTriangle
} from 'lucide-react';

// 1. Investigated Main Target / Secondary Target (Double concentric red/pink circle)
export const CircularMainNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as GraphNodeData;
  const isHighRisk = nodeData.type === 'HIGH_RISK';

  return (
    <div className="relative group cursor-pointer">
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-red-500 !border-0 !opacity-0" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-red-500 !border-0 !opacity-0" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-red-500 !border-0 !opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-red-500 !border-0 !opacity-0" />

      {/* Concentric Double Circle Outer Ring */}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
          selected
            ? 'ring-4 ring-red-400 ring-offset-2 scale-110 shadow-lg'
            : 'hover:scale-105 shadow-md'
        } ${isHighRisk ? 'bg-red-100/90 border-2 border-red-500' : 'bg-red-100/90 border-2 border-red-400'}`}
      >
        {/* Inner concentric ring */}
        <div className="w-10 h-10 rounded-full bg-red-400/30 border border-red-400 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-xs">
            <User className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Floating Mini Label on Hover / Selection */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap z-20 pointer-events-none text-center">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#0C0A00] text-white shadow-md block border border-red-500">
          {nodeData.label}
        </span>
        {nodeData.subLabel && (
          <span className="text-[9px] font-bold text-red-700 bg-white/90 px-1.5 py-0.2 rounded mt-0.5 inline-block shadow-2xs border border-red-200">
            {nodeData.subLabel}
          </span>
        )}
      </div>
    </div>
  );
};

// 2. Hub Node - Bank Account / Checking Account "CC"
export const CircularHubNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as GraphNodeData;

  return (
    <div className="relative group cursor-pointer">
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-sky-600 !border-0 !opacity-0" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-sky-600 !border-0 !opacity-0" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-sky-600 !border-0 !opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-sky-600 !border-0 !opacity-0" />

      {/* Blue Concentric Circle with "CC" in center */}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 bg-blue-50 border-2 border-blue-600 ${
          selected
            ? 'ring-4 ring-blue-400 ring-offset-2 scale-110 shadow-lg'
            : 'hover:scale-105 shadow-md'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm tracking-tight border-2 border-white shadow-xs">
          CC
        </div>
      </div>

      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap z-20 pointer-events-none text-center">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-900 text-white shadow-md block border border-blue-400">
          {nodeData.label || 'Conta Corrente Principal'}
        </span>
        <span className="text-[9px] font-semibold text-blue-800 bg-white/95 px-1.5 py-0.2 rounded mt-0.5 inline-block shadow-2xs border border-blue-200">
          {nodeData.subLabel || 'HUB de Movimentação'}
        </span>
      </div>
    </div>
  );
};

// 3. Circular Person Node (Family = Green, Company = Orange, Non-Family/Third-Party = Grey, High-Risk = Red/Pink)
export const CircularPersonNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as GraphNodeData;
  const rel = nodeData.relationType || (nodeData.type === 'FAMILY' ? 'familiar' : nodeData.type === 'COMPANY' ? 'empresa' : 'nao_familiar');

  let outerBg = 'bg-gray-100 border-gray-400 text-gray-700';
  let innerBg = 'bg-gray-400 text-white';
  let tagColor = 'bg-gray-800 text-white border-gray-400';
  let subColor = 'text-gray-700 border-gray-300';
  let icon = <User className="w-3.5 h-3.5 stroke-[2.2]" />;

  if (rel === 'familiar' || nodeData.type === 'FAMILY') {
    outerBg = 'bg-emerald-100 border-emerald-500';
    innerBg = 'bg-emerald-500 text-white';
    tagColor = 'bg-emerald-800 text-white border-emerald-400';
    subColor = 'text-emerald-800 border-emerald-300 bg-emerald-50';
    icon = <User className="w-3.5 h-3.5 stroke-[2.5]" />;
  } else if (rel === 'empresa' || nodeData.type === 'COMPANY') {
    outerBg = 'bg-amber-100 border-amber-500';
    innerBg = 'bg-amber-500 text-white';
    tagColor = 'bg-amber-800 text-white border-amber-400';
    subColor = 'text-amber-800 border-amber-300 bg-amber-50';
    icon = <Building2 className="w-3.5 h-3.5 stroke-[2.2]" />;
  } else if (rel === 'alto_risco' || nodeData.type === 'HIGH_RISK') {
    outerBg = 'bg-red-100 border-red-500';
    innerBg = 'bg-red-500 text-white';
    tagColor = 'bg-red-800 text-white border-red-400';
    subColor = 'text-red-800 border-red-300 bg-red-50';
    icon = <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />;
  }

  return (
    <div className="relative group cursor-pointer">
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-transparent !border-0 !opacity-0" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-transparent !border-0 !opacity-0" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-transparent !border-0 !opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-transparent !border-0 !opacity-0" />

      {/* Circular Node with Colored Center */}
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${outerBg} ${
          selected
            ? 'ring-4 ring-amber-400 ring-offset-2 scale-110 shadow-lg'
            : 'hover:scale-110 shadow-xs'
        }`}
      >
        <div className={`w-7 h-7 rounded-full ${innerBg} flex items-center justify-center shadow-2xs border border-white/60`}>
          {icon}
        </div>
      </div>

      {/* Hover Info Tooltip */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap z-20 pointer-events-none text-center">
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shadow-md block border ${tagColor}`}>
          {nodeData.label}
        </span>
        {nodeData.subLabel && (
          <span className={`text-[8.5px] font-semibold px-1.5 py-0.2 rounded mt-0.5 inline-block shadow-2xs border ${subColor}`}>
            {nodeData.subLabel}
          </span>
        )}
      </div>
    </div>
  );
};

// 4. Circular Attribute Node (Left Satellites: Globe, Piggy, Search, Cash, News, House, Card)
export const CircularAttributeNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as GraphNodeData;
  const attrType: AttributeType = nodeData.attributeType || 'search';

  let bgColor = 'bg-zinc-500';
  let borderColor = 'border-zinc-400';
  let icon = <Search className="w-3.5 h-3.5 text-white" />;

  switch (attrType) {
    case 'globe':
      bgColor = 'bg-blue-800';
      borderColor = 'border-blue-600';
      icon = <Globe2 className="w-3.5 h-3.5 text-white" />;
      break;
    case 'piggy':
      bgColor = 'bg-sky-600';
      borderColor = 'border-sky-400';
      icon = <PiggyBank className="w-3.5 h-3.5 text-white" />;
      break;
    case 'search':
      bgColor = 'bg-zinc-600';
      borderColor = 'border-zinc-400';
      icon = <Search className="w-3.5 h-3.5 text-white" />;
      break;
    case 'cash':
      bgColor = 'bg-blue-700';
      borderColor = 'border-blue-500';
      icon = <Banknote className="w-3.5 h-3.5 text-white" />;
      break;
    case 'news':
      bgColor = 'bg-zinc-500';
      borderColor = 'border-zinc-400';
      icon = <Newspaper className="w-3.5 h-3.5 text-white" />;
      break;
    case 'house':
      bgColor = 'bg-zinc-600';
      borderColor = 'border-zinc-400';
      icon = <Home className="w-3.5 h-3.5 text-white" />;
      break;
    case 'card':
      bgColor = 'bg-blue-800';
      borderColor = 'border-blue-600';
      icon = <CreditCard className="w-3.5 h-3.5 text-white" />;
      break;
  }

  return (
    <div className="relative group cursor-pointer">
      <Handle type="target" position={Position.Right} className="!w-2 !h-2 !bg-transparent !border-0 !opacity-0" />
      <Handle type="source" position={Position.Left} className="!w-2 !h-2 !bg-transparent !border-0 !opacity-0" />

      <div
        className={`w-10 h-10 rounded-full ${bgColor} border-2 ${borderColor} flex items-center justify-center transition-all duration-300 shadow-md ${
          selected ? 'ring-4 ring-amber-400 scale-110' : 'hover:scale-110'
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap z-20 pointer-events-none text-center">
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#111827] text-white shadow-md block border border-zinc-500">
          {nodeData.label}
        </span>
        {nodeData.detalheAtributo && (
          <span className="text-[8.5px] font-medium bg-white/95 text-zinc-800 px-1.5 py-0.2 rounded mt-0.5 inline-block shadow-2xs border border-zinc-200">
            {nodeData.detalheAtributo}
          </span>
        )}
      </div>
    </div>
  );
};
