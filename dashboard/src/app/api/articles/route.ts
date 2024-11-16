import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { scrapeArticleById, Article } from '@/clients/capes/articleScraper'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)

		const title = searchParams.get('title') || undefined
		const authors = searchParams.getAll('authors')
		const publicationYear = searchParams.get('publicationYear')
		const topics = searchParams.getAll('topics')
		const language = searchParams.get('language') || undefined
		const isOpenAccess = searchParams.get('isOpenAccess')
		const peerReviewed = searchParams.get('peerReviewed')
		const publicationType = searchParams.get('publicationType') || undefined
		const status = searchParams.get('status') || undefined
		const journalName = searchParams.get('journalName') || undefined

		const page = parseInt(searchParams.get('page') || '1')
		const pageSize = parseInt(searchParams.get('pageSize') || '10')

		const sortBy = searchParams.get('sortBy') || 'createdAt'
		const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

		const whereClause: any = {}

		if (title) {
			whereClause.title = {
				contains: title,
				mode: 'insensitive',
			}
		}

		if (authors.length > 0) {
			whereClause.authors = {
				hasSome: authors,
			}
		}

		if (publicationYear) {
			const year = parseInt(publicationYear)
			if (!isNaN(year)) {
				whereClause.publicationYear = year
			}
		}

		if (topics.length > 0) {
			whereClause.topics = {
				some: {
					name: {
						in: topics,
						mode: 'insensitive',
					},
				},
			}
		}

		if (language) {
			whereClause.language = {
				equals: language,
				mode: 'insensitive',
			}
		}

		if (isOpenAccess !== null) {
			whereClause.isOpenAccess = isOpenAccess === 'true'
		}

		if (peerReviewed !== null) {
			whereClause.peerReviewed = peerReviewed === 'true'
		}

		if (publicationType) {
			whereClause.publicationType = {
				equals: publicationType,
				mode: 'insensitive',
			}
		}

		if (status) {
			whereClause.status = status.toUpperCase()
		}

		if (journalName) {
			whereClause.journalName = {
				contains: journalName,
				mode: 'insensitive',
			}
		}

		const articles = await prisma.article.findMany({
			where: whereClause,
			include: {
				topics: true,
				citationsMade: true,
				citationsReceived: true,
			},
			skip: (page - 1) * pageSize,
			take: pageSize,
			orderBy: {
				[sortBy]: sortOrder,
			},
		})

		return NextResponse.json({
			data: articles,
			page,
			pageSize,
		})
	} catch (error) {
		console.error('Error in GET API route:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		if (!body || typeof body !== 'object') {
			return NextResponse.json({ error: 'Invalid or missing request body' }, { status: 400 })
		}

		const { siteId } = body

		if (!siteId) {
			return NextResponse.json({ error: 'siteId is required' }, { status: 400 })
		}

		let articleData
		try {
			articleData = await scrapeArticleById(siteId)
		} catch (error: any) {
			console.error(`Error scraping article with siteId: ${siteId}`, error.message)
			return NextResponse.json({ error: 'Failed to scrape article. Please verify the siteId.' }, { status: 500 })
		}

		if (!articleData || typeof articleData !== 'object') {
			return NextResponse.json({ error: 'Scraped article data is invalid or null' }, { status: 500 })
		}

		let savedArticle
		try {
			savedArticle = await saveArticle(articleData)
		} catch (error: any) {
			console.error(`Error saving article data: ${JSON.stringify(articleData)}`, error.message)
			return NextResponse.json({ error: 'Failed to save article to database' }, { status: 500 })
		}

		return NextResponse.json({ message: 'Article saved successfully', article: savedArticle }, { status: 200 })
	} catch (error) {
		console.error('Error in API route:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

async function saveArticle(articleData: Article) {
	const { topics, citations, ...articleFields } = articleData

	return await prisma.$transaction(async (prisma) => {
		const topicConnections = await Promise.all(
			topics.map(async (topicName: string) => {
				const topic = await prisma.topic.upsert({
					where: { name: topicName },
					update: {},
					create: { name: topicName },
				})
				return { id: topic.id }
			})
		)

		const article = await prisma.article.create({
			data: {
				...articleFields,
				topics: {
					connect: topicConnections,
				},
			},
		})

		const citationsData = citations.map((citationData) => ({
			citingArticleId: article.id,
			citedTitle: citationData.title,
			citedAuthors: citationData.authors,
			citedJournal: citationData.publisher,
			citedVolume: citationData.volume,
			citedIssue: citationData.issue,
			citedPages: citationData.pages,
			citedYear: citationData.year,
			citedDoi: citationData.doi,
			citedUrl: citationData.url,
		}))

		if (citationsData.length > 0) {
			await prisma.citation.createMany({
				data: citationsData,
			})
		}

		const savedArticle = await prisma.article.findUnique({
			where: { id: article.id },
			include: {
				topics: true,
				citationsMade: true,
				citationsReceived: true,
			},
		})

		return savedArticle
	})
}
