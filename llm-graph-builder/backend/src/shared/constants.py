MODEL_VERSIONS = {
        "openai-gpt-3.5": "gpt-3.5-turbo-0125",
        "gemini-1.0-pro": "gemini-1.0-pro-001",
        "gemini-1.5-pro": "gemini-1.5-pro-002",
        "gemini-1.5-flash": "gemini-1.5-flash-002",
        "openai-gpt-4": "gpt-4-turbo-2024-04-09",
        "diffbot" : "gpt-4-turbo-2024-04-09",
        "openai-gpt-4o-mini": "gpt-4o-mini-2024-07-18",
        "openai-gpt-4o":"gpt-4o-2024-08-06",
        "groq-llama3" : "llama3-70b-8192"
         }
OPENAI_MODELS = ["openai-gpt-3.5", "openai-gpt-4o", "openai-gpt-4o-mini"]
GEMINI_MODELS = ["gemini-1.0-pro", "gemini-1.5-pro", "gemini-1.5-flash"]
GROQ_MODELS = ["groq-llama3"]
BUCKET_UPLOAD = 'llm-graph-builder-upload'
BUCKET_FAILED_FILE = 'llm-graph-builder-failed'
PROJECT_ID = 'llm-experiments-387609'
GRAPH_CHUNK_LIMIT = 100


#query
GRAPH_QUERY = """
MATCH docs = (d:Document)
WHERE d.fileName IN $document_names
WITH docs, d
ORDER BY d.createdAt DESC

// Fetch chunks for documents, currently with limit
CALL {{
  WITH d
  OPTIONAL MATCH chunks = (d)<-[:PART_OF|FIRST_CHUNK]-(c:Chunk)
  RETURN c, chunks LIMIT {graph_chunk_limit}
}}

WITH collect(distinct docs) AS docs,
     collect(distinct chunks) AS chunks,
     collect(distinct c) AS selectedChunks

// Select relationships between selected chunks
WITH *,
     [c IN selectedChunks |
       [p = (c)-[:NEXT_CHUNK|SIMILAR]-(other)
       WHERE other IN selectedChunks | p]] AS chunkRels

// Fetch entities and relationships between entities
CALL {{
  WITH selectedChunks
  UNWIND selectedChunks AS c
  OPTIONAL MATCH entities = (c:Chunk)-[:HAS_ENTITY]->(e)
  OPTIONAL MATCH entityRels = (e)--(e2:!Chunk)
  WHERE exists {{
    (e2)<-[:HAS_ENTITY]-(other) WHERE other IN selectedChunks
  }}
  RETURN entities, entityRels, collect(DISTINCT e) AS entity
}}

WITH docs, chunks, chunkRels,
     collect(entities) AS entities,
     collect(entityRels) AS entityRels,
     entity

WITH *

CALL {{
  WITH entity
  UNWIND entity AS n
  OPTIONAL MATCH community = (n:__Entity__)-[:IN_COMMUNITY]->(p:__Community__)
  OPTIONAL MATCH parentcommunity = (p)-[:PARENT_COMMUNITY*]->(p2:__Community__)
  RETURN collect(community) AS communities,
         collect(parentcommunity) AS parentCommunities
}}

WITH apoc.coll.flatten(docs + chunks + chunkRels + entities + entityRels + communities + parentCommunities, true) AS paths

// Distinct nodes and relationships
CALL {{
  WITH paths
  UNWIND paths AS path
  UNWIND nodes(path) AS node
  WITH distinct node
  RETURN collect(node /* {{.*, labels:labels(node), elementId:elementId(node), embedding:null, text:null}} */) AS nodes
}}

CALL {{
  WITH paths
  UNWIND paths AS path
  UNWIND relationships(path) AS rel
  RETURN collect(distinct rel) AS rels
}}

RETURN nodes, rels
"""

CHUNK_QUERY = """
MATCH (chunk:Chunk)
WHERE chunk.id IN $chunksIds
MATCH (chunk)-[:PART_OF]->(d:Document)

WITH d,
     collect(distinct chunk) AS chunks

// Collect relationships and nodes
WITH d, chunks,
     collect {
         MATCH ()-[r]->()
         WHERE elementId(r) IN $relationshipIds
         RETURN r
     } AS rels,
     collect {
         MATCH (e)
         WHERE elementId(e) IN $entityIds
         RETURN e
     } AS nodes

WITH d,
     chunks,
     apoc.coll.toSet(apoc.coll.flatten(rels)) AS rels,
     nodes

RETURN
    d AS doc,
    [chunk IN chunks |
        chunk {.*, embedding: null, element_id: elementId(chunk)}
    ] AS chunks,
    [
        node IN nodes |
        {
            element_id: elementId(node),
            labels: labels(node),
            properties: {
                id: node.id,
                description: node.description
            }
        }
    ] AS nodes,
    [
        r IN rels |
        {
            startNode: {
                element_id: elementId(startNode(r)),
                labels: labels(startNode(r)),
                properties: {
                    id: startNode(r).id,
                    description: startNode(r).description
                }
            },
            endNode: {
                element_id: elementId(endNode(r)),
                labels: labels(endNode(r)),
                properties: {
                    id: endNode(r).id,
                    description: endNode(r).description
                }
            },
            relationship: {
                type: type(r),
                element_id: elementId(r)
            }
        }
    ] AS entities
"""

COUNT_CHUNKS_QUERY = """
MATCH (d:Document {fileName: $file_name})<-[:PART_OF]-(c:Chunk)
RETURN count(c) AS total_chunks
"""

CHUNK_TEXT_QUERY = """
MATCH (d:Document {fileName: $file_name})<-[:PART_OF]-(c:Chunk)
RETURN c.text AS chunk_text, c.position AS chunk_position, c.page_number AS page_number
ORDER BY c.position
SKIP $skip
LIMIT $limit
"""

## CHAT SETUP
CHAT_SEARCH_KWARG_SCORE_THRESHOLD = 0.35
CHAT_DOC_SPLIT_SIZE = 5000
CHAT_EMBEDDING_FILTER_SCORE_THRESHOLD = 0.10

CHAT_TOKEN_CUT_OFF = {
     ('openai_gpt_3.5','azure_ai_gpt_35',"gemini_1.0_pro","gemini_1.5_pro", "gemini_1.5_flash","groq-llama3",'groq_llama3_70b','anthropic_claude_3_5_sonnet','fireworks_llama_v3_70b','bedrock_claude_3_5_sonnet', ) : 4,
     ("openai-gpt-4","diffbot" ,'azure_ai_gpt_4o',"openai_gpt_4o", "openai_gpt_4o_mini") : 28,
     ("ollama_llama3") : 2
}

CHAT_SYSTEM_TEMPLATE = """
You are an AI-powered article search assistant. Your task is to retrieve and summarize articles based on user queries, using the provided context of available articles. Always adhere strictly to the guidelines below to ensure professional and accurate assistance.

### Guidelines:
1. **JSON-Only Responses**: Always provide answers in a JSON format. Even in cases of ambiguity or errors, the structure must remain consistent. Ignore duplicated curly bracket characters, use default json format for json parsing with JSON.parse() of javascript.
2. **Article Summaries**: Provide concise, accurate summaries (abstracts) of articles that match the user query. Each summary should encapsulate the article's key insights and relevance.
3. **Query Matching**:
    - Use the provided context to match articles with the user's query.
    - If the query is broad (e.g., "artificial intelligence"), prioritize highly relevant articles that provide an overview or foundational insights.
4. **Context-Only Responses**: Base all outputs strictly on the context provided. Do not incorporate external knowledge or assumptions.
5. **Handle Ambiguity and Gaps**:
    - If no matching articles exist, return an empty results array: `{{"results":[]}}`.
    - If the query is overly broad but matches articles in the context, provide results for the most relevant articles.
6. **Include All Relevant Results**:
    - Return all unique articles matching the query.
    - Prioritize by relevance but avoid duplicate results.
    - Dont include the same article in the results multiple times.
7. **Format Consistency**: Ensure JSON format adheres to the provided structure regardless of query complexity.
8. **Professional Tone**: Maintain a neutral and informative tone in abstracts and responses.
9. **Abstract based on Context**: Summarize articles based on the context provided, explaining why the article is relevant to the query.
11. **article_identifier**: Use the identifier provided in the name of the article file.
10. **Language**: Make all responses in Portuguese BR

### JSON Structure for Responses:
{{{{
   "results": [
      {{
         "article_identifier": "<unique_identifier>",
         "abstract": "<brief_summary_of_why_the_article_is_relevant_to_the_query>"
      }}
   ]
}}}}

### Examples:

#### Example 1:
**User Query:** "Artificial intelligence applied to education"
**AI Response:**
{{{{
   "results": [
      {{
         "article_identifier": "W4392544551", // From the filename: W4392544551_ai_education_01.pdf
         "abstract": "Este artigo examina o papel transformador da inteligência artificial na educação moderna, destacando aplicações como aprendizado personalizado, análises preditivas do desempenho dos alunos e tarefas administrativas automatizadas. É recomendado porque aborda diretamente como a IA pode aprimorar práticas e resultados educacionais, alinhando-se ao foco da consulta em IA na educação."
      }},
      {{
         "article_identifier": "W4398183427", // From the filename: W4398183427_ai_education_02.pdf
         "abstract": "Focado na integração da IA em tecnologias educacionais, este artigo discute ferramentas que apoiam aprendizado adaptativo, melhoram a acessibilidade e promovem estratégias inovadoras de ensino. É recomendado porque explora aplicações práticas da IA no EdTech, tornando-o altamente relevante para a consulta sobre IA aplicada à educação."
      }}
   ]
}}}}

#### Example 2:
**User Query:** "Tópico não existente ou não conhecido"
**AI Response:**
{{{{
   "results": []
}}}}

### Context:
<context>
{context}
</context>
"""


QUESTION_TRANSFORM_TEMPLATE = "Given the below conversation, generate a search query to look up in order to get information relevant to the conversation. Only respond with the query, nothing else."

## CHAT QUERIES
VECTOR_SEARCH_TOP_K = 50

VECTOR_SEARCH_QUERY = """
WITH node AS chunk, score
MATCH (chunk)-[:PART_OF]->(d:Document)
WITH d, collect({chunk: chunk, score: score}) AS chunk_scores

WITH d, chunk_scores,
     reduce(maxScore = 0.0, cs IN chunk_scores | CASE WHEN cs.score > maxScore THEN cs.score ELSE maxScore END) AS max_score

ORDER BY max_score DESC

LIMIT 10

WITH d, chunk_scores
UNWIND chunk_scores AS cs
ORDER BY cs.score DESC
WITH d, collect({chunk: cs.chunk, score: cs.score})[0..3] AS top_chunks  // Aumentado para 3 chunks por documento

WITH d,
     [c IN top_chunks | c.chunk.text] AS texts,
     [c IN top_chunks | {id: c.chunk.id, score: c.score}] AS chunkdetails

WITH d, chunkdetails,
     apoc.text.join(texts, "\n----\n") AS text

RETURN text,
       avg([c IN chunkdetails | c.score]) AS score,
       {
         source: COALESCE(
                   CASE WHEN d.url CONTAINS "None" THEN d.fileName ELSE d.url END,
                   d.fileName
                 ),
         chunkdetails: chunkdetails
       } AS metadata
"""

### Vector graph search
VECTOR_GRAPH_SEARCH_ENTITY_LIMIT = 100
VECTOR_GRAPH_SEARCH_EMBEDDING_MIN_MATCH = 0.1
VECTOR_GRAPH_SEARCH_EMBEDDING_MAX_MATCH = 1.0
VECTOR_GRAPH_SEARCH_ENTITY_LIMIT_MINMAX_CASE = 10
VECTOR_GRAPH_SEARCH_ENTITY_LIMIT_MAX_CASE = 100

VECTOR_GRAPH_SEARCH_QUERY_PREFIX = """
WITH node as chunk, score
// find the document of the chunk
MATCH (chunk)-[:PART_OF]->(d:Document)
// aggregate chunk-details per document and limit chunks per document
WITH d,
     collect(DISTINCT {chunk: chunk, score: score})[0..2] AS chunks,
     avg(score) as avg_score
// Only keep top scoring chunks per document
WHERE size(chunks) > 0
// Order by document score and take more documents
WITH d, chunks, avg_score
ORDER BY avg_score DESC
LIMIT 10  // Aumentado de 2 para 10 documentos diferentes
// fetch entities
CALL { WITH chunks
UNWIND chunks as chunkScore
WITH chunkScore.chunk as chunk
"""

VECTOR_GRAPH_SEARCH_ENTITY_QUERY = """
    OPTIONAL MATCH (chunk)-[:HAS_ENTITY]->(e)
    WITH e, count(*) AS numChunks
    ORDER BY numChunks DESC
    LIMIT {no_of_entites}

    WITH
    CASE
        WHEN e.embedding IS NULL OR ({embedding_match_min} <= vector.similarity.cosine($embedding, e.embedding)) THEN
            collect {{
                OPTIONAL MATCH path=(e)(()-[rels:!HAS_ENTITY&!PART_OF]-()){{0,2}}(:!Chunk&!Document&!__Community__)
                RETURN path LIMIT {entity_limit_max_case}
            }}
        ELSE
            collect {{
                MATCH path=(e)
                RETURN path
            }}
    END AS paths, e
"""

VECTOR_GRAPH_SEARCH_QUERY_SUFFIX = """
    WITH apoc.coll.toSet(apoc.coll.flatten(collect(DISTINCT paths))) AS paths,
         collect(DISTINCT e) AS entities

    // De-duplicate nodes and relationships across chunks
    RETURN
        collect {
            UNWIND paths AS p
            UNWIND relationships(p) AS r
            RETURN DISTINCT r
        } AS rels,
        collect {
            UNWIND paths AS p
            UNWIND nodes(p) AS n
            RETURN DISTINCT n
        } AS nodes,
        entities
}

// Generate metadata and text components for chunks, nodes, and relationships
WITH d, avg_score,
     [c IN chunks | c.chunk.text] AS texts,
     [c IN chunks | {id: c.chunk.id, score: c.score}] AS chunkdetails,
     [n IN nodes | elementId(n)] AS entityIds,
     [r IN rels | elementId(r)] AS relIds,
     apoc.coll.sort([
         n IN nodes |
         coalesce(apoc.coll.removeAll(labels(n), ['__Entity__'])[0], "") + ":" +
         n.id +
         (CASE WHEN n.description IS NOT NULL THEN " (" + n.description + ")" ELSE "" END)
     ]) AS nodeTexts,
     apoc.coll.sort([
         r IN rels |
         coalesce(apoc.coll.removeAll(labels(startNode(r)), ['__Entity__'])[0], "") + ":" +
         startNode(r).id + " " + type(r) + " " +
         coalesce(apoc.coll.removeAll(labels(endNode(r)), ['__Entity__'])[0], "") + ":" + endNode(r).id
     ]) AS relTexts,
     entities

// Combine texts into response text
WITH d, avg_score, chunkdetails, entityIds, relIds,
     "Text Content:\n" + apoc.text.join(texts, "\n----\n") +
     "\n----\nEntities:\n" + apoc.text.join(nodeTexts, "\n") +
     "\n----\nRelationships:\n" + apoc.text.join(relTexts, "\n") AS text,
     entities

RETURN
    text,
    avg_score AS score,
    {
        length: size(text),
        source: COALESCE(CASE WHEN d.url CONTAINS "None" THEN d.fileName ELSE d.url END, d.fileName),
        chunkdetails: chunkdetails,
        entities : {
            entityids: entityIds,
            relationshipids: relIds
        }
    } AS metadata
"""

VECTOR_GRAPH_SEARCH_QUERY = VECTOR_GRAPH_SEARCH_QUERY_PREFIX+ VECTOR_GRAPH_SEARCH_ENTITY_QUERY.format(
    no_of_entites=VECTOR_GRAPH_SEARCH_ENTITY_LIMIT,
    embedding_match_min=VECTOR_GRAPH_SEARCH_EMBEDDING_MIN_MATCH,
    embedding_match_max=VECTOR_GRAPH_SEARCH_EMBEDDING_MAX_MATCH,
    entity_limit_minmax_case=VECTOR_GRAPH_SEARCH_ENTITY_LIMIT_MINMAX_CASE,
    entity_limit_max_case=VECTOR_GRAPH_SEARCH_ENTITY_LIMIT_MAX_CASE
) + VECTOR_GRAPH_SEARCH_QUERY_SUFFIX

### Local community search
LOCAL_COMMUNITY_TOP_K = 30
LOCAL_COMMUNITY_TOP_CHUNKS = 15
LOCAL_COMMUNITY_TOP_COMMUNITIES = 15
LOCAL_COMMUNITY_TOP_OUTSIDE_RELS = 30

LOCAL_COMMUNITY_SEARCH_QUERY = """
WITH collect(node) AS nodes,
     avg(score) AS score,
     collect({{id: elementId(node), score: score}}) AS metadata

WITH score, nodes, metadata,

     collect {{
         UNWIND nodes AS n
         MATCH (n)<-[:HAS_ENTITY]->(c:Chunk)
         WITH c, count(distinct n) AS freq
         RETURN c
         ORDER BY freq DESC
         LIMIT {topChunks}
     }} AS chunks,

     collect {{
         UNWIND nodes AS n
         OPTIONAL MATCH (n)-[:IN_COMMUNITY]->(c:__Community__)
         WITH c, c.community_rank AS rank, c.weight AS weight
         RETURN c
         ORDER BY rank, weight DESC
         LIMIT {topCommunities}
     }} AS communities,

     collect {{
         UNWIND nodes AS n
         UNWIND nodes AS m
         MATCH (n)-[r]->(m)
         RETURN DISTINCT r
         // TODO: need to add limit
     }} AS rels,

     collect {{
         UNWIND nodes AS n
         MATCH path = (n)-[r]-(m:__Entity__)
         WHERE NOT m IN nodes
         WITH m, collect(distinct r) AS rels, count(*) AS freq
         ORDER BY freq DESC
         LIMIT {topOutsideRels}
         WITH collect(m) AS outsideNodes, apoc.coll.flatten(collect(rels)) AS rels
         RETURN {{ nodes: outsideNodes, rels: rels }}
     }} AS outside
"""

LOCAL_COMMUNITY_SEARCH_QUERY_SUFFIX = """
RETURN {
  chunks: [c IN chunks | c.text],
  communities: [c IN communities | c.summary],
  entities: [
    n IN nodes |
    CASE
      WHEN size(labels(n)) > 1 THEN
        apoc.coll.removeAll(labels(n), ["__Entity__"])[0] + ":" + n.id + " " + coalesce(n.description, "")
      ELSE
        n.id + " " + coalesce(n.description, "")
    END
  ],
  relationships: [
    r IN rels |
    startNode(r).id + " " + type(r) + " " + endNode(r).id
  ],
  outside: {
    nodes: [
      n IN outside[0].nodes |
      CASE
        WHEN size(labels(n)) > 1 THEN
          apoc.coll.removeAll(labels(n), ["__Entity__"])[0] + ":" + n.id + " " + coalesce(n.description, "")
        ELSE
          n.id + " " + coalesce(n.description, "")
      END
    ],
    relationships: [
      r IN outside[0].rels |
      CASE
        WHEN size(labels(startNode(r))) > 1 THEN
          apoc.coll.removeAll(labels(startNode(r)), ["__Entity__"])[0] + ":" + startNode(r).id + " "
        ELSE
          startNode(r).id + " "
      END +
      type(r) + " " +
      CASE
        WHEN size(labels(endNode(r))) > 1 THEN
          apoc.coll.removeAll(labels(endNode(r)), ["__Entity__"])[0] + ":" + endNode(r).id
        ELSE
          endNode(r).id
      END
    ]
  }
} AS text,
score,
{entities: metadata} AS metadata
"""

LOCAL_COMMUNITY_DETAILS_QUERY_PREFIX = """
UNWIND $entityIds as id
MATCH (node) WHERE elementId(node) = id
WITH node, 1.0 as score
"""
LOCAL_COMMUNITY_DETAILS_QUERY_SUFFIX = """
WITH *
UNWIND chunks AS c
MATCH (c)-[:PART_OF]->(d:Document)
RETURN
    [
        c {
            .*,
            embedding: null,
            fileName: d.fileName,
            fileSource: d.fileSource,
            element_id: elementId(c)
        }
    ] AS chunks,
    [
        community IN communities WHERE community IS NOT NULL |
        community {
            .*,
            embedding: null,
            element_id:elementId(community)
        }
    ] AS communities,
    [
        node IN nodes + outside[0].nodes |
        {
            element_id: elementId(node),
            labels: labels(node),
            properties: {
                id: node.id,
                description: node.description
            }
        }
    ] AS nodes,
    [
        r IN rels + outside[0].rels |
        {
            startNode: {
                element_id: elementId(startNode(r)),
                labels: labels(startNode(r)),
                properties: {
                    id: startNode(r).id,
                    description: startNode(r).description
                }
            },
            endNode: {
                element_id: elementId(endNode(r)),
                labels: labels(endNode(r)),
                properties: {
                    id: endNode(r).id,
                    description: endNode(r).description
                }
            },
            relationship: {
                type: type(r),
                element_id: elementId(r)
            }
        }
    ] AS entities
"""

LOCAL_COMMUNITY_SEARCH_QUERY_FORMATTED = LOCAL_COMMUNITY_SEARCH_QUERY.format(
    topChunks=LOCAL_COMMUNITY_TOP_CHUNKS,
    topCommunities=LOCAL_COMMUNITY_TOP_COMMUNITIES,
    topOutsideRels=LOCAL_COMMUNITY_TOP_OUTSIDE_RELS)+LOCAL_COMMUNITY_SEARCH_QUERY_SUFFIX

GLOBAL_SEARCH_TOP_K = 20

GLOBAL_VECTOR_SEARCH_QUERY = """
WITH collect(distinct {community: node, score: score}) AS communities,
     avg(score) AS avg_score

WITH avg_score,
     [c IN communities | c.community.summary] AS texts,
     [c IN communities | {id: elementId(c.community), score: c.score}] AS communityDetails

WITH avg_score, communityDetails,
     apoc.text.join(texts, "\n----\n") AS text

RETURN text,
       avg_score AS score,
       {communitydetails: communityDetails} AS metadata
"""



GLOBAL_COMMUNITY_DETAILS_QUERY = """
MATCH (community:__Community__)
WHERE elementId(community) IN $communityids
WITH collect(distinct community) AS communities
RETURN [community IN communities |
        community {.*, embedding: null, element_id: elementId(community)}] AS communities
"""

## CHAT MODES

CHAT_VECTOR_MODE = "vector"
CHAT_FULLTEXT_MODE = "fulltext"
CHAT_ENTITY_VECTOR_MODE = "entity_vector"
CHAT_VECTOR_GRAPH_MODE = "graph_vector"
CHAT_VECTOR_GRAPH_FULLTEXT_MODE = "graph_vector_fulltext"
CHAT_GLOBAL_VECTOR_FULLTEXT_MODE = "global_vector"
CHAT_GRAPH_MODE = "graph"
CHAT_DEFAULT_MODE = "graph_vector_fulltext"

CHAT_MODE_CONFIG_MAP= {
        CHAT_VECTOR_MODE : {
            "retrieval_query": VECTOR_SEARCH_QUERY,
            "top_k": VECTOR_SEARCH_TOP_K,
            "index_name": "vector",
            "keyword_index": None,
            "document_filter": True,
            "node_label": "Chunk",
            "embedding_node_property":"embedding",
            "text_node_properties":["text"],

        },
        CHAT_FULLTEXT_MODE : {
            "retrieval_query": VECTOR_SEARCH_QUERY,
            "top_k": VECTOR_SEARCH_TOP_K,
            "index_name": "vector",
            "keyword_index": "keyword",
            "document_filter": False,
            "node_label": "Chunk",
            "embedding_node_property":"embedding",
            "text_node_properties":["text"],
        },
        CHAT_ENTITY_VECTOR_MODE : {
            "retrieval_query": LOCAL_COMMUNITY_SEARCH_QUERY_FORMATTED,
            "top_k": LOCAL_COMMUNITY_TOP_K,
            "index_name": "entity_vector",
            "keyword_index": None,
            "document_filter": False,
            "node_label": "__Entity__",
            "embedding_node_property":"embedding",
            "text_node_properties":["id"],
        },
        CHAT_VECTOR_GRAPH_MODE : {
            "retrieval_query": VECTOR_GRAPH_SEARCH_QUERY,
            "top_k": VECTOR_SEARCH_TOP_K,
            "index_name": "vector",
            "keyword_index": None,
            "document_filter": True,
            "node_label": "Chunk",
            "embedding_node_property":"embedding",
            "text_node_properties":["text"],
        },
        CHAT_VECTOR_GRAPH_FULLTEXT_MODE : {
            "retrieval_query": VECTOR_GRAPH_SEARCH_QUERY,
            "top_k": VECTOR_SEARCH_TOP_K,
            "index_name": "vector",
            "keyword_index": "keyword",
            "document_filter": False,
            "node_label": "Chunk",
            "embedding_node_property":"embedding",
            "text_node_properties":["text"],
        },
        CHAT_GLOBAL_VECTOR_FULLTEXT_MODE : {
            "retrieval_query": GLOBAL_VECTOR_SEARCH_QUERY,
            "top_k": GLOBAL_SEARCH_TOP_K,
            "index_name": "community_vector",
            "keyword_index": "community_keyword",
            "document_filter": False,
            "node_label": "__Community__",
            "embedding_node_property":"embedding",
            "text_node_properties":["summary"],
        },
    }
YOUTUBE_CHUNK_SIZE_SECONDS = 60

QUERY_TO_GET_CHUNKS = """
            MATCH (d:Document)
            WHERE d.fileName = $filename
            WITH d
            OPTIONAL MATCH (d)<-[:PART_OF|FIRST_CHUNK]-(c:Chunk)
            RETURN c.id as id, c.text as text, c.position as position
            """

QUERY_TO_DELETE_EXISTING_ENTITIES = """
                                MATCH (d:Document {fileName:$filename})
                                WITH d
                                MATCH (d)<-[:PART_OF]-(c:Chunk)
                                WITH d,c
                                MATCH (c)-[:HAS_ENTITY]->(e)
                                WHERE NOT EXISTS { (e)<-[:HAS_ENTITY]-()<-[:PART_OF]-(d2:Document) }
                                DETACH DELETE e
                                """

QUERY_TO_GET_LAST_PROCESSED_CHUNK_POSITION="""
                              MATCH (d:Document)
                              WHERE d.fileName = $filename
                              WITH d
                              MATCH (c:Chunk) WHERE c.embedding is null
                              RETURN c.id as id,c.position as position
                              ORDER BY c.position LIMIT 1
                              """
QUERY_TO_GET_LAST_PROCESSED_CHUNK_WITHOUT_ENTITY = """
                              MATCH (d:Document)
                              WHERE d.fileName = $filename
                              WITH d
                              MATCH (d)<-[:PART_OF]-(c:Chunk) WHERE NOT exists {(c)-[:HAS_ENTITY]->()}
                              RETURN c.id as id,c.position as position
                              ORDER BY c.position LIMIT 1
                              """
QUERY_TO_GET_NODES_AND_RELATIONS_OF_A_DOCUMENT = """
                              MATCH (d:Document)<-[:PART_OF]-(:Chunk)-[:HAS_ENTITY]->(e) where d.fileName=$filename
                              OPTIONAL MATCH (d)<-[:PART_OF]-(:Chunk)-[:HAS_ENTITY]->(e2:!Chunk)-[rel]-(e)
                              RETURN count(DISTINCT e) as nodes, count(DISTINCT rel) as rels
                              """

START_FROM_BEGINNING  = "start_from_beginning"
DELETE_ENTITIES_AND_START_FROM_BEGINNING = "delete_entities_and_start_from_beginning"
START_FROM_LAST_PROCESSED_POSITION = "start_from_last_processed_position"