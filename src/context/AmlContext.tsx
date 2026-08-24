import React, { createContext, useContext, useState, useEffect } from 'react';
import { CasoInvestigacao, ParecerState, AuditLog } from '../types';
import { mockCasos as initialMockCasos } from '../data/mock-data';

interface AmlContextType {
  casos: CasoInvestigacao[];
  activeCaseId: string;
  activeCase: CasoInvestigacao;
  currentRoute: string;
  navigateTo: (route: string) => void;
  setActiveCaseId: (id: string) => void;
  updateParecer: (caseId: string, partialParecer: Partial<ParecerState>) => void;
  saveDraft: (caseId: string) => void;
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
}

const AmlContext = createContext<AmlContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sentinel_pld_casos_v2';

export const AmlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [casos, setCasos] = useState<CasoInvestigacao[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return initialMockCasos;
  });

  const [activeCaseId, setActiveCaseIdState] = useState<string>(() => {
    return initialMockCasos[0]?.id || 'case-001';
  });

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || '/';
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(casos));
    } catch {
      // ignore
    }
  }, [casos]);

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

  const finalizeDeliberation = (
    caseId: string,
    deliberation: 'ARQUIVAR' | 'DILIGENCIA' | 'COMUNICAR_COAF' | 'BLOQUEIO_CAUTELAR' | 'APROVAR' | 'REPROVAR',
    opinionText: string,
    extraData?: { tipologiaCoaf?: string; motivoArquivamento?: string; solicitacaoDiligencia?: string }
  ) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');

    let newStatus: CasoInvestigacao['status'] = 'Em Análise';
    let acaoAudit = '';
    let detalhesAudit = '';

    if (deliberation === 'ARQUIVAR' || deliberation === 'APROVAR') {
      newStatus = 'Arquivado';
      acaoAudit = 'Caso Arquivado (Falso Positivo / Atipicidade Justificada)';
      detalhesAudit = `Parecer conclusivo: ${opinionText.slice(0, 120)}...`;
    } else if (deliberation === 'DILIGENCIA') {
      newStatus = 'Diligência';
      acaoAudit = 'Diligência Documental Exigida';
      detalhesAudit = `Solicitação de documentos/esclarecimentos: ${extraData?.solicitacaoDiligencia || opinionText.slice(0, 100)}`;
    } else if (deliberation === 'COMUNICAR_COAF' || deliberation === 'REPROVAR') {
      newStatus = 'Comunicado COAF';
      acaoAudit = 'Comunicação SISCOAF Emitida';
      detalhesAudit = `Enquadramento na tipologia: ${extraData?.tipologiaCoaf || 'Atipicidade grave de PLD/FT'}. Protocolo #SISCOAF-2026-BR.`;
    } else if (deliberation === 'BLOQUEIO_CAUTELAR') {
      newStatus = 'Comunicado COAF';
      acaoAudit = 'Bloqueio Cautelar e Comunicação COAF';
      detalhesAudit = `Bloqueio administrativo cautelar nos termos da Circular BACEN 3.978/20.`;
    }

    setCasos((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            status: newStatus,
            parecer: {
              ...c.parecer,
              deliberacao: deliberation,
              texto: opinionText,
              tipologiaCoaf: extraData?.tipologiaCoaf,
              motivoArquivamento: extraData?.motivoArquivamento,
              solicitacaoDiligencia: extraData?.solicitacaoDiligencia,
              finalizadoEm: formattedDate,
            },
            auditLogs: [
              {
                id: 'log-' + Date.now(),
                timestamp: formattedDate,
                analista: 'Maísa Ramos (Analista PLD Sênior)',
                acao: acaoAudit,
                detalhes: detalhesAudit,
              },
              ...c.auditLogs,
            ],
          };
        }
        return c;
      })
    );

    if (deliberation === 'COMUNICAR_COAF' || deliberation === 'REPROVAR' || deliberation === 'BLOQUEIO_CAUTELAR') {
      showToast('Comunicação ao COAF realizada com sucesso! Protocolo SISCOAF gerado.', 'warning');
    } else if (deliberation === 'ARQUIVAR' || deliberation === 'APROVAR') {
      showToast('Parecer finalizado: Caso arquivado como Atipicidade Justificada.', 'success');
    } else {
      showToast('Diligência registrada com sucesso. Prazo regulatório iniciado.', 'info');
    }
  };

  const resetToDefaults = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setCasos(initialMockCasos);
    setActiveCaseIdState(initialMockCasos[0]?.id || 'case-001');
    showToast('Base de dados restaurada para o padrão inicial.', 'info');
  };

  return (
    <AmlContext.Provider
      value={{
        casos,
        activeCaseId,
        activeCase,
        currentRoute,
        navigateTo,
        setActiveCaseId,
        updateParecer,
        saveDraft,
        finalizeDeliberation,
        addAuditLog,
        resetToDefaults,
        toastMessage,
        showToast,
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
