import React, { useState, useMemo } from 'react';
import { useAml } from '../../context/AmlContext';
import { exportarLoteXml, exportarLoteCsv } from '../../utils/pldV2Helper';
import { X, Download, FileCode2, FileSpreadsheet, CheckCircle2, ShieldAlert, Calendar, UserCheck, AlertTriangle, ExternalLink } from 'lucide-react';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPeriod?: string;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  initialPeriod = '08/2026'
}) => {
  const { casos, registrarExportacao, showToast, navigateTo } = useAml();

  const [periodo, setPeriodo] = useState(initialPeriod);
  const [formato, setFormato] = useState<'XML' | 'CSV' | 'GECAN'>('XML');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'CONCLUIDAS' | 'COMUNICADO_COAF' | 'PENDENTES'>('TODOS');
  const [filtroRisco, setFiltroRisco] = useState<'TODOS' | 'CRITICO' | 'ALTO_E_CRITICO'>('TODOS');
  const [finalidade, setFinalidade] = useState('Remessa Regulatória Mensal - SISCOAF / BACEN');

  const casosFiltrados = useMemo(() => {
    return casos.filter((c) => {
      // Período
      if (periodo !== 'TODOS' && c.dataReferencia && c.dataReferencia !== periodo) {
        return false;
      }
      // Se formato for GECAN, filtra apenas cooperados com demanda de atualização cadastral
      if (formato === 'GECAN') {
        const fatorIncomp = c.capacidadeFinanceira?.fatorIncompatibilidade || 1;
        const tipoComp = c.capacidadeFinanceira?.tipoComprovacao || '';
        return c.demandaAtualizacaoGecan || fatorIncomp > 3 || tipoComp === 'Não Comprovada' || tipoComp === 'Extrato Bancário';
      }
      // Status
      if (filtroStatus === 'CONCLUIDAS' && c.status !== 'Comunicado COAF' && c.status !== 'Arquivado') {
        return false;
      }
      if (filtroStatus === 'COMUNICADO_COAF' && c.status !== 'Comunicado COAF') {
        return false;
      }
      if (filtroStatus === 'PENDENTES' && (c.status === 'Comunicado COAF' || c.status === 'Arquivado')) {
        return false;
      }
      // Risco
      if (filtroRisco === 'CRITICO' && c.risco !== 'Crítico') {
        return false;
      }
      if (filtroRisco === 'ALTO_E_CRITICO' && c.risco !== 'Crítico' && c.risco !== 'Alto') {
        return false;
      }
      return true;
    });
  }, [casos, periodo, filtroStatus, filtroRisco, formato]);

  // Checagem de assinatura DIREX para XML (RF-14, RF-09)
  const pendentesDirexParaXml = useMemo(() => {
    if (formato !== 'XML') return [];
    return casosFiltrados.filter(
      (c) => c.status === 'Aguardando Assinatura DIREX' || (c.status === 'Comunicado COAF' && !c.deliberacaoDirex?.aprovadoPor)
    );
  }, [casosFiltrados, formato]);

  const casosAptosParaXml = useMemo(() => {
    if (formato !== 'XML') return casosFiltrados;
    return casosFiltrados.filter((c) => !!c.deliberacaoDirex?.aprovadoPor);
  }, [casosFiltrados, formato]);

  const volumeTotal = useMemo(() => {
    const list = formato === 'XML' ? casosAptosParaXml : casosFiltrados;
    return list.reduce((acc, c) => acc + (c.volumeAtipicoPeriodo || c.valorEnvolvido || 0), 0);
  }, [casosFiltrados, casosAptosParaXml, formato]);

  if (!isOpen) return null;

  const handleExport = () => {
    const targetCases = formato === 'XML' ? casosAptosParaXml : casosFiltrados;

    if (targetCases.length === 0) {
      if (formato === 'XML' && pendentesDirexParaXml.length > 0) {
        showToast('Não há dossiês com assinatura DIREX homologada. É obrigatório aprovar na esteira DIREX antes de exportar o XML (RF-14).', 'error');
      } else {
        showToast('Nenhuma ficha encontrada com os filtros selecionados.', 'warning');
      }
      return;
    }

    let fileContent = '';
    let fileName = '';
    let mimeType = '';

    const sanitizedPeriod = periodo.replace('/', '_');

    if (formato === 'XML') {
      fileContent = exportarLoteXml(targetCases, periodo);
      fileName = `lote_cooperforte_siscoaf_${sanitizedPeriod}.xml`;
      mimeType = 'application/xml;charset=utf-8;';
    } else if (formato === 'CSV') {
      fileContent = exportarLoteCsv(targetCases, periodo);
      fileName = `lote_cooperforte_relatorio_${sanitizedPeriod}.csv`;
      mimeType = 'text/csv;charset=utf-8;';
    } else if (formato === 'GECAN') {
      const header = 'CPF;MATRICULA;NOME;PROFISSAO;CIDADE_UF;RENDA_DECLARADA;TIPO_COMPROVACAO;FATOR_INCOMPATIBILIDADE;VOLUME_ATIPICO;RECOMENDACAO_ATUALIZACAO;DATA_DEMANDA\n';
      const rows = targetCases.map((c) => {
        return [
          `"${c.cpf}"`,
          `"${c.matricula}"`,
          `"${c.nome}"`,
          `"${c.kyc?.profissao || c.perfil}"`,
          `"${c.kyc?.cidadeUf || ''}"`,
          c.capacidadeFinanceira?.rendaDeclarada || c.renda,
          `"${c.capacidadeFinanceira?.tipoComprovacao || 'Não Comprovada'}"`,
          c.capacidadeFinanceira?.fatorIncompatibilidade || 1,
          c.volumeAtipicoPeriodo || c.valorEnvolvido,
          `"${c.decisaoGecanDetalhada?.recomendacaoGecan || 'Renovação cadastral de renda e patrimônio com holerite/DIRPF.'}"`,
          new Date().toLocaleDateString('pt-BR')
        ].join(';');
      }).join('\n');
      fileContent = '\uFEFF' + header + rows;
      fileName = `demanda_gecan_atualizacao_cadastral_${sanitizedPeriod}.csv`;
      mimeType = 'text/csv;charset=utf-8;';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    registrarExportacao(
      undefined,
      formato === 'GECAN'
        ? `Demanda GECAN ${periodo} (${targetCases.length} associados)`
        : `Lote ${periodo} (${targetCases.length} fichas)`,
      undefined,
      formato === 'GECAN' ? 'CSV' : formato,
      finalidade
    );

    showToast(`Arquivo gerado em ${formato} com ${targetCases.length} registros exportados com sucesso!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div
        id="modal-exportacao-lote"
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Exportação em Lote (XML / CSV)</h3>
              <p className="text-xs text-slate-500">Envio regulatório consolidado por período de competência</p>
            </div>
          </div>
          <button
            id="btn-fechar-modal-exportacao"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm text-slate-700">
          {/* Format selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Formato do Arquivo de Saída
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                id="btn-formato-xml"
                onClick={() => setFormato('XML')}
                className={`flex flex-col p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  formato === 'XML'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileCode2 className={`w-4 h-4 ${formato === 'XML' ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs">XML SISCOAF</span>
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">Esquema XSD homologado</div>
              </button>

              <button
                type="button"
                id="btn-formato-csv"
                onClick={() => setFormato('CSV')}
                className={`flex flex-col p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  formato === 'CSV'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileSpreadsheet className={`w-4 h-4 ${formato === 'CSV' ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs">CSV Auditoria</span>
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">Planilha para BI & Bacen</div>
              </button>

              <button
                type="button"
                id="btn-formato-gecan"
                onClick={() => {
                  setFormato('GECAN');
                  setFinalidade('Demanda de Atualização Cadastral - GECAN (RF-10)');
                }}
                className={`flex flex-col p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  formato === 'GECAN'
                    ? 'border-amber-600 bg-amber-50/70 text-amber-950 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className={`w-4 h-4 ${formato === 'GECAN' ? 'text-amber-700' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs">GECAN Cadastro</span>
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">Atualização de Renda (RF-10)</div>
              </button>
            </div>
          </div>

          {/* Aviso de Homologação DIREX para XML (RF-14) */}
          {formato === 'XML' && pendentesDirexParaXml.length > 0 && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-950 space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-purple-900">
                  <AlertTriangle className="w-4 h-4 text-purple-700" />
                  Regra de Homologação Executiva DIREX (RF-14 / RF-09)
                </span>
                <span className="bg-purple-200 text-purple-900 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                  {pendentesDirexParaXml.length} pendente(s)
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-purple-800">
                Apenas comunicações homologadas e assinadas com certificado digital pela <strong>Diretoria Executiva (DIREX)</strong> são integradas ao arquivo XML do SISCOAF. Dossiês sem assinatura não serão transmitidos.
              </p>
              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigateTo('/direx');
                  }}
                  className="text-[11px] font-bold text-purple-900 hover:text-purple-950 flex items-center gap-1 underline cursor-pointer"
                >
                  <span>Ir para Fila de Assinatura DIREX</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {formato === 'GECAN' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950">
              <span className="font-bold block mb-0.5">Exportação para Gerência de Cadastro - GECAN (RF-10):</span>
              Gera planilha estruturada com os associados que apresentaram renda incompatível (fator &gt; 3x) ou sem comprovação formal idônea durante o monitoramento PLD/FT para convocação cadastral compulsória.
            </div>
          )}

          {/* Filters grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Período de Referência (Mês)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <select
                  id="select-periodo-export"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="08/2026">08/2026 (Competência Vigente)</option>
                  <option value="07/2026">07/2026 (Mês Anterior)</option>
                  <option value="06/2026">06/2026</option>
                  <option value="TODOS">Todos os períodos cadastrados</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Filtro por Deliberação / Status
              </label>
              <select
                id="select-status-export"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="TODOS">Todas as fichas do período</option>
                <option value="COMUNICADO_COAF">Apenas Comunicadas ao COAF (Comunicação Ativa)</option>
                <option value="CONCLUIDAS">Apenas Concluídas (COAF ou Arquivadas)</option>
                <option value="PENDENTES">Apenas Pendentes / Em Análise</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Filtro por Faixa de Risco
              </label>
              <select
                id="select-risco-export"
                value={filtroRisco}
                onChange={(e) => setFiltroRisco(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="TODOS">Todos os níveis de risco</option>
                <option value="ALTO_E_CRITICO">Alto e Crítico (Score &gt;= 65)</option>
                <option value="CRITICO">Apenas Crítico (Score &gt;= 85)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Finalidade do Relatório (Trilha de Auditoria)
              </label>
              <input
                id="input-finalidade-export"
                type="text"
                value={finalidade}
                onChange={(e) => setFinalidade(e.target.value)}
                placeholder="Ex: Prestação de contas Bacen"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-slate-600">Resumo do Lote Preparado</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Integridade validada
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500">Registros selecionados:</span>
                <div className="text-xl font-bold text-slate-900">{casosFiltrados.length} fichas</div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Volume financeiro total:</span>
                <div className="text-xl font-bold text-emerald-700">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(volumeTotal)}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>Inclui dados de dispositivos, geolocalização e score de fraude</span>
              <span className="font-mono text-slate-600">Hash SHA-256 autogerado</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            id="btn-cancelar-exportacao-lote"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirmar-exportacao-lote"
            onClick={handleExport}
            disabled={casosFiltrados.length === 0}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              casosFiltrados.length === 0
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-xs'
            }`}
          >
            <Download className="w-4 h-4" />
            Exportar {formato} em Lote ({casosFiltrados.length})
          </button>
        </div>
      </div>
    </div>
  );
};
