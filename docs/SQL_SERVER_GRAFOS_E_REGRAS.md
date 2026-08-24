# Implementação das Funções de Grafos e Regras no Microsoft SQL Server

Este documento contém o guia prático e scripts DDL/DML prontos para execução em **Microsoft SQL Server (2017, 2019, 2022 ou Azure SQL)** para suportar o motor de regras de PLD/FT e análise de redes transacionais.

---

## 1. Modelo de Tabelas Relacionais & Grafos

```sql
-- Criação do Banco de Dados
CREATE DATABASE PLD_Cooperativa;
GO

USE PLD_Cooperativa;
GO

-- 1. Tabela Cadastral de Clientes/Cooperados (com campos de Resolução de Entidades)
CREATE TABLE Clientes (
    ClienteID INT IDENTITY(1,1) PRIMARY KEY,
    CPF_CNPJ VARCHAR(14) NOT NULL UNIQUE,
    Nome VARCHAR(150) NOT NULL,
    RendaDeclarada DECIMAL(18,2) NOT NULL,
    EnderecoNormalizado VARCHAR(255) NOT NULL,
    Cidade VARCHAR(100) NOT NULL,
    UF CHAR(2) NOT NULL,
    IsFronteira BIT DEFAULT 0,
    IsMineracao BIT DEFAULT 0,
    IsPEP BIT DEFAULT 0,
    IsCSNU BIT DEFAULT 0,
    DeviceHash VARCHAR(64) NULL,
    Telefone VARCHAR(20) NULL,
    NotificacoesPixDICT INT DEFAULT 0,
    DataCadastro DATETIME DEFAULT GETDATE()
);

-- 2. Tabela de Contas Bloqueadas / Fraudadores Confirmados (Alimentação de Listas)
CREATE TABLE ContasBloqueadas (
    CPF_CNPJ VARCHAR(14) PRIMARY KEY,
    MotivoBloqueio VARCHAR(200) NOT NULL,
    DataBloqueio DATETIME DEFAULT GETDATE()
);

-- 3. Tabela de Transações Financeiras
CREATE TABLE Transacoes (
    TransacaoID BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrigemCPF VARCHAR(14) NOT NULL,
    DestinoCPF VARCHAR(14) NOT NULL,
    Valor DECIMAL(18,2) NOT NULL,
    FormaPagamento VARCHAR(30) NOT NULL, -- 'PIX', 'TED', 'Especie', 'Boleto', 'Amortizacao'
    DataHoraTransacao DATETIME DEFAULT GETDATE(),
    DepositanteIdentificado BIT DEFAULT 1,
    NomeDepositante VARCHAR(150) NULL,
    CPFDepositante VARCHAR(14) NULL
);

-- 4. Índices Estratégicos para Travessia de Grafo e Performance
CREATE INDEX IX_Transacoes_Origem ON Transacoes(OrigemCPF, DataHoraTransacao) INCLUDE (DestinoCPF, Valor, FormaPagamento);
CREATE INDEX IX_Transacoes_Destino ON Transacoes(DestinoCPF, DataHoraTransacao) INCLUDE (OrigemCPF, Valor, FormaPagamento);
CREATE INDEX IX_Clientes_Device ON Clientes(DeviceHash) WHERE DeviceHash IS NOT NULL;
GO
```

---

## 2. Procedures e Consultas de Inteligência de Grafos

### A. Detecção de Contaminação por Proximidade (1 a 3 Saltos de Conta Bloqueada)
Utiliza uma Common Table Expression (CTE) recursiva para rastrear o fluxo do dinheiro sem precisar de bancos de grafos externos:

```sql
CREATE OR ALTER PROCEDURE sp_DetectarContaminacaoRede
    @CpfInvestigado VARCHAR(14)
AS
BEGIN
    SET NOCOUNT ON;

    WITH RedeTransacional AS (
        -- Âncora: Transações diretas da conta investigada (Salto 1)
        SELECT 
            OrigemCPF,
            DestinoCPF,
            Valor,
            1 AS NivelSalto,
            CAST(OrigemCPF + ' -> ' + DestinoCPF AS VARCHAR(500)) AS TrilhaCaminho
        FROM Transacoes
        WHERE OrigemCPF = @CpfInvestigado

        UNION ALL

        -- Recursão: Segue o dinheiro para os próximos intermediários (Saltos 2 e 3)
        SELECT 
            t.OrigemCPF,
            t.DestinoCPF,
            t.Valor,
            r.NivelSalto + 1,
            CAST(r.TrilhaCaminho + ' -> ' + t.DestinoCPF AS VARCHAR(500))
        FROM Transacoes t
        INNER JOIN RedeTransacional r ON t.OrigemCPF = r.DestinoCPF
        WHERE r.NivelSalto < 3  -- Restrição de profundidade
          AND r.TrilhaCaminho NOT LIKE '%' + t.DestinoCPF + '%' -- Evita loops
    )
    SELECT 
        r.NivelSalto,
        r.DestinoCPF AS CpfFraudadorEncontrado,
        b.MotivoBloqueio,
        r.TrilhaCaminho,
        CASE 
            WHEN r.NivelSalto = 1 THEN 40  -- Conexão Direta (+40 pts)
            WHEN r.NivelSalto = 2 THEN 25  -- Conexão a 2 saltos (+25 pts)
            WHEN r.NivelSalto = 3 THEN 15  -- Conexão a 3 saltos (+15 pts)
            ELSE 0 
        END AS PontosRiscoContaminacao
    FROM RedeTransacional r
    INNER JOIN ContasBloqueadas b ON r.DestinoCPF = b.CPF_CNPJ;
END;
GO
```

---

### B. Detecção de Fluxo Circular de Recursos (*Round-Tripping*)

```sql
CREATE OR ALTER PROCEDURE sp_DetectarFluxoCircular
    @CpfInvestigado VARCHAR(14)
AS
BEGIN
    SET NOCOUNT ON;

    WITH RotaCircular AS (
        SELECT 
            OrigemCPF,
            DestinoCPF,
            1 AS Salto,
            CAST(OrigemCPF + ' -> ' + DestinoCPF AS VARCHAR(500)) AS Trilha
        FROM Transacoes
        WHERE OrigemCPF = @CpfInvestigado

        UNION ALL

        SELECT 
            t.OrigemCPF,
            t.DestinoCPF,
            rc.Salto + 1,
            CAST(rc.Trilha + ' -> ' + t.DestinoCPF AS VARCHAR(500))
        FROM Transacoes t
        INNER JOIN RotaCircular rc ON t.OrigemCPF = rc.DestinoCPF
        WHERE rc.Salto < 4
          AND (rc.Trilha NOT LIKE '%' + t.DestinoCPF + '%' OR t.DestinoCPF = @CpfInvestigado)
    )
    SELECT TOP 1 
        Trilha,
        Salto AS TotalIntermediarios,
        35 AS PontosRiscoCiclo
    FROM RotaCircular
    WHERE DestinoCPF = @CpfInvestigado AND Salto > 1;
END;
GO
```

---

### C. Resolução de Entidades & Dispositivo Compartilhado

```sql
CREATE OR ALTER PROCEDURE sp_VerificarDispositivoCompartilhado
    @CpfInvestigado VARCHAR(14)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        c.CPF_CNPJ,
        c.DeviceHash,
        COUNT(DISTINCT outros.CPF_CNPJ) AS TotalCpfsCompartilhando,
        CASE 
            WHEN COUNT(DISTINCT outros.CPF_CNPJ) >= 5 THEN 50 -- Fábrica de Contas
            WHEN COUNT(DISTINCT outros.CPF_CNPJ) >= 2 THEN 35 -- Dispositivo Compartilhado
            ELSE 0 
        END AS PontosRiscoDispositivo
    FROM Clientes c
    INNER JOIN Clientes outros 
        ON c.DeviceHash = outros.DeviceHash 
       AND c.CPF_CNPJ <> outros.CPF_CNPJ
    WHERE c.CPF_CNPJ = @CpfInvestigado
    GROUP BY c.CPF_CNPJ, c.DeviceHash;
END;
GO
```

---

## 3. Stored Procedure Unificada de Avaliação de Risco

```sql
CREATE OR ALTER PROCEDURE sp_CalcularScoreFinalPLD
    @CPF VARCHAR(14),
    @ScoreFinal INT OUTPUT,
    @ClassificacaoRisco VARCHAR(30) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Score INT = 0;
    DECLARE @Renda DECIMAL(18,2) = 0;
    DECLARE @Volume30Dias DECIMAL(18,2) = 0;
    DECLARE @IsFronteira BIT = 0;
    DECLARE @IsMineracao BIT = 0;
    DECLARE @IsPEP BIT = 0;
    DECLARE @IsCSNU BIT = 0;
    DECLARE @NotificacoesDICT INT = 0;

    -- 1. Obter dados cadastrais
    SELECT 
        @Renda = RendaDeclarada,
        @IsFronteira = IsFronteira,
        @IsMineracao = IsMineracao,
        @IsPEP = IsPEP,
        @IsCSNU = IsCSNU,
        @NotificacoesDICT = NotificacoesPixDICT
    FROM Clientes 
    WHERE CPF_CNPJ = @CPF;

    -- 2. Regra Mandatória: CSNU / Terrorismo
    IF @IsCSNU = 1
    BEGIN
        SET @ScoreFinal = 100;
        SET @ClassificacaoRisco = 'Bloqueio Cautelar Obrigatório';
        RETURN;
    END

    -- 3. Volume transacionado nos últimos 30 dias
    SELECT @Volume30Dias = ISNULL(SUM(Valor), 0)
    FROM Transacoes
    WHERE (OrigemCPF = @CPF OR DestinoCPF = @CPF)
      AND DataHoraTransacao >= DATEADD(DAY, -30, GETDATE());

    -- Incompatibilidade de Renda
    IF @Volume30Dias > (@Renda * 5)
        SET @Score = @Score + 35;
    ELSE IF @Volume30Dias > (@Renda * 2)
        SET @Score = @Score + 15;

    -- Fatores Geográficos
    IF @IsFronteira = 1
        SET @Score = CAST(@Score * 1.5 AS INT);
    IF @IsMineracao = 1
        SET @Score = CAST(@Score * 1.4 AS INT);

    -- PEP com Incompatibilidade
    IF @IsPEP = 1 AND @Volume30Dias > (@Renda * 2)
        SET @Score = @Score + 35;

    -- DICT / Notificações PIX BACEN
    IF @NotificacoesDICT > 0
        SET @Score = @Score + 40;

    -- Normalização de 0 a 100
    IF @Score > 100 SET @Score = 100;
    SET @ScoreFinal = @Score;

    -- Classificação
    IF @ScoreFinal >= 85
        SET @ClassificacaoRisco = 'Crítico';
    ELSE IF @ScoreFinal >= 70
        SET @ClassificacaoRisco = 'Alto';
    ELSE IF @ScoreFinal >= 40
        SET @ClassificacaoRisco = 'Médio';
    ELSE
        SET @ClassificacaoRisco = 'Baixo';
END;
GO
```
