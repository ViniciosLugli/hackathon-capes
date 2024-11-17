import { NextRequest, NextResponse } from 'next/server'
import { LLMGraphBuilderClient } from '@/clients/llm-graph-builder/apiClient'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
	try {
		const { query } = await request.json()

		if (!query) {
			return NextResponse.json({ error: 'Query is required' }, { status: 400 })
		}

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
			question: query,
			session_id: uuidv4(),
			mode: 'graph_vector_fulltext',
			document_names: [],
		})
		const anwser = response.data.info.metric_details.answer.replace('{{', '{').replace('}}', '}')
		return NextResponse.json(JSON.parse(anwser), { status: 200 })
	} catch (error: any) {
		console.error('Error in chat_bot route:', error.message)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
