import React, { useState, useMemo } from 'react';
import { useAml } from '../../context/AmlContext';
import { mockRegrasMotor } from '../../data/mock-data';
import { RegraMotorPld } from '../../types';
import {
  Search,
  RotateCcw,
  SlidersHorizontal,
  Play
} from 'lucide-react';

export const RuleEngineView: React.FC = () => {
  const { showToast } = useAml();

  const [regras, setRegras] = useState<RegraMotorPld[]>(mockRegrasMotor);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Simulator Inputs
  const [simValor, setSimValor] = useState<number>(54000);
  const [simForma, setSimForma] = useState<'Espécie' | 'PIX' | 'TED' | 'Boleto' | 'Amortização' | 'Cripto'>('Espécie');
  const [simRenda, setSimRenda] = useState<number>(4500);
  const [simRegiao, setSimRegiao] = useState<'Fronteira' | 'Mineração' | 'Padrão'>('Fronteira');
  const [simCidade, setSimCidade] = useState<string>('Cáceres / MT');
  const [simIsPep, setSimIsPep] = useState<boolean>(false);
  const [simIsCsnu, setSimIsCsnu] = useState<boolean>(false);
  const [simIsAmortizacao, setSimIsAmortizacao] = useState<boolean>(false);
  const [simOrigemTerceiros, setSimOrigemTerceiros] = useState<boolean>(true);
  const [simIsFracionamento, setSimIsFracionamento] = useState<boolean>(true);
  const [simDepositanteIdentificado, setSimDepositanteIdentificado] = useState<boolean>(false);
  const [simPassThrough, setSimPassThrough] = useState<boolean>(false);

  // Simulation Results
  const [simulatedResult, setSimulatedResult] = useState<{
    triggeredRules: RegraMotorPld[];
    finalRisk: 'Crítico' | 'Alto' | 'Médio' | 'Baixo' | 'Automático (COE)' | 'Bloqueio Cautelar Obrigatório';
    score: number;
    actionRequired: string;
    summary: string;
    isCoeAutomatic: boolean;
    isCsnuBlock: boolean;
  } | null>(null);

  const categories = ['Todas', 'Limite Objetivo', 'Fracionamento', 'Fator Geográfico', 'Comportamental', 'Pessoas de Alto Risco'];

  const filteredRules = useMemo(() => {
    return regras.filter((r) => {
      const matchCat = selectedCategory === 'Todas' || r.categoria === selectedCategory;
      const matchSearch =
        searchTerm === '' ||
        r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.condicaoLogica.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.baseLegal.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [regras, selectedCategory, searchTerm]);

  const handleRunSimulation = () => {
    const triggered: RegraMotorPld[] = [];
    let score = 10;
    let isCoe = false;
    let isCsnu = false;

    // 1. Check CSNU / ONU Terrorismo (Lei 13.810/2019)
    if (simIsCsnu) {
      const r = regras.find((x) => x.codigo === 'REG-CSNU-11');
      if (r) triggered.push(r);
      score = 100;
      isCsnu = true;
    }

    // 2. Check Limite Objetivo COE (Espécie >= 50k)
    if (simValor >= 50000 && simForma === 'Espécie') {
      const r = regras.find((x) => x.codigo === 'REG-COE-01');
      if (r) triggered.push(r);
      isCoe = true;
      score = Math.max(score, 75);
    }

    // 3. Check Identificação Depositante em Espécie (> 2k)
    if (simValor > 2000 && simForma === 'Espécie' && !simDepositanteIdentificado) {
      const r = regras.find((x) => x.codigo === 'REG-DEP-02');
      if (r) triggered.push(r);
      score += 25;
    }

    // 4. Check Boleto em Espécie >= 10k
    if (simValor >= 10000 && simForma === 'Boleto') {
      const r = regras.find((x) => x.codigo === 'REG-BOL-03');
      if (r) triggered.push(r);
      score += 30;
    }

    // 5. Check Fracionamento / Smurfing
    if (simIsFracionamento) {
      const r = regras.find((x) => x.codigo === 'REG-FRAC-04');
      if (r) triggered.push(r);
      score += 45;
    }

    // 6. Check Fator Geográfico: Fronteira
    if (simRegiao === 'Fronteira') {
      const r = regras.find((x) => x.codigo === 'REG-GEO-05');
      if (r) triggered.push(r);
      score = Math.round(score * 1.5);
    }

    // 7. Check Fator Geográfico: Mineração / Garimpo
    if (simRegiao === 'Mineração') {
      const r = regras.find((x) => x.codigo === 'REG-GEO-06');
      if (r) triggered.push(r);
      score = Math.round(score * 1.4);
    }

    // 8. Check Liquidação Antecipada / Amortização DCO
    if (simIsAmortizacao && simValor >= 50000 && (simOrigemTerceiros || simForma === 'Espécie')) {
      const r = regras.find((x) => x.codigo === 'REG-AMORT-07');
      if (r) triggered.push(r);
      score += 40;
    }

    // 9. Check Pass-through / Conta de Passagem
    if (simPassThrough) {
      const r = regras.find((x) => x.codigo === 'REG-PASS-08');
      if (r) triggered.push(r);
      score += 40;
    }

    // 10. Check PEP com Incompatibilidade
    if (simIsPep && simValor > simRenda * 2) {
      const r = regras.find((x) => x.codigo === 'REG-PEP-09');
      if (r) triggered.push(r);
      score += 35;
    }

    // 11. Incompatibilidade Geral Renda
    if (simValor > simRenda * 5) {
      const r = regras.find((x) => x.codigo === 'REG-COMP-10');
      if (r && !triggered.some((t) => t.codigo === 'REG-COMP-10')) triggered.push(r);
      score += 35;
    }

    score = Math.min(100, Math.max(0, score));

    let finalRisk: 'Crítico' | 'Alto' | 'Médio' | 'Baixo' | 'Automático (COE)' | 'Bloqueio Cautelar Obrigatório' = 'Baixo';
    let actionRequired = 'Arquivamento justificado / Operação de rotina';
    let summary = 'A operação apresenta parâmetros dentro da normalidade financeira declarada.';

    if (isCsnu) {
      finalRisk = 'Bloqueio Cautelar Obrigatório';
      actionRequired = 'Bloqueio imediato de ativos sem prévio aviso e comunicação ao MJSP e COAF (Lei 13.810/2019)';
      summary = 'Alerta de Sanção Internacional CSNU/ONU detectado. Exige bloqueio patrimonial compulsório imediato.';
    } else if (isCoe) {
      finalRisk = 'Automático (COE)';
      actionRequired = 'Comunicação Automática COE via SISCOAF em até 24h úteis (Art. 49 Circular BACEN 3.978/2020)';
      summary = 'Operação em espécie igual ou superior a R$ 50.000,00. Disparo de envio compulsório independente de atipicidade subjetiva.';
    } else if (score >= 80) {
      finalRisk = 'Crítico';
      actionRequired = 'Comunicação COAF por Suspeição Grave (CGO) em até 24h';
      summary = 'Múltiplas regras gravosas acionadas (Fronteira/Mineração, fracionamento em espécie ou incompatibilidade severa de renda).';
    } else if (score >= 60) {
      finalRisk = 'Alto';
      actionRequired = 'Diligência Reforçada (EDD) e Solicitação de Comprovação de Origem';
      summary = 'Operação atípica relevante exigindo justificativa documental e rastreamento de contrapartes.';
    } else if (score >= 40) {
      finalRisk = 'Médio';
      actionRequired = 'Monitoramento Contínuo e Análise de Série Histórica';
      summary = 'Desvio moderado de movimentação em relação à renda mensal.';
    }

    setSimulatedResult({
      triggeredRules: triggered,
      finalRisk,
      score,
      actionRequired,
      summary,
      isCoeAutomatic: isCoe,
      isCsnuBlock: isCsnu
    });

    showToast(`Simulação concluída: ${triggered.length} regras disparadas. Score: ${score}/100.`, 'info');
  };

  const setPresetScenario = (type: 'smurfing_fronteira' | 'amortizacao_mineracao' | 'coe_especie' | 'csnu_terrorismo' | 'pep_triangulacao') => {
    if (type === 'smurfing_fronteira') {
      setSimValor(54000);
      setSimForma('Espécie');
      setSimRenda(4200);
      setSimRegiao('Fronteira');
      setSimCidade('Cáceres / MT');
      setSimIsPep(false);
      setSimIsCsnu(false);
      setSimIsAmortizacao(false);
      setSimOrigemTerceiros(true);
      setSimIsFracionamento(true);
      setSimDepositanteIdentificado(false);
      setSimPassThrough(true);
    } else if (type === 'amortizacao_mineracao') {
      setSimValor(215000);
      setSimForma('Amortização');
      setSimRenda(6500);
      setSimRegiao('Mineração');
      setSimCidade('Peixoto de Azevedo / MT');
      setSimIsPep(false);
      setSimIsCsnu(false);
      setSimIsAmortizacao(true);
      setSimOrigemTerceiros(true);
      setSimIsFracionamento(false);
      setSimDepositanteIdentificado(true);
      setSimPassThrough(false);
    } else if (type === 'coe_especie') {
      setSimValor(85000);
      setSimForma('Espécie');
      setSimRenda(120000);
      setSimRegiao('Padrão');
      setSimCidade('Campo Grande / MS');
      setSimIsPep(false);
      setSimIsCsnu(false);
      setSimIsAmortizacao(false);
      setSimOrigemTerceiros(false);
      setSimIsFracionamento(false);
      setSimDepositanteIdentificado(true);
      setSimPassThrough(false);
    } else if (type === 'csnu_terrorismo') {
      setSimValor(680000);
      setSimForma('TED');
      setSimRenda(18000);
      setSimRegiao('Fronteira');
      setSimCidade('Foz do Iguaçu / PR');
      setSimIsPep(false);
      setSimIsCsnu(true);
      setSimIsAmortizacao(false);
      setSimOrigemTerceiros(true);
      setSimIsFracionamento(false);
      setSimDepositanteIdentificado(true);
      setSimPassThrough(false);
    } else if (type === 'pep_triangulacao') {
      setSimValor(450000);
      setSimForma('TED');
      setSimRenda(14500);
      setSimRegiao('Padrão');
      setSimCidade('Belo Horizonte / MG');
      setSimIsPep(true);
      setSimIsCsnu(false);
      setSimIsAmortizacao(false);
      setSimOrigemTerceiros(true);
      setSimIsFracionamento(false);
      setSimDepositanteIdentificado(true);
      setSimPassThrough(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-zinc-950 tracking-tight">
              Motor de Regras & Simulador de Risco PLD/FT
            </h1>
            <p className="text-xs text-zinc-500">
              Parametrização de Limites Objetivos (COE), Fatores Geográficos, Fracionamento, Amortização DCO e Listas Restritivas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-zinc-100 border border-zinc-300 text-zinc-800 rounded text-xs font-mono font-medium">
              Motor Ativo
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Quick Presets Bar */}
        <div className="bg-white p-3.5 rounded-lg border border-zinc-200">
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Carregar Cenários de Teste Rápidos:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPresetScenario('smurfing_fronteira')}
              className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Smurfing em Fronteira (Cáceres/MT)
            </button>
            <button
              onClick={() => setPresetScenario('amortizacao_mineracao')}
              className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Amortização DCO em Mineração (Peixoto/MT)
            </button>
            <button
              onClick={() => setPresetScenario('coe_especie')}
              className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              COE Espécie R$ 85k (Campo Grande/MS)
            </button>
            <button
              onClick={() => setPresetScenario('pep_triangulacao')}
              className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              PEP com Repasse Imediato (Belo Horizonte/MG)
            </button>
            <button
              onClick={() => setPresetScenario('csnu_terrorismo')}
              className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Sanção CSNU / Terrorismo (Foz do Iguaçu/PR)
            </button>
          </div>
        </div>

        {/* 2-Columns layout: Left Simulator Form, Right Live Evaluation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Variables Simulator (5 cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                Parâmetros da Operação em Teste
              </h2>
              <button
                onClick={() => {
                  setSimValor(25000);
                  setSimForma('TED');
                  setSimRenda(8000);
                  setSimRegiao('Padrão');
                  setSimCidade('São Paulo / SP');
                  setSimIsPep(false);
                  setSimIsCsnu(false);
                  setSimIsAmortizacao(false);
                  setSimOrigemTerceiros(false);
                  setSimIsFracionamento(false);
                  setSimDepositanteIdentificado(true);
                  setSimPassThrough(false);
                  setSimulatedResult(null);
                }}
                className="px-2.5 py-1 rounded bg-[#FFCC01] hover:bg-[#E5B700] text-black text-xs font-bold border border-[#E5B700] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <RotateCcw className="w-3 h-3 text-black" />
                <span>Limpar</span>
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Valor da Operação (R$):</label>
                  <input
                    type="number"
                    value={simValor}
                    onChange={(e) => setSimValor(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1.5 font-mono text-zinc-900 font-bold focus:bg-white focus:border-zinc-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Renda Declarada (R$):</label>
                  <input
                    type="number"
                    value={simRenda}
                    onChange={(e) => setSimRenda(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1.5 font-mono text-zinc-900 font-bold focus:bg-white focus:border-zinc-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Forma / Meio:</label>
                  <select
                    value={simForma}
                    onChange={(e) => setSimForma(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1.5 text-zinc-900 font-medium focus:bg-white focus:border-zinc-400 outline-none cursor-pointer"
                  >
                    <option value="Espécie">Espécie (Dinheiro Vivo)</option>
                    <option value="PIX">PIX Instantâneo</option>
                    <option value="TED">TED / Transferência</option>
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Amortização">Amortização de Empréstimo</option>
                    <option value="Cripto">Criptoativos / P2P</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Fator Geográfico:</label>
                  <select
                    value={simRegiao}
                    onChange={(e) => setSimRegiao(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1.5 text-zinc-900 font-medium focus:bg-white focus:border-zinc-400 outline-none cursor-pointer"
                  >
                    <option value="Fronteira">Faixa de Fronteira (1.5x)</option>
                    <option value="Mineração">Polo de Mineração (1.4x)</option>
                    <option value="Padrão">Região Padrão (1.0x)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">Município / UF:</label>
                <input
                  type="text"
                  value={simCidade}
                  onChange={(e) => setSimCidade(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1.5 text-zinc-900 focus:bg-white focus:border-zinc-400 outline-none"
                />
              </div>

              {/* Toggles Checkboxes */}
              <div className="pt-2 border-t border-zinc-200 space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                  Flags de Risco Específicas
                </span>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simIsFracionamento}
                    onChange={(e) => setSimIsFracionamento(e.target.checked)}
                    className="rounded text-zinc-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-zinc-800">Fracionamento / Smurfing de depósitos em curto período</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simIsAmortizacao}
                    onChange={(e) => setSimIsAmortizacao(e.target.checked)}
                    className="rounded text-zinc-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-zinc-800">Liquidação antecipada de dívida / Empréstimo DCO</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simOrigemTerceiros}
                    onChange={(e) => setSimOrigemTerceiros(e.target.checked)}
                    className="rounded text-zinc-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-zinc-800">Recursos oriundos de terceiros sem vínculo aparente</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simPassThrough}
                    onChange={(e) => setSimPassThrough(e.target.checked)}
                    className="rounded text-zinc-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-zinc-800">Pass-Through imediato (crédito seguido de débito &gt;90% em &lt;24h)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!simDepositanteIdentificado}
                    onChange={(e) => setSimDepositanteIdentificado(!e.target.checked)}
                    className="rounded text-zinc-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-zinc-800">Depositante/Portador NÃO identificado em espécie (&gt; R$ 2k)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simIsPep}
                    onChange={(e) => setSimIsPep(e.target.checked)}
                    className="rounded text-zinc-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-zinc-800 font-medium">Titular é Pessoa Exposta Politicamente (PEP)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simIsCsnu}
                    onChange={(e) => setSimIsCsnu(e.target.checked)}
                    className="rounded text-zinc-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-zinc-900 font-bold">Listado em Sanções ONU / CSNU (Lei 13.810/19)</span>
                </label>
              </div>

              <button
                onClick={handleRunSimulation}
                className="w-full py-2.5 bg-[#FFCC01] hover:bg-[#E5B700] text-black rounded font-bold text-xs border border-[#E5B700] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-3"
              >
                <Play className="w-3.5 h-3.5 text-black fill-black" />
                <span>Executar Motor de Decisão</span>
              </button>
            </div>
          </div>

          {/* Right: Simulation Diagnostic Result (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {simulatedResult ? (
              <div className="bg-white p-5 rounded-lg border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Resultado do Motor
                    </span>
                    <div className="text-base font-bold text-zinc-950">
                      Diagnóstico: {simulatedResult.finalRisk}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Score Atribuído</span>
                    <span className="text-2xl font-bold font-mono text-zinc-950">
                      {simulatedResult.score} / 100
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs space-y-1">
                  <div className="font-bold text-zinc-900">Ação Regulamentar Obrigatória:</div>
                  <div className="text-zinc-700">{simulatedResult.actionRequired}</div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider mb-2">
                    Regras Disparadas ({simulatedResult.triggeredRules.length})
                  </h3>

                  <div className="space-y-2">
                    {simulatedResult.triggeredRules.map((r) => (
                      <div key={r.id} className="p-3 rounded border border-zinc-200 bg-zinc-50 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-zinc-900">{r.codigo} - {r.nome}</span>
                          <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-zinc-200 text-zinc-800 font-bold">
                            +{r.pesoPontos} pts
                          </span>
                        </div>
                        <div className="text-zinc-600 text-[11px]">{r.condicaoLogica}</div>
                        <div className="text-zinc-400 text-[10px] font-mono">{r.baseLegal}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-lg border border-zinc-200 flex flex-col items-center justify-center text-center text-zinc-500">
                <SlidersHorizontal className="w-8 h-8 text-zinc-400 mb-2" />
                <div className="text-sm font-bold text-zinc-800">Nenhuma Simulação Executada</div>
                <div className="text-xs max-w-sm mt-1">
                  Ajuste as variáveis no formulário ao lado ou selecione um cenário rápido para processar o motor.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rules Catalog Table */}
        <div className="bg-white p-5 rounded-lg border border-zinc-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">
                Catálogo de Regras Parametrizadas
              </h2>
              <p className="text-xs text-zinc-500">
                Regras ativas no motor para monitoramento contínuo da cooperativa.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-1 bg-zinc-100 p-0.5 rounded border border-zinc-200 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-zinc-900 text-white font-bold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-200 rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-zinc-100 text-zinc-700 uppercase font-bold border-b border-zinc-200 text-[10px]">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Regra / Descrição</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Condição de Disparo</th>
                  <th className="p-3">Base Legal</th>
                  <th className="p-3 text-right">Peso</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredRules.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-zinc-900">{r.codigo}</td>
                    <td className="p-3">
                      <div className="font-bold text-zinc-900">{r.nome}</div>
                      <div className="text-[11px] text-zinc-500">{r.descricao}</div>
                    </td>
                    <td className="p-3 text-zinc-700">{r.categoria}</td>
                    <td className="p-3 text-zinc-600 font-mono text-[11px]">{r.condicaoLogica}</td>
                    <td className="p-3 text-zinc-500 font-mono text-[10px]">{r.baseLegal}</td>
                    <td className="p-3 text-right font-mono font-bold text-zinc-950">+{r.pesoPontos}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-300">
                        {r.ativo ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
