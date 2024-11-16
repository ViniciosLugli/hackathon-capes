import axios from 'axios'

export class DOIClient {
	private baseURL: string

	constructor() {
		this.baseURL = 'https://doi.org/'
	}

	async resolveDOI(doi: string): Promise<string | null> {
		try {
			const response = await axios.post(this.baseURL, `hdl=${encodeURIComponent(doi)}`, {
				headers: {
					accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
					'accept-language': 'pt-BR,pt;q=0.8',
					'cache-control': 'max-age=0',
					'content-type': 'application/x-www-form-urlencoded',
					origin: 'https://www.doi.org',
					referer: 'https://www.doi.org/',
					'sec-fetch-dest': 'document',
					'sec-fetch-mode': 'navigate',
					'sec-fetch-site': 'same-site',
					'sec-fetch-user': '?1',
					'sec-gpc': '1',
					'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
				},
				maxRedirects: 0,
				validateStatus: (status) => status === 302 || status === 200,
			})

			const redirectUrl = response.headers['location']
			if (redirectUrl) {
				return redirectUrl
			}

			const htmlBody = response.data as string
			const match = htmlBody.match(/<a href="(.*?)">/)
			return match ? match[1] : null
		} catch (error) {
			console.error('Error resolving DOI:', error)
			return null
		}
	}
}

interface Cohorts {
	[key: string]: number
}

interface ContextCounts {
	count: number
	mean: number
	rank: number
	pct: number
	higher_than: number
}

interface Context {
	all: ContextCounts
	journal: ContextCounts
	similar_age_3m: ContextCounts
	similar_age_journal_3m: ContextCounts
}

interface PublisherSubject {
	name: string
	scheme: string
}

interface Readers {
	citeulike: string
	mendeley: string
	connotea: string
}

interface Images {
	small: string
	medium: string
	large: string
}

interface AltmetricResponse {
	title: string
	doi: string
	pmid?: string
	isbns: string[]
	altmetric_jid: string
	issns: string[]
	journal: string
	cohorts: Cohorts
	context: Context
	authors: string[]
	type: string
	handles: string[]
	pubdate: number
	epubdate: number
	dimensions_publication_id: string
	altmetric_id: number
	schema: string
	is_oa: boolean
	publisher_subjects: PublisherSubject[]
	cited_by_posts_count: number
	cited_by_tweeters_count: number
	cited_by_accounts_count: number
	last_updated: number
	score: number
	history: { [key: string]: number }
	url: string
	added_on: number
	published_on: number
	scopus_subjects: string[]
	readers: Readers
	readers_count: number
	images: Images
	details_url: string
}

export class AltmetricClient {
	private baseURL: string

	constructor() {
		this.baseURL = 'https://api.altmetric.com/v1/doi/'
	}

	async getInfoByDOI(doi: string): Promise<AltmetricResponse | null> {
		try {
			const response = await axios.get<AltmetricResponse>(`${this.baseURL}${encodeURIComponent(doi)}`)
			return response.data
		} catch (error) {
			console.error('Error fetching Altmetric data:', error)
			return null
		}
	}
}

export default AltmetricClient
