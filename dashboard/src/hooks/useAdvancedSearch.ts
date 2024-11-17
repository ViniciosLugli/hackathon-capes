'use client'

import { useState, useCallback } from 'react'

interface AdvancedSearchParams {
	query: string
}

interface AdvancedSearchResult {
	id: string
	title: string
}

export function useAdvancedSearch() {
	const [isLoading, setIsLoading] = useState(false)
	const [results, setResults] = useState<AdvancedSearchResult[]>([])
	const [error, setError] = useState<string | null>(null)

	const performAdvancedSearch = useCallback(async (params: AdvancedSearchParams) => {
		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch('/api/articles/advanced', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(params),
			})

			if (!response.ok) {
				throw new Error('Search request failed')
			}

			const data = await response.json()
			setResults(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An unknown error occurred')
			setResults([])
		} finally {
			setIsLoading(false)
		}
	}, [])

	return {
		isLoading,
		results,
		error,
		performAdvancedSearch,
	}
}
