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
		model: 'gpt-4o',
		messages: [
			{
				role: 'system',
				content: 'Você é um assistente especializado na correção de artigos acadêmicos conforme as normas ABNT.',
			},
			{
				role: 'user',
				content: `
			  Por favor, corrija o seguinte trecho de acordo com a descrição do problema e a sugestão fornecida:

			  ### Conteúdo
			  ${content}

			  ### Problema
			  ${issue.description}

			  ### Sugestão
			  ${issue.suggestion}

			  Forneça apenas o trecho corrigido, sem incluir qualquer explicação ou comentário adicional.`,
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
