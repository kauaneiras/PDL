import { CategoriaPublicoDossie, ValidacaoCategoriaDossie, ItemValidacaoDossie, CasoInvestigacao } from '../types';

export interface CategoriaDossieDefinition {
  categoria: CategoriaPublicoDossie;
  titulo: string;
  subtitulo: string;
  icone: string;
  focoExigencias: string;
  baseRegulatoria: string;
  itensPadrao: Omit<ItemValidacaoDossie, 'id' | 'dataValidacao' | 'validador'>[];
}

export const CATEGORIAS_DOSSIE_DEFINITIONS: Record<CategoriaPublicoDossie, CategoriaDossieDefinition> = {
  PEP: {
    categoria: 'PEP',
    titulo: 'Pessoa Exposta Politicamente (PEP) & Familiares',
    subtitulo: 'Diligência Reforçada Obrigatória (EDD)',
    icone: 'UserCheck',
    focoExigencias: 'Comprovação exaustiva da origem da riqueza (Declaração de IR, holerites do cargo público), pesquisa profunda em mídia negativa (corrupção) e aprovação obrigatória da Alta Administração para abertura ou manutenção da conta.',
    baseRegulatoria: 'Art. 25 a 29 da Circular BACEN nº 3.978/2020 e Resolução COAF nº 40/2021',
    itensPadrao: [
      {
        codigo: 'PEP-01',
        titulo: 'Comprovação Exaustiva da Origem da Riqueza (IRPF / Holerite Público)',
        descricaoExigencia: 'Declaração completa de IRPF com recibo de entrega e comprovantes de subsídio / vencimento do cargo público ocupado.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'IRPF_Exercicio_Vigente.pdf / Contracheque_Orgao_Publico.pdf'
      },
      {
        codigo: 'PEP-02',
        titulo: 'Pesquisa Profunda em Mídia Negativa & Tribunais (Reputacional / Corrupção)',
        descricaoExigencia: 'Varredura exaustiva em portais de transparência, Diários Oficiais, CNJ, TCU/TCE e notícias de envolvimento em desvio de verbas públicas.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Relatorio_Bureau_Reputacional_Midia_Negativa.pdf'
      },
      {
        codigo: 'PEP-03',
        titulo: 'Aprovação Prévia e Obrigatória da Alta Administração / Comitê Diretoria',
        descricaoExigencia: 'Parecer formal e assinatura de membro da Diretoria Executiva ou Comitê de Risco autorizando o estabelecimento ou continuidade do relacionamento.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Ata_Comite_Risco_Aprovacao_Alta_Administracao.pdf'
      },
      {
        codigo: 'PEP-04',
        titulo: 'Identificação e Mapeamento de Familiares até 2º Grau e Estreitos Colaboradores',
        descricaoExigencia: 'Mapeamento societário e financeiro de cônjuge, companheiro, ascendentes, descendentes e pessoas jurídicas coligadas.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Declaracao_Relacionamento_PEP_Vinculados.pdf'
      }
    ]
  },

  REGIAO_MINERACAO_FRONTEIRA: {
    categoria: 'REGIAO_MINERACAO_FRONTEIRA',
    titulo: 'Região de Mineração / Faixa de Fronteira',
    subtitulo: 'Vigilância Geográfica Especial e Fiscalização Socioambiental',
    icone: 'ShieldAlert',
    focoExigencias: 'Validação rigorosa de endereço físico, checagem de atividade econômica real, pesquisa sobre licenças ambientais/fiscais (para combater garimpo ilegal) e análise de uso intensivo de dinheiro em espécie.',
    baseRegulatoria: 'Circular BACEN 3.978/2020 (Avaliação de Risco Geográfico) e Orientações COAF/Polícia Federal',
    itensPadrao: [
      {
        codigo: 'GEO-01',
        titulo: 'Validação Rigorosa de Endereço Físico e Instalações Operacionais',
        descricaoExigencia: 'Comprovante de endereço em nome próprio recente (< 90 dias) e laudo de vistoria/geolocalização comprovando a existência de instalações físicas reais.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Laudo_Vistoria_Local_Comprovante_Residencia.pdf'
      },
      {
        codigo: 'GEO-02',
        titulo: 'Checagem de Atividade Econômica Real e Regularidade Cadastral',
        descricaoExigencia: 'Verificação da efetiva prestação de serviços ou comercialização de bens, compatibilidade da frota/maquinário e alvará municipal.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Alvara_Funcionamento_Contrato_Social_Ativo.pdf'
      },
      {
        codigo: 'GEO-03',
        titulo: 'Pesquisa e Certificação de Licenças Ambientais / Fiscais (Combate ao Garimpo Ilegal)',
        descricaoExigencia: 'Certidão Negativa de Débitos Ambientais (IBAMA/Órgão Estadual), licenças de extração mineral (ANM) e notas fiscais eletrônicas com DTVM autorizada.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Licenca_Operacao_IBAMA_Certidao_ANM.pdf'
      },
      {
        codigo: 'GEO-04',
        titulo: 'Análise e Justificativa do Uso Intensivo de Dinheiro em Espécie',
        descricaoExigencia: 'Demonstração detalhada e documentada do ciclo operacional que motive a circulação ou saque/depósito de moeda física na praça fronteiriça.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Relatorio_Justificativa_Operacional_Especie.pdf'
      }
    ]
  },

  RECURSOS_TERCEIROS_PROCURACAO: {
    categoria: 'RECURSOS_TERCEIROS_PROCURACAO',
    titulo: 'Recursos de Terceiros / Instrumento Legal (Procuração)',
    subtitulo: 'Identificação Estrita de Beneficiário Final (UBO)',
    icone: 'FileSignature',
    focoExigencias: 'Cópia validada de procurações ou contratos, identificação e qualificação completa do Beneficiário Final (quem é o verdadeiro dono do dinheiro) e justificativa comercial lógica para a representação.',
    baseRegulatoria: 'Instrução Normativa RFB nº 2.119/2022 e Carta-Circular BACEN nº 4.001/2020',
    itensPadrao: [
      {
        codigo: 'TERC-01',
        titulo: 'Cópia Validada de Procuração Pública ou Contrato de Mandato',
        descricaoExigencia: 'Procuração por instrumento público com poderes expressos, validade vigente e certidão de não-revogação emitida pelo cartório competente.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Procuracao_Publica_Certidao_Cartorio.pdf'
      },
      {
        codigo: 'TERC-02',
        titulo: 'Identificação e Qualificação Completa do Beneficiário Final (UBO)',
        descricaoExigencia: 'Documento oficial com foto, CPF, endereço e declaração formal identificando a pessoa natural que em última instância detém o controle dos recursos.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Declaracao_Beneficiario_Final_UBO_Identificado.pdf'
      },
      {
        codigo: 'TERC-03',
        titulo: 'Justificativa Comercial / Jurídica Lógica da Representação',
        descricaoExigencia: 'Comprovação da motivação negocial para atuação por interposta pessoa (ex.: contrato de prestação de serviços, tutela, inventário ou administração fiduciária).',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Justificativa_Comercial_Representacao_Legal.pdf'
      }
    ]
  },

  MENOR: {
    categoria: 'MENOR',
    titulo: 'Menor de Idade / Adolescente (Tutela e Dependência)',
    subtitulo: 'Compatibilidade Patrimonial Familiar',
    icone: 'Baby',
    focoExigencias: 'Identificação dos tutores legais e comprovação de que a movimentação na conta da criança/adolescente é suportada e compatível com o patrimônio dos pais ou responsáveis.',
    baseRegulatoria: 'Código Civil Brasileiro e Circular BACEN 3.978/2020 (Art. 13 - Qualificação de Representantes)',
    itensPadrao: [
      {
        codigo: 'MENOR-01',
        titulo: 'Identificação Oficial dos Pais, Tutores ou Representantes Legais',
        descricaoExigencia: 'Certidão de nascimento ou RG do menor e documentos oficiais de identificação (RG/CPF) de ambos os pais ou termo de guarda judicial definitiva.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Certidao_Nascimento_Documentos_Pais_Tutores.pdf'
      },
      {
        codigo: 'MENOR-02',
        titulo: 'Comprovação de Suporte Patrimonial e Renda dos Pais / Responsáveis',
        descricaoExigencia: 'Holerite ou IRPF dos responsáveis legais demonstrando capacidade financeira suficiente para subsidiar os aportes e saldos na conta do dependente.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Comprovante_Renda_IRPF_Responsaveis_Legais.pdf'
      },
      {
        codigo: 'MENOR-03',
        titulo: 'Compatibilidade de Finalidade da Conta com a Faixa Etária',
        descricaoExigencia: 'Verificação de ausência de transações comerciais atípicas, empréstimos fraudulentos ou utilização da conta do menor como conta de passagem (laranja).',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Declaracao_Finalidade_Poupanca_Mesada_Estudos.pdf'
      }
    ]
  },

  FUNCIONARIO_COOPERFORTE: {
    categoria: 'FUNCIONARIO_COOPERFORTE',
    titulo: 'Funcionário / Colaborador da Cooperativa',
    subtitulo: 'Mitigação de Fraude Interna e Conflito de Interesses',
    icone: 'Briefcase',
    focoExigencias: 'Declarações de conflito de interesse e análises cruzando o salário pago pela própria cooperativa com a movimentação bancária externa (buscando discrepâncias que indiquem fraude interna ou propina).',
    baseRegulatoria: 'Código de Conduta e Ética Institucional e Circular BACEN nº 3.978/2020 (Monitoramento de Pessoas Internas)',
    itensPadrao: [
      {
        codigo: 'FUNC-01',
        titulo: 'Declaração Anual de Inexistência de Conflito de Interesses',
        descricaoExigencia: 'Termo formal assinado atestando a ausência de vínculos societários, consultorias paralelas ou recebimento de vantagens indevidas de fornecedores da cooperativa.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Termo_Conflito_Interesses_Assinado.pdf'
      },
      {
        codigo: 'FUNC-02',
        titulo: 'Cruzamento da Folha Salarial com Movimentação Global de Contas',
        descricaoExigencia: 'Confronto entre os proventos pagos pela cooperativa e as movimentações atípicas em contas pessoais/conjuntas para identificação de enriquecimento sem causa.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Relatorio_Auditoria_Interna_Cruzamento_Folha.pdf'
      },
      {
        codigo: 'FUNC-03',
        titulo: 'Análise de Relacionamento Financeiro com Fornecedores / Terceirizados',
        descricaoExigencia: 'Checagem de transferências entre o colaborador e empresas prestadoras de serviço à cooperativa ou associados sob sua gestão de crédito.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Matriz_Checagem_Fornecedores_Conformidade.pdf'
      }
    ]
  },

  LIMOC: {
    categoria: 'LIMOC',
    titulo: 'Associado sob Monitoramento Condicionado (LIMOC)',
    subtitulo: 'Dossiê Histórico e Controle de Limites Reduzidos',
    icone: 'ClockAlert',
    focoExigencias: 'Dossiê focado no histórico: registros de alertas anteriores, atas de comitê que aprovaram o monitoramento condicionado/limites reduzidos e os relatórios de revisão periódica desse cliente.',
    baseRegulatoria: 'Política Institucional de PLD/FT e Critérios de Apetite de Risco de Crédito',
    itensPadrao: [
      {
        codigo: 'LIMOC-01',
        titulo: 'Histórico Consolidado de Alertas Anteriores e Reincidências',
        descricaoExigencia: 'Relatório cronológico de todos os alertas PLD gerados nos últimos 24 meses com as respectivas conclusões técnicas e pareceres emitidos.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Historico_Alertas_Reincidencia_24Meses.pdf'
      },
      {
        codigo: 'LIMOC-02',
        titulo: 'Ata de Comitê Formalizando Monitoramento Condicionado / Limites Reduzidos',
        descricaoExigencia: 'Decisão colegiada que estipulou o teto operacional restrito (LIMOC) e as condições especiais para manutenção do cooperado.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Ata_Comite_Credito_PLD_Fixacao_LIMOC.pdf'
      },
      {
        codigo: 'LIMOC-03',
        titulo: 'Relatório Periódico de Revisão de Risco e Comportamento',
        descricaoExigencia: 'Parecer semestral obrigatório avaliando se o comportamento do cooperado manteve-se dentro dos parâmetros condicionados.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Relatorio_Revisao_Semestral_Risco_LIMOC.pdf'
      }
    ]
  },

  DEMAIS_RECURSO_PROPRIO: {
    categoria: 'DEMAIS_RECURSO_PROPRIO',
    titulo: 'Demais Clientes / Recurso Próprio (KYC Padrão)',
    subtitulo: 'Diligência Padrão de Identificação (CDD)',
    icone: 'User',
    focoExigencias: 'Documentação padrão (Know Your Customer básico): documento de identidade, comprovante de residência, autodeclaração de renda e checagem simples em listas restritivas.',
    baseRegulatoria: 'Circular BACEN nº 3.978/2020 (Art. 10 a 14 - Procedimentos de Identificação e Qualificação)',
    itensPadrao: [
      {
        codigo: 'KYC-01',
        titulo: 'Documento Oficial de Identidade com Foto e CPF Válido',
        descricaoExigencia: 'RG, CNH ou Passaporte legível e com foto nítida emitido por órgão público oficial.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'RG_CNH_Identificacao_Oficial.pdf'
      },
      {
        codigo: 'KYC-02',
        titulo: 'Comprovante de Residência Atualizado',
        descricaoExigencia: 'Conta de água, luz, gás ou telefone em nome do titular com emissão inferior a 90 dias.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Comprovante_Endereco_Recente.pdf'
      },
      {
        codigo: 'KYC-03',
        titulo: 'Autodeclaração de Renda / Comprovante de Ocupação',
        descricaoExigencia: 'Declaração formal de renda ou comprovante profissional correspondente ao padrão cadastral informado.',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Declaracao_Renda_Recurso_Proprio.pdf'
      },
      {
        codigo: 'KYC-04',
        titulo: 'Checagem Simples em Listas Restritivas e Sanções',
        descricaoExigencia: 'Consulta em bases públicas (CEIS, CNEP, OFAC, CSNU e bureaus de restrição cadastral).',
        obrigatorio: true,
        status: 'PENDENTE',
        evidenciaDoc: 'Certidao_Consulta_Listas_Restritivas.pdf'
      }
    ]
  }
};

/**
 * Determina automaticamente a categoria inicial do dossiê com base nas características do caso
 */
export function inferDossierCategoryFromCase(caso: CasoInvestigacao): CategoriaPublicoDossie {
  if (caso.categoriaDossie) {
    return caso.categoriaDossie;
  }

  // 1. PEP
  if (caso.isPep || caso.kyc.isPep || caso.tipologiaPld?.includes('PEP') || caso.regraDisparada?.includes('PEP')) {
    return 'PEP';
  }

  // 2. Região Mineração / Fronteira
  if (
    caso.regiaoRisco === 'Fronteira' ||
    caso.regiaoRisco === 'Mineração' ||
    caso.kyc.regiaoRisco === 'Fronteira' ||
    caso.kyc.regiaoRisco === 'Mineração' ||
    caso.kyc?.cidadeUf?.includes('Cáceres') ||
    caso.kyc?.cidadeUf?.includes('Peixoto') ||
    caso.kyc?.cidadeUf?.includes('Foz do Iguaçu')
  ) {
    return 'REGIAO_MINERACAO_FRONTEIRA';
  }

  // 3. Menor de Idade
  if (caso.idade < 18 || caso.kyc.idade < 18) {
    return 'MENOR';
  }

  // 4. Funcionário Cooperforte
  if (
    caso.kyc.vinculoAssociacao?.toLowerCase().includes('funcionário') ||
    caso.kyc.profissao?.toLowerCase().includes('colaborador') ||
    caso.kyc.empresaVinculo?.toLowerCase().includes('cooperforte')
  ) {
    return 'FUNCIONARIO_COOPERFORTE';
  }

  // 5. LIMOC
  if (caso.informacoesComplementares?.indicadorLimoc?.ativo) {
    return 'LIMOC';
  }

  // 6. Terceiros / Procuração
  if (
    caso.tipologiaPld?.toLowerCase().includes('terceiro') ||
    caso.gatilhoAlerta?.toLowerCase().includes('procuração') ||
    caso.alerta?.toLowerCase().includes('terceiros')
  ) {
    return 'RECURSOS_TERCEIROS_PROCURACAO';
  }

  // Padrão: Demais / Recurso Próprio
  return 'DEMAIS_RECURSO_PROPRIO';
}

/**
 * Cria ou recupera o estado de validação de dossiê para a categoria
 */
export function buildDossierValidationForCategory(
  categoria: CategoriaPublicoDossie,
  existingValidation?: ValidacaoCategoriaDossie
): ValidacaoCategoriaDossie {
  const def = CATEGORIAS_DOSSIE_DEFINITIONS[categoria] || CATEGORIAS_DOSSIE_DEFINITIONS.DEMAIS_RECURSO_PROPRIO;

  if (existingValidation && existingValidation.categoria === categoria) {
    return existingValidation;
  }

  const itens: ItemValidacaoDossie[] = def.itensPadrao.map((item, idx) => ({
    ...item,
    id: `val-${categoria.toLowerCase()}-${idx + 1}`,
    baseLegal: item.baseLegal || def.baseRegulatoria,
    origemValidacao: idx === 0 ? 'AUTOMATICA' : 'MANUAL', // RF-42
    dataValidacao: new Date().toLocaleDateString('pt-BR'),
    validador: idx === 0 ? 'Validação Automática (Motor T-SQL)' : 'Analista Responsável'
  }));

  return {
    categoria,
    tituloCategoria: def.titulo,
    focoExigencia: def.focoExigencias,
    baseRegulatoria: def.baseRegulatoria,
    statusGeral: 'PENDENTE_DOCUMENTACAO',
    itens
  };
}

/**
 * Avalia o status geral da validação com base nos itens obrigatórios
 */
export function calculateDossierStatus(itens: ItemValidacaoDossie[]): 'APROVADO' | 'PENDENTE_DOCUMENTACAO' | 'REPROVADO_IMPEDITIVO' {
  const hasNaoConforme = itens.some((i) => i.obrigatorio && i.status === 'NAO_CONFORME');
  if (hasNaoConforme) return 'REPROVADO_IMPEDITIVO';

  const hasPendente = itens.some((i) => i.obrigatorio && i.status === 'PENDENTE');
  if (hasPendente) return 'PENDENTE_DOCUMENTACAO';

  return 'APROVADO';
}
