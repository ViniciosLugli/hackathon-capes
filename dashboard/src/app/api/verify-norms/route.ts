import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
	const { content, norms } = await req.json()

	if (!content || !norms || norms.length === 0) {
		return new Response('Content and at least one norm are required', { status: 400 })
	}

	const normDescriptions = {
		nbr10719: 'NBR 10719 (Apresentação de Relatórios Técnico-Científicos)',
		nbr10520: 'NBR 10520 (Citação em Documentos)',
		nbr6023: 'NBR 6023 (Referências)',
		nbr6028: 'NBR 6028 (Resumos)',
	}

	const contentWithLineNumbers = content
		.split('\n')
		.map((line, index) => `${index + 1}. ${line}`)
		.join('\n')

	const response = await openai.chat.completions.create({
		model: 'gpt-4o',
		messages: [
			{
				role: 'system',
				content: `Você é um assistente especializado em conformidade de documentos com as normas ABNT.
				Sua única tarefa é analisar o conteúdo fornecido e retornar um **JSON válido** no seguinte formato estrito:

				{
					"normResults": [
						{
							"norm": "nome_da_norma",
							"issues": [
								{
									"description": "Descrição do problema",
									"suggestion": "Sugestão de correção",
									"lines": [1, 2, 3],
									"priority": "low" | "medium" | "high"
								}
							]
						}
					]
				}

				**Apenas JSON deve ser retornado**. Não inclua comentários, explicações ou qualquer texto fora do JSON. Se houver erros no formato, retorne um JSON vazio no mesmo formato.

				Importante: Se precisar citar linhas, use os números disponíveis no conteúdo fornecido. Caso não encontre problemas, retorne:

				{
					"normResults": []
				}
				não use notações de acentro grave para identificar json, apenas retorne o json.
				`,
			},
			{
				role: 'user',
				content: `Verifique se o seguinte conteúdo está em conformidade com as normas ${norms
					.map((norm) => normDescriptions[norm])
					.join(', ')}. Forneça um relatório detalhado no formato JSON especificado, incluindo os números das linhas para cada problema:\n\n${contentWithLineNumbers}`,
			},
		],
		temperature: 0.3,
		max_tokens: 2000,
	})

	const jsonResponse = response.choices[0]?.message?.content

	if (!jsonResponse) {
		return new Response('Failed to generate norm verification results', { status: 500 })
	}

	return new Response(jsonResponse, {
		headers: {
			'Content-Type': 'application/json',
		},
	})
}
