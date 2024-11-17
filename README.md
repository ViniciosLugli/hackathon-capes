# AntLabyrinth

Pitch: https://youtu.be/BrcQsJSQqW0

Demo: https://youtu.be/_iwEbyWICrI

---

![AntLabyrinth](https://github.com/user-attachments/assets/18af70bb-8cc6-459a-b8e7-ffd0d2fbac8a)

---

## O que é?

_AntLabyrinth_ é uma plataforma projetada para aprimorar a experiência dos pesquisadores acadêmicos no portal de periódicos da CAPES. Através de uma abordagem inovadora, oferece busca inteligente e suporte à escrita acadêmica, utilizando processamento de linguagem natural (NLP) e um grafo de conhecimento avançado.

## Funcionalidades

### 1. **Busca Inteligente**

Pesquise artigos acadêmicos de forma precisa e rápida, usando prompts de NLP para descrever o que você procura. Destaques:

-   **Resumos Personalizados**: Cada artigo apresenta um resumo gerado com base no seu contexto de pesquisa.
-   **Explicações Detalhadas**: Entenda por que cada artigo foi selecionado com base no prompt fornecido e no seu perfil de pesquisa.
-   **Ferramentas de Tradução**: Traduza artigos e peça resumos adicionais com facilidade.

### 2. **Assistente de Escrita**

Aproveite um editor de texto integrado que facilita a produção acadêmica:

-   **Normas Acadêmicas**: Suporte completo para formatação de trabalhos e normas de publicação.
-   **Sugestão de Fontes**: Descubra novas referências relevantes diretamente no diretório CAPES.

## O Poder do Knowledge Graph

O Knowledge Graph é um diferencial crucial da plataforma AntLabyrinth, oferecendo uma abordagem revolucionária para a pesquisa acadêmica. Aqui está por que ele é tão importante:

### Estrutura e Relacionamentos

-   **Conexões Contextuais**: O grafo mapeia não apenas citações, mas também:

    -   Relações temáticas entre artigos
    -   Evolução temporal de conceitos
    -   Redes de colaboração entre autores
    -   Interdependência entre áreas de conhecimento

-   **Descoberta de Padrões**: Identificação automática de:
    -   Tendências emergentes em campos de pesquisa
    -   Grupos de pesquisa influentes
    -   Lacunas de conhecimento inexploradas
    -   Pontes interdisciplinares
    -   No escopo, selecionamos nosso esqueleto de grafo para ser um grafo direcionado, você pode e encontrar em [schemas.json](llm-graph-builder/frontend/src/assets/schemas.json).

### Fluxo de Dados

1. **Ingestão e Processamento**:

    - Coleta contínua de artigos do portal CAPES
    - Extração de metadados e conteúdo
    - Geração de embeddings usando modelos NLP
    - Análise de citações e referências

2. **Enriquecimento do Grafo**:

    - Criação automática de nós para artigos, autores e conceitos
    - Estabelecimento de relações baseadas em:
        - Citações diretas e indiretas
        - Similaridade semântica
        - Coautoria e colaborações
        - Palavras-chave e temas

3. **Consulta e Recuperação**:
    - Busca contextual usando algoritmos de traversal
    - Ranqueamento dinâmico baseado em relevância
    - Recomendações personalizadas
    - Análise de caminhos de conhecimento

### Benefícios Práticos

1. **Pesquisa Mais Inteligente**:

    - Resultados mais relevantes e contextualizados
    - Descoberta de conexões não óbvias
    - Sugestões proativas de leitura
    - Mapeamento de campos de pesquisa

2. **Produtividade Aprimorada**:

    - Redução do tempo de busca
    - Identificação rápida de trabalhos relacionados
    - Visualização clara da evolução do conhecimento
    - Suporte à escrita baseado em evidências

3. **Insights Únicos**:
    - Análise de tendências em tempo real
    - Identificação de colaboradores potenciais
    - Mapeamento de lacunas de pesquisa
    - Visualização de redes de conhecimento

## Benefícios da Plataforma

-   **Velocidade e Precisão**: Reduza o tempo necessário para encontrar artigos relevantes.
-   **Integração**: Um ambiente único para busca e escrita acadêmica.
-   **Customização**: Resumos personalizados e ferramentas alinhadas ao seu perfil de pesquisa.

---

## Arquitetura e Tecnologias

-   **Frontend e Backend**: Construídos com [Next.js](https://nextjs.org/) para garantir uma experiência de usuário fluida.
-   **Knowledge Graph**: Baseado no projeto [Neo4j LLM Graph Builder](https://github.com/neo4j-labs/llm-graph-builder), amplamente modificado para buscar arquivos diretamente, com ajustes significativos nas queries GraphQL e prompts para gerenciar dados no banco de grafos.
-   **Banco de Dados**: [Neo4j AuraDB](https://neo4j.com/product/auradb/) e [PostgreSQL](https://neon.tech/), para armazenamento eficiente e escalável.

---

## Configuração do Ambiente

Para executar a plataforma, você precisará configurar as credenciais e os serviços necessários. Siga as instruções abaixo para configurar o ambiente de desenvolvimento.

### 1. Configuração Global

Preencha o arquivo `.env.example` na raiz do projeto com suas credenciais e informações, e renomeie-o para `.env`.

```bash
mv .env.example .env
```

### 2. Configuração Individual para o Dashboard

Na pasta `dashboard`, preencha o `.env.example` com as configurações necessárias e renomeie-o para `.env`.

```bash
cd dashboard
mv .env.example .env
```

---

## Setup dos Serviços Docker

A plataforma utiliza três serviços principais, cada um com uma função específica. Siga as instruções abaixo para configurá-los e iniciá-los.

### 1. Banco de Dados Neo4j (AuraDB)

O serviço Neo4j é utilizado para armazenar e consultar o grafo de conhecimento.

**Arquivo**: `docker-compose-auradb.yml`

```bash
docker-compose -f docker-compose-auradb.yml up -d
```

**Detalhes**:

-   **Volumes**: Persistência de dados, logs, e configurações.
-   **Portas**:
    -   7474: Painel de controle Neo4j.
    -   7687: Comunicação com o banco via protocolo Bolt.
-   **Plugins**: Inclui suporte a APOC e Graph Data Science.

---

### 2. Graph Builder (Backend e Frontend)

O Graph Builder é responsável por criar e manipular o grafo, além de fornecer a interface de consulta.

**Arquivo**: `docker-compose-graph.yml`

```bash
docker-compose -f docker-compose-graph.yml up -d
```

#### Backend:

-   **Função**: Processamento de requisições, comunicação com o Neo4j e geração de embeddings.
-   **Porta**: 8000.

#### Frontend:

-   **Função**: Interface gráfica para visualização e interação com o grafo. Geralmente usado para administrar o banco de dados e monitorar o sistema.
-   **Porta**: 8080.

---

### 3. Banco de Dados PostgreSQL

O serviço PostgreSQL é utilizado para armazenar dados auxiliares da plataforma.

**Arquivo**: `docker-compose-postgresdb.yml`

```bash
docker-compose -f docker-compose-postgresdb.yml up -d
```

**Detalhes**:

-   **Porta**: 5432.
-   **Volumes**: Persistência dos dados do banco.

---

## Executando o Dashboard

Após subir os serviços, você pode rodar o dashboard, que é construído com Next.js.

### Configuração e Execução

1. Navegue até a pasta do dashboard:

    ```bash
    cd dashboard
    ```

2. Instale as dependências com [Bun](https://bun.sh) para maior desempenho:

    ```bash
    bun install
    ```

3. Inicie o servidor de desenvolvimento:

    ```bash
    bun dev
    ```

4. Acesse o dashboard em `http://localhost:3000`.

Agora você pode explorar a plataforma e começar a pesquisar e escrever com mais eficiência!
