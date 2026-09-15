import { VendaImovelCruzamento, FlowScoreCondition, MonitoramentoCustomizado, DeviceIntelligence } from '../types';

export const mockBairrosReferencia = [
  { nome: 'Asa Sul', cidade: 'Brasília / DF', valorM2: 13500, regiao: 'Centro-Oeste' },
  { nome: 'Asa Norte', cidade: 'Brasília / DF', valorM2: 12800, regiao: 'Centro-Oeste' },
  { nome: 'Lago Sul', cidade: 'Brasília / DF', valorM2: 16500, regiao: 'Centro-Oeste' },
  { nome: 'Moema', cidade: 'São Paulo / SP', valorM2: 15200, regiao: 'Sudeste' },
  { nome: 'Jardins', cidade: 'São Paulo / SP', valorM2: 19800, regiao: 'Sudeste' },
  { nome: 'Leblon', cidade: 'Rio de Janeiro / RJ', valorM2: 22000, regiao: 'Sudeste' },
  { nome: 'Barra da Tijuca', cidade: 'Rio de Janeiro / RJ', valorM2: 11500, regiao: 'Sudeste' },
  { nome: 'Savassi', cidade: 'Belo Horizonte / MG', valorM2: 10800, regiao: 'Sudeste' },
  { nome: 'Batel', cidade: 'Curitiba / PR', valorM2: 12200, regiao: 'Sul' },
  { nome: 'Moinhos de Vento', cidade: 'Porto Alegre / RS', valorM2: 11000, regiao: 'Sul' },
  { nome: 'Meireles', cidade: 'Fortaleza / CE', valorM2: 10400, regiao: 'Nordeste' },
  { nome: 'Cáceres Centro', cidade: 'Cáceres / MT', valorM2: 3800, regiao: 'Centro-Oeste' },
];

export const mockVendasImoveis: VendaImovelCruzamento[] = [
  {
    id: 'IMV-2026-001',
    cpfEnvolvido: '234.819.012-89',
    nomeEnvolvido: 'Carlos Eduardo Santos',
    tipoPapel: 'COMPRADOR',
    bairro: 'Asa Sul',
    cidadeUf: 'Brasília / DF',
    tipoImovel: 'Apartamento',
    areaM2: 145,
    valorDeclarado: 650000.00,
    valorMedioM2Bairro: 13500,
    valorEstimadoMercado: 1957500.00,
    discrepanciaPercentual: -66.8, // Subfaturamento de 66.8%
    rendaMensalDeclarada: 4200.00,
    patrimonioDeclarado: 60000.00,
    capacidadeCompativel: false,
    grauIncompatibilidade: 'GRAVE_INCOMPATIBILIDADE',
    alertaDescricao: 'Subfaturamento flagrante (-66,8% vs m² médio de Asa Sul) com pagamento declarado em espécie/recursos não rastreados. Renda de R$ 4.200/mês incompatível com aquisição de R$ 650k / avaliação de R$ 1.95M.',
    dataTransacao: '14/08/2026',
    cartorioOficio: '1º Ofício de Registro de Imóveis do DF',
    matriculaCartorio: 'MATR-DF-194.812'
  },
  {
    id: 'IMV-2026-002',
    cpfEnvolvido: '412.940.118-20',
    nomeEnvolvido: 'Ricardo Barreto Nogueira',
    tipoPapel: 'COMPRADOR',
    bairro: 'Moema',
    cidadeUf: 'São Paulo / SP',
    tipoImovel: 'Cobertura',
    areaM2: 280,
    valorDeclarado: 1200000.00,
    valorMedioM2Bairro: 15200,
    valorEstimadoMercado: 4256000.00,
    discrepanciaPercentual: -71.8,
    rendaMensalDeclarada: 12000.00,
    patrimonioDeclarado: 450000.00,
    capacidadeCompativel: false,
    grauIncompatibilidade: 'ALERTA_SUBFATURAMENTO',
    alertaDescricao: 'Aquisição de cobertura duplex em Moema declarada por menos de um terço do valor de mercado venal. Indício de pagamento complementar em dinheiro vivo para lavagem patrimonial.',
    dataTransacao: '02/08/2026',
    cartorioOficio: '14º Registro de Imóveis de São Paulo',
    matriculaCartorio: 'MATR-SP-882.109'
  },
  {
    id: 'IMV-2026-003',
    cpfEnvolvido: '08.192.481/0001-22',
    nomeEnvolvido: 'Agropecuária Vale Dourado Ltda (Manoel Prado)',
    tipoPapel: 'VENDEDOR',
    bairro: 'Lago Sul',
    cidadeUf: 'Brasília / DF',
    tipoImovel: 'Casa em Condomínio',
    areaM2: 600,
    valorDeclarado: 9900000.00,
    valorMedioM2Bairro: 16500,
    valorEstimadoMercado: 9900000.00,
    discrepanciaPercentual: 0.0,
    rendaMensalDeclarada: 85000.00,
    patrimonioDeclarado: 18500000.00,
    capacidadeCompativel: true,
    grauIncompatibilidade: 'COMPATÍVEL',
    alertaDescricao: 'Alienação imobiliária regular compatível com a tabela de referência de m² e patrimônio agropecuário auditado. Alerta restrito à liquidação parcial em espécie investigada no COE.',
    dataTransacao: '28/07/2026',
    cartorioOficio: '2º Ofício de Registro de Imóveis do DF',
    matriculaCartorio: 'MATR-DF-049.221'
  },
  {
    id: 'IMV-2026-004',
    cpfEnvolvido: '529.102.493-11',
    nomeEnvolvido: 'Mariana Silveira Fontes',
    tipoPapel: 'COMPRADOR',
    bairro: 'Asa Norte',
    cidadeUf: 'Brasília / DF',
    tipoImovel: 'Apartamento',
    areaM2: 98,
    valorDeclarado: 1250000.00,
    valorMedioM2Bairro: 12800,
    valorEstimadoMercado: 1254400.00,
    discrepanciaPercentual: -0.3,
    rendaMensalDeclarada: 28500.00,
    patrimonioDeclarado: 2100000.00,
    capacidadeCompativel: true,
    grauIncompatibilidade: 'COMPATÍVEL',
    alertaDescricao: 'Operação imobiliária perfeitamente alinhada com valor de mercado e com renda de servidora pública e sócia de clínica comprovada via IRPF.',
    dataTransacao: '19/08/2026',
    cartorioOficio: '1º Ofício de Registro de Imóveis do DF',
    matriculaCartorio: 'MATR-DF-309.841'
  },
  {
    id: 'IMV-2026-005',
    cpfEnvolvido: '102.948.291-04',
    nomeEnvolvido: 'Antônio Ferreira Lima',
    tipoPapel: 'COMPRADOR',
    bairro: 'Batel',
    cidadeUf: 'Curitiba / PR',
    tipoImovel: 'Comercial',
    areaM2: 210,
    valorDeclarado: 1500000.00,
    valorMedioM2Bairro: 12200,
    valorEstimadoMercado: 2562000.00,
    discrepanciaPercentual: -41.4,
    rendaMensalDeclarada: 8000.00,
    patrimonioDeclarado: 220000.00,
    capacidadeCompativel: false,
    grauIncompatibilidade: 'GRAVE_INCOMPATIBILIDADE',
    alertaDescricao: 'Compra de imóvel comercial de alto padrão no Batel com subfaturamento de 41% e renda cadastrada de apenas R$ 8.000. Sem lastro de empréstimo imobiliário registrado.',
    dataTransacao: '05/08/2026',
    cartorioOficio: '6º Registro de Imóveis de Curitiba',
    matriculaCartorio: 'MATR-PR-771.029'
  },
  {
    id: 'IMV-2026-006',
    cpfEnvolvido: '719.201.884-33',
    nomeEnvolvido: 'Lucas Alencar Prado',
    tipoPapel: 'VENDEDOR',
    bairro: 'Leblon',
    cidadeUf: 'Rio de Janeiro / RJ',
    tipoImovel: 'Apartamento',
    areaM2: 120,
    valorDeclarado: 4800000.00,
    valorMedioM2Bairro: 22000,
    valorEstimadoMercado: 2640000.00,
    discrepanciaPercentual: +81.8, // Superfaturamento para lavar recursos
    rendaMensalDeclarada: 14000.00,
    patrimonioDeclarado: 850000.00,
    capacidadeCompativel: false,
    grauIncompatibilidade: 'GRAVE_INCOMPATIBILIDADE',
    alertaDescricao: 'Venda com valor declarado 81,8% ACIMA da avaliação de mercado da região. Típico indício de lavagem com superfaturamento para justificar entrada limpa de capital.',
    dataTransacao: '10/08/2026',
    cartorioOficio: '2º Ofício de Registro de Imóveis do Rio',
    matriculaCartorio: 'MATR-RJ-993.412'
  }
];

export const mockFlowScoreConditions: FlowScoreCondition[] = [
  {
    id: 'FLOW-01',
    nome: 'Operações em Horário Noturno / Madrugada (22h - 06h)',
    descricao: 'Pontua associados com operações concentradas fora do horário bancário regular sem perfil comercial 24h.',
    categoria: 'HORARIO',
    campoGatilho: 'transacoes_madrugada_count',
    operador: '>=',
    valorReferencia: 3,
    pontosScore: 25,
    pesoMensal: 'MEDIO',
    procedimentoSqlSnippet: `IF (v_transacoes_madrugada >= 3) THEN
    v_score_acumulado := v_score_acumulado + 25;
    INSERT INTO tb_score_log (cooperado_id, regra, pontos, data_aplicacao)
    VALUES (p_cooperado_id, 'FLOW-01-HORARIO-NOTURNO', 25, NOW());
END IF;`,
    ativo: true
  },
  {
    id: 'FLOW-02',
    nome: 'Movimentação Atípica em Horário de Jogos / Bets',
    descricao: 'Múltiplos débitos ou créditos via PIX durante rodadas de futebol e eventos esportivos com características de apostas.',
    categoria: 'JOGOS_APOSTAS',
    campoGatilho: 'transacoes_horario_jogos_vol',
    operador: '>',
    valorReferencia: 15000,
    pontosScore: 35,
    pesoMensal: 'ALTO',
    procedimentoSqlSnippet: `IF (v_vol_horario_jogos > 15000.00 AND v_qtd_jogos >= 5) THEN
    v_score_acumulado := v_score_acumulado + 35;
    v_flag_apostas := TRUE;
    INSERT INTO tb_score_log (cooperado_id, regra, pontos, data_aplicacao)
    VALUES (p_cooperado_id, 'FLOW-02-JOGOS-APOSTAS', 35, NOW());
END IF;`,
    ativo: true
  },
  {
    id: 'FLOW-03',
    nome: 'Discrepância Renda x Volume Mensal (> 300%)',
    descricao: 'Volume financeiro mensal transacionado excede 3 vezes a capacidade financeira e renda declarada cadastral.',
    categoria: 'DISCREPANCIA',
    campoGatilho: 'volume_mensal / renda_declarada',
    operador: '>',
    valorReferencia: 3.0,
    pontosScore: 40,
    pesoMensal: 'ALTO',
    procedimentoSqlSnippet: `IF (v_renda_declarada > 0 AND (v_volume_mes / v_renda_declarada) > 3.0) THEN
    v_score_acumulado := v_score_acumulado + 40;
    INSERT INTO tb_score_log (cooperado_id, regra, pontos, data_aplicacao)
    VALUES (p_cooperado_id, 'FLOW-03-DISCREPANCIA-RENDA', 40, NOW());
END IF;`,
    ativo: true
  },
  {
    id: 'FLOW-04',
    nome: 'Dispositivo com Score de Fraude Crítico (> 75)',
    descricao: 'Aparelho ou IP do cooperado com detecção de Root/Jailbreak, emulador ou múltiplos CPFs associados.',
    categoria: 'DISPOSITIVO',
    campoGatilho: 'device_fraud_score',
    operador: '>=',
    valorReferencia: 75,
    pontosScore: 30,
    pesoMensal: 'ALTO',
    procedimentoSqlSnippet: `IF (v_device_fraud_score >= 75 OR v_device_multiplos_cpfs = TRUE) THEN
    v_score_acumulado := v_score_acumulado + 30;
    INSERT INTO tb_score_log (cooperado_id, regra, pontos, data_aplicacao)
    VALUES (p_cooperado_id, 'FLOW-04-DEVICE-FRAUD', 30, NOW());
END IF;`,
    ativo: true
  },
  {
    id: 'FLOW-05',
    nome: 'Incompatibilidade em Venda de Imóveis no Bairro',
    descricao: 'Identificação de transação imobiliária com subfaturamento > 35% ou incompatibilidade com renda mensal.',
    categoria: 'IMOVEIS',
    campoGatilho: 'imovel_discrepancia_perc',
    operador: '<=',
    valorReferencia: -35.0,
    pontosScore: 30,
    pesoMensal: 'MEDIO',
    procedimentoSqlSnippet: `IF (v_imovel_discrepancia <= -35.0 AND v_imovel_capacidade_compativel = FALSE) THEN
    v_score_acumulado := v_score_acumulado + 30;
    INSERT INTO tb_score_log (cooperado_id, regra, pontos, data_aplicacao)
    VALUES (p_cooperado_id, 'FLOW-05-IMOVEIS-CARTORIO', 30, NOW());
END IF;`,
    ativo: true
  },
  {
    id: 'FLOW-06',
    nome: 'Região de Fronteira ou Mineração com Espécie',
    descricao: 'Operações em municípios situados na faixa de fronteira internacional ou polo de garimpo com movimentação em espécie.',
    categoria: 'GEOGRAFICO',
    campoGatilho: 'is_regiao_fronteira_mineracao',
    operador: 'EQUALS',
    valorReferencia: 'TRUE',
    pontosScore: 35,
    pesoMensal: 'CRITICO',
    procedimentoSqlSnippet: `IF (v_regiao_risco IN ('Fronteira', 'Mineração') AND v_volume_especie > 20000.00) THEN
    v_score_acumulado := v_score_acumulado + 35;
    INSERT INTO tb_score_log (cooperado_id, regra, pontos, data_aplicacao)
    VALUES (p_cooperado_id, 'FLOW-06-FATOR-GEOGRAFICO', 35, NOW());
END IF;`,
    ativo: true
  }
];

export const mockMonitoramentos: MonitoramentoCustomizado[] = [
  {
    id: 'MON-01',
    nome: 'Monitor Noturno de Operações PIX (23h às 05h)',
    tipo: 'FAIXA_HORARIO',
    descricao: 'Monitora transferências de saída acima de R$ 5.000 durante a madrugada com repasse imediato.',
    parametros: {
      horarioInicio: '23:00',
      horarioFim: '05:00',
      diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
      volumeMinimo: 5000,
    },
    acaoAlerta: 'GERAR_ALERTA_CRITICO',
    status: 'ATIVO',
    totalDisparosMes: 14,
    criadoPor: 'Maísa Ramos (PLD)',
    dataCriacao: '01/08/2026'
  },
  {
    id: 'MON-02',
    nome: 'Monitor de Atipicidade em Horário de Jogos de Futebol',
    tipo: 'HORARIO_JOGOS',
    descricao: 'Rastreia transações repetidas com valores quebrados ou redondos durante partidas de futebol (quartas à noite e finais de semana).',
    parametros: {
      apenasEmHorarioDeJogos: true,
      volumeMinimo: 10000,
      diasSemana: ['Quarta', 'Sábado', 'Domingo'],
    },
    acaoAlerta: 'PONTUAR_SCORE_MENSAL',
    status: 'ATIVO',
    totalDisparosMes: 8,
    criadoPor: 'Compliance COOPERFORTE',
    dataCriacao: '05/08/2026'
  },
  {
    id: 'MON-03',
    nome: 'Monitor de Discrepância Renda x Patrimônio Imobiliário',
    tipo: 'DISCREPANCIA_RENDA',
    descricao: 'Compara aquisições registradas em cartórios de imóveis com a renda declarada do cooperado.',
    parametros: {
      multiplicadorRenda: 3.5,
      bairroImovel: 'TODOS',
    },
    acaoAlerta: 'DILIGENCIA_AUTOMATICA',
    status: 'ATIVO',
    totalDisparosMes: 5,
    criadoPor: 'Auditoria Interna',
    dataCriacao: '10/08/2026'
  },
  {
    id: 'MON-04',
    nome: 'Monitor de Dispositivos com Risco de Fraude Elevado',
    tipo: 'DISPOSITIVO_ALTO_RISCO',
    descricao: 'Dispara flag quando associado acessa por aparelho com Root/Jailbreak ou IMEI compartilhado.',
    parametros: {
      scoreFraudeMinimo: 70,
    },
    acaoAlerta: 'GERAR_ALERTA_CRITICO',
    status: 'ATIVO',
    totalDisparosMes: 19,
    criadoPor: 'Segurança Cibernética / GECON',
    dataCriacao: '12/08/2026'
  }
];

export const mockDefaultDevices: Record<string, DeviceIntelligence> = {
  'ALT-PLD-2026-9401': {
    deviceId: 'DEV-IOS-9821-MT',
    modelo: 'Apple iPhone 14 Pro Max',
    sistemaOperacional: 'iOS 17.5.1',
    ip: '177.136.210.84',
    localizacaoGeo: 'Cáceres / MT (Faixa de Fronteira Brasil-Bolívia)',
    provedorIsp: 'Claro Telecomunicações S.A.',
    scoreRiscoFraude: 89,
    nivelRiscoFraude: 'Crítico',
    notasAltas: [
      'Dispositivo com Jailbreak/Root detectado',
      'Geovelocidade impossível: acesso registrado em Brasília e 40 minutos depois em Cáceres',
      '3 CPFs distintos logados no mesmo aparelho nos últimos 15 dias',
      'Uso de proxy anônimo/VPN para mascarar conexão internacional'
    ],
    vpnAtiva: true,
    multiplosCpfsAssociados: true,
    emuladorDetectado: false,
    simSwapRecente: true,
    dataUltimoAcesso: '20/08/2026 08:24'
  },
  'ALT-PLD-2026-9402': {
    deviceId: 'DEV-AND-4412-DF',
    modelo: 'Samsung Galaxy S24 Ultra',
    sistemaOperacional: 'Android 14 (OneUI 6.1)',
    ip: '189.32.14.102',
    localizacaoGeo: 'Brasília / DF (Asa Sul)',
    provedorIsp: 'Vivo / Telefônica Brasil S.A.',
    scoreRiscoFraude: 22,
    nivelRiscoFraude: 'Baixo',
    notasAltas: [],
    vpnAtiva: false,
    multiplosCpfsAssociados: false,
    emuladorDetectado: false,
    simSwapRecente: false,
    dataUltimoAcesso: '20/08/2026 09:10'
  },
  'ALT-PLD-2026-9403': {
    deviceId: 'DEV-WIN-8831-SP',
    modelo: 'Dell Latitude 5540 / Chrome 127',
    sistemaOperacional: 'Windows 11 Pro Enterprise',
    ip: '200.18.91.45',
    localizacaoGeo: 'São Paulo / SP (Moema)',
    provedorIsp: 'Algar Telecom S.A.',
    scoreRiscoFraude: 78,
    nivelRiscoFraude: 'Alto',
    notasAltas: [
      'Acesso via ambiente virtualizado / Sandbox emulador',
      'Certificado digital utilizado a partir de rede corporativa não cadastrada',
      '2 tentativas de login com credenciais incorretas antes do sucesso'
    ],
    vpnAtiva: true,
    multiplosCpfsAssociados: false,
    emuladorDetectado: true,
    simSwapRecente: false,
    dataUltimoAcesso: '19/08/2026 18:45'
  },
  'ALT-PLD-2026-9404': {
    deviceId: 'DEV-XIA-3019-PR',
    modelo: 'Xiaomi Redmi Note 13 Pro',
    sistemaOperacional: 'Android 13 (MIUI 14)',
    ip: '179.184.22.91',
    localizacaoGeo: 'Curitiba / PR (Batel)',
    provedorIsp: 'TIM Brasil S.A.',
    scoreRiscoFraude: 82,
    nivelRiscoFraude: 'Crítico',
    notasAltas: [
      'Dispositivo com histórico em bureau de prevenção a fraudes de e-commerce',
      'Múltiplos números de telefone associados ao dispositivo no último trimestre',
      'Conexão identificada em servidor TOR / saída suspeita'
    ],
    vpnAtiva: true,
    multiplosCpfsAssociados: true,
    emuladorDetectado: false,
    simSwapRecente: true,
    dataUltimoAcesso: '20/08/2026 07:15'
  }
};
