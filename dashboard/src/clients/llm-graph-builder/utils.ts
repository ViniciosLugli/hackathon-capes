import axios from 'axios'
import qs from 'qs'
import { APIResponse } from './apiTypes'

export async function fetchAPI<T>(url: string, method: 'GET' | 'POST', body?: Record<string, any>): Promise<APIResponse<T>> {
	const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }

	const data = body ? qs.stringify(body) : undefined

	try {
		const res = await axios({
			url,
			method,
			headers,
			data,
		})

		return res.data
	} catch (error: any) {
		if (error.response) {
			throw new Error(`Failed to fetch ${url}: ${error.response.statusText}`)
		} else if (error.request) {
			throw new Error(`No response from ${url}: ${error.message}`)
		} else {
			throw new Error(`Error in request to ${url}: ${error.message}`)
		}
	}
}
