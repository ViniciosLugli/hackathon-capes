import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createPDFFileFromArticle } from '@/utils/fileParser'
import { fromPrismaArticle } from '@/clients/capes/articleScraper'

const prisma = new PrismaClient()

interface RouteParams {
	params: Promise<{ id: string }>
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

		const parsedArticle = fromPrismaArticle(article)

		const pdf = await createPDFFileFromArticle(parsedArticle)

		return new NextResponse(pdf.buffer, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="${parsedArticle.title}.pdf"`,
			},
		})
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
