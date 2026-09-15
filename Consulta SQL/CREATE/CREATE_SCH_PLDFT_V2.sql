-- ====================================================================================================
-- BANCO DE DADOS: GESIN / SQL SERVER 2019+
-- SCHEMA: SCH_PLDFT
-- ARQUIVO: CREATE_SCH_PLDFT_V2.sql
-- VERSÃO: 2.0 (Ficha Digital 100% em Banco de Dados - Modelo Acervo Permanente e Trilha de Auditoria)
-- AUTOR: Kauan Eiras / Compliance & TI PLD/FT
-- DATA: 04/09/2026
--
-- PRINCÍPIOS ARQUITETURAIS:
-- 1. Toda regra de negócio (seleção, cálculo, parecer sugerido, fluxo e encerramento) vive em Stored Procedures.
-- 2. Separação total entre staging (tabelas recalculáveis mensais) e acervo permanente (TB_Ficha e satélites).
-- 3. Parecer e Decisão GECAN são versionados (append-only), sem sobrescrita física destrutiva (RN-02, RN-09).
-- 4. Retrato cadastral no momento da seleção (TB_Ficha_SnapshotCadastral) preservado para auditoria (RN-02, RF-10).
-- 5. Trilha de auditoria contínua de status, reaberturas com justificativa obrigatória e logs de exportação.
-- ====================================================================================================

-- 1. CRIAÇÃO DO SCHEMA
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'SCH_PLDFT')
BEGIN
    EXEC('CREATE SCHEMA SCH_PLDFT');
    PRINT 'Schema [SCH_PLDFT] criado com sucesso.';
END
GO

-- ====================================================================================================
-- 2. TABELAS DE DOMÍNIO / CATÁLOGOS FIXOS E DIMENSÕES MESTRE
-- ====================================================================================================

-- 2.1 TB_Pessoa: Identidade do Associado (sem SCD; histórico cadastral fica no snapshot da ficha)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_Pessoa') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_Pessoa (
        id_pessoa           BIGINT IDENTITY(1,1) NOT NULL,
        cpf_cnpj            VARCHAR(18) NOT NULL,
        nome_completo       VARCHAR(200) NOT NULL,
        matricula           VARCHAR(30) NULL,
        inscricao           VARCHAR(30) NULL,
        tipo_pessoa         CHAR(1) NOT NULL DEFAULT 'F', -- F: Física, J: Jurídica
        data_cadastro       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        ativo               BIT NOT NULL DEFAULT 1,
        CONSTRAINT PK_TB_Pessoa PRIMARY KEY CLUSTERED (id_pessoa),
        CONSTRAINT UQ_TB_Pessoa_CpfCnpj UNIQUE (cpf_cnpj)
    );
    CREATE NONCLUSTERED INDEX IX_TB_Pessoa_Nome ON SCH_PLDFT.TB_Pessoa (nome_completo);
    CREATE NONCLUSTERED INDEX IX_TB_Pessoa_Inscricao ON SCH_PLDFT.TB_Pessoa (inscricao);
    PRINT 'Tabela [SCH_PLDFT.TB_Pessoa] criada com sucesso.';
END
GO

-- 2.2 TB_Analista: Analistas Operacionais e Compliance PLD/FT
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_Analista') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_Analista (
        id_analista         INT IDENTITY(1,1) NOT NULL,
        nome                VARCHAR(150) NOT NULL,
        email               VARCHAR(150) NOT NULL,
        matricula_funcional VARCHAR(30) NOT NULL,
        cargo               VARCHAR(100) NOT NULL DEFAULT 'Analista PLD/FT',
        area_atuacao        VARCHAR(100) NOT NULL DEFAULT 'GECON / GESIN - Conformidade',
        perfil_acesso       VARCHAR(30) NOT NULL DEFAULT 'ANALISTA', -- ANALISTA, GECAN_COMPLIANCE, AUDITOR_LEITURA, ADMIN
        iniciais            VARCHAR(5) NOT NULL,
        ativo               BIT NOT NULL DEFAULT 1,
        CONSTRAINT PK_TB_Analista PRIMARY KEY CLUSTERED (id_analista),
        CONSTRAINT UQ_TB_Analista_Email UNIQUE (email)
    );
    PRINT 'Tabela [SCH_PLDFT.TB_Analista] criada com sucesso.';
END
GO

-- 2.3 TB_TipoFicha: Operações vs. Conta Corrente
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_TipoFicha') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_TipoFicha (
        id_tipo_ficha       INT IDENTITY(1,1) NOT NULL,
        codigo_sigla        VARCHAR(20) NOT NULL, -- OPERACOES, CONTA_CORRENTE
        descricao           VARCHAR(100) NOT NULL,
        ativo               BIT NOT NULL DEFAULT 1,
        CONSTRAINT PK_TB_TipoFicha PRIMARY KEY CLUSTERED (id_tipo_ficha),
        CONSTRAINT UQ_TB_TipoFicha_Codigo UNIQUE (codigo_sigla)
    );
    PRINT 'Tabela [SCH_PLDFT.TB_TipoFicha] criada com sucesso.';
END
GO

-- 2.4 TB_StatusFicha: Status do Ciclo de Vida da Ficha (RF-04, RF-23, RF-39)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_StatusFicha') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_StatusFicha (
        id_status           INT IDENTITY(1,1) NOT NULL,
        codigo_status       VARCHAR(30) NOT NULL, -- PENDENTE, EM_ANALISE, EM_DILIGENCIA, CONCLUIDA, REABERTA
        descricao           VARCHAR(100) NOT NULL,
        is_pendente         BIT NOT NULL DEFAULT 1, -- 1: na fila de pendentes; 0: fora da fila de pendentes
        CONSTRAINT PK_TB_StatusFicha PRIMARY KEY CLUSTERED (id_status),
        CONSTRAINT UQ_TB_StatusFicha_Codigo UNIQUE (codigo_status)
    );
    PRINT 'Tabela [SCH_PLDFT.TB_StatusFicha] criada com sucesso.';
END
GO

-- 2.5 TB_MotivoAlerta: Catálogo de Motivos de Seleção (RF-05, RF-36, RF-41)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_MotivoAlerta') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_MotivoAlerta (
        id_motivo_alerta    INT IDENTITY(1,1) NOT NULL,
        codigo              VARCHAR(30) NOT NULL, -- PEP, REG_FRONT, REG_MINER, LIMOC, MENOR, FUNCI_COOPER, REC_TERCEIROS, CSNU, SMURFING, INCOMP_PATRIMONIAL
        titulo              VARCHAR(150) NOT NULL,
        categoria_agrupada  VARCHAR(50) NOT NULL,
        base_legal          VARCHAR(300) NULL, -- Referência normativa (norma + artigo, RF-41)
        descricao_alerta    VARCHAR(500) NULL,
        prioridade_padrao   VARCHAR(20) NOT NULL DEFAULT 'MEDIA', -- CRITICA, ALTA, MEDIA, BAIXA
        ativo               BIT NOT NULL DEFAULT 1,
        dt_criacao          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT PK_TB_MotivoAlerta PRIMARY KEY CLUSTERED (id_motivo_alerta),
        CONSTRAINT UQ_TB_MotivoAlerta_Codigo UNIQUE (codigo)
    );
    PRINT 'Tabela [SCH_PLDFT.TB_MotivoAlerta] criada com sucesso.';
END
GO

-- 2.6 TB_TipologiaCOAF: Catálogo de Tipologias do COAF/GAFI para comunicação (RF-44)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_TipologiaCOAF') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_TipologiaCOAF (
        id_tipologia        INT IDENTITY(1,1) NOT NULL,
        codigo_coaf         VARCHAR(30) NOT NULL, -- ex: '1.1.1', '1.1.3', '1.1.4'
        descricao           VARCHAR(300) NOT NULL,
        artigo_referencia   VARCHAR(150) NULL,
        ativo               BIT NOT NULL DEFAULT 1,
        CONSTRAINT PK_TB_TipologiaCOAF PRIMARY KEY CLUSTERED (id_tipologia),
        CONSTRAINT UQ_TB_TipologiaCOAF_Codigo UNIQUE (codigo_coaf)
    );
    PRINT 'Tabela [SCH_PLDFT.TB_TipologiaCOAF] criada com sucesso.';
END
GO

-- 2.7 TB_Remessa: Lote Mensal de Fichas (RF-01, RF-02, RF-03)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_Remessa') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_Remessa (
        id_remessa          BIGINT IDENTITY(1,1) NOT NULL,
        data_referencia     CHAR(7) NOT NULL, -- 'AAAA-MM' ou 'MM/AAAA'
        id_tipo_ficha       INT NOT NULL,
        dt_geracao          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        id_analista_gerador INT NULL,
        qtd_fichas_total    INT NOT NULL DEFAULT 0,
        qtd_fichas_novas    INT NOT NULL DEFAULT 0,
        qtd_ja_existentes   INT NOT NULL DEFAULT 0,
        status_remessa      VARCHAR(30) NOT NULL DEFAULT 'ABERTA', -- ABERTA, EM_ANDAMENTO, CONCLUIDA
        observacoes         VARCHAR(500) NULL,
        CONSTRAINT PK_TB_Remessa PRIMARY KEY CLUSTERED (id_remessa),
        CONSTRAINT FK_TB_Remessa_TipoFicha FOREIGN KEY (id_tipo_ficha) REFERENCES SCH_PLDFT.TB_TipoFicha(id_tipo_ficha),
        CONSTRAINT FK_TB_Remessa_Analista FOREIGN KEY (id_analista_gerador) REFERENCES SCH_PLDFT.TB_Analista(id_analista)
    );
    CREATE NONCLUSTERED INDEX IX_TB_Remessa_Ref ON SCH_PLDFT.TB_Remessa (data_referencia, id_tipo_ficha);
    PRINT 'Tabela [SCH_PLDFT.TB_Remessa] criada com sucesso.';
END
GO

-- ====================================================================================================
-- 3. TABELA HUB PRINCIPAL: TB_Ficha (A UNIDADE DE ANÁLISE PERMANENTE)
-- ====================================================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_Ficha') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_Ficha (
        id_ficha            BIGINT IDENTITY(1,1) NOT NULL,
        id_remessa          BIGINT NOT NULL,
        id_pessoa           BIGINT NOT NULL,
        id_tipo_ficha       INT NOT NULL,
        data_referencia     CHAR(7) NOT NULL, -- ex: '08/2026'
        id_status_corrente  INT NOT NULL,
        id_analista_atribuido INT NULL,
        score_risco         DECIMAL(5,2) NOT NULL DEFAULT 0.0,
        nivel_risco         VARCHAR(20) NOT NULL DEFAULT 'MEDIO', -- CRITICO, ALTO, MEDIO, BAIXO
        valor_total_analisado DECIMAL(18,2) NOT NULL DEFAULT 0.0,
        volume_atipico_periodo DECIMAL(18,2) NOT NULL DEFAULT 0.0,
        is_pep              BIT NOT NULL DEFAULT 0,
        is_csnu             BIT NOT NULL DEFAULT 0,
        is_limoc            BIT NOT NULL DEFAULT 0,
        is_coe_obrigatorio  BIT NOT NULL DEFAULT 0,
        categoria_dossie    VARCHAR(50) NOT NULL DEFAULT 'DEMAIS_RECURSO_PROPRIO',
        sla_horas_limite    INT NOT NULL DEFAULT 24,
        dt_criacao          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        dt_encerramento     DATETIME2 NULL,
        dt_ultima_alteracao DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT PK_TB_Ficha PRIMARY KEY CLUSTERED (id_ficha),
        CONSTRAINT FK_TB_Ficha_Remessa FOREIGN KEY (id_remessa) REFERENCES SCH_PLDFT.TB_Remessa(id_remessa),
        CONSTRAINT FK_TB_Ficha_Pessoa FOREIGN KEY (id_pessoa) REFERENCES SCH_PLDFT.TB_Pessoa(id_pessoa),
        CONSTRAINT FK_TB_Ficha_TipoFicha FOREIGN KEY (id_tipo_ficha) REFERENCES SCH_PLDFT.TB_TipoFicha(id_tipo_ficha),
        CONSTRAINT FK_TB_Ficha_Status FOREIGN KEY (id_status_corrente) REFERENCES SCH_PLDFT.TB_StatusFicha(id_status),
        CONSTRAINT FK_TB_Ficha_Analista FOREIGN KEY (id_analista_atribuido) REFERENCES SCH_PLDFT.TB_Analista(id_analista),
        CONSTRAINT UQ_TB_Ficha_Pessoa_Tipo_Mes UNIQUE (id_pessoa, id_tipo_ficha, data_referencia) -- RN-01
    );
    CREATE NONCLUSTERED INDEX IX_TB_Ficha_Status ON SCH_PLDFT.TB_Ficha (id_status_corrente) INCLUDE (id_pessoa, data_referencia);
    CREATE NONCLUSTERED INDEX IX_TB_Ficha_Analista ON SCH_PLDFT.TB_Ficha (id_analista_atribuido);
    PRINT 'Tabela [SCH_PLDFT.TB_Ficha] criada com sucesso.';
END
GO

-- 3.1 TB_Ficha_MotivoAlerta: Associação N:N entre Ficha e Motivos de Alerta
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_Ficha_MotivoAlerta') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_Ficha_MotivoAlerta (
        id_ficha_motivo     BIGINT IDENTITY(1,1) NOT NULL,
        id_ficha            BIGINT NOT NULL,
        id_motivo_alerta    INT NOT NULL,
        detalhe_disparo     VARCHAR(500) NULL,
        dt_associacao       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT PK_TB_Ficha_MotivoAlerta PRIMARY KEY CLUSTERED (id_ficha_motivo),
        CONSTRAINT FK_TB_FMA_Ficha FOREIGN KEY (id_ficha) REFERENCES SCH_PLDFT.TB_Ficha(id_ficha) ON DELETE CASCADE,
        CONSTRAINT FK_TB_FMA_Motivo FOREIGN KEY (id_motivo_alerta) REFERENCES SCH_PLDFT.TB_MotivoAlerta(id_motivo_alerta),
        CONSTRAINT UQ_TB_FMA_Ficha_Motivo UNIQUE (id_ficha, id_motivo_alerta)
    );
    PRINT 'Tabela [SCH_PLDFT.TB_Ficha_MotivoAlerta] criada com sucesso.';
END
GO

-- ====================================================================================================
-- 4. TABELAS SATÉLITES DE SNAPSHOT CADASTRAL, TRANSAÇÕES E RENDA (HISTÓRICO IMUTÁVEL DA SELEÇÃO)
-- ====================================================================================================

-- 4.1 TB_Ficha_SnapshotCadastral: Retrato fiel do associado no momento da análise (RF-09, RF-10, RN-02)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_Ficha_SnapshotCadastral') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_Ficha_SnapshotCadastral (
        id_snapshot         BIGINT IDENTITY(1,1) NOT NULL,
        id_ficha            BIGINT NOT NULL,
        renda_declarada     DECIMAL(18,2) NOT NULL DEFAULT 0.0,
        patrimonio_declarado DECIMAL(18,2) NOT NULL DEFAULT 0.0,
        profissao           VARCHAR(150) NULL,
        empresa_vinculo     VARCHAR(200) NULL,
        cnpj_fonte_pagadora VARCHAR(18) NULL,
        data_associacao     DATE NULL,
        idade               INT NULL,
        score_serasa        INT NULL,
        risco_bacen         VARCHAR(50) NULL,
        segmento_perfil_sigla VARCHAR(50) NULL, -- 'GESINla' corrigido para 'Sigla' na Fase 0
        segmento_descricao  VARCHAR(150) NULL,
        endereco_completo   VARCHAR(300) NULL,
        cidade_uf           VARCHAR(100) NULL,
        fator_geografico    VARCHAR(50) NULL, -- Fronteira, Mineração, Padrão
        limoc_ativo         BIT NOT NULL DEFAULT 0,
        limoc_valor_teto    DECIMAL(18,2) NULL,
        produtos_credito_ativos_json NVARCHAR(MAX) NULL, -- Lista de contratos ativos (RF-09)
        produtos_investimento_json   NVARCHAR(MAX) NULL, -- RDC, LCI ativos (RF-09)
        contas_vinculadas_json       NVARCHAR(MAX) NULL,
        dt_snapshot         DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT PK_TB_Ficha_SnapshotCadastral PRIMARY KEY CLUSTERED (id_snapshot),
        CONSTRAINT FK_TB_Snapshot_Ficha FOREIGN KEY (id_ficha) REFERENCES SCH_PLDFT.TB_Ficha(id_ficha) ON DELETE CASCADE,
        CONSTRAINT UQ_TB_Snapshot_Ficha UNIQUE (id_ficha)
    );
    PRINT 'Tabela [SCH_PLDFT.TB_Ficha_SnapshotCadastral] criada com sucesso.';
END
GO

-- 4.2 TB_Ficha_Transacao: Extrato de transações atípicas do mês (persistidas permanentemente)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_Ficha_Transacao') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_Ficha_Transacao (
        id_ficha_transacao  BIGINT IDENTITY(1,1) NOT NULL,
        id_ficha            BIGINT NOT NULL,
        id_transacao_legado VARCHAR(50) NULL,
        data_transacao      DATE NOT NULL,
        hora_transacao      TIME NULL,
        tipo_natureza       VARCHAR(20) NOT NULL, -- Crédito / Débito
        origem_descricao    VARCHAR(150) NULL,
        contraparte_nome    VARCHAR(200) NOT NULL,
        contraparte_cpf_cnpj VARCHAR(18) NULL,
        inscricao_origem    VARCHAR(30) NULL, -- Para construção do grafo de relacionamento (RF-48)
        inscricao_destino   VARCHAR(30) NULL, -- Para construção do grafo de relacionamento (RF-48)
        valor               DECIMAL(18,2) NOT NULL,
        saldo_posterior     DECIMAL(18,2) NULL,
        forma_realizacao    VARCHAR(50) NOT NULL DEFAULT 'PIX', -- PIX, TED, Boleto, Espécie, Débito
        categoria_analise   VARCHAR(100) NULL,
        is_suspeita         BIT NOT NULL DEFAULT 0,
        motivo_suspeita     VARCHAR(500) NULL,
        anotacao_analitica  VARCHAR(500) NULL,
        dt_registro         DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT PK_TB_Ficha_Transacao PRIMARY KEY CLUSTERED (id_ficha_transacao),
        CONSTRAINT FK_TB_Transacao_Ficha FOREIGN KEY (id_ficha) REFERENCES SCH_PLDFT.TB_Ficha(id_ficha) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX IX_TB_Ficha_Transacao_Ficha ON SCH_PLDFT.TB_Ficha_Transacao (id_ficha);
    CREATE NONCLUSTERED INDEX IX_TB_Ficha_Transacao_Inscricao ON SCH_PLDFT.TB_Ficha_Transacao (inscricao_origem, inscricao_destino);
    PRINT 'Tabela [SCH_PLDFT.TB_Ficha_Transacao] criada com sucesso.';
END
GO

-- 4.3 TB_Ficha_Renda: Rendas comprovadas e declaradas do associado
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_Ficha_Renda') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_Ficha_Renda (
        id_ficha_renda      BIGINT IDENTITY(1,1) NOT NULL,
        id_ficha            BIGINT NOT NULL,
        fonte_pagadora_nome VARCHAR(200) NOT NULL,
        cnpj_cpf_fonte      VARCHAR(18) NULL,
        tipo_renda          VARCHAR(100) NOT NULL, -- Salarial, Pró-Labore, Aluguel, Rural
        valor_mensal        DECIMAL(18,2) NOT NULL,
        data_inicio_vigencia DATE NULL,
        comprovante_tipo    VARCHAR(100) NULL, -- Holerite, IRPF, DECORE
        CONSTRAINT PK_TB_Ficha_Renda PRIMARY KEY CLUSTERED (id_ficha_renda),
        CONSTRAINT FK_TB_Renda_Ficha FOREIGN KEY (id_ficha) REFERENCES SCH_PLDFT.TB_Ficha(id_ficha) ON DELETE CASCADE
    );
    PRINT 'Tabela [SCH_PLDFT.TB_Ficha_Renda] criada com sucesso.';
END
GO

-- ====================================================================================================
-- 5. CHECKLIST GUIADO, VERSIONADO E RESPOSTAS (RF-12, RF-13, RF-14, RF-41, RF-42)
-- ====================================================================================================

-- 5.1 TB_ChecklistItem: Catálogo versionado de itens de checklist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_ChecklistItem') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_ChecklistItem (
        id_item             INT IDENTITY(1,1) NOT NULL,
        codigo_item         VARCHAR(30) NOT NULL, -- ex: 'PEP-01', 'GEO-02', 'KYC-01'
        categoria_publico   VARCHAR(50) NOT NULL, -- PEP, REGIAO_MINERACAO_FRONTEIRA, RECURSOS_TERCEIROS, MENOR, FUNCIONARIO, LIMOC, DEMAIS
        titulo_exigencia    VARCHAR(200) NOT NULL,
        descricao_detalhada VARCHAR(500) NOT NULL,
        base_legal          VARCHAR(300) NULL, -- Norma + Artigo regulatório (RF-41)
        obrigatorio         BIT NOT NULL DEFAULT 1,
        versao_item         INT NOT NULL DEFAULT 1,
        ativo               BIT NOT NULL DEFAULT 1,
        CONSTRAINT PK_TB_ChecklistItem PRIMARY KEY CLUSTERED (id_item),
        CONSTRAINT UQ_TB_ChecklistItem_Codigo_Versao UNIQUE (codigo_item, versao_item)
    );
    PRINT 'Tabela [SCH_PLDFT.TB_ChecklistItem] criada com sucesso.';
END
GO

-- 5.2 TB_Ficha_ChecklistResposta: Respostas do Checklist por Ficha (RF-42)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_Ficha_ChecklistResposta') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_Ficha_ChecklistResposta (
        id_resposta         BIGINT IDENTITY(1,1) NOT NULL,
        id_ficha            BIGINT NOT NULL,
        id_item             INT NOT NULL,
        status_resposta     VARCHAR(20) NOT NULL, -- CONFORME, PENDENTE, NAO_CONFORME, NAO_APLICAVEL
        origem_resposta     VARCHAR(15) NOT NULL DEFAULT 'MANUAL', -- AUTOMATICA (Sistema via banco) vs MANUAL (Analista) (RF-42)
        anexo_evidencia_doc VARCHAR(300) NULL, -- Nome do documento ou laudo anexado (RF-42)
        observacao_analista VARCHAR(1000) NULL,
        id_analista_validador INT NULL,
        dt_validacao        DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT PK_TB_Ficha_ChecklistResposta PRIMARY KEY CLUSTERED (id_resposta),
        CONSTRAINT FK_TB_ChecklistResp_Ficha FOREIGN KEY (id_ficha) REFERENCES SCH_PLDFT.TB_Ficha(id_ficha) ON DELETE CASCADE,
        CONSTRAINT FK_TB_ChecklistResp_Item FOREIGN KEY (id_item) REFERENCES SCH_PLDFT.TB_ChecklistItem(id_item),
        CONSTRAINT FK_TB_ChecklistResp_Analista FOREIGN KEY (id_analista_validador) REFERENCES SCH_PLDFT.TB_Analista(id_analista),
        CONSTRAINT UQ_TB_ChecklistResp_Ficha_Item UNIQUE (id_ficha, id_item)
    );
    PRINT 'Tabela [SCH_PLDFT.TB_Ficha_ChecklistResposta] criada com sucesso.';
END
GO

-- ====================================================================================================
-- 6. PARECER TÉCNICO VERSIONADO (APPEND-ONLY) E BIBLIOTECA DE SNIPPETS (RF-15 A RF-18, RF-43, RN-02, RN-09)
-- ====================================================================================================

-- 6.1 TB_Parecer: Histórico de Versões do Parecer com Comparação Side-by-Side (RN-02, RN-09, RF-18)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_Parecer') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_Parecer (
        id_parecer          BIGINT IDENTITY(1,1) NOT NULL,
        id_ficha            BIGINT NOT NULL,
        versao              INT NOT NULL DEFAULT 1,
        vigente             BIT NOT NULL DEFAULT 1, -- 1: versão ativa da ficha; 0: versões anteriores arquivadas
        texto_sugerido_automatico NVARCHAR(MAX) NOT NULL, -- Gerado por regra de stored procedure (RN-09, RF-18)
        texto_final         NVARCHAR(MAX) NOT NULL, -- Texto consolidado e editado pelo analista
        percentual_edicao_humana DECIMAL(5,2) NOT NULL DEFAULT 0.0, -- Percentual de alteração em relação ao sugerido
        id_analista_autor   INT NOT NULL,
        tipo_salvamento     VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO', -- RASCUNHO ou DEFINITIVO
        dt_criacao          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT PK_TB_Parecer PRIMARY KEY CLUSTERED (id_parecer),
        CONSTRAINT FK_TB_Parecer_Ficha FOREIGN KEY (id_ficha) REFERENCES SCH_PLDFT.TB_Ficha(id_ficha) ON DELETE CASCADE,
        CONSTRAINT FK_TB_Parecer_Analista FOREIGN KEY (id_analista_autor) REFERENCES SCH_PLDFT.TB_Analista(id_analista),
        CONSTRAINT UQ_TB_Parecer_Ficha_Versao UNIQUE (id_ficha, versao)
    );
    CREATE NONCLUSTERED INDEX IX_TB_Parecer_Ficha_Vigente ON SCH_PLDFT.TB_Parecer (id_ficha, vigente);
    PRINT 'Tabela [SCH_PLDFT.TB_Parecer] criada com sucesso.';
END
GO

-- 6.2 TB_ParecerSnippet: Biblioteca de trechos padronizados por categoria de alerta (RF-43)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_ParecerSnippet') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_ParecerSnippet (
        id_snippet          INT IDENTITY(1,1) NOT NULL,
        id_motivo_alerta    INT NULL,
        titulo              VARCHAR(150) NOT NULL,
        categoria_snippet   VARCHAR(50) NOT NULL,
        texto_padrao        NVARCHAR(MAX) NOT NULL,
        ativo               BIT NOT NULL DEFAULT 1,
        CONSTRAINT PK_TB_ParecerSnippet PRIMARY KEY CLUSTERED (id_snippet),
        CONSTRAINT FK_TB_Snippet_Motivo FOREIGN KEY (id_motivo_alerta) REFERENCES SCH_PLDFT.TB_MotivoAlerta(id_motivo_alerta)
    );
    PRINT 'Tabela [SCH_PLDFT.TB_ParecerSnippet] criada com sucesso.';
END
GO

-- ====================================================================================================
-- 7. DECISÃO GECAN / COMUNICAÇÃO AO COAF COM PRAZO REGULATÓRIO (RF-19 A RF-21, RF-44, RN-04, RN-07, RN-11)
-- ====================================================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_Decisao_GECAN') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_Decisao_GECAN (
        id_decisao          BIGINT IDENTITY(1,1) NOT NULL,
        id_ficha            BIGINT NOT NULL,
        versao_decisao      INT NOT NULL DEFAULT 1,
        vigente             BIT NOT NULL DEFAULT 1,
        decisao             VARCHAR(30) NOT NULL, -- 'SEM_OCORRENCIA' ou 'COMUNICAR_COAF' (RF-19)
        id_tipologia_coaf   INT NULL, -- Catálogo COAF/GAFI (RF-44)
        recomendacao_gecan  NVARCHAR(MAX) NULL, -- Recomendações em campo próprio (RF-21)
        justificativa_decisao NVARCHAR(MAX) NOT NULL,
        dt_decisao          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        dt_comunicacao_coaf DATETIME2 NULL, -- Data e hora efetiva da comunicação
        numero_protocolo_siscoaf VARCHAR(100) NULL, -- Protocolo gerado pelo SISCOAF
        prazo_limite_comunicacao DATETIME2 NULL, -- SLA regulatório (24h/regulatório) (RN-11)
        tempestiva          BIT NOT NULL DEFAULT 1, -- 1: comunicada dentro do prazo; 0: intempestiva
        sigilo_ativo        BIT NOT NULL DEFAULT 1, -- Vedação de dar ciência ao associado (RN-07)
        id_membro_gecan     INT NOT NULL,
        CONSTRAINT PK_TB_Decisao_GECAN PRIMARY KEY CLUSTERED (id_decisao),
        CONSTRAINT FK_TB_Decisao_Ficha FOREIGN KEY (id_ficha) REFERENCES SCH_PLDFT.TB_Ficha(id_ficha) ON DELETE CASCADE,
        CONSTRAINT FK_TB_Decisao_Tipologia FOREIGN KEY (id_tipologia_coaf) REFERENCES SCH_PLDFT.TB_TipologiaCOAF(id_tipologia),
        CONSTRAINT FK_TB_Decisao_Analista FOREIGN KEY (id_membro_gecan) REFERENCES SCH_PLDFT.TB_Analista(id_analista)
    );
    CREATE NONCLUSTERED INDEX IX_TB_Decisao_Ficha_Vigente ON SCH_PLDFT.TB_Decisao_GECAN (id_ficha, vigente);
    PRINT 'Tabela [SCH_PLDFT.TB_Decisao_GECAN] criada com sucesso.';
END
GO

-- ====================================================================================================
-- 8. TRILHA DE AUDITORIA CONTÍNUA E LOG DE EXPORTAÇÕES (RF-24, RF-25, RF-33, RN-05, RNF-06)
-- ====================================================================================================

-- 8.1 TB_Ficha_StatusHistorico: Log Append-Only de todas as transições de status e reaberturas
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_Ficha_StatusHistorico') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_Ficha_StatusHistorico (
        id_historico        BIGINT IDENTITY(1,1) NOT NULL,
        id_ficha            BIGINT NOT NULL,
        id_status_anterior  INT NULL,
        id_status_novo      INT NOT NULL,
        id_analista         INT NOT NULL,
        dt_transicao        DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        justificativa       VARCHAR(1000) NULL, -- Obrigatória em reaberturas (RN-05, RF-24)
        detalhes_auditoria  VARCHAR(500) NULL,
        CONSTRAINT PK_TB_Ficha_StatusHistorico PRIMARY KEY CLUSTERED (id_historico),
        CONSTRAINT FK_TB_Hist_Ficha FOREIGN KEY (id_ficha) REFERENCES SCH_PLDFT.TB_Ficha(id_ficha) ON DELETE CASCADE,
        CONSTRAINT FK_TB_Hist_StatusAnt FOREIGN KEY (id_status_anterior) REFERENCES SCH_PLDFT.TB_StatusFicha(id_status),
        CONSTRAINT FK_TB_Hist_StatusNovo FOREIGN KEY (id_status_novo) REFERENCES SCH_PLDFT.TB_StatusFicha(id_status),
        CONSTRAINT FK_TB_Hist_Analista FOREIGN KEY (id_analista) REFERENCES SCH_PLDFT.TB_Analista(id_analista)
    );
    CREATE NONCLUSTERED INDEX IX_TB_Hist_Ficha ON SCH_PLDFT.TB_Ficha_StatusHistorico (id_ficha, dt_transicao);
    PRINT 'Tabela [SCH_PLDFT.TB_Ficha_StatusHistorico] criada com sucesso.';
END
GO

-- 8.2 TB_ExportacaoLog: Registro obrigatório de exportações PDF/CSV/XML (RF-33, RNF-06)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SCH_PLDFT.TB_ExportacaoLog') AND type in (N'U'))
BEGIN
    CREATE TABLE SCH_PLDFT.TB_ExportacaoLog (
        id_log              BIGINT IDENTITY(1,1) NOT NULL,
        id_ficha            BIGINT NULL, -- Nulo caso seja exportação de lote/busca geral
        formato             VARCHAR(10) NOT NULL, -- 'PDF', 'CSV', 'XML'
        filtro_aplicado     VARCHAR(500) NULL,
        id_analista         INT NOT NULL,
        dt_exportacao       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        ip_origem           VARCHAR(50) NULL,
        finalidade          VARCHAR(200) NOT NULL DEFAULT 'Consulta de Auditoria / Fiscalização',
        CONSTRAINT PK_TB_ExportacaoLog PRIMARY KEY CLUSTERED (id_log),
        CONSTRAINT FK_TB_ExportLog_Ficha FOREIGN KEY (id_ficha) REFERENCES SCH_PLDFT.TB_Ficha(id_ficha) ON DELETE SET NULL,
        CONSTRAINT FK_TB_ExportLog_Analista FOREIGN KEY (id_analista) REFERENCES SCH_PLDFT.TB_Analista(id_analista)
    );
    PRINT 'Tabela [SCH_PLDFT.TB_ExportacaoLog] criada com sucesso.';
END
GO

-- ====================================================================================================
-- 9. CARGA INICIAL DE CATÁLOGOS BASE (IDEMPOTENTE)
-- ====================================================================================================

-- 9.1 Tipos de Ficha
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_TipoFicha WHERE codigo_sigla = 'OPERACOES')
    INSERT INTO SCH_PLDFT.TB_TipoFicha (codigo_sigla, descricao) VALUES ('OPERACOES', 'Ficha de Operações (Crédito, Investimentos e Garantias)');
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_TipoFicha WHERE codigo_sigla = 'CONTA_CORRENTE')
    INSERT INTO SCH_PLDFT.TB_TipoFicha (codigo_sigla, descricao) VALUES ('CONTA_CORRENTE', 'Ficha de Conta Corrente / Digital (Movimentação Transacional)');

-- 9.2 Status de Ficha
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_StatusFicha WHERE codigo_status = 'PENDENTE')
    INSERT INTO SCH_PLDFT.TB_StatusFicha (codigo_status, descricao, is_pendente) VALUES ('PENDENTE', 'Pendente de Triagem', 1);
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_StatusFicha WHERE codigo_status = 'EM_ANALISE')
    INSERT INTO SCH_PLDFT.TB_StatusFicha (codigo_status, descricao, is_pendente) VALUES ('EM_ANALISE', 'Em Análise pelo Analista', 1);
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_StatusFicha WHERE codigo_status = 'EM_DILIGENCIA')
    INSERT INTO SCH_PLDFT.TB_StatusFicha (codigo_status, descricao, is_pendente) VALUES ('EM_DILIGENCIA', 'Em Diligência (Aguardando Evidência)', 1);
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_StatusFicha WHERE codigo_status = 'CONCLUIDA')
    INSERT INTO SCH_PLDFT.TB_StatusFicha (codigo_status, descricao, is_pendente) VALUES ('CONCLUIDA', 'Concluída / Encerrada', 0);
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_StatusFicha WHERE codigo_status = 'REABERTA')
    INSERT INTO SCH_PLDFT.TB_StatusFicha (codigo_status, descricao, is_pendente) VALUES ('REABERTA', 'Reaberta para Complementação', 1);

-- 9.3 Motivos de Alerta com Base Legal (RF-41)
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_MotivoAlerta WHERE codigo = 'PEP')
    INSERT INTO SCH_PLDFT.TB_MotivoAlerta (codigo, titulo, categoria_agrupada, base_legal, descricao_alerta, prioridade_padrao)
    VALUES ('PEP', 'Pessoa Exposta Politicamente & Familiares', 'Pessoas de Alto Risco', 'Art. 25 a 29 da Circular BACEN 3.978/2020 e Resolução COAF nº 40/2021', 'Diligência reforçada obrigatória, comprovação de origem da riqueza e aprovação da Diretoria.', 'CRITICA');

IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_MotivoAlerta WHERE codigo = 'REG_FRONT')
    INSERT INTO SCH_PLDFT.TB_MotivoAlerta (codigo, titulo, categoria_agrupada, base_legal, descricao_alerta, prioridade_padrao)
    VALUES ('REG_FRONT', 'Região de Faixa de Fronteira Internacional', 'Fator Geográfico', 'Circular BACEN 3.978/2020 (Avaliação Interna de Risco Geográfico)', 'Vigilância geográfica especial para prevenção a contrabando, evasão e tráfico.', 'ALTA');

IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_MotivoAlerta WHERE codigo = 'REG_MINER')
    INSERT INTO SCH_PLDFT.TB_MotivoAlerta (codigo, titulo, categoria_agrupada, base_legal, descricao_alerta, prioridade_padrao)
    VALUES ('REG_MINER', 'Polo de Mineração e Garimpo de Metais Preciosos', 'Fator Geográfico', 'Carta-Circular BACEN 4.001/20 e Orientações COAF/PF Garimpo Ilegal', 'Checagem de licenças ambientais, notas fiscais com DTVM e combate ao ouro ilegal.', 'CRITICA');

IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_MotivoAlerta WHERE codigo = 'REC_TERCEIROS')
    INSERT INTO SCH_PLDFT.TB_MotivoAlerta (codigo, titulo, categoria_agrupada, base_legal, descricao_alerta, prioridade_padrao)
    VALUES ('REC_TERCEIROS', 'Recursos de Terceiros e Interposta Pessoa / Procuração', 'Comportamental', 'IN RFB nº 2.119/2022 e Carta-Circular BACEN 4.001/2020', 'Identificação rigorosa do Beneficiário Final (UBO) e justificativa comercial de representação.', 'ALTA');

IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_MotivoAlerta WHERE codigo = 'MENOR')
    INSERT INTO SCH_PLDFT.TB_MotivoAlerta (codigo, titulo, categoria_agrupada, base_legal, descricao_alerta, prioridade_padrao)
    VALUES ('MENOR', 'Conta de Menor de Idade / Adolescente', 'Vulnerabilidade', 'Código Civil Brasileiro e Art. 13 da Circular BACEN 3.978/2020', 'Verificação de compatibilidade com a capacidade econômico-financeira dos pais e tutores legais.', 'MEDIA');

IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_MotivoAlerta WHERE codigo = 'FUNCI_COOPER')
    INSERT INTO SCH_PLDFT.TB_MotivoAlerta (codigo, titulo, categoria_agrupada, base_legal, descricao_alerta, prioridade_padrao)
    VALUES ('FUNCI_COOPER', 'Colaborador / Funcionário da Cooperativa', 'Risco Interno', 'Código de Conduta Ética e Circular BACEN 3.978/2020 (Monitoramento de Pessoas Internas)', 'Mitigação de fraude interna, cruzamento de folha de pagamento e declaração de conflito de interesses.', 'ALTA');

IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_MotivoAlerta WHERE codigo = 'LIMOC')
    INSERT INTO SCH_PLDFT.TB_MotivoAlerta (codigo, titulo, categoria_agrupada, base_legal, descricao_alerta, prioridade_padrao)
    VALUES ('LIMOC', 'Associado sob Monitoramento Condicionado (LIMOC)', 'Crédito & Risco', 'Política Institucional PLD/FT e Critérios de Apetite de Risco', 'Dossiê focado em histórico de alertas, atas de comitê e controle de limites reduzidos.', 'ALTA');

IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_MotivoAlerta WHERE codigo = 'CSNU')
    INSERT INTO SCH_PLDFT.TB_MotivoAlerta (codigo, titulo, categoria_agrupada, base_legal, descricao_alerta, prioridade_padrao)
    VALUES ('CSNU', 'Sanções do Conselho de Segurança da ONU (Terrorismo)', 'Pessoas de Alto Risco', 'Lei Federal nº 13.810/2019 e Resolução BCB nº 44', 'Indisponibilidade cautelar imediata de ativos e comunicação às autoridades sem prévio aviso.', 'CRITICA');

-- 9.4 Tipologias COAF/GAFI (RF-44)
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_TipologiaCOAF WHERE codigo_coaf = '1.1.1')
    INSERT INTO SCH_PLDFT.TB_TipologiaCOAF (codigo_coaf, descricao, artigo_referencia)
    VALUES ('1.1.1', 'Movimentação financeira incompatível com o patrimônio, faturamento ou renda declarada', 'Carta-Circular BACEN 4.001/20, Item 1.1.1');
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_TipologiaCOAF WHERE codigo_coaf = '1.1.2')
    INSERT INTO SCH_PLDFT.TB_TipologiaCOAF (codigo_coaf, descricao, artigo_referencia)
    VALUES ('1.1.2', 'Artifício para burla dos limites de comunicação regulatória ao COAF / SISCOAF', 'Carta-Circular BACEN 4.001/20, Item 1.1.2');
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_TipologiaCOAF WHERE codigo_coaf = '1.1.3')
    INSERT INTO SCH_PLDFT.TB_TipologiaCOAF (codigo_coaf, descricao, artigo_referencia)
    VALUES ('1.1.3', 'Depósitos ou saques em espécie fracionados de forma estruturada (Smurfing)', 'Circular BACEN 3.978/2020 Art. 38, Inciso I');
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_TipologiaCOAF WHERE codigo_coaf = '1.1.4')
    INSERT INTO SCH_PLDFT.TB_TipologiaCOAF (codigo_coaf, descricao, artigo_referencia)
    VALUES ('1.1.4', 'Movimentação expressiva envolvendo Pessoa Exposta Politicamente (PEP) ou familiares', 'Resolução COAF nº 40/2021');
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_TipologiaCOAF WHERE codigo_coaf = '1.1.5')
    INSERT INTO SCH_PLDFT.TB_TipologiaCOAF (codigo_coaf, descricao, artigo_referencia)
    VALUES ('1.1.5', 'Utilização de conta de passagem (pass-through) com rápida drenagem e saldo residual nulo', 'Circular BACEN 3.978/2020 Art. 38, Inciso V');
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_TipologiaCOAF WHERE codigo_coaf = '1.1.8')
    INSERT INTO SCH_PLDFT.TB_TipologiaCOAF (codigo_coaf, descricao, artigo_referencia)
    VALUES ('1.1.8', 'Amortização ou liquidação substancial de passivos com recursos sem lastro idôneo', 'Carta-Circular BACEN 4.001/20, Item 1.1.8');
IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_TipologiaCOAF WHERE codigo_coaf = '1.1.9')
    INSERT INTO SCH_PLDFT.TB_TipologiaCOAF (codigo_coaf, descricao, artigo_referencia)
    VALUES ('1.1.9', 'Operações em municípios de Faixa de Fronteira ou Polos de Mineração/Garimpo sem lastro', 'Diretrizes COAF / Polícia Federal');
GO

-- ====================================================================================================
-- 10. STORED PROCEDURES DE NEGÓCIO (CENTRALIZADAS NO BANCO)
-- ====================================================================================================

-- 10.1 STP_PLDFT_GERAR_REMESSA: Cria lote mensal e fichas a partir do staging (RF-01, RF-02, RF-03)
CREATE OR ALTER PROCEDURE SCH_PLDFT.STP_PLDFT_GERAR_REMESSA
    @p_data_referencia CHAR(7),       -- '08/2026'
    @p_tipo_ficha_sigla VARCHAR(20),  -- 'OPERACOES' ou 'CONTA_CORRENTE'
    @p_id_analista_gerador INT = NULL,
    @p_id_remessa_saida BIGINT OUTPUT,
    @p_qtd_criadas INT OUTPUT,
    @p_qtd_ja_existentes INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @v_id_tipo_ficha INT;
    DECLARE @v_id_status_pendente INT;

    SELECT @v_id_tipo_ficha = id_tipo_ficha FROM SCH_PLDFT.TB_TipoFicha WHERE codigo_sigla = @p_tipo_ficha_sigla;
    IF @v_id_tipo_ficha IS NULL
    BEGIN
        RAISERROR('Tipo de ficha inválido informado: %s', 16, 1, @p_tipo_ficha_sigla);
        RETURN;
    END

    SELECT @v_id_status_pendente = id_status FROM SCH_PLDFT.TB_StatusFicha WHERE codigo_status = 'PENDENTE';

    BEGIN TRANSACTION;

    -- 1. Cria cabeçalho da remessa
    INSERT INTO SCH_PLDFT.TB_Remessa (data_referencia, id_tipo_ficha, id_analista_gerador, status_remessa)
    VALUES (@p_data_referencia, @v_id_tipo_ficha, @p_id_analista_gerador, 'EM_ANDAMENTO');

    SET @p_id_remessa_saida = SCOPE_IDENTITY();
    SET @p_qtd_criadas = 0;
    SET @p_qtd_ja_existentes = 0;

    -- 2. Seleção a partir do Staging (Exemplo com tabela de staging existente TB_PLDFT_ANALISE)
    -- Assegura Idempotência (RF-02): Insere apenas pessoas que ainda não possuem ficha no mês/tipo
    -- Para fins de demonstração estruturada de produção:
    /*
    INSERT INTO SCH_PLDFT.TB_Ficha (
        id_remessa, id_pessoa, id_tipo_ficha, data_referencia, id_status_corrente,
        score_risco, nivel_risco, valor_total_analisado, volume_atipico_periodo,
        is_pep, is_csnu, is_limoc, categoria_dossie, dt_criacao, dt_ultima_alteracao
    )
    SELECT
        @p_id_remessa_saida, p.id_pessoa, @v_id_tipo_ficha, @p_data_referencia, @v_id_status_pendente,
        stg.score_calculado, stg.nivel_risco, stg.valor_total, stg.volume_atipico,
        stg.flag_pep, stg.flag_csnu, stg.flag_limoc, stg.categoria_dossie, SYSDATETIME(), SYSDATETIME()
    FROM SCH_PLDFT.TB_PLDFT_ANALISE stg
    JOIN SCH_PLDFT.TB_Pessoa p ON p.cpf_cnpj = stg.cpf_cnpj
    WHERE stg.data_referencia = @p_data_referencia
      AND NOT EXISTS (
          SELECT 1 FROM SCH_PLDFT.TB_Ficha f
          WHERE f.id_pessoa = p.id_pessoa
            AND f.id_tipo_ficha = @v_id_tipo_ficha
            AND f.data_referencia = @p_data_referencia
      );
    */

    COMMIT TRANSACTION;
    PRINT 'Remessa gerada com sucesso. ID: ' + CAST(@p_id_remessa_saida AS VARCHAR(20));
END
GO

-- 10.2 STP_PLDFT_SALVAR_PARECER_VERSAO: Salva nova versão do parecer garantindo rastreabilidade (RF-18, RN-02, RN-09)
CREATE OR ALTER PROCEDURE SCH_PLDFT.STP_PLDFT_SALVAR_PARECER_VERSAO
    @p_id_ficha BIGINT,
    @p_texto_automatico NVARCHAR(MAX),
    @p_texto_final NVARCHAR(MAX),
    @p_percentual_edicao DECIMAL(5,2),
    @p_id_analista INT,
    @p_tipo_salvamento VARCHAR(20) = 'RASCUNHO',
    @p_nova_versao_saida INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @v_ultima_versao INT = 0;

    SELECT @v_ultima_versao = ISNULL(MAX(versao), 0)
    FROM SCH_PLDFT.TB_Parecer
    WHERE id_ficha = @p_id_ficha;

    SET @p_nova_versao_saida = @v_ultima_versao + 1;

    BEGIN TRANSACTION;

    -- Desmarca vigência da versão anterior
    UPDATE SCH_PLDFT.TB_Parecer
    SET vigente = 0
    WHERE id_ficha = @p_id_ficha AND vigente = 1;

    -- Insere nova versão (Append-only)
    INSERT INTO SCH_PLDFT.TB_Parecer (
        id_ficha, versao, vigente, texto_sugerido_automatico,
        texto_final, percentual_edicao_humana, id_analista_autor,
        tipo_salvamento, dt_criacao
    )
    VALUES (
        @p_id_ficha, @p_nova_versao_saida, 1, @p_texto_automatico,
        @p_texto_final, @p_percentual_edicao, @p_id_analista,
        @p_tipo_salvamento, SYSDATETIME()
    );

    -- Atualiza data de última alteração da ficha
    UPDATE SCH_PLDFT.TB_Ficha
    SET dt_ultima_alteracao = SYSDATETIME()
    WHERE id_ficha = @p_id_ficha;

    COMMIT TRANSACTION;
END
GO

-- 10.3 STP_PLDFT_ENCERRAR_FICHA: Valida e encerra formalmente a ficha, tirando-a da fila (RF-23, RN-03)
CREATE OR ALTER PROCEDURE SCH_PLDFT.STP_PLDFT_ENCERRAR_FICHA
    @p_id_ficha BIGINT,
    @p_id_analista INT,
    @p_decisao VARCHAR(30), -- 'SEM_OCORRENCIA' ou 'COMUNICAR_COAF'
    @p_id_tipologia_coaf INT = NULL,
    @p_recomendacao_gecan NVARCHAR(MAX) = NULL,
    @p_justificativa NVARCHAR(MAX),
    @p_numero_protocolo_siscoaf VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @v_id_status_concluida INT;
    DECLARE @v_id_status_atual INT;

    SELECT @v_id_status_concluida = id_status FROM SCH_PLDFT.TB_StatusFicha WHERE codigo_status = 'CONCLUIDA';
    SELECT @v_id_status_atual = id_status_corrente FROM SCH_PLDFT.TB_Ficha WHERE id_ficha = @p_id_ficha;

    -- Validação: deve ter parecer salvo
    IF NOT EXISTS (SELECT 1 FROM SCH_PLDFT.TB_Parecer WHERE id_ficha = @p_id_ficha AND vigente = 1)
    BEGIN
        RAISERROR('Não é permitido encerrar ficha sem parecer vigente gravado.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    -- 1. Grava Decisão GECAN
    INSERT INTO SCH_PLDFT.TB_Decisao_GECAN (
        id_ficha, versao_decisao, vigente, decisao, id_tipologia_coaf,
        recomendacao_gecan, justificativa_decisao, dt_decisao,
        dt_comunicacao_coaf, numero_protocolo_siscoaf, prazo_limite_comunicacao,
        tempestiva, sigilo_ativo, id_membro_gecan
    )
    VALUES (
        @p_id_ficha, 1, 1, @p_decisao, @p_id_tipologia_coaf,
        @p_recomendacao_gecan, @p_justificativa, SYSDATETIME(),
        CASE WHEN @p_decisao = 'COMUNICAR_COAF' THEN SYSDATETIME() ELSE NULL END,
        @p_numero_protocolo_siscoaf,
        DATEADD(HOUR, 24, SYSDATETIME()), 1, 1, @p_id_analista
    );

    -- 2. Muda Status da Ficha para Concluída (tira da fila de pendentes)
    UPDATE SCH_PLDFT.TB_Ficha
    SET id_status_corrente = @v_id_status_concluida,
        dt_encerramento = SYSDATETIME(),
        dt_ultima_alteracao = SYSDATETIME()
    WHERE id_ficha = @p_id_ficha;

    -- 3. Registra na trilha de auditoria
    INSERT INTO SCH_PLDFT.TB_Ficha_StatusHistorico (
        id_ficha, id_status_anterior, id_status_novo, id_analista,
        dt_transicao, justificativa, detalhes_auditoria
    )
    VALUES (
        @p_id_ficha, @v_id_status_atual, @v_id_status_concluida, @p_id_analista,
        SYSDATETIME(), @p_justificativa, 'Ficha deliberada e encerrada com sucesso.'
    );

    COMMIT TRANSACTION;
END
GO

-- 10.4 STP_PLDFT_REABRIR_FICHA: Reabre ficha concluída mediante justificativa auditável (RF-24, RN-05)
CREATE OR ALTER PROCEDURE SCH_PLDFT.STP_PLDFT_REABRIR_FICHA
    @p_id_ficha BIGINT,
    @p_id_analista INT,
    @p_justificativa VARCHAR(1000)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF LTRIM(RTRIM(ISNULL(@p_justificativa, ''))) = ''
    BEGIN
        RAISERROR('A justificativa de reabertura é estritamente obrigatória por exigência de auditoria.', 16, 1);
        RETURN;
    END

    DECLARE @v_id_status_reaberta INT;
    DECLARE @v_id_status_atual INT;

    SELECT @v_id_status_reaberta = id_status FROM SCH_PLDFT.TB_StatusFicha WHERE codigo_status = 'REABERTA';
    SELECT @v_id_status_atual = id_status_corrente FROM SCH_PLDFT.TB_Ficha WHERE id_ficha = @p_id_ficha;

    BEGIN TRANSACTION;

    UPDATE SCH_PLDFT.TB_Ficha
    SET id_status_corrente = @v_id_status_reaberta,
        dt_encerramento = NULL,
        dt_ultima_alteracao = SYSDATETIME()
    WHERE id_ficha = @p_id_ficha;

    INSERT INTO SCH_PLDFT.TB_Ficha_StatusHistorico (
        id_ficha, id_status_anterior, id_status_novo, id_analista,
        dt_transicao, justificativa, detalhes_auditoria
    )
    VALUES (
        @p_id_ficha, @v_id_status_atual, @v_id_status_reaberta, @p_id_analista,
        SYSDATETIME(), @p_justificativa, 'Reabertura formal de ficha para revisão/complementação de diligência.'
    );

    COMMIT TRANSACTION;
END
GO
