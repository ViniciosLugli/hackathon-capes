import { useState, useCallback } from 'react'
import { apiClient } from '@/clients/api/apiClient'

export function useArticle() {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const getArticles = useCallback(async (query: string) => {
		setLoading(true)
		setError(null)
		try {
			const result = await apiClient.getArticles(query)
			setLoading(false)
			return result
		} catch (err) {
			setError(err instanceof Error ? err : new Error('An error occurred'))
			setLoading(false)
		}
	}, [])

	return {
		loading,
		error,
		getArticles,
	}
}
