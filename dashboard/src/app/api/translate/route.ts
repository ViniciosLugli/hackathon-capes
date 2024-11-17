import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
	const { article } = await req.json()

	if (!article) {
		return new Response('Article is required', { status: 400 })
	}

	const stream = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: 'Você é um tradutor que converte textos para o português. Traduza o texto exatamente como está, sem modificar nada no conteúdo ou no formato.' },
			{
				role: 'user',
				content: `Por favor, traduza o seguinte texto para o português sem alterar nada no conteúdo ou no formato:\n\n${article}`,
			},
		],
		stream: true,
	})

	return new Response(
		new ReadableStream({
			async start(controller) {
				for await (const chunk of stream) {
					const content = chunk.choices[0]?.delta?.content || ''
					controller.enqueue(content)
				}
				controller.close()
			},
		}),
		{
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Transfer-Encoding': 'chunked',
			},
		}
	)
}
