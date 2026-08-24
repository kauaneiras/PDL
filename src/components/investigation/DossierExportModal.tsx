import React, { useState } from 'react';
import { CasoInvestigacao } from '../../types';
import { buildCooperforteDossier } from '../../utils/cooperforteDossierHelper';
import {
  Printer,
  X,
  FileDown,
  Copy,
  Check
} from 'lucide-react';

interface DossierExportModalProps {
  caso: CasoInvestigacao;
  isOpen?: boolean;
  onClose: () => void;
}

export const DossierExportModal: React.FC<DossierExportModalProps> = ({ caso, isOpen = true, onClose }) => {
  if (!isOpen) return null;

  const dossier = buildCooperforteDossier(caso);
  const [copiedHash, setCopiedHash] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(dossier.hashAutenticidade);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const isAvaliado = dossier.statusAvaliacao === 'AVALIADO';
  const isComunicacaoCoaf =
    dossier.parte4.deliberacaoTipo === 'COMUNICAR_COAF' ||
    dossier.parte4.deliberacaoTipo === 'BLOQUEIO_CAUTELAR';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto font-sans print:p-0 print:bg-white print:static">
      <div className="bg-white border border-zinc-300 rounded-lg max-w-5xl w-full max-h-[94vh] flex flex-col shadow-xl overflow-hidden text-zinc-900 text-xs print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="px-6 py-3 border-b border-zinc-200 bg-zinc-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Ficha Técnica de Comunicação SISCOAF / COAF
              </h2>
              <span className="text-[10px] text-zinc-400 font-mono">
                {dossier.documentoControle}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Titular: {dossier.parte1.nomeFirma} ({dossier.parte1.cpfCnpj})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-zinc-950 text-xs font-bold transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>Gerar PDF / Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CORPO DO DOCUMENTO REGULATÓRIO - CLEAN, MINIMALISTA, SÉRIO               */}
        {/* ========================================================================= */}
        <div id="coaf-official-sheet" className="p-8 sm:p-10 overflow-y-auto space-y-6 text-zinc-900 text-xs font-sans print:p-0 print:space-y-5 bg-white">
          
          {/* Cabeçalho Institucional & Metadados */}
          <div className="border-b border-zinc-900 pb-4">
            <div className="flex justify-between items-start text-[10px] text-zinc-500 font-mono uppercase pb-2 border-b border-zinc-200 mb-3">
              <span>DOCUMENTO DE CARÁTER CONFIDENCIAL • LEI Nº 9.613/1998, ART. 10-A</span>
              <span>SISCOAF / BACEN</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="font-bold text-sm text-zinc-950 uppercase tracking-tight">
                  COOPERFORTE — COOPERATIVA DE CRÉDITO
                </div>
                <h1 className="text-base font-bold text-zinc-900">
                  COMUNICAÇÃO DE OPERAÇÃO SUSPEITA / ATÍPICA (COS)
                </h1>
                <p className="text-[11px] text-zinc-600">
                  Enquadramento Técnico Conforme Lei nº 9.613/1998, Circular BACEN nº 3.978/2020 e Carta-Circular BACEN nº 4.001/2020
                </p>
              </div>

              <div className="text-[11px] font-mono text-zinc-700 bg-zinc-50 border border-zinc-300 p-2.5 rounded shrink-0 space-y-0.5 min-w-[210px]">
                <div>Doc. Controle: <strong className="text-zinc-950">{dossier.documentoControle}</strong></div>
                <div>Protocolo SISCOAF: <strong className="text-zinc-950">{dossier.protocoloSiscoaf}</strong></div>
                <div>Data de Emissão: <span className="text-zinc-950">{dossier.dataEmissao}</span></div>
                <div>Recibo COAF: <span className="text-zinc-950">{dossier.numeroRecibo}</span></div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SEÇÃO 1: IDENTIFICAÇÃO DA ENTIDADE COMUNICANTE                            */}
          {/* ========================================================================= */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-300 pb-1">
              1. IDENTIFICAÇÃO DA ENTIDADE COMUNICANTE (INSTITUIÇÃO OBRIGADA)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 p-2.5 bg-zinc-50 border border-zinc-200 text-[11px]">
              <div className="sm:col-span-2">
                <span className="text-zinc-500 block text-[10px]">Razão Social:</span>
                <span className="font-medium text-zinc-950">{dossier.entidadeComunicante.razaoSocial}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">CNPJ:</span>
                <span className="font-mono text-zinc-950">{dossier.entidadeComunicante.cnpj}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Código BACEN:</span>
                <span className="font-mono text-zinc-950">{dossier.entidadeComunicante.codigoBacen}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-zinc-500 block text-[10px]">Unidade Técnica Responsável:</span>
                <span className="text-zinc-950">{dossier.entidadeComunicante.unidadeCompliance}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-zinc-500 block text-[10px]">Órgão Fiscalizador:</span>
                <span className="text-zinc-950">{dossier.entidadeComunicante.orgaoRegulador}</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SEÇÃO 2: QUALIFICAÇÃO CADASTRAL DO INVESTIGADO (KYC / CDD)                 */}
          {/* ========================================================================= */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-300 pb-1">
              2. QUALIFICAÇÃO CADASTRAL DO TITULAR INVESTIGADO (KYC / CDD)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 p-2.5 bg-zinc-50 border border-zinc-200 text-[11px]">
              <div>
                <span className="text-zinc-500 block text-[10px]">Nome Completo:</span>
                <span className="font-bold text-zinc-950">{dossier.parte1.nomeFirma}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">CPF / CNPJ:</span>
                <span className="font-mono font-medium text-zinc-950">{dossier.parte1.cpfCnpj}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Matrícula / Inscrição:</span>
                <span className="font-mono text-zinc-950">{dossier.parte1.inscricaoCooperforte}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Idade / Associação:</span>
                <span className="text-zinc-950">{dossier.parte1.idade} anos • {dossier.parte1.dataAssociacao}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">Documento de Identidade:</span>
                <span className="text-zinc-950">{dossier.parte1.documentoIdentificacao}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Renda Declarada:</span>
                <span className="font-mono font-medium text-zinc-950">{formatCurrency(dossier.parte1.rendaFaturamento)} / mês</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Patrimônio Declarado:</span>
                <span className="font-mono text-zinc-950">{formatCurrency(dossier.parte1.patrimonio)}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Classificação de Risco:</span>
                <span className="font-bold text-zinc-950">{caso.risco} (Score: {caso.scoreRisco}/100)</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-zinc-500 block text-[10px]">Endereço Residencial:</span>
                <span className="text-zinc-950">{dossier.parte1.localResidencia}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-zinc-500 block text-[10px]">Fonte Pagadora / Empregador:</span>
                <span className="text-zinc-950">
                  {dossier.parte1.empregadorFontePagadora.razaoSocial} (CNPJ: {dossier.parte1.empregadorFontePagadora.cnpj})
                </span>
              </div>

              {/* Status PEP, Servidor e CSNU */}
              <div className="p-2 bg-white border border-zinc-200 rounded">
                <span className="text-zinc-500 block text-[10px]">Pessoa Exposta Politicamente (PEP):</span>
                <span className="font-bold text-zinc-950">
                  {dossier.parte1.classificacaoPep.isPep ? 'SIM' : 'NÃO'}
                </span>
                <p className="text-[10px] text-zinc-600 mt-0.5">{dossier.parte1.classificacaoPep.detalhe}</p>
              </div>

              <div className="p-2 bg-white border border-zinc-200 rounded">
                <span className="text-zinc-500 block text-[10px]">Servidor Público:</span>
                <span className="font-bold text-zinc-950">
                  {dossier.parte1.classificacaoServidorPublico.isServidor ? `SIM (${dossier.parte1.classificacaoServidorPublico.esfera})` : 'NÃO'}
                </span>
                <p className="text-[10px] text-zinc-600 mt-0.5">Vínculo: {dossier.parte1.vinculoAssociacao}</p>
              </div>

              <div className="p-2 bg-white border border-zinc-200 rounded">
                <span className="text-zinc-500 block text-[10px]">Lista de Sanções CSNU:</span>
                <span className="font-bold text-zinc-950">
                  {dossier.parte1.presencaCsnu.isListed ? 'SIM (CONSTA)' : 'NÃO CONSTA'}
                </span>
                <p className="text-[10px] text-zinc-600 mt-0.5">{dossier.parte1.presencaCsnu.detalhe}</p>
              </div>

              <div className="p-2 bg-white border border-zinc-200 rounded">
                <span className="text-zinc-500 block text-[10px]">Limite Operacional LIMOC:</span>
                <span className="font-mono font-medium text-zinc-950">{formatCurrency(dossier.parte2.indicadorLimoc.limiteOperacional)}</span>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  Utilização: {formatCurrency(dossier.parte2.indicadorLimoc.utilizacaoAtual)}
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SEÇÃO 3: DIAGNÓSTICO DA ATIPICIDADE FINANCEIRA                            */}
          {/* ========================================================================= */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-300 pb-1">
              3. DIAGNÓSTICO DA ATIPICIDADE FINANCEIRA (GATILHO PLD/FT)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-zinc-50 border border-zinc-200 text-[11px]">
              <div className="p-2 bg-white border border-zinc-200 rounded">
                <span className="text-zinc-500 block text-[10px]">Saldo Anterior:</span>
                <span className="font-mono font-medium text-zinc-950">{formatCurrency(dossier.parte3.saldoAnterior)}</span>
              </div>
              <div className="p-2 bg-white border border-zinc-200 rounded">
                <span className="text-zinc-500 block text-[10px]">Total de Créditos:</span>
                <span className="font-mono font-bold text-zinc-950">{formatCurrency(dossier.parte3.totalCredito)}</span>
              </div>
              <div className="p-2 bg-white border border-zinc-200 rounded">
                <span className="text-zinc-500 block text-[10px]">Total de Débitos:</span>
                <span className="font-mono font-bold text-zinc-950">{formatCurrency(dossier.parte3.totalDebito)}</span>
              </div>
              <div className="p-2 bg-white border border-zinc-200 rounded">
                <span className="text-zinc-500 block text-[10px]">Saldo Posterior:</span>
                <span className="font-mono font-medium text-zinc-950">{formatCurrency(dossier.parte3.saldoAtual)}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-zinc-500 block text-[10px]">Regra Disparada:</span>
                <span className="font-bold text-zinc-950">{dossier.parte3.regraDisparada}</span>
                <p className="text-[10px] text-zinc-600 mt-0.5">{dossier.parte3.gatilhoAlerta}</p>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">Volume no Período:</span>
                <span className="font-mono font-bold text-zinc-950">{formatCurrency(dossier.parte3.valorAnalisado)}</span>
                <span className="text-[10px] text-zinc-500 block">{dossier.parte3.periodoInicio} a {dossier.parte3.periodoFim}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">Incompatibilidade de Renda:</span>
                <span className="font-mono font-bold text-zinc-950">{dossier.parte3.fatorIncompatibilidade}x</span>
                <span className="text-[10px] text-zinc-500 block">Acima do rendimento mensal</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SEÇÃO 4: AVALIAÇÃO TÉCNICA E DELIBERAÇÃO REGULATÓRIA                      */}
          {/* ========================================================================= */}
          <div className="space-y-2 print:break-inside-avoid">
            <div className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-300 pb-1 flex justify-between">
              <span>4. AVALIAÇÃO TÉCNICA DO ANALISTA E DELIBERAÇÃO REGULATÓRIA</span>
              <span className="font-mono text-zinc-600">{isAvaliado ? '[STATUS: AVALIADO]' : '[STATUS: EM ANÁLISE]'}</span>
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-300 rounded space-y-3 text-[11px]">
              
              {/* Conclusão e Deliberação */}
              <div className="p-2.5 bg-white border border-zinc-300 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                    Deliberação Regulatória:
                  </span>
                  <div className="text-xs font-bold text-zinc-950">
                    {dossier.parte4.deliberacaoFinal}
                  </div>
                </div>

                <div className="text-[11px] font-bold text-zinc-900 border border-zinc-400 bg-zinc-100 px-2.5 py-1 rounded">
                  {dossier.parte4.conclusaoTecnica}
                </div>
              </div>

              {/* Tipologia SISCOAF */}
              <div className="p-2.5 bg-white border border-zinc-200 rounded space-y-0.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                  Tipologia / Enquadramento Regulatório (Catálogo SISCOAF):
                </span>
                <div className="font-medium text-zinc-950">
                  {dossier.parte4.tipologiaCoaf}
                </div>
                <div className="text-[10px] text-zinc-600">
                  Base Legal: {dossier.parte4.baseLegalEnquadramento}
                </div>
              </div>

              {/* Parecer Técnico Circunstanciado */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                  Parecer Técnico Circunstanciado:
                </span>
                <div className="p-3 bg-white border border-zinc-200 rounded text-zinc-900 leading-relaxed font-sans whitespace-pre-line text-[11px]">
                  {dossier.parte4.justificativaEconomicaLegal}
                </div>
              </div>

              {/* Matriz de Verificação dos 7 Pilares */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                  Verificação dos Requisitos de Conformidade (Circular BACEN nº 3.978/2020):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                  {dossier.parte4.checklistVerificacao.map((chk, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 bg-white border border-zinc-200 rounded flex items-center justify-between text-[10px]"
                    >
                      <span className="text-zinc-800 truncate mr-2">{chk.item}</span>
                      <span className={`font-mono text-[9px] font-bold px-1 py-0.5 rounded border ${
                        chk.status
                          ? 'border-zinc-300 bg-zinc-50 text-zinc-800'
                          : 'border-zinc-400 bg-zinc-200 text-zinc-900 font-black'
                      }`}>
                        {chk.status ? '[CONFORME]' : '[ALERTA]'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Despachos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-zinc-300">
                <div className="p-2 bg-white border border-zinc-200 rounded space-y-1">
                  <span className="font-bold text-zinc-950 text-[10px] block">
                    Despacho Gerencial (GECON):
                  </span>
                  <p className="text-[10px] text-zinc-700 leading-normal">
                    {dossier.parte5.despachoGerencial}
                  </p>
                  <div className="text-[9px] text-zinc-500 font-mono pt-0.5">
                    Responsável: {dossier.parte5.gerenteGeralNome} • {dossier.parte5.dataHomologacao}
                  </div>
                </div>

                <div className="p-2 bg-white border border-zinc-200 rounded space-y-1">
                  <span className="font-bold text-zinc-950 text-[10px] block">
                    Deliberação da Diretoria Executiva (DIREX):
                  </span>
                  <p className="text-[10px] text-zinc-700 leading-normal">
                    {dossier.parte6.deliberacaoDiretoria}
                  </p>
                  <div className="text-[9px] text-zinc-500 font-mono pt-0.5">
                    Situação: {dossier.parte6.dadosControleSiscoaf.situacaoEnvio}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* SEÇÃO 5: MATRIZ DE CONTRAPARTES & VÍNCULOS AUDITADOS                      */}
          {/* ========================================================================= */}
          <div className="space-y-1.5 print:break-inside-avoid">
            <div className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-300 pb-1 flex justify-between">
              <span>5. MATRIZ DE CONTRAPARTES E VÍNCULOS AUDITADOS</span>
              <span className="font-mono text-zinc-600">{dossier.anexo2Contrapartes.length} Registros</span>
            </div>

            <div className="border border-zinc-300 rounded overflow-hidden">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-zinc-100 text-zinc-800 uppercase font-bold border-b border-zinc-300">
                  <tr>
                    <th className="p-1.5">Contraparte / Razão Social</th>
                    <th className="p-1.5">CPF / CNPJ</th>
                    <th className="p-1.5">Instituição / Agência / Conta</th>
                    <th className="p-1.5">Vínculo</th>
                    <th className="p-1.5 text-center">Qtd.</th>
                    <th className="p-1.5 text-right">Volume (BRL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {dossier.anexo2Contrapartes.map((c) => (
                    <tr key={c.id} className={c.isSuspeita ? 'bg-zinc-50 font-medium' : ''}>
                      <td className="p-1.5 text-zinc-950">
                        {c.nomeContraparte}
                        {c.isSuspeita && (
                          <span className="ml-1 text-[8.5px] font-mono text-zinc-600 font-bold">
                            [Atípico]
                          </span>
                        )}
                      </td>
                      <td className="p-1.5 font-mono text-zinc-700">{c.cpfCnpj}</td>
                      <td className="p-1.5 font-mono text-zinc-700">{c.banco} • Ag {c.agencia} / CC {c.conta}</td>
                      <td className="p-1.5 text-zinc-700">{c.vinculo}</td>
                      <td className="p-1.5 text-center font-mono">{c.qtdOperacoes}</td>
                      <td className="p-1.5 text-right font-mono font-bold text-zinc-950">
                        {formatCurrency(c.valorTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SEÇÃO 6: EXTRATO ANALÍTICO DAS OPERAÇÕES                                  */}
          {/* ========================================================================= */}
          <div className="space-y-1.5 print:break-inside-avoid">
            <div className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-300 pb-1 flex justify-between">
              <span>6. EXTRATO ANALÍTICO DAS TRANSAÇÕES RELEVANTES</span>
              <span className="font-mono text-zinc-600">{dossier.anexo1Movimentacao.length} Operações</span>
            </div>

            <div className="border border-zinc-300 rounded overflow-hidden">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-zinc-100 text-zinc-800 uppercase font-bold border-b border-zinc-300">
                  <tr>
                    <th className="p-1.5">Data / Hora</th>
                    <th className="p-1.5">Operação</th>
                    <th className="p-1.5">Contraparte / Origem</th>
                    <th className="p-1.5">Diagnóstico Técnico</th>
                    <th className="p-1.5 text-right">Valor (BRL)</th>
                    <th className="p-1.5 text-right">Saldo Posterior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {dossier.anexo1Movimentacao.slice(0, 15).map((row) => (
                    <tr key={row.id} className={row.isSuspeita ? 'bg-zinc-50' : ''}>
                      <td className="p-1.5 font-mono text-zinc-700">{row.data}</td>
                      <td className="p-1.5 font-medium text-zinc-950">{row.transacao}</td>
                      <td className="p-1.5 text-zinc-700">{row.origem}</td>
                      <td className="p-1.5 text-zinc-600">{row.origemDetalhe}</td>
                      <td className="p-1.5 text-right font-mono font-bold text-zinc-950">
                        {row.tipo === 'Crédito' ? '+' : '-'} {formatCurrency(row.valor)}
                      </td>
                      <td className="p-1.5 text-right font-mono text-zinc-700">
                        {row.saldoApos ? formatCurrency(row.saldoApos) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dossier.anexo1Movimentacao.length > 15 && (
                <div className="p-1.5 text-center text-[9px] text-zinc-500 bg-zinc-50 border-t border-zinc-200">
                  Exibindo 15 de {dossier.anexo1Movimentacao.length} transações analisadas no período. Registros completos arquivados no repositório de auditoria.
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SEÇÃO 7: ASSINATURAS E HASH DE AUTENTICIDADE                              */}
          {/* ========================================================================= */}
          <div className="pt-6 border-t border-zinc-900 space-y-5 print:break-inside-avoid">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-[10.5px]">
              <div>
                <div className="h-10 border-b border-zinc-400 max-w-[200px] mx-auto flex items-end justify-center pb-1 font-mono text-zinc-950 font-bold">
                  {dossier.parte4.analistaNome}
                </div>
                <span className="text-[9.5px] text-zinc-600 block mt-1">
                  <strong>{dossier.parte4.analistaCargo}</strong><br />
                  Matrícula: {dossier.parte4.analistaMatricula}
                </span>
              </div>

              <div>
                <div className="h-10 border-b border-zinc-400 max-w-[200px] mx-auto flex items-end justify-center pb-1 font-mono text-zinc-950 font-bold">
                  {dossier.parte5.gerenteGeralNome}
                </div>
                <span className="text-[9.5px] text-zinc-600 block mt-1">
                  <strong>Gerência Executiva GECON / GESIN</strong><br />
                  Homologação Técnica PLD/FT
                </span>
              </div>

              <div>
                <div className="h-10 border-b border-zinc-400 max-w-[200px] mx-auto flex items-end justify-center pb-1 font-mono text-zinc-950 font-bold">
                  DIREX / COOPERFORTE
                </div>
                <span className="text-[9.5px] text-zinc-600 block mt-1">
                  <strong>Diretoria Executiva</strong><br />
                  Autenticação Digital ICP-Brasil
                </span>
              </div>
            </div>

            {/* Hash de Autenticidade Digital */}
            <div className="p-2 bg-zinc-50 border border-zinc-200 rounded flex flex-col sm:flex-row items-center justify-between gap-2 text-[9.5px] font-mono text-zinc-600">
              <div className="truncate">
                <strong className="text-zinc-800">Hash de Autenticidade Digital: </strong>
                <span className="truncate">{dossier.hashAutenticidade}</span>
              </div>
              <button
                onClick={handleCopyHash}
                className="px-2 py-0.5 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-[9.5px] font-sans font-bold flex items-center gap-1 shrink-0 print:hidden transition-colors"
              >
                {copiedHash ? <Check className="w-3 h-3 text-zinc-900" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? 'Copiado' : 'Copiar Hash'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls (Hidden in Print) */}
        <div className="px-6 py-2.5 border-t border-zinc-200 bg-zinc-50 flex justify-between items-center shrink-0 print:hidden text-xs">
          <div className="text-[10.5px] text-zinc-500">
            Documento técnico de conformidade regulatória (Circular BACEN nº 3.978/2020 e Resolução COAF nº 36/2021).
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-zinc-950 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Gerar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
