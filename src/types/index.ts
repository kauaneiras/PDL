import type { CSSProperties } from 'react';

export type RiskLevel = 'Crítico' | 'Alto' | 'Médio' | 'Baixo';

export type AlertStatus = 'Pendente' | 'Em Análise' | 'Em análise' | 'Diligência' | 'Comunicado COAF' | 'Arquivado';

export type NodeType =
  | 'MAIN'
  | 'BANK'
  | 'COMPANY'
  | 'PEP'
  | 'FAMILY'
  | 'COUNTERPARTY'
  | 'CRYPTO'
  | 'HUB_CC'
  | 'HIGH_RISK'
  | 'ATTRIBUTE';

export type AttributeType =
  | 'globe'
  | 'piggy'
  | 'search'
  | 'cash'
  | 'news'
  | 'house'
  | 'card';

export type RelationType =
  | 'investigado'
  | 'familiar'
  | 'nao_familiar'
  | 'empresa'
  | 'alto_risco'
  | 'conta_corrente'
  | 'atributo';

export type TransactionType = 'Crédito' | 'Débito';

export type RegiaoRisco = 'Fronteira' | 'Mineração' | 'Padrão';

export interface Transaction {
  id: string;
  data: string;
  hora?: string;
  tipo: TransactionType;
  origem: string;
  origemDetalhe?: string;
  transacaoDescricao?: string;
  contraparte: string;
  contraparteCpfCnpj?: string;
  contraparteBanco?: string;
  contraparteAgencia?: string;
  contraparteConta?: string;
  valor: number;
  saldoApos?: number;
  categoria?: string;
  isSuspeita?: boolean;
  motivoSuspeita?: string;
  metodo?: 'PIX' | 'TED' | 'Boleto' | 'Amortização' | 'Espécie' | 'Cripto' | 'Cartão' | 'Débito em Conta';
  cpfDepositanteIdentificado?: boolean;
  cpfDepositante?: string;
}

export interface GraphNodeData {
  label: string;
  subLabel?: string;
  type: NodeType;
  cpfCnpj?: string;
  isPep?: boolean;
  risk?: RiskLevel;
  totalVolume?: number;
  transacoesCount?: number;
  relationType?: RelationType;
  grauParentesco?: string;
  attributeType?: AttributeType;
  detalheAtributo?: string;
  transactionsSample?: Transaction[];
  notes?: string;
  [key: string]: unknown;
}

export interface GraphNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: GraphNodeData;
}

export interface GraphEdgeData {
  valor?: number;
  quantidade?: number;
  metodo?: string;
  isBidirecional?: boolean;
  isSuspeita?: boolean;
  tipoFluxo?: 'BIDIRECIONAL' | 'UNIDIRECIONAL' | 'TITULARIDADE' | 'ATRIBUTO';
  origemDesc?: string;
  destinoDesc?: string;
  creditoTotal?: number;
  debitoTotal?: number;
  detalhe?: string;
  transactionsSample?: Transaction[];
  [key: string]: unknown;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  data?: GraphEdgeData;
  animated?: boolean;
  style?: CSSProperties;
  markerStart?: any;
  markerEnd?: any;
}

export interface KycProfile {
  nomeCompleto: string;
  cpfMascarado: string;
  cpfCompleto: string;
  matricula: string;
  idade: number;
  dataNascimento: string;
  documentoIdentificacao?: string; // RG, Órgão Expedidor, Registro Comercial / JUCESP
  numeroRegistroComercial?: string;
  inscricaoCooperforte?: string;
  dataAssociacao: string;
  localResidencia?: string; // Domicílio / Residência
  perfilAssociacao?: string; // ex: "Associado Individual Ativo"
  vinculoAssociacao?: string; // ex: "Funcionário / Estatutário"
  entidadeOrigem?: string; // ex: "Banco do Brasil", "CAIXA", "Ministério da Fazenda", "BACEN", "Cooperado Externo"
  profissao: string;
  empresaVinculo?: string;
  empregadorFontePagadora?: {
    razaoSocial: string;
    cnpj: string;
    naturezaJuridica?: string;
  };
  rendaDeclarada: number;
  dataVencimentoRenda?: string;
  naturezaRenda?: 'Salarial / Vencimentos' | 'Pró-Labore' | 'Faturamento Comercial' | 'Aposentadoria / Pensão' | 'Aluguéis / Rendimentos';
  patrimonioDeclarado: number;
  faturamentoMensalEstimado?: number;
  perfil: string;
  scoreSerasa: number;
  riscoBacen: string;
  isPep: boolean;
  pepCargo?: string;
  grauParentescoPep?: string;
  isServidorPublico?: boolean;
  esferaServidorPublico?: 'Federal' | 'Estadual' | 'Municipal' | 'Não Aplicável';
  isCsnuListed?: boolean; // Lei 13.810/2019
  segmentacaoPerfilNegocial?: string; // ex: "Segmento Alta Renda / Cooperado Platinum"
  dataAtualizacaoSegmentacao?: string;
  dataUltimaAlteracaoCadastral?: string;
  endereco: string;
  cidadeUf: string;
  regiaoRisco?: RegiaoRisco;
  regiaoDetalhe?: string; // ex: "Região de Fronteira - Cáceres (MT) / Faixa de Fronteira Internacional"
  contasVinculadas: {
    banco: string;
    agencia: string;
    conta: string;
    tipo: string;
  }[];
  chavesPix: string[];
  midiasDesabonadoras?: string[];
  qsaVinculos?: {
    cnpj: string;
    razaoSocial: string;
    participacao: string;
    cargo: string;
    situacaoCadastral: string;
  }[];
}

export interface InformacoesComplementaresPld {
  bureauAmlReputacional: {
    fontesConsultadas: string[]; // "OFAC", "CSNU", "CEIS", "CNEP", "CNDT", "Tribunais de Justiça", "Diários Oficiais"
    ocorrenciasMídiasNegativas: string[];
    listasSancoesInternacionais: string;
    statusReputacionalGeral: 'Regular / Sem Apontamentos' | 'Apontamento Moderado' | 'Alto Risco / Mídia Desabonadora Grave';
  };
  confirmacaoStatusPep: {
    isPepConfirmado: boolean;
    tipoEnquadramento: string; // "Titular", "Representante", "Familiar até 2º Grau", "Colaborador Estreito", "Não Enquadrado"
    orgaoEntidade?: string;
    cargoFuncao?: string;
    vigenciaMandato?: string;
    enquadramentoLegal?: string; // "Art. 19 da Resolução COAF nº 40/2021"
  };
  indicadorLimoc: {
    ativo: boolean; // Sim / Não
    limiteOperacionalCredito: number; // LIMOC em BRL
    dataVigenciaLimite: string;
    utilizacaoAtual: number;
    observacaoLimoc?: string;
  };
}

export interface DadosTransacoesMesPld {
  saldoAnterior: number;
  totalCredito: number;
  totalDebito: number;
  saldoAtual: number;
  periodoInicio: string;
  periodoFim: string;
  valorAnalisado: number;
  identificacaoRemetente: string;
  identificacaoBeneficiarioFinal: string;
  tipoOperacao: string; // ex: "Crédito / Empréstimo / Investimento RDC / Amortização DCO"
  formaRealizacao: string; // ex: "PIX / TED / Boleto / Espécie"
}

export type OpcaoRecomendacaoAnalista = 
  | 'ARQUIVAR_DOSSIE' 
  | 'COMUNICAR_COAF' 
  | 'ENCAMINHAR_GECAN' 
  | 'SEM_PROVIDENCIAS';

export interface AnaliseTecnicaAnalista {
  historicoCliente: string;
  perfilRiscoModalidades: string;
  justificativaEconomicaLegal: string;
  conclusaoTecnica: 'Falso-Positivo (Operação Legítima)' | 'Indício / Suspeita de LD/FT (Comunicação Obrigatória)';
  recomendacoesAssinaladas: {
    arquivarDossie: boolean;
    comunicarCoaf: boolean;
    encaminharGecan: boolean;
    semProvidencias: boolean;
  };
  analistaNome: string;
  analistaCargo: string;
  analistaAreaAtuacao: string; // ex: "Gerência Executiva de Riscos e Compliance - GECON / PLD-FT"
  dataAnalise: string;
}

export interface ParecerGestorGeconGesin {
  decisaoGestor: 'CONCORDAR_ARQUIVAMENTO' | 'APROVAR_ENVIO_COAF' | 'SOLICITAR_REVISAO' | 'HOMOLOGADO';
  despachoGerencial: string;
  gerenteGeralNome: string;
  gerenteGeralCargo: string;
  areaAtuacao: string; // "GECON / GESIN - Gerência de Segurança Institucional e Conformidade"
  dataHomologacao: string;
}

export interface DeliberacaoDirex {
  decisaoDiretoria: 'DISPENSADA' | 'HOMOLOGADA_COMUNICACAO_COAF' | 'RETENCAO_CAUTELAR';
  textoDeliberacao: string; // "Dispensada - sem ocorrência de registro/comunicação ao COAF conforme critérios de materialidade..."
  dadosControleSiscoaf: {
    numeroOrigem: string;
    documentoControle: string;
    numeroRecibo?: string;
    dataEnvio?: string;
    protocoloSiscoaf?: string;
    situacaoSiscoaf?: 'Enviado e Homologado' | 'Em Preparação' | 'Dispensado de Envio';
  };
}

export interface SmartSnippet {
  id: string;
  titulo: string;
  categoria: string;
  texto: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  analista: string;
  acao: string;
  detalhes: string;
}

export interface CapacidadeFinanceiraInfo {
  rendaDeclarada: number;
  patrimonioDeclarado: number;
  volumeTransacionadoMes: number;
  fatorIncompatibilidade: number; // ex: 12x a renda
  tipoComprovacao: string; // IRPF, Pró-Labore, Holerite, Não Comprovada
  dataUltimaAtualizacao: string;
  fonteRenda: string;
  cnpjFontePagadora?: string;
  origemRecursosDeclarada: string;
  capacidadeMensalEstimada: number;
  desvioPadraoMovimentacao: string;
}

export interface ResumoAnalisePldChecklist {
  qualificacaoKyc: boolean;
  capacidadeFinanceira: boolean;
  listasRestritivas: boolean;
  enquadramentoPep: boolean;
  vinculosSocietarios: boolean;
  origemDestinoRecursos: boolean;
  midiasDesabonadoras: boolean;
  analiseFracionamento: boolean;
  contasPassagem: boolean;
}

export interface ParecerState {
  deliberacao: 'ARQUIVAR' | 'DILIGENCIA' | 'COMUNICAR_COAF' | 'BLOQUEIO_CAUTELAR' | 'APROVAR' | 'REPROVAR' | null;
  texto: string;
  tipologiaCoaf?: string;
  motivoArquivamento?: string;
  fundamentacaoLegal?: string;
  solicitacaoDiligencia?: string;
  prazoDiligenciaDias?: number;
  checklist: {
    extratoAnalisado: boolean;
    midiasConsultadas: boolean;
    vinculosSocietariosChecados: boolean;
    rendaVerificada: boolean;
    origemDestinoIdentificados: boolean;
    pepChecado: boolean;
  };
  salvoEm?: string;
  finalizadoEm?: string;
  analistaResponsavel: string;
}

export interface RegraMotorPld {
  id: string;
  codigo: string;
  nome: string;
  categoria: 'Limite Objetivo' | 'Fracionamento' | 'Fator Geográfico' | 'Comportamental' | 'Pessoas de Alto Risco';
  condicaoLogica: string;
  pesoRisco: 'Crítico' | 'Alto' | 'Médio' | 'Automático (COE)';
  baseLegal: string;
  acaoRecomendada: string;
  status: 'Ativa' | 'Calibração';
}

export interface LoteCoeRegistro {
  id: string;
  alertaId: string;
  dataOperacao: string;
  cpfCnpjTitular: string;
  nomeTitular: string;
  cidadeUf: string;
  agencia: string;
  conta: string;
  tipoOperacao: 'Depósito em Espécie' | 'Saque em Espécie' | 'Pagamento de Boleto em Espécie' | 'Provisionamento de Saque';
  valor: number;
  identificacaoDepositante: {
    exigida: boolean;
    identificado: boolean;
    cpfCnpj?: string;
    nome?: string;
  };
  enviadoSiscoaf: boolean;
  numeroProtocoloSiscoaf?: string;
  dataGeracaoLote: string;
}

export interface CasoInvestigacao {
  id: string;
  alertaId: string;
  nome: string;
  cpf: string;
  matricula: string;
  idade: number;
  renda: number;
  perfil: string;
  risco: RiskLevel;
  riscoLetra?: string;
  scoreRisco: number;
  isPep: boolean;
  pepCargo?: string;
  alerta: string;
  regraDisparada: string;
  artigoRegulatorio?: string;
  dataAlerta: string;
  slaHorasRestantes: number;
  slaLimite: string;
  valorEnvolvido: number;
  status: AlertStatus;
  
  // AML / PLD Data Fields
  tipologiaPld: string;
  gatilhoAlerta: string;
  volumeAtipicoPeriodo: number;
  capacidadeFinanceira: CapacidadeFinanceiraInfo;
  importadaEm: string;
  analistaIniciais: string;
  analistaNome: string;
  assumidaEm?: string;
  resumoPldChecklist: ResumoAnalisePldChecklist;

  // Specific COOPERFORTE / PLD-FT Parts
  informacoesComplementares?: InformacoesComplementaresPld;
  dadosTransacoesMes?: DadosTransacoesMesPld;
  analiseTecnica?: AnaliseTecnicaAnalista;
  parecerGestor?: ParecerGestorGeconGesin;
  deliberacaoDirex?: DeliberacaoDirex;

  // New specific AML/CFT indicators
  regiaoRisco?: RegiaoRisco;
  regiaoNome?: string;
  isCsnuListed?: boolean; // Lei 13.810/2019
  isCoeObrigatorio?: boolean; // Espécie >= 50k
  isAmortizacaoAntecipada?: boolean; // Liquidação DCO

  kyc: KycProfile;
  transacoes: Transaction[];
  grafo: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  parecer: ParecerState;
  auditLogs: AuditLog[];
}
