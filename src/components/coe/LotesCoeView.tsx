import React, { useState, useMemo } from 'react';
import { useAml } from '../../context/AmlContext';
import { mockLotesCoe } from '../../data/mock-data';
import { LoteCoeRegistro } from '../../types';
import {
  Download,
  Send,
  Search,
  Calendar,
  X
} from 'lucide-react';
import { HelpTooltip } from '../common/HelpTooltip';

export const LotesCoeView: React.FC = () => {
  const { showToast, setActiveCaseId, casos } = useAml();

  const [lotes, setLotes] = useState<LoteCoeRegistro[]>(mockLotesCoe);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Transmitidos' | 'PendentesEnvio'>('Todos');

  // Filtro de Data
  const [dataInicio, setDataInicio] = useState<string>('2026-08-01');
  const [dataFim, setDataFim] = useState<string>('2026-08-24');
  const [periodoRapido, setPeriodoRapido] = useState<'Todos' | 'Hoje' | '7D' | '30D' | 'MesAtual'>('MesAtual');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleTransmitirSiscoaf = (id: string) => {
    const protocolo = `COE-2026-BACEN-${Math.floor(1000000 + Math.random() * 9000000)}`;
    setLotes((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            enviadoSiscoaf: true,
            numeroProtocoloSiscoaf: protocolo,
          };
        }
        return item;
      })
    );
    showToast(`Lote COE transmitido com sucesso ao SISCOAF! Protocolo: ${protocolo}`, 'success');
  };

  const handleDownloadXml = (item: LoteCoeRegistro) => {
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<LoteCOE xmlns="http://www.bcb.gov.br/siscoaf/coe/2026">
  <Identificador>${item.id}</Identificador>
  <NumeroAlerta>${item.alertaId}</NumeroAlerta>
  <DataOperacao>${item.dataOperacao}</DataOperacao>
  <InstituicaoResponsavel>Cooperativa de Crédito Central (001)</InstituicaoResponsavel>
  <Titular>
    <CPF_CNPJ>${item.cpfCnpjTitular}</CPF_CNPJ>
    <NomeRazaoSocial>${item.nomeTitular}</NomeRazaoSocial>
    <CidadeUF>${item.cidadeUf}</CidadeUF>
    <Agencia>${item.agencia}</Agencia>
    <Conta>${item.conta}</Conta>
  </Titular>
  <Operacao>
    <Tipo>${item.tipoOperacao}</Tipo>
    <Valor>${item.valor.toFixed(2)}</Valor>
    <Forma>Especie</Forma>
    <EnquadramentoLegal>Art. 49 Circular BACEN 3.978/2020</EnquadramentoLegal>
  </Operacao>
  <DepositantePagador>
    <Identificado>${item.identificacaoDepositante.identificado ? 'SIM' : 'NAO'}</Identificado>
    <CPF_CNPJ>${item.identificacaoDepositante.cpfCnpj || 'NÃO_INFORMADO'}</CPF_CNPJ>
    <Nome>${item.identificacaoDepositante.nome || 'NÃO_INFORMADO'}</Nome>
  </DepositantePagador>
  <StatusTransmissao>${item.enviadoSiscoaf ? 'TRANSMITIDO' : 'PENDENTE_REMESSA'}</StatusTransmissao>
  <ProtocoloSiscoaf>${item.numeroProtocoloSiscoaf || 'GERACAO_LOCAL'}</ProtocoloSiscoaf>
</LoteCOE>`;

    const blob = new Blob([xmlData], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SISCOAF_COE_${item.cpfCnpjTitular.replace(/\D/g, '')}_${Date.now()}.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Arquivo XML do SISCOAF baixado com sucesso!', 'info');
  };

  const filteredLotes = useMemo(() => {
    return lotes.filter((l) => {
      const matchSearch =
        searchTerm === '' ||
        l.nomeTitular.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.cpfCnpjTitular.includes(searchTerm) ||
        l.cidadeUf.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.alertaId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        filtroStatus === 'Todos' ||
        (filtroStatus === 'Transmitidos' && l.enviadoSiscoaf) ||
        (filtroStatus === 'PendentesEnvio' && !l.enviadoSiscoaf);

      // Filtro de Data
      let matchData = true;
      if (periodoRapido !== 'Todos' && l.dataOperacao) {
        const [d, m, y] = l.dataOperacao.split('/');
        if (d && m && y) {
          const itemDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          if (dataInicio && itemDate < dataInicio) matchData = false;
          if (dataFim && itemDate > dataFim) matchData = false;
        }
      }

      return matchSearch && matchStatus && matchData;
    });
  }, [lotes, searchTerm, filtroStatus, dataInicio, dataFim, periodoRapido]);

  const totalEmEspecie = lotes.reduce((acc, curr) => acc + curr.valor, 0);
  const pendentesTransmissao = lotes.filter((l) => !l.enviadoSiscoaf).length;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-16">
      {/* Top Header Banner */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-zinc-950 tracking-tight">
                Lotes COE - Comunicação de Operações em Espécie (SISCOAF)
              </h1>
              <HelpTooltip
                title="Comunicação de Operações em Espécie (COE)"
                content="Comunicação compulsória ao COAF de operações de depósito, saque, aporte ou emissão de instrumentos em espécie de valor igual ou superior a R$ 50.000,00, de forma tempestiva em até 24 horas úteis."
                baseRegulatoria="Art. 49 da Circular BACEN nº 3.978/2020 e Instrução Normativa BACEN nº 18/2020."
              />
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Comunicação compulsória de operações em espécie iguais ou superiores a R$ 50.000,00.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-zinc-100 border border-zinc-300 text-zinc-800 rounded text-xs font-mono font-medium">
              Prazo Legal: 24h úteis
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-zinc-200">
            <div className="text-xs text-zinc-500 font-medium">Volume Total em Espécie (Mês)</div>
            <div className="text-xl font-bold text-zinc-950 font-mono mt-1">{formatCurrency(totalEmEspecie)}</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Operações &gt;= R$ 50.000,00</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-zinc-200">
            <div className="text-xs text-zinc-500 font-medium">Pendentes de Transmissão SISCOAF</div>
            <div className="text-xl font-bold text-zinc-950 font-mono mt-1">{pendentesTransmissao} Lotes</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Aguardando geração e envio de arquivo</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-zinc-200">
            <div className="text-xs text-zinc-500 font-medium">Lotes Transmitidos e Protocolados</div>
            <div className="text-xl font-bold text-zinc-950 font-mono mt-1">{lotes.filter((l) => l.enviadoSiscoaf).length} Lotes</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Recibo SISCOAF gerado</div>
          </div>
        </div>

        {/* Filter bar com Busca, Status e Data */}
        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por Titular, CPF ou Cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded pl-8 pr-3 py-1.5 text-xs text-zinc-900 focus:bg-white focus:border-zinc-400 outline-none"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded border border-zinc-200 text-xs">
              <button
                onClick={() => setFiltroStatus('Todos')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filtroStatus === 'Todos'
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Todos ({lotes.length})
              </button>
              <button
                onClick={() => setFiltroStatus('PendentesEnvio')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filtroStatus === 'PendentesEnvio'
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Pendentes ({pendentesTransmissao})
              </button>
              <button
                onClick={() => setFiltroStatus('Transmitidos')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filtroStatus === 'Transmitidos'
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Transmitidos ({lotes.filter((l) => l.enviadoSiscoaf).length})
              </button>
            </div>

            {/* Filtro de Data */}
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-700">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value);
                  setPeriodoRapido('MesAtual');
                }}
                className="bg-transparent text-xs text-zinc-800 outline-none cursor-pointer"
              />
              <span className="text-zinc-400">até</span>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value);
                  setPeriodoRapido('MesAtual');
                }}
                className="bg-transparent text-xs text-zinc-800 outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Lotes Table */}
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-zinc-100 text-zinc-700 uppercase font-bold border-b border-zinc-200 text-[10px]">
                <tr>
                  <th className="p-3">Data / Alerta</th>
                  <th className="p-3">Titular / Cooperado</th>
                  <th className="p-3">Agência / Conta</th>
                  <th className="p-3">Operação em Espécie</th>
                  <th className="p-3">Depositante / Portador</th>
                  <th className="p-3 text-right">Valor (BRL)</th>
                  <th className="p-3 text-center">Status SISCOAF</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredLotes.map((lote) => {
                  const casoCorrespondente = casos.find(
                    (c) => c.cpf === lote.cpfCnpjTitular || c.alertaId === lote.alertaId
                  );

                  return (
                    <tr key={lote.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3">
                        <div className="font-mono font-medium text-zinc-900">{lote.dataOperacao}</div>
                        <div className="font-mono text-[10px] text-zinc-500">{lote.alertaId}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-zinc-900">{lote.nomeTitular}</div>
                        <div className="font-mono text-zinc-500 text-[11px]">{lote.cpfCnpjTitular}</div>
                        <div className="text-[10px] text-zinc-400">{lote.cidadeUf}</div>
                      </td>

                      <td className="p-3 font-mono text-zinc-700">
                        <div>Ag {lote.agencia}</div>
                        <div>CC {lote.conta}</div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-zinc-900">{lote.tipoOperacao}</span>
                          <HelpTooltip
                            title="Operação em Espécie"
                            content="Operação financeira liquidada ou movimentada em moeda física igual ou superior ao piso normativo de R$ 50.000,00."
                            baseRegulatoria="Art. 49 da Circular BACEN nº 3.978/2020."
                          />
                        </div>
                      </td>

                      <td className="p-3">
                        {lote.identificacaoDepositante.identificado ? (
                          <div>
                            <div className="font-medium text-zinc-900">{lote.identificacaoDepositante.nome}</div>
                            <div className="font-mono text-[10px] text-zinc-500">{lote.identificacaoDepositante.cpfCnpj}</div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                            Não Identificado
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right font-mono font-bold text-zinc-950 text-xs">
                        {formatCurrency(lote.valor)}
                      </td>

                      <td className="p-3 text-center">
                        {lote.enviadoSiscoaf ? (
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-300">
                              TRANSMITIDO
                            </span>
                            <div className="font-mono text-[9px] text-zinc-500 mt-0.5">
                              {lote.numeroProtocoloSiscoaf}
                            </div>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200 text-zinc-800">
                            PENDENTE
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {!lote.enviadoSiscoaf ? (
                            <button
                              onClick={() => handleTransmitirSiscoaf(lote.id)}
                              className="px-2.5 py-1 bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-bold rounded border border-[#E5B700] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Transmitir para o SISCOAF"
                            >
                              <Send className="w-3 h-3 text-black" />
                              <span>Transmitir</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDownloadXml(lote)}
                              className="px-2.5 py-1 bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-bold rounded border border-[#E5B700] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Baixar Arquivo XML"
                            >
                              <Download className="w-3 h-3 text-black" />
                              <span>XML</span>
                            </button>
                          )}

                          {casoCorrespondente && (
                            <button
                              onClick={() => setActiveCaseId(casoCorrespondente.id)}
                              className="px-2.5 py-1 bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-bold rounded border border-[#E5B700] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Abrir Ficha de Investigação"
                            >
                              <span>Ficha</span>
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
        </div>
      </div>
    </div>
  );
};
