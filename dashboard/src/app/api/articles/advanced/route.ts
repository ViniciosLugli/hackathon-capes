import { NextRequest, NextResponse } from 'next/server'
import { LLMGraphBuilderClient } from '@/clients/llm-graph-builder/apiClient'
import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
	try {
		const { query } = await request.json()

		if (!query) {
			return NextResponse.json({ error: 'Query is required' }, { status: 400 })
		}

		let fquery = query
		if (query.length > 50) {
			const response = await openai.chat.completions.create({
				model: 'gpt-4o-mini',
				messages: [
					{ role: 'system', content: 'Você é um assistente útil que gera resumos concisos e informativos de resumos acadêmicos em português.' },
					{
						role: 'user',
						content: `Com base no seguinte resumo de artigo acadêmico, extraia três palavras relevantes em inglês separado por espaços na mesma linha sem mais informações além das palavras para uso em mecanismos de busca:\n\n${query}`,
					},
				],
				max_tokens: 150,
			})

			fquery = response.choices[0]?.message?.content || query
		}
		console.log('Final query:', fquery)

		const LLM_GRAPH_BUILDER_API_URL = process.env.LLM_GRAPH_BUILDER_API_URL
		if (!LLM_GRAPH_BUILDER_API_URL) {
			throw new Error('LLM Graph Builder API URL is not configured')
		}

		const llmGraphBuilderClient = new LLMGraphBuilderClient(LLM_GRAPH_BUILDER_API_URL)

		const { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, NEO4J_DATABASE, DEFAULT_LLM_GRAPH_BUILDER_MODEL } = process.env
		if (!NEO4J_URI || !NEO4J_USERNAME || !NEO4J_PASSWORD || !NEO4J_DATABASE || !DEFAULT_LLM_GRAPH_BUILDER_MODEL) {
			throw new Error('Neo4j credentials are not properly configured')
		}

		const response = await llmGraphBuilderClient.chatBot({
			uri: NEO4J_URI,
			database: NEO4J_DATABASE,
			userName: NEO4J_USERNAME,
			password: NEO4J_PASSWORD,
			model: DEFAULT_LLM_GRAPH_BUILDER_MODEL,
			question: fquery,
			session_id: uuidv4(),
			mode: 'graph_vector_fulltext',
			document_names: [],
		})

		const answer = JSON.parse(response.data.info.metric_details.answer.replace('{{', '{').replace('}}', '}').replace('```json', '').replace('```', ''))
		console.log(answer)
		const parsedResponsePromises = answer.results.map(async (result: any) => {
			if (!result.article_identifier) {
				console.warn('Missing article_identifier in result:', result)
				return null
			}

			const articleData = await prisma.article.findUnique({
				where: {
					id: result.article_identifier,
				},
			})

			if (!articleData) {
				console.warn(`Article not found for id: ${result.article_identifier}`)
				return null
			}

			return {
				...articleData,
				aiResume: result.abstract,
			}
		})

		const parsedResponse = (await Promise.all(parsedResponsePromises)).filter(Boolean)

		return NextResponse.json(parsedResponse, { status: 200 })
	} catch (error: any) {
		console.error('Error in chat_bot route:', error.message)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
