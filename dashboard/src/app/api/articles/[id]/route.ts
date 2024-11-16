import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	const { id } = params

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

		return NextResponse.json(article, { status: 200 })
	} catch (error) {
		console.error('Error in GET API route:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
	const { id } = params

	try {
		const article = await prisma.article.findUnique({
			where: { id },
		})

		if (!article) {
			return NextResponse.json({ error: 'Article not found' }, { status: 404 })
		}

		await prisma.$transaction(async (prisma) => {
			await prisma.citation.deleteMany({
				where: { citingArticleId: id },
			})

			await prisma.citation.deleteMany({
				where: { citedArticleId: id },
			})

			await prisma.article.update({
				where: { id },
				data: {
					topics: {
						set: [],
					},
				},
			})

			await prisma.article.delete({
				where: { id },
			})
		})

		return NextResponse.json({ message: 'Article and related data deleted successfully' }, { status: 200 })
	} catch (error) {
		console.error('Error in DELETE API route:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
