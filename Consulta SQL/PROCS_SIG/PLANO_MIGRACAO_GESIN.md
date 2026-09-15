# Plano de Migração: Banco SIG para GESIN (Fase 0 - PLD/FT v2)

| Metadado | Detalhe |
|---|---|
| **Ambiente Alvo** | GESIN (SQL Server 2019+) / Schema `SCH_PLDFT` |
| **Data de Homologação** | 04/09/2026 |
| **Autor** | Kauan Eiras & Equipe de Conformidade e TI |
| **Status** | Concluído como Pré-Requisito Bloqueante da v2 |

---

## 1. Objetivo
Garantir que as 9 stored procedures históricas de seleção mensal (`PLDFT_PROC_SELECIONADOS*`, `PLDFT_PROC_TRANSACOES*`, `PLDFT_PROC_RENDA*`, `PLDFT_PROC_ANALISE*`) executem com integridade no ambiente `GESIN`, alimentando o novo modelo de acervo permanente da v2 (`SCH_PLDFT_V2.sql`).

---

## 2. Correção do Bug Crítico (Seção 9.6 do Documento de Requisitos)

Na procedure `PLDFT_PROC_SELECIONADOS_CC`, foi identificado um erro oriundo de substituição em massa de texto (`Sigla` -> `GESINla`) em 3 identificadores de coluna:
1. `segmento_perfil_GESINla` -> **Corrigido para**: `segmento_perfil_sigla`
2. `GESINla_cooperativa` -> **Corrigido para**: `sigla_cooperativa`
3. `GESINla_modalidade` -> **Corrigido para**: `sigla_modalidade`

Essa correção garante que o satélite `TB_Ficha_SnapshotCadastral` receba a sigla cadastral correta sem falhas de compilação ou valores nulos.

---

## 3. Arquitetura de Tabelas: Staging vs. Acervo Permanente

| Tabela Staging (GESIN) | Comportamento | Tabela Acervo Permanente v2 |
|---|---|---|
| `TB_PLDFT_SELECIONADOS` | Recalculada mensalmente | `SCH_PLDFT.TB_Ficha` + `TB_Ficha_SnapshotCadastral` |
| `TB_PLDFT_TRANSACOES` | Recalculada mensalmente | `SCH_PLDFT.TB_Ficha_Transacao` |
| `TB_PLDFT_RENDA` | Recalculada mensalmente | `SCH_PLDFT.TB_Ficha_Renda` |
| `TB_PLDFT_ANALISE` | Dispara geração | `SCH_PLDFT.TB_Remessa` |
| `TB_APLICACAO` (~45M) | Synonym de Origem | Leitura direta sob demanda (RF-09) |
| `TB_SALDO_EMPRESTIMO` (~374M) | Synonym de Origem | Leitura direta sob demanda (RF-09) |

---

## 4. Ordem de Execução
1. Executar `CREATE_SCH_PLDFT_V2.sql` para criar schemas, tabelas e catálogos base.
2. Executar as 9 procedures em `GESIN` para gerar a área de staging do mês corrente (`08/2026`).
3. Invocar `SCH_PLDFT.STP_PLDFT_GERAR_REMESSA` para criar a remessa oficial e materializar as fichas.
