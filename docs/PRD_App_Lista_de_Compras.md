# PRD — Product Requirements Document
## Aplicativo de Lista de Compras de Mercado

**Versão:** 1.0
**Data:** Maio de 2026
**Status:** Draft

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Premissas, Escopo e Restrições](#2-premissas-escopo-e-restrições)
3. [Personas e Casos de Uso](#3-personas-e-casos-de-uso)
4. [Conceitos e Entidades de Domínio](#4-conceitos-e-entidades-de-domínio)
5. [Requisitos Funcionais](#5-requisitos-funcionais)
6. [Requisitos Não Funcionais](#6-requisitos-não-funcionais)
7. [Fluxos Principais](#7-fluxos-principais)
8. [Regras de Negócio](#8-regras-de-negócio)
9. [Modelo de Dados (Conceitual)](#9-modelo-de-dados-conceitual)
10. [Telas Principais](#10-telas-principais-esboço)
11. [Decisões Técnicas](#11-decisões-técnicas)
12. [Métricas de Sucesso](#12-métricas-de-sucesso)
13. [Riscos e Considerações](#13-riscos-e-considerações)
14. [Roadmap](#14-roadmap)
15. [Apêndice A — Glossário](#apêndice-a--glossário)

---

## 1. Visão Geral

### 1.1 Resumo Executivo

Aplicação mobile (iOS e Android) que funciona como uma lista de compras inteligente para mercado, permitindo ao usuário planejar suas compras ao longo do tempo, executar a compra no mercado de forma assistida com cálculo automático de gastos, e obter análises e insights sobre seus hábitos de consumo e gastos.

### 1.2 Problema

Atualmente, fazer compras de mercado envolve diversos pontos de fricção:

- Esquecimento de itens necessários durante a compra.
- Dificuldade em somar mentalmente o total durante a compra para controle de orçamento.
- Falta de visibilidade sobre quanto e onde se gasta ao longo do tempo.
- Falta de comparação de preços entre mercados para o mesmo produto.
- Ausência de histórico de compras para identificar padrões de consumo.

### 1.3 Solução

Um app mobile offline-first, com dois modos principais (Planejamento e Compra), que permite ao usuário construir listas de compras de forma incremental, executar a compra com cálculo automático, e visualizar relatórios detalhados sobre seus hábitos.

### 1.4 Objetivos do Produto

- Nunca esquecer um item necessário no mercado.
- Ter visibilidade em tempo real do valor total durante a compra.
- Registrar histórico completo de compras para análise.
- Comparar preços e gastos entre diferentes mercados.
- Funcionar de forma confiável sem conexão à internet.

### 1.5 Público-Alvo (V1)

Uso individual. O usuário inicial do produto é o próprio proprietário do aparelho. Não há, na V1, compartilhamento de listas, multiusuário ou sincronização entre dispositivos.

---

## 2. Premissas, Escopo e Restrições

### 2.1 Plataformas Alvo

- **iOS**: versão mínima **iOS 14.0**.
- **Android**: versão mínima **Android 8.0 (API 26)**.
- **Tecnologia**: React Native (codebase única para ambas plataformas).

### 2.2 Premissas Arquiteturais

- **Offline-first**: o app deve funcionar 100% sem internet. Todos os dados ficam armazenados localmente no dispositivo.
- Não há backend de servidor na V1.
- Não há autenticação de usuários na V1.
- Não há sincronização entre dispositivos na V1.
- Toda exclusão de entidades (mercados, produtos, listas, compras) é **lógica** (soft delete), preservando integridade do histórico.

### 2.3 Fora de Escopo (V1)

- Compartilhamento de listas entre múltiplos usuários.
- Sincronização entre múltiplos dispositivos.
- Notificações push ou lembretes automáticos.
- Integração com sistemas de notas fiscais eletrônicas (NF-e/SAT).
- Scanner de código de barras.
- Listas colaborativas (família, cônjuge).
- Backup em nuvem (considerado em V2.0).

---

## 3. Personas e Casos de Uso

### 3.1 Persona Principal

Usuário individual que faz compras de mercado regularmente (semanal, quinzenal ou mensalmente) e deseja organizar melhor suas listas, controlar gastos e ter visibilidade dos seus hábitos de consumo.

### 3.2 Principais Casos de Uso

1. Adicionar item à lista ao longo da semana conforme percebe necessidade em casa.
2. Iniciar uma compra ao chegar no mercado, selecionando a lista e o mercado.
3. Marcar itens como comprados conforme coloca no carrinho, informando preço.
4. Adicionar itens não planejados (compras de impulso) durante o modo compra.
5. Finalizar a compra registrando forma de pagamento e valor real do caixa.
6. Consultar relatórios mensais de gastos por mercado e itens mais comprados.

---

## 4. Conceitos e Entidades de Domínio

### 4.1 Produto (Catálogo)

Representa um item cadastrado no catálogo do usuário, construído incrementalmente a partir do uso. Cada vez que o usuário digita um novo produto, ele é salvo no catálogo para uso futuro com auto-complete.

**Atributos:** nome (obrigatório), marca (opcional), modelo (opcional), unidade de medida padrão (opcional: kg, g, L, mL, un, etc.).

### 4.2 Lista de Compras

Coleção de itens a serem comprados. Possui status: Planejamento (em construção), Em Compra (sendo executada) ou Finalizada/Encerrada.

**Atributos:** nome (opcional, ex.: "Mercado da Semana"), data de criação, status, itens.

### 4.3 Item de Lista

Representa um produto dentro de uma lista específica, com a intenção de compra.

**Atributos:** produto (referência ao catálogo), quantidade planejada (opcional), marca (opcional, herda do catálogo), modelo (opcional), status (a comprar / comprado / não comprado), origem (da lista / adicionado em compra).

### 4.4 Mercado

Cadastro de estabelecimento onde as compras são realizadas.

**Atributos:** nome (obrigatório), observações (opcional).

### 4.5 Compra (Sessão de Compra Finalizada)

Registro histórico de uma compra concluída.

**Atributos:** lista de origem, mercado, data/hora, itens comprados (com quantidade e preço unitário), forma de pagamento, soma calculada, valor real do caixa, foto de cupom (opcional).

---

## 5. Requisitos Funcionais

### 5.1 Modo Planejamento

Modo padrão de manipulação da lista, focado em construção incremental de itens a comprar.

#### RF-PLAN-01 — Criar lista
- O usuário pode criar uma nova lista de compras a qualquer momento.
- Pode opcionalmente dar um nome à lista (ex.: "Compra Mensal", "Churrasco Sábado").
- Caso não informe nome, o sistema sugere um nome padrão com a data de criação.

#### RF-PLAN-02 — Múltiplas listas simultâneas
- O sistema deve permitir múltiplas listas em modo Planejamento simultaneamente.
- Ao iniciar o modo Compra, o usuário seleciona qual lista será utilizada.

#### RF-PLAN-03 — Adicionar item à lista
- Campo obrigatório: nome do produto.
- Campos opcionais: quantidade, marca, modelo, unidade de medida.
- Durante a digitação do nome, o sistema deve sugerir produtos do catálogo (auto-complete).
- Ao selecionar um produto do catálogo, marca, modelo e unidade podem ser pré-preenchidos com a última utilização.

#### RF-PLAN-04 — Editar item da lista
- O usuário pode editar qualquer atributo de um item enquanto a lista está em modo Planejamento.

#### RF-PLAN-05 — Remover item da lista
- O usuário pode remover itens da lista.
- Recomenda-se confirmação para evitar remoções acidentais.

#### RF-PLAN-06 — Ordenação
- Os itens da lista são exibidos em ordem alfabética por padrão.

#### RF-PLAN-07 — Encerrar lista manualmente
- O usuário pode encerrar uma lista sem executar a compra (descartar).

---

### 5.2 Modo Compra

Modo ativado quando o usuário está no mercado realizando a compra. Apresenta a lista como um to-do list interativo com cálculo de gastos em tempo real.

#### RF-COMP-01 — Iniciar compra
- O usuário seleciona uma lista existente para entrar em modo Compra.
- Apenas uma lista pode estar em modo Compra por vez.
- Ao iniciar a compra, o sistema oferece (sem obrigatoriedade) seleção do mercado. A seleção pode ser feita também no momento da finalização.

#### RF-COMP-02 — Visualização tipo to-do list
- A lista é exibida com checkbox ao lado de cada item.
- Itens não comprados aparecem destacados; itens comprados são marcados visualmente como concluídos.

#### RF-COMP-03 — Marcar item como comprado
- Ao marcar um item como comprado, o sistema solicita: quantidade comprada e preço unitário.
- Se a quantidade planejada foi preenchida no Modo Planejamento, ela é pré-carregada como sugestão.
- O sistema calcula automaticamente o subtotal do item (quantidade × preço unitário).

#### RF-COMP-04 — Cálculo automático do total parcial
- O sistema mantém em tela, sempre visível, a soma parcial da compra em tempo real.
- Ao marcar/desmarcar itens, editar quantidade ou preço, ou remover itens, o total é recalculado imediatamente.

#### RF-COMP-05 — Editar item durante a compra
- O usuário pode editar quantidade comprada e preço unitário de qualquer item já marcado como comprado.
- O total é recalculado automaticamente.

#### RF-COMP-06 — Remover item durante a compra
- O usuário pode remover um item já marcado como comprado.
- O valor do item é descontado do total.
- O item retorna ao estado "a comprar" ou é removido conforme escolha.

#### RF-COMP-07 — Adicionar item não planejado (fora da lista)
- O usuário pode adicionar novos itens durante o modo Compra (compras de impulso ou esquecidos do planejamento).
- Esses itens são marcados internamente com `origem = "adicionado em compra"` para fins de filtro e analytics.
- Devem seguir o mesmo fluxo de informação: nome, quantidade, preço unitário, marca/modelo opcionais.

#### RF-COMP-08 — Filtros de visualização
- Filtrar por: a comprar / comprados.
- Filtrar por origem: itens da lista original / itens adicionados em compra.

#### RF-COMP-09 — Cadastro rápido de mercado durante a compra
- Durante o modo Compra, o usuário pode cadastrar um novo mercado sem sair da tela.

#### RF-COMP-10 — Finalização da compra
Ao clicar em "Concluir Compra", o sistema deve:
- Verificar se existem itens não comprados da lista original e exibir aviso confirmando se o usuário deseja prosseguir.
- Solicitar (obrigatório, se ainda não informado): mercado onde a compra foi realizada (com opção de cadastrar na hora).
- Solicitar (obrigatório): forma de pagamento (Cartão de Crédito, Cartão de Débito, Dinheiro, PIX, Vale Alimentação).
- Solicitar (opcional, mas incentivado): valor real total cobrado no caixa, para reconciliação com a soma calculada.
- Permitir (opcional) anexar foto do cupom fiscal.
- Exibir tela de resumo da compra (ver RF-COMP-11).

#### RF-COMP-11 — Tela de resumo da compra
Apresenta:
- Lista de todos os itens comprados, com quantidade, preço unitário e subtotal.
- Total calculado (soma dos subtotais).
- Total real informado no caixa (se informado).
- Diferença entre total calculado e total real (com indicação se ficou maior, menor ou igual).
- Mercado, forma de pagamento, data/hora.
- Lista de itens NÃO comprados (caso existam) para fins de reaproveitamento (ver RF-COMP-12).

#### RF-COMP-12 — Destino dos itens não comprados
- Ao finalizar uma compra com itens não comprados, o usuário deve poder escolher entre:
  - (a) descartar os itens não comprados e encerrar a lista;
  - (b) manter os itens não comprados em uma nova lista (ou na mesma) em modo Planejamento, para próxima compra.

#### RF-COMP-13 — Encerramento da lista
- A lista só é encerrada quando:
  - (a) todos os itens forem marcados como comprados e a compra for finalizada; ou
  - (b) o usuário clicar explicitamente em "Encerrar lista".

---

### 5.3 Gestão de Mercados

#### RF-MERC-01 — Cadastro de mercado
- Campos: nome (obrigatório), observações (opcional).

#### RF-MERC-02 — Edição e arquivamento
- Permitir editar mercados cadastrados.
- Exclusão é **lógica** (soft delete). Mercados "excluídos" são marcados como arquivados e não aparecem em seletores, mas continuam vinculados a compras históricas para preservar a integridade dos relatórios.

#### RF-MERC-03 — Cadastro inline
- O usuário pode cadastrar um mercado direto na tela de finalização da compra ou no Modo Compra, sem precisar sair do fluxo.

---

### 5.4 Catálogo de Produtos

#### RF-CAT-01 — Construção automática do catálogo
- Todo produto digitado em uma lista é automaticamente adicionado ao catálogo.

#### RF-CAT-02 — Auto-complete inteligente
- Ao digitar o nome de um produto, o sistema sugere produtos do catálogo que coincidem com o que está sendo digitado.
- Ao selecionar uma sugestão, marca/modelo/unidade da última utilização podem ser pré-preenchidos.

#### RF-CAT-03 — Gestão do catálogo
- Tela para visualizar todos os produtos do catálogo.
- Permitir editar nome, marca padrão, modelo padrão, unidade padrão.
- Permitir excluir produtos (exclusão lógica). Produtos com compras históricas continuam preservados no histórico.

#### RF-CAT-04 — Normalização de unidades de medida
- O sistema deve tratar unidades equivalentes de forma agregada para fins de analytics.
- **Exemplo:** se o usuário comprou 3 sacos de arroz de 5kg e 2 pacotes de 500g, o relatório deve mostrar **16 kg de arroz comprados** no período.
- Conversões suportadas:
  - **Peso:** g ↔ kg (1000g = 1kg)
  - **Volume:** mL ↔ L (1000mL = 1L)
  - **Unitários:** un (não convertidos)
- Quando há mistura de unidades incompatíveis para o mesmo produto (ex.: kg e un), o relatório exibe ambas separadamente.

---

### 5.5 Relatórios e Analytics

#### RF-REL-01 — Gasto total por período
- Visualização de gastos por dia, semana, mês e ano.

#### RF-REL-02 — Gasto por mercado
- Total gasto em cada mercado em um período selecionado.
- Quantidade de compras por mercado.
- Ticket médio por mercado.

#### RF-REL-03 — Produtos mais comprados
- Ranking de produtos por frequência de compra.
- Ranking de produtos por quantidade total acumulada (com normalização de unidades, ex.: "15 kg de arroz no mês").
- Ranking de produtos por valor gasto.

#### RF-REL-04 — Variação de preço do produto
- Histórico de preço unitário de um produto ao longo do tempo.
- Comparativo de preço do mesmo produto entre diferentes mercados.

#### RF-REL-05 — Análise de formas de pagamento
- Distribuição percentual e absoluta de valor gasto por forma de pagamento.

#### RF-REL-06 — Reconciliação caixa vs. estimativa
- Comparativo entre soma calculada pelo app e valor real do caixa ao longo do tempo.
- Indicador de tendência (ex.: "você costuma gastar 3% a mais do que estima no caixa").

#### RF-REL-07 — Itens fora da lista (compras de impulso)
- Análise de quanto e o que foi comprado fora do planejamento.

#### RF-REL-08 — Indicador de listas incompletas
- Quantas compras foram finalizadas com itens pendentes (não comprados).

#### RF-REL-09 — Média de gasto por compra
- Ticket médio geral e por mercado.

#### RF-REL-10 — Exportação de dados *(V1.1)*
- Permitir exportar relatórios em formato CSV.
- Permitir exportar relatórios em formato PDF.
- Permitir exportar histórico individual de compras.

---

### 5.6 Outras Funcionalidades

#### RF-OUT-01 — Foto do cupom fiscal
- No momento da finalização da compra, oferecer (opcionalmente) anexar foto do cupom.
- A foto fica vinculada ao registro histórico da compra.
- Permitir consultar e visualizar a foto posteriormente.

#### RF-OUT-02 — Histórico de compras
- Listagem completa de todas as compras finalizadas.
- Permitir consultar o detalhe de cada compra (itens, preços, mercado, pagamento, foto do cupom).

#### RF-OUT-03 — Backup local *(V1.1)*
- Permitir ao usuário gerar um arquivo de backup local contendo todos os seus dados (catálogo, listas, compras, mercados, fotos referenciadas).
- Formato sugerido: arquivo `.zip` contendo um dump JSON do banco + diretório de imagens.
- Permitir restaurar a partir de um arquivo de backup.
- Operação manual (acionada pelo usuário); não há agendamento automático na V1.

---

## 6. Requisitos Não Funcionais

### 6.1 Performance
- O app deve responder a interações do usuário em menos de **200ms** para operações locais.
- Recalcular o total da compra deve ser instantâneo (**< 100ms**).

### 6.2 Disponibilidade e Conectividade
- **100% das funcionalidades devem operar sem conexão à internet.**
- Não deve haver dependência de servidor para qualquer fluxo crítico.

### 6.3 Armazenamento
- Dados persistidos localmente no dispositivo em **SQLite**.
- Imagens (fotos de cupom) armazenadas no sistema de arquivos do dispositivo, com referência (caminho) no banco.
- Compressão automática de imagens antes do armazenamento para reduzir consumo (qualidade ~80%, dimensão máxima 1600px no maior lado).

### 6.4 Usabilidade
- Interface otimizada para uso com uma mão (uso típico no mercado, com carrinho).
- Botões de ação principais grandes e acessíveis (mínimo 44pt em iOS e 48dp em Android).
- Suporte a dark mode.
- Idioma: Português (Brasil) na V1.

### 6.5 Acessibilidade
- Suporte a leitores de tela (VoiceOver/TalkBack).
- Contraste mínimo conforme WCAG AA.
- Suporte a tamanhos de fonte do sistema (Dynamic Type).

### 6.6 Privacidade
- Nenhum dado do usuário é enviado a servidores externos na V1.
- Permissões solicitadas (câmera, para foto de cupom) devem ser opcionais.

---

## 7. Fluxos Principais

### 7.1 Fluxo: Planejar Lista

1. Usuário abre o app na tela principal de listas.
2. Cria uma nova lista (com ou sem nome customizado).
3. Adiciona itens à lista ao longo do tempo. A cada item digitado, vê sugestões do catálogo.
4. Pode editar ou remover itens a qualquer momento.
5. A lista permanece em modo Planejamento até ser iniciada uma compra ou ser encerrada.

### 7.2 Fluxo: Executar Compra

1. Usuário chega no mercado e seleciona a lista a ser usada.
2. Clica em "Iniciar Compra" — a lista entra em modo Compra.
3. Opcionalmente, já seleciona ou cadastra o mercado.
4. Conforme coloca itens no carrinho, marca o item como comprado e informa quantidade e preço.
5. O total parcial é atualizado em tempo real, sempre visível.
6. Se compra algo fora da lista, adiciona como item novo (origem: adicionado em compra).
7. Pode filtrar a visualização (a comprar / comprados / da lista / adicionados).
8. Ao terminar, clica em "Concluir Compra".
9. O sistema verifica itens pendentes e exibe aviso (se houver).
10. Solicita mercado (se não selecionado), forma de pagamento e valor real do caixa.
11. Opcionalmente, anexa foto do cupom.
12. Exibe tela de resumo.
13. Pergunta o que fazer com itens não comprados (descartar / manter para próxima).
14. A compra é salva no histórico.

### 7.3 Fluxo: Consultar Analytics

1. Usuário acessa a área de Relatórios.
2. Seleciona período e/ou filtros (mercado, produto).
3. Visualiza gráficos e indicadores.
4. Opcionalmente, exporta CSV ou PDF *(V1.1)*.

---

## 8. Regras de Negócio

| ID | Regra |
|----|-------|
| RN-01 | Lista só pode ser encerrada com todos os itens comprados ou por encerramento manual explícito do usuário. |
| RN-02 | Apenas uma lista pode estar em modo Compra por vez. |
| RN-03 | Múltiplas listas em modo Planejamento podem coexistir. |
| RN-04 | Itens removidos durante a compra são descontados do total automaticamente. |
| RN-05 | Itens adicionados durante a compra são marcados com origem distinta para fins de analytics. |
| RN-06 | Catálogo de produtos é construído implicitamente — qualquer produto digitado vira entrada no catálogo. |
| RN-07 | Toda exclusão é lógica (soft delete). Entidades excluídas não aparecem em seletores ativos, mas permanecem disponíveis para o histórico. |
| RN-08 | Forma de pagamento é obrigatória na finalização da compra; uma compra = uma única forma de pagamento. |
| RN-09 | O valor real do caixa é opcional, mas se preenchido entra nos relatórios de reconciliação. |
| RN-10 | Total parcial = soma de (quantidade × preço unitário) de todos os itens marcados como comprados. |
| RN-11 | Para fins de analytics de quantidade, unidades de mesma família (peso ou volume) são normalizadas a uma unidade base (kg para peso, L para volume). |

---

## 9. Modelo de Dados (Conceitual)

### Produto (catálogo)
- `id`
- `nome`
- `marca_padrao` (nullable)
- `modelo_padrao` (nullable)
- `unidade_padrao` (nullable)
- `criado_em`
- `excluido_em` (nullable — soft delete)

### Mercado
- `id`
- `nome`
- `observacoes` (nullable)
- `criado_em`
- `excluido_em` (nullable — soft delete)

### Lista
- `id`
- `nome` (nullable)
- `status` (planejamento / em_compra / finalizada / encerrada)
- `criado_em`
- `finalizada_em` (nullable)
- `excluido_em` (nullable — soft delete)

### ItemLista
- `id`
- `lista_id` (FK)
- `produto_id` (FK)
- `quantidade_planejada` (nullable)
- `marca` (nullable)
- `modelo` (nullable)
- `unidade` (nullable)
- `origem` (lista / compra)
- `status` (a_comprar / comprado / nao_comprado)
- `quantidade_comprada` (nullable)
- `preco_unitario` (nullable)
- `ordem_alfabetica`

### Compra
- `id`
- `lista_id` (FK)
- `mercado_id` (FK)
- `data_hora`
- `forma_pagamento`
- `total_calculado`
- `total_real` (nullable)
- `foto_cupom_path` (nullable)
- `excluido_em` (nullable — soft delete)

### Enums

- **FormaPagamento**: `cartao_credito`, `cartao_debito`, `dinheiro`, `pix`, `vale_alimentacao`
- **UnidadeMedida**: `un`, `kg`, `g`, `L`, `mL`, `pct` (pacote), `cx` (caixa), e outras configuráveis
- **FamiliaUnidade**: `peso` (kg, g) / `volume` (L, mL) / `unitario` (un, pct, cx) — usada para normalização em analytics

---

## 10. Telas Principais (Esboço)

- **Tela inicial:** lista de listas existentes (com status), botão para criar nova lista, acesso a Relatórios e Configurações.
- **Tela de edição da lista (modo Planejamento):** visualização dos itens, campo de adição com auto-complete, edição/remoção, botão "Iniciar Compra".
- **Tela de modo Compra:** to-do list de itens, total parcial fixo no topo, filtros, botão de adicionar item, botão "Concluir Compra".
- **Tela de finalização da compra:** campos para mercado, forma de pagamento, total real, foto do cupom.
- **Tela de resumo da compra:** detalhamento completo do que foi comprado, totais e reconciliação.
- **Tela de histórico de compras:** lista de compras finalizadas com data, mercado e valor.
- **Tela de relatórios:** dashboards e gráficos com filtros.
- **Tela de mercados:** CRUD de mercados.
- **Tela de catálogo de produtos:** CRUD de produtos.
- **Tela de configurações:** dark mode, exportação, backup/restauração.

---

## 11. Decisões Técnicas

### 11.1 Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | React Native |
| Linguagem | TypeScript |
| Persistência local | SQLite (via `react-native-quick-sqlite` ou `expo-sqlite`, a definir conforme escolha entre RN puro ou Expo) |
| ORM / Camada de dados | Drizzle ORM (leve, com type-safety e suporte nativo a SQLite) |
| Gerenciamento de estado | Zustand (simples e suficiente para escopo do app) |
| Navegação | React Navigation |
| UI / Design System | React Native Paper (componentes Material Design prontos, com suporte a temas e dark mode) |
| Gráficos (relatórios) | Victory Native ou React Native Chart Kit |
| Imagens | `react-native-image-picker` (captura) + `react-native-image-resizer` (compressão) |
| Geração de PDF (V1.1) | `react-native-html-to-pdf` |
| Compartilhamento de arquivos | `react-native-share` |

### 11.2 Versões Mínimas

- **iOS:** 14.0 (cobertura >97% dos dispositivos ativos)
- **Android:** 8.0 / API 26 (cobertura >95% dos dispositivos ativos)

### 11.3 Estratégia de Backup Local

- Backup acionado manualmente pelo usuário em Configurações.
- Gera um arquivo `.zip` contendo:
  - `data.json` — dump completo das tabelas SQLite.
  - `images/` — diretório com as fotos de cupom referenciadas.
  - `manifest.json` — metadados do backup (data, versão do app, versão do schema).
- Restauração lê o arquivo, valida o manifest e restaura os dados.
- Compartilhamento via share sheet do sistema (usuário escolhe destino: e-mail, drive, etc.).

### 11.4 Normalização de Unidades

- Tabela de conversão fixa no app:
  - `1 kg = 1000 g`
  - `1 L = 1000 mL`
- Para cada produto, ao agregar quantidade no período, o sistema:
  1. Identifica a família da unidade de cada item comprado.
  2. Se todos pertencem à mesma família (peso ou volume), normaliza para a unidade base (kg ou L) e soma.
  3. Se há mistura de famílias incompatíveis, agrupa e exibe separadamente.
  4. Itens sem unidade definida são contados como `un` (unitário).

---

## 12. Métricas de Sucesso

Mesmo sendo um produto pessoal, é útil definir indicadores para avaliar o valor entregue.

- **Frequência de uso:** número de compras finalizadas por mês.
- **Completude:** % de compras finalizadas sem itens pendentes da lista.
- **Adoção do planejamento:** % de compras iniciadas a partir de uma lista pré-existente vs. listas criadas no momento da compra.
- **Precisão de estimativa:** diferença média entre total calculado e total real no caixa.
- **Engajamento com analytics:** frequência de acesso à área de relatórios.

---

## 13. Riscos e Considerações

### 13.1 Riscos Técnicos

- **Performance de auto-complete com catálogo grande:** garantir índice adequado no SQLite (índice em `produto.nome` com collation case-insensitive).
- **Crescimento de armazenamento:** fotos de cupom podem inflar o consumo. Mitigação: compressão automática + opção de limpar fotos antigas em Configurações.
- **Perda de dados sem backup em nuvem:** se o usuário trocar de dispositivo sem fazer backup local, perde tudo. Mitigação: reforço de UX para incentivar backups periódicos na V1.1; backup em nuvem em V2.0.
- **Migração de schema:** mudanças no banco entre versões precisam de migrations versionadas para não corromper dados de usuários atualizando o app.

### 13.2 Riscos de UX

- **Excesso de campos na finalização da compra** pode causar fricção; manter o essencial e tornar a maioria opcional.
- **Digitação no mercado com uma mão** exige cuidado especial no design dos campos (teclados numéricos para preço/quantidade, botões grandes).
- **Auto-complete agressivo** pode atrapalhar quem quer cadastrar um produto novo com nome similar; permitir dispensar a sugestão facilmente.

---

## 14. Roadmap

### V1.0 — MVP

- CRUD de listas, itens, produtos, mercados (todos com soft delete).
- Modo Planejamento e Modo Compra completos.
- Cálculo automático, finalização com forma de pagamento e valor real.
- Histórico de compras.
- Relatórios essenciais: gasto por mês/semana/dia, gasto por mercado, top produtos por frequência e por quantidade (com normalização de unidades), variação de preço, análise de formas de pagamento, itens fora da lista, ticket médio, indicador de listas incompletas, reconciliação caixa vs. estimativa.
- Foto de cupom opcional.
- Auto-complete inteligente.

### V1.1 — Refinamentos

- Exportação CSV e PDF.
- Backup local manual (arquivo `.zip`) e restauração.
- Refinamentos de UX baseados em uso real.

### V2.0 — Expansão (futuro)

- Sincronização em nuvem e contas de usuário.
- Compartilhamento de listas entre usuários (uso familiar).
- Scanner de código de barras.
- Notificações inteligentes (ex.: "você costuma comprar leite a cada 5 dias").
- Integração com NF-e/cupom fiscal eletrônico.
- Backup automático em nuvem.

---

## Apêndice A — Glossário

| Termo | Definição |
|-------|-----------|
| Modo Planejamento | Estado da lista enquanto está sendo construída pelo usuário, antes de ir ao mercado. |
| Modo Compra | Estado da lista enquanto a compra está sendo executada no mercado. |
| Catálogo | Conjunto de produtos conhecidos pelo app, construído implicitamente conforme o usuário adiciona itens. |
| Item da lista | Instância de um produto dentro de uma lista, com quantidade e preço específicos daquela compra. |
| Origem do item | Classifica se o item foi planejado previamente (origem: lista) ou adicionado durante a compra (origem: compra). |
| Reconciliação | Comparação entre a soma calculada pelo app e o valor real do caixa. |
| Ticket médio | Valor médio gasto por compra finalizada. |
| Soft delete | Exclusão lógica — o registro é marcado como excluído mas permanece no banco para preservar histórico. |
| Normalização de unidades | Processo de converter quantidades em unidades equivalentes da mesma família (ex.: g e kg) para uma unidade base, permitindo agregação correta em relatórios. |
