import {
  CasoInvestigacao,
  TipoFicha,
  RemessaMensal,
  ParecerVersao,
  DecisaoGecan,
  StatusHistoricoItem,
  ExportacaoLogItem,
  FichaAnteriorItem,
  SnapshotCadastralInfo,
  DeviceIntelligence
} from '../types';
import { mockDefaultDevices } from '../data/mock-bi-data';

export const mockRemessasIniciais: RemessaMensal[] = [
  {
    id: 'rem-2026-08-op',
    dataReferencia: '08/2026',
    tipoFicha: 'Operações',
    dtGeracao: '01/08/2026 04:30',
    totalFichas: 142,
    fichasNovas: 18,
    fichasJaExistentes: 124,
    fichasConcluidas: 118,
    fichasPendentes: 24,
    status: 'Em Andamento',
    geradaPor: 'Job Automático SQL Server (STP_PLDFT_GERAR_REMESSA)',
  },
  {
    id: 'rem-2026-08-cc',
    dataReferencia: '08/2026',
    tipoFicha: 'Conta Corrente',
    dtGeracao: '01/08/2026 04:45',
    totalFichas: 96,
    fichasNovas: 12,
    fichasJaExistentes: 84,
    fichasConcluidas: 78,
    fichasPendentes: 18,
    status: 'Em Andamento',
    geradaPor: 'Job Automático SQL Server (STP_PLDFT_GERAR_REMESSA)',
  },
  {
    id: 'rem-2026-07-op',
    dataReferencia: '07/2026',
    tipoFicha: 'Operações',
    dtGeracao: '01/07/2026 04:30',
    totalFichas: 135,
    fichasNovas: 22,
    fichasJaExistentes: 113,
    fichasConcluidas: 135,
    fichasPendentes: 0,
    status: 'Concluída',
    geradaPor: 'Job Automático SQL Server (STP_PLDFT_GERAR_REMESSA)',
  },
  {
    id: 'rem-2026-07-cc',
    dataReferencia: '07/2026',
    tipoFicha: 'Conta Corrente',
    dtGeracao: '01/07/2026 04:45',
    totalFichas: 88,
    fichasNovas: 14,
    fichasJaExistentes: 74,
    fichasConcluidas: 88,
    fichasPendentes: 0,
    status: 'Concluída',
    geradaPor: 'Job Automático SQL Server (STP_PLDFT_GERAR_REMESSA)',
  }
];

export const mockExportLogsIniciais: ExportacaoLogItem[] = [
  {
    id: 'exp-01',
    fichaId: 'case-001',
    nomeCaso: 'RICARDO BARRETO NOGUEIRA',
    cpf: '412.940.118-20',
    formato: 'PDF',
    dataHora: '20/08/2026 14:22:10',
    usuario: 'Maísa Ramos (Compliance)',
    finalidade: 'Dossiê Completo para Submissão SISCOAF',
  },
  {
    id: 'exp-02',
    nomeCaso: 'Fila Completa Mês 08/2026',
    formato: 'CSV',
    dataHora: '20/08/2026 11:05:40',
    usuario: 'Maísa Ramos (Compliance)',
    finalidade: 'Relatório Mensal de Gestão de Riscos GECAN',
  },
  {
    id: 'exp-03',
    fichaId: 'case-002',
    nomeCaso: 'DEPUTADO VALMIR GUIMARÃES NETO',
    cpf: '302.948.102-44',
    formato: 'XML',
    dataHora: '19/08/2026 16:50:02',
    usuario: 'Maísa Ramos (Compliance)',
    finalidade: 'Exportação Estruturada SISCOAF - Pessoas Expostas Politicamente',
  }
];

export const catalogoTipologiasCoaf = [
  {
    codigo: '1.1.1',
    nome: 'Incompatibilidade com Patrimônio / Capacidade Financeira',
    base: 'Carta-Circular BACEN nº 4.001/2020, Item 1.1.1',
    descricao: 'Movimentação de recursos em montante significativamente incompatível com o patrimônio, faturamento ou renda declarada do associado.',
  },
  {
    codigo: '1.1.2',
    nome: 'Burla de Limites de Comunicação Obrigatória',
    base: 'Carta-Circular BACEN nº 4.001/2020, Item 1.1.2',
    descricao: 'Operações que, por habitualidade e fracionamento de valores, busquem elidir a identificação e comunicação compulsória.',
  },
  {
    codigo: '1.1.3',
    nome: 'Fracionamento / Smurfing em Espécie ou PIX',
    base: 'Circular BACEN nº 3.978/2020, Art. 38, Inciso I',
    descricao: 'Realização de depósitos, saques ou transferências estruturadas abaixo de R$ 10.000 ou R$ 50.000 visando não atingir os limiares de COE.',
  },
  {
    codigo: '1.1.4',
    nome: 'Operação Atípica Envolvendo PEP ou Familiares',
    base: 'Resolução COAF nº 40/2021 e Circular BACEN nº 3.978/2020',
    descricao: 'Movimentações substanciais em conta de Pessoa Exposta Politicamente sem lastro em proventos de cargo público ou patrimônio lícito.',
  },
  {
    codigo: '1.1.5',
    nome: 'Conta de Passagem (Pass-through) sem Retenção de Saldo',
    base: 'Circular BACEN nº 3.978/2020, Art. 38, Inciso V',
    descricao: 'Créditos recebidos pulverizados e imediatamente transferidos em menos de 24h, com saldo final próximo de zero.',
  },
  {
    codigo: '1.1.8',
    nome: 'Amortização Antecipada de Empréstimo / DCO com Recursos de Terceiros',
    base: 'Carta-Circular BACEN nº 4.001/2020, Item 1.1.8',
    descricao: 'Contratação de financiamento ou mútuo seguida de amortização abrupta em espécie ou via intervenientes sem nexo comercial.',
  },
  {
    codigo: '1.1.9',
    nome: 'Atipicidade em Faixa de Fronteira ou Polos de Mineração',
    base: 'Avaliação de Risco Geográfico BACEN/COAF/PF',
    descricao: 'Operações em municípios de risco geográfico elevado (fronteira internacional ou mineração/garimpo) sem lastro em licenças ou notas idôneas.',
  },
  {
    codigo: '1.1.10',
    nome: 'Sanções do Conselho de Segurança da ONU (Lei 13.810/19)',
    base: 'Lei Federal nº 13.810/2019 e Resolução BCB nº 44',
    descricao: 'Enquadramento em listas de sanções ao financiamento do terrorismo, impondo indisponibilidade de bens cautelar imediata.',
  }
];

export const catalogoMotivosAlerta = [
  { codigo: 'PEP', titulo: 'Pessoa Exposta Politicamente & Familiares', baseLegal: 'Art. 25 a 29, Circ. BACEN 3.978/20 e Res. COAF 40/21' },
  { codigo: 'REG_FRONT', titulo: 'Região de Faixa de Fronteira Internacional', baseLegal: 'Circular BACEN 3.978/2020 (Risco Geográfico)' },
  { codigo: 'REG_MINER', titulo: 'Polo de Mineração e Garimpo de Ouro', baseLegal: 'Carta-Circular 4.001/20 e Orientações COAF/PF Garimpo' },
  { codigo: 'REC_TERCEIROS', titulo: 'Recursos de Terceiros / Procuração', baseLegal: 'IN RFB nº 2.119/2022 e Carta-Circular BACEN 4.001' },
  { codigo: 'MENOR', titulo: 'Conta de Menor de Idade', baseLegal: 'Código Civil e Art. 13 da Circular BACEN 3.978/2020' },
  { codigo: 'FUNCI_COOPER', titulo: 'Funcionário / Colaborador da Cooperativa', baseLegal: 'Código de Ética e Circular BACEN 3.978 (Risco Interno)' },
  { codigo: 'LIMOC', titulo: 'Monitoramento Condicionado (LIMOC)', baseLegal: 'Política Institucional de Riscos PLD/FT' },
  { codigo: 'CSNU', titulo: 'Sanções ONU / Terrorismo', baseLegal: 'Lei Federal nº 13.810/2019 e Resolução BCB nº 44' },
  { codigo: 'SMURFING', titulo: 'Fracionamento / Smurfing Acumulado', baseLegal: 'Art. 38, Inciso I da Circular BACEN 3.978/2020' },
  { codigo: 'INCOMP_PATRIMONIAL', titulo: 'Incompatibilidade Econômico-Financeira', baseLegal: 'Carta-Circular BACEN 4.001/20, Item 1.1.1' },
];

/**
 * Calcula a distância de Levenshtein aproximada e o percentual de edição humana
 * comparando o texto sugerido pelo sistema com o texto final redigido pelo analista.
 */
export function calcularPercentualEdicaoHumana(textoSugerido: string, textoFinal: string): number {
  if (!textoSugerido && !textoFinal) return 0;
  if (!textoSugerido && textoFinal) return 100;
  if (textoSugerido === textoFinal) return 0;

  const s1 = textoSugerido.trim().split(/\s+/);
  const s2 = textoFinal.trim().split(/\s+/);

  if (s1.length === 0) return 100;

  const set1 = new Set(s1);
  let wordsDifferent = 0;

  for (const w of s2) {
    if (!set1.has(w)) {
      wordsDifferent++;
    }
  }

  const lengthDelta = Math.abs(s2.length - s1.length);
  const rawScore = ((wordsDifferent + lengthDelta) / Math.max(s1.length, s2.length)) * 100;
  return Math.min(100, Math.max(5, Math.round(rawScore)));
}

/**
 * Gera o texto sugerido de parecer técnico automaticamente a partir do cadastro, transações e checklist
 * equivalente ao porte das regras em T-SQL / stored procedures (RF-15).
 */
export function gerarParecerSugeridoAutomatico(caso: CasoInvestigacao): string {
  const rendaFormatada = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    caso.capacidadeFinanceira?.rendaDeclarada || caso.renda
  );
  const volumeFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    caso.volumeAtipicoPeriodo || caso.valorEnvolvido
  );

  let perfilTexto = `O(A) associado(a) ${caso.nome}, inscrito(a) no CPF ${caso.cpf}, atua como ${caso.kyc.profissao || caso.perfil} com domicílio em ${caso.kyc.cidadeUf}. Renda mensal declarada de ${rendaFormatada}.`;

  if (caso.snapshotCadastral?.contratosCreditoAtivos && caso.snapshotCadastral.contratosCreditoAtivos.length > 0) {
    const totalContratos = caso.snapshotCadastral.contratosCreditoAtivos.reduce((acc, c) => acc + c.saldoDevedor, 0);
    perfilTexto += ` Possui ${caso.snapshotCadastral.contratosCreditoAtivos.length} contrato(s) de crédito ativo(s) totalizando saldo devedor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalContratos)}.`;
  }

  let movimentacaoTexto = '';
  if (caso.regiaoRisco === 'Fronteira' || caso.regiaoRisco === 'Mineração') {
    movimentacaoTexto = `Identificou-se movimentação atípica em montante de ${volumeFormatado} em praça situada em ${caso.regiaoNome || caso.kyc.cidadeUf} (${caso.regiaoRisco}), com volume superior à capacidade financeira cadastral.`;
  } else if (caso.isPep) {
    movimentacaoTexto = `Na condição de Pessoa Exposta Politicamente (${caso.pepCargo || 'PEP'}), transacionou volume financeiro de ${volumeFormatado} no período, impondo procedimento de Diligência Reforçada (EDD) nos termos da Circular BACEN nº 3.978/2020.`;
  } else if (caso.isCsnuListed) {
    movimentacaoTexto = `Constatada coincidência de titularidade em listas restritivas do CSNU / Conselho de Segurança da ONU, impondo estrita observância à Lei nº 13.810/2019.`;
  } else {
    movimentacaoTexto = `No período de referência analisado, foram transacionados recursos atípicos no montante consolidado de ${volumeFormatado}, disparando a regra de conformidade [${caso.regraDisparada}].`;
  }

  let checklistTexto = '';
  if (caso.validacaoDossie?.itens) {
    const pendentes = caso.validacaoDossie.itens.filter((i) => i.status === 'PENDENTE' || i.status === 'NAO_CONFORME');
    if (pendentes.length > 0) {
      checklistTexto = ` No checklist regulatório da categoria [${caso.validacaoDossie.tituloCategoria}], constam pendências nos seguintes itens: ${pendentes.map((p) => p.codigo).join(', ')}.`;
    } else {
      checklistTexto = ` O checklist específico de compliance [${caso.validacaoDossie.tituloCategoria}] foi integralmente validado e encontra-se em conformidade.`;
    }
  }

  let conclusaoSugerida = '';
  if (caso.scoreRisco >= 70 || caso.isCsnuListed) {
    conclusaoSugerida = ` Conclusão preliminar sugerida pelo sistema: Apresenta indícios fundamentados de atipicidade financeira sem lastro fático idôneo, recomendando-se a deliberação para COMUNICAÇÃO COMPULSÓRIA AO COAF / SISCOAF.`;
  } else if (caso.scoreRisco <= 35) {
    conclusaoSugerida = ` Conclusão preliminar sugerida pelo sistema: Apresenta compatibilidade com o histórico do cooperado, recomendando-se o ARQUIVAMENTO como Atipicidade Justificada / Falso Positivo.`;
  } else {
    conclusaoSugerida = ` Conclusão preliminar sugerida pelo sistema: Recomenda-se complementação de diligência documental para apuração da origem dos recursos antes do encerramento da ficha.`;
  }

  return `${perfilTexto}\n\n${movimentacaoTexto}${checklistTexto}\n\n${conclusaoSugerida}`;
}

/**
 * Enriquece o caso com metadados do modelo v2 caso ainda não existam.
 */
export function enriquecerCasoComV2(caso: CasoInvestigacao): CasoInvestigacao {
  const tipoFicha: TipoFicha = caso.tipoFicha || (caso.tipologiaPld.includes('Conta') ? 'Conta Corrente' : 'Operações');
  const dataReferencia = caso.dataReferencia || '08/2026';

  const snapshotCadastral: SnapshotCadastralInfo = caso.snapshotCadastral || {
    rendaDeclarada: caso.capacidadeFinanceira?.rendaDeclarada || caso.renda,
    patrimonioDeclarado: caso.capacidadeFinanceira?.patrimonioDeclarado || caso.kyc.patrimonioDeclarado,
    profissao: caso.kyc.profissao,
    empresaVinculo: caso.kyc.empresaVinculo,
    segmentoPerfilSigla: caso.kyc.segmentacaoPerfilNegocial ? 'PLATINUM' : 'STANDARD',
    segmentoDescricao: caso.kyc.segmentacaoPerfilNegocial || 'Associado Individual Pleno',
    enderecoCompleto: caso.kyc.endereco,
    cidadeUf: caso.kyc.cidadeUf,
    fatorGeografico: caso.regiaoRisco || 'Padrão',
    limocAtivo: caso.informacoesComplementares?.indicadorLimoc?.ativo || false,
    limocValorTeto: caso.informacoesComplementares?.indicadorLimoc?.limiteOperacionalCredito,
    contratosCreditoAtivos: [
      {
        numeroContrato: 'CTR-2025-9018',
        modalidade: 'Crédito Pessoal Parcelado / DCO',
        saldoDevedor: Math.round(caso.valorEnvolvido * 0.45),
        dataContratacao: '14/11/2025',
      },
      {
        numeroContrato: 'CTR-2026-1142',
        modalidade: 'Financiamento Sustentável / Equipamentos',
        saldoDevedor: Math.round(caso.valorEnvolvido * 0.2),
        dataContratacao: '10/02/2026',
      }
    ],
    produtosInvestimentoAtivos: [
      {
        modalidade: 'RDC Pós-Fixado 102% CDI',
        saldoAplicado: Math.round(caso.renda * 3.5),
      }
    ],
    dtSnapshot: '01/08/2026 04:30',
  };

  const textoSugeridoAuto = caso.versoesParecer?.[0]?.textoAutomaticoSugerido || gerarParecerSugeridoAutomatico(caso);
  const textoFinalAtual = caso.parecer?.texto || textoSugeridoAuto;

  const versoesParecer: ParecerVersao[] = caso.versoesParecer && caso.versoesParecer.length > 0 ? caso.versoesParecer : [
    {
      id: 'ver-1',
      versao: 1,
      vigente: true,
      textoAutomaticoSugerido: textoSugeridoAuto,
      textoFinal: textoFinalAtual,
      percentualEdicaoHumana: calcularPercentualEdicaoHumana(textoSugeridoAuto, textoFinalAtual),
      analistaNome: caso.analistaNome || 'Maísa Ramos',
      dataCriacao: caso.dataAlerta || '20/08/2026 10:30',
      tipoSalvamento: caso.status === 'Comunicado COAF' || caso.status === 'Arquivado' ? 'DEFINITIVO' : 'RASCUNHO',
    }
  ];

  const decisaoGecanDetalhada: DecisaoGecan = caso.decisaoGecanDetalhada || {
    decisao: caso.status === 'Comunicado COAF' ? 'COMUNICAR_COAF' : caso.status === 'Arquivado' ? 'SEM_OCORRENCIA' : null,
    recomendacaoGecan: caso.status === 'Comunicado COAF' ? 'Comunicação SISCOAF de imediato e manutenção de monitoramento de fluxo.' : 'Arquivar nos autos de PLD e renovar cadastro em 12 meses.',
    tipologiaCoafCodigo: caso.status === 'Comunicado COAF' ? '1.1.1' : undefined,
    tipologiaCoafDescricao: caso.status === 'Comunicado COAF' ? 'Incompatibilidade com capacidade financeira e patrimônio' : undefined,
    dataDecisao: caso.status === 'Comunicado COAF' || caso.status === 'Arquivado' ? '20/08/2026 15:00' : undefined,
    dataComunicacaoCoaf: caso.status === 'Comunicado COAF' ? '20/08/2026 16:15' : undefined,
    numeroProtocoloSiscoaf: caso.status === 'Comunicado COAF' ? 'SISCOAF-2026-COOPER-991823' : undefined,
    prazoLimiteComunicacao: '21/08/2026 16:15',
    tempestiva: true,
    sigiloAtivo: true,
    membroGecanResponsavel: 'Comitê GECAN / Direx Cooperforte',
  };

  const statusHistorico: StatusHistoricoItem[] = caso.statusHistorico && caso.statusHistorico.length > 0 ? caso.statusHistorico : [
    {
      id: 'hist-1',
      deStatus: 'Pendente',
      paraStatus: caso.status,
      dataHora: caso.dataAlerta || '20/08/2026 10:30',
      usuario: caso.analistaNome || 'Maísa Ramos',
      detalhes: 'Geração mensal automática a partir do motor de seleção T-SQL.',
    }
  ];

  const fichasAnteriores: FichaAnteriorItem[] = caso.fichasAnteriores || [
    {
      id: `fich-ant-${caso.id}-07`,
      dataReferencia: '07/2026',
      tipoFicha,
      status: 'Concluída',
      decisao: 'SEM_OCORRENCIA',
      analista: 'Maísa Ramos',
      valorEnvolvido: Math.round(caso.valorEnvolvido * 0.7),
      motivo: 'Verificação periódica de volume',
      dataConclusao: '22/07/2026',
    },
    {
      id: `fich-ant-${caso.id}-06`,
      dataReferencia: '06/2026',
      tipoFicha,
      status: 'Concluída',
      decisao: 'SEM_OCORRENCIA',
      analista: 'Carlos Eduardo',
      valorEnvolvido: Math.round(caso.valorEnvolvido * 0.5),
      motivo: 'Movimentação em região de fronteira',
      dataConclusao: '24/06/2026',
    }
  ];

  const totalAnteriores = fichasAnteriores.length;
  const reincidenciaPld = caso.reincidenciaPld || {
    totalAnalisesAnteriores: totalAnteriores,
    mesesAnteriores: fichasAnteriores.map((f) => f.dataReferencia),
    ultimaDataAnalise: fichasAnteriores[0]?.dataConclusao || '22/07/2026',
    statusAnteriores: fichasAnteriores.map((f) => f.decisao === 'COMUNICAR_COAF' ? 'Comunicado COAF' : 'Arquivado'),
  };

  const demandaAtualizacaoGecan = caso.demandaAtualizacaoGecan !== undefined
    ? caso.demandaAtualizacaoGecan
    : ((caso.capacidadeFinanceira?.fatorIncompatibilidade || 0) > 3 || caso.capacidadeFinanceira?.tipoComprovacao === 'Não Comprovada' || caso.capacidadeFinanceira?.tipoComprovacao === 'Extrato Bancário');

  // Device Intelligence
  const device: DeviceIntelligence = caso.device || (caso.alertaId && mockDefaultDevices[caso.alertaId]) || {
    deviceId: `DEV-${caso.id.toUpperCase()}-BR`,
    modelo: caso.scoreRisco > 85 ? 'Apple iPhone 14 Pro Max' : 'Samsung Galaxy A54 5G',
    sistemaOperacional: caso.scoreRisco > 85 ? 'iOS 17.4 (Jailbreak detectado)' : 'Android 14',
    ip: `189.${Math.floor(Math.random() * 200 + 20)}.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 250 + 1)}`,
    localizacaoGeo: `${caso.kyc.cidadeUf} - Brasil`,
    provedorIsp: 'Claro / NET Telecom',
    scoreRiscoFraude: caso.scoreRisco > 80 ? Math.min(98, caso.scoreRisco + 2) : Math.max(12, caso.scoreRisco - 20),
    nivelRiscoFraude: caso.scoreRisco >= 85 ? 'Crítico' : caso.scoreRisco >= 65 ? 'Alto' : caso.scoreRisco >= 40 ? 'Médio' : 'Baixo',
    notasAltas: caso.scoreRisco >= 80 ? [
      'Dispositivo com Jailbreak/Root detectado',
      'Geovelocidade atípica com logins divergentes',
      'Múltiplos CPFs associados ao mesmo hardware'
    ] : caso.scoreRisco >= 60 ? ['Uso eventual de VPN corporativa'] : [],
    vpnAtiva: caso.scoreRisco >= 75,
    multiplosCpfsAssociados: caso.scoreRisco >= 85,
    emuladorDetectado: false,
    simSwapRecente: caso.scoreRisco >= 90,
    dataUltimoAcesso: caso.dataAlerta || '20/08/2026 08:30'
  };

  // Estado Civil
  const estadoCivil = caso.estadoCivil || (caso.idade >= 45 ? 'Casado(a)' : caso.idade >= 32 ? 'União Estável' : 'Solteiro(a)');

  // Tempo Associado Meses
  const tempoAssociadoMeses = caso.tempoAssociadoMeses || (
    caso.kyc.dataAssociacao?.includes('2 anos') ? 24 :
    caso.kyc.dataAssociacao?.includes('5 anos') ? 60 :
    caso.kyc.dataAssociacao?.includes('1 ano') ? 12 :
    caso.kyc.dataAssociacao?.includes('10 anos') ? 120 : 36
  );

  // Origem dos Recursos
  const origemRecursos = caso.origemRecursos || (
    caso.capacidadeFinanceira?.origemRecursosDeclarada ||
    (caso.tipologiaPld.includes('Espécie') ? 'Venda de Imóveis' :
     caso.tipologiaPld.includes('Fracionamento') ? 'Comércio / Varejo' :
     caso.isPep ? 'Salário / Vencimentos Públicos' :
     caso.valorEnvolvido > 500000 ? 'Venda de Imóveis' : 'Salário / Proventos')
  );

  // Região do País
  const regiaoPais = caso.regiaoPais || (
    caso.kyc.cidadeUf.includes('/ DF') || caso.kyc.cidadeUf.includes('/ MT') || caso.kyc.cidadeUf.includes('/ MS') || caso.kyc.cidadeUf.includes('/ GO') ? 'Centro-Oeste' :
    caso.kyc.cidadeUf.includes('/ SP') || caso.kyc.cidadeUf.includes('/ RJ') || caso.kyc.cidadeUf.includes('/ MG') || caso.kyc.cidadeUf.includes('/ ES') ? 'Sudeste' :
    caso.kyc.cidadeUf.includes('/ PR') || caso.kyc.cidadeUf.includes('/ SC') || caso.kyc.cidadeUf.includes('/ RS') ? 'Sul' :
    caso.kyc.cidadeUf.includes('/ BA') || caso.kyc.cidadeUf.includes('/ CE') || caso.kyc.cidadeUf.includes('/ PE') ? 'Nordeste' : 'Norte'
  );

  // Transações enriquecidas com horários e tags de jogos
  const transacoes = (caso.transacoes || []).map((t, idx) => {
    let hora = t.hora;
    if (!hora) {
      const horasPredefinidas = ['02:15', '09:40', '14:20', '16:45', '21:35', '23:10', '11:05', '17:50'];
      hora = horasPredefinidas[idx % horasPredefinidas.length];
    }
    const [h] = hora.split(':').map(Number);
    const faixaHorario: 'Madrugada' | 'Manhã' | 'Tarde' | 'Noite' =
      h >= 0 && h < 6 ? 'Madrugada' :
      h >= 6 && h < 12 ? 'Manhã' :
      h >= 12 && h < 18 ? 'Tarde' : 'Noite';

    const isHorarioJogos = t.isHorarioJogos !== undefined ? t.isHorarioJogos : (
      (hora >= '21:00' && hora <= '23:30') || (hora >= '16:00' && hora <= '18:15')
    );

    return {
      ...t,
      hora,
      faixaHorario,
      isHorarioJogos
    };
  });

  return {
    ...caso,
    tipoFicha,
    dataReferencia,
    snapshotCadastral,
    versoesParecer,
    decisaoGecanDetalhada,
    statusHistorico,
    fichasAnteriores,
    reincidenciaPld,
    demandaAtualizacaoGecan,
    device,
    estadoCivil,
    tempoAssociadoMeses,
    origemRecursos,
    regiaoPais,
    transacoes,
    kyc: {
      ...caso.kyc,
      estadoCivil: caso.kyc.estadoCivil || (estadoCivil as any),
      tempoAssociadoMeses: caso.kyc.tempoAssociadoMeses || tempoAssociadoMeses,
      origemRecursosPrincipal: caso.kyc.origemRecursosPrincipal || origemRecursos,
      deviceInfo: caso.kyc.deviceInfo || device
    }
  };
}

/**
 * Gera arquivo XML estruturado para exportação oficial da ficha digital e reporte regulatório.
 */
export function exportarFichaParaXml(caso: CasoInvestigacao): string {
  const sanitize = (str?: string | number | null) => {
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<DossiePldFtV2 xmlns="urn:bcb:cooperforte:pldft:v2" versao="2.0">
  <CabecalhoRemessa>
    <IdFicha>${sanitize(caso.id)}</IdFicha>
    <AlertaId>${sanitize(caso.alertaId)}</AlertaId>
    <DataReferencia>${sanitize(caso.dataReferencia || '08/2026')}</DataReferencia>
    <TipoFicha>${sanitize(caso.tipoFicha || 'Operações')}</TipoFicha>
    <DataExtracao>${new Date().toISOString()}</DataExtracao>
    <AmbienteFonte>GESIN - SCH_PLDFT</AmbienteFonte>
    <StatusAtual>${sanitize(caso.status)}</StatusAtual>
  </CabecalhoRemessa>
  
  <AssociadoInvestigado>
    <CpfCnpj>${sanitize(caso.cpf)}</CpfCnpj>
    <NomeCompleto>${sanitize(caso.nome)}</NomeCompleto>
    <Matricula>${sanitize(caso.matricula)}</Matricula>
    <Profissao>${sanitize(caso.kyc.profissao)}</Profissao>
    <CidadeUf>${sanitize(caso.kyc.cidadeUf)}</CidadeUf>
    <RendaDeclarada>${caso.capacidadeFinanceira?.rendaDeclarada || caso.renda}</RendaDeclarada>
    <PatrimonioDeclarado>${caso.capacidadeFinanceira?.patrimonioDeclarado || caso.kyc.patrimonioDeclarado}</PatrimonioDeclarado>
    <IsPep>${caso.isPep ? 'true' : 'false'}</IsPep>
    <PepCargo>${sanitize(caso.pepCargo || '')}</PepCargo>
    <IsCsnuTerrorismo>${caso.isCsnuListed ? 'true' : 'false'}</IsCsnuTerrorismo>
    <FatorGeografico>${sanitize(caso.regiaoRisco || 'Padrão')}</FatorGeografico>
    <ScoreRisco>${caso.scoreRisco}</ScoreRisco>
    <NivelRisco>${sanitize(caso.risco)}</NivelRisco>
  </AssociadoInvestigado>

  <TransacoesAtipicasAnalise>
    ${caso.transacoes.map((t) => `
    <Transacao id="${sanitize(t.id)}">
      <Data>${sanitize(t.data)}</Data>
      <Hora>${sanitize(t.hora || '')}</Hora>
      <Tipo>${sanitize(t.tipo)}</Tipo>
      <Valor>${t.valor}</Valor>
      <Contraparte>${sanitize(t.contraparte)}</Contraparte>
      <ContraparteCpfCnpj>${sanitize(t.contraparteCpfCnpj || '')}</ContraparteCpfCnpj>
      <Metodo>${sanitize(t.metodo || 'PIX')}</Metodo>
      <IsSuspeita>${t.isSuspeita ? 'true' : 'false'}</IsSuspeita>
      <MotivoSuspeita>${sanitize(t.motivoSuspeita || '')}</MotivoSuspeita>
    </Transacao>`).join('')}
  </TransacoesAtipicasAnalise>

  <ChecklistRegulatorio>
    <Categoria>${sanitize(caso.validacaoDossie?.categoria || caso.categoriaDossie || 'DEMAIS_RECURSO_PROPRIO')}</Categoria>
    <StatusGeral>${sanitize(caso.validacaoDossie?.statusGeral || 'CONFORME')}</StatusGeral>
    <Itens>
      ${(caso.validacaoDossie?.itens || []).map((it) => `
      <Item codigo="${sanitize(it.codigo)}">
        <Titulo>${sanitize(it.titulo)}</Titulo>
        <Status>${sanitize(it.status)}</Status>
        <Origem>${sanitize(it.origemValidacao || 'MANUAL')}</Origem>
        <BaseLegal>${sanitize(it.baseLegal || '')}</BaseLegal>
        <Evidencia>${sanitize(it.evidenciaDoc || '')}</Evidencia>
      </Item>`).join('')}
    </Itens>
  </ChecklistRegulatorio>

  <ParecerTecnicoVigente>
    <AnalistaResponsavel>${sanitize(caso.analistaNome || 'Maísa Ramos')}</AnalistaResponsavel>
    <Versao>${caso.versoesParecer?.[0]?.versao || 1}</Versao>
    <PercentualEdicaoHumana>${caso.versoesParecer?.[0]?.percentualEdicaoHumana || 0}%</PercentualEdicaoHumana>
    <TextoFinal>${sanitize(caso.parecer.texto)}</TextoFinal>
  </ParecerTecnicoVigente>

  <DecisaoGecan>
    <Deliberacao>${sanitize(caso.decisaoGecanDetalhada?.decisao || caso.parecer.deliberacao || 'SEM_OCORRENCIA')}</Deliberacao>
    <TipologiaCoaf>${sanitize(caso.decisaoGecanDetalhada?.tipologiaCoafCodigo || caso.parecer.tipologiaCoaf || '')}</TipologiaCoaf>
    <DataDecisao>${sanitize(caso.decisaoGecanDetalhada?.dataDecisao || '')}</DataDecisao>
    <NumeroProtocoloSiscoaf>${sanitize(caso.decisaoGecanDetalhada?.numeroProtocoloSiscoaf || '')}</NumeroProtocoloSiscoaf>
    <SigiloAtivo>true</SigiloAtivo>
  </DecisaoGecan>
</DossiePldFtV2>`;
}

/**
 * Exportação em Lote de Fichas em formato XML consolidado para SISCOAF/BACEN
 */
export function exportarLoteXml(casos: CasoInvestigacao[], periodo: string): string {
  const sanitize = (str?: string | number | null) => {
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const totalVolume = casos.reduce((acc, c) => acc + (c.volumeAtipicoPeriodo || c.valorEnvolvido || 0), 0);

  return `<?xml version="1.0" encoding="UTF-8"?>
<LoteConsolidadoPldFt xmlns="urn:bcb:cooperforte:pldft:lote:v2" versao="2.0">
  <MetadadosLote>
    <Instituicao>COOPERFORTE - Cooperativa de Economia e Crédito Mútuo</Instituicao>
    <CnpjInstituicao>00.581.428/0001-09</CnpjInstituicao>
    <PeriodoReferencia>${sanitize(periodo)}</PeriodoReferencia>
    <DataGeracaoLote>${new Date().toISOString()}</DataGeracaoLote>
    <QuantidadeFichas>${casos.length}</QuantidadeFichas>
    <VolumeTotalDeclarado>${totalVolume.toFixed(2)}</VolumeTotalDeclarado>
    <HashIntegridadeSha256>SHA256-LOTE-${Date.now()}-${casos.length}</HashIntegridadeSha256>
  </MetadadosLote>
  <FichasInvestigacao>
    ${casos.map((caso) => `
    <Ficha id="${sanitize(caso.id)}" alertaId="${sanitize(caso.alertaId)}">
      <Titular>
        <Nome>${sanitize(caso.nome)}</Nome>
        <CpfCnpj>${sanitize(caso.cpf)}</CpfCnpj>
        <Matricula>${sanitize(caso.matricula)}</Matricula>
        <Perfil>${sanitize(caso.kyc?.profissao || caso.perfil)}</Perfil>
        <CidadeUf>${sanitize(caso.kyc?.cidadeUf)}</CidadeUf>
        <RegiaoPais>${sanitize(caso.regiaoPais || 'Centro-Oeste')}</RegiaoPais>
        <EstadoCivil>${sanitize(caso.estadoCivil || 'Casado(a)')}</EstadoCivil>
        <TempoAssociadoMeses>${caso.tempoAssociadoMeses || 24}</TempoAssociadoMeses>
        <RendaDeclarada>${caso.capacidadeFinanceira?.rendaDeclarada || caso.renda}</RendaDeclarada>
        <PatrimonioDeclarado>${caso.capacidadeFinanceira?.patrimonioDeclarado || caso.kyc?.patrimonioDeclarado || 0}</PatrimonioDeclarado>
        <OrigemRecursos>${sanitize(caso.origemRecursos || 'Salário / Proventos')}</OrigemRecursos>
        <IsPep>${caso.isPep ? 'true' : 'false'}</IsPep>
        <ScoreRisco>${caso.scoreRisco}</ScoreRisco>
        <NivelRisco>${sanitize(caso.risco)}</NivelRisco>
      </Titular>
      <DispositivoAcesso>
        <DeviceId>${sanitize(caso.device?.deviceId || '')}</DeviceId>
        <Modelo>${sanitize(caso.device?.modelo || '')}</Modelo>
        <Ip>${sanitize(caso.device?.ip || '')}</Ip>
        <ScoreFraudeDispositivo>${caso.device?.scoreRiscoFraude || 0}</ScoreFraudeDispositivo>
        <NotasRisco>${(caso.device?.notasAltas || []).map((n) => `<Nota>${sanitize(n)}</Nota>`).join('')}</NotasRisco>
      </DispositivoAcesso>
      <Operacao>
        <RegraDisparada>${sanitize(caso.regraDisparada)}</RegraDisparada>
        <ValorAtipico>${caso.volumeAtipicoPeriodo || caso.valorEnvolvido}</ValorAtipico>
        <Status>${sanitize(caso.status)}</Status>
        <Decisao>${sanitize(caso.decisaoGecanDetalhada?.decisao || caso.parecer?.deliberacao || 'EM_ANALISE')}</Decisao>
        <ProtocoloSiscoaf>${sanitize(caso.decisaoGecanDetalhada?.numeroProtocoloSiscoaf || '')}</ProtocoloSiscoaf>
      </Operacao>
    </Ficha>`).join('')}
  </FichasInvestigacao>
</LoteConsolidadoPldFt>`;
}

/**
 * Exportação em Lote de Fichas em formato CSV consolidado
 */
export function exportarLoteCsv(casos: CasoInvestigacao[], periodo: string): string {
  const headers = [
    'ID_FICHA',
    'ID_ALERTA',
    'PERIODO',
    'NOME_ASSOCIADO',
    'CPF',
    'MATRICULA',
    'PROFISSAO',
    'CIDADE_UF',
    'REGIAO_PAIS',
    'ESTADO_CIVIL',
    'TEMPO_ASSOCIADO_MESES',
    'RENDA_DECLARADA',
    'PATRIMONIO_DECLARADO',
    'ORIGEM_RECURSOS',
    'IS_PEP',
    'REGRA_DISPARADA',
    'SCORE_RISCO',
    'NIVEL_RISCO',
    'VALOR_ENVOLVIDO',
    'STATUS',
    'DECISAO_GECAN',
    'SCORE_FRAUDE_DEVICE',
    'DEVICE_MODELO',
    'DEVICE_IP',
    'NOTAS_DEVICE',
    'DATA_ALERTA'
  ];

  const rows = casos.map((c) => {
    const formatCell = (val: any) => {
      const s = String(val ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };

    return [
      formatCell(c.id),
      formatCell(c.alertaId),
      formatCell(c.dataReferencia || periodo),
      formatCell(c.nome),
      formatCell(c.cpf),
      formatCell(c.matricula),
      formatCell(c.kyc?.profissao || c.perfil),
      formatCell(c.kyc?.cidadeUf),
      formatCell(c.regiaoPais || 'Centro-Oeste'),
      formatCell(c.estadoCivil || 'Casado(a)'),
      formatCell(c.tempoAssociadoMeses || 24),
      formatCell(c.capacidadeFinanceira?.rendaDeclarada || c.renda),
      formatCell(c.capacidadeFinanceira?.patrimonioDeclarado || c.kyc?.patrimonioDeclarado || 0),
      formatCell(c.origemRecursos || 'Salário / Proventos'),
      formatCell(c.isPep ? 'SIM' : 'NÃO'),
      formatCell(c.regraDisparada),
      formatCell(c.scoreRisco),
      formatCell(c.risco),
      formatCell(c.volumeAtipicoPeriodo || c.valorEnvolvido),
      formatCell(c.status),
      formatCell(c.decisaoGecanDetalhada?.decisao || c.parecer?.deliberacao || 'EM_ANALISE'),
      formatCell(c.device?.scoreRiscoFraude || 0),
      formatCell(c.device?.modelo || ''),
      formatCell(c.device?.ip || ''),
      formatCell((c.device?.notasAltas || []).join(' | ')),
      formatCell(c.dataAlerta)
    ].join(';');
  });

  return [headers.join(';'), ...rows].join('\r\n');
}
