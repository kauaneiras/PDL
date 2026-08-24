import { CasoInvestigacao, SmartSnippet, RegraMotorPld, LoteCoeRegistro } from '../types';

export const mockRegrasMotor: RegraMotorPld[] = [
  {
    id: 'reg-01',
    codigo: 'REG-COE-01',
    nome: 'Operações em Espécie >= R$ 50.000,00 (COE Obrigatório)',
    categoria: 'Limite Objetivo',
    condicaoLogica: 'SE (Valor Operação >= R$ 50.000,00) E (Forma = "Espécie")',
    pesoRisco: 'Automático (COE)',
    baseLegal: 'Art. 49, Circular BACEN 3.978/2020 e Carta-Circular 4.001/20',
    acaoRecomendada: 'Geração automática de lote SISCOAF / COE em até 24h sem análise discricionária.',
    status: 'Ativa'
  },
  {
    id: 'reg-02',
    codigo: 'REG-DEP-02',
    nome: 'Identificação Obrigatória de Depositante em Espécie > R$ 2.000,00',
    categoria: 'Limite Objetivo',
    condicaoLogica: 'SE (Depósito Espécie > R$ 2.000,00) E (Ausência de CPF/CNPJ do Depositante)',
    pesoRisco: 'Alto',
    baseLegal: 'Art. 42, Circular BACEN 3.978/2020',
    acaoRecomendada: 'Bloqueio de transação no terminal ou alerta imediato para compliance de agência.',
    status: 'Ativa'
  },
  {
    id: 'reg-03',
    codigo: 'REG-BOL-03',
    nome: 'Pagamento de Boletos em Espécie >= R$ 10.000,00',
    categoria: 'Limite Objetivo',
    condicaoLogica: 'SE (Pagamento Boleto >= R$ 10.000,00) E (Forma = "Espécie")',
    pesoRisco: 'Alto',
    baseLegal: 'Carta-Circular 4.001/2020, Item 1.1.2',
    acaoRecomendada: 'Exigência de identificação completa do pagador e origem dos recursos.',
    status: 'Ativa'
  },
  {
    id: 'reg-04',
    codigo: 'REG-FRAC-04',
    nome: 'Fracionamento / Smurfing Acumulado (< R$ 10k somando > R$ 50k em 30d)',
    categoria: 'Fracionamento',
    condicaoLogica: 'SE (Soma 30 dias > R$ 50.000,00) E (Transações Individuais < R$ 10.000,00) E (Qtd Transações >= 5)',
    pesoRisco: 'Crítico',
    baseLegal: 'Art. 38, Inciso I - Circular BACEN 3.978/2020',
    acaoRecomendada: 'Abertura imediata de investigação PLD por indício de burla do limite de COE.',
    status: 'Ativa'
  },
  {
    id: 'reg-05',
    codigo: 'REG-GEO-05',
    nome: 'Fator Geográfico: Região de Fronteira (Tráfico / Contrabando / Evasão)',
    categoria: 'Fator Geográfico',
    condicaoLogica: 'SE (Cidade/Agência em "Faixa de Fronteira") E (Movimentação > 2x Renda OU Espécie > R$ 20k)',
    pesoRisco: 'Crítico',
    baseLegal: 'Circular BACEN 3.978/2020 (Avaliação Interna de Risco Geográfico)',
    acaoRecomendada: 'Ponderação com multiplicador 2.5x no score de risco e checagem de mídias/intervenientes.',
    status: 'Ativa'
  },
  {
    id: 'reg-06',
    codigo: 'REG-GEO-06',
    nome: 'Fator Geográfico: Região de Mineração e Garimpo (Ouro Ilegal / Crimes Ambientais)',
    categoria: 'Fator Geográfico',
    condicaoLogica: 'SE (Cidade/Agência em "Polo de Garimpo/Mineração") E (Transação Sem Lastro NF-e de Ouro)',
    pesoRisco: 'Crítico',
    baseLegal: 'Carta-Circular 4.001/20 e Orientações COAF/PF Garimpo',
    acaoRecomendada: 'Exigência de DTVM (Distribuidora de Títulos e Valores Mobiliários) e Guia de Transporte de Minério.',
    status: 'Ativa'
  },
  {
    id: 'reg-07',
    codigo: 'REG-AMORT-07',
    nome: 'Liquidação Antecipada de Empréstimo (Amortização via DCO com Terceiros/Espécie)',
    categoria: 'Comportamental',
    condicaoLogica: 'SE (Amortização Crédito > R$ 50.000,00) E (Origem = "Espécie" OU "Recursos Terceiros") E (Prazo Restante > 80%)',
    pesoRisco: 'Crítico',
    baseLegal: 'Carta-Circular 4.001/20, Item 1.1.8',
    acaoRecomendada: 'Investigação de lavagem por amortização relâmpago de passivo bancário.',
    status: 'Ativa'
  },
  {
    id: 'reg-08',
    codigo: 'REG-PASS-08',
    nome: 'Movimentação Circular / Conta de Passagem (Pass-through < 24h)',
    categoria: 'Comportamental',
    condicaoLogica: 'SE (Tempo Retenção < 24h) E (Volume Débito >= 90% do Crédito) E (Saldo Residual < 2%)',
    pesoRisco: 'Crítico',
    baseLegal: 'Circular 3.978/2020 Art. 38 Inciso V',
    acaoRecomendada: 'Comunicação SISCOAF por tipologia de conta laranja/mula de passagem.',
    status: 'Ativa'
  },
  {
    id: 'reg-09',
    codigo: 'REG-INCOMP-09',
    nome: 'Incompatibilidade Econômico-Financeira (> 300% / 3x da Renda Presumida)',
    categoria: 'Comportamental',
    condicaoLogica: 'SE (Volume Mensal > 3x a Renda Declarada) E (Tipo Conta != "Salário Exclusiva")',
    pesoRisco: 'Alto',
    baseLegal: 'Carta-Circular 4.001/20, Item 1.1.1',
    acaoRecomendada: 'Instauração de diligência para juntada de IRPF/extratos fiscais em 5 dias.',
    status: 'Ativa'
  },
  {
    id: 'reg-10',
    codigo: 'REG-PEP-10',
    nome: 'Pessoas Expostas Politicamente (PEP) & Familiares (Diligência Reforçada)',
    categoria: 'Pessoas de Alto Risco',
    condicaoLogica: 'SE (Cliente = PEP OU Vinculado até 2º Grau) E (Transação Atípica > R$ 50.000,00)',
    pesoRisco: 'Crítico',
    baseLegal: 'Art. 25 a 29 da Circular BACEN 3.978/2020 e Resolução COAF nº 40',
    acaoRecomendada: 'Prioridade máxima na fila e aprovação por comitê sênior de PLD.',
    status: 'Ativa'
  },
  {
    id: 'reg-11',
    codigo: 'REG-CSNU-11',
    nome: 'Sanções do Conselho de Segurança da ONU - Terrorismo (Lei 13.810/2019)',
    categoria: 'Pessoas de Alto Risco',
    condicaoLogica: 'SE (Match com Lista CSNU / Sanções Terrorismo da ONU)',
    pesoRisco: 'Crítico',
    baseLegal: 'Lei Federal 13.810/2019 e Resolução BCB nº 44',
    acaoRecomendada: 'INDISPONIBILIDADE / BLOQUEIO CAUTELAR IMEDIATO DE BENS e comunicação ao Ministério da Justiça, COAF e BACEN.',
    status: 'Ativa'
  }
];

export const mockLotesCoe: LoteCoeRegistro[] = [
  {
    id: 'coe-001',
    alertaId: 'ALT-PLD-2026-9406',
    dataOperacao: '20/08/2026 10:20',
    cpfCnpjTitular: '08.192.481/0001-22',
    nomeTitular: 'AGROPECUÁRIA VALE DOURADO LTDA',
    cidadeUf: 'Campo Grande / MS',
    agencia: '0480',
    conta: '19482-1',
    tipoOperacao: 'Saque em Espécie',
    valor: 85000.00,
    identificacaoDepositante: {
      exigida: true,
      identificado: true,
      cpfCnpj: '419.012.839-44',
      nome: 'Manoel Silveira Prado (Sócio Administrador)'
    },
    enviadoSiscoaf: true,
    numeroProtocoloSiscoaf: 'COE-2026-BACEN-8849102',
    dataGeracaoLote: '20/08/2026 11:00'
  },
  {
    id: 'coe-002',
    alertaId: 'ALT-PLD-2026-9407',
    dataOperacao: '20/08/2026 11:45',
    cpfCnpjTitular: '19.482.019/0001-30',
    nomeTitular: 'OURO MINAS BENEFICIAMENTO E COMÉRCIO ME',
    cidadeUf: 'Peixoto de Azevedo / MT',
    agencia: '0912',
    conta: '38190-4',
    tipoOperacao: 'Depósito em Espécie',
    valor: 140000.00,
    identificacaoDepositante: {
      exigida: true,
      identificado: true,
      cpfCnpj: '019.284.102-99',
      nome: 'Valdir dos Anjos'
    },
    enviadoSiscoaf: false,
    dataGeracaoLote: '20/08/2026 12:00'
  },
  {
    id: 'coe-003',
    alertaId: 'ALT-PLD-2026-9408',
    dataOperacao: '19/08/2026 15:30',
    cpfCnpjTitular: '412.940.118-20',
    nomeTitular: 'RICARDO BARRETO NOGUEIRA',
    cidadeUf: 'Cáceres / MT',
    agencia: '0104',
    conta: '44192-8',
    tipoOperacao: 'Pagamento de Boleto em Espécie',
    valor: 58000.00,
    identificacaoDepositante: {
      exigida: true,
      identificado: true,
      cpfCnpj: '412.940.118-20',
      nome: 'Ricardo Barreto Nogueira'
    },
    enviadoSiscoaf: true,
    numeroProtocoloSiscoaf: 'COE-2026-BACEN-8848911',
    dataGeracaoLote: '19/08/2026 17:00'
  }
];

export const mockSnippets: SmartSnippet[] = [
  {
    id: 'snip-1',
    titulo: 'Incompatibilidade com Renda Declarada',
    categoria: 'Incompatibilidade',
    texto: 'O volume financeiro total transacionado no período apurado (R$ {VALOR}) extrapola significativamente a capacidade econômico-financeira cadastral (Renda: R$ {RENDA}). Ausente comprovação de faturamento, pró-labore ou lastro patrimonial idôneo que justifique os créditos recebidos de múltiplas fontes não correlatas, configurando atipicidade nos termos da Carta-Circular BACEN nº 4.001/2020.',
  },
  {
    id: 'snip-2',
    titulo: 'Fracionamento / Smurfing em Fronteira',
    categoria: 'Fracionamento & Fronteira',
    texto: 'Verificou-se a realização de sucessivos depósitos/créditos em espécie com valores imediatamente inferiores ao limiar regulatório de comunicação obrigatória ao SISCOAF (R$ 10.000,00 e R$ 50.000,00), realizados em curto intervalo temporal em agências localizadas na Faixa de Fronteira Internacional. A configuração aponta para estruturação intencional (smurfing) voltada à evasão de controle cambial/aduaneiro.',
  },
  {
    id: 'snip-3',
    titulo: 'Liquidação de Empréstimo / Amortização DCO',
    categoria: 'Amortização DCO',
    texto: 'Constatou-se contratação recente de crédito bancário parcelado de longo prazo seguida de liquidação antecipada abrupta (amortização total) com recursos oriundos de terceiros sem vínculo econômico e depósitos em espécie em região de mineração/garimpo, configurando indício de lavagem de capitais para reintrodução e dissimulação de passivos.',
  },
  {
    id: 'snip-4',
    titulo: 'Alerta CSNU / Bloqueio Imediato Lei 13.810/19',
    categoria: 'Terrorismo / CSNU',
    texto: 'Identificado enquadramento direto com listas de sanções de financiamento ao terrorismo emitidas pelo Conselho de Segurança das Nações Unidas (CSNU). Procedeu-se à IMEDIATA INDISPONIBILIDADE DE ATIVOS e comunicação compulsória ao Ministério da Justiça, COAF e Banco Central, em estrito cumprimento à Lei Federal nº 13.810/2019.',
  },
  {
    id: 'snip-5',
    titulo: 'Triangulação Financeira com PEP',
    categoria: 'Triangulação',
    texto: 'Identificado padrão estruturado de triangulação financeira: a conta sob análise atuou como intermediária, recepcionando recursos de pessoas jurídicas fornecedoras de órgãos públicos e repassando montantes substanciais para contraparte classificada como Pessoa Exposta Politicamente (PEP) ou cônjuge/familiar de até 2º grau.',
  },
  {
    id: 'snip-6',
    titulo: 'Pass-through com Evasão Cripto',
    categoria: 'Criptoativos',
    texto: 'A conta funcionou como intermediária transitória (pass-through), recepcionando créditos pulverizados drenados em curtíssimo espaço de tempo com destino a corretoras de ativos virtuais (Exchanges de Criptoativos), sem retenção de saldo residual e sem propósito econômico evidente.',
  },
  {
    id: 'snip-7',
    titulo: 'Mesma Titularidade (Falso Positivo)',
    categoria: 'Regular / Arquivamento',
    texto: 'Constatou-se que as transferências analisadas ocorreram estritamente entre contas bancárias da própria titular (mesmo CPF/CNPJ) em instituições autorizadas pelo Banco Central, sem pulverização a terceiros ou ocultação de origem, tratando-se de mero remanejamento legítimo de liquidez e gestão de portfólio.',
  },
  {
    id: 'snip-8',
    titulo: 'Ausência de Fundamento Econômico',
    categoria: 'Desvio de Perfil',
    texto: 'As operações financeiras evidenciam total ausência de fundamento econômico ou legal: repasse de vultosa soma a pessoas físicas e jurídicas de ramo de atividade completamente estranho ao objeto social cadastrado ou perfil ocupacional, sem comprovação de prestação de serviços ou aquisição de bens.',
  }
];

export const mockCasos: CasoInvestigacao[] = [
  {
    id: "case-001",
    alertaId: "ALT-PLD-2026-9401",
    nome: "CARLOS EDUARDO SANTOS",
    cpf: "234.819.012-89",
    matricula: "MAT-081239",
    idade: 36,
    renda: 4200.00,
    perfil: "Comerciante Autônomo",
    risco: "Crítico",
    riscoLetra: "Crítico",
    scoreRisco: 96,
    isPep: false,
    alerta: "Fracionamento em Espécie (Smurfing) em Região de Fronteira Internacional",
    regraDisparada: "REG-FRAC-04 + REG-GEO-05 (Fronteira)",
    artigoRegulatorio: "Art. 38, I e Carta-Circular 4.001/20, Item 1.1.3",
    dataAlerta: "20/08/2026 08:30",
    slaHorasRestantes: 5,
    slaLimite: "20/08/2026 18:00",
    valorEnvolvido: 98450.00,
    status: "Pendente",
    tipologiaPld: "Fracionamento / Fronteira",
    gatilhoAlerta: "11 depósitos consecutivos em espécie abaixo de R$ 10.000 em 48h na agência de Cáceres (MT) com repasse rápido para offshore",
    volumeAtipicoPeriodo: 98450.00,
    importadaEm: "20/08/2026 08:30",
    analistaIniciais: "M",
    analistaNome: "Maísa Ramos (Analista PLD Sênior)",
    assumidaEm: "20/08/2026 09:15",
    regiaoRisco: "Fronteira",
    regiaoNome: "Cáceres / MT (Faixa de Fronteira Brasil-Bolívia)",
    capacidadeFinanceira: {
      rendaDeclarada: 4200.00,
      patrimonioDeclarado: 60000.00,
      volumeTransacionadoMes: 98450.00,
      fatorIncompatibilidade: 23.4,
      tipoComprovacao: "Não Comprovada / MEI Inapto",
      dataUltimaAtualizacao: "04/01/2024",
      fonteRenda: "Atividade Comercial Autônoma",
      cnpjFontePagadora: "38.102.944/0001-19",
      origemRecursosDeclarada: "Vendas no varejo",
      capacidadeMensalEstimada: 5000.00,
      desvioPadraoMovimentacao: "+1.860% acima da média histórica"
    },
    resumoPldChecklist: {
      qualificacaoKyc: false,
      capacidadeFinanceira: false,
      listasRestritivas: true,
      enquadramentoPep: true,
      vinculosSocietarios: false,
      origemDestinoRecursos: false,
      midiasDesabonadoras: false,
      analiseFracionamento: false,
      contasPassagem: false
    },
    kyc: {
      nomeCompleto: "Carlos Eduardo Santos",
      cpfMascarado: "234.***.***-89",
      cpfCompleto: "234.819.012-89",
      matricula: "MAT-081239",
      idade: 36,
      dataNascimento: "08/11/1989",
      profissao: "Comerciante Varejista",
      empresaVinculo: "Santos Distribuidora ME (Baixada)",
      rendaDeclarada: 4200.00,
      patrimonioDeclarado: 60000.00,
      perfil: "Comerciante Autônomo",
      dataAssociacao: "04/01/2024 (2 anos)",
      scoreSerasa: 410,
      riscoBacen: "Nível 5 (Crítico) - Atipicidade Grave",
      isPep: false,
      endereco: "Rua Tiradentes, 120 - Centro",
      cidadeUf: "Cáceres / MT",
      regiaoRisco: "Fronteira",
      regiaoDetalhe: "Faixa de Fronteira Internacional com a Bolívia (Zona de Alto Risco para Tráfico e Descaminho)",
      contasVinculadas: [
        { banco: "Cooperativa de Crédito Agência Cáceres (001)", agencia: "0420", conta: "58192-3", tipo: "Conta Corrente" },
        { banco: "Banco Bradesco (237)", agencia: "1102", conta: "40192-8", tipo: "Conta Pagamento" }
      ],
      chavesPix: ["carlos.santos@email.com", "+5565991238475"],
      midiasDesabonadoras: [
        "Inquérito Policial na Delegacia de Fronteira (Defron-MT) por comércio irregular e transporte suspeito (2025)."
      ],
      qsaVinculos: [
        { cnpj: "38.102.944/0001-19", razaoSocial: "Santos Distribuidora e Logística ME", participacao: "100% Sócio Titular", cargo: "Administrador", situacaoCadastral: "INAPTA POR OMISSÃO DE DECLARAÇÕES" }
      ]
    },
    transacoes: [
      { id: "t102-1", data: "19/08/2026", hora: "08:30:10", tipo: "Crédito", origem: "Depósito Espécie", contraparte: "ATM Caixa 04 - Agência Cáceres", valor: 9800.00, saldoApos: 9800.00, categoria: "Espécie", metodo: "Espécie", isSuspeita: true, motivoSuspeita: "Fracionamento intencional abaixo de R$ 10k", cpfDepositanteIdentificado: false },
      { id: "t102-2", data: "19/08/2026", hora: "08:35:40", tipo: "Crédito", origem: "Depósito Espécie", contraparte: "ATM Caixa 04 - Agência Cáceres", valor: 9900.00, saldoApos: 19700.00, categoria: "Espécie", metodo: "Espécie", isSuspeita: true, motivoSuspeita: "Fracionamento intencional abaixo de R$ 10k", cpfDepositanteIdentificado: false },
      { id: "t102-3", data: "19/08/2026", hora: "08:42:15", tipo: "Crédito", origem: "Depósito Espécie", contraparte: "ATM Terminal Rodoviária Cáceres", valor: 9750.00, saldoApos: 29450.00, categoria: "Espécie", metodo: "Espécie", isSuspeita: true, motivoSuspeita: "Depósito em terminal alternativo no mesmo intervalo", cpfDepositanteIdentificado: false },
      { id: "t102-4", data: "19/08/2026", hora: "09:12:00", tipo: "Crédito", origem: "Depósito Espécie", contraparte: "ATM Caixa 01 - Agência Centro", valor: 9850.00, saldoApos: 39300.00, categoria: "Espécie", metodo: "Espécie", isSuspeita: true, motivoSuspeita: "Fracionamento contínuo somando > R$ 50k", cpfDepositanteIdentificado: false },
      { id: "t102-5", data: "20/08/2026", hora: "09:00:20", tipo: "Débito", origem: "PIX Enviado", contraparte: "Delta Corp Participações Ltda", contraparteCpfCnpj: "38.102.944/0001-19", contraparteBanco: "Banco Digital Offshore", valor: -39000.00, saldoApos: 300.00, categoria: "Pass-through", metodo: "PIX", isSuspeita: true, motivoSuspeita: "Drenagem imediata para CNPJ com quadro societário opaco" }
    ],
    grafo: {
      nodes: [
        { id: "n102-1", type: "MAIN", position: { x: 450, y: 190 }, data: { label: "CARLOS EDUARDO SANTOS", subLabel: "Alvo Investigado (Cáceres/MT)", type: "MAIN", cpfCnpj: "234.819.012-89", risk: "Crítico", totalVolume: 98450.00 } },
        { id: "n102-2", type: "BANK", position: { x: 90, y: 70 }, data: { label: "ATM Cáceres Centro 04", subLabel: "Depósitos Fracionados em Espécie", type: "BANK", risk: "Crítico", totalVolume: 19700.00 } },
        { id: "n102-3", type: "BANK", position: { x: 90, y: 260 }, data: { label: "ATM Terminal Fronteira 05", subLabel: "Depósitos Fracionados em Espécie", type: "BANK", risk: "Crítico", totalVolume: 19600.00 } },
        { id: "n102-4", type: "COMPANY", position: { x: 820, y: 180 }, data: { label: "Delta Corp Participações", subLabel: "Empresa de Fachada (CNPJ Inapto)", type: "COMPANY", risk: "Crítico", totalVolume: 39000.00 } }
      ],
      edges: [
        { id: "e102-1", source: "n102-2", target: "n102-1", label: "2x Espécie (R$ 19.700)", animated: true, style: { stroke: "#EF4444", strokeWidth: 3 } },
        { id: "e102-2", source: "n102-3", target: "n102-1", label: "2x Espécie (R$ 19.600)", animated: true, style: { stroke: "#EF4444", strokeWidth: 3 } },
        { id: "e102-4", source: "n102-1", target: "n102-4", label: "R$ 39.000 (Drenagem Imediata PIX)", animated: true, style: { stroke: "#DC2626", strokeWidth: 3.5 } }
      ]
    },
    parecer: {
      deliberacao: null,
      texto: "",
      checklist: {
        extratoAnalisado: true,
        midiasConsultadas: true,
        vinculosSocietariosChecados: true,
        rendaVerificada: true,
        origemDestinoIdentificados: true,
        pepChecado: true
      },
      analistaResponsavel: "Maísa Ramos"
    },
    auditLogs: [
      { id: "l1", timestamp: "20/08/2026 08:30:00", analista: "Motor AML Regra REG-FRAC-04 / REG-GEO-05", acao: "Alerta Gerado", detalhes: "Detecção de 11 créditos fracionados < R$ 10.000 totalizando R$ 98.450 em agência de Fronteira (Cáceres/MT)." },
      { id: "l2", timestamp: "20/08/2026 09:15:00", analista: "Maísa Ramos", acao: "Caso Assumido", detalhes: "Iniciada investigação de origem de recursos em espécie e beneficiário final em zona fronteiriça." }
    ]
  },
  {
    id: "case-002",
    alertaId: "ALT-PLD-2026-9402",
    nome: "JULIANA MENDONÇA FERREIRA",
    cpf: "512.940.118-20",
    matricula: "MAT-094120",
    idade: 42,
    renda: 14500.00,
    perfil: "Advogada / Consultora",
    risco: "Crítico",
    riscoLetra: "Crítico",
    scoreRisco: 94,
    isPep: true,
    pepCargo: "Cônjuge de Deputado Estadual (PEP Vinculado)",
    alerta: "Triangulação Financeira com Recursos de Fornecedor Público e PEP",
    regraDisparada: "REG-PEP-10 (Pessoa Exposta Politicamente)",
    artigoRegulatorio: "Art. 25 a 29 da Circular BACEN 3.978/2020",
    dataAlerta: "20/08/2026 09:00",
    slaHorasRestantes: 12,
    slaLimite: "21/08/2026 12:00",
    valorEnvolvido: 450000.00,
    status: "Em Análise",
    tipologiaPld: "Triangulação com PEP",
    gatilhoAlerta: "Recepção de R$ 450.000 de Construtora vencedora de licitação pública e repasse de 85% para conta conjunta de PEP em 24h",
    volumeAtipicoPeriodo: 450000.00,
    importadaEm: "20/08/2026 09:00",
    analistaIniciais: "V",
    analistaNome: "Valéria Duarte",
    assumidaEm: "20/08/2026 10:00",
    regiaoRisco: "Padrão",
    regiaoNome: "Belo Horizonte / MG",
    capacidadeFinanceira: {
      rendaDeclarada: 14500.00,
      patrimonioDeclarado: 480000.00,
      volumeTransacionadoMes: 450000.00,
      fatorIncompatibilidade: 31.0,
      tipoComprovacao: "IRPF 2025",
      dataUltimaAtualizacao: "15/04/2025",
      fonteRenda: "Honorários Advocatícios",
      cnpjFontePagadora: "19.482.019/0001-30",
      origemRecursosDeclarada: "Consultoria Jurídica",
      capacidadeMensalEstimada: 18000.00,
      desvioPadraoMovimentacao: "+2.400% acima do faturamento médio"
    },
    resumoPldChecklist: {
      qualificacaoKyc: true,
      capacidadeFinanceira: false,
      listasRestritivas: true,
      enquadramentoPep: true,
      vinculosSocietarios: false,
      origemDestinoRecursos: false,
      midiasDesabonadoras: false,
      analiseFracionamento: true,
      contasPassagem: false
    },
    kyc: {
      nomeCompleto: "Juliana Mendonça Ferreira",
      cpfMascarado: "512.***.***-20",
      cpfCompleto: "512.940.118-20",
      matricula: "MAT-094120",
      idade: 42,
      dataNascimento: "17/06/1984",
      profissao: "Advogada / Consultora",
      empresaVinculo: "Ferreira & Associados Consultoria",
      rendaDeclarada: 14500.00,
      patrimonioDeclarado: 480000.00,
      perfil: "Pessoa Exposta Politicamente (PEP)",
      dataAssociacao: "12/03/2019 (7 anos)",
      scoreSerasa: 780,
      riscoBacen: "Nível 5 (Crítico) - PEP com Movimentação Atípica",
      isPep: true,
      pepCargo: "Cônjuge de Deputado Estadual (Dep. Paulo Ferreira)",
      grauParentescoPep: "Esposa / 1º Grau",
      endereco: "Av. Afonso Pena, 3200 - Funcionários",
      cidadeUf: "Belo Horizonte / MG",
      contasVinculadas: [
        { banco: "Cooperativa de Crédito (001)", agencia: "0014", conta: "99102-1", tipo: "Conta Corrente" }
      ],
      chavesPix: ["juliana.ferreira@adv.com.br"],
      midiasDesabonadoras: [
        "Citação em matéria jornalística sobre contratos emergenciais sem licitação da Secretaria de Obras (2025)."
      ],
      qsaVinculos: [
        { cnpj: "19.482.019/0001-30", razaoSocial: "Ferreira & Associados Consultoria Ltda", participacao: "50% Sócia Administradora", cargo: "Administradora", situacaoCadastral: "ATIVA" }
      ]
    },
    transacoes: [
      { id: "t2-1", data: "18/08/2026", hora: "14:10:00", tipo: "Crédito", origem: "TED Recebida", contraparte: "Construtora Progresso Minas S.A.", contraparteCpfCnpj: "04.192.401/0001-88", contraparteBanco: "Banco do Brasil (001)", valor: 450000.00, saldoApos: 452400.00, categoria: "Triangulação", metodo: "TED", isSuspeita: true, motivoSuspeita: "Pagamento volumoso de fornecedor do estado para cônjuge de parlamentar" },
      { id: "t2-2", data: "19/08/2026", hora: "10:30:00", tipo: "Débito", origem: "PIX Enviado", contraparte: "Paulo Ferreira (Deputado Estadual)", contraparteCpfCnpj: "419.012.839-00", contraparteBanco: "Itaú Unibanco (341)", valor: -380000.00, saldoApos: 72400.00, categoria: "Repasse PEP", metodo: "PIX", isSuspeita: true, motivoSuspeita: "Transferência imediata para conta de mandatário público" }
    ],
    grafo: {
      nodes: [
        { id: "n2-1", type: "MAIN", position: { x: 450, y: 190 }, data: { label: "JULIANA MENDONÇA FERREIRA", subLabel: "Cônjuge de PEP (Alvo Principal)", type: "MAIN", cpfCnpj: "512.940.118-20", risk: "Crítico", totalVolume: 450000.00 } },
        { id: "n2-2", type: "COMPANY", position: { x: 90, y: 120 }, data: { label: "Construtora Progresso S.A.", subLabel: "Fornecedora de Obras Públicas", type: "COMPANY", risk: "Alto", totalVolume: 450000.00 } },
        { id: "n2-3", type: "PEP", position: { x: 820, y: 190 }, data: { label: "PAULO FERREIRA (DEP. ESTADUAL)", subLabel: "Pessoa Exposta Politicamente", type: "PEP", isPep: true, risk: "Crítico", totalVolume: 380000.00 } }
      ],
      edges: [
        { id: "e2-1", source: "n2-2", target: "n2-1", label: "TED R$ 450.000 (Sem Contrato)", animated: true, style: { stroke: "#DC2626", strokeWidth: 3.5 } },
        { id: "e2-2", source: "n2-1", target: "n2-3", label: "PIX R$ 380.000 (Repasse Imediato)", animated: true, style: { stroke: "#9333EA", strokeWidth: 3.5 } }
      ]
    },
    parecer: {
      deliberacao: null,
      texto: "",
      checklist: {
        extratoAnalisado: true,
        midiasConsultadas: true,
        vinculosSocietariosChecados: true,
        rendaVerificada: true,
        origemDestinoIdentificados: true,
        pepChecado: true
      },
      analistaResponsavel: "Valéria Duarte"
    },
    auditLogs: []
  },
  {
    id: "case-003",
    alertaId: "ALT-PLD-2026-9403",
    nome: "REGINALDO DA SILVA PEIXOTO",
    cpf: "389.102.485-00",
    matricula: "MAT-041829",
    idade: 47,
    renda: 6500.00,
    perfil: "Prestador de Serviços Gerais",
    risco: "Crítico",
    riscoLetra: "Crítico",
    scoreRisco: 93,
    isPep: false,
    alerta: "Liquidação Antecipada de Empréstimo (Amortização DCO) em Região de Mineração/Garimpo",
    regraDisparada: "REG-AMORT-07 + REG-GEO-06 (Mineração)",
    artigoRegulatorio: "Carta-Circular 4.001/20, Item 1.1.8 e Orientações COAF Garimpo",
    dataAlerta: "20/08/2026 07:15",
    slaHorasRestantes: 18,
    slaLimite: "21/08/2026 18:00",
    valorEnvolvido: 215000.00,
    status: "Pendente",
    tipologiaPld: "Amortização DCO / Mineração",
    gatilhoAlerta: "Empréstimo contratado de R$ 200k em 60 meses quitado integralmente 22 dias depois via depósitos de terceiros ligados a cooperativa de garimpo em Peixoto de Azevedo (MT)",
    volumeAtipicoPeriodo: 215000.00,
    importadaEm: "20/08/2026 07:15",
    analistaIniciais: "M",
    analistaNome: "Maísa Ramos",
    assumidaEm: "20/08/2026 08:00",
    regiaoRisco: "Mineração",
    regiaoNome: "Peixoto de Azevedo / MT (Polo de Mineração e Extração de Ouro)",
    isAmortizacaoAntecipada: true,
    capacidadeFinanceira: {
      rendaDeclarada: 6500.00,
      patrimonioDeclarado: 85000.00,
      volumeTransacionadoMes: 215000.00,
      fatorIncompatibilidade: 33.0,
      tipoComprovacao: "Declaração MEI Antiga",
      dataUltimaAtualizacao: "10/02/2023",
      fonteRenda: "Serviços Mecânicos",
      cnpjFontePagadora: "09.112.330/0001-44",
      origemRecursosDeclarada: "Prestação de Serviços",
      capacidadeMensalEstimada: 7000.00,
      desvioPadraoMovimentacao: "+3.200% acima do padrão histórico"
    },
    resumoPldChecklist: {
      qualificacaoKyc: false,
      capacidadeFinanceira: false,
      listasRestritivas: true,
      enquadramentoPep: true,
      vinculosSocietarios: false,
      origemDestinoRecursos: false,
      midiasDesabonadoras: false,
      analiseFracionamento: false,
      contasPassagem: false
    },
    kyc: {
      nomeCompleto: "Reginaldo da Silva Peixoto",
      cpfMascarado: "389.***.***-00",
      cpfCompleto: "389.102.485-00",
      matricula: "MAT-041829",
      idade: 47,
      dataNascimento: "04/09/1979",
      profissao: "Operador de Máquinas",
      empresaVinculo: "Autônomo",
      rendaDeclarada: 6500.00,
      patrimonioDeclarado: 85000.00,
      perfil: "Associado Tomador de Crédito",
      dataAssociacao: "05/05/2021 (5 anos)",
      scoreSerasa: 590,
      riscoBacen: "Nível 5 (Crítico)",
      isPep: false,
      endereco: "Av. Brasil, 450 - Setor Industrial",
      cidadeUf: "Peixoto de Azevedo / MT",
      regiaoRisco: "Mineração",
      regiaoDetalhe: "Região de Intensa Atividade de Garimpo e Mineração de Ouro (Operações COAF / Polícia Federal)",
      contasVinculadas: [
        { banco: "Cooperativa de Crédito Peixoto (001)", agencia: "0912", conta: "77218-4", tipo: "Conta Corrente" }
      ],
      chavesPix: ["reginaldo.peixoto@email.com"],
      midiasDesabonadoras: [
        "Notícia de fiscalização do IBAMA e PF sobre maquinário de garimpo ilegal sem autorização ambiental (2024)."
      ]
    },
    transacoes: [
      { id: "t3-1", data: "12/08/2026", hora: "10:00:00", tipo: "Crédito", origem: "TED Recebida", contraparte: "Cooperativa dos Mineradores do Norte MT", contraparteCpfCnpj: "04.882.102/0001-99", valor: 200000.00, saldoApos: 202500.00, categoria: "Mineração", metodo: "TED", isSuspeita: true, motivoSuspeita: "Crédito volumoso sem nota fiscal de ouro / DTVM autorizada" },
      { id: "t3-2", data: "12/08/2026", hora: "11:15:00", tipo: "Débito", origem: "Liquidação DCO", contraparte: "Amortização Integral Empréstimo Nº 48192-A", valor: -200000.00, saldoApos: 2500.00, categoria: "Amortização", metodo: "Amortização", isSuspeita: true, motivoSuspeita: "Quitação de contrato de 60 meses no 1º mês com dinheiro sem lastro" }
    ],
    grafo: {
      nodes: [
        { id: "n3-1", type: "MAIN", position: { x: 450, y: 190 }, data: { label: "REGINALDO DA SILVA PEIXOTO", subLabel: "Amortização DCO (Peixoto/MT)", type: "MAIN", risk: "Crítico", totalVolume: 215000.00 } },
        { id: "n3-2", type: "COMPANY", position: { x: 90, y: 190 }, data: { label: "Coop. Mineradores Norte MT", subLabel: "Comércio de Ouro / Garimpo", type: "COMPANY", risk: "Crítico", totalVolume: 200000.00 } },
        { id: "n3-3", type: "BANK", position: { x: 820, y: 190 }, data: { label: "Contrato Empréstimo Nº 48192-A", subLabel: "Liquidação Antecipada DCO", type: "BANK", risk: "Médio", totalVolume: 200000.00 } }
      ],
      edges: [
        { id: "e3-1", source: "n3-2", target: "n3-1", label: "TED R$ 200.000 (Sem DTVM)", animated: true, style: { stroke: "#DC2626", strokeWidth: 3.5 } },
        { id: "e3-2", source: "n3-1", target: "n3-3", label: "Amortização Total DCO", animated: true, style: { stroke: "#F59E0B", strokeWidth: 3.5 } }
      ]
    },
    parecer: {
      deliberacao: null,
      texto: "",
      checklist: {
        extratoAnalisado: true,
        midiasConsultadas: true,
        vinculosSocietariosChecados: true,
        rendaVerificada: false,
        origemDestinoIdentificados: false,
        pepChecado: true
      },
      analistaResponsavel: "Maísa Ramos"
    },
    auditLogs: []
  },
  {
    id: "case-004",
    alertaId: "ALT-PLD-2026-9404",
    nome: "MARCOS VINÍCIUS LIMA",
    cpf: "192.482.019-33",
    matricula: "MAT-077412",
    idade: 33,
    renda: 7500.00,
    perfil: "Investidor de Criptoativos",
    risco: "Crítico",
    riscoLetra: "Crítico",
    scoreRisco: 98,
    isPep: false,
    alerta: "Conta de Passagem (Pass-through) com Evasão Imediata para Exchange Cripto",
    regraDisparada: "REG-PASS-08 (Pass-through < 24h)",
    artigoRegulatorio: "Art. 38, Inciso V e Carta-Circular 4.001/20, Item 1.1.6",
    dataAlerta: "19/08/2026 16:40",
    slaHorasRestantes: 2,
    slaLimite: "20/08/2026 16:40",
    valorEnvolvido: 1250000.00,
    status: "Comunicado COAF",
    tipologiaPld: "Pass-through Cripto",
    gatilhoAlerta: "Ingresso de R$ 1.250.000 de 18 contas terceiras e evasão total para Binance / Mercado Bitcoin em menos de 15 minutos",
    volumeAtipicoPeriodo: 1250000.00,
    importadaEm: "19/08/2026 16:40",
    analistaIniciais: "R",
    analistaNome: "Rodrigo Mendonça",
    assumidaEm: "19/08/2026 17:00",
    regiaoRisco: "Padrão",
    regiaoNome: "São Paulo / SP",
    capacidadeFinanceira: {
      rendaDeclarada: 7500.00,
      patrimonioDeclarado: 120000.00,
      volumeTransacionadoMes: 1250000.00,
      fatorIncompatibilidade: 166.6,
      tipoComprovacao: "Extrato Bancário",
      dataUltimaAtualizacao: "11/01/2026",
      fonteRenda: "Trader Autônomo",
      origemRecursosDeclarada: "Operações com Criptoativos",
      capacidadeMensalEstimada: 10000.00,
      desvioPadraoMovimentacao: "+12.400% e ausência de retenção de saldo"
    },
    resumoPldChecklist: {
      qualificacaoKyc: false,
      capacidadeFinanceira: false,
      listasRestritivas: true,
      enquadramentoPep: true,
      vinculosSocietarios: false,
      origemDestinoRecursos: false,
      midiasDesabonadoras: false,
      analiseFracionamento: false,
      contasPassagem: false
    },
    kyc: {
      nomeCompleto: "Marcos Vinícius Lima",
      cpfMascarado: "192.***.***-33",
      cpfCompleto: "192.482.019-33",
      matricula: "MAT-077412",
      idade: 33,
      dataNascimento: "21/07/1992",
      profissao: "Operador de Criptoativos",
      empresaVinculo: "Autônomo",
      rendaDeclarada: 7500.00,
      patrimonioDeclarado: 120000.00,
      perfil: "Investidor",
      dataAssociacao: "10/10/2023 (3 anos)",
      scoreSerasa: 540,
      riscoBacen: "Nível 5 (Crítico)",
      isPep: false,
      endereco: "Av. Brigadeiro Faria Lima, 3477 - Itaim Bibi",
      cidadeUf: "São Paulo / SP",
      contasVinculadas: [
        { banco: "Cooperativa de Crédito (001)", agencia: "0001", conta: "10293-8", tipo: "Conta Corrente" }
      ],
      chavesPix: ["marcos.crypto@email.com"],
      midiasDesabonadoras: [
        "Reportes em fóruns e boletins de ocorrência por intermediação de pirâmides financeiras."
      ]
    },
    transacoes: [
      { id: "t4-1", data: "19/08/2026", hora: "15:00:00", tipo: "Crédito", origem: "PIX Recebido", contraparte: "Grupo de 18 Pessoas Físicas", valor: 1250000.00, saldoApos: 1250000.00, categoria: "Pulverização", metodo: "PIX", isSuspeita: true, motivoSuspeita: "Créditos pulverizados sem vínculo" },
      { id: "t4-2", data: "19/08/2026", hora: "15:12:00", tipo: "Débito", origem: "TED Enviada", contraparte: "Binance Serviços de Criptoativos", contraparteCpfCnpj: "39.481.002/0001-90", valor: -1250000.00, saldoApos: 0.00, categoria: "Criptoativos", metodo: "TED", isSuspeita: true, motivoSuspeita: "Drenagem total imediata em 12 minutos para exchange" }
    ],
    grafo: {
      nodes: [
        { id: "n4-1", type: "MAIN", position: { x: 450, y: 190 }, data: { label: "MARCOS VINÍCIUS LIMA", subLabel: "Conta Pass-Through", type: "MAIN", risk: "Crítico", totalVolume: 1250000.00 } },
        { id: "n4-2", type: "CRYPTO", position: { x: 820, y: 190 }, data: { label: "Binance Exchange Internacional", subLabel: "Conversão Imediata em Criptoativos", type: "CRYPTO", risk: "Crítico", totalVolume: 1250000.00 } }
      ],
      edges: [
        { id: "e4-1", source: "n4-1", target: "n4-2", label: "TED R$ 1.250.000 (Drenagem em 12 min)", animated: true, style: { stroke: "#DC2626", strokeWidth: 4 } }
      ]
    },
    parecer: {
      deliberacao: "COMUNICAR_COAF",
      texto: "Operação comunicada ao COAF nos termos do Art. 15 da Lei 9.613/98 e Carta-Circular 4.001/20.",
      tipologiaCoaf: "1.1.6 - Aquisição ou conversão imediata de recursos em criptoativos/ativos virtuais sem propósito econômico claro",
      checklist: {
        extratoAnalisado: true,
        midiasConsultadas: true,
        vinculosSocietariosChecados: true,
        rendaVerificada: true,
        origemDestinoIdentificados: true,
        pepChecado: true
      },
      analistaResponsavel: "Rodrigo Mendonça"
    },
    auditLogs: [
      { id: "l4-1", timestamp: "19/08/2026 18:00:00", analista: "Rodrigo Mendonça", acao: "Comunicação COAF Realizada", detalhes: "Enviado relatório SISCOAF protocolo #COAF-2026-BR-9941." }
    ]
  },
  {
    id: "case-005",
    alertaId: "ALT-PLD-2026-9405",
    nome: "TARIQ AL-MANSOUR COMÉRCIO ME",
    cpf: "31.940.112/0001-80",
    matricula: "MAT-011928",
    idade: 52,
    renda: 18000.00,
    perfil: "Comércio Importador",
    risco: "Crítico",
    riscoLetra: "Crítico",
    scoreRisco: 100,
    isPep: false,
    alerta: "Match em Lista do Conselho de Segurança da ONU (CSNU - Lei 13.810/2019)",
    regraDisparada: "REG-CSNU-11 (Bloqueio Cautelar Obrigatório)",
    artigoRegulatorio: "Lei Federal nº 13.810/2019 e Resolução BCB nº 44",
    dataAlerta: "20/08/2026 10:00",
    slaHorasRestantes: 1,
    slaLimite: "20/08/2026 12:00",
    valorEnvolvido: 680000.00,
    status: "Pendente",
    tipologiaPld: "CSNU / Terrorismo (Lei 13.810)",
    gatilhoAlerta: "Coincidência nominal e societária em lista de sanções do CSNU/ONU vinculada a financiamento internacional em Foz do Iguaçu (PR)",
    volumeAtipicoPeriodo: 680000.00,
    importadaEm: "20/08/2026 10:00",
    analistaIniciais: "M",
    analistaNome: "Maísa Ramos",
    assumidaEm: "20/08/2026 10:15",
    regiaoRisco: "Fronteira",
    regiaoNome: "Foz do Iguaçu / PR (Tríplice Fronteira Brasil-Paraguai-Argentina)",
    isCsnuListed: true,
    capacidadeFinanceira: {
      rendaDeclarada: 18000.00,
      patrimonioDeclarado: 350000.00,
      volumeTransacionadoMes: 680000.00,
      fatorIncompatibilidade: 37.7,
      tipoComprovacao: "Não Comprovada",
      dataUltimaAtualizacao: "02/02/2025",
      fonteRenda: "Importação e Exportação",
      cnpjFontePagadora: "31.940.112/0001-80",
      origemRecursosDeclarada: "Comércio Eletrônico de Fronteira",
      capacidadeMensalEstimada: 20000.00,
      desvioPadraoMovimentacao: "+3.400% e triangulação com casas de câmbio"
    },
    resumoPldChecklist: {
      qualificacaoKyc: false,
      capacidadeFinanceira: false,
      listasRestritivas: false, // Disparou lista restritiva
      enquadramentoPep: true,
      vinculosSocietarios: false,
      origemDestinoRecursos: false,
      midiasDesabonadoras: false,
      analiseFracionamento: false,
      contasPassagem: false
    },
    kyc: {
      nomeCompleto: "Tariq Al-Mansour Comércio e Importação ME",
      cpfMascarado: "31.***.***/0001-80",
      cpfCompleto: "31.940.112/0001-80",
      matricula: "MAT-011928",
      idade: 52,
      dataNascimento: "12/04/1974",
      profissao: "Comerciante Importador",
      empresaVinculo: "Al-Mansour Trading",
      rendaDeclarada: 18000.00,
      patrimonioDeclarado: 350000.00,
      perfil: "Pessoa Jurídica - Importador",
      dataAssociacao: "15/08/2020 (6 anos)",
      scoreSerasa: 600,
      riscoBacen: "Nível 5 (Crítico) - Sanção CSNU",
      isPep: false,
      isCsnuListed: true,
      endereco: "Av. das Cataratas, 1800 - Vila Yolanda",
      cidadeUf: "Foz do Iguaçu / PR",
      regiaoRisco: "Fronteira",
      regiaoDetalhe: "Tríplice Fronteira (Brasil-Paraguai-Argentina) - Zona de Vigilância Antiterrorismo e Controle de Câmbio",
      contasVinculadas: [
        { banco: "Cooperativa de Crédito Agência Foz (001)", agencia: "0099", conta: "66120-0", tipo: "Conta Corrente PJ" }
      ],
      chavesPix: ["tariq.trading@import.com"],
      midiasDesabonadoras: [
        "Inclusão em Resolução do Conselho de Segurança da ONU nº 1267/1989/2253 (Sanções Financeiras Internacionais)."
      ]
    },
    transacoes: [
      { id: "t5-1", data: "20/08/2026", hora: "08:15:00", tipo: "Crédito", origem: "Remessa Internacional", contraparte: "Eastern Trade Levant Ltd", valor: 680000.00, saldoApos: 680000.00, categoria: "Internacional", metodo: "TED", isSuspeita: true, motivoSuspeita: "Origem em jurisdição de alto risco sancionada pela ONU" }
    ],
    grafo: {
      nodes: [
        { id: "n5-1", type: "MAIN", position: { x: 450, y: 190 }, data: { label: "TARIQ AL-MANSOUR COMÉRCIO", subLabel: "Alvo Sanção CSNU (Foz do Iguaçu)", type: "MAIN", risk: "Crítico", totalVolume: 680000.00 } },
        { id: "n5-2", type: "COMPANY", position: { x: 90, y: 190 }, data: { label: "Eastern Trade Levant Ltd", subLabel: "Entidade Sancionada ONU", type: "COMPANY", risk: "Crítico", totalVolume: 680000.00 } }
      ],
      edges: [
        { id: "e5-1", source: "n5-2", target: "n5-1", label: "Remessa R$ 680.000", animated: true, style: { stroke: "#DC2626", strokeWidth: 4 } }
      ]
    },
    parecer: {
      deliberacao: null,
      texto: "",
      checklist: {
        extratoAnalisado: true,
        midiasConsultadas: true,
        vinculosSocietariosChecados: true,
        rendaVerificada: true,
        origemDestinoIdentificados: true,
        pepChecado: true
      },
      analistaResponsavel: "Maísa Ramos"
    },
    auditLogs: [
      { id: "l5-1", timestamp: "20/08/2026 10:00:00", analista: "Motor AML Regra REG-CSNU-11", acao: "Alerta Imediato CSNU", detalhes: "Detecção de match positivo com lista do Conselho de Segurança da ONU. Exige bloqueio de bens imediato." }
    ]
  },
  {
    id: "case-006",
    alertaId: "ALT-PLD-2026-9406",
    nome: "AGROPECUÁRIA VALE DOURADO LTDA",
    cpf: "08.192.481/0001-22",
    matricula: "MAT-088192",
    idade: 14,
    renda: 120000.00,
    perfil: "Produtor Rural / Agronegócio",
    risco: "Médio",
    riscoLetra: "Médio",
    scoreRisco: 55,
    isPep: false,
    alerta: "Movimentação em Espécie >= R$ 50.000,00 (COE Obrigatório)",
    regraDisparada: "REG-COE-01 (Comunicação Obrigatória em Espécie)",
    artigoRegulatorio: "Art. 49, Circular BACEN 3.978/2020",
    dataAlerta: "20/08/2026 10:20",
    slaHorasRestantes: 24,
    slaLimite: "21/08/2026 10:20",
    valorEnvolvido: 85000.00,
    status: "Pendente",
    tipologiaPld: "Limite Objetivo COE (Espécie >= 50k)",
    gatilhoAlerta: "Saque em espécie de R$ 85.000,00 na agência Campo Grande (MS) gerando lote compulsório SISCOAF / COE",
    volumeAtipicoPeriodo: 85000.00,
    importadaEm: "20/08/2026 10:20",
    analistaIniciais: "M",
    analistaNome: "Maísa Ramos",
    assumidaEm: "20/08/2026 10:30",
    regiaoRisco: "Padrão",
    regiaoNome: "Campo Grande / MS",
    isCoeObrigatorio: true,
    capacidadeFinanceira: {
      rendaDeclarada: 120000.00,
      patrimonioDeclarado: 4500000.00,
      volumeTransacionadoMes: 85000.00,
      fatorIncompatibilidade: 0.7,
      tipoComprovacao: "Balanço Patrimonial / DEFIS 2025",
      dataUltimaAtualizacao: "10/03/2026",
      fonteRenda: "Atividade Pecuária / Corte",
      cnpjFontePagadora: "08.192.481/0001-22",
      origemRecursosDeclarada: "Venda de Gado / Leilão",
      capacidadeMensalEstimada: 150000.00,
      desvioPadraoMovimentacao: "Compatível com faturamento da fazenda"
    },
    resumoPldChecklist: {
      qualificacaoKyc: true,
      capacidadeFinanceira: true,
      listasRestritivas: true,
      enquadramentoPep: true,
      vinculosSocietarios: true,
      origemDestinoRecursos: true,
      midiasDesabonadoras: true,
      analiseFracionamento: true,
      contasPassagem: true
    },
    kyc: {
      nomeCompleto: "Agropecuária Vale Dourado Ltda",
      cpfMascarado: "08.***.***/0001-22",
      cpfCompleto: "08.192.481/0001-22",
      matricula: "MAT-088192",
      idade: 14,
      dataNascimento: "10/05/2012",
      profissao: "Pecuária e Criação de Bovinos",
      empresaVinculo: "Grupo Vale Dourado",
      rendaDeclarada: 120000.00,
      patrimonioDeclarado: 4500000.00,
      perfil: "Cooperado Agro",
      dataAssociacao: "14/06/2018 (8 anos)",
      scoreSerasa: 890,
      riscoBacen: "Nível 2 (Médio)",
      isPep: false,
      endereco: "Rodovia BR-163, KM 450 - Zona Rural",
      cidadeUf: "Campo Grande / MS",
      contasVinculadas: [
        { banco: "Cooperativa de Crédito Agro (001)", agencia: "0480", conta: "19482-1", tipo: "Conta Corrente PJ" }
      ],
      chavesPix: ["financeiro@valedourado.agr.br"],
      midiasDesabonadoras: []
    },
    transacoes: [
      { id: "t6-1", data: "20/08/2026", hora: "10:15:00", tipo: "Débito", origem: "Saque em Espécie", contraparte: "Caixa Agência 0480 - Campo Grande", valor: -85000.00, saldoApos: 245000.00, categoria: "Espécie", metodo: "Espécie", isSuspeita: false, cpfDepositanteIdentificado: true, cpfDepositante: "419.012.839-44" }
    ],
    grafo: {
      nodes: [
        { id: "n6-1", type: "MAIN", position: { x: 450, y: 190 }, data: { label: "AGROPECUÁRIA VALE DOURADO", subLabel: "Saque Espécie >= 50k", type: "MAIN", risk: "Médio", totalVolume: 85000.00 } },
        { id: "n6-2", type: "BANK", position: { x: 820, y: 190 }, data: { label: "Caixa Agência 0480", subLabel: "Lote COE Automático", type: "BANK", risk: "Baixo", totalVolume: 85000.00 } }
      ],
      edges: [
        { id: "e6-1", source: "n6-1", target: "n6-2", label: "Saque R$ 85.000 (COE)", animated: false, style: { stroke: "#E5B700", strokeWidth: 2.5 } }
      ]
    },
    parecer: {
      deliberacao: null,
      texto: "",
      checklist: {
        extratoAnalisado: true,
        midiasConsultadas: true,
        vinculosSocietariosChecados: true,
        rendaVerificada: true,
        origemDestinoIdentificados: true,
        pepChecado: true
      },
      analistaResponsavel: "Maísa Ramos"
    },
    auditLogs: [
      { id: "l6-1", timestamp: "20/08/2026 10:20:00", analista: "Motor COE Automático", acao: "Lote COE Gerado", detalhes: "Saque em espécie de R$ 85.000,00 registrado para geração do lote compulsório SISCOAF / COE." }
    ]
  },
  {
    id: "case-007",
    alertaId: "ALT-PLD-2026-9407",
    nome: "DR. FELIPE MATHEUS COUTINHO",
    cpf: "109.840.192-11",
    matricula: "MAT-076120",
    idade: 45,
    renda: 32000.00,
    perfil: "Médico Cardiologista",
    risco: "Alto",
    riscoLetra: "Alto",
    scoreRisco: 84,
    isPep: false,
    alerta: "Ausência de Fundamento Econômico ou Legal / Desvio de Perfil",
    regraDisparada: "REG-INCOMP-09 (Ausência de Fundamento Econômico)",
    artigoRegulatorio: "Carta-Circular 4.001/20, Item 1.1.7",
    dataAlerta: "20/08/2026 10:45",
    slaHorasRestantes: 20,
    slaLimite: "21/08/2026 18:00",
    valorEnvolvido: 520000.00,
    status: "Pendente",
    tipologiaPld: "Ausência de Fundamento Econômico",
    gatilhoAlerta: "Transferência de R$ 520.000 para distribuidora de peças de colheitadeiras e maquinário pesado sem qualquer vínculo agrícola ou frota rural cadastrada",
    volumeAtipicoPeriodo: 520000.00,
    importadaEm: "20/08/2026 10:45",
    analistaIniciais: "M",
    analistaNome: "Maísa Ramos",
    assumidaEm: "20/08/2026 11:00",
    regiaoRisco: "Padrão",
    regiaoNome: "Campinas / SP",
    capacidadeFinanceira: {
      rendaDeclarada: 32000.00,
      patrimonioDeclarado: 2100000.00,
      volumeTransacionadoMes: 520000.00,
      fatorIncompatibilidade: 16.2,
      tipoComprovacao: "IRPF 2025",
      dataUltimaAtualizacao: "20/04/2025",
      fonteRenda: "Atividade Médica / Cirurgias",
      origemRecursosDeclarada: "Honorários Médicos",
      capacidadeMensalEstimada: 40000.00,
      desvioPadraoMovimentacao: "+1.200% em transação única estranha à atividade"
    },
    resumoPldChecklist: {
      qualificacaoKyc: true,
      capacidadeFinanceira: false,
      listasRestritivas: true,
      enquadramentoPep: true,
      vinculosSocietarios: false,
      origemDestinoRecursos: false,
      midiasDesabonadoras: true,
      analiseFracionamento: true,
      contasPassagem: false
    },
    kyc: {
      nomeCompleto: "Dr. Felipe Matheus Coutinho",
      cpfMascarado: "109.***.***-11",
      cpfCompleto: "109.840.192-11",
      matricula: "MAT-076120",
      idade: 45,
      dataNascimento: "18/03/1981",
      profissao: "Médico Cardiologista",
      empresaVinculo: "Instituto do Coração Campinas",
      rendaDeclarada: 32000.00,
      patrimonioDeclarado: 2100000.00,
      perfil: "Profissional Liberal",
      dataAssociacao: "10/01/2017 (9 anos)",
      scoreSerasa: 850,
      riscoBacen: "Nível 4 (Alto)",
      isPep: false,
      endereco: "Av. José Bonifácio, 1200 - Jardim Flamboyant",
      cidadeUf: "Campinas / SP",
      contasVinculadas: [
        { banco: "Cooperativa de Crédito (001)", agencia: "0010", conta: "88412-9", tipo: "Conta Corrente" }
      ],
      chavesPix: ["felipe.coutinho@cardiocampinas.com.br"],
      midiasDesabonadoras: []
    },
    transacoes: [
      { id: "t7-1", data: "20/08/2026", hora: "09:30:00", tipo: "Débito", origem: "TED Enviada", contraparte: "Tratores & Implementos Agrícolas do Centro-Oeste Ltda", contraparteCpfCnpj: "14.992.812/0001-44", valor: -520000.00, saldoApos: 42000.00, categoria: "Desvio de Perfil", metodo: "TED", isSuspeita: true, motivoSuspeita: "Pagamento de maquinário pesado por médico sem atividade rural ou procuração" }
    ],
    grafo: {
      nodes: [
        { id: "n7-1", type: "MAIN", position: { x: 450, y: 190 }, data: { label: "DR. FELIPE MATHEUS COUTINHO", subLabel: "Médico (Sem Vínculo Agro)", type: "MAIN", risk: "Alto", totalVolume: 520000.00 } },
        { id: "n7-2", type: "COMPANY", position: { x: 820, y: 190 }, data: { label: "Tratores & Implementos Ltda", subLabel: "Distribuidora de Maquinário", type: "COMPANY", risk: "Médio", totalVolume: 520000.00 } }
      ],
      edges: [
        { id: "e7-1", source: "n7-1", target: "n7-2", label: "TED R$ 520.000 (Sem Justificativa)", animated: true, style: { stroke: "#F97316", strokeWidth: 3 } }
      ]
    },
    parecer: {
      deliberacao: null,
      texto: "",
      checklist: {
        extratoAnalisado: true,
        midiasConsultadas: true,
        vinculosSocietariosChecados: true,
        rendaVerificada: true,
        origemDestinoIdentificados: false,
        pepChecado: true
      },
      analistaResponsavel: "Maísa Ramos"
    },
    auditLogs: []
  },
  {
    id: "case-008",
    alertaId: "ALT-PLD-2026-9408",
    nome: "BEATRIZ SOARES NOGUEIRA",
    cpf: "419.012.839-44",
    matricula: "MAT-055192",
    idade: 48,
    renda: 28000.00,
    perfil: "Médica / Especialista",
    risco: "Baixo",
    riscoLetra: "Baixo",
    scoreRisco: 12,
    isPep: false,
    alerta: "Movimentação Financeira Relevante - Mesma Titularidade",
    regraDisparada: "Verificação de Volume de Liquidação",
    artigoRegulatorio: "Circular BACEN 3.978/2020",
    dataAlerta: "20/08/2026 10:15",
    slaHorasRestantes: 24,
    slaLimite: "21/08/2026 23:59",
    valorEnvolvido: 180000.00,
    status: "Arquivado",
    tipologiaPld: "Mesma Titularidade / Regular",
    gatilhoAlerta: "Transferência de R$ 180.000 entre contas da própria titular para liquidação de consórcio imobiliário",
    volumeAtipicoPeriodo: 180000.00,
    importadaEm: "20/08/2026 10:15",
    analistaIniciais: "M",
    analistaNome: "Maísa Ramos",
    assumidaEm: "20/08/2026 10:30",
    regiaoRisco: "Padrão",
    regiaoNome: "São Paulo / SP",
    capacidadeFinanceira: {
      rendaDeclarada: 28000.00,
      patrimonioDeclarado: 1900000.00,
      volumeTransacionadoMes: 180000.00,
      fatorIncompatibilidade: 1.0,
      tipoComprovacao: "IRPF e CRM Comprovado",
      dataUltimaAtualizacao: "20/03/2026",
      fonteRenda: "Atividade Médica / Clínica Privada",
      cnpjFontePagadora: "22.333.444/0001-55",
      origemRecursosDeclarada: "Rendimentos de Aplicações Financeiras",
      capacidadeMensalEstimada: 35000.00,
      desvioPadraoMovimentacao: "Compatível com patrimônio declarado"
    },
    resumoPldChecklist: {
      qualificacaoKyc: true,
      capacidadeFinanceira: true,
      listasRestritivas: true,
      enquadramentoPep: true,
      vinculosSocietarios: true,
      origemDestinoRecursos: true,
      midiasDesabonadoras: true,
      analiseFracionamento: true,
      contasPassagem: true
    },
    kyc: {
      nomeCompleto: "Beatriz Soares Nogueira",
      cpfMascarado: "419.***.***-44",
      cpfCompleto: "419.012.839-44",
      matricula: "MAT-055192",
      idade: 48,
      dataNascimento: "14/02/1978",
      profissao: "Médica Cardiologista",
      empresaVinculo: "Hospital Sírio-Libanês / Clínica Própria",
      rendaDeclarada: 28000.00,
      patrimonioDeclarado: 1900000.00,
      perfil: "Associada Investidora",
      dataAssociacao: "18/08/2015 (11 anos)",
      scoreSerasa: 920,
      riscoBacen: "Nível 1 (Baixo)",
      isPep: false,
      endereco: "Rua Bela Cintra, 2100 - Consolação",
      cidadeUf: "São Paulo / SP",
      contasVinculadas: [
        { banco: "Itaú Personnalité (341)", agencia: "0001", conta: "94812-3", tipo: "Conta Corrente" },
        { banco: "Cooperativa de Crédito (001)", agencia: "0001", conta: "30291-8", tipo: "Conta Principal" }
      ],
      chavesPix: ["beatriz.nogueira@med.br"],
      midiasDesabonadoras: []
    },
    transacoes: [
      { id: "t8-1", data: "20/08/2026", hora: "09:40:00", tipo: "Crédito", origem: "TED Mesma Titularidade", contraparte: "Beatriz Soares Nogueira (Itaú)", contraparteCpfCnpj: "419.012.839-44", valor: 180000.00, saldoApos: 184500.00, categoria: "Mesma Titularidade", metodo: "TED", isSuspeita: false }
    ],
    grafo: {
      nodes: [
        { id: "n8-1", type: "MAIN", position: { x: 450, y: 190 }, data: { label: "BEATRIZ SOARES NOGUEIRA", subLabel: "Associada (Conta Cooperativa)", type: "MAIN", risk: "Baixo", totalVolume: 180000.00 } },
        { id: "n8-2", type: "BANK", position: { x: 90, y: 190 }, data: { label: "Itaú Personnalité (Mesmo CPF)", subLabel: "Conta de Mesma Titularidade", type: "BANK", risk: "Baixo", totalVolume: 180000.00 } }
      ],
      edges: [
        { id: "e8-1", source: "n8-2", target: "n8-1", label: "TED R$ 180.000 (Mesmo CPF)", animated: false, style: { stroke: "#10B981", strokeWidth: 2.5 } }
      ]
    },
    parecer: {
      deliberacao: "ARQUIVAR",
      texto: "Caso arquivado como Falso Positivo. Transferência realizada estritamente entre contas da própria titular para aquisição e quitação legítima de cota de consórcio imobiliário, com lastro patrimonial comprovado no IRPF.",
      motivoArquivamento: "Mesma titularidade comprovada e compatibilidade patrimonial plena.",
      checklist: {
        extratoAnalisado: true,
        midiasConsultadas: true,
        vinculosSocietariosChecados: true,
        rendaVerificada: true,
        origemDestinoIdentificados: true,
        pepChecado: true
      },
      analistaResponsavel: "Maísa Ramos"
    },
    auditLogs: []
  }
];

export const coafTipologias = [
  "1.1.1 - Movimentação de recursos incompatível com o patrimônio, a atividade econômica ou a capacidade financeira",
  "1.1.2 - Operações que, por sua habitualidade, valor e forma, configurem artifício para burla dos limites de comunicação",
  "1.1.3 - Realização de saques ou depósitos em espécie fracionados ou estruturados (Smurfing)",
  "1.1.4 - Movimentação expressiva de recursos oriundos ou destinados a Pessoas Expostas Politicamente (PEP)",
  "1.1.5 - Utilização de contas de passagem (pass-through) sem retenção de saldo e com rápida drenagem",
  "1.1.6 - Aquisição ou conversão imediata de recursos em criptoativos/ativos virtuais sem propósito econômico claro",
  "1.1.7 - Triangulação financeira com empresas de fachada ou sem lastro de endereço operacional",
  "1.1.8 - Liquidação ou amortização substancial de operações de crédito sem comprovação de origem dos recursos",
  "1.1.9 - Operações atípicas realizadas em municípios situados na Faixa de Fronteira ou Polos de Mineração/Garimpo",
  "1.1.10 - Identificação de beneficiário ou titular coincidente com sanções do CSNU/ONU (Lei 13.810/2019)"
];

export const mockDashboardData = {
  kpis: {
    totalAlertasMes: 184,
    alertasCriticosFila: 24,
    casosComunicadosCoafMes: 19,
    falsosPositivosArquivados: 56,
    taxaAcuraciaModel: 96.4,
    tempoMedioResolucaoHoras: 12.8,
    slaMedioHoras: 12.8,
    volumeMonitoradoSemana: 8940000.0,
    volumeTotalAnalisadoMes: 6420000.0,
    slaCompliancePercentual: 99.4,
  },
  volumePorDia: [
    { dia: "10/06", alertas: 18, criticos: 2, volume: 420000 },
    { dia: "11/06", alertas: 24, criticos: 3, volume: 680000 },
    { dia: "12/06", alertas: 15, criticos: 1, volume: 310000 },
    { dia: "13/06", alertas: 32, criticos: 5, volume: 1150000 },
    { dia: "14/06", alertas: 21, criticos: 2, volume: 540000 },
    { dia: "15/06", alertas: 28, criticos: 4, volume: 890000 },
    { dia: "16/06", alertas: 39, criticos: 6, volume: 1420000 },
    { dia: "17/06", alertas: 45, criticos: 8, volume: 1890000 },
  ],
  distribuicaoRisco: [
    { nivel: "Crítico", total: 24, quantidade: 24, percentual: 14, cor: "#EF4444" },
    { nivel: "Alto", total: 48, quantidade: 48, percentual: 28, cor: "#F97316" },
    { nivel: "Médio", total: 72, quantidade: 72, percentual: 42, cor: "#E5B700" },
    { nivel: "Baixo", total: 28, quantidade: 28, percentual: 16, cor: "#10B981" },
  ],
  tipologiasFrequentes: [
    { nome: "Incompatibilidade Patrimonial", total: 52, percentual: 30, perc: 30 },
    { nome: "Fracionamento / Smurfing", total: 42, percentual: 24, perc: 24 },
    { nome: "Regiões de Fronteira / Mineração", total: 34, percentual: 20, perc: 20 },
    { nome: "Triangulação com PEP", total: 31, percentual: 18, perc: 18 },
    { nome: "Amortização DCO / Liquidação", total: 26, percentual: 15, perc: 15 },
    { nome: "Pass-through Criptoativos", total: 22, percentual: 13, perc: 13 },
    { nome: "Limites Objetivos COE (Espécie >= 50k)", total: 18, percentual: 10, perc: 10 },
  ],
};
