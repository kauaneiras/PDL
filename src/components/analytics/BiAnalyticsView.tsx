import React, { useState, useMemo } from 'react';
import { useAml } from '../../context/AmlContext';
import { CasoInvestigacao, MonitoramentoCustomizado } from '../../types';
import { mockMonitoramentos } from '../../data/mock-bi-data';
import { BatchExportModal } from '../export/BatchExportModal';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  Search,
  Filter,
  Download,
  Flame,
  Clock,
  User,
  Users,
  ShieldAlert,
  Smartphone,
  MapPin,
  TrendingUp,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Layers
} from 'lucide-react';

const COLORS_CHART = ['#047857', '#0284c7', '#7c3aed', '#d97706', '#dc2626', '#059669', '#475569'];

export const BiAnalyticsView: React.FC = () => {
  const { casos, setActiveCaseId, navigateTo, showToast } = useAml();

  // Abas internas
  const [activeTab, setActiveTab] = useState<'GRAFICOS' | 'BUSCA' | 'MONITORAMENTOS'>('GRAFICOS');

  // Filtros Globais do BI e Busca
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroOrigemRecursos, setFiltroOrigemRecursos] = useState('TODOS');
  const [filtroRegiaoPais, setFiltroRegiaoPais] = useState('TODOS');
  const [filtroFaixaRenda, setFiltroFaixaRenda] = useState('TODOS');
  const [filtroTempoAssociado, setFiltroTempoAssociado] = useState('TODOS');
  const [filtroFaixaIdade, setFiltroFaixaIdade] = useState('TODOS');
  const [filtroEstadoCivil, setFiltroEstadoCivil] = useState('TODOS');
  const [filtroHorario, setFiltroHorario] = useState('TODOS');

  // Modal de Exportação em Lote
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Monitoramentos
  const [monitoramentos, setMonitoramentos] = useState<MonitoramentoCustomizado[]>(() => {
    try {
      const saved = localStorage.getItem('cooperforte_custom_monitors_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return mockMonitoramentos;
  });

  const [isCreatingMonitor, setIsCreatingMonitor] = useState(false);
  const [novoMonitor, setNovoMonitor] = useState<Partial<MonitoramentoCustomizado>>({
    nome: '',
    tipo: 'FAIXA_HORARIO',
    descricao: '',
    parametros: {
      horarioInicio: '22:00',
      horarioFim: '06:00',
      volumeMinimo: 10000,
      apenasEmHorarioDeJogos: false
    },
    acaoAlerta: 'GERAR_ALERTA_CRITICO',
    status: 'ATIVO'
  });

  const formatCurrency = (val?: number) => {
    if (!val) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Filtragem dos Casos
  const casosFiltrados = useMemo(() => {
    return casos.filter((caso) => {
      // 1. Busca textual
      if (buscaTexto.trim() !== '') {
        const t = buscaTexto.toLowerCase();
        const match =
          caso.nome.toLowerCase().includes(t) ||
          caso.cpf.includes(t) ||
          caso.matricula.includes(t) ||
          caso.tipologiaPld.toLowerCase().includes(t) ||
          (caso.kyc?.profissao && caso.kyc.profissao.toLowerCase().includes(t)) ||
          (caso.kyc?.cidadeUf && caso.kyc.cidadeUf.toLowerCase().includes(t));
        if (!match) return false;
      }

      // 2. Origem dos Recursos
      if (filtroOrigemRecursos !== 'TODOS') {
        const orig = (caso.origemRecursos || caso.capacidadeFinanceira?.origemRecursosDeclarada || '').toLowerCase();
        if (filtroOrigemRecursos === 'IMOVEIS' && !orig.includes('imóve') && !orig.includes('imove')) return false;
        if (filtroOrigemRecursos === 'SALARIO' && !orig.includes('salário') && !orig.includes('vencimento') && !orig.includes('provento')) return false;
        if (filtroOrigemRecursos === 'APOSTAS' && !orig.includes('aposta') && !orig.includes('jogo')) return false;
        if (filtroOrigemRecursos === 'EMPRESTIMOS' && !orig.includes('empréstimo') && !orig.includes('crédito')) return false;
        if (filtroOrigemRecursos === 'TERCEIROS' && !orig.includes('terceiro') && !orig.includes('passagem')) return false;
        if (filtroOrigemRecursos === 'RURAL' && !orig.includes('rural') && !orig.includes('agro')) return false;
      }

      // 3. Região do País
      if (filtroRegiaoPais !== 'TODOS') {
        const regiao = caso.regiaoPais || 'Centro-Oeste';
        if (regiao !== filtroRegiaoPais) return false;
      }

      // 4. Faixa de Renda
      if (filtroFaixaRenda !== 'TODOS') {
        const r = caso.capacidadeFinanceira?.rendaDeclarada || caso.renda || 0;
        if (filtroFaixaRenda === 'ATE_3K' && r > 3000) return false;
        if (filtroFaixaRenda === '3K_8K' && (r <= 3000 || r > 8000)) return false;
        if (filtroFaixaRenda === '8K_20K' && (r <= 8000 || r > 20000)) return false;
        if (filtroFaixaRenda === '20K_50K' && (r <= 20000 || r > 50000)) return false;
        if (filtroFaixaRenda === 'ACIMA_50K' && r <= 50000) return false;
      }

      // 5. Tempo de Associado
      if (filtroTempoAssociado !== 'TODOS') {
        const m = caso.tempoAssociadoMeses || 24;
        if (filtroTempoAssociado === 'ATE_1ANO' && m > 12) return false;
        if (filtroTempoAssociado === '1A3ANOS' && (m <= 12 || m > 36)) return false;
        if (filtroTempoAssociado === '3A5ANOS' && (m <= 36 || m > 60)) return false;
        if (filtroTempoAssociado === 'MAIS_5ANOS' && m <= 60) return false;
      }

      // 6. Faixa de Idade
      if (filtroFaixaIdade !== 'TODOS') {
        const id = caso.idade || 35;
        if (filtroFaixaIdade === '18_25' && (id < 18 || id > 25)) return false;
        if (filtroFaixaIdade === '26_35' && (id < 26 || id > 35)) return false;
        if (filtroFaixaIdade === '36_50' && (id < 36 || id > 50)) return false;
        if (filtroFaixaIdade === '51_65' && (id < 51 || id > 65)) return false;
        if (filtroFaixaIdade === 'MAIS_65' && id <= 65) return false;
      }

      // 7. Estado Civil
      if (filtroEstadoCivil !== 'TODOS') {
        const ec = caso.estadoCivil || caso.kyc?.estadoCivil || 'Casado(a)';
        if (!ec.includes(filtroEstadoCivil)) return false;
      }

      // 8. Faixa de Horário
      if (filtroHorario !== 'TODOS') {
        if (filtroHorario === 'JOGOS') {
          const temJogos = caso.transacoes?.some((t) => t.isHorarioJogos);
          if (!temJogos) return false;
        } else if (filtroHorario === 'MADRUGADA') {
          const temMadrugada = caso.transacoes?.some((t) => t.faixaHorario === 'Madrugada');
          if (!temMadrugada) return false;
        } else if (filtroHorario === 'NOITE') {
          const temNoite = caso.transacoes?.some((t) => t.faixaHorario === 'Noite');
          if (!temNoite) return false;
        }
      }

      return true;
    });
  }, [
    casos,
    buscaTexto,
    filtroOrigemRecursos,
    filtroRegiaoPais,
    filtroFaixaRenda,
    filtroTempoAssociado,
    filtroFaixaIdade,
    filtroEstadoCivil,
    filtroHorario
  ]);

  const resetarFiltros = () => {
    setBuscaTexto('');
    setFiltroOrigemRecursos('TODOS');
    setFiltroRegiaoPais('TODOS');
    setFiltroFaixaRenda('TODOS');
    setFiltroTempoAssociado('TODOS');
    setFiltroFaixaIdade('TODOS');
    setFiltroEstadoCivil('TODOS');
    setFiltroHorario('TODOS');
    showToast('Filtros analíticos redefinidos.', 'info');
  };

  // --- DADOS PARA OS 7 GRÁFICOS SOLICITADOS ---

  // 1. Gráfico por Região
  const dadosPorRegiao = useMemo(() => {
    const map: Record<string, { regiao: string; quantidade: number; volume: number }> = {
      'Centro-Oeste': { regiao: 'Centro-Oeste', quantidade: 0, volume: 0 },
      'Sudeste': { regiao: 'Sudeste', quantidade: 0, volume: 0 },
      'Sul': { regiao: 'Sul', quantidade: 0, volume: 0 },
      'Nordeste': { regiao: 'Nordeste', quantidade: 0, volume: 0 },
      'Norte': { regiao: 'Norte', quantidade: 0, volume: 0 },
    };
    casosFiltrados.forEach((c) => {
      const r = c.regiaoPais || 'Centro-Oeste';
      if (!map[r]) map[r] = { regiao: r, quantidade: 0, volume: 0 };
      map[r].quantidade += 1;
      map[r].volume += (c.volumeAtipicoPeriodo || c.valorEnvolvido || 0) / 1000; // em mil R$
    });
    return Object.values(map);
  }, [casosFiltrados]);

  // 2. Gráfico por Idade
  const dadosPorIdade = useMemo(() => {
    const buckets = [
      { faixa: '18 a 25', quantidade: 0 },
      { faixa: '26 a 35', quantidade: 0 },
      { faixa: '36 a 50', quantidade: 0 },
      { faixa: '51 a 65', quantidade: 0 },
      { faixa: 'Acima de 65', quantidade: 0 },
    ];
    casosFiltrados.forEach((c) => {
      const id = c.idade || 35;
      if (id <= 25) buckets[0].quantidade++;
      else if (id <= 35) buckets[1].quantidade++;
      else if (id <= 50) buckets[2].quantidade++;
      else if (id <= 65) buckets[3].quantidade++;
      else buckets[4].quantidade++;
    });
    return buckets;
  }, [casosFiltrados]);

  // 3. Gráfico Quantidade/Volume por Pessoa (Top ranking)
  const dadosPorPessoa = useMemo(() => {
    const ranking = [...casosFiltrados]
      .sort((a, b) => (b.volumeAtipicoPeriodo || b.valorEnvolvido) - (a.volumeAtipicoPeriodo || a.valorEnvolvido))
      .slice(0, 6)
      .map((c) => ({
        nome: c.nome.split(' ').slice(0, 2).join(' '),
        volumeMil: Math.round((c.volumeAtipicoPeriodo || c.valorEnvolvido || 0) / 1000),
        score: c.scoreRisco,
        alertas: c.transacoes?.filter((t) => t.isSuspeita).length || 2
      }));
    return ranking;
  }, [casosFiltrados]);

  // 4. Gráfico por Faixa de Renda
  const dadosPorFaixaRenda = useMemo(() => {
    const buckets = [
      { faixa: 'Até R$ 3k', quantidade: 0, volumeMedioMil: 0 },
      { faixa: 'R$ 3k a 8k', quantidade: 0, volumeMedioMil: 0 },
      { faixa: 'R$ 8k a 20k', quantidade: 0, volumeMedioMil: 0 },
      { faixa: 'R$ 20k a 50k', quantidade: 0, volumeMedioMil: 0 },
      { faixa: '> R$ 50k', quantidade: 0, volumeMedioMil: 0 },
    ];
    casosFiltrados.forEach((c) => {
      const r = c.capacidadeFinanceira?.rendaDeclarada || c.renda || 0;
      if (r <= 3000) buckets[0].quantidade++;
      else if (r <= 8000) buckets[1].quantidade++;
      else if (r <= 20000) buckets[2].quantidade++;
      else if (r <= 50000) buckets[3].quantidade++;
      else buckets[4].quantidade++;
    });
    return buckets;
  }, [casosFiltrados]);

  // 5. Gráfico por Tempo de Associado na Cooperativa
  const dadosPorTempoAssociado = useMemo(() => {
    const buckets = [
      { tempo: '< 1 ano (Contas Recentes)', quantidade: 0, criticos: 0 },
      { tempo: '1 a 3 anos', quantidade: 0, criticos: 0 },
      { tempo: '3 a 5 anos', quantidade: 0, criticos: 0 },
      { tempo: '> 5 anos (Legado)', quantidade: 0, criticos: 0 },
    ];
    casosFiltrados.forEach((c) => {
      const m = c.tempoAssociadoMeses || 24;
      const isCritico = c.risco === 'Crítico' ? 1 : 0;
      if (m <= 12) {
        buckets[0].quantidade++;
        buckets[0].criticos += isCritico;
      } else if (m <= 36) {
        buckets[1].quantidade++;
        buckets[1].criticos += isCritico;
      } else if (m <= 60) {
        buckets[2].quantidade++;
        buckets[2].criticos += isCritico;
      } else {
        buckets[3].quantidade++;
        buckets[3].criticos += isCritico;
      }
    });
    return buckets;
  }, [casosFiltrados]);

  // 6. Gráfico por Estado Civil
  const dadosPorEstadoCivil = useMemo(() => {
    const map: Record<string, number> = {
      'Solteiro(a)': 0,
      'Casado(a)': 0,
      'Divorciado(a)': 0,
      'União Estável': 0,
      'Viúvo(a)': 0,
    };
    casosFiltrados.forEach((c) => {
      const ec = c.estadoCivil || c.kyc?.estadoCivil || 'Casado(a)';
      if (ec.includes('Solteiro')) map['Solteiro(a)']++;
      else if (ec.includes('Casado')) map['Casado(a)']++;
      else if (ec.includes('Divorciado')) map['Divorciado(a)']++;
      else if (ec.includes('União')) map['União Estável']++;
      else map['Viúvo(a)']++;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [casosFiltrados]);

  // 7. Gráfico de Transações em Determinados Horários (com destaque para Horários de Jogos)
  const dadosPorHorario = useMemo(() => {
    let madrugada = 0;
    let manha = 0;
    let tarde = 0;
    let noite = 0;
    let horarioJogos = 0;

    casosFiltrados.forEach((c) => {
      (c.transacoes || []).forEach((t) => {
        if (t.isHorarioJogos) horarioJogos++;
        if (t.faixaHorario === 'Madrugada') madrugada++;
        else if (t.faixaHorario === 'Manhã') manha++;
        else if (t.faixaHorario === 'Tarde') tarde++;
        else noite++;
      });
    });

    return [
      { horario: 'Madrugada (00h-06h)', transacoes: madrugada || 12 },
      { horario: 'Manhã (06h-12h)', transacoes: manha || 28 },
      { horario: 'Tarde (12h-18h)', transacoes: tarde || 44 },
      { horario: 'Noite (18h-24h)', transacoes: noite || 31 },
      { horario: '⚽ Horário de Jogos / Bets', transacoes: horarioJogos || 19 },
    ];
  }, [casosFiltrados]);

  // Criação de Monitoramento
  const handleCriarMonitoramento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoMonitor.nome) {
      showToast('Informe o nome do monitoramento.', 'warning');
      return;
    }

    const id = `MON-0${monitoramentos.length + 1}`;
    const criado: MonitoramentoCustomizado = {
      id,
      nome: novoMonitor.nome,
      tipo: novoMonitor.tipo as any,
      descricao: novoMonitor.descricao || 'Monitoramento customizado ativado pelo compliance.',
      parametros: novoMonitor.parametros || {},
      acaoAlerta: novoMonitor.acaoAlerta as any,
      status: 'ATIVO',
      totalDisparosMes: 0,
      criadoPor: 'Analista de Compliance',
      dataCriacao: new Date().toLocaleDateString('pt-BR')
    };

    const atualizados = [...monitoramentos, criado];
    setMonitoramentos(atualizados);
    try {
      localStorage.setItem('cooperforte_custom_monitors_v1', JSON.stringify(atualizados));
    } catch {
      // ignore
    }
    setIsCreatingMonitor(false);
    showToast(`Monitoramento "${criado.nome}" criado e ativo!`, 'success');
  };

  const handleToggleMonitor = (id: string) => {
    const atualizados = monitoramentos.map((m) =>
      m.id === id ? { ...m, status: (m.status === 'ATIVO' ? 'PAUSADO' : 'ATIVO') as any } : m
    );
    setMonitoramentos(atualizados);
    try {
      localStorage.setItem('cooperforte_custom_monitors_v1', JSON.stringify(atualizados));
    } catch {
      // ignore
    }
    showToast('Status do monitoramento atualizado.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Módulo Analítico Avançado & Inteligência
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Business Intelligence, Busca Analítica & Monitoramentos
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Painel multidimensional de conformidade com gráficos dinâmicos por região, idade, renda, estado civil, tempo de cooperativa, origem dos recursos e atipicidades em horários de jogos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-exportar-lote-bi"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar XML/CSV em Lote
          </button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            Filtros Multidimensionais de Análise
          </div>
          <button
            type="button"
            id="btn-limpar-filtros-bi"
            onClick={resetarFiltros}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {/* 1. Origem dos Recursos */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">Origem Recursos</label>
            <select
              value={filtroOrigemRecursos}
              onChange={(e) => setFiltroOrigemRecursos(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md py-1.5 px-2 bg-white focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todas Origens</option>
              <option value="SALARIO">Salário / Vencimentos</option>
              <option value="IMOVEIS">Venda de Imóveis</option>
              <option value="APOSTAS">Apostas / Jogos</option>
              <option value="EMPRESTIMOS">Empréstimos / Crédito</option>
              <option value="TERCEIROS">Contas de Terceiros</option>
              <option value="RURAL">Atividade Rural</option>
            </select>
          </div>

          {/* 2. Região do País */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">Região do País</label>
            <select
              value={filtroRegiaoPais}
              onChange={(e) => setFiltroRegiaoPais(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md py-1.5 px-2 bg-white focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todas Regiões</option>
              <option value="Centro-Oeste">Centro-Oeste</option>
              <option value="Sudeste">Sudeste</option>
              <option value="Sul">Sul</option>
              <option value="Nordeste">Nordeste</option>
              <option value="Norte">Norte</option>
            </select>
          </div>

          {/* 3. Faixa de Renda */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">Faixa de Renda</label>
            <select
              value={filtroFaixaRenda}
              onChange={(e) => setFiltroFaixaRenda(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md py-1.5 px-2 bg-white focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todas as Rendas</option>
              <option value="ATE_3K">Até R$ 3.000</option>
              <option value="3K_8K">R$ 3.000 a R$ 8.000</option>
              <option value="8K_20K">R$ 8.000 a R$ 20.000</option>
              <option value="20K_50K">R$ 20.000 a R$ 50.000</option>
              <option value="ACIMA_50K">Acima de R$ 50.000</option>
            </select>
          </div>

          {/* 4. Tempo de Associado */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">Tempo Cooperativa</label>
            <select
              value={filtroTempoAssociado}
              onChange={(e) => setFiltroTempoAssociado(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md py-1.5 px-2 bg-white focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todos os Tempos</option>
              <option value="ATE_1ANO">&lt; 1 ano (Recente)</option>
              <option value="1A3ANOS">1 a 3 anos</option>
              <option value="3A5ANOS">3 a 5 anos</option>
              <option value="MAIS_5ANOS">&gt; 5 anos</option>
            </select>
          </div>

          {/* 5. Faixa Etária / Idade */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">Faixa Etária</label>
            <select
              value={filtroFaixaIdade}
              onChange={(e) => setFiltroFaixaIdade(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md py-1.5 px-2 bg-white focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todas Idades</option>
              <option value="18_25">18 a 25 anos</option>
              <option value="26_35">26 a 35 anos</option>
              <option value="36_50">36 a 50 anos</option>
              <option value="51_65">51 a 65 anos</option>
              <option value="MAIS_65">65+ anos</option>
            </select>
          </div>

          {/* 6. Estado Civil */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">Estado Civil</label>
            <select
              value={filtroEstadoCivil}
              onChange={(e) => setFiltroEstadoCivil(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md py-1.5 px-2 bg-white focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todos</option>
              <option value="Solteiro">Solteiro(a)</option>
              <option value="Casado">Casado(a)</option>
              <option value="Divorciado">Divorciado(a)</option>
              <option value="União">União Estável</option>
              <option value="Viúvo">Viúvo(a)</option>
            </select>
          </div>

          {/* 7. Horário das Operações */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">Horário Operações</label>
            <select
              value={filtroHorario}
              onChange={(e) => setFiltroHorario(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-md py-1.5 px-2 bg-white focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="TODOS">Qualquer Horário</option>
              <option value="JOGOS">⚽ Horário de Jogos / Bets</option>
              <option value="MADRUGADA">Madrugada (00h-06h)</option>
              <option value="NOITE">Noite (18h-24h)</option>
            </select>
          </div>

          {/* 8. Busca Textual */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">Busca Rápida</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              <input
                type="text"
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                placeholder="Nome, CPF..."
                className="w-full text-xs border border-slate-300 rounded-md py-1.5 pl-7 pr-2 bg-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            type="button"
            id="tab-bi-graficos"
            onClick={() => setActiveTab('GRAFICOS')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'GRAFICOS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Painel Executivo de Gráficos BI (7 Dimensões)
          </button>

          <button
            type="button"
            id="tab-bi-busca"
            onClick={() => setActiveTab('BUSCA')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'BUSCA'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            Busca Analítica & Dossiês com Dispositivo ({casosFiltrados.length})
          </button>

          <button
            type="button"
            id="tab-bi-monitoramentos"
            onClick={() => setActiveTab('MONITORAMENTOS')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'MONITORAMENTOS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-600" />
            Monitoramentos Customizados & Jogos ({monitoramentos.length})
          </button>
        </div>

        <div className="text-xs text-slate-500 pb-3">
          Universo filtrado: <span className="font-bold text-slate-800">{casosFiltrados.length}</span> casos
        </div>
      </div>

      {/* ABA 1: GRÁFICOS BI */}
      {activeTab === 'GRAFICOS' && (
        <div className="space-y-6">
          {/* Linha 1: Região e Faixa Etária */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 1: Região */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">1. Distribuição de Casos por Região</h3>
                  <p className="text-xs text-slate-500">Volume acumulado (em Milhares de R$) e alertas</p>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  Macro-Regiões
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosPorRegiao}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="regiao" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      formatter={(val: any, name: string) => [
                        name === 'volume' ? `R$ ${val.toLocaleString('pt-BR')} mil` : `${val} casos`,
                        name === 'volume' ? 'Volume' : 'Casos'
                      ]}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="quantidade" name="Qtd. Casos" fill="#047857" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="volume" name="Volume (R$ mil)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Idade */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">2. Distribuição por Faixa Etária (Idade)</h3>
                  <p className="text-xs text-slate-500">Incidência de atipicidades cadastrais e transacionais</p>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  Idades
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosPorIdade}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="faixa" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      formatter={(val: any) => [`${val} pessoas`, 'Investigados']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                    <Bar dataKey="quantidade" name="Associados Investigados" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Linha 2: Quantidade/Volume por Pessoa e Faixa de Renda */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 3: Ranking por Pessoa */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">3. Concentração Financeira por Cooperado (Top 6)</h3>
                  <p className="text-xs text-slate-500">Volume transacionado (R$ mil) dos maiores investigados</p>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  Indivíduos
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosPorPessoa} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis dataKey="nome" type="category" stroke="#64748b" fontSize={11} width={110} />
                    <Tooltip
                      formatter={(val: any) => [`R$ ${val.toLocaleString('pt-BR')} mil`, 'Volume Financeiro']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                    <Bar dataKey="volumeMil" name="Volume (R$ mil)" fill="#d97706" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 4: Faixa de Renda */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">4. Alertas por Faixa de Renda Declarada</h3>
                  <p className="text-xs text-slate-500">Comparação da capacidade financeira mensal dos cooperados</p>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  Rendas
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosPorFaixaRenda}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="faixa" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      formatter={(val: any) => [`${val} investigados`, 'Quantidade']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                    <Bar dataKey="quantidade" name="Quantidade de Alertas" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Linha 3: Tempo de Cooperativa, Estado Civil e Horários (com Horário de Jogos) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico 5: Tempo de Associado */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">5. Tempo de Cooperativa</h3>
                  <p className="text-xs text-slate-500">Incidência em contas recentes vs antigas</p>
                </div>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosPorTempoAssociado}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="tempo" stroke="#64748b" fontSize={10} interval={0} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                    <Bar dataKey="quantidade" name="Total Alertas" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="criticos" name="Críticos" fill="#991b1b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 6: Estado Civil */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">6. Distribuição por Estado Civil</h3>
                  <p className="text-xs text-slate-500">Segmentação cadastral civil</p>
                </div>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPorEstadoCivil}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name.split('(')[0]}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {dadosPorEstadoCivil.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 7: Horários e Horários de Jogos */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs ring-1 ring-amber-200 bg-amber-50/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    7. Transações por Horários &amp; Jogos
                  </h3>
                  <p className="text-xs text-slate-500">Destaque para movimentações em rodadas esportivas</p>
                </div>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosPorHorario}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="horario" stroke="#64748b" fontSize={9} interval={0} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      formatter={(val: any) => [`${val} operações`, 'Transações']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                    <Bar dataKey="transacoes" name="Transações Auditadas" fill="#ea580c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: BUSCA ANALÍTICA & DOSSIÊS COM DISPOSITIVO */}
      {activeTab === 'BUSCA' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Resultados da Busca Analítica com Telemetria de Dispositivo
              </h3>
              <p className="text-xs text-slate-500">
                Cruzamento direto de dados cadastrais, geolocalização IP, score de fraude e alertas do aparelho
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {casosFiltrados.length} investigados encontrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Associado / CPF</th>
                  <th className="py-2.5 px-3">Dados Cadastrais (Idade / Civil)</th>
                  <th className="py-2.5 px-3">Origem Recursos &amp; Renda</th>
                  <th className="py-2.5 px-3">Dispositivo &amp; Telemetria</th>
                  <th className="py-2.5 px-3 text-center">Score Fraude Device</th>
                  <th className="py-2.5 px-3 text-right">Volume Atípico</th>
                  <th className="py-2.5 px-3 text-center">Score PLD</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {casosFiltrados.map((caso) => {
                  const device = caso.device;
                  const fraudScore = device?.scoreRiscoFraude || 0;

                  return (
                    <tr key={caso.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{caso.nome}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {caso.cpf} &bull; Matr: {caso.matricula}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {caso.kyc?.cidadeUf} ({caso.regiaoPais || 'Centro-Oeste'})
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">
                          {caso.idade} anos &bull; {caso.estadoCivil || 'Casado(a)'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {caso.tempoAssociadoMeses ? `${Math.round(caso.tempoAssociadoMeses / 12)} anos cooperado` : 'Cooperado pleno'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {caso.kyc?.profissao || caso.perfil}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">
                          {caso.origemRecursos || 'Salário / Vencimentos'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Renda: {formatCurrency(caso.capacidadeFinanceira?.rendaDeclarada || caso.renda)}
                        </div>
                        {caso.isPep && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            PEP ({caso.pepCargo || 'Exposto'})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[140px]">{device?.modelo || 'Samsung Galaxy'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          IP: {device?.ip || '189.28.114.92'}
                        </div>
                        {device?.notasAltas && device.notasAltas.length > 0 && (
                          <div className="text-[10px] text-red-600 font-semibold mt-0.5 flex items-center gap-1 truncate max-w-[180px]">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {device.notasAltas[0]}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                            fraudScore >= 75
                              ? 'bg-red-100 text-red-800 ring-1 ring-red-400'
                              : fraudScore >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {fraudScore}/100
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          {fraudScore >= 75 ? 'Crítico' : fraudScore >= 50 ? 'Moderado' : 'Seguro'}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(caso.volumeAtipicoPeriodo || caso.valorEnvolvido)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
                            caso.scoreRisco >= 85
                              ? 'bg-red-600 text-white'
                              : caso.scoreRisco >= 65
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {caso.scoreRisco}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCaseId(caso.id);
                            navigateTo('/investigacao');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold transition-colors"
                        >
                          Investigar <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: ÁREA DE NOVOS MONITORAMENTOS & JOGOS */}
      {activeTab === 'MONITORAMENTOS' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-600" />
                Criação e Gestão de Monitoramentos Customizados
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                Crie monitoramentos preditivos com critérios específicos (faixas de horário noturno, discrepância patrimonial de uma pessoa, transações atípicas em horário de jogos ou detecção de fraudes de dispositivo).
              </p>
            </div>

            <button
              type="button"
              id="btn-novo-monitoramento"
              onClick={() => setIsCreatingMonitor(!isCreatingMonitor)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Criar Novo Monitoramento
            </button>
          </div>

          {/* Form de Criação de Monitoramento */}
          {isCreatingMonitor && (
            <form
              onSubmit={handleCriarMonitoramento}
              className="bg-orange-50/40 border border-orange-200 rounded-xl p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-orange-200 pb-3">
                <h4 className="text-sm font-bold text-orange-950 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-600" />
                  Configurar Novo Monitoramento Ativo
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreatingMonitor(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Regra</label>
                  <input
                    type="text"
                    value={novoMonitor.nome}
                    onChange={(e) => setNovoMonitor({ ...novoMonitor, nome: e.target.value })}
                    placeholder="Ex: Monitor Noturno ou Alerta de Jogos"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Monitoramento</label>
                  <select
                    value={novoMonitor.tipo}
                    onChange={(e) => setNovoMonitor({ ...novoMonitor, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="FAIXA_HORARIO">Monitorar em Faixa de Horário (Noturno / Madrugada)</option>
                    <option value="HORARIO_JOGOS">⚽ Monitorar em Horário de Jogos / Rodadas Esportivas</option>
                    <option value="DISCREPANCIA_RENDA">Monitorar Discrepância de uma Pessoa / Renda</option>
                    <option value="DISPOSITIVO_ALTO_RISCO">Monitorar Dispositivo com Score Alto de Fraude</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ação ao Disparar</label>
                  <select
                    value={novoMonitor.acaoAlerta}
                    onChange={(e) => setNovoMonitor({ ...novoMonitor, acaoAlerta: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="GERAR_ALERTA_CRITICO">Gerar Alerta Crítico Imediato</option>
                    <option value="PONTUAR_SCORE_MENSAL">Acumular Pontos no Score Mensal (+35 pts)</option>
                    <option value="DILIGENCIA_AUTOMATICA">Instaurar Diligência Documental Automática</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário Inicial</label>
                  <input
                    type="time"
                    value={novoMonitor.parametros?.horarioInicio || '22:00'}
                    onChange={(e) =>
                      setNovoMonitor({
                        ...novoMonitor,
                        parametros: { ...novoMonitor.parametros, horarioInicio: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário Final</label>
                  <input
                    type="time"
                    value={novoMonitor.parametros?.horarioFim || '06:00'}
                    onChange={(e) =>
                      setNovoMonitor({
                        ...novoMonitor,
                        parametros: { ...novoMonitor.parametros, horarioFim: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Volume Mínimo (R$)</label>
                  <input
                    type="number"
                    value={novoMonitor.parametros?.volumeMinimo || 10000}
                    onChange={(e) =>
                      setNovoMonitor({
                        ...novoMonitor,
                        parametros: { ...novoMonitor.parametros, volumeMinimo: Number(e.target.value) }
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição / Justificativa Regulatória</label>
                <input
                  type="text"
                  value={novoMonitor.descricao}
                  onChange={(e) => setNovoMonitor({ ...novoMonitor, descricao: e.target.value })}
                  placeholder="Ex: Rastreamento preventivo de transferências suspeitas durante campeonatos esportivos"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingMonitor(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs"
                >
                  Salvar e Ativar Monitoramento
                </button>
              </div>
            </form>
          )}

          {/* Cards de Monitoramentos Ativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monitoramentos.map((mon) => (
              <div
                key={mon.id}
                className="p-5 rounded-xl border bg-white border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-lg bg-orange-100 text-orange-800">
                      {mon.tipo === 'HORARIO_JOGOS' ? (
                        <span className="text-base leading-none">⚽</span>
                      ) : mon.tipo === 'DISPOSITIVO_ALTO_RISCO' ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">{mon.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            mon.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {mon.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{mon.nome}</h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleMonitor(mon.id)}
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold border transition-colors ${
                      mon.status === 'ATIVO'
                        ? 'border-red-200 text-red-700 hover:bg-red-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {mon.status === 'ATIVO' ? 'Pausar' : 'Ativar'}
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{mon.descricao}</p>

                {/* Parameters pill box */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1 font-mono">
                  {mon.parametros.horarioInicio && (
                    <div>Horário: {mon.parametros.horarioInicio} às {mon.parametros.horarioFim}</div>
                  )}
                  {mon.parametros.volumeMinimo && (
                    <div>Corte de Volume: {formatCurrency(mon.parametros.volumeMinimo)}</div>
                  )}
                  {mon.parametros.scoreFraudeMinimo && (
                    <div>Score Mínimo de Fraude: {mon.parametros.scoreFraudeMinimo}/100</div>
                  )}
                  {mon.tipo === 'HORARIO_JOGOS' && (
                    <div className="text-orange-700 font-bold">⚽ Filtro: Rodadas de Futebol (Quartas e Domingos)</div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Total disparos no mês: <strong className="text-slate-800">{mon.totalDisparosMes}</strong></span>
                  <span>Criado por: {mon.criadoPor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Batch Export Modal Component */}
      <BatchExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        initialPeriod="08/2026"
      />
    </div>
  );
};
