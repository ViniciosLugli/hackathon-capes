import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { ArticleCreateInput } from '@/types'

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const page = parseInt(searchParams.get('page') || '1')
	const limit = parseInt(searchParams.get('limit') || '10')
	const query = searchParams.get('q') || ''
	const skip = (page - 1) * limit

	try {
		let articles
		let total

		if (query) {
			articles = await prisma.article.findMany({
				where: {
					OR: [{ title: { contains: query, mode: 'insensitive' } }, { abstract: { contains: query, mode: 'insensitive' } }, { authors: { has: query } }],
				},
				skip,
				take: limit,
				include: { topics: true, keywords: true, fieldArea: true },
			})
			total = await prisma.article.count({
				where: {
					OR: [{ title: { contains: query, mode: 'insensitive' } }, { abstract: { contains: query, mode: 'insensitive' } }, { authors: { has: query } }],
				},
			})
		} else {
			articles = await prisma.article.findMany({
				skip,
				take: limit,
				include: { topics: true, keywords: true, fieldArea: true },
			})
			total = await prisma.article.count()
		}

		return NextResponse.json({
			data: articles,
			meta: { page, limit, total },
		})
	} catch (error) {
		console.error('Error fetching articles:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}

export async function POST(request: Request) {
	try {
		const body: ArticleCreateInput = await request.json()
		const article = await prisma.article.create({
			data: body,
			include: { topics: true, keywords: true, fieldArea: true },
		})
		return NextResponse.json(article, { status: 201 })
	} catch (error) {
		console.error('Error creating article:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
