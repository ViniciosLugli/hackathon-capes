import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { ArticleUpdateInput } from '@/types'

export async function GET(request: Request, { params }: { params: { id: string } }) {
	try {
		const article = await prisma.article.findUnique({
			where: { id: params.id },
			include: { topics: true, keywords: true, fieldArea: true },
		})
		if (!article) {
			return NextResponse.json({ error: 'Article not found' }, { status: 404 })
		}
		return NextResponse.json(article)
	} catch (error) {
		console.error('Error fetching article:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
	try {
		const body: ArticleUpdateInput = await request.json()
		const article = await prisma.article.update({
			where: { id: params.id },
			data: body,
			include: { topics: true, keywords: true, fieldArea: true },
		})
		return NextResponse.json(article)
	} catch (error) {
		console.error('Error updating article:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
	try {
		await prisma.article.delete({ where: { id: params.id } })
		return NextResponse.json({ message: 'Article deleted successfully' })
	} catch (error) {
		console.error('Error deleting article:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
