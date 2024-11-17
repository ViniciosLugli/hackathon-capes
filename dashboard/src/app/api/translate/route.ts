import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
	const { content, issue } = await req.json()

	if (!content || !issue) {
		return new Response('Content and issue are required', { status: 400 })
	}

	const response = await openai.chat.completions.create({
		model: 'gpt-4',
		messages: [
			{
				role: 'system',
				content: 'Você é um assistente especializado em corrigir problemas em artigos acadêmicos de acordo com as normas ABNT.',
			},
			{
				role: 'user',
				content: `Corrija o seguinte trecho de acordo com a descrição do problema e a sugestão fornecida:

Conteúdo: ${content}

Problema: ${issue.description}
Sugestão: ${issue.suggestion}

Por favor, forneça o trecho corrigido em texto puro, apenas o conteúdo corrigindo`,
			},
		],
		temperature: 0.7,
		max_tokens: 500,
	})

	const correctedContent = response.choices[0]?.message?.content

	if (!correctedContent) {
		return new Response('Failed to generate correction', { status: 500 })
	}

	return new Response(JSON.stringify({ correctedContent }), {
		headers: {
			'Content-Type': 'application/json',
		},
	})
}
