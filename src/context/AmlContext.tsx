import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CasoInvestigacao,
  ParecerState,
  AuditLog,
  ValidacaoCategoriaDossie,
  TipoFicha,
  RemessaMensal,
  ParecerVersao,
  DecisaoGecan,
  ExportacaoLogItem,
  AlertStatus,
  UserRole,
  DeliberacaoDirex,
} from '../types';
import { mockCasos as initialMockCasos } from '../data/mock-data';
import {
  mockRemessasIniciais,
  mockExportLogsIniciais,
  enriquecerCasoComV2,
  calcularPercentualEdicaoHumana,
} from '../utils/pldV2Helper';

interface AmlContextType {
  casos: CasoInvestigacao[];
  activeCaseId: string;
  activeCase: CasoInvestigacao;
  currentRoute: string;
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  remessas: RemessaMensal[];
  exportLogs: ExportacaoLogItem[];
  navigateTo: (route: string) => void;
  setActiveCaseId: (id: string) => void;
  updateParecer: (caseId: string, partialParecer: Partial<ParecerState>) => void;
  updateDossierValidation: (caseId: string, validacao: ValidacaoCategoriaDossie) => void;
  saveDraft: (caseId: string) => void;
  salvarVersaoParecer: (
    caseId: string,
    textoAutomatico: string,
    textoFinal: string,
    tipoSalvamento?: 'RASCUNHO' | 'DEFINITIVO'
  ) => void;
  encerrarFicha: (
    caseId: string,
    decisao: 'SEM_OCORRENCIA' | 'COMUNICAR_COAF',
    justificativa: string,
    dadosComplementares?: {
      tipologiaCoafCodigo?: string;
      tipologiaCoafDescricao?: string;
      recomendacaoGecan?: string;
      numeroProtocoloSiscoaf?: string;
    }
  ) => void;
  reabrirFicha: (caseId: string, justificativaObrigatoria: string) => void;
  setSubStatus: (caseId: string, status: AlertStatus) => void;
  atribuirAnalista: (caseIds: string[], analistaNome: string, analistaIniciais: string) => void;
  gerarRemessaMensal: (dataRef: string, tipoFicha: TipoFicha) => { novas: number; existentes: number };
  simularRemessaMensal: (dataRef: string, tipoFicha: TipoFicha) => { total: number; criticos: number; volume: number };
  registrarExportacao: (
    fichaId: string | undefined,
    nomeCaso: string | undefined,
    cpf: string | undefined,
    formato: 'PDF' | 'CSV' | 'XML',
    finalidade: string
  ) => void;
  executarMigracaoLegado: () => { totalMigrados: number; parciais: number };
  finalizeDeliberation: (
    caseId: string,
    deliberation: 'ARQUIVAR' | 'DILIGENCIA' | 'COMUNICAR_COAF' | 'BLOQUEIO_CAUTELAR' | 'APROVAR' | 'REPROVAR',
    opinionText: string,
    extraData?: { tipologiaCoaf?: string; motivoArquivamento?: string; solicitacaoDiligencia?: string }
  ) => void;
  addAuditLog: (caseId: string, acao: string, detalhes: string) => void;
  resetToDefaults: () => void;
  toastMessage: { text: string; type: 'success' | 'warning' | 'info' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  assinarDirex: (caseId: string, dadosAssinatura?: { diretorNome?: string; cargo?: string; despacho?: string }) => void;
  assinarDirexLote: (caseIds: string[], dadosAssinatura?: { diretorNome?: string; cargo?: string; despacho?: string }) => void;
  rejeitarDirex: (caseId: string, motivo: string) => void;
}

const AmlContext = createContext<AmlContextType | undefined>(undefined);

const LOCAL_STORAGE_CASOS = 'cooperforte_pldft_casos_v2_1';
const LOCAL_STORAGE_REMESSAS = 'cooperforte_pldft_remessas_v2';
const LOCAL_STORAGE_EXPORTS = 'cooperforte_pldft_export_logs_v2';

export const AmlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [casos, setCasos] = useState<CasoInvestigacao[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CASOS);
      if (saved) {
        const parsed: CasoInvestigacao[] = JSON.parse(saved);
        return parsed.map((c) => enriquecerCasoComV2(c));
      }
    } catch {
      // fallback
    }
    return initialMockCasos.map((c) => enriquecerCasoComV2(c));
  });

  const [remessas, setRemessas] = useState<RemessaMensal[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_REMESSAS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return mockRemessasIniciais;
  });

  const [exportLogs, setExportLogs] = useState<ExportacaoLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_EXPORTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return mockExportLogsIniciais;
  });

  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('');

  const [activeCaseId, setActiveCaseIdState] = useState<string>(() => {
    return initialMockCasos[0]?.id || 'case-001';
  });

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || '/';
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' | 'error' } | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('ANALISTA');

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CASOS, JSON.stringify(casos));
    } catch {
      // ignore
    }
  }, [casos]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_REMESSAS, JSON.stringify(remessas));
    } catch {
      // ignore
    }
  }, [remessas]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_EXPORTS, JSON.stringify(exportLogs));
    } catch {
      // ignore
    }
  }, [exportLogs]);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentRoute(hash);
      if (hash.startsWith('/investigacao/')) {
        const id = hash.replace('/investigacao/', '');
        if (id) setActiveCaseIdState(id);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
    if (route.startsWith('/investigacao/')) {
      const id = route.replace('/investigacao/', '');
      if (id) setActiveCaseIdState(id);
    }
  };

  const setActiveCaseId = (id: string) => {
    setActiveCaseIdState(id);
    navigateTo(`/investigacao/${id}`);
  };

  const showToast = (text: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const activeCase = casos.find((c) => c.id === activeCaseId) || casos[0] || initialMockCasos[0];

  const updateParecer = (caseId: string, partialParecer: Partial<ParecerState>) => {
    setCasos((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            parecer: {
              ...c.parecer,
              ...partialParecer,
            },
          };
        }
        return c;
      })
    );
  };

  const updateDossierValidation = (caseId: string, validacao: ValidacaoCategoriaDossie) => {
    setCasos((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            categoriaDossie: validacao.categoria,
            validacaoDossie: validacao,
          };
        }
        return c;
      })
    );
  };

  const addAuditLog = (caseId: string, acao: string, detalhes: string) => {
    const now = new Date();
    const timestamp = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp,
      analista: 'Maísa Ramos (Analista PLD Sênior)',
      acao,
      detalhes,
    };

    setCasos((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            auditLogs: [newLog, ...c.auditLogs],
          };
        }
        return c;
      })
    );
  };

  const saveDraft = (caseId: string) => {
    const now = new Date().toLocaleTimeString('pt-BR');
    updateParecer(caseId, { salvoEm: now });
    addAuditLog(caseId, 'Rascunho de Parecer PLD Salvo', `Atualização do parecer preliminar às ${now}`);
    showToast('Rascunho do parecer PLD salvo com sucesso!', 'info');
  };

  const salvarVersaoParecer = (
    caseId: string,
    textoAutomatico: string,
    textoFinal: string,
    tipoSalvamento: 'RASCUNHO' | 'DEFINITIVO' = 'RASCUNHO'
  ) => {
    const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');
    const percentualEdicao = calcularPercentualEdicaoHumana(textoAutomatico, textoFinal);

    setCasos((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const proximaVersao = (c.versoesParecer?.length || 0) + 1;
          const novaVersao: ParecerVersao = {
            id: `ver-${proximaVersao}-${Date.now()}`,
            versao: proximaVersao,
            vigente: true,
            textoAutomaticoSugerido: textoAutomatico,
            textoFinal,
            percentualEdicaoHumana: percentualEdicao,
            analistaNome: c.analistaNome || 'Maísa Ramos',
            dataCriacao: nowStr,
            tipoSalvamento,
          };

          const versoesAtualizadas = [
            novaVersao,
            ...(c.versoesParecer || []).map((v) => ({ ...v, vigente: false })),
          ];

          return {
            ...c,
            versoesParecer: versoesAtualizadas,
            parecer: {
              ...c.parecer,
              texto: textoFinal,
              salvoEm: nowStr,
            },
          };
        }
        return c;
      })
    );

    addAuditLog(caseId, 'Versão do Parecer Registrada (Append-Only)', `Nova versão gravada no banco com ${percentualEdicao}% de edição humana.`);
    showToast(`Versão do parecer gravada com sucesso! (${percentualEdicao}% de edição humana)`, 'success');
  };

  const encerrarFicha = (
    caseId: string,
    decisao: 'SEM_OCORRENCIA' | 'COMUNICAR_COAF',
    justificativa: string,
    dadosComplementares?: {
      tipologiaCoafCodigo?: string;
      tipologiaCoafDescricao?: string;
      recomendacaoGecan?: string;
      numeroProtocoloSiscoaf?: string;
    }
  ) => {
    const now = new Date();
    const nowStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
    const statusFinal: AlertStatus = decisao === 'COMUNICAR_COAF' ? 'Aguardando Assinatura DIREX' : 'Arquivado';

    setCasos((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const decisaoGecan: DecisaoGecan = {
            decisao,
            recomendacaoGecan: dadosComplementares?.recomendacaoGecan || (decisao === 'COMUNICAR_COAF' ? 'Comunicação compulsória imediata e encaminhamento à Diretoria Executiva' : 'Arquivar em pasta de conformidade'),
            tipologiaCoafCodigo: dadosComplementares?.tipologiaCoafCodigo,
            tipologiaCoafDescricao: dadosComplementares?.tipologiaCoafDescricao,
            dataDecisao: nowStr,
            dataComunicacaoCoaf: decisao === 'COMUNICAR_COAF' ? nowStr : undefined,
            numeroProtocoloSiscoaf: dadosComplementares?.numeroProtocoloSiscoaf || (decisao === 'COMUNICAR_COAF' ? `SISCOAF-2026-${Math.floor(100000 + Math.random() * 900000)}` : undefined),
            prazoLimiteComunicacao: new Date(Date.now() + 24 * 3600 * 1000).toLocaleDateString('pt-BR') + ' ' + new Date(Date.now() + 24 * 3600 * 1000).toLocaleTimeString('pt-BR'),
            tempestiva: true,
            sigiloAtivo: true,
            membroGecanResponsavel: 'Comitê de Risco e Conformidade GECAN',
          };

          const deliberacaoDirexAtual: DeliberacaoDirex = decisao === 'COMUNICAR_COAF'
            ? {
                decisaoDiretoria: 'HOMOLOGADA_COMUNICACAO_COAF',
                textoDeliberacao: 'Encaminhado pelo Analista para validação executiva e assinatura digital da Diretoria (RF-14). Exportação SISCOAF bloqueada até a homologação.',
                dadosControleSiscoaf: {
                  numeroOrigem: `ORIGEM-2026-${c.id}`,
                  documentoControle: `DOC-COAF-${Date.now()}`,
                  protocoloSiscoaf: decisaoGecan.numeroProtocoloSiscoaf,
                  situacaoSiscoaf: 'Em Preparação',
                },
              }
            : {
                decisaoDiretoria: 'DISPENSADA',
                textoDeliberacao: 'Dispensada - sem ocorrência de comunicação.',
                dadosControleSiscoaf: {
                  numeroOrigem: `ORIGEM-2026-${c.id}`,
                  documentoControle: `DOC-ARQ-${Date.now()}`,
                  situacaoSiscoaf: 'Dispensado de Envio',
                },
              };

          const novoHistorico = [
            {
              id: 'trans-' + Date.now(),
              deStatus: c.status,
              paraStatus: statusFinal,
              dataHora: nowStr,
              usuario: 'Maísa Ramos (Analista Sênior)',
              justificativa,
              detalhes: decisao === 'COMUNICAR_COAF'
                ? `Encerramento com Comunicação COAF tipologia ${dadosComplementares?.tipologiaCoafCodigo || '1.1.1'}. Encaminhado para a esteira exclusiva da Diretoria (RF-14).`
                : 'Encerramento formal: Atipicidade Justificada / Sem Ocorrência (Arquivado).',
            },
            ...(c.statusHistorico || []),
          ];

          return {
            ...c,
            status: statusFinal,
            decisaoGecanDetalhada: decisaoGecan,
            deliberacaoDirex: deliberacaoDirexAtual,
            statusHistorico: novoHistorico,
            parecer: {
              ...c.parecer,
              deliberacao: decisao === 'COMUNICAR_COAF' ? 'COMUNICAR_COAF' : 'ARQUIVAR',
              tipologiaCoaf: dadosComplementares?.tipologiaCoafCodigo,
              finalizadoEm: nowStr,
            },
          };
        }
        return c;
      })
    );

    addAuditLog(
      caseId,
      decisao === 'COMUNICAR_COAF' ? 'Dossiê Finalizado - Encaminhado à Diretoria (RF-07, RF-14)' : 'Dossiê Encerrado e Arquivado (RF-07)',
      `Decisão: ${decisao}. Status final: ${statusFinal}.`
    );

    showToast(
      decisao === 'COMUNICAR_COAF'
        ? 'Dossiê concluído! Encaminhado para validação executiva e assinatura digital da Diretoria (DIREX - RF-14).'
        : 'Dossiê encerrado com sucesso como "Sem ocorrência de registro/comunicação ao COAF" e arquivado.',
      'success'
    );
  };

  const assinarDirex = (
    caseId: string,
    dadosAssinatura?: { diretorNome?: string; cargo?: string; despacho?: string }
  ) => {
    const now = new Date();
    const nowStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
    const diretorNome = dadosAssinatura?.diretorNome || 'Dr. Roberto Guimarães';
    const cargoAprovador = dadosAssinatura?.cargo || 'Diretor de Riscos e Compliance (DIREX)';
    const tokenCert = `ICP-BR-A3-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const hashAssinatura = `SHA256-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    setCasos((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const deliberacaoAtual: DeliberacaoDirex = {
            decisaoDiretoria: 'HOMOLOGADA_COMUNICACAO_COAF',
            textoDeliberacao:
              dadosAssinatura?.despacho ||
              'Homologação executiva deferida. Dossiê em estrita conformidade com a Circular BACEN nº 3.978/2020 e Lei nº 9.613/1998. Autorizada a exportação SISCOAF.',
            aprovadoPor: diretorNome,
            cargoAprovador,
            dataHoraAssinatura: nowStr,
            certificadoIcpBrasilToken: tokenCert,
            hashAssinaturaDigital: hashAssinatura,
            dadosControleSiscoaf: {
              numeroOrigem: `ORIGEM-2026-${c.id}`,
              documentoControle: `DOC-SISCOAF-${Date.now()}`,
              protocoloSiscoaf: c.decisaoGecanDetalhada?.numeroProtocoloSiscoaf || `SISCOAF-2026-${Math.floor(100000 + Math.random() * 900000)}`,
              situacaoSiscoaf: 'Enviado e Homologado',
              dataEnvio: nowStr,
            },
          };

          const novoHistorico = [
            {
              id: 'trans-' + Date.now(),
              deStatus: c.status,
              paraStatus: 'Comunicado COAF' as AlertStatus,
              dataHora: nowStr,
              usuario: `${diretorNome} (${cargoAprovador})`,
              justificativa: 'Validação executiva homologada com assinatura digital ICP-Brasil.',
              detalhes: `Assinatura digital token ${tokenCert}. Dossiê liberado para extração no lote SISCOAF (RF-09, RF-14).`,
            },
            ...(c.statusHistorico || []),
          ];

          return {
            ...c,
            status: 'Comunicado COAF',
            deliberacaoDirex: deliberacaoAtual,
            statusHistorico: novoHistorico,
          };
        }
        return c;
      })
    );

    addAuditLog(
      caseId,
      'Assinatura Digital DIREX Homologada (RF-14)',
      `Validação executiva deferida por ${diretorNome}. Liberação oficial de exportação SISCOAF (RF-09). Token: ${tokenCert}`
    );
    showToast('Assinatura Digital da Diretoria aplicada com sucesso! Dossiê liberado para lote SISCOAF.', 'success');
  };

  const assinarDirexLote = (
    caseIds: string[],
    dadosAssinatura?: { diretorNome?: string; cargo?: string; despacho?: string }
  ) => {
    caseIds.forEach((id) => assinarDirex(id, dadosAssinatura));
    showToast(`${caseIds.length} dossiê(s) homologados e assinados digitalmente pela Diretoria!`, 'success');
  };

  const rejeitarDirex = (caseId: string, motivo: string) => {
    const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');
    setCasos((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            status: 'Em Análise',
            statusHistorico: [
              {
                id: 'trans-' + Date.now(),
                deStatus: c.status,
                paraStatus: 'Em Análise',
                dataHora: nowStr,
                usuario: 'Diretoria (DIREX)',
                justificativa: motivo,
                detalhes: 'Dossiê devolvido pela Diretoria para complementação de diligências pelo analista.',
              },
              ...(c.statusHistorico || []),
            ],
          };
        }
        return c;
      })
    );
    addAuditLog(caseId, 'Dossiê Devolvido pela Diretoria (RF-14)', `Devolvido para o analista. Motivo: ${motivo}`);
    showToast('Dossiê devolvido para a esteira do analista para complementação.', 'info');
  };

  const reabrirFicha = (caseId: string, justificativaObrigatoria: string) => {
    if (!justificativaObrigatoria.trim()) {
      showToast('A justificativa de reabertura é estritamente obrigatória por norma de auditoria!', 'error');
      return;
    }

    const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');

    setCasos((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const novoHistorico = [
            {
              id: 'trans-' + Date.now(),
              deStatus: c.status,
              paraStatus: 'Em Análise',
              dataHora: nowStr,
              usuario: 'Maísa Ramos (Analista Sênior)',
              justificativa: justificativaObrigatoria,
              detalhes: 'Reabertura formal autorizada para complementação probatória (RF-24 / RN-05)',
            },
            ...(c.statusHistorico || []),
          ];

          return {
            ...c,
            status: 'Em Análise',
            statusHistorico: novoHistorico,
          };
        }
        return c;
      })
    );

    addAuditLog(caseId, 'Ficha Reaberta pelo Analista (RF-24)', `Justificativa auditável: ${justificativaObrigatoria}`);
    showToast('Ficha reaberta com sucesso! Status retornado para "Em Análise".', 'info');
  };

  const setSubStatus = (caseId: string, status: AlertStatus) => {
    const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');
    setCasos((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const novoHistorico = [
            {
              id: 'trans-' + Date.now(),
              deStatus: c.status,
              paraStatus: status,
              dataHora: nowStr,
              usuario: 'Maísa Ramos (Analista Sênior)',
              detalhes: `Transição de sub-status para [${status}]`,
            },
            ...(c.statusHistorico || []),
          ];
          return {
            ...c,
            status,
            statusHistorico: novoHistorico,
          };
        }
        return c;
      })
    );
    showToast(`Status da ficha atualizado para: ${status}`, 'info');
  };

  const atribuirAnalista = (caseIds: string[], analistaNome: string, analistaIniciais: string) => {
    const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');
    setCasos((prev) =>
      prev.map((c) => {
        if (caseIds.includes(c.id)) {
          const novoHistorico = [
            {
              id: 'trans-' + Date.now(),
              deStatus: c.status,
              paraStatus: c.status,
              dataHora: nowStr,
              usuario: 'Coordenador PLD/FT',
              detalhes: `Reatribuição de analista responsável: ${analistaNome} (${analistaIniciais})`,
            },
            ...(c.statusHistorico || []),
          ];
          return {
            ...c,
            analistaNome,
            analistaIniciais,
            statusHistorico: novoHistorico,
          };
        }
        return c;
      })
    );
    showToast(`${caseIds.length} ficha(s) reatribuída(s) para ${analistaNome} com sucesso!`, 'success');
  };

  const registrarExportacao = (
    fichaId: string | undefined,
    nomeCaso: string | undefined,
    cpf: string | undefined,
    formato: 'PDF' | 'CSV' | 'XML',
    finalidade: string
  ) => {
    const novoLog: ExportacaoLogItem = {
      id: 'exp-' + Date.now(),
      fichaId,
      nomeCaso: nomeCaso || 'Extração Geral de Lote',
      cpf,
      formato,
      dataHora: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR'),
      usuario: 'Maísa Ramos (Analista Compliance)',
      finalidade,
    };
    setExportLogs((prev) => [novoLog, ...prev]);
  };

  const gerarRemessaMensal = (dataRef: string, tipoFicha: TipoFicha) => {
    const jaExiste = remessas.find((r) => r.dataReferencia === dataRef && r.tipoFicha === tipoFicha);
    const fichasDoTipo = casos.filter((c) => (c.tipoFicha || 'Operações') === tipoFicha);

    const novas = jaExiste ? 0 : Math.floor(10 + Math.random() * 8);
    const existentes = fichasDoTipo.length;

    const novaRemessa: RemessaMensal = {
      id: `rem-${dataRef.replace('/', '-')}-${tipoFicha === 'Operações' ? 'op' : 'cc'}-${Date.now()}`,
      dataReferencia: dataRef,
      tipoFicha,
      dtGeracao: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR'),
      totalFichas: existentes + novas,
      fichasNovas: novas,
      fichasJaExistentes: existentes,
      fichasConcluidas: fichasDoTipo.filter((c) => c.status === 'Comunicado COAF' || c.status === 'Arquivado').length,
      fichasPendentes: fichasDoTipo.filter((c) => c.status !== 'Comunicado COAF' && c.status !== 'Arquivado').length + novas,
      status: 'Em Andamento',
      geradaPor: 'STP_PLDFT_GERAR_REMESSA (Idempotente)',
    };

    setRemessas((prev) => [novaRemessa, ...prev.filter((r) => r.id !== novaRemessa.id)]);
    showToast(`Remessa oficial [${dataRef} - ${tipoFicha}] gerada com sucesso! (${novas} novas fichas, ${existentes} já existentes mantidas)`, 'success');
    return { novas, existentes };
  };

  const simularRemessaMensal = (dataRef: string, tipoFicha: TipoFicha) => {
    const fichasDoTipo = casos.filter((c) => (c.tipoFicha || 'Operações') === tipoFicha);
    const total = fichasDoTipo.length + 15;
    const criticos = fichasDoTipo.filter((c) => c.scoreRisco >= 70).length + 4;
    const volume = fichasDoTipo.reduce((acc, c) => acc + c.valorEnvolvido, 0) + 4200000;
    return { total, criticos, volume };
  };

  const executarMigracaoLegado = () => {
    showToast('Processo de migração concluído: 1.240 fichas legadas incorporadas ao acervo permanente!', 'success');
    return { totalMigrados: 1240, parciais: 112 };
  };

  const finalizeDeliberation = (
    caseId: string,
    deliberation: 'ARQUIVAR' | 'DILIGENCIA' | 'COMUNICAR_COAF' | 'BLOQUEIO_CAUTELAR' | 'APROVAR' | 'REPROVAR',
    opinionText: string,
    extraData?: { tipologiaCoaf?: string; motivoArquivamento?: string; solicitacaoDiligencia?: string }
  ) => {
    if (deliberation === 'COMUNICAR_COAF' || deliberation === 'REPROVAR' || deliberation === 'BLOQUEIO_CAUTELAR') {
      encerrarFicha(caseId, 'COMUNICAR_COAF', opinionText, {
        tipologiaCoafCodigo: extraData?.tipologiaCoaf,
        recomendacaoGecan: 'Comunicação SISCOAF compulsória imediata e bloqueio administrativo nos termos da norma.',
      });
    } else if (deliberation === 'ARQUIVAR' || deliberation === 'APROVAR') {
      encerrarFicha(caseId, 'SEM_OCORRENCIA', opinionText, {
        recomendacaoGecan: extraData?.motivoArquivamento || 'Atipicidade justificada e compatível com histórico.',
      });
    } else {
      setSubStatus(caseId, 'Diligência');
      addAuditLog(caseId, 'Diligência Solicitada', extraData?.solicitacaoDiligencia || opinionText);
    }
  };

  const resetToDefaults = () => {
    localStorage.removeItem(LOCAL_STORAGE_CASOS);
    localStorage.removeItem(LOCAL_STORAGE_REMESSAS);
    localStorage.removeItem(LOCAL_STORAGE_EXPORTS);
    const reloaded = initialMockCasos.map((c) => enriquecerCasoComV2(c));
    setCasos(reloaded);
    setRemessas(mockRemessasIniciais);
    setExportLogs(mockExportLogsIniciais);
    setActiveCaseIdState(reloaded[0]?.id || 'case-001');
    showToast('Banco de dados e acervo permanente restaurados para o padrão original.', 'info');
  };

  return (
    <AmlContext.Provider
      value={{
        casos,
        activeCaseId,
        activeCase,
        currentRoute,
        globalSearchTerm,
        setGlobalSearchTerm,
        remessas,
        exportLogs,
        navigateTo,
        setActiveCaseId,
        updateParecer,
        updateDossierValidation,
        saveDraft,
        salvarVersaoParecer,
        encerrarFicha,
        reabrirFicha,
        setSubStatus,
        atribuirAnalista,
        gerarRemessaMensal,
        simularRemessaMensal,
        registrarExportacao,
        executarMigracaoLegado,
        finalizeDeliberation,
        addAuditLog,
        resetToDefaults,
        toastMessage,
        showToast,
        currentUserRole,
        setCurrentUserRole,
        assinarDirex,
        assinarDirexLote,
        rejeitarDirex,
      }}
    >
      {children}
    </AmlContext.Provider>
  );
};

export const useAml = () => {
  const context = useContext(AmlContext);
  if (!context) {
    throw new Error('useAml must be used within an AmlProvider');
  }
  return context;
};
