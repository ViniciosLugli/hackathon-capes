import axios from 'axios'
import * as cheerio from 'cheerio'
import { Article as PrismaArticle, Citation as PrismaCitation, Topic as PrismaTopic } from '@prisma/client'
export interface Article {
	id: string
	title: string
	abstract: string
	publicationType: string
	publicationYear: number
	institutions: string[]
	volume: string
	issue: string
	language: string
	doi: string
	issn: string
	authors: string[]
	topics: string[]
	isOpenAccess: boolean
	isPeerReviewed: boolean
	citations: Citation[]
}

export interface Citation {
	authors: string[]
	title: string
	publisher: string
	volume?: string
	issue?: string
	pages?: string
	year?: number
	doi?: string
	url?: string
}
export function fromPrismaArticle(
	prismaArticle: PrismaArticle & {
		topics: PrismaTopic[]
		citationsMade: PrismaCitation[]
		citationsReceived: PrismaCitation[]
	}
): Article {
	return {
		id: prismaArticle.id,
		title: prismaArticle.title,
		abstract: prismaArticle.abstract,
		publicationType: prismaArticle.publicationType || '',
		publicationYear: prismaArticle.publicationYear || 0,
		institutions: prismaArticle.institutions,
		volume: prismaArticle.volume || '',
		issue: prismaArticle.issue || '',
		language: prismaArticle.language,
		doi: prismaArticle.doi || '',
		issn: prismaArticle.issn || '',
		authors: prismaArticle.authors,
		topics: prismaArticle.topics.map((topic) => topic.name),
		isOpenAccess: prismaArticle.isOpenAccess,
		isPeerReviewed: prismaArticle.isPeerReviewed,
		citations: prismaArticle.citationsMade.map((citation) => ({
			authors: citation.citedAuthors,
			title: citation.citedTitle || '',
			publisher: citation.citedJournal || '',
			volume: citation.citedVolume,
			issue: citation.citedIssue,
			pages: citation.citedPages,
			year: citation.citedYear,
			doi: citation.citedDoi,
			url: citation.citedUrl,
		})),
	}
}

export async function scrapeArticleById(articleId: string): Promise<Article> {
	try {
		const url = `https://www.periodicos.capes.gov.br/index.php/acervo/buscador.html?task=detalhes&source=&id=${articleId}`
		const response = await axios.get(url)
		const html = response.data
		const $ = cheerio.load(html)

		const content = $('#content-print')

		const publicationType = content.find('#type-publicacao').text().trim()
		const title = content.find('#item-titulo').text().trim()
		const publicationYear = parseInt(content.find('#item-ano').text().replace(';', '').trim())
		const institution = content.find('#item-instituicao').text().replace(';', '').trim()
		const institutions = institution ? [institution] : []
		const volume = content.find('#item-volume').text().replace('Volume:', '').replace(';', '').trim()
		const issue = content.find('#item-issue').text().replace('Issue:', '').trim()
		const language = content.find('#item-language').text().replace('Linguagem:', '').trim()
		const doi = content.find('.small.text-muted.mb-3.block').first().text().trim()
		const issn = content.find('strong:contains("ISSN")').next('p').text().trim()
		console.log("content.find('#item-autores')", content.find('#item-autores').text())
		const authors = content
			.find('#item-autores')
			.first()
			.text()
			.split(',')
			.map((author) => author.replace(/\s+/g, ' ').trim())
			.filter((author) => author.length > 0)

		const topics = content
			.find('strong:contains("Tópico(s)")')
			.next('p')
			.text()
			.trim()
			.split(',')
			.map((topic) => topic.trim())
			.filter(Boolean)
		const abstract = content.find('#item-resumo').text().trim()
		const isOpenAccess = content.find('.open-acess').length > 0
		const isPeerReviewed = content.find('.fa-book-reader').length > 0

		let citations: Citation[] = []

		const apiUrl = `https://api.openalex.org/works?filter=cited_by:${encodeURIComponent(articleId)}`
		const apiResponse = await axios.get(apiUrl)
		const apiData = apiResponse.data

		if (apiData.results && apiData.results.length > 0) {
			citations = apiData.results.map((item: any) => {
				const citationAuthors = item.authorships.map((authorship: any) => authorship.author.display_name)
				const citationTitle = item.title
				const citationPublisher = item.primary_location?.source?.display_name || ''
				const citationVolume = item.biblio.volume
				const citationIssue = item.biblio.issue
				const citationPages = item.biblio.first_page
				const citationYear = item.publication_year
				const citationDOI = item.doi
				const citationURL = item.primary_location?.landing_page_url || ''

				return {
					authors: citationAuthors,
					title: citationTitle,
					publisher: citationPublisher,
					volume: citationVolume,
					issue: citationIssue,
					pages: citationPages,
					year: citationYear,
					doi: citationDOI,
					url: citationURL,
				}
			})
		}

		return {
			id: articleId,
			title,
			abstract,
			publicationType,
			publicationYear,
			institutions,
			volume,
			issue,
			language,
			doi,
			issn,
			authors,
			topics,
			isOpenAccess,
			isPeerReviewed,
			citations,
		}
	} catch (error) {
		console.error(`Error scraping article ${articleId}:`, error)
		throw error
	}
}
