# Arquitetura e Metodologia do Sistema de Pontuação de Risco PLD/FT

Este documento descreve as especificações técnicas, modelos matemáticos, variáveis de entrada, matrizes de pesos e enquadramentos regulatórios utilizados no motor de pontuação de risco para **Prevenção à Lavagem de Dinheiro, Financiamento do Terrorismo (PLD/FT)** e **Prevenção a Fraudes de Crédito / Contas Laranjas**.

---

## 1. Visão Geral da Arquitetura de Risco

O motor analítico opera sob o modelo de **Fusão de Risco Multicamadas (*Risk Fusion Score*)**, combinando quatro pilares complementares de análise:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 DADOS TRANSACIONAIS & KYC               │
                  └────────────────────────────┬────────────────────────────┘
                                               │
     ┌──────────────────┬──────────────────────┼──────────────────────┬──────────────────┐
     ▼                  ▼                      ▼                      ▼                  ▼
┌──────────────┐ ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Pilar 1:     │ │ Pilar 2:     │      │ Pilar 3:     │      │ Pilar 4:     │      │ Sanções CSNU │
│ Regulatório  │ │ Resolução de │      │ Topologia de │      │ Ciclo de     │      │ (Lei 13.810) │
│ & Limites    │ │ Entidades &  │      │ Grafos &     │      │ Crédito &    │      │              │
│ Objetivos    │ │ Dispositivos │      │ Redes        │      │ Comportamento│      │              │
└──────┬───────┘ └──────┬───────┘      └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                │                     │                     │                     │
       ▼                ▼                     ▼                     ▼                     ▼
 (Peso: 25%)       (Peso: 20%)           (Peso: 35%)           (Peso: 20%)          (Override: 100)
       │                │                     │                     │                     │
       └────────────────┴─────────────────────┼─────────────────────┴─────────────────────┘
                                              │
                                              ▼
                             ┌───────────────────────────────────┐
                             │    SCORE CONSOLIDADO (0 - 100)    │
                             └─────────────────┬─────────────────┘
                                               │
          ┌────────────────────┬───────────────┴──────────────┬───────────────────┐
          ▼                    ▼                              ▼                   ▼
    Baixo (0-39)         Médio (40-69)                  Alto (70-84)        Crítico (85-100)
 [Monitoramento]      [Alerta Preventivo]             [Diligência EDD]     [Comunicação COAF]
```

### Fórmula de Fusão de Risco ($S_{\text{final}}$):

$$S_{\text{final}} = \min\left(100, \; w_1 \cdot S_{\text{Regulatório}} + w_2 \cdot S_{\text{Entidade/Device}} + w_3 \cdot S_{\text{Topologia}} + w_4 \cdot S_{\text{Crédito}}\right)$$

*Parâmetros em Produção:*
- $w_1 = 0.25$ (Regulatório & Limites Objetivos)
- $w_2 = 0.20$ (Resolução de Entidades & Pegada Digital)
- $w_3 = 0.35$ (Topologia de Rede & Teoria dos Grafos)
- $w_4 = 0.20$ (Ciclo de Crédito & Comportamento Transacional)

---

## 2. Detalhamento dos Pilares de Pontuação

### Pilar 1: Parâmetros Regulatórios e Limites Objetivos ($S_{\text{Regulatório}}$)
Fundamentado na **Circular BACEN nº 3.978/2020**, **Carta Circular BACEN nº 4.001/2020** e **Instrução CVM nº 617/2019**.

| Indicador | Condição Técnica / Regra | Pontos Adicionados | Base Legal |
| :--- | :--- | :---: | :--- |
| **COE Automático** | Operação em espécie $\ge R\$\ 50.000,00$ | **+75 pts** *(Gatilho SISCOAF)* | Art. 49 Circular 3.978 |
| **Depositante Não Identificado** | Depósito em espécie $> R\$\ 2.000,00$ sem identificação do portador | **+25 pts** | Art. 41 Circular 3.978 |
| **Boleto em Espécie** | Liquidação de boleto $\ge R\$\ 10.000,00$ em espécie | **+30 pts** | Art. 38 Carta 4.001 |
| **Fator Faixa de Fronteira** | Operação em município situado em até 150 km da fronteira internacional | **Multiplicador 1.5x** | Carta Circ. 4.001 |
| **Fator Polo de Mineração** | Operação em polo de extração mineral/garimpo sem lastro de DTVM | **Multiplicador 1.4x** | Carta Circ. 4.001 |
| **PEP com Incompatibilidade** | Titular ou parente até 2º grau PEP com movimentação $> 2\text{x}$ a renda | **+35 pts** | Resolução COAF 40/2021 |
| **Incompatibilidade Grave** | Volume movimentado $> 5\text{x}$ a capacidade econômico-financeira | **+35 pts** | Circular 3.978 |
| **Sanções CSNU / Terrorismo** | Match na lista do Conselho de Segurança da ONU | **Score = 100** *(Bloqueio Imediato)* | Lei nº 13.810/2019 |

---

### Pilar 2: Resolução de Entidades & Pegada Digital ($S_{\text{Entidade/Device}}$)
Detecta a criação de **identidades sintéticas**, compartilhamento de terminais de acesso e anomalias de cadastro.

| Indicador | Condição Técnica / Regra | Pontos Adicionados | Justificativa Analítica |
| :--- | :--- | :---: | :--- |
| **Dispositivo Compartilhado (Hub)** | Mesmo `device_hash` ou assinatura TLS JA3 utilizado por 2 a 4 CPFs distintos | **+35 pts** | Compartilhamento anômalo de aparelho |
| **Fábrica de Contas Sintéticas** | Mesmo dispositivo utilizado por $\ge 5$ CPFs distintos | **+50 pts** | Infraestrutura centralizada de fraude |
| **Ilha Cadastral de Endereços** | Correspondência fonética (*Fuzzy Matching*) de mesmo endereço físico para $\ge 4$ proponentes sem parentesco | **+20 pts** | Endereço fictício concentrador |
| **Histórico de Infrações no PIX (DICT)** | Receptora do recurso possui notificações de infração aceitas no Banco Central (5 anos) | **+40 pts** | Histórico prévio de fraude no ecossistema |

---

### Pilar 3: Topologia de Rede & Teoria dos Grafos ($S_{\text{Topologia}}$)
Identifica estruturas complexas de dispersão de valores (*smurfing*) e nós intermediários (*money mules*).

| Indicador | Algoritmo / Mecanismo de Cálculo | Pontos Adicionados | Finalidade de Detecção |
| :--- | :--- | :---: | :--- |
| **Conta Ponte (*Betweenness Centrality*)** | Subgrafo local onde o nó atua no caminho mais curto entre agrupamentos desconectados | **+25 pts** | Intermediário de dispersão / Smurfing |
| **Contaminação por Proximidade** | Conexão em até 1 salto (*hop*) de nó sob bloqueio cautelar ou comunicação prévia | **+35 pts** | Vínculo direto com fraudador |
| **Contaminação Indireta (2 saltos)** | Conexão a 2 saltos de nó bloqueado ou suspeito | **+20 pts** | Vínculo indireto em rede |
| **Fluxo Circular (*Round-Tripping*)** | Travessia de profundidade limitada (DFS 2 a 4 saltos) com retorno do valor à origem | **+35 pts** | Simulação de lastro ou reciclagem |
| **Anel de Simulação de Crédito** | Comunidade densamente conectada (Louvain) com transferências mútuas e baixo saldo final | **+30 pts** | Inflar faturamento artificialmente |

---

### Pilar 4: Ciclo de Vida do Crédito & Comportamento ($S_{\text{Crédito}}$)
Monitora a transição de contas normais ou dormentes para a fase de esvaziamento (*cashout / bust-out*).

| Indicador | Condição Técnica / Regra | Pontos Adicionados | Finalidade de Detecção |
| :--- | :--- | :---: | :--- |
| **Escoamento Relâmpago (*Bust-out*)** | Esvaziamento de $\ge 85\%$ do empréstimo liberado em até 30 minutos via PIX/TED | **+40 pts** | Conta laranja utilizada para cashout |
| **Pass-Through Imediato** | Retenção $< 24\text{h}$ com débitos $\ge 90\%$ e saldo residual $< 5\%$ | **+40 pts** | Conta de passagem pura |
| **Amortização DCO com Terceiros** | Quitação antecipada de empréstimo com recursos transferidos por terceiros sem vínculo | **+40 pts** | Lavagem via quitação de dívidas |
| **Conta em Dormência (*Sleeper*)** | Longo período com pagamentos irrelevantes seguido de pedido de crédito no teto máximo | **+20 pts** | Aquecimento artificial de conta (*warm-up*) |
| **Ansiedade de Consulta de Saldo** | Aumento de $\ge 5\text{x}$ em logins e consultas de saldo nas 48h prévias à liberação | **+15 pts** | Comportamento típico de laranja cúmplice |

---

## 3. Matriz de Classificação de Risco e Ações Obrigatórias

| Faixa de Score | Nível de Risco | Prazo de Tratamento (SLA) | Ação Operacional & Regulatória Obrigatória |
| :---: | :---: | :---: | :--- |
| **0 a 39** | **Baixo** | Rotina trimestral | Monitoramento ordinário; arquivamento automático de atipicidades justificadas. |
| **40 a 69** | **Médio** | 5 dias úteis | Inclusão em lista de monitoramento preventivo; verificação de comprovante de renda. |
| **70 a 84** | **Alto** | 48 horas | **Diligência Aprofundada (EDD)**: Solicitação de notas fiscais, IRPF/DIPJ e rastreamento de contrapartes. |
| **85 a 100** | **Crítico** | **24 horas** | **Comunicação Obrigatória ao COAF (SISCOAF)** por indício gravoso de PLD/FT e avaliação de encerramento de conta. |
| **Override** | **Bloqueio Cautelar** | **Imediato (0h)** | **Bloqueio de Ativos e Comunicação ao MJSP/COAF** (Sanções CSNU / Terrorismo - Lei nº 13.810/2019). |

---

## 4. Requisitos de Auditoria e Governança

1. **Explicabilidade da Decisão**: O sistema não atua como caixa-preta. Toda atribuição de pontuação detalha exatamente o código da regra, a base legal e a evidência fática apurada.
2. **Trilha de Auditoria Imutável**: Registro do carimbo temporal, identificação do analista responsável, versão do motor de regras e hash digital SHA-256 da deliberação.
3. **Guarda Documental**: Manutenção dos registros de investigação e dossiês por no mínimo **5 anos** (conforme Circular BACEN nº 3.978/2020).
