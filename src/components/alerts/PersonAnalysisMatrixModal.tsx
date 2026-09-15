import React, { useState, useMemo } from 'react';
import { 
  PERSON_ANALYSIS_ALERTS, 
  PersonAnalysisAlert 
} from '../../data/personAnalysisAlerts';
import { CasoInvestigacao } from '../../types';
import { 
  X, 
  Search, 
  ShieldAlert, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  BookOpen,
  Info
} from 'lucide-react';

interface PersonAnalysisMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlert?: (alertId: string) => void;
  casos?: CasoInvestigacao[];
}

export const PersonAnalysisMatrixModal: React.FC<PersonAnalysisMatrixModalProps> = ({
  isOpen,
  onClose,
  onSelectAlert,
  casos = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ATUAL' | 'NOVO'>('ALL');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const categorias = useMemo(() => {
    const cats = new Set<string>();
    PERSON_ANALYSIS_ALERTS.forEach((a) => cats.add(a.categoria));
    return Array.from(cats);
  }, []);

  const countsPerAlert = useMemo(() => {
    const map: Record<string, number> = {};
    PERSON_ANALYSIS_ALERTS.forEach((al) => {
      map[al.id] = casos.filter((c) => al.matchFn(c)).length;
    });
    return map;
  }, [casos]);

  const filteredAlerts = useMemo(() => {
    return PERSON_ANALYSIS_ALERTS.filter((item) => {
      const matchesSearch = 
        item.filtroAlerta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.acaoPratica.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.focoAcao.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'ALL' ? true : item.status === statusFilter;

      const matchesCategory = 
        categoriaFilter === 'ALL' ? true : item.categoria === categoriaFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchTerm, statusFilter, categoriaFilter]);

  const currentCount = PERSON_ANALYSIS_ALERTS.filter(a => a.status === 'ATUAL').length;
  const newCount = PERSON_ANALYSIS_ALERTS.filter(a => a.status === 'NOVO').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-lg shadow-2xl border border-zinc-300 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden"
        id="person-analysis-matrix-modal"
      >
        {/* Modal Header */}
        <div className="p-5 bg-[#111827] text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-[#FFCC01] flex items-center justify-center text-black font-black shadow-xs">
              <ShieldAlert className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold tracking-tight text-white uppercase">
                  Matriz de Diretrizes para Análise de Pessoas
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-800 text-[#FFCC01] border border-zinc-700">
                  16 Tipologias & Ações Práticas
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Roteiro vinculante de atuação do analista PLD para triagem e fundamentação de pareceres técnicos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Subheader */}
        <div className="p-3.5 bg-zinc-50 border-b border-zinc-200 space-y-2.5">
          {/* Quick metric chips */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-xs font-medium text-zinc-600">
              <span className="font-bold text-zinc-800">Status:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded text-xs transition font-bold cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-100'
                }`}
              >
                Todos ({PERSON_ANALYSIS_ALERTS.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ATUAL')}
                className={`px-2.5 py-1 rounded text-xs transition font-bold flex items-center space-x-1 cursor-pointer ${
                  statusFilter === 'ATUAL'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Atual ({currentCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('NOVO')}
                className={`px-2.5 py-1 rounded text-xs transition font-bold flex items-center space-x-1 cursor-pointer ${
                  statusFilter === 'NOVO'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Novo ({newCount})</span>
              </button>
            </div>

            <div className="flex items-center space-x-1.5 text-[11px] text-zinc-500">
              <Info className="w-3.5 h-3.5 text-zinc-600" />
              <span>Conforme Circular BACEN 3.978/2020 e Carta Circular 4.001/2020</span>
            </div>
          </div>

          {/* Search and Category filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por alerta, ação prática, categoria ou palavra-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800 text-zinc-900"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 text-xs text-zinc-400 hover:text-zinc-600"
                >
                  Limpar
                </button>
              )}
            </div>

            <div>
              <select
                value={categoriaFilter}
                onChange={(e) => setCategoriaFilter(e.target.value)}
                className="w-full py-1.5 px-3 text-xs bg-white border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800 text-zinc-900"
              >
                <option value="ALL">Todas as Categorias ({categorias.length})</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <Filter className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
              <p className="font-bold text-zinc-700">Nenhuma diretriz encontrada para os filtros selecionados.</p>
              <p className="text-xs text-zinc-500 mt-1">Tente remover termos de busca ou selecionar "Todos".</p>
            </div>
          ) : (
            <div className="border border-zinc-200 rounded overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-700 text-[11px] uppercase tracking-wider font-bold border-b border-zinc-200">
                    <th className="py-2.5 px-3.5 w-1/5">Filtro (Alerta)</th>
                    <th className="py-2.5 px-3.5 w-36">Categoria</th>
                    <th className="py-2.5 px-3.5 w-24 text-center">Status</th>
                    <th className="py-2.5 px-3.5">Ação Prática do Analista</th>
                    <th className="py-2.5 px-3.5 w-28 text-center">Fila / Casos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-xs">
                  {filteredAlerts.map((item) => {
                    const matchCount = countsPerAlert[item.id] || 0;
                    return (
                      <tr 
                        key={item.id}
                        className={`hover:bg-zinc-50 transition group ${
                          item.status === 'NOVO' ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* Filtro (Alerta) */}
                        <td className="py-3 px-3.5 align-top">
                          <div className="font-bold text-[#111827] group-hover:text-black transition">
                            {item.filtroAlerta}
                          </div>
                          <div className="text-[10.5px] text-zinc-500 mt-0.5 line-clamp-1">
                            {item.focoAcao}
                          </div>
                        </td>

                        {/* Categoria */}
                        <td className="py-3 px-3.5 align-top">
                          <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {item.categoria}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3.5 align-top text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-bold ${
                            item.status === 'ATUAL'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {item.statusLabel}
                          </span>
                        </td>

                        {/* Ação Prática do Analista */}
                        <td className="py-3 px-3.5 align-top">
                          <div className="text-zinc-800 text-xs leading-relaxed">
                            {item.acaoPratica}
                          </div>
                        </td>

                        {/* Casos na Fila & Ação */}
                        <td className="py-3 px-3.5 align-top text-center">
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              matchCount > 0 
                                ? 'bg-[#FFCC01] text-black border border-[#E5B700]' 
                                : 'bg-zinc-100 text-zinc-500'
                            }`}>
                              {matchCount} {matchCount === 1 ? 'caso' : 'casos'}
                            </span>
                            {onSelectAlert && (
                              <button
                                onClick={() => {
                                  onSelectAlert(item.id);
                                  onClose();
                                }}
                                className="text-[11px] text-zinc-800 hover:text-black font-bold flex items-center space-x-1 hover:underline pt-0.5 cursor-pointer"
                              >
                                <span>Filtrar</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-zinc-500" />
            <span>
              Exibindo <strong>{filteredAlerts.length}</strong> de <strong>{PERSON_ANALYSIS_ALERTS.length}</strong> diretrizes normativas.
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-white border border-zinc-300 text-zinc-800 font-bold rounded hover:bg-zinc-100 transition shadow-2xs text-xs cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
