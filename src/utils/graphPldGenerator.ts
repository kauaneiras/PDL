import { GraphNode, GraphEdge, Transaction, CasoInvestigacao } from '../types';

export interface PldNetworkDataset {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalTransacoesAvaliadas: number;
  volumeTotalAuditado: number;
  estatisticas: {
    familiaresCount: number;
    familiaresVolume: number;
    naoFamiliaresCount: number;
    naoFamiliaresVolume: number;
    empresasCount: number;
    empresasVolume: number;
    especieVolume: number;
    suspeitasCount: number;
  };
  todasTransacoes: Transaction[];
}

/**
 * Gera um dataset topológico com milhares de transações e nós circulares
 * com geometria radial canônica e vínculos de familiares, não-familiares e empresas.
 */
export function generateCanonicalPldGraph(caso: CasoInvestigacao): PldNetworkDataset {
  const isCaceres = caso.regiaoRisco === 'Fronteira' || caso.id === 'case-001';
  const isPep = caso.isPep || caso.id === 'case-002';
  const isMineracao = caso.regiaoRisco === 'Mineração' || caso.id === 'case-003';

  const baseName = caso.nome;
  const baseCpf = caso.cpf;
  const cidade = caso.kyc.cidadeUf;

  const todasTransacoes: Transaction[] = [];

  // Helper para gerar transações individuais de uma pessoa
  const makeTransactions = (
    contraparte: string,
    cpfCnpj: string,
    count: number,
    baseVal: number,
    metodo: 'PIX' | 'TED' | 'Espécie' | 'Boleto' | 'Amortização',
    isSuspeita: boolean,
    motivo: string
  ): Transaction[] => {
    const list: Transaction[] = [];
    for (let i = 1; i <= count; i++) {
      const variacao = (Math.random() * 0.4 - 0.2) * baseVal;
      const valor = Math.round((baseVal + variacao) * 100) / 100;
      const dia = (10 + (i % 10)).toString().padStart(2, '0');
      const mes = '08';
      const hora = (8 + (i % 10)).toString().padStart(2, '0') + ':' + (10 + (i * 7) % 50).toString().padStart(2, '0') + ':00';
      const tipo = valor > 0 ? (i % 3 === 0 ? 'Débito' : 'Crédito') : 'Débito';

      const tx: Transaction = {
        id: `tx-${cpfCnpj.replace(/\D/g, '').slice(0, 5)}-${i}`,
        data: `${dia}/${mes}/2026`,
        hora,
        tipo: tipo as any,
        origem: metodo === 'Espécie' ? 'Depósito em Espécie ATM' : `${metodo} Recebido/Enviado`,
        contraparte,
        contraparteCpfCnpj: cpfCnpj,
        contraparteBanco: metodo === 'PIX' ? 'Banco Central / DICT' : 'Cooperativa de Crédito Ag. Central',
        valor: tipo === 'Débito' ? -Math.abs(valor) : Math.abs(valor),
        saldoApos: 45000 + i * 1200,
        categoria: metodo === 'Espécie' ? 'Espécie' : 'Transferência Eletrônica',
        metodo,
        isSuspeita: isSuspeita && (i % 2 === 0 || count < 10),
        motivoSuspeita: motivo,
        cpfDepositanteIdentificado: metodo !== 'Espécie' || i % 2 !== 0,
        cpfDepositante: metodo === 'Espécie' && i % 2 !== 0 ? cpfCnpj : undefined
      };
      list.push(tx);
      todasTransacoes.push(tx);
    }
    return list;
  };

  // 1. Amostras de Transações para as entidades do grafo
  const txEsposa = makeTransactions(
    'Mariana Santos (Cônjuge)',
    '419.821.092-10',
    64,
    2200,
    'PIX',
    true,
    'Transferências rotineiras com pulverização de saldos de contas satélites'
  );

  const txFilho = makeTransactions(
    'Lucas Eduardo Santos (Filho)',
    '518.390.112-33',
    28,
    1400,
    'PIX',
    false,
    'Mesada e custeio acadêmico'
  );

  const txIrmao = makeTransactions(
    'Rodrigo Santos (Irmão / Procurador)',
    '312.904.881-77',
    42,
    3800,
    'TED',
    true,
    'Repasse financeiro recorrente sem justificativa societária'
  );

  const txMae = makeTransactions(
    'Helena Aparecida Santos (Mãe)',
    '109.482.301-55',
    18,
    1200,
    'PIX',
    false,
    'Aporte para subsistência familiar'
  );

  const txAtmCentro = makeTransactions(
    'ATM Agência Centro (Depositante não identificado)',
    'ATM-CAIXA-04',
    34,
    9850,
    'Espécie',
    true,
    'Fracionamento de depósitos em espécie logo abaixo do limite objetivo de R$ 10k'
  );

  const txAtmRodoviaria = makeTransactions(
    'ATM Terminal Rodoviária (Depositante não identificado)',
    'ATM-CAIXA-08',
    22,
    9700,
    'Espécie',
    true,
    'Smurfing contínuo em terminal fora do expediente bancário'
  );

  const txLogistica = makeTransactions(
    'Joaquim Peixoto (Motorista / Terceiro)',
    '819.201.442-90',
    38,
    1950,
    'PIX',
    false,
    'Fretes e transporte autônomo'
  );

  const txPassagem = makeTransactions(
    'Ana Beatriz Ramos (Conta de Passagem / Laranja)',
    '710.293.441-12',
    16,
    8500,
    'PIX',
    true,
    'Crédito e drenagem em menos de 15 minutos (Pass-through)'
  );

  const txEmpresa1 = makeTransactions(
    'Santos Distribuidora ME (CNPJ Inapto)',
    '38.102.944/0001-19',
    110,
    2540,
    'TED',
    true,
    'Movimentação em PJ inapta por omissão de declarações fiscais'
  );

  const txPosto = makeTransactions(
    'Auto Posto Fronteira Ltda',
    '14.209.481/0001-44',
    52,
    1250,
    'Boleto',
    false,
    'Pagamentos de combustíveis e suprimentos da frota'
  );

  const txAgro = makeTransactions(
    'Agropecuária Pantanal Export Ltda',
    '08.192.481/0001-22',
    26,
    4400,
    'TED',
    true,
    'Triangulação comercial sem notas fiscais eletrônicas de suporte'
  );

  const txBebidas = makeTransactions(
    'Comercial de Bebidas Cáceres Ltda',
    '22.109.842/0001-09',
    39,
    2100,
    'PIX',
    false,
    'Fornecimento regular de mercadorias'
  );

  // Transações do 2º Alvo Crítico
  const txSocio = makeTransactions(
    'Marcos Vinícius Prado (Sócio Operador / Alvo 2)',
    '819.012.839-44',
    48,
    8750,
    'TED',
    true,
    'Repasse vultoso de 85% do saldo em janela inferior a 24 horas'
  );

  const txDeltaOffshore = makeTransactions(
    'Delta Corp Participações Ltda (Offshore / Fachada)',
    '99.821.092/0001-88',
    18,
    21600,
    'TED',
    true,
    'Evasão de divisas para offshore em paraíso fiscal'
  );

  const txMineradora = makeTransactions(
    'Mineradora Ouro Velho Eireli',
    '19.482.019/0001-30',
    12,
    15000,
    'TED',
    true,
    'Aporte sem DTVM e sem comprovação de lastro de extração de ouro'
  );

  const txAdvogado = makeTransactions(
    'Dr. Fábio Arruda (Procurador Jurídico)',
    '401.928.331-50',
    14,
    3900,
    'PIX',
    false,
    'Honorários advocatícios e assessoria'
  );

  const txContador = makeTransactions(
    'Sérgio Bales (Contabilidade Terceirizada)',
    '619.201.884-21',
    20,
    1200,
    'PIX',
    false,
    'Serviços contábeis mensais'
  );

  const txBeneficiarioOculto = makeTransactions(
    'Beneficiário Final Oculto (Offshore Custody)',
    'OFFSHORE-PANAMA-99',
    8,
    31250,
    'TED',
    true,
    'Última camada de dissimulação de patrimônio no exterior'
  );

  const txIrmaDoSocio = makeTransactions(
    'Carla Prado (Irmã do Sócio - Familiar 2º Grau)',
    '921.849.201-14',
    16,
    2800,
    'PIX',
    true,
    'Triangulação para blindagem patrimonial com parentes de sócio'
  );

  // Geração de lote de milhares de transações de background para simulação de carga PLD
  const transacoesSinteticasAdicionais = 2650;
  for (let i = 1; i <= transacoesSinteticasAdicionais; i++) {
    const val = Math.round((Math.random() * 800 + 40) * 100) / 100;
    todasTransacoes.push({
      id: `bg-tx-${i}`,
      data: `${(1 + (i % 28)).toString().padStart(2, '0')}/08/2026`,
      hora: `${(7 + (i % 14)).toString().padStart(2, '0')}:${(10 + (i % 50)).toString().padStart(2, '0')}:00`,
      tipo: i % 4 === 0 ? 'Crédito' : 'Débito',
      origem: i % 5 === 0 ? 'Depósito ATM' : i % 3 === 0 ? 'PIX' : 'Cartão de Débito',
      contraparte: i % 2 === 0 ? 'Estabelecimento Comercial Varejo' : 'Transferência P2P',
      valor: i % 4 === 0 ? val : -val,
      saldoApos: 20000 + (i % 500) * 10,
      categoria: 'Consumo Corrente',
      metodo: i % 5 === 0 ? 'Espécie' : 'PIX',
      isSuspeita: false
    });
  }

  // 2. Montagem dos Nós Redondos com Geometria Radial Canônica da Imagem
  const nodes: GraphNode[] = [
    // --- NÓ 1: INVESTIGADO PRINCIPAL (Rosa/Vermelho Duplo Concêntrico) ---
    {
      id: 'node-investigado',
      type: 'MAIN',
      position: { x: 310, y: 310 },
      data: {
        label: baseName,
        subLabel: `Alvo Central • ${cidade.split('/')[0]}`,
        type: 'MAIN',
        cpfCnpj: baseCpf,
        risk: caso.risco,
        relationType: 'investigado',
        totalVolume: caso.volumeAtipicoPeriodo || caso.valorEnvolvido,
        transacoesCount: todasTransacoes.length,
        notes: `Investigado por ${caso.tipologiaPld}. Volume atípico de R$ ${(caso.volumeAtipicoPeriodo || caso.valorEnvolvido).toLocaleString('pt-BR')}.`
      }
    },

    // --- NÓS SATÉLITES DE ATRIBUTOS / DOSSIÊ À ESQUERDA ---
    {
      id: 'attr-globe',
      type: 'ATTRIBUTE',
      position: { x: 260, y: 120 },
      data: {
        label: 'Fator Geográfico',
        detalheAtributo: isCaceres ? 'Fronteira com a Bolívia' : isMineracao ? 'Polo de Garimpo/Ouro' : 'São Paulo / Capital',
        type: 'ATTRIBUTE',
        attributeType: 'globe',
        relationType: 'atributo',
        notes: 'Área com multiplicador de risco reforçado pelo BACEN/COAF.'
      }
    },
    {
      id: 'attr-piggy',
      type: 'ATTRIBUTE',
      position: { x: 390, y: 140 },
      data: {
        label: 'Patrimônio Cadastral',
        detalheAtributo: `Declarado: R$ ${caso.capacidadeFinanceira?.patrimonioDeclarado.toLocaleString('pt-BR') || '60.000,00'}`,
        type: 'ATTRIBUTE',
        attributeType: 'piggy',
        relationType: 'atributo',
        notes: 'Capacidade financeira declarada no cadastro inicial do associado.'
      }
    },
    {
      id: 'attr-search',
      type: 'ATTRIBUTE',
      position: { x: 170, y: 190 },
      data: {
        label: 'Bureau & Compliance',
        detalheAtributo: `Serasa: ${caso.kyc.scoreSerasa} pts • KYC Inapto`,
        type: 'ATTRIBUTE',
        attributeType: 'search',
        relationType: 'atributo',
        notes: 'Cruzamento com birôs de crédito e órgãos de controle.'
      }
    },
    {
      id: 'attr-cash',
      type: 'ATTRIBUTE',
      position: { x: 140, y: 310 },
      data: {
        label: 'Dinheiro em Espécie (COE)',
        detalheAtributo: '11 depósitos < R$ 10k',
        type: 'ATTRIBUTE',
        attributeType: 'cash',
        relationType: 'atributo',
        notes: 'Padrão clássico de burla do limite de R$ 50.000 da Circular BACEN 3.978/20.'
      }
    },
    {
      id: 'attr-news',
      type: 'ATTRIBUTE',
      position: { x: 170, y: 430 },
      data: {
        label: 'Mídias Desabonadoras',
        detalheAtributo: isCaceres ? 'Inquérito DEFRON-MT 2025' : isPep ? 'Contratos Emergenciais' : 'Sem apontamentos graves',
        type: 'ATTRIBUTE',
        attributeType: 'news',
        relationType: 'atributo',
        notes: 'Monitoramento contínuo de notícias, Diários Oficiais e tribunais.'
      }
    },
    {
      id: 'attr-house',
      type: 'ATTRIBUTE',
      position: { x: 230, y: 520 },
      data: {
        label: 'Imóveis & Domicílio',
        detalheAtributo: caso.kyc.endereco,
        type: 'ATTRIBUTE',
        attributeType: 'house',
        relationType: 'atributo',
        notes: 'Endereço residencial e fiscal do investigado.'
      }
    },
    {
      id: 'attr-card',
      type: 'ATTRIBUTE',
      position: { x: 340, y: 530 },
      data: {
        label: 'Meios de Pagamento',
        detalheAtributo: '2 Cartões Ativos • PIX DICT',
        type: 'ATTRIBUTE',
        attributeType: 'card',
        relationType: 'atributo',
        notes: 'Instrumentos eletrônicos de pagamento sob monitoramento transacional.'
      }
    },

    // --- NÓ 2: HUB DA CONTA CORRENTE "CC" (Azul Cobalto Central) ---
    {
      id: 'node-hub-cc',
      type: 'HUB_CC',
      position: { x: 800, y: 350 },
      data: {
        label: 'Conta Corrente Principal',
        subLabel: `${caso.kyc.contasVinculadas[0]?.banco.split('(')[0] || 'Cooperativa'} Ag. 0420 / CC 58192-3`,
        type: 'HUB_CC',
        relationType: 'conta_corrente',
        totalVolume: 1845000.00,
        transacoesCount: todasTransacoes.length,
        notes: 'Conta bancária centralizadora de onde partem e chegam todos os créditos de familiares, terceiros e empresas.'
      }
    },

    // --- SATÉLITES RADIAIS DO HUB CC ---
    // Familiares (Verdes)
    {
      id: 'node-fam-esposa',
      type: 'FAMILY',
      position: { x: 680, y: 200 },
      data: {
        label: 'Mariana Santos',
        subLabel: 'Esposa (Familiar 1º Grau)',
        type: 'FAMILY',
        relationType: 'familiar',
        grauParentesco: 'Cônjuge / 1º Grau',
        cpfCnpj: '419.821.092-10',
        risk: 'Alto',
        totalVolume: 142500.00,
        transacoesCount: txEsposa.length,
        transactionsSample: txEsposa,
        notes: 'Recebe transferências fragmentadas e efetua pagamentos de bens e despesas de alto padrão.'
      }
    },
    {
      id: 'node-fam-filho',
      type: 'FAMILY',
      position: { x: 630, y: 280 },
      data: {
        label: 'Lucas Eduardo Santos',
        subLabel: 'Filho (Familiar 1º Grau)',
        type: 'FAMILY',
        relationType: 'familiar',
        grauParentesco: 'Filho / 1º Grau',
        cpfCnpj: '518.390.112-33',
        risk: 'Baixo',
        totalVolume: 38000.00,
        transacoesCount: txFilho.length,
        transactionsSample: txFilho,
        notes: 'Movimentações de mesada e despesas educacionais regulares.'
      }
    },
    {
      id: 'node-fam-irmao',
      type: 'FAMILY',
      position: { x: 820, y: 550 },
      data: {
        label: 'Rodrigo Santos',
        subLabel: 'Irmão / Procurador',
        type: 'FAMILY',
        relationType: 'familiar',
        grauParentesco: 'Irmão / 2º Grau',
        cpfCnpj: '312.904.881-77',
        risk: 'Médio',
        totalVolume: 79400.00,
        transacoesCount: txIrmao.length,
        transactionsSample: txIrmao,
        notes: 'Procurador em contas bancárias com saques e TEDs recíprocas.'
      }
    },
    {
      id: 'node-fam-mae',
      type: 'FAMILY',
      position: { x: 900, y: 520 },
      data: {
        label: 'Helena Aparecida Santos',
        subLabel: 'Mãe (Familiar 1º Grau)',
        type: 'FAMILY',
        relationType: 'familiar',
        grauParentesco: 'Mãe / 1º Grau',
        cpfCnpj: '109.482.301-55',
        risk: 'Baixo',
        totalVolume: 22000.00,
        transacoesCount: txMae.length,
        transactionsSample: txMae,
        notes: 'Depósitos mensais para subsistência sem indício de lavagem.'
      }
    },

    // Não-Familiares / Terceiros (Cinzas)
    {
      id: 'node-third-atm1',
      type: 'COUNTERPARTY',
      position: { x: 740, y: 150 },
      data: {
        label: 'ATM Caixa 04 (Centro)',
        subLabel: 'Depositante não identificado',
        type: 'COUNTERPARTY',
        relationType: 'nao_familiar',
        risk: 'Crítico',
        totalVolume: 98450.00,
        transacoesCount: txAtmCentro.length,
        transactionsSample: txAtmCentro,
        notes: 'Múltiplos depósitos consecutivos em espécie abaixo de R$ 10.000 sem identificação de CPF do depositante.'
      }
    },
    {
      id: 'node-third-atm2',
      type: 'COUNTERPARTY',
      position: { x: 830, y: 140 },
      data: {
        label: 'ATM Rodoviária Cáceres',
        subLabel: 'Terminal de Fronteira',
        type: 'COUNTERPARTY',
        relationType: 'nao_familiar',
        risk: 'Crítico',
        totalVolume: 78000.00,
        transacoesCount: txAtmRodoviaria.length,
        transactionsSample: txAtmRodoviaria,
        notes: 'Depósitos em dinheiro vivo em terminal distante durante a madrugada.'
      }
    },
    {
      id: 'node-third-logistica',
      type: 'COUNTERPARTY',
      position: { x: 620, y: 400 },
      data: {
        label: 'Joaquim Peixoto',
        subLabel: 'Motorista Autônomo',
        type: 'COUNTERPARTY',
        relationType: 'nao_familiar',
        risk: 'Médio',
        totalVolume: 54200.00,
        transacoesCount: txLogistica.length,
        transactionsSample: txLogistica,
        notes: 'Recebe transferências PIX frequentes de frete e transporte.'
      }
    },
    {
      id: 'node-third-passagem',
      type: 'COUNTERPARTY',
      position: { x: 710, y: 520 },
      data: {
        label: 'Ana Beatriz Ramos',
        subLabel: 'Conta de Passagem (Mula)',
        type: 'COUNTERPARTY',
        relationType: 'nao_familiar',
        risk: 'Crítico',
        totalVolume: 44000.00,
        transacoesCount: txPassagem.length,
        transactionsSample: txPassagem,
        notes: 'Retenção menor que 1 hora, repassando o dinheiro integralmente.'
      }
    },

    // Empresas / PJs (Laranjas)
    {
      id: 'node-comp-santos',
      type: 'COMPANY',
      position: { x: 650, y: 490 },
      data: {
        label: 'Santos Distribuidora ME',
        subLabel: 'CNPJ Inapto (Empresa do Titular)',
        type: 'COMPANY',
        relationType: 'empresa',
        cpfCnpj: '38.102.944/0001-19',
        risk: 'Crítico',
        totalVolume: 280000.00,
        transacoesCount: txEmpresa1.length,
        transactionsSample: txEmpresa1,
        notes: 'Empresa inapta junto à Receita Federal movimentando volume vultoso.'
      }
    },
    {
      id: 'node-comp-posto',
      type: 'COMPANY',
      position: { x: 970, y: 480 },
      data: {
        label: 'Auto Posto Fronteira',
        subLabel: 'Posto de Combustíveis',
        type: 'COMPANY',
        relationType: 'empresa',
        cpfCnpj: '14.209.481/0001-44',
        risk: 'Baixo',
        totalVolume: 65000.00,
        transacoesCount: txPosto.length,
        transactionsSample: txPosto,
        notes: 'Despesas com abastecimento e manutenção de caminhões.'
      }
    },
    {
      id: 'node-comp-agro',
      type: 'COMPANY',
      position: { x: 910, y: 200 },
      data: {
        label: 'Agropecuária Pantanal',
        subLabel: 'Comércio de Gado e Grãos',
        type: 'COMPANY',
        relationType: 'empresa',
        cpfCnpj: '08.192.481/0001-22',
        risk: 'Alto',
        totalVolume: 115000.00,
        transacoesCount: txAgro.length,
        transactionsSample: txAgro,
        notes: 'Transações vultosas sem Guias de Trânsito Animal (GTA) anexadas.'
      }
    },

    // --- NÓ 3: SEGUNDO ALVO DE ALTO RISCO (Rosa/Vermelho Duplo Concêntrico - Conectado por Linha Vermelha) ---
    {
      id: 'node-highrisk-target',
      type: 'HIGH_RISK',
      position: { x: 1060, y: 320 },
      data: {
        label: 'Marcos Vinícius Prado',
        subLabel: 'Sócio Operador • 2º Alvo Crítico',
        type: 'HIGH_RISK',
        relationType: 'alto_risco',
        cpfCnpj: '819.012.839-44',
        risk: 'Crítico',
        totalVolume: 420000.00,
        transacoesCount: txSocio.length,
        transactionsSample: txSocio,
        notes: 'Principal receptor de recursos do investigado. Operador financeiro responsável pela remessa offshore.'
      }
    },

    // --- SATÉLITES DO SEGUNDO ALVO DE ALTO RISCO ---
    {
      id: 'node-sec-fam-irma',
      type: 'FAMILY',
      position: { x: 1110, y: 520 },
      data: {
        label: 'Carla Prado',
        subLabel: 'Irmã do Sócio (Familiar 2º Grau)',
        type: 'FAMILY',
        relationType: 'familiar',
        grauParentesco: 'Irmã do Sócio / 2º Grau',
        cpfCnpj: '921.849.201-14',
        risk: 'Alto',
        totalVolume: 45000.00,
        transacoesCount: txIrmaDoSocio.length,
        transactionsSample: txIrmaDoSocio,
        notes: 'Conta bancária utilizada para ocultar recursos de titularidade do operador.'
      }
    },
    {
      id: 'node-sec-comp-delta',
      type: 'COMPANY',
      position: { x: 1250, y: 220 },
      data: {
        label: 'Delta Corp Participações',
        subLabel: 'Offshore / Fachada',
        type: 'COMPANY',
        relationType: 'empresa',
        cpfCnpj: '99.821.092/0001-88',
        risk: 'Crítico',
        totalVolume: 390000.00,
        transacoesCount: txDeltaOffshore.length,
        transactionsSample: txDeltaOffshore,
        notes: 'Pessoa jurídica com sócios laranjas constituída em paraíso fiscal.'
      }
    },
    {
      id: 'node-sec-comp-ouro',
      type: 'COMPANY',
      position: { x: 1260, y: 340 },
      data: {
        label: 'Mineradora Ouro Velho',
        subLabel: 'Beneficiamento de Minério',
        type: 'COMPANY',
        relationType: 'empresa',
        cpfCnpj: '19.482.019/0001-30',
        risk: 'Crítico',
        totalVolume: 180000.00,
        transacoesCount: txMineradora.length,
        transactionsSample: txMineradora,
        notes: 'Sem notas fiscais eletrônicas de extração legal de ouro.'
      }
    },
    {
      id: 'node-sec-third-adv',
      type: 'COUNTERPARTY',
      position: { x: 1040, y: 120 },
      data: {
        label: 'Dr. Fábio Arruda',
        subLabel: 'Procurador / Advogado',
        type: 'COUNTERPARTY',
        relationType: 'nao_familiar',
        risk: 'Baixo',
        totalVolume: 55000.00,
        transacoesCount: txAdvogado.length,
        transactionsSample: txAdvogado,
        notes: 'Honorários advocatícios comprovados por contrato.'
      }
    },
    {
      id: 'node-sec-third-cont',
      type: 'COUNTERPARTY',
      position: { x: 1240, y: 440 },
      data: {
        label: 'Sérgio Bales',
        subLabel: 'Contabilidade Terceirizada',
        type: 'COUNTERPARTY',
        relationType: 'nao_familiar',
        risk: 'Baixo',
        totalVolume: 24000.00,
        transacoesCount: txContador.length,
        transactionsSample: txContador,
        notes: 'Prestação regular de serviços de assessoria contábil.'
      }
    },
    {
      id: 'node-sec-high-offshore',
      type: 'HIGH_RISK',
      position: { x: 1140, y: 140 },
      data: {
        label: 'Beneficiário Final Oculto',
        subLabel: 'Custódia Internacional (Panamá)',
        type: 'HIGH_RISK',
        relationType: 'alto_risco',
        risk: 'Crítico',
        totalVolume: 250000.00,
        transacoesCount: txBeneficiarioOculto.length,
        transactionsSample: txBeneficiarioOculto,
        notes: 'Diligência internacional requerida via cooperação jurídica em PLD.'
      }
    }
  ];

  // 3. Montagem das Arestas (Edges) com Topologia PLD Canônica
  const edges: GraphEdge[] = [
    // --- Linhas Cinzas: Investigado -> Atributos Satélites KYC ---
    { id: 'edge-attr-globe', source: 'node-investigado', target: 'attr-globe', type: 'amlFlow', data: { tipoFluxo: 'ATRIBUTO' }, style: { stroke: '#94A3B8', strokeWidth: 1.8 } },
    { id: 'edge-attr-piggy', source: 'node-investigado', target: 'attr-piggy', type: 'amlFlow', data: { tipoFluxo: 'ATRIBUTO' }, style: { stroke: '#94A3B8', strokeWidth: 1.8 } },
    { id: 'edge-attr-search', source: 'node-investigado', target: 'attr-search', type: 'amlFlow', data: { tipoFluxo: 'ATRIBUTO' }, style: { stroke: '#94A3B8', strokeWidth: 1.8 } },
    { id: 'edge-attr-cash', source: 'node-investigado', target: 'attr-cash', type: 'amlFlow', data: { tipoFluxo: 'ATRIBUTO' }, style: { stroke: '#94A3B8', strokeWidth: 1.8 } },
    { id: 'edge-attr-news', source: 'node-investigado', target: 'attr-news', type: 'amlFlow', data: { tipoFluxo: 'ATRIBUTO' }, style: { stroke: '#94A3B8', strokeWidth: 1.8 } },
    { id: 'edge-attr-house', source: 'node-investigado', target: 'attr-house', type: 'amlFlow', data: { tipoFluxo: 'ATRIBUTO' }, style: { stroke: '#94A3B8', strokeWidth: 1.8 } },
    { id: 'edge-attr-card', source: 'node-investigado', target: 'attr-card', type: 'amlFlow', data: { tipoFluxo: 'ATRIBUTO' }, style: { stroke: '#94A3B8', strokeWidth: 1.8 } },

    // --- LINHA PRETA GROSSA: Investigado Principal -> HUB Conta Corrente "CC" ---
    {
      id: 'edge-investigado-cc',
      source: 'node-investigado',
      target: 'node-hub-cc',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'TITULARIDADE',
        valor: 1845000.00,
        quantidade: todasTransacoes.length,
        metodo: 'CC Ag. 0420',
        detalhe: 'Titularidade e controle societário e financeiro exclusivo (100%)'
      },
      style: { stroke: '#0F172A', strokeWidth: 4.5 }
    },

    // --- FLUXOS FINANCEIROS: HUB CC <-> Satélites ---
    {
      id: 'edge-cc-fam-esposa',
      source: 'node-hub-cc',
      target: 'node-fam-esposa',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'BIDIRECIONAL',
        isBidirecional: true,
        valor: 142500.00,
        quantidade: 64,
        metodo: 'PIX',
        isSuspeita: true,
        creditoTotal: 98000.00,
        debitoTotal: 44500.00,
        transactionsSample: txEsposa,
        detalhe: '64 repasses PIX recíprocos entre titular e cônjuge com pulverização.'
      },
      style: { stroke: '#2563EB', strokeWidth: 3.5 }
    },
    {
      id: 'edge-cc-fam-filho',
      source: 'node-hub-cc',
      target: 'node-fam-filho',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'UNIDIRECIONAL',
        isBidirecional: false,
        valor: 38000.00,
        quantidade: 28,
        metodo: 'PIX',
        isSuspeita: false,
        transactionsSample: txFilho,
        detalhe: '28 repasses mensais de mesada e despesas escolares.'
      },
      style: { stroke: '#2563EB', strokeWidth: 2.2 }
    },
    {
      id: 'edge-cc-fam-irmao',
      source: 'node-hub-cc',
      target: 'node-fam-irmao',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'BIDIRECIONAL',
        isBidirecional: true,
        valor: 79400.00,
        quantidade: 42,
        metodo: 'TED',
        isSuspeita: true,
        transactionsSample: txIrmao,
        detalhe: '42 transferências recíprocas entre contas com procuração ativa.'
      },
      style: { stroke: '#2563EB', strokeWidth: 2.8 }
    },
    {
      id: 'edge-cc-fam-mae',
      source: 'node-hub-cc',
      target: 'node-fam-mae',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'UNIDIRECIONAL',
        isBidirecional: false,
        valor: 22000.00,
        quantidade: 18,
        metodo: 'PIX',
        isSuspeita: false,
        transactionsSample: txMae,
        detalhe: '18 repasses de auxílio familiar regular.'
      },
      style: { stroke: '#2563EB', strokeWidth: 2.0 }
    },
    {
      id: 'edge-cc-third-atm1',
      source: 'node-third-atm1',
      target: 'node-hub-cc',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'UNIDIRECIONAL',
        isBidirecional: false,
        valor: 98450.00,
        quantidade: 34,
        metodo: 'Espécie',
        isSuspeita: true,
        transactionsSample: txAtmCentro,
        detalhe: '34 depósitos fracionados em dinheiro logo abaixo do teto de R$ 10.000.'
      },
      style: { stroke: '#EF4444', strokeWidth: 3.2 }
    },
    {
      id: 'edge-cc-third-atm2',
      source: 'node-third-atm2',
      target: 'node-hub-cc',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'UNIDIRECIONAL',
        isBidirecional: false,
        valor: 78000.00,
        quantidade: 22,
        metodo: 'Espécie',
        isSuspeita: true,
        transactionsSample: txAtmRodoviaria,
        detalhe: '22 depósitos em espécie em terminal remoto de rodoviária.'
      },
      style: { stroke: '#EF4444', strokeWidth: 2.8 }
    },
    {
      id: 'edge-cc-third-log',
      source: 'node-hub-cc',
      target: 'node-third-logistica',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'UNIDIRECIONAL',
        isBidirecional: false,
        valor: 54200.00,
        quantidade: 38,
        metodo: 'PIX',
        isSuspeita: false,
        transactionsSample: txLogistica,
        detalhe: '38 pagamentos por serviços de frete e motorista.'
      },
      style: { stroke: '#2563EB', strokeWidth: 2.4 }
    },
    {
      id: 'edge-cc-third-pass',
      source: 'node-hub-cc',
      target: 'node-third-passagem',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'UNIDIRECIONAL',
        isBidirecional: false,
        valor: 44000.00,
        quantidade: 16,
        metodo: 'PIX',
        isSuspeita: true,
        transactionsSample: txPassagem,
        detalhe: '16 transações de passagem imediata (drenagem em menos de 15 min).'
      },
      style: { stroke: '#EF4444', strokeWidth: 2.5 }
    },
    {
      id: 'edge-cc-comp-santos',
      source: 'node-hub-cc',
      target: 'node-comp-santos',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'BIDIRECIONAL',
        isBidirecional: true,
        valor: 280000.00,
        quantidade: 110,
        metodo: 'TED',
        isSuspeita: true,
        transactionsSample: txEmpresa1,
        detalhe: '110 operações de confusão patrimonial com empresa inapta.'
      },
      style: { stroke: '#EF4444', strokeWidth: 4.5 }
    },
    {
      id: 'edge-cc-comp-posto',
      source: 'node-hub-cc',
      target: 'node-comp-posto',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'UNIDIRECIONAL',
        isBidirecional: false,
        valor: 65000.00,
        quantidade: 52,
        metodo: 'Boleto',
        isSuspeita: false,
        transactionsSample: txPosto,
        detalhe: '52 liquidações de combustível e manutenção veicular.'
      },
      style: { stroke: '#2563EB', strokeWidth: 2.6 }
    },
    {
      id: 'edge-cc-comp-agro',
      source: 'node-hub-cc',
      target: 'node-comp-agro',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'BIDIRECIONAL',
        isBidirecional: true,
        valor: 115000.00,
        quantidade: 26,
        metodo: 'TED',
        isSuspeita: true,
        transactionsSample: txAgro,
        detalhe: '26 TEDs de compra e venda de insumos agro sem emissão de GTA.'
      },
      style: { stroke: '#2563EB', strokeWidth: 3.2 }
    },

    // --- LINHA VERMELHA DE ALTO IMPACTO: HUB CC <-> 2º ALVO DE ALTO RISCO ---
    {
      id: 'edge-cc-target2',
      source: 'node-hub-cc',
      target: 'node-highrisk-target',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'BIDIRECIONAL',
        isBidirecional: true,
        valor: 420000.00,
        quantidade: 48,
        metodo: 'TED',
        isSuspeita: true,
        transactionsSample: txSocio,
        detalhe: '48 repasses de alta monta ao operador financeiro do esquema.'
      },
      style: { stroke: '#EF4444', strokeWidth: 5.5 }
    },

    // --- SATÉLITES DO SEGUNDO ALVO DE ALTO RISCO ---
    {
      id: 'edge-target2-fam-irma',
      source: 'node-highrisk-target',
      target: 'node-sec-fam-irma',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'BIDIRECIONAL',
        isBidirecional: true,
        valor: 45000.00,
        quantidade: 16,
        metodo: 'PIX',
        isSuspeita: true,
        transactionsSample: txIrmaDoSocio,
        detalhe: '16 transações de ocultação patrimonial em conta de familiar.'
      },
      style: { stroke: '#2563EB', strokeWidth: 2.5 }
    },
    {
      id: 'edge-target2-comp-delta',
      source: 'node-highrisk-target',
      target: 'node-sec-comp-delta',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'UNIDIRECIONAL',
        isBidirecional: false,
        valor: 390000.00,
        quantidade: 18,
        metodo: 'Offshore',
        isSuspeita: true,
        transactionsSample: txDeltaOffshore,
        detalhe: '18 transferências de integração em empresa offshore de fachada.'
      },
      style: { stroke: '#EF4444', strokeWidth: 4.8 }
    },
    {
      id: 'edge-target2-comp-ouro',
      source: 'node-highrisk-target',
      target: 'node-sec-comp-ouro',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'BIDIRECIONAL',
        isBidirecional: true,
        valor: 180000.00,
        quantidade: 12,
        metodo: 'TED',
        isSuspeita: true,
        transactionsSample: txMineradora,
        detalhe: '12 transações com mineradora sem comprovação de lastro físico.'
      },
      style: { stroke: '#EF4444', strokeWidth: 3.8 }
    },
    {
      id: 'edge-target2-third-adv',
      source: 'node-highrisk-target',
      target: 'node-sec-third-adv',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'UNIDIRECIONAL',
        isBidirecional: false,
        valor: 55000.00,
        quantidade: 14,
        metodo: 'PIX',
        isSuspeita: false,
        transactionsSample: txAdvogado,
        detalhe: '14 pagamentos de honorários advocatícios comprovados.'
      },
      style: { stroke: '#2563EB', strokeWidth: 2.4 }
    },
    {
      id: 'edge-target2-third-cont',
      source: 'node-highrisk-target',
      target: 'node-sec-third-cont',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'UNIDIRECIONAL',
        isBidirecional: false,
        valor: 24000.00,
        quantidade: 20,
        metodo: 'PIX',
        isSuspeita: false,
        transactionsSample: txContador,
        detalhe: '20 pagamentos regulares de escrituração contábil.'
      },
      style: { stroke: '#2563EB', strokeWidth: 2.0 }
    },
    {
      id: 'edge-target2-high-offshore',
      source: 'node-highrisk-target',
      target: 'node-sec-high-offshore',
      type: 'amlFlow',
      data: {
        tipoFluxo: 'UNIDIRECIONAL',
        isBidirecional: false,
        valor: 250000.00,
        quantidade: 8,
        metodo: 'Remessa Ext.',
        isSuspeita: true,
        transactionsSample: txBeneficiarioOculto,
        detalhe: '8 remessas internacionais destinadas ao beneficiário final oculto.'
      },
      style: { stroke: '#EF4444', strokeWidth: 4.2 }
    }
  ];

  const familiaresNodes = nodes.filter((n) => n.data.relationType === 'familiar');
  const naoFamiliaresNodes = nodes.filter((n) => n.data.relationType === 'nao_familiar');
  const empresasNodes = nodes.filter((n) => n.data.relationType === 'empresa');

  const familiaresVol = familiaresNodes.reduce((acc, n) => acc + (n.data.totalVolume || 0), 0);
  const naoFamiliaresVol = naoFamiliaresNodes.reduce((acc, n) => acc + (n.data.totalVolume || 0), 0);
  const empresasVol = empresasNodes.reduce((acc, n) => acc + (n.data.totalVolume || 0), 0);
  const especieVol = (txAtmCentro.reduce((a, b) => a + Math.abs(b.valor), 0)) + (txAtmRodoviaria.reduce((a, b) => a + Math.abs(b.valor), 0));
  const suspeitasCount = todasTransacoes.filter((t) => t.isSuspeita).length;

  return {
    nodes,
    edges,
    totalTransacoesAvaliadas: todasTransacoes.length,
    volumeTotalAuditado: 2485900.00,
    estatisticas: {
      familiaresCount: familiaresNodes.length,
      familiaresVolume: familiaresVol,
      naoFamiliaresCount: naoFamiliaresNodes.length,
      naoFamiliaresVolume: naoFamiliaresVol,
      empresasCount: empresasNodes.length,
      empresasVolume: empresasVol,
      especieVolume: especieVol,
      suspeitasCount
    },
    todasTransacoes
  };
}
