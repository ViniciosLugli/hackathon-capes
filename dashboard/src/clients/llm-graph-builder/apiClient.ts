import { fetchAPI } from './utils'
import { ConnectParams, UploadParams, SchemaParams, PopulateGraphSchemaParams, ChatBotParams, MetricParams, APIResponse } from './apiTypes'

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
		return fetchAPI(`${this.baseUrl}/chat_bot`, 'POST', params)
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
}
