import axios, { AxiosError } from 'axios'
import qs from 'qs'
import { APIResponse } from './apiTypes'

export async function fetchAPI<T>(url: string, method: 'GET' | 'POST', body?: Record<string, any>, isMultipart: boolean = false): Promise<APIResponse<T>> {
	const headers: Record<string, string> = {}

	let data
	if (isMultipart && body) {
		const formData = new FormData()
		Object.entries(body).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				formData.append(key, JSON.stringify(value))
			} else {
				formData.append(key, value as string)
			}
		})
		data = formData
		headers['Content-Type'] = 'multipart/form-data'
	} else if (body) {
		data = qs.stringify(body)
		headers['Content-Type'] = 'application/x-www-form-urlencoded'
	}

	try {
		const res = await axios({
			url,
			method,
			headers,
			data,
			validateStatus: (status) => status < 500,
		})

		if (res.status !== 200) {
			throw new Error(`Server responded with status ${res.status}: ${res.statusText} (${JSON.stringify(res.data)})`)
		}

		return res.data
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError
			if (axiosError.response) {
				throw new Error(`Server error (${axiosError.response.status}): ${axiosError.response.statusText}`)
			} else if (axiosError.request) {
				throw new Error(`No response from server: ${axiosError.message}`)
			}
		}
		throw new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
	}
}
