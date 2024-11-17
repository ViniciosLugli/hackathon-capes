import { useState, useEffect, useCallback } from 'react'

interface FilterOptions {
	topics: string[]
	languages: string[]
	publicationTypes: string[]
	statuses: string[]
	journalNames: string[]
}

interface FilterSearchParams {
	title?: string
	authors?: string[]
	publicationYear?: number
	topics?: string[]
	language?: string
	isOpenAccess?: boolean
	peerReviewed?: boolean
	publicationType?: string
	status?: string
	journalName?: string
	page?: number
	pageSize?: number
}

interface FilterSearchResult {
	id: string
	title: string
	authors: string[]
	publicationYear: number
	topics: string[]
	language: string
	isOpenAccess: boolean
	peerReviewed: boolean
	publicationType: string
	status: string
	journalName: string
}

export function useFilterSearch() {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [results, setResults] = useState<FilterSearchResult[]>([])
	const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)

	useEffect(() => {
		const fetchFilters = async () => {
			try {
				const response = await fetch('/api/articles/filters')
				if (!response.ok) {
					throw new Error('Failed to fetch filter options')
				}
				const data = await response.json()
				setFilterOptions(data)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An unknown error occurred')
			}
		}

		fetchFilters()
	}, [])

	const performFilterSearch = useCallback(async (params: FilterSearchParams) => {
		setIsLoading(true)
		setError(null)

		try {
			const queryParams = new URLSearchParams(
				Object.entries(params).reduce((acc, [key, value]) => {
					if (value !== undefined && value !== null) {
						acc[key] = Array.isArray(value) ? value.join(',') : String(value)
					}
					return acc
				}, {} as Record<string, string>)
			)

			const response = await fetch(`/api/articles?${queryParams.toString()}`)
			if (!response.ok) {
				throw new Error('Filter search request failed')
			}
			const data = await response.json()
			setResults(data.data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An unknown error occurred')
			setResults([])
		} finally {
			setIsLoading(false)
		}
	}, [])

	return {
		isLoading,
		error,
		results,
		filterOptions,
		performFilterSearch,
	}
}
