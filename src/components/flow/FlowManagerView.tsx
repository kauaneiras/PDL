import React, { useState, useMemo } from 'react';
import { useAml } from '../../context/AmlContext';
import { FlowScoreCondition } from '../../types';
import { mockFlowScoreConditions } from '../../data/mock-bi-data';
import {
  Workflow,
  Plus,
  Database,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sliders,
  Clock,
  Activity,
  Flame,
  ShieldAlert,
  Smartphone,
  Home,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

export const FlowManagerView: React.FC = () => {
  const { casos, showToast } = useAml();

  const [condicoes, setCondicoes] = useState<FlowScoreCondition[]>(() => {
    try {
      const saved = localStorage.getItem('cooperforte_flow_rules_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return mockFlowScoreConditions;
  });

  const [activeTab, setActiveTab] = useState<'VISUAL_FLOW' | 'STORED_PROCEDURE' | 'SIMULADOR'>('VISUAL_FLOW');
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedSimCaseId, setSelectedSimCaseId] = useState<string>(casos[0]?.id || '');

  // Form para nova condição
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [novaRegra, setNovaRegra] = useState<Partial<FlowScoreCondition>>({
    nome: '',
    descricao: '',
    categoria: 'HORARIO',
    campoGatilho: 'transacoes_noturnas_count',
    operador: '>=',
    valorReferencia: 3,
    pontosScore: 25,
    pesoMensal: 'MEDIO',
    ativo: true
  });

  const salvarNoStorage = (novasCondicoes: FlowScoreCondition[]) => {
    setCondicoes(novasCondicoes);
    try {
      localStorage.setItem('cooperforte_flow_rules_v1', JSON.stringify(novasCondicoes));
    } catch {
      // ignore
    }
  };

  const handleToggleCondicao = (id: string) => {
    const atualizadas = condicoes.map((c) => (c.id === id ? { ...c, ativo: !c.ativo } : c));
    salvarNoStorage(atualizadas);
    showToast('Regra do fluxo atualizada.', 'info');
  };

  const handleRemoverCondicao = (id: string) => {
    const filtradas = condicoes.filter((c) => c.id !== id);
    salvarNoStorage(filtradas);
    showToast('Condição removida do fluxo.', 'warning');
  };

  const handleAdicionarRegra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaRegra.nome || !novaRegra.campoGatilho) {
      showToast('Preencha o nome e o campo gatilho da condição.', 'warning');
      return;
    }

    const id = `FLOW-0${condicoes.length + 1}`;
    const snippet = `IF (${novaRegra.campoGatilho} ${novaRegra.operador} ${novaRegra.valorReferencia}) THEN
    v_score_acumulado := v_score_acumulado + ${novaRegra.pontosScore || 20};
    INSERT INTO tb_score_log (cooperado_id, regra, pontos, data_aplicacao)
    VALUES (p_cooperado_id, '${id}-${novaRegra.categoria}', ${novaRegra.pontosScore || 20}, NOW());
END IF;`;

    const nova: FlowScoreCondition = {
      id,
      nome: novaRegra.nome,
      descricao: novaRegra.descricao || 'Regra customizada criada pelo gestor no Flow Manager.',
      categoria: novaRegra.categoria as any,
      campoGatilho: novaRegra.campoGatilho,
      operador: novaRegra.operador as any,
      valorReferencia: novaRegra.valorReferencia || 1,
      pontosScore: Number(novaRegra.pontosScore) || 20,
      pesoMensal: novaRegra.pesoMensal as any,
      procedimentoSqlSnippet: snippet,
      ativo: true
    };

    const atualizadas = [...condicoes, nova];
    salvarNoStorage(atualizadas);
    setIsAddingRule(false);
    setNovaRegra({
      nome: '',
      descricao: '',
      categoria: 'HORARIO',
      campoGatilho: 'transacoes_noturnas_count',
      operador: '>=',
      valorReferencia: 3,
      pontosScore: 25,
      pesoMensal: 'MEDIO',
      ativo: true
    });
    showToast('Nova condição de score inserida no fluxo com sucesso!', 'success');
  };

  // Stored Procedure SQL gerada dinamicamente com base nas regras ativas
  const generatedStoredProcedure = useMemo(() => {
    const regrasAtivas = condicoes.filter((c) => c.ativo);
    const snippets = regrasAtivas.map((r) => `    -- Regra ${r.id}: ${r.nome} (+${r.pontosScore} pts)
    ${r.procedimentoSqlSnippet.split('\n').join('\n    ')}`).join('\n\n');

    return `-- =========================================================================
-- COOPERFORTE - SISTEMA DE PREVENÇÃO À LAVAGEM DE DINHEIRO E FINANCIAMENTO AO TERRORISMO
-- STORED PROCEDURE DE CÁLCULO MENSAL DE SCORES DE RISCO (FLOW ENGINE)
-- Tradução direta das regras configuradas visualmente na interface de PLD
-- Executado mensalmente na virada da competência (Job automatizado)
-- =========================================================================

CREATE OR REPLACE PROCEDURE sp_calcular_score_risco_mensal(
    IN p_mes_referencia VARCHAR(7),   -- Formato: '08/2026'
    IN p_cooperado_id VARCHAR(50),
    OUT p_score_final INT,
    OUT p_nivel_risco VARCHAR(20),
    OUT p_deve_gerar_ficha BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_score_acumulado INT := 0;
    v_renda_declarada NUMERIC(15,2);
    v_patrimonio_declarado NUMERIC(15,2);
    v_volume_mes NUMERIC(15,2);
    v_volume_especie NUMERIC(15,2);
    v_transacoes_madrugada INT := 0;
    v_vol_horario_jogos NUMERIC(15,2) := 0.00;
    v_qtd_jogos INT := 0;
    v_flag_apostas BOOLEAN := FALSE;
    v_device_fraud_score INT := 0;
    v_device_multiplos_cpfs BOOLEAN := FALSE;
    v_imovel_discrepancia NUMERIC(6,2) := 0.00;
    v_imovel_capacidade_compativel BOOLEAN := TRUE;
    v_regiao_risco VARCHAR(30);
    v_is_pep BOOLEAN := FALSE;
BEGIN
    -- 1. Carregar dados consolidados do associado e transações do mês
    SELECT renda, patrimonio, regiao_risco, is_pep
    INTO v_renda_declarada, v_patrimonio_declarado, v_regiao_risco, v_is_pep
    FROM tb_cooperado
    WHERE id = p_cooperado_id;

    SELECT 
        COALESCE(SUM(valor), 0),
        COALESCE(SUM(CASE WHEN forma = 'Espécie' THEN valor ELSE 0 END), 0),
        COALESCE(COUNT(CASE WHEN EXTRACT(HOUR FROM data_hora) BETWEEN 22 AND 6 THEN 1 END), 0),
        COALESCE(SUM(CASE WHEN is_horario_jogos = TRUE THEN valor ELSE 0 END), 0),
        COALESCE(COUNT(CASE WHEN is_horario_jogos = TRUE THEN 1 END), 0)
    INTO 
        v_volume_mes, v_volume_especie, v_transacoes_madrugada, v_vol_horario_jogos, v_qtd_jogos
    FROM tb_transacoes
    WHERE cooperado_id = p_cooperado_id 
      AND TO_CHAR(data_hora, 'MM/YYYY') = p_mes_referencia;

    -- 2. Carregar dados telemétricos do dispositivo (Device Intelligence)
    SELECT COALESCE(score_fraude, 0), COALESCE(multiplos_cpfs, FALSE)
    INTO v_device_fraud_score, v_device_multiplos_cpfs
    FROM tb_device_telemetria
    WHERE cooperado_id = p_cooperado_id
    ORDER BY data_ultimo_acesso DESC
    LIMIT 1;

    -- 3. Carregar dados de cruzamento imobiliário / cartórios
    SELECT COALESCE(discrepancia_perc, 0), COALESCE(capacidade_compativel, TRUE)
    INTO v_imovel_discrepancia, v_imovel_capacidade_compativel
    FROM tb_cruzamento_cartorios_imoveis
    WHERE cooperado_id = p_cooperado_id
      AND TO_CHAR(data_registro, 'MM/YYYY') = p_mes_referencia
    LIMIT 1;

    -- =========================================================================
    -- AVALIAÇÃO DAS CONDIÇÕES DO FLOW MANAGER (${regrasAtivas.length} REGRAS ATIVAS)
    -- =========================================================================
${snippets}

    -- 4. Normalização do Score (Limite Máximo: 100)
    p_score_final := LEAST(100, GREATEST(0, v_score_acumulado));

    -- 5. Classificação por Faixa Regulatória
    IF p_score_final >= 85 THEN
        p_nivel_risco := 'Crítico';
        p_deve_gerar_ficha := TRUE;
    ELSIF p_score_final >= 65 THEN
        p_nivel_risco := 'Alto';
        p_deve_gerar_ficha := TRUE;
    ELSIF p_score_final >= 40 THEN
        p_nivel_risco := 'Médio';
        p_deve_gerar_ficha := FALSE;
    ELSE
        p_nivel_risco := 'Baixo';
        p_deve_gerar_ficha := FALSE;
    END IF;

    -- 6. Atualizar snapshot mensal do associado
    UPDATE tb_cooperado_score_mensal
    SET score_calculado = p_score_final,
        nivel_risco = p_nivel_risco,
        data_calculo = NOW(),
        gerar_ficha_investigacao = p_deve_gerar_ficha
    WHERE cooperado_id = p_cooperado_id AND mes_referencia = p_mes_referencia;

END;
$$;`;
  }, [condicoes]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedStoredProcedure);
    setCopiedCode(true);
    showToast('Código da Stored Procedure copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Simulação para o caso selecionado
  const casoSimulado = useMemo(() => {
    return casos.find((c) => c.id === selectedSimCaseId) || casos[0];
  }, [casos, selectedSimCaseId]);

  const resultadoSimulacao = useMemo(() => {
    if (!casoSimulado) return { scoreTotal: 0, regrasFaturadas: [], nivel: 'Baixo' };

    let score = 0;
    const regrasFaturadas: { regra: FlowScoreCondition; pontos: number; justificativa: string }[] = [];

    const volumeTotal = casoSimulado.volumeAtipicoPeriodo || casoSimulado.valorEnvolvido || 0;
    const renda = casoSimulado.capacidadeFinanceira?.rendaDeclarada || casoSimulado.renda || 1;
    const fatorRenda = volumeTotal / renda;

    condicoes.forEach((regra) => {
      if (!regra.ativo) return;

      if (regra.id === 'FLOW-01') {
        // Horário Noturno
        const transNoturnas = casoSimulado.transacoes?.filter((t) => t.faixaHorario === 'Madrugada' || (t.hora && (t.hora >= '22:00' || t.hora <= '06:00'))).length || 0;
        if (transNoturnas >= 1) {
          score += regra.pontosScore;
          regrasFaturadas.push({
            regra,
            pontos: regra.pontosScore,
            justificativa: `${transNoturnas} operação(ões) identificada(s) em horário de madrugada/noturno.`
          });
        }
      } else if (regra.id === 'FLOW-02') {
        // Horário de Jogos
        const transJogos = casoSimulado.transacoes?.filter((t) => t.isHorarioJogos).length || 0;
        if (transJogos >= 1 || volumeTotal > 80000) {
          score += regra.pontosScore;
          regrasFaturadas.push({
            regra,
            pontos: regra.pontosScore,
            justificativa: `${transJogos} transferência(s) atípica(s) durante horários de partidas esportivas/apostas.`
          });
        }
      } else if (regra.id === 'FLOW-03') {
        // Discrepância Renda
        if (fatorRenda >= 3.0) {
          score += regra.pontosScore;
          regrasFaturadas.push({
            regra,
            pontos: regra.pontosScore,
            justificativa: `Volume mensal (${fatorRenda.toFixed(1)}x) excede o gatilho de 3x da renda declarada.`
          });
        }
      } else if (regra.id === 'FLOW-04') {
        // Dispositivo
        const fraudScore = casoSimulado.device?.scoreRiscoFraude || 0;
        if (fraudScore >= 70 || casoSimulado.device?.multiplosCpfsAssociados) {
          score += regra.pontosScore;
          regrasFaturadas.push({
            regra,
            pontos: regra.pontosScore,
            justificativa: `Score de fraude do dispositivo (${fraudScore}/100) ou IMEI compartilhado.`
          });
        }
      } else if (regra.id === 'FLOW-05') {
        // Imóveis
        if (casoSimulado.valorEnvolvido > 500000 || casoSimulado.alerta.toLowerCase().includes('imóve') || casoSimulado.alerta.toLowerCase().includes('espécie')) {
          score += regra.pontosScore;
          regrasFaturadas.push({
            regra,
            pontos: regra.pontosScore,
            justificativa: `Discrepância no valor venal de aquisição imobiliária em cartório vs capacidade declarada.`
          });
        }
      } else if (regra.id === 'FLOW-06') {
        // Fator Geográfico
        if (casoSimulado.regiaoRisco === 'Fronteira' || casoSimulado.regiaoRisco === 'Mineração') {
          score += regra.pontosScore;
          regrasFaturadas.push({
            regra,
            pontos: regra.pontosScore,
            justificativa: `Município do associado ou terminal em zona prioritária de risco geográfico (${casoSimulado.regiaoRisco}).`
          });
        }
      }
    });

    const scoreFinal = Math.min(100, Math.max(10, score));
    const nivel = scoreFinal >= 85 ? 'Crítico' : scoreFinal >= 65 ? 'Alto' : scoreFinal >= 40 ? 'Médio' : 'Baixo';

    return { scoreTotal: scoreFinal, regrasFaturadas, nivel };
  }, [casoSimulado, condicoes]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-1">
            <Workflow className="w-4 h-4 text-emerald-600" />
            Flow Manager de Risco Mensal
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestor de Regras e Procedimentos de Score no Banco
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Configure regras lógicas e gatilhos que alimentam o cálculo automático de score de risco mensal dos cooperados.
            A interface traduz visualmente cada bloco em comandos SQL para Stored Procedures nativas no banco de dados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-abrir-form-regra"
            onClick={() => setIsAddingRule(!isAddingRule)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Condição no Flow
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-4">
        <button
          type="button"
          id="tab-visual-flow"
          onClick={() => setActiveTab('VISUAL_FLOW')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'VISUAL_FLOW'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Workflow className="w-4 h-4" />
          Editor Visual de Condições ({condicoes.filter((c) => c.ativo).length} ativas)
        </button>

        <button
          type="button"
          id="tab-stored-procedure"
          onClick={() => setActiveTab('STORED_PROCEDURE')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'STORED_PROCEDURE'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Tradução para Stored Procedure (SQL / Banco)
        </button>

        <button
          type="button"
          id="tab-simulador"
          onClick={() => setActiveTab('SIMULADOR')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'SIMULADOR'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Play className="w-4 h-4" />
          Simulador em Tempo Real
        </button>
      </div>

      {/* New Condition Modal/Form */}
      {isAddingRule && (
        <form
          onSubmit={handleAdicionarRegra}
          className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-5 space-y-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              Adicionar Nova Condição ao Motor de Score
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingRule(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nome da Condição</label>
              <input
                type="text"
                value={novaRegra.nome}
                onChange={(e) => setNovaRegra({ ...novaRegra, nome: e.target.value })}
                placeholder="Ex: Múltiplos Pix Noturnos"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Categoria Lógica</label>
              <select
                value={novaRegra.categoria}
                onChange={(e) => setNovaRegra({ ...novaRegra, categoria: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="HORARIO">Horário de Operação (Noturno/Madrugada)</option>
                <option value="JOGOS_APOSTAS">Horário de Jogos / Apostas Esportivas</option>
                <option value="DISCREPANCIA">Discrepância Renda x Volume</option>
                <option value="DISPOSITIVO">Dispositivo / Fraude Cibernética</option>
                <option value="IMOVEIS">Cruzamento Imobiliário & Cartórios</option>
                <option value="GEOGRAFICO">Fator Geográfico (Fronteira/Garimpo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Pontos a Somar no Score</label>
              <input
                type="number"
                min="5"
                max="60"
                step="5"
                value={novaRegra.pontosScore}
                onChange={(e) => setNovaRegra({ ...novaRegra, pontosScore: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Campo Gatilho (Tabela SQL)</label>
              <input
                type="text"
                value={novaRegra.campoGatilho}
                onChange={(e) => setNovaRegra({ ...novaRegra, campoGatilho: e.target.value })}
                placeholder="Ex: transacoes_madrugada_count"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Operador Lógico</label>
              <select
                value={novaRegra.operador}
                onChange={(e) => setNovaRegra({ ...novaRegra, operador: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value=">=">&gt;= (Maior ou Igual)</option>
                <option value=">">&gt; (Maior que)</option>
                <option value="<=">&lt;= (Menor ou Igual)</option>
                <option value="EQUALS">= (Igual a)</option>
                <option value="BETWEEN">BETWEEN (Intervalo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Valor de Referência</label>
              <input
                type="text"
                value={novaRegra.valorReferencia}
                onChange={(e) => setNovaRegra({ ...novaRegra, valorReferencia: e.target.value })}
                placeholder="Ex: 3 ou 50000"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingRule(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              Gravar Condição no Procedimento
            </button>
          </div>
        </form>
      )}

      {/* TAB 1: VISUAL FLOW */}
      {activeTab === 'VISUAL_FLOW' && (
        <div className="space-y-6">
          {/* Flow Diagram Architecture Bar */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Arquitetura de Execução: Banco de Dados Relacional &bull; Procedimento em Lote
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <div className="text-slate-400 font-mono text-[11px] mb-1">1. ENTRADA DE DADOS</div>
                <div className="font-semibold text-slate-200">Remessa Mensal (Tabelas)</div>
                <div className="text-slate-400 mt-1 text-[11px]">Transações, Cadastro KYC, Cartórios e Telemetria de Dispositivo.</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-emerald-600/50">
                <div className="text-emerald-400 font-mono text-[11px] mb-1">2. FLOW ENGINE (SQL)</div>
                <div className="font-semibold text-white">Avaliação das {condicoes.length} Condições</div>
                <div className="text-slate-400 mt-1 text-[11px]">Cálculo aritmético e somatório de pontos ponderados por cooperado.</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <div className="text-slate-400 font-mono text-[11px] mb-1">3. SCORE NORMALIZADO</div>
                <div className="font-semibold text-slate-200">Score 0 a 100 Pontos</div>
                <div className="text-slate-400 mt-1 text-[11px]">Baixo (&lt;40), Médio (40-64), Alto (65-84), Crítico (&gt;=85).</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-amber-500/50">
                <div className="text-amber-400 font-mono text-[11px] mb-1">4. DISPARO DE AÇÃO</div>
                <div className="font-semibold text-amber-200">Geração de Ficha PLD</div>
                <div className="text-slate-400 mt-1 text-[11px]">Abertura automática na Fila de Triagem para Scores &gt;= 65.</div>
              </div>
            </div>
          </div>

          {/* Conditions Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Blocos de Condições Ativos ({condicoes.length})
              </h2>
              <span className="text-xs text-slate-500">
                Alterações são refletidas automaticamente no código SQL da procedure
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {condicoes.map((cond) => {
                const getCategoryIcon = () => {
                  switch (cond.categoria) {
                    case 'HORARIO':
                      return <Clock className="w-4 h-4 text-zinc-700" />;
                    case 'JOGOS_APOSTAS':
                      return <Flame className="w-4 h-4 text-orange-600" />;
                    case 'DISCREPANCIA':
                      return <Activity className="w-4 h-4 text-purple-600" />;
                    case 'DISPOSITIVO':
                      return <Smartphone className="w-4 h-4 text-red-600" />;
                    case 'IMOVEIS':
                      return <Home className="w-4 h-4 text-indigo-600" />;
                    default:
                      return <ShieldAlert className="w-4 h-4 text-amber-600" />;
                  }
                };

                return (
                  <div
                    key={cond.id}
                    id={`cond-card-${cond.id}`}
                    className={`p-4 rounded-xl border transition-all ${
                      cond.ativo
                        ? 'bg-white border-slate-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-slate-100">{getCategoryIcon()}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-500">{cond.id}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                              {cond.categoria}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{cond.nome}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-800">
                          +{cond.pontosScore} pts
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleCondicao(cond.id)}
                          className={`w-8 h-4 rounded-full transition-colors relative ${
                            cond.ativo ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                          title={cond.ativo ? 'Desativar condição' : 'Ativar condição'}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                              cond.ativo ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{cond.descricao}</p>

                    {/* Trigger condition chip */}
                    <div className="mt-3 p-2 rounded-md bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis">
                        <span className="text-zinc-900 font-semibold">{cond.campoGatilho}</span>
                        <span className="text-amber-700 font-bold">{cond.operador}</span>
                        <span className="text-emerald-700 font-semibold">{String(cond.valorReferencia)}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-sans uppercase font-medium">
                        Peso: {cond.pesoMensal}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Compilado no banco
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoverCondicao(cond.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1"
                        title="Excluir regra"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORED PROCEDURE TRANSLATION */}
      {activeTab === 'STORED_PROCEDURE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Código Transpilado &bull; SQL Server / PostgreSQL / Oracle
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Procedure: <code className="font-mono text-emerald-800">sp_calcular_score_risco_mensal</code>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Este script é gerado a partir do Flow Manager e executado pelo agendador de banco de dados (Job).
              </p>
            </div>

            <button
              type="button"
              id="btn-copiar-stored-procedure"
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Procedure SQL
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                procedures/sp_calcular_score_risco_mensal.sql
              </span>
              <span>{generatedStoredProcedure.split('\n').length} linhas</span>
            </div>
            <pre className="p-5 text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto max-h-[550px]">
              {generatedStoredProcedure}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: SIMULATOR */}
      {activeTab === 'SIMULADOR' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Simulador de Score com Casos Reais</h3>
                <p className="text-xs text-slate-500">
                  Selecione um associado da base para ver quais condições do Flow seriam satisfeitas no fechamento do mês.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-600">Associado para Teste:</label>
                <select
                  value={selectedSimCaseId}
                  onChange={(e) => setSelectedSimCaseId(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {casos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.cpf}) - Atual: {c.scoreRisco} pts
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {casoSimulado && (
              <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-800 text-sm">{casoSimulado.nome}</div>
                  <div className="text-slate-500">CPF: {casoSimulado.cpf}</div>
                  <div className="text-slate-500">Profissão: {casoSimulado.kyc?.profissao || casoSimulado.perfil}</div>
                  <div className="text-slate-500">Local: {casoSimulado.kyc?.cidadeUf}</div>
                  <div className="text-slate-500">
                    Renda: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(casoSimulado.renda)}
                  </div>
                  <div className="text-slate-500">
                    Volume Mês: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(casoSimulado.valorEnvolvido)}
                  </div>
                  <div className="text-slate-500">
                    Dispositivo: {casoSimulado.device?.modelo} (Score Fraude: {casoSimulado.device?.scoreRiscoFraude}/100)
                  </div>
                </div>

                {/* Score Result Gauge */}
                <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 text-center flex flex-col items-center justify-center">
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-800">
                    Score Calculado pelo Flow
                  </span>
                  <div className="text-4xl font-extrabold text-emerald-950 mt-1">
                    {resultadoSimulacao.scoreTotal}
                    <span className="text-sm font-normal text-slate-500"> / 100</span>
                  </div>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                      resultadoSimulacao.nivel === 'Crítico'
                        ? 'bg-red-100 text-red-800'
                        : resultadoSimulacao.nivel === 'Alto'
                        ? 'bg-amber-100 text-amber-800'
                        : resultadoSimulacao.nivel === 'Médio'
                        ? 'bg-zinc-200 text-zinc-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Risco {resultadoSimulacao.nivel}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-2">
                    {resultadoSimulacao.scoreTotal >= 65
                      ? 'Gera abertura automática de Ficha de Investigação na virada mensal.'
                      : 'Não atinge o corte para abertura de ficha; mantido em monitoramento.'}
                  </span>
                </div>

                {/* Rules Fired List */}
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800 mb-2">
                    Regras Faturadas no Mês ({resultadoSimulacao.regrasFaturadas.length}):
                  </div>
                  {resultadoSimulacao.regrasFaturadas.length === 0 ? (
                    <p className="text-slate-500 italic">Nenhum gatilho ativado para este perfil.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {resultadoSimulacao.regrasFaturadas.map((rf, idx) => (
                        <div key={idx} className="p-2 rounded bg-white border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{rf.regra.nome}</span>
                            <span className="font-bold text-emerald-700">+{rf.pontos} pts</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{rf.justificativa}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
