import { CasoInvestigacao, Transaction } from '../types';
import { inferDossierCategoryFromCase, buildDossierValidationForCategory } from './dossierRequirementsHelper';

export interface CooperforteFullDossier {
  documentoControle: string;
  protocoloSiscoaf: string;
  numeroRecibo: string;
  dataEmissao: string;
  hashAutenticidade: string;
  statusAvaliacao: 'AVALIADO' | 'EM_ANALISE';
  entidadeComunicante: {
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    codigoBacen: string;
    orgaoRegulador: string;
    diretoriaResponsavel: string;
    unidadeCompliance: string;
    enderecoSede: string;
  };
  parte1: {
    nomeFirma: string;
    idade: number;
    cpfCnpj: string;
    documentoIdentificacao: string;
    numeroRegistroComercial: string;
    inscricaoCooperforte: string;
    dataAssociacao: string;
    localResidencia: string;
    perfilAssociacao: string;
    vinculoAssociacao: string;
    entidadeOrigem: string;
    rendaFaturamento: number;
    dataVencimentoRenda: string;
    naturezaRenda: string;
    patrimonio: number;
    empregadorFontePagadora: {
      razaoSocial: string;
      cnpj: string;
    };
    classificacaoPep: {
      isPep: boolean;
      detalhe: string;
    };
    classificacaoServidorPublico: {
      isServidor: boolean;
      esfera: string;
    };
    presencaCsnu: {
      isListed: boolean;
      detalhe: string;
    };
    segmentacaoPerfilNegocial: string;
    dataAtualizacaoSegmentacao: string;
    dataUltimaAlteracaoCadastral: string;
  };
  parte2: {
    pesquisaBureauAmlReputacional: {
      fontes: string[];
      midiasNegativas: string[];
      listasSancoes: string;
      status: string;
    };
    confirmacaoDetalhadaPep: {
      isPep: boolean;
      detalhamento: string;
      orgao?: string;
      cargo?: string;
      vigencia?: string;
      baseLegal: string;
    };
    indicadorLimoc: {
      isAtivo: boolean;
      limiteOperacional: number;
      utilizacaoAtual: number;
      dataVigencia: string;
      observacao: string;
    };
  };
  parte3: {
    saldoAnterior: number;
    totalCredito: number;
    totalDebito: number;
    saldoAtual: number;
    periodoInicio: string;
    periodoFim: string;
    valorAnalisado: number;
    gatilhoAlerta: string;
    regraDisparada: string;
    fatorIncompatibilidade: number;
    identificacaoRemetente: string;
    identificacaoBeneficiarioFinal: string;
    tipoOperacao: string;
    formaRealizacao: string;
  };
  parte4: {
    statusAvaliacao: 'AVALIADO' | 'EM_ANALISE';
    deliberacaoFinal: string;
    deliberacaoTipo: string;
    tipologiaCoaf: string;
    baseLegalEnquadramento: string;
    historicoCliente: string;
    perfilRiscoModalidades: string;
    justificativaEconomicaLegal: string;
    conclusaoTecnica: string;
    checklistVerificacao: Array<{
      item: string;
      status: boolean;
      rotulo: string;
    }>;
    validacaoPublicoAlvo?: {
      categoria: string;
      tituloCategoria: string;
      focoExigencia: string;
      baseRegulatoria: string;
      statusGeral: string;
      itens: Array<{
        codigo: string;
        titulo: string;
        descricao: string;
        status: string;
        evidencia?: string;
        validador?: string;
      }>;
    };
    recomendacoes: {
      arquivarDossie: boolean;
      comunicarCoaf: boolean;
      encaminharGecan: boolean;
      semProvidencias: boolean;
    };
    analistaNome: string;
    analistaCargo: string;
    analistaMatricula: string;
    analistaAreaAtuacao: string;
    dataAnalise: string;
  };
  parte5: {
    despachoGerencial: string;
    gerenteGeralNome: string;
    gerenteGeralCargo: string;
    areaAtuacao: string;
    dataHomologacao: string;
    concordancia: string;
  };
  parte6: {
    deliberacaoDiretoria: string;
    dadosControleSiscoaf: {
      numeroOrigem: string;
      documentoControle: string;
      numeroRecibo: string;
      dataSiscoaf: string;
      protocoloSiscoaf: string;
      situacaoEnvio: string;
    };
  };
  anexo1Movimentacao: Array<{
    id: string;
    data: string;
    valor: number;
    tipo: string;
    transacao: string;
    origem: string;
    origemDetalhe: string;
    saldoApos?: number;
    isSuspeita?: boolean;
  }>;
  anexo2Contrapartes: Array<{
    id: string;
    banco: string;
    agencia: string;
    conta: string;
    cpfCnpj: string;
    nomeContraparte: string;
    valorTotal: number;
    qtdOperacoes: number;
    vinculo: string;
    isSuspeita: boolean;
  }>;
}

export function buildCooperforteDossier(caso: CasoInvestigacao): CooperforteFullDossier {
  const kyc = caso.kyc;
  const transacoes = caso.transacoes || [];

  // Cálculos de saldo da Parte 3
  const totalCredito = transacoes.filter((t) => t.tipo === 'Crédito').reduce((acc, t) => acc + Math.abs(t.valor), 0);
  const totalDebito = transacoes.filter((t) => t.tipo === 'Débito').reduce((acc, t) => acc + Math.abs(t.valor), 0);
  const saldoAnterior = 1450.0;
  const saldoAtual = Math.max(0, saldoAnterior + totalCredito - totalDebito);

  const dates = transacoes.map((t) => t.data).filter(Boolean);
  const periodoInicio = dates.length > 0 ? dates[0] : '01/08/2026';
  const periodoFim = dates.length > 0 ? dates[dates.length - 1] : '20/08/2026';

  // Identificação do Remetente e Beneficiário Final
  const remetente = transacoes.find((t) => t.tipo === 'Crédito')?.origem || caso.nome;
  const benefFinal =
    transacoes.find((t) => t.tipo === 'Débito')?.contraparte ||
    (caso.isPep ? `${caso.nome} (PEP Titular)` : 'Investigado e Contrapartes Vinculadas');

  // Determinação de Servidor Público baseado no perfil/entidade
  const isServidor =
    kyc.isServidorPublico ??
    (kyc.entidadeOrigem?.includes('Banco do Brasil') ||
      kyc.entidadeOrigem?.includes('CAIXA') ||
      kyc.entidadeOrigem?.includes('Ministério') ||
      kyc.entidadeOrigem?.includes('BACEN') ||
      kyc.profissao?.toLowerCase().includes('servidor') ||
      kyc.profissao?.toLowerCase().includes('analista do banco') ||
      kyc.profissao?.toLowerCase().includes('auditor'));

  const esfera =
    kyc.esferaServidorPublico ||
    (kyc.entidadeOrigem?.includes('Municipal')
      ? 'Municipal'
      : kyc.entidadeOrigem?.includes('Estadual')
      ? 'Estadual'
      : 'Federal');

  // Entidade Comunicante
  const entidadeComunicante = {
    razaoSocial: 'COOPERATIVA DE ECONOMIA E CRÉDITO MÚTUO DOS FUNCIONÁRIOS DE INSTITUIÇÕES FINANCEIRAS PÚBLICAS FEDERAIS - COOPERFORTE',
    nomeFantasia: 'COOPERFORTE COOPERATIVA DE CRÉDITO',
    cnpj: '00.825.962/0001-90',
    codigoBacen: '603 / COOP-081',
    orgaoRegulador: 'Banco Central do Brasil (BACEN) e Conselho de Controle de Atividades Financeiras (COAF)',
    diretoriaResponsavel: 'Diretoria Executiva (DIREX)',
    unidadeCompliance: 'Gerência Executiva de Riscos, Conformidade e Segurança Institucional (GECON/GESIN)',
    enderecoSede: 'Setor de Autarquias Sul, Quadra 04, Bloco K, Edifício COOPERFORTE, Brasília - DF, CEP 70070-938',
  };

  // Parte 1: Qualificação do Associado
  const parte1 = {
    nomeFirma: kyc.nomeCompleto || caso.nome,
    idade: kyc.idade || caso.idade || 42,
    cpfCnpj: kyc.cpfCompleto || caso.cpf,
    documentoIdentificacao: kyc.documentoIdentificacao || `RG 2.849.120 SSP/DF (Emissão 14/03/2016)`,
    numeroRegistroComercial:
      kyc.numeroRegistroComercial ||
      (kyc.qsaVinculos?.[0]?.cnpj
        ? `JUCESP/NIRE 35.219.840.119 (${kyc.qsaVinculos[0].razaoSocial})`
        : 'Não Aplicável (Pessoa Física)'),
    inscricaoCooperforte: kyc.inscricaoCooperforte || `CF-${caso.matricula?.replace('MAT-', '') || '081239'}/DF`,
    dataAssociacao: kyc.dataAssociacao || '12/04/2018 (8 anos de vínculo ativo)',
    localResidencia: kyc.localResidencia || `${kyc.endereco || 'SHIS QL 12 Conjunto 04 Casa 08'}, ${kyc.cidadeUf || 'Brasília/DF'} - CEP 71630-045`,
    perfilAssociacao: kyc.perfilAssociacao || 'Associado Cooperado Individual Ativo',
    vinculoAssociacao:
      kyc.vinculoAssociacao ||
      (isServidor ? 'Cooperado Funcional / Folha de Pagamento Estatutária' : 'Cooperado Autônomo com Débito em Conta'),
    entidadeOrigem: kyc.entidadeOrigem || (isServidor ? 'Banco do Brasil S.A. / Ministério da Economia' : 'COOPERFORTE Cooperativa Central'),
    rendaFaturamento: kyc.rendaDeclarada || caso.renda || 14500.0,
    dataVencimentoRenda: kyc.dataVencimentoRenda || '25 de cada mês (Crédito em Folha Siape/BB)',
    naturezaRenda: kyc.naturezaRenda || (isServidor ? 'Salarial / Vencimentos Estatutários' : 'Pró-Labore & Faturamento Comercial'),
    patrimonio: kyc.patrimonioDeclarado || 450000.0,
    empregadorFontePagadora: kyc.empregadorFontePagadora || {
      razaoSocial: kyc.empresaVinculo || (isServidor ? 'BANCO DO BRASIL S.A. / ÓRGÃO PÚBLICO' : 'EMPRESA COMERCIAL BRASIL LTDA'),
      cnpj: kyc.qsaVinculos?.[0]?.cnpj || (isServidor ? '00.000.000/0001-91' : '38.102.944/0001-19'),
    },
    classificacaoPep: {
      isPep: kyc.isPep ?? caso.isPep,
      detalhe: (kyc.isPep ?? caso.isPep)
        ? `SIM - ${kyc.pepCargo || caso.pepCargo || 'Pessoa Exposta Politicamente'} (Art. 19 Resolução COAF nº 40/2021)`
        : 'NÃO - Não enquadrado como PEP titular, parente de 1º/2º grau ou estreito colaborador.',
    },
    classificacaoServidorPublico: {
      isServidor: Boolean(isServidor),
      esfera: isServidor ? esfera : 'Não Aplicável',
    },
    presencaCsnu: {
      isListed: Boolean(kyc.isCsnuListed || caso.isCsnuListed),
      detalhe: (kyc.isCsnuListed || caso.isCsnuListed)
        ? 'SIM - ALERTA CRÍTICO: Consta na Lista de Sanções CSNU / Terrorismo (Lei nº 13.810/2019)'
        : 'NÃO - Consulta negativa na base consolidada do Conselho de Segurança da ONU (CSNU).',
    },
    segmentacaoPerfilNegocial: kyc.segmentacaoPerfilNegocial || 'Segmento Cooperado Alta Renda / Crédito Rotativo Platinum',
    dataAtualizacaoSegmentacao: kyc.dataAtualizacaoSegmentacao || '15/01/2026',
    dataUltimaAlteracaoCadastral: kyc.dataUltimaAlteracaoCadastral || '10/02/2026 (Recadastramento Biométrico Bienal)',
  };

  // Parte 2: Informações Complementares e Bureaus
  const parte2 = {
    pesquisaBureauAmlReputacional: {
      fontes: [
        'Conselho de Segurança das Nações Unidas (CSNU / Lei nº 13.810/19)',
        'OFAC (Office of Foreign Assets Control - EUA)',
        'CEIS / CNEP (Cadastro de Empresas Inidôneas e Suspensas - CGU)',
        'CNDT / TST (Certidão Negativa de Débitos Trabalhistas)',
        'Tribunais de Justiça e Tribunais Regionais Federais (TRF1 a TRF6)',
        'Diários Oficiais da União e dos Estados',
      ],
      midiasNegativas:
        kyc.midiasDesabonadoras && kyc.midiasDesabonadoras.length > 0
          ? kyc.midiasDesabonadoras
          : ['Nenhuma menção desabonadora encontrada em portais jornalísticos ou órgãos de persecução penal.'],
      listasSancoes:
        kyc.isCsnuListed || caso.isCsnuListed
          ? 'Apontamento positivo na lista CSNU de Resoluções 1267/1989 (Sanções Globais).'
          : 'Negativo para todas as listas restritivas internacionais (OFAC, CSNU, UE, INTERPOL).',
      status:
        kyc.isCsnuListed || caso.isCsnuListed
          ? 'Alto Risco / Mídia Desabonadora Grave'
          : kyc.midiasDesabonadoras && kyc.midiasDesabonadoras.length > 0
          ? 'Apontamento Moderado'
          : 'Regular / Sem Apontamentos Impeditivos',
    },
    confirmacaoDetalhadaPep: {
      isPep: kyc.isPep ?? caso.isPep,
      detalhamento: (kyc.isPep ?? caso.isPep)
        ? `Titular classificado como PEP: ${kyc.pepCargo || caso.pepCargo || 'Cargo de Direção e Assessoramento Superior'}. Mandato com vigência ativa e monitoramento reforçado de 5 anos após desincompatibilização.`
        : 'Pessoa física não enquadrada como PEP titular, nem como representante, familiar ou colaborador estreito.',
      orgao: kyc.pepCargo?.includes('Ministério') ? 'Governo Federal / Ministério' : 'Administração Pública Indireta',
      cargo: kyc.pepCargo || 'Não Aplicável',
      vigencia: '2023 - 2027 (Mandato Vigente)',
      baseLegal: 'Art. 19 da Resolução COAF nº 40/2021 e Circular BACEN nº 3.978/2020 (Arts. 25 a 29)',
    },
    indicadorLimoc: {
      isAtivo: true,
      limiteOperacional: 120000.0,
      utilizacaoAtual: caso.valorEnvolvido,
      dataVigencia: '01/01/2026 a 31/12/2026',
      observacao:
        caso.valorEnvolvido > 120000
          ? 'Movimentação acumulada extrapola o limite operacional LIMOC parametrizado para o perfil do associado.'
          : 'Operação dentro do teto operacional LIMOC cadastrado na cooperativa.',
    },
  };

  // Parte 3: Dados das Transações no Mês
  const valorAnalisado = caso.volumeAtipicoPeriodo || caso.valorEnvolvido || 98450.0;
  const rendaRef = kyc.rendaDeclarada || caso.renda || 4200.0;
  const fatorIncompatibilidade = Number((valorAnalisado / (rendaRef || 1)).toFixed(1));

  const parte3 = {
    saldoAnterior,
    totalCredito,
    totalDebito,
    saldoAtual,
    periodoInicio,
    periodoFim,
    valorAnalisado,
    gatilhoAlerta: caso.gatilhoAlerta || 'Volume de créditos expressivo e incompatível com os rendimentos cadastrados',
    regraDisparada: caso.regraDisparada || 'PLD-REG-004 (Incompatibilidade Renda x Movimentação > 500%)',
    fatorIncompatibilidade,
    identificacaoRemetente: remetente,
    identificacaoBeneficiarioFinal: benefFinal,
    tipoOperacao: caso.tipologiaPld?.includes('Amortização')
      ? 'Amortização Antecipada de Empréstimo / Liquidação DCO'
      : caso.tipologiaPld?.includes('Espécie')
      ? 'Depósitos Fracionados em Espécie (COE / Estruturação)'
      : 'Transferência Eletrônica de Recursos (PIX / TED Atípico)',
    formaRealizacao:
      transacoes
        .map((t) => t.metodo)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(', ') || 'PIX / TED Eletrônico',
  };

  // Parte 4: Avaliação do Analista & Deliberação
  const delib = caso.parecer?.deliberacao;
  const isAvaliado = Boolean(delib && delib !== null);
  const statusAvaliacao: 'AVALIADO' | 'EM_ANALISE' = isAvaliado ? 'AVALIADO' : 'EM_ANALISE';

  const tipologiaCoaf =
    caso.parecer?.tipologiaCoaf ||
    (caso.tipologiaPld?.includes('Espécie')
      ? '1.1 - Depósitos fracionados em espécie visando burlar limites de identificação (Estruturação / Smurfing)'
      : caso.isPep
      ? '3.2 - Movimentação financeira atípica envolvendo Pessoa Exposta Politicamente (PEP)'
      : '2.4 - Movimentação financeira incompatível com o patrimônio, a atividade econômica ou a capacidade financeira');

  const deliberacaoFinalTexto =
    delib === 'COMUNICAR_COAF'
      ? 'COMUNICAÇÃO OBRIGATÓRIA AO COAF (Comunicação de Operação Suspeita - COS)'
      : delib === 'BLOQUEIO_CAUTELAR'
      ? 'COMUNICAÇÃO AO COAF COM MEDIDA DE BLOQUEIO CAUTELAR / ENCERRAMENTO DE CONTA'
      : delib === 'ARQUIVAR'
      ? 'ARQUIVAMENTO FUNDAMENTADO DO DOSSIÊ (Falso-Positivo / Atipicidade Justificada)'
      : delib === 'DILIGENCIA'
      ? 'SOLICITAÇÃO DE DILIGÊNCIA REFORÇADA (Exigência Documental Complementar)'
      : 'EM PROCESSO DE ANÁLISE TÉCNICA (Parecer em Elaboração pelo Analista)';

  const justificativaEconomicaLegal =
    caso.parecer?.texto?.trim() ||
    `A movimentação financeira analisada no período de ${periodoInicio} a ${periodoFim} totalizou o montante de R$ ${valorAnalisado.toLocaleString(
      'pt-BR',
      { minimumFractionDigits: 2 }
    )}, representando um fator de incompatibilidade de ${fatorIncompatibilidade}x a renda mensal declarada (R$ ${rendaRef.toLocaleString(
      'pt-BR',
      { minimumFractionDigits: 2 }
    )}). Observou-se a pulverização de recursos e ausência de lastro documental ou justificativa de atividade econômica idônea.`;

  const conclusaoTecnica =
    delib === 'ARQUIVAR'
      ? 'Falso-Positivo (Operação Regular / Lastro Comprovado)'
      : delib === 'COMUNICAR_COAF' || delib === 'BLOQUEIO_CAUTELAR'
      ? 'Indício Fundado de Suspeita de Lavagem de Dinheiro (Art. 11, II da Lei nº 9.613/98)'
      : delib === 'DILIGENCIA'
      ? 'Diligência Preliminar Solicitada (Art. 20 Circular BACEN nº 3.978/20)'
      : 'Análise Preliminar em Andamento (Aguardando Parecer Final)';

  const checklistVerificacao = [
    { item: 'Qualificação Cadastral Completa (KYC/CDD)', status: caso.resumoPldChecklist?.qualificacaoKyc ?? true, rotulo: 'Conforme' },
    { item: 'Compatibilidade Renda x Patrimônio x Volume', status: caso.resumoPldChecklist?.capacidadeFinanceira ?? false, rotulo: 'Incompatível (Alerta)' },
    { item: 'Consulta CSNU / Listas de Sanções Internacionais', status: caso.resumoPldChecklist?.listasRestritivas ?? true, rotulo: 'Verificado' },
    { item: 'Enquadramento e Monitoramento Reforçado PEP', status: caso.resumoPldChecklist?.enquadramentoPep ?? true, rotulo: 'Verificado' },
    { item: 'Mapeamento Societário & Grupo Econômico (QSA)', status: caso.resumoPldChecklist?.vinculosSocietarios ?? true, rotulo: 'Mapeado' },
    { item: 'Rastreabilidade de Origem e Destino dos Recursos', status: caso.resumoPldChecklist?.origemDestinoRecursos ?? false, rotulo: 'Sem Lastro Comprovado' },
    { item: 'Pesquisa Reputacional & Mídias Desabonadoras', status: caso.resumoPldChecklist?.midiasDesabonadoras ?? true, rotulo: 'Concluído' },
  ];

  // Validação Dinâmica do Público Alvo do Dossiê
  const activeCategory = caso.validacaoDossie?.categoria || caso.categoriaDossie || inferDossierCategoryFromCase(caso);
  const activeValidation = buildDossierValidationForCategory(activeCategory, caso.validacaoDossie);

  const parte4 = {
    statusAvaliacao,
    deliberacaoFinal: deliberacaoFinalTexto,
    deliberacaoTipo: delib || 'EM_ANDAMENTO',
    tipologiaCoaf,
    baseLegalEnquadramento: 'Lei Federal nº 9.613/98 (Art. 11, II), Circular BACEN nº 3.978/20 (Arts. 38 a 41) e Carta Circular BACEN nº 4.001/20',
    historicoCliente: `Associado cooperado desde ${kyc.dataAssociacao || '2018'}, classificado com Nível de Risco ${caso.risco} e pontuação de score ${caso.scoreRisco}/100. Situação cadastral regular perante a Receita Federal do Brasil, com renda declarada de R$ ${rendaRef.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês.`,
    perfilRiscoModalidades: `O associado opera primordialmente via ${parte3.formaRealizacao}. No período auditado, registrou-se o disparo do gatilho '${caso.gatilhoAlerta}', totalizando R$ ${valorAnalisado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em movimentações com características de atipicidade.`,
    justificativaEconomicaLegal,
    conclusaoTecnica,
    checklistVerificacao,
    validacaoPublicoAlvo: {
      categoria: activeValidation.categoria,
      tituloCategoria: activeValidation.tituloCategoria,
      focoExigencia: activeValidation.focoExigencia,
      baseRegulatoria: activeValidation.baseRegulatoria,
      statusGeral: activeValidation.statusGeral,
      itens: activeValidation.itens.map((it) => ({
        codigo: it.codigo,
        titulo: it.titulo,
        descricao: it.descricaoExigencia,
        status: it.status,
        evidencia: it.evidenciaDoc,
        validador: it.validador || 'Analista PLD',
      })),
    },
    recomendacoes: {
      arquivarDossie: delib === 'ARQUIVAR',
      comunicarCoaf: delib === 'COMUNICAR_COAF' || delib === 'BLOQUEIO_CAUTELAR',
      encaminharGecan: delib === 'DILIGENCIA' || caso.risco === 'Crítico',
      semProvidencias: !delib,
    },
    analistaNome: caso.analistaNome || 'Maísa Ramos',
    analistaCargo: 'Analista de Compliance & Prevenção à Lavagem de Dinheiro (PLD/FT)',
    analistaMatricula: caso.matricula || 'MAT-74921',
    analistaAreaAtuacao: 'Gerência Executiva de Riscos, Integridade e Conformidade - GECON/PLD',
    dataAnalise: caso.parecer?.finalizadoEm
      ? new Date(caso.parecer.finalizadoEm).toLocaleDateString('pt-BR')
      : caso.parecer?.salvoEm
      ? new Date(caso.parecer.salvoEm).toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR'),
  };

  // Parte 5: Parecer Gestor
  const parte5 = {
    despachoGerencial:
      delib === 'COMUNICAR_COAF' || delib === 'BLOQUEIO_CAUTELAR'
        ? 'De acordo com a análise técnica procedida pelo analista de PLD/FT. Aprovado o encaminhamento tempestivo de Comunicação de Operação Suspeita (COS) ao Conselho de Controle de Atividades Financeiras - COAF, em observância estrita aos prazos do Art. 11 da Lei 9.613/98 e Art. 40 da Circular BACEN 3.978/20.'
        : delib === 'ARQUIVAR'
        ? 'Despacho Gerencial Homologado: Concordância integral com o arquivamento do dossiê investigativo fundamentado na demonstração de lastro documental comprobatório e inexistência de dolo ou tipologia de LD/FT.'
        : 'Despacho Gerencial: Solicitação de diligência adicional ou prosseguimento das verificações documentais pelo corpo técnico.',
    gerenteGeralNome: 'Dr. Roberto Silveira de Albuquerque',
    gerenteGeralCargo: 'Gerente Executivo de Riscos, Segurança Institucional e Conformidade (GECON/GESIN)',
    areaAtuacao: 'GECON / GESIN - Gerência Executiva de Conformidade e Segurança Institucional',
    dataHomologacao: new Date().toLocaleDateString('pt-BR'),
    concordancia:
      delib === 'COMUNICAR_COAF'
        ? 'Aprovação de Envio ao COAF (Comunicação COS/COE)'
        : delib === 'ARQUIVAR'
        ? 'Homologação de Arquivamento Justificado'
        : 'Concordância com as Etapas de Análise Técnica',
  };

  // Parte 6: Deliberação DIREX e SISCOAF
  const docControle = `DOC-RIF-PLD-${caso.alertaId || '2026-8491'}`;
  const protocoloSiscoaf =
    delib === 'COMUNICAR_COAF' || delib === 'BLOQUEIO_CAUTELAR'
      ? `SISCOAF-PROT-${caso.alertaId || '2026-8491'}-BR`
      : delib === 'ARQUIVAR'
      ? 'ISENTO_ARQUIVAMENTO_INTERNO'
      : 'EM_PROCESSAMENTO';

  const numeroRecibo =
    delib === 'COMUNICAR_COAF' || delib === 'BLOQUEIO_CAUTELAR'
      ? `REC-COAF-2026-${Math.floor(100000 + Math.random() * 900000)}`
      : 'DISPENSADO';

  const parte6 = {
    deliberacaoDiretoria:
      delib === 'ARQUIVAR'
        ? 'Deliberação da Diretoria Executiva (DIREX): Homologado arquivamento interno fundamentado, sem necessidade de comunicação SISCOAF, mantendo o dossiê em arquivo digital para fins de auditoria por 10 anos (Art. 67 Circular 3.978/20).'
        : 'Deliberação da Diretoria Executiva (DIREX): Aprovada e homologada a transmissão da comunicação ao COAF, autorizando a emissão do recibo oficial no sistema SISCOAF.',
    dadosControleSiscoaf: {
      numeroOrigem: `COOPF-${caso.matricula?.replace('MAT-', '') || '081239'}`,
      documentoControle: docControle,
      numeroRecibo,
      dataSiscoaf: new Date().toLocaleDateString('pt-BR'),
      protocoloSiscoaf,
      situacaoEnvio:
        delib === 'COMUNICAR_COAF' || delib === 'BLOQUEIO_CAUTELAR'
          ? 'Homologado e Transmitido ao SISCOAF'
          : delib === 'ARQUIVAR'
          ? 'Dispensado de Envio (Dossiê Arquivado)'
          : 'Em Elaboração Regulatória',
    },
  };

  // Anexo 1 - Movimentação Financeira
  const anexo1Movimentacao = transacoes.map((t, idx) => ({
    id: t.id || `anx1-${idx}`,
    data: `${t.data} ${t.hora || ''}`.trim(),
    valor: t.valor,
    tipo: t.tipo,
    transacao: t.transacaoDescricao || (t.metodo ? `${t.metodo} - ${t.origem}` : t.origem),
    origem: t.origem,
    origemDetalhe:
      t.origemDetalhe || (t.isSuspeita ? `Atipicidade: ${t.motivoSuspeita || 'Sem lastro econômico'}` : 'Operação rotineira'),
    saldoApos: t.saldoApos,
    isSuspeita: t.isSuspeita,
  }));

  // Anexo 2 - Detalhamento das Transações com Contrapartes
  const contrapartesMap = new Map<
    string,
    {
      banco: string;
      agencia: string;
      conta: string;
      cpfCnpj: string;
      nomeContraparte: string;
      valorTotal: number;
      qtdOperacoes: number;
      vinculo: string;
      isSuspeita: boolean;
    }
  >();

  transacoes.forEach((t) => {
    const key = t.contraparte || t.origem;
    const existing = contrapartesMap.get(key);
    const val = Math.abs(t.valor);
    if (existing) {
      existing.valorTotal += val;
      existing.qtdOperacoes += 1;
      if (t.isSuspeita) existing.isSuspeita = true;
    } else {
      contrapartesMap.set(key, {
        banco: t.contraparteBanco || '001 - Banco do Brasil / Coop',
        agencia: t.contraparteAgencia || '0480-1',
        conta: t.contraparteConta || '58291-0',
        cpfCnpj:
          t.contraparteCpfCnpj ||
          (t.contraparte?.includes('Santos') ? '38.102.944/0001-19' : '000.***.***-00'),
        nomeContraparte: t.contraparte || t.origem,
        valorTotal: val,
        qtdOperacoes: 1,
        vinculo:
          t.contraparte?.toLowerCase().includes('esposa') || t.contraparte?.toLowerCase().includes('mariana')
            ? 'Familiar (Cônjuge)'
            : t.contraparte?.toLowerCase().includes('distribuidora') || t.contraparte?.toLowerCase().includes('ltda')
            ? 'Pessoa Jurídica Vinculada'
            : t.contraparte?.toLowerCase().includes('atm')
            ? 'Terminal de Autoatendimento (Espécie)'
            : 'Terceiro / Não-Familiar',
        isSuspeita: Boolean(t.isSuspeita),
      });
    }
  });

  const anexo2Contrapartes = Array.from(contrapartesMap.values()).map((c, i) => ({
    id: `anx2-${i}`,
    ...c,
  }));

  // Hash de Autenticidade Digital SHA-256 Mock
  const hashAutenticidade = `SHA256: 7f8a9e4d1c2b5e6f3a0d9b8c7e6a5f4d3c2b1a0e9f8d7c6b5a4f3e2d1c0b9a8f`;

  return {
    documentoControle: docControle,
    protocoloSiscoaf,
    numeroRecibo,
    dataEmissao: new Date().toLocaleDateString('pt-BR'),
    hashAutenticidade,
    statusAvaliacao,
    entidadeComunicante,
    parte1,
    parte2,
    parte3,
    parte4,
    parte5,
    parte6,
    anexo1Movimentacao,
    anexo2Contrapartes,
  };
}
