import { fetchAPI } from './utils'
import { ConnectParams, UploadParams, SchemaParams, PopulateGraphSchemaParams, ChatBotParams, MetricParams, APIResponse } from './apiTypes'

const DEFAULT_SCHEMA = {
	labels: [
		'File',
		'Access',
		'PeerReview',
		'DatabaseType',
		'Area',
		'Language',
		'Editor',
		'Author',
		'Institution',
		'Keyword',
		'Citation',
		'Topic',
		'PublicationDate',
		'Journal',
		'FundingAgency',
		'Country',
		'Methodology',
		'ResearchField',
		'Affiliation',
		'DocumentType',
		'ExperimentType',
		'ImpactFactor',
		'Conference',
		'Publisher',
		'Reference',
		'Grant',
		'Version',
	],
	relationshipTypes: [
		'HAS_ACCESS',
		'HAS_PEER_REVIEW',
		'HAS_DATABASE_TYPE',
		'BELONGS_TO_AREA',
		'IN_LANGUAGE',
		'PUBLISHED_BY',
		'WRITTEN_BY',
		'AFFILIATED_WITH',
		'HAS_KEYWORD',
		'CITES',
		'RELATES_TO_TOPIC',
		'PUBLISHED_IN',
		'FUNDED_BY',
		'ORIGINATES_FROM',
		'SIMILAR_TO',
		'REFERENCED_BY',
		'USES_METHOD',
		'STUDIES_FIELD',
		'HAS_DOCUMENT_TYPE',
		'PART_OF_CONFERENCE',
		'PUBLISHED_WITH_PUBLISHER',
		'SUPPORTED_BY_GRANT',
		'MENTIONS_REFERENCE',
		'HAS_IMPACT_FACTOR',
		'HAS_EXPERIMENT_TYPE',
		'HAS_VERSION',
		'DERIVED_FROM',
		'IS_BASED_ON',
	],
}

export class LLMGraphBuilderClient {
	private baseUrl: string

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl
	}

	async connect(params: ConnectParams): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/connect`, 'POST', params)
	}

	async uploadFile(params: UploadParams): Promise<APIResponse> {
		const formData = new FormData()
		formData.append('file', params.file)
		formData.append('chunkNumber', params.chunkNumber.toString())
		formData.append('totalChunks', params.totalChunks.toString())
		formData.append('originalname', params.originalname)
		formData.append('model', params.model)
		formData.append('uri', params.uri)
		formData.append('userName', params.userName)
		formData.append('password', params.password)
		formData.append('database', params.database)

		const res = await fetch(`${this.baseUrl}/upload`, {
			method: 'POST',
			body: formData,
		})

		if (!res.ok) {
			throw new Error(`Failed to upload file: ${res.statusText}`)
		}

		return res.json()
	}

	async getSchema(params: SchemaParams): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/schema`, 'POST', params)
	}

	async populateGraphSchema(params: PopulateGraphSchemaParams): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/populate_graph_schema`, 'POST', params)
	}
	async chatBot(params: ChatBotParams): Promise<APIResponse> {
		const adjustedParams = {
			...params,
			document_names: JSON.stringify(params.document_names || []),
		}

		return fetchAPI(`${this.baseUrl}/chat_bot`, 'POST', adjustedParams)
	}

	async evaluateResponse(params: MetricParams): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/metric`, 'POST', params)
	}

	async deleteOrphanNodes(params: ConnectParams): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/delete_unconnected_nodes`, 'POST', params)
	}

	async getDuplicateNodes(params: ConnectParams): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/get_duplicate_nodes`, 'POST', params)
	}

	async mergeDuplicateNodes(params: ConnectParams & { duplicate_nodes_list: string[] }): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/merge_duplicate_nodes`, 'POST', params)
	}

	async reprocess(params: ConnectParams & { file_name: string; retry_condition: string }): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/retry_processing`, 'POST', params)
	}

	async urlScan(
		params: ConnectParams & {
			source_url?: string
			aws_access_key_id?: string
			aws_secret_access_key?: string
			wiki_query?: string
			model: string
			gcs_bucket_name?: string
			gcs_bucket_folder?: string
			source_type: string
			gcs_project_id?: string
			access_token?: string
		}
	): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/url/scan`, 'POST', params)
	}

	async extract(
		params: ConnectParams & {
			model: string
			file_name: string
			source_type: string
			retry_condition?: string
		}
	): Promise<APIResponse> {
		const allowedNodes = DEFAULT_SCHEMA.labels.join(',') || ''
		const allowedRelationship = DEFAULT_SCHEMA.relationshipTypes.join(',') || ''

		if (!allowedNodes || !allowedRelationship) {
			throw new Error('Invalid schema data: allowedNodes or allowedRelationship is missing.')
		}

		return fetchAPI(
			`${this.baseUrl}/extract`,
			'POST',
			{
				...params,
				allowedNodes,
				allowedRelationship,
			},
			true
		)
	}
	async getSourcesList(params: ConnectParams): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/sources_list`, 'GET', params)
	}

	async postProcessing(params: ConnectParams & { tasks: string[] }): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/post_processing`, 'POST', params)
	}

	async getChunkEntities(
		params: ConnectParams & {
			nodedetails: string
			entities: string
			mode: string
		}
	): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/chunk_entities`, 'POST', params)
	}

	async getNeighbours(params: ConnectParams & { elementId: string }): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/get_neighbours`, 'POST', params)
	}

	async graphQuery(params: ConnectParams & { document_names: string }): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/graph_query`, 'POST', params)
	}

	async clearChatBot(params: ConnectParams & { session_id: string }): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/clear_chat_bot`, 'POST', params)
	}

	async deleteDocumentAndEntities(
		params: ConnectParams & {
			filenames: string[]
			source_types: string[]
			deleteEntities: string
		}
	): Promise<APIResponse> {
		return fetchAPI(
			`${this.baseUrl}/delete_document_and_entities`,
			'POST',
			{
				...params,
				filenames: JSON.stringify(params.filenames),
				source_types: JSON.stringify(params.source_types),
			},
			true
		)
	}

	async getDocumentStatus(params: ConnectParams & { file_name: string }): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/document_status/${params.file_name}`, 'GET', params)
	}

	async cancelledJob(params: ConnectParams & { filenames: string; source_types: string }): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/cancelled_job`, 'POST', params)
	}

	async dropCreateVectorIndex(params: ConnectParams & { isVectorIndexExist: string }): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/drop_create_vector_index`, 'POST', params)
	}

	async fetchChunktext(params: ConnectParams & { document_name: string; page_no: number }): Promise<APIResponse> {
		return fetchAPI(`${this.baseUrl}/fetch_chunktext`, 'POST', params)
	}
}
