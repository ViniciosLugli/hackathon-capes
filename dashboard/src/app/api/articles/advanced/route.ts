import { NextRequest, NextResponse } from 'next/server'
import { LLMGraphBuilderClient } from '@/clients/llm-graph-builder/apiClient'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
	try {
		const { query } = await request.json()

		if (!query) {
			return NextResponse.json({ error: 'Query is required' }, { status: 400 })
		}

		const client = new LLMGraphBuilderClient(process.env.LLM_GRAPH_BUILDER_URL)

		const params = {
			uri: process.env.NEO4J_URI,
			database: 'neo4j',
			userName: process.env.NEO4J_USERNAME,
			password: process.env.NEO4J_PASSWORD,
			model: 'openai_gpt_4o_mini',
			question: query,
			session_id: uuidv4(),
			mode: 'graph_vector_fulltext',
			document_names: [],
		}

		const response = await client.chatBot(params)

		return NextResponse.json(JSON.parse(response.data.message), { status: 200 })
	} catch (error: any) {
		console.error('Error in chat_bot route:', error.message)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
