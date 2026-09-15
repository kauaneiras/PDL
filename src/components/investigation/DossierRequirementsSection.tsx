import React, { useState } from 'react';
import {
  CategoriaPublicoDossie,
  ValidacaoCategoriaDossie,
  ItemValidacaoDossie,
  CasoInvestigacao
} from '../../types';
import {
  CATEGORIAS_DOSSIE_DEFINITIONS,
  buildDossierValidationForCategory,
  calculateDossierStatus
} from '../../utils/dossierRequirementsHelper';
import { HelpTooltip } from '../common/HelpTooltip';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileCheck,
  ShieldAlert,
  UserCheck,
  FileSignature,
  Baby,
  Briefcase,
  ClockAlert,
  User
} from 'lucide-react';

interface DossierRequirementsSectionProps {
  caso: CasoInvestigacao;
  onUpdateValidation: (validation: ValidacaoCategoriaDossie) => void;
  onInsertEvidenceToNotes?: (text: string) => void;
}

export const DossierRequirementsSection: React.FC<DossierRequirementsSectionProps> = ({
  caso,
  onUpdateValidation,
  onInsertEvidenceToNotes
}) => {
  // Categoria atual ou inferida
  const initialCategory: CategoriaPublicoDossie =
    caso.validacaoDossie?.categoria || caso.categoriaDossie || 'PEP';

  const [selectedCategory, setSelectedCategory] = useState<CategoriaPublicoDossie>(initialCategory);

  const [validationState, setValidationState] = useState<ValidacaoCategoriaDossie>(() => {
    return buildDossierValidationForCategory(selectedCategory, caso.validacaoDossie);
  });

  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'PENDENTE' | 'CONFORME' | 'NAO_CONFORME'>('TODOS');
  const [activeItemDetails, setActiveItemDetails] = useState<string | null>(null);

  // Troca de categoria
  const handleCategoryChange = (newCat: CategoriaPublicoDossie) => {
    setSelectedCategory(newCat);
    const newValidation = buildDossierValidationForCategory(newCat);
    setValidationState(newValidation);
    onUpdateValidation(newValidation);
  };

  // Alterar status de um item de validação
  const handleToggleItemStatus = (
    itemId: string,
    newStatus: 'CONFORME' | 'PENDENTE' | 'NAO_CONFORME' | 'NAO_APLICAVEL'
  ) => {
    const updatedItens: ItemValidacaoDossie[] = validationState.itens.map((it) => {
      if (it.id === itemId) {
        return {
          ...it,
          status: newStatus,
          dataValidacao: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          validador: caso.analistaNome || 'Analista PLD'
        };
      }
      return it;
    });

    const newStatusGeral = calculateDossierStatus(updatedItens);
    const updatedValidation: ValidacaoCategoriaDossie = {
      ...validationState,
      statusGeral: newStatusGeral,
      itens: updatedItens
    };

    setValidationState(updatedValidation);
    onUpdateValidation(updatedValidation);
  };

  // Atualizar observação técnica do item
  const handleUpdateItemObs = (itemId: string, obs: string) => {
    const updatedItens = validationState.itens.map((it) => {
      if (it.id === itemId) {
        return { ...it, observacoes: obs };
      }
      return it;
    });
    const updatedValidation: ValidacaoCategoriaDossie = {
      ...validationState,
      itens: updatedItens
    };
    setValidationState(updatedValidation);
    onUpdateValidation(updatedValidation);
  };

  const currentDef = CATEGORIAS_DOSSIE_DEFINITIONS[selectedCategory] || CATEGORIAS_DOSSIE_DEFINITIONS.DEMAIS_RECURSO_PROPRIO;

  // Estatísticas dos itens
  const conformesCount = validationState.itens.filter((i) => i.status === 'CONFORME').length;
  const pendentesCount = validationState.itens.filter((i) => i.status === 'PENDENTE').length;
  const naoConformesCount = validationState.itens.filter((i) => i.status === 'NAO_CONFORME').length;
  const totalItens = validationState.itens.length;

  const filteredItems = validationState.itens.filter((it) => {
    if (filterStatus === 'TODOS') return true;
    return it.status === filterStatus;
  });

  const getCategoryIcon = (cat: CategoriaPublicoDossie) => {
    switch (cat) {
      case 'PEP':
        return <UserCheck className="w-4 h-4 text-purple-700" />;
      case 'REGIAO_MINERACAO_FRONTEIRA':
        return <ShieldAlert className="w-4 h-4 text-amber-700" />;
      case 'RECURSOS_TERCEIROS_PROCURACAO':
        return <FileSignature className="w-4 h-4 text-zinc-700" />;
      case 'MENOR':
        return <Baby className="w-4 h-4 text-rose-700" />;
      case 'FUNCIONARIO_COOPERFORTE':
        return <Briefcase className="w-4 h-4 text-emerald-700" />;
      case 'LIMOC':
        return <ClockAlert className="w-4 h-4 text-orange-700" />;
      default:
        return <User className="w-4 h-4 text-zinc-700" />;
    }
  };

  return (
    <div className="space-y-3.5 text-xs font-sans">
      {/* 1. Category Selector Ribbon */}
      <div className="bg-zinc-50 border border-zinc-300 rounded-md p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-zinc-500 font-bold block text-[11px]">Enquadramento do Público do Dossiê</span>
            <div className="flex items-center gap-2 mt-0.5">
              {getCategoryIcon(selectedCategory)}
              <h3 className="font-bold text-sm text-zinc-900">{currentDef.titulo}</h3>
              <HelpTooltip
                title={currentDef.titulo}
                content={currentDef.focoExigencias}
                baseRegulatoria={currentDef.baseRegulatoria}
              />
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 text-zinc-800">
                {currentDef.subtitulo}
              </span>
            </div>
          </div>

          {/* Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-zinc-600">Público / Categoria:</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value as CategoriaPublicoDossie)}
              className="bg-white border border-zinc-300 rounded px-2.5 py-1 text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#FFCC01]"
            >
              <option value="PEP">1. PEP & Familiares (Origem da Riqueza / Alta Administração)</option>
              <option value="REGIAO_MINERACAO_FRONTEIRA">2. Região Mineração / Fronteira (Endereço, Licenças & Espécie)</option>
              <option value="RECURSOS_TERCEIROS_PROCURACAO">3. Recursos de Terceiros / Procuração (Beneficiário Final / UBO)</option>
              <option value="MENOR">4. Menor de Idade (Tutores & Suporte Patrimonial dos Pais)</option>
              <option value="FUNCIONARIO_COOPERFORTE">5. Funcionário Cooperforte (Conflito de Interesses & Folha)</option>
              <option value="LIMOC">6. LIMOC (Histórico de Alertas & Atas de Limite Reduzido)</option>
              <option value="DEMAIS_RECURSO_PROPRIO">7. Demais Clientes / Recurso Próprio (KYC Básico)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Compact Status & Filter Tabs */}
      <div className="bg-white border border-zinc-300 rounded-md px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-zinc-500">Status Geral:</span>
          {validationState.statusGeral === 'APROVADO' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Dossiê Aprovado ({conformesCount}/{totalItens} itens)
            </span>
          ) : validationState.statusGeral === 'REPROVADO_IMPEDITIVO' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              Reprovado / Impeditivo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Pendente ({pendentesCount} de {totalItens} pendentes)
            </span>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterStatus('TODOS')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
              filterStatus === 'TODOS'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Todos ({totalItens})
          </button>
          <button
            onClick={() => setFilterStatus('PENDENTE')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
              filterStatus === 'PENDENTE'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Pendentes ({pendentesCount})
          </button>
          <button
            onClick={() => setFilterStatus('CONFORME')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
              filterStatus === 'CONFORME'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Conformes ({conformesCount})
          </button>
          {naoConformesCount > 0 && (
            <button
              onClick={() => setFilterStatus('NAO_CONFORME')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                filterStatus === 'NAO_CONFORME'
                  ? 'bg-red-700 text-white'
                  : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
              }`}
            >
              Não Conformes ({naoConformesCount})
            </button>
          )}
        </div>
      </div>

      {/* 3. Clean Requirements List */}
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`border rounded-md p-3 transition-colors bg-white ${
              item.status === 'CONFORME'
                ? 'border-emerald-200 bg-emerald-50/10'
                : item.status === 'NAO_CONFORME'
                ? 'border-red-200 bg-red-50/10'
                : 'border-zinc-300 hover:border-zinc-400'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              {/* Item Info */}
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-800 font-mono text-[10px] font-bold rounded border border-zinc-200">
                    {item.codigo}
                  </span>
                  <h4 className="font-bold text-zinc-900 text-xs">{item.titulo}</h4>
                </div>

                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  {item.descricaoExigencia}
                </p>

                {item.evidenciaDoc && (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-0.5">
                    <FileCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>Documento / Evidência:</span>
                    <span className="font-mono text-zinc-800 font-semibold bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200">
                      {item.evidenciaDoc}
                    </span>
                  </div>
                )}

                {item.dataValidacao && (
                  <div className="text-[10px] text-zinc-400 pt-0.5">
                    Validado em {item.dataValidacao} por {item.validador}
                  </div>
                )}
              </div>

              {/* Clean Status Selector (Compact Select instead of row of large bright buttons) */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={item.status}
                  onChange={(e) =>
                    handleToggleItemStatus(
                      item.id,
                      e.target.value as 'CONFORME' | 'PENDENTE' | 'NAO_CONFORME' | 'NAO_APLICAVEL'
                    )
                  }
                  className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors cursor-pointer outline-none ${
                    item.status === 'CONFORME'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : item.status === 'NAO_CONFORME'
                      ? 'bg-red-50 border-red-300 text-red-800'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-800'
                  }`}
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="CONFORME">Conforme</option>
                  <option value="NAO_CONFORME">Não Conforme</option>
                  <option value="NAO_APLICAVEL">Não Aplicável</option>
                </select>

                {onInsertEvidenceToNotes && (
                  <button
                    type="button"
                    onClick={() => {
                      const textToInsert = `[VALIDAÇÃO DOSSIÊ - ${item.codigo}] ${item.titulo}: Status ${item.status}. Documento de suporte: ${item.evidenciaDoc || 'N/A'}. Parecer: ${item.observacoes || 'Conforme requisitos regulatórios vigentes.'}`;
                      onInsertEvidenceToNotes(textToInsert);
                    }}
                    title="Anexar apontamento ao texto do parecer"
                    className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-bold border border-zinc-300 transition-colors cursor-pointer"
                  >
                    + Parecer
                  </button>
                )}
              </div>
            </div>

            {/* Optional observation textarea */}
            <div className="mt-2 pt-2 border-t border-zinc-100">
              <input
                type="text"
                value={item.observacoes || ''}
                onChange={(e) => handleUpdateItemObs(item.id, e.target.value)}
                placeholder="Observações do analista sobre esta checagem (opcional)..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-800 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
