export interface ConnectParams {
	uri: string
	userName: string
	password: string
	database: string
}

export interface UploadParams extends ConnectParams {
	file: File
	chunkNumber: number
	totalChunks: number
	originalname: string
	model: string
}

export interface SchemaParams extends ConnectParams {}

export interface PopulateGraphSchemaParams extends ConnectParams {
	input_text: string
	model: string
	is_schema_description_checked: boolean
}

export interface ChatBotParams extends ConnectParams {
	model: string
	question: string
	session_id: string
	mode: string
	document_names?: string[]
}

export interface MetricParams {
	question: string
	context: string
	answer: string
	model: string
	mode: string
}

export interface APIResponse<T = any> {
	status: string
	data: T
	message?: string
}
