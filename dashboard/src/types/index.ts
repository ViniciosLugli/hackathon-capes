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
