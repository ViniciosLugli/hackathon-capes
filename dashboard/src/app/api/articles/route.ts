import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createPDFFileFromArticle } from '@/utils/fileParser'
import { scrapeArticleById, Article } from '@/clients/capes/articleScraper'
import { LLMGraphBuilderClient } from '@/clients/llm-graph-builder/apiClient'

const prisma = new PrismaClient()
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)

		const title = searchParams.get('title') || undefined
		const authors = searchParams.getAll('authors').filter(Boolean)
		const publicationYearFrom = searchParams.get('publicationYearFrom')
		const publicationYearTo = searchParams.get('publicationYearTo')
		const topics = searchParams.getAll('topics').filter(Boolean)
		const language = searchParams.get('language') || undefined
		const isOpenAccess = searchParams.get('isOpenAccess')
		const peerReviewed = searchParams.get('peerReviewed')
		const publicationType = searchParams.get('publicationType') || undefined
		const status = searchParams.get('status') || undefined
		const journalName = searchParams.get('journalName') || undefined

		const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
		const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get('pageSize') || '10')))

		const sortBy = searchParams.get('sortBy') || 'createdAt'
		const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

		const whereClause: any = {}

		if (title) {
			whereClause.OR = [
				...(whereClause.OR || []),
				{
					title: {
						contains: title,
						mode: 'insensitive',
					},
				},
				{
					abstract: {
						contains: title,
						mode: 'insensitive',
					},
				},
			]
		}

		if (authors.length > 0) {
			whereClause.OR = [
				...(whereClause.OR || []),
				...authors.map((author) => ({
					authors: {
						has: author,
					},
				})),
			]
		}

		if (publicationYearFrom || publicationYearTo) {
			whereClause.publicationYear = {}
			if (publicationYearFrom) {
				whereClause.publicationYear.gte = parseInt(publicationYearFrom)
			}
			if (publicationYearTo) {
				whereClause.publicationYear.lte = parseInt(publicationYearTo)
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

		if (isOpenAccess !== null && isOpenAccess !== undefined) {
			whereClause.isOpenAccess = isOpenAccess === 'true'
		}

		if (peerReviewed !== null && peerReviewed !== undefined) {
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
			},
			skip: (page - 1) * pageSize,
			take: pageSize,
			orderBy: {
				[sortBy]: sortOrder,
			},
		})

		const totalCount = await prisma.article.count({
			where: whereClause,
		})

		return NextResponse.json({
			data: articles,
			page,
			pageSize,
			total: totalCount,
			message: articles.length > 0 ? undefined : 'No articles found',
		})
	} catch (error: any) {
		console.error('Error in GET API route:', error)
		return NextResponse.json(
			{
				error: 'Internal server error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		if (!body || typeof body !== 'object') {
			return NextResponse.json({ error: 'Invalid or missing request body' }, { status: 400 })
		}

		const { siteId } = await body

		if (!siteId) {
			return NextResponse.json({ error: 'siteId is required' }, { status: 400 })
		}

		const article = await prisma.article.findUnique({
			where: { id: siteId },
		})

		if (article) {
			return NextResponse.json({ error: 'Article with the given siteId already exists' }, { status: 400 })
		}

		let articleData
		try {
			articleData = await scrapeArticleById(siteId)
		} catch (error: any) {
			console.error(`Error scraping article with siteId: ${siteId}`, error.message)
			return NextResponse.json({ error: 'Failed to scrape article. Please verify the siteId.' }, { status: 500 })
		}

		let buffer, mimeType, blob, fileName

		try {
			const pdfFile = await createPDFFileFromArticle(articleData)
			buffer = pdfFile.buffer
			mimeType = pdfFile.mimeType
			blob = pdfFile.blob
			fileName = pdfFile.fileName
		} catch (error: any) {
			console.error(`Error creating PDF file for article: ${articleData.id}`)
			console.error(error)
			return NextResponse.json({ error: 'Failed to create PDF file for article' }, { status: 500 })
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

		const LLM_GRAPH_BUILDER_API_URL = process.env.LLM_GRAPH_BUILDER_API_URL
		if (!LLM_GRAPH_BUILDER_API_URL) {
			throw new Error('LLM Graph Builder API URL is not configured')
		}

		const llmGraphBuilderClient = new LLMGraphBuilderClient(LLM_GRAPH_BUILDER_API_URL)

		const { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, NEO4J_DATABASE, DEFAULT_LLM_GRAPH_BUILDER_MODEL } = process.env
		if (!NEO4J_URI || !NEO4J_USERNAME || !NEO4J_PASSWORD || !NEO4J_DATABASE || !DEFAULT_LLM_GRAPH_BUILDER_MODEL) {
			throw new Error('Neo4j credentials are not properly configured')
		}
		const uploadResponse = await llmGraphBuilderClient.uploadFile({
			file: new File([buffer], fileName, { type: mimeType }),
			chunkNumber: 1,
			totalChunks: 1,
			originalname: fileName,
			model: DEFAULT_LLM_GRAPH_BUILDER_MODEL,
			uri: NEO4J_URI,
			userName: NEO4J_USERNAME,
			password: NEO4J_PASSWORD,
			database: NEO4J_DATABASE,
		})

		if (uploadResponse.status !== 'Success') {
			console.error('Error uploading file to LLM Graph Builder:', uploadResponse.data)
			return NextResponse.json({ error: 'Failed to upload file to LLM Graph Builder' }, { status: 500 })
		}

		llmGraphBuilderClient.extract({
			uri: NEO4J_URI,
			userName: NEO4J_USERNAME,
			password: NEO4J_PASSWORD,
			database: NEO4J_DATABASE,
			model: DEFAULT_LLM_GRAPH_BUILDER_MODEL,
			file_name: fileName,
			source_type: 'local file',
		})

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
