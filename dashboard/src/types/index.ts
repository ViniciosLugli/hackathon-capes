export interface Article {
	id: string
	doi: string
	title: string
	abstract: string
	language: string
	volume: string
	issue: string
	publicationYear: number
	publicationType: string
	authors: string[]
	institutions: string[]
	publisherName: string | null
	journalName: string | null
	issn: string
	status: string
	isOpenAccess: boolean
	isPeerReviewed: boolean
	createdAt: string
	updatedAt: string
	topics: {
		id: string
		name: string
		description: string | null
		parentId: string | null
		createdAt: string
		updatedAt: string
	}[]
	aiResume: string | null
}

export interface FilterOptions {
	topics: string[]
	languages: string[]
	publicationTypes: string[]
	statuses: string[]
	journalNames: string[]
}

export interface DoiInfo {
	journal: string
	authors: string[]
	pubdate: number
	score: number
	readers_count: number
	cited_by_posts_count: number
}

export interface Citation {
	id: string
	citingArticleId: string
	citedArticleId: string | null
	citedSiteId: string | null
	citedDoi: string
	citedTitle: string
	citedAuthors: string[]
	citedJournal: string
	citedVolume: string | null
	citedIssue: string | null
	citedPages: string | null
	citedYear: number
	citedUrl: string
	createdAt: string
	updatedAt: string
}
