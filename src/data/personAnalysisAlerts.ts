import { CasoInvestigacao } from '../types';

export interface PersonAnalysisAlert {
  id: string;
  filtroAlerta: string;
  categoria: 
    | 'Cadastral / Restritivo'
    | 'Cadastral / Risco'
    | 'Geográfico'
    | 'Monitoramento Contínuo'
    | 'Risco Interno'
    | 'Comportamental'
    | 'Transacional'
    | 'Contraparte';
  status: 'ATUAL' | 'NOVO';
  statusLabel: '✅ Atual' | '⚠️ Novo';
  acaoPratica: string;
  focoAcao: string;
  descricaoCompleta: string;
  checklistPassos: string[];
  snippetTexto: string;
  badgeCor: string;
  matchFn: (caso: CasoInvestigacao) => boolean;
}

export const PERSON_ANALYSIS_ALERTS: PersonAnalysisAlert[] = [
  {
    id: 'CSNU',
    filtroAlerta: 'CSNU',
    categoria: 'Cadastral / Restritivo',
    status: 'ATUAL',
    statusLabel: '✅ Atual',
    focoAcao: 'Bloqueio imediato',
    acaoPratica: 'Bloqueio imediato. Não há análise subjetiva. Os ativos devem ser congelados e a comunicação feita ao COAF/MJSP em até 24 horas.',
    descricaoCompleta: 'Sanções impostas pelo Conselho de Segurança das Nações Unidas (Lei nº 13.810/2019 e Resolução COAF nº 40/2021). Não admite discricionariedade do analista.',
    checklistPassos: [
      'Confirmar correspondência inequívoca de CPF/Nome na lista CSNU/Consolidação ONU',
      'Executar congelamento cautelar imediato de todos os ativos e contas vinculadas',
      'Elaborar e transmitir comunicação formal de indisponibilidade ao COAF e MJSP em até 24h',
      'Registrar bloqueio e impedir qualquer autorização de débito ou transferência'
    ],
    snippetTexto: 'VERIFICAÇÃO CSNU (LEI 13.810/2019): Identificada correspondência em listas restritivas do Conselho de Segurança da ONU. Em cumprimento estrito ao dever legal e sem juízo de discricionariedade, procedeu-se ao bloqueio cautelar imediato de todos os ativos financeiros e à comunicação formal tempestiva ao COAF e ao Ministério da Justiça e Segurança Pública (MJSP) no prazo de 24 horas.',
    badgeCor: 'bg-red-700 text-white',
    matchFn: (caso) =>
      caso.isCsnuListed === true ||
      caso.alerta.toLowerCase().includes('csnu') ||
      caso.tipologiaPld.toLowerCase().includes('csnu') ||
      caso.regraDisparada.toLowerCase().includes('csnu') ||
      caso.kyc.isCsnuListed === true
  },
  {
    id: 'PEP',
    filtroAlerta: 'PEP (Pessoa Exposta Politicamente)',
    categoria: 'Cadastral / Risco',
    status: 'ATUAL',
    statusLabel: '✅ Atual',
    focoAcao: 'Rastreio de propina',
    acaoPratica: 'Rastreio de propina. O analista deve cruzar a movimentação com o salário líquido no Portal da Transparência. Se a conta for de familiares, verificar se está sendo usada como "testa de ferro" para ocultar bens do agente público.',
    descricaoCompleta: 'Análise de operações de Pessoas Expostas Politicamente, familiares até 2º grau e colaboradores estreitos (Resolução COAF nº 40/2021).',
    checklistPassos: [
      'Consultar cargo público e remuneração líquida no Portal da Transparência do ente governamental',
      'Verificar se o volume financeiro movimentado é compatível com a remuneração de agente público',
      'Para familiares de PEP, auditar se a conta opera como "testa de ferro" ou custodiante de bens ocultos',
      'Examinar se as contrapartes de créditos têm contratos ou fornecimento com o órgão do agente público'
    ],
    snippetTexto: 'DILIGÊNCIA PEP & PORTAL DA TRANSPARÊNCIA: Realizado cruzamento cadastral no Portal da Transparência, verificando o cargo e proventos líquidos do agente público. Identificou-se movimentação atípica sem lastro remuneratório ou operacional, com indícios de triangulação patrimonial visando ocultar recursos de titularidade do agente público.',
    badgeCor: 'bg-purple-700 text-white',
    matchFn: (caso) =>
      caso.isPep === true ||
      caso.kyc.isPep === true ||
      caso.tipologiaPld.toLowerCase().includes('pep') ||
      caso.alerta.toLowerCase().includes('pep') ||
      caso.regraDisparada.toLowerCase().includes('pep')
  },
  {
    id: 'MENOR',
    filtroAlerta: 'Menor e Representante Legal',
    categoria: 'Cadastral / Risco',
    status: 'ATUAL',
    statusLabel: '✅ Atual',
    focoAcao: 'Ocultação patrimonial',
    acaoPratica: 'Ocultação patrimonial. Investigar se a conta do menor está recebendo altos volumes financeiros vindos dos pais (servidores) para despistar a fiscalização da Receita ou do Banco Central.',
    descricaoCompleta: 'Monitoramento de contas de titulares menores de idade operadas por procuradores ou representantes legais, visando blindagem patrimonial.',
    checklistPassos: [
      'Verificar a idade do cooperado e identificar quem detém o poder de movimentação da conta',
      'Checar se os créditos volumosos são originados de contas dos pais ou representantes legais',
      'Analisar a ocupação dos pais (servidores públicos ou empresários) e eventual existência de penhoras ou processos fiscais',
      'Validar se a conta do menor opera como intermediadora de pagamentos de despesas dos adultos'
    ],
    snippetTexto: 'AVALIAÇÃO DE CONTA DE MENOR / REPRESENTANTE LEGAL: Constatou-se que a conta corrente do titular menor de idade recebe aportes substanciais com origem direta em contas dos genitores/representantes legais, sem correspondência com finalidade de poupança infantojuvenil, caracterizando indício de blindagem patrimonial e ocultação de recursos perante os órgãos de controle fiscal.',
    badgeCor: 'bg-indigo-600 text-white',
    matchFn: (caso) =>
      caso.idade < 18 ||
      caso.kyc.idade < 18 ||
      caso.alerta.toLowerCase().includes('menor') ||
      caso.tipologiaPld.toLowerCase().includes('menor') ||
      caso.categoriaDossie === 'MENOR'
  },
  {
    id: 'GEO',
    filtroAlerta: 'Cidade de Fronteira e Mineração',
    categoria: 'Geográfico',
    status: 'ATUAL',
    statusLabel: '✅ Atual',
    focoAcao: 'Justificativa de domicílio',
    acaoPratica: 'Justificativa de domicílio. Exigir comprovante de residência e verificar se o cargo público do associado tem relação com a região. Risco de contrabando ou garimpo ilegal.',
    descricaoCompleta: 'Operações em faixas de fronteira internacional (Lei nº 6.634/1979) e polos de extração mineral/ouro (risco de garimpo ilegal e evasão).',
    checklistPassos: [
      'Exigir comprovante de residência recente em nome do próprio titular',
      'Confrontar a lotação funcional do servidor público com o município da faixa de fronteira ou garimpo',
      'Checar se o associado tem histórico de atuação ou empresas no setor mineral/madeireiro',
      'Verificar se as movimentações envolvem postos de combustível, transportadoras ou comércio de fronteira'
    ],
    snippetTexto: 'FATOR GEOGRÁFICO (FRONTEIRA / MINERAÇÃO): O associado realizou movimentações financeiras em agência localizada em faixa de fronteira internacional ou polo de extração mineral, sem justificativa plausível de domicílio ou vínculo de lotação de seu cargo público, restando presentes indícios de conexão com atividades de comércio irregular, evasão ou garimpo ilegal.',
    badgeCor: 'bg-emerald-700 text-white',
    matchFn: (caso) =>
      caso.regiaoRisco === 'Fronteira' ||
      caso.regiaoRisco === 'Mineração' ||
      caso.alerta.toLowerCase().includes('fronteira') ||
      caso.alerta.toLowerCase().includes('mineração') ||
      caso.alerta.toLowerCase().includes('garimpo') ||
      caso.tipologiaPld.toLowerCase().includes('fronteira') ||
      caso.tipologiaPld.toLowerCase().includes('mineração') ||
      caso.categoriaDossie === 'REGIAO_MINERACAO_FRONTEIRA'
  },
  {
    id: 'LIMOC',
    filtroAlerta: 'LIMOC',
    categoria: 'Monitoramento Contínuo',
    status: 'ATUAL',
    statusLabel: '✅ Atual',
    focoAcao: 'Dossiê aprofundado',
    acaoPratica: 'Dossiê aprofundado. O associado já possui histórico de atipicidade. O analista deve revisar todo o extrato mensal procurando repetição de comportamentos reportados anteriormente.',
    descricaoCompleta: 'Limite Operacional Condicionado (LIMOC): atribuído a cooperados sob monitoramento intensivo após prévias comunicações ou apontamentos.',
    checklistPassos: [
      'Acessar o histórico de comunicações prévias ao COAF e deliberações anteriores da GECAN',
      'Auditar o extrato integral dos últimos 90 a 180 dias procurando reincidência das condutas sinalizadas',
      'Avaliar se houve extrapolação do limite teto operacional estipulado pelo comitê de risco',
      'Propor providências adicionais de compliance, revisão do limite de crédito ou cancelamento de conta'
    ],
    snippetTexto: 'MONITORAMENTO CONTÍNUO LIMOC: Associado sob regime de monitoramento condicionado após apontamentos anteriores. A reanálise do extrato revelou a reincidência do padrão atípico previamente comunicado, com volume superior ao limite operacional admitido, recomendando-se nova comunicação e reavaliação do relacionamento pela GECAN.',
    badgeCor: 'bg-amber-600 text-white',
    matchFn: (caso) =>
      caso.informacoesComplementares?.indicadorLimoc?.ativo === true ||
      caso.alerta.toLowerCase().includes('limoc') ||
      caso.tipologiaPld.toLowerCase().includes('limoc') ||
      caso.categoriaDossie === 'LIMOC' ||
      caso.snapshotCadastral?.limocAtivo === true
  },
  {
    id: 'FUNCI_COOPER',
    filtroAlerta: 'Funci Cooper',
    categoria: 'Risco Interno',
    status: 'ATUAL',
    statusLabel: '✅ Atual',
    focoAcao: 'Auditoria de fraude',
    acaoPratica: 'Auditoria de fraude. Validar se os altos valores são originados da própria cooperativa (salário, PLR, rescisão) para descartar conluio ou desvios internos.',
    descricaoCompleta: 'Prevenção e combate a fraudes e corrupção interna envolvendo colaboradores, dirigentes ou funcionários da própria cooperativa.',
    checklistPassos: [
      'Checar folha de pagamento corporativa para confirmar se o crédito decorre de salário, PLR ou rescisão',
      'Verificar se o colaborador movimentou valores de cooperados aos quais prestou atendimento direto',
      'Consultar alçadas de concessão de crédito do funcionário e eventual favorecimento de parentes',
      'Reportar imediatamente à Auditoria Interna caso não haja lastro comprovado nos demonstrativos de RH'
    ],
    snippetTexto: 'AUDITORIA DE RISCO INTERNO (COLABORADOR COOPERATIVA): Realizada conferência dos créditos na conta do empregado da cooperativa frente às rubricas de folha (salário, PLR, verbas rescisórias). Constatou-se ingresso de recursos estranhos à relação de emprego institucional, exigindo apuração de eventual conluio ou infração ao código de ética corporativo.',
    badgeCor: 'bg-cyan-700 text-white',
    matchFn: (caso) =>
      caso.categoriaDossie === 'FUNCIONARIO_COOPERFORTE' ||
      caso.kyc.vinculoAssociacao?.toLowerCase().includes('funcionário') ||
      caso.alerta.toLowerCase().includes('funci cooper') ||
      caso.alerta.toLowerCase().includes('colaborador') ||
      caso.alerta.toLowerCase().includes('funcionário cooperforte') ||
      caso.tipologiaPld.toLowerCase().includes('funci cooper') ||
      caso.tipologiaPld.toLowerCase().includes('colaborador')
  },
  {
    id: 'CAPACIDADE',
    filtroAlerta: 'Capacidade Econômico-Financeira',
    categoria: 'Comportamental',
    status: 'ATUAL',
    statusLabel: '✅ Atual',
    focoAcao: 'Lastro financeiro',
    acaoPratica: 'Lastro financeiro. O analista exige a Declaração de Imposto de Renda (IRPF) atualizada. Se o volume movimentado (créditos) for desproporcional à renda e aos bens comprovados, deve-se solicitar a origem dos fundos (venda de imóvel, herança).',
    descricaoCompleta: 'Movimentação desproporcional à renda declarada e patrimônio cadastrado (incompatibilidade material de capacidade financeira).',
    checklistPassos: [
      'Exigir Declaração de Imposto de Renda da Pessoa Física (IRPF) do último exercício com recibo de entrega',
      'Calcular o fator de incompatibilidade entre os créditos recebidos e a capacidade mensal comprovada',
      'Solicitar comprovação documental da origem declarada (escritura de compra/venda de imóvel, inventário/herança)',
      'Verificar se a renda cadastral está defasada e necessita de rebaixamento de alçada de limite'
    ],
    snippetTexto: 'LASTRO E CAPACIDADE ECONÔMICO-FINANCEIRA: O volume financeiro creditado no período analisado supera em múltiplas vezes a renda mensal comprovada em IRPF e holerites. Não foram apresentados documentos comprobatórios de eventos extraordinários (venda de imóveis, partilha ou doação), restando caracterizada a ausência de fundamento econômico e incompatibilidade patrimonial.',
    badgeCor: 'bg-zinc-800 text-white',
    matchFn: (caso) =>
      caso.capacidadeFinanceira?.fatorIncompatibilidade > 3 ||
      caso.volumeAtipicoPeriodo > caso.renda * 3 ||
      caso.alerta.toLowerCase().includes('capacidade') ||
      caso.alerta.toLowerCase().includes('incompatibilidade') ||
      caso.alerta.toLowerCase().includes('renda') ||
      caso.tipologiaPld.toLowerCase().includes('incompatibilidade')
  },
  {
    id: 'TERCEIROS',
    filtroAlerta: 'Recursos de Terceiros',
    categoria: 'Transacional',
    status: 'ATUAL',
    statusLabel: '✅ Atual',
    focoAcao: 'Identificação de laranjas',
    acaoPratica: 'Identificação de laranjas. O analista busca no extrato o CPF/CNPJ de quem pagou os empréstimos ou fez os aportes. Exige-se contrato de gaveta, nota fiscal ou certidão que comprove o vínculo real entre o remetente e o associado.',
    descricaoCompleta: 'Utilização de recursos de pessoas estranhas à relação cooperativa para pagamentos, aportes ou liquidações em favor do associado.',
    checklistPassos: [
      'Mapear no extrato detalhado os CPFs e CNPJs remetentes dos créditos expressivos',
      'Exigir contrato de compra e venda, certidões ou notas fiscais comprovando a relação de negócio',
      'Verificar se o terceiro remetente é pessoa sem vínculo empregatício, societário ou familiar direto',
      'Auditar se o associado está cedendo sua conta para circulação de recursos de terceiros não autorizados'
    ],
    snippetTexto: 'RECURSOS DE TERCEIROS E INTERPOSTAS PESSOAS: Identificado aporte financeiro proveniente de terceiros sem relação negocial ou societária documentada com o associado. Solicitados esclarecimentos e contratos pertinentes, não restou comprovado o lastro fático dos recursos, persistindo indícios de interposição fraudulenta de pessoas (laranjas).',
    badgeCor: 'bg-teal-700 text-white',
    matchFn: (caso) =>
      caso.alerta.toLowerCase().includes('terceiro') ||
      caso.alerta.toLowerCase().includes('terceiros') ||
      caso.tipologiaPld.toLowerCase().includes('terceiro') ||
      caso.categoriaDossie === 'RECURSOS_TERCEIROS_PROCURACAO'
  },
  {
    id: 'AMORTIZACAO',
    filtroAlerta: 'Amortização Antecipada',
    categoria: 'Transacional',
    status: 'ATUAL',
    statusLabel: '✅ Atual',
    focoAcao: 'Lavagem de crédito',
    acaoPratica: 'Lavagem de crédito. Verificar com qual dinheiro o empréstimo foi quitado logo após a contratação. Se a origem for externa e não comprovada, indica uso de dinheiro ilícito para integrar um bem (imóvel/carro) na economia formal.',
    descricaoCompleta: 'Contratação de empréstimo/financiamento seguida de liquidação antecipada relâmpago (DCO) para conferir aparência de legalidade.',
    checklistPassos: [
      'Calcular o tempo decorrido entre a liberação do crédito e a liquidação antecipada do saldo devedor',
      'Identificar o meio de pagamento utilizado na quitação (espécie, PIX de terceiro, boleto avulso)',
      'Verificar se o bem financiado (veículo/imóvel) foi integrado à economia formal com passivo rapidamente extinto',
      'Investigar se a origem dos recursos da quitação tem comprovação fiscal idônea'
    ],
    snippetTexto: 'AMORTIZAÇÃO ANTECIPADA RELÂMPAGO (LAVAGEM DE CRÉDITO): O cooperado realizou quitação integral de contrato de mútuo com curtíssimo decurso de prazo da contratação, utilizando recursos de origem externa não justificada. A operação configura tipologia clássica de integração de recursos ilegais para desoneração de bens patrimoniais formais.',
    badgeCor: 'bg-rose-700 text-white',
    matchFn: (caso) =>
      caso.isAmortizacaoAntecipada === true ||
      caso.alerta.toLowerCase().includes('amortização') ||
      caso.alerta.toLowerCase().includes('antecipada') ||
      caso.alerta.toLowerCase().includes('dco') ||
      caso.tipologiaPld.toLowerCase().includes('amortização')
  },
  {
    id: 'ALTA_VOLUMETRIA',
    filtroAlerta: 'Qtd Transações (Alta Volumetria)',
    categoria: 'Transacional',
    status: 'ATUAL',
    statusLabel: '✅ Atual',
    focoAcao: 'Uso comercial de conta PF',
    acaoPratica: 'Uso comercial de conta PF. Analisar se o servidor está operando atividade empresarial não declarada na conta pessoal ou recebendo dezenas de pequenos pagamentos pulverizados.',
    descricaoCompleta: 'Elevadíssima quantidade de transações em conta de pessoa física, indicativo de comércio paralelo ou atividade pulverizada não cadastrada.',
    checklistPassos: [
      'Contar a quantidade de lançamentos a crédito diários e o valor médio por transação (ex: R$ 50 a R$ 200)',
      'Verificar se as transações ocorrem em horários comerciais e finais de semana via QR Code PIX',
      'Confrontar com o regime de dedicação exclusiva do cargo público exercido pelo associado',
      'Notificar o cooperado para abertura de conta PJ específica ou encerramento de práticas comerciais em conta PF'
    ],
    snippetTexto: 'ALTA VOLUMETRIA E USO COMERCIAL DE CONTA PF: Registrada quantidade expressiva e desproporcional de transações de pequeno e médio valor na conta pessoal do associado, incompatível com despesas correntes de pessoa física. Os dados evidenciam exploração de atividade empresarial ou comercial informal não reportada aos órgãos tributários.',
    badgeCor: 'bg-slate-700 text-white',
    matchFn: (caso) =>
      caso.transacoes.length >= 8 ||
      caso.alerta.toLowerCase().includes('volumetria') ||
      caso.alerta.toLowerCase().includes('quantidade') ||
      caso.tipologiaPld.toLowerCase().includes('volumetria') ||
      caso.tipologiaPld.toLowerCase().includes('comercial')
  },
  {
    id: 'DEMAIS_APLICACOES',
    filtroAlerta: 'Demais (Aplicações Múltiplas)',
    categoria: 'Transacional',
    status: 'ATUAL',
    statusLabel: '✅ Atual',
    focoAcao: 'Conta de passagem em investimentos',
    acaoPratica: 'Conta de passagem em investimentos. Avaliar se o associado faz aportes atípicos que fogem do seu perfil tradicional de poupança/RDC.',
    descricaoCompleta: 'Aportes vultosos e imediatos em produtos de investimento com resgates céleres ou circulação atípica de capitais.',
    checklistPassos: [
      'Examinar o histórico de investimentos do cooperado nos últimos 24 meses (perfil conservador vs arrojado)',
      'Checar o tempo de permanência das aplicações de renda fixa/RDC antes de eventual resgate',
      'Verificar se os recursos aplicados originam-se de terceiros não associados',
      'Confirmar se o produto de investimento está sendo usado como mero estacionamento de liquidez atípica'
    ],
    snippetTexto: 'APLICAÇÕES MÚLTIPLAS ATÍPICAS EM INVESTIMENTOS: Verificou-se movimentação em produtos de investimento (RDC/CDB/Fundos) absolutamente desalinhada do histórico financeiro do associado, caracterizando utilização de produtos financeiros como etapa transitória de estratificação patrimonial.',
    badgeCor: 'bg-zinc-700 text-white',
    matchFn: (caso) =>
      caso.alerta.toLowerCase().includes('aplicações') ||
      caso.alerta.toLowerCase().includes('múltiplas') ||
      caso.alerta.toLowerCase().includes('investimentos') ||
      caso.tipologiaPld.toLowerCase().includes('aplicações') ||
      caso.categoriaDossie === 'DEMAIS_RECURSO_PROPRIO'
  },
  {
    id: 'PASSAGEM_VELOCIDADE',
    filtroAlerta: 'Contas de Passagem (Velocidade)',
    categoria: 'Transacional',
    status: 'NOVO',
    statusLabel: '⚠️ Novo',
    focoAcao: 'Rastreio de fluxo',
    acaoPratica: 'Rastreio de fluxo. O analista verifica o extrato para confirmar se PIX/TEDs de alto valor entram e saem no mesmo dia (ou dia seguinte) para outras instituições, burlando retenções.',
    descricaoCompleta: 'Ingresso de recursos de alto valor com repasse integral e célere para contas de outras IFs no mesmo dia útil ou dia imediatamente posterior.',
    checklistPassos: [
      'Calcular o intervalo de tempo exato (horas/minutos) entre a entrada do crédito e a saída por débito',
      'Verificar o saldo remanescente em conta corrente ao final do dia (geralmente próximo de R$ 0,00)',
      'Identificar as instituições financeiras destinatárias das transferências de saída',
      'Reportar o perfil de conta mula ou conta de passagem no formulário de comunicação ao SISCOAF'
    ],
    snippetTexto: 'CONTA DE PASSAGEM / VELOCIDADE DE FLUXO TRANSACIONAL (NOVO): Detectado fluxo característico de conta de passagem (pass-through), caracterizado pela recepção de expressivos montantes seguida de imediata pulverização ou transferência para outras instituições financeiras em menos de 24 horas, mantendo saldo residual irrisório e impedindo retenções preventivas.',
    badgeCor: 'bg-amber-700 text-white',
    matchFn: (caso) =>
      caso.alerta.toLowerCase().includes('passagem') ||
      caso.alerta.toLowerCase().includes('pass-through') ||
      caso.tipologiaPld.toLowerCase().includes('passagem') ||
      caso.tipologiaPld.toLowerCase().includes('pass-through') ||
      caso.regraDisparada.toLowerCase().includes('pass-08')
  },
  {
    id: 'FRACIONAMENTO',
    filtroAlerta: 'Fracionamento (Smurfing)',
    categoria: 'Transacional',
    status: 'NOVO',
    statusLabel: '⚠️ Novo',
    focoAcao: 'Agrupamento de valores',
    acaoPratica: 'Agrupamento de valores. Identificar no extrato a repetição de entradas/saídas fracionadas (ex: vários PIX de R$ 9.000 para não estourar alertas de R$ 10.000). Exigir explicação para a fragmentação.',
    descricaoCompleta: 'Fragmentação deliberada de operações abaixo do limiar de monitoramento objetivo (ex: operações de R$ 9.500 ou R$ 9.900) para escapar do crivo de detecção.',
    checklistPassos: [
      'Agrupar todas as transações de mesmo valor ou valores próximos (ex: R$ 8.000 a R$ 9.999) no mesmo período',
      'Somar o montante global acumulado no ciclo mensal (ex: 8 x R$ 9.000 = R$ 72.000)',
      'Exigir justificativa econômica do cooperado para a pulverização das operações em vez de envio consolidado',
      'Enquadrar na tipologia de burla voluntária de controle objetivo (Carta-Circular 4.001/2020)'
    ],
    snippetTexto: 'FRACIONAMENTO DELIBERADO / SMURFING (NOVO): O extrato analítico comprova a realização de sucessivas transações mantidas estrategicamente abaixo dos patamares de comunicação objetiva (R$ 10.000 e R$ 50.000), cuja soma acumulada perfaz montante substancial. O padrão configura burla consciente dos mecanismos de monitoramento cadastral e transacional.',
    badgeCor: 'bg-orange-700 text-white',
    matchFn: (caso) =>
      caso.alerta.toLowerCase().includes('smurfing') ||
      caso.alerta.toLowerCase().includes('fracionamento') ||
      caso.tipologiaPld.toLowerCase().includes('fracionamento') ||
      caso.tipologiaPld.toLowerCase().includes('smurfing') ||
      caso.regraDisparada.toLowerCase().includes('frac-04')
  },
  {
    id: 'CRIPTO_APOSTAS',
    filtroAlerta: 'Contrapartes Cripto e Apostas',
    categoria: 'Contraparte',
    status: 'NOVO',
    statusLabel: '⚠️ Novo',
    focoAcao: 'Evasão de divisas',
    acaoPratica: 'Evasão de divisas. O analista pesquisa os CNPJs de destino. Se o servidor transfere recursos incompatíveis com a renda para corretoras de ativos virtuais ou sites de aposta, reporta-se o risco de ocultação digital.',
    descricaoCompleta: 'Remessa de ativos a prestadores de serviços de ativos virtuais (VASPs/Exchanges) ou casas de apostas eletrônicas/bets, com risco de evasão e lavagem cibernética.',
    checklistPassos: [
      'Consultar o CNPJ e CNAE das empresas receptoras (Exchanges de Criptoativos, Bets e Plataformas de Jogos)',
      'Checar se o associado possui declaração de bens em criptoativos perante a Receita Federal (IN 1.888/2019)',
      'Verificar o volume de envios em horários noturnos e de partidas esportivas',
      'Avaliar se os valores transacionados são incompatíveis com o patrimônio formal do cooperado'
    ],
    snippetTexto: 'CONTRAPARTES CRIPTOATIVOS E CASAS DE APOSTAS (NOVO): Identificadas transferências volumosas para pessoas jurídicas operadoras de corretagem de ativos virtuais (VASPs) e plataformas de apostas de quota fixa (Bets), sem compatibilidade com a capacidade econômico-financeira do cooperado, evidenciando grave risco de evasão de divisas e ocultação digital de ativos.',
    badgeCor: 'bg-violet-700 text-white',
    matchFn: (caso) =>
      caso.alerta.toLowerCase().includes('cripto') ||
      caso.alerta.toLowerCase().includes('aposta') ||
      caso.alerta.toLowerCase().includes('exchange') ||
      caso.tipologiaPld.toLowerCase().includes('cripto') ||
      caso.tipologiaPld.toLowerCase().includes('aposta') ||
      caso.transacoes.some((t) => t.isHorarioJogos || t.metodo === 'Cripto' || t.categoria?.toLowerCase().includes('cripto') || t.categoria?.toLowerCase().includes('aposta'))
  },
  {
    id: 'RECEBIMENTO_PJ',
    filtroAlerta: 'Recebimento Contumaz de PJs',
    categoria: 'Contraparte',
    status: 'NOVO',
    statusLabel: '⚠️ Novo',
    focoAcao: 'Conflito de interesse',
    acaoPratica: 'Conflito de interesse. O analista levanta o CNAE da empresa que enviou o PIX. Se ela presta serviços ou fornece materiais para a esfera de governo onde o servidor trabalha, o indício de corrupção passiva/peculato é direto.',
    descricaoCompleta: 'Recebimento continuado de recursos de pessoas jurídicas por servidor público ou associado com atividade incompatível, apontando corrupção ou propina.',
    checklistPassos: [
      'Consultar cartão CNPJ e CNAE das pessoas jurídicas remetentes dos pagamentos',
      'Acessar portais de compras públicas e contratos para checar se a PJ é fornecedora do órgão do servidor',
      'Verificar se o associado emitiu nota fiscal avulsa ou contrato de prestação de serviços lícito',
      'Avaliar enquadramento como indício de corrupção passiva ou concussão funcional'
    ],
    snippetTexto: 'RECEBIMENTO CONTUMAZ DE PESSOAS JURÍDICAS / CONFLITO DE INTERESSES (NOVO): A conta do associado (servidor público) registrou créditos frequentes advindos de pessoa jurídica com CNAE vinculado a fornecimento e prestação de serviços governamentais na mesma esfera funcional de atuação do servidor, consubstanciando forte indício de vantagens indevidas e desvio funcional.',
    badgeCor: 'bg-zinc-900 text-[#FFCC01]',
    matchFn: (caso) =>
      caso.alerta.toLowerCase().includes('fornecedor') ||
      caso.alerta.toLowerCase().includes('recebimento pj') ||
      caso.alerta.toLowerCase().includes('pj') ||
      caso.tipologiaPld.toLowerCase().includes('triangulação') ||
      caso.transacoes.some((t) => t.tipo === 'Crédito' && (t.contraparte.toLowerCase().includes('ltda') || t.contraparte.toLowerCase().includes('s/a') || t.contraparte.toLowerCase().includes('me') || t.contraparte.toLowerCase().includes('distribuidora')))
  },
  {
    id: 'REATIVACAO_SUBITA',
    filtroAlerta: 'Reativação Súbita',
    categoria: 'Transacional',
    status: 'NOVO',
    statusLabel: '⚠️ Novo',
    focoAcao: 'Roubo de identidade',
    acaoPratica: 'Roubo de identidade. Validar se o servidor realmente voltou a movimentar a conta após meses zerada, solicitando atualização cadastral e prova de vida para evitar que golpistas estejam operando em seu nome.',
    descricaoCompleta: 'Contas sem movimentação significativa por período prolongado (dormentes) que subitamente iniciam operações vultosas e atípicas.',
    checklistPassos: [
      'Verificar o histórico de inatividade da conta nos últimos 6 a 12 meses',
      'Checar se houve alteração recente de telefone celular cadastrado, e-mail ou dispositivo de acesso (device)',
      'Solicitar comparecimento ou prova de vida com validação biométrica facial do titular',
      'Impedir saques ou remessas imediatas até a ratificação expressa da titularidade legítima'
    ],
    snippetTexto: 'REATIVAÇÃO SÚBITA DE CONTA DORMENTE (NOVO): Conta corrente com longo período de inatividade transacional apresentou repentina reativação com créditos de alto valor e transações imediatas por dispositivo móvel recém-instalado, com elevado risco de fraude cibernética, sequestro de dados ou roubo de identidade.',
    badgeCor: 'bg-rose-900 text-white',
    matchFn: (caso) =>
      caso.alerta.toLowerCase().includes('reativação') ||
      caso.alerta.toLowerCase().includes('dormente') ||
      caso.tipologiaPld.toLowerCase().includes('reativação') ||
      caso.device?.simSwapRecente === true ||
      (caso.device && caso.device.scoreRiscoFraude >= 75)
  }
];

export function getAlertsForCase(caso: CasoInvestigacao): PersonAnalysisAlert[] {
  const matched = PERSON_ANALYSIS_ALERTS.filter((al) => al.matchFn(caso));
  if (matched.length === 0) {
    // Fallback to Capacidade if nothing matched
    const def = PERSON_ANALYSIS_ALERTS.find((a) => a.id === 'CAPACIDADE');
    return def ? [def] : [];
  }
  return matched;
}
