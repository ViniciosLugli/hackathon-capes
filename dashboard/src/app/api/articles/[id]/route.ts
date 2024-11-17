import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { LLMGraphBuilderClient } from '@/clients/llm-graph-builder/apiClient'

const prisma = new PrismaClient()

interface RouteParams {
	params: Promise<{ id: string }>
}

interface LLMGraphBuilderResponse {
	status: string
	message?: string
}
export async function GET(request: NextRequest, { params }: RouteParams) {
	const { id } = await params

	if (!id) {
		return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
	}

	try {
		const article = await prisma.article.findUnique({
			where: { id },
			include: {
				topics: true,
				citationsMade: true,
				citationsReceived: true,
			},
		})

		if (!article) {
			return NextResponse.json({ error: 'Article not found' }, { status: 404 })
		}

		return NextResponse.json(
			{
				data: article,
				success: true,
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error('Error in GET API route:', error)

		return NextResponse.json(
			{
				error: 'Internal server error',
				success: false,
				message: error instanceof Error ? error.message : 'Unknown error occurred',
			},
			{ status: 500 }
		)
	} finally {
		await prisma.$disconnect()
	}
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const { id } = await params

	if (!id) {
		return NextResponse.json({ error: 'Article ID is required', success: false }, { status: 400 })
	}

	try {
		const article = await prisma.article.findUnique({
			where: { id },
		})

		if (!article) {
			return NextResponse.json({ error: 'Article not found', success: false }, { status: 404 })
		}

		let llmCleanupSuccess = false
		try {
			const filenames = [`${id}.pdf`]
			const sourceTypes = ['local file']

			if (!filenames.length || !sourceTypes.length) {
				return NextResponse.json(
					{
						error: 'Filenames and source types are required',
						success: false,
					},
					{ status: 422 }
				)
			}

			const llmGraphBuilderClient = new LLMGraphBuilderClient(process.env.LLM_GRAPH_BUILDER_API_URL)
			const { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, NEO4J_DATABASE } = process.env

			if (!NEO4J_URI || !NEO4J_USERNAME || !NEO4J_PASSWORD || !NEO4J_DATABASE) {
				throw new Error('Neo4j credentials are not properly configured')
			}

			const result: LLMGraphBuilderResponse = await llmGraphBuilderClient.deleteDocumentAndEntities({
				uri: NEO4J_URI,
				userName: NEO4J_USERNAME,
				password: NEO4J_PASSWORD,
				database: NEO4J_DATABASE,
				deleteEntities: 'true',
				filenames,
				source_types: sourceTypes,
			})

			if (result.status !== 'Success') {
				throw new Error(result.message || 'Unknown error occurred in LLM Graph Builder')
			}

			llmCleanupSuccess = true
		} catch (llmError) {
			console.error('LLM Graph Builder deletion failed:', llmError)
			return NextResponse.json(
				{
					error: 'Failed to delete article from LLM graph',
					success: false,
					details: llmError instanceof Error ? llmError.message : 'Unknown LLM graph error',
				},
				{ status: 500 }
			)
		}

		try {
			await prisma.$transaction(async (tx) => {
				await tx.citation.deleteMany({
					where: {
						OR: [{ citingArticleId: id }, { citedArticleId: id }],
					},
				})

				await tx.article.update({
					where: { id },
					data: {
						topics: {
							set: [],
						},
					},
				})

				await tx.article.delete({
					where: { id },
				})
			})
		} catch (dbError) {
			console.error('Database transaction failed:', dbError)
			return NextResponse.json(
				{
					error: 'Failed to delete article from database',
					success: false,
					details: dbError instanceof Error ? dbError.message : 'Unknown database error',
				},
				{ status: 500 }
			)
		}

		return NextResponse.json(
			{
				message: 'Article deleted successfully',
				success: true,
				llmCleanupSuccess,
				details: llmCleanupSuccess ? 'All data cleaned up successfully' : 'Database cleanup successful, but LLM graph cleanup failed',
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error('Error in DELETE API route:', error)
		return NextResponse.json(
			{
				error: 'Internal server error',
				success: false,
				message: error instanceof Error ? error.message : 'Unknown error occurred',
			},
			{ status: 500 }
		)
	} finally {
		await prisma.$disconnect()
	}
}
