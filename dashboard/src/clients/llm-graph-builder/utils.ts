import { APIResponse } from './apiTypes'

export async function fetchAPI<T>(url: string, method: 'GET' | 'POST', body?: unknown): Promise<APIResponse<T>> {
	const headers = { 'Content-Type': 'application/json' }

	const res = await fetch(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	})

	if (!res.ok) {
		throw new Error(`Failed to fetch ${url}: ${res.statusText}`)
	}

	return res.json()
}
