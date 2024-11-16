import axios, { AxiosError } from 'axios'

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
	all?: ContextCounts
	journal?: ContextCounts
	similar_age_3m?: ContextCounts
	similar_age_journal_3m?: ContextCounts
}

interface PublisherSubject {
	name: string
	scheme: string
}

interface Readers {
	mendeley?: number
	downloads?: number
	citeulike?: number
	connotea?: number
}

interface Images {
	small: string
	medium: string
	large: string
}

interface History {
	'1d'?: number
	'2d'?: number
	'3d'?: number
	'4d'?: number
	'5d'?: number
	'6d'?: number
	'1w'?: number
	'1m'?: number
	'3m'?: number
	'6m'?: number
	'1y'?: number
	at?: number
}

interface AltmetricResponse {
	title?: string
	doi?: string
	pmid?: string
	pmc?: string
	nlmid?: string
	uri?: string
	url?: string
	isbns?: string[]
	altmetric_jid?: string
	issns?: string[]
	journal?: string
	cohorts?: Cohorts
	abstract?: string
	abstract_source?: string
	authors?: string[]
	type?: 'dataset' | 'book' | 'article' | 'news' | 'chapter' | 'clinical_trial_study_record'
	handles?: string[]
	pubdate?: number
	epubdate?: number
	published_on?: number
	dimensions_publication_id?: string
	altmetric_id?: number
	schema?: string
	is_oa?: boolean
	context?: Context
	cited_by_fbwalls_count?: number
	cited_by_feeds_count?: number
	cited_by_gplus_count?: number
	cited_by_msm_count?: number
	cited_by_rdts_count?: number
	cited_by_qna_count?: number
	cited_by_tweeters_count?: number
	cited_by_wikipedia_count?: number
	cited_by_policies_count?: number
	cited_by_patents_count?: number
	cited_by_videos_count?: number
	cited_by_accounts_count?: number
	cited_by_posts_count?: number
	last_updated?: number
	score?: number
	history?: History
	added_on?: number
	scopus_subjects?: string[]
	subjects?: string[]
	publisher_subjects?: PublisherSubject[]
	readers?: Readers
	readers_count?: number
	images?: Images
	details_url?: string
	authors_or_editors?: string[]
	attribution?: string
}

export class AltmetricClient {
	private baseURL: string

	constructor() {
		this.baseURL = 'https://api.altmetric.com/v1'
	}

	async getInfoByIdentifier(identifierType: string, id: string): Promise<AltmetricResponse | null> {
		try {
			const url = `${this.baseURL}/${identifierType}/${id}`
			const response = await axios.get<AltmetricResponse>(url)

			return response.data
		} catch (error) {
			const axiosError = error as AxiosError
			if (axiosError.response) {
				switch (axiosError.response.status) {
					case 403:
						console.error('Error 403: Forbidden - You are not authorized for this call.')
						break
					case 404:
						console.error('Error 404: Not Found - No details for the requested research output.')
						break
					case 429:
						console.error('Error 429: Too Many Requests - You are being rate limited.')
						break
					case 502:
						console.error('Error 502: Bad Gateway - The API version is down for maintenance.')
						break
					default:
						console.error(`Error ${axiosError.response.status}: ${axiosError.response.statusText}`)
				}
			} else {
				console.error('Error fetching Altmetric data:', axiosError.message)
			}
			return null
		}
	}
}
