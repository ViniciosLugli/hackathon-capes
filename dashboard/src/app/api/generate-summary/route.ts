import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
	const { abstract } = await req.json()

	if (!abstract) {
		return new Response('Abstract is required', { status: 400 })
	}

	const stream = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: 'Você é um assistente útil que gera resumos concisos e informativos de resumos acadêmicos em português. Se limite a 250 caracteres sempre.' },
			{
				role: 'user',
				content: `Por favor, forneça um resumo conciso em português do seguinte resumo de artigo acadêmico, destacando os pontos principais e as principais conclusões, como se fosse uma parcela do artigo mesmo:\n\n${abstract}`,
			},
		],
		max_tokens: 300,
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
