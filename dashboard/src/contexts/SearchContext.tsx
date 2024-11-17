'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch'
import { useFilterSearch } from '@/hooks/useFilterSearch'

interface SearchContextType {
	query: string
	setQuery: (query: string) => void
	performSearch: () => Promise<void>
	isLoading: boolean
	advancedResults: any[]
	filterResults: any[]
	aiResponse: string | null
	isExpanded: boolean
	setIsExpanded: (expanded: boolean) => void
	filterOptions: any
	performFilterSearch: (params: any) => Promise<void>
	isFilterLoading: boolean
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
	const [query, setQuery] = useState('')
	const [isExpanded, setIsExpanded] = useState(false)
	const [aiResponse, setAiResponse] = useState<string | null>(null)
	const { isLoading: isAdvancedLoading, results: advancedResults, performAdvancedSearch } = useAdvancedSearch()
	const { isLoading: isFilterLoading, results: filterResults, filterOptions, performFilterSearch } = useFilterSearch()
	const lastSearchRef = useRef('')

	const performSearch = useCallback(async () => {
		if (query.trim() === lastSearchRef.current) return

		lastSearchRef.current = query.trim()
		setAiResponse(null)

		// Perform filter search immediately
		performFilterSearch({ title: query })

		// Perform advanced search
		try {
			const advancedResponse = await performAdvancedSearch({ query })
			// Simulate AI response (replace with actual AI processing)
			setAiResponse(`AI response for query: "${query}"`)
		} catch (error) {
			console.error('Advanced search error:', error)
		}
	}, [query, performAdvancedSearch, performFilterSearch])

	useEffect(() => {
		if (query.trim()) {
			performSearch()
		}
	}, [query, performSearch])

	const isLoading = isAdvancedLoading || isFilterLoading

	return (
		<SearchContext.Provider
			value={{
				query,
				setQuery,
				performSearch,
				isLoading,
				advancedResults,
				filterResults,
				aiResponse,
				isExpanded,
				setIsExpanded,
				filterOptions,
				performFilterSearch,
				isFilterLoading,
			}}
		>
			{children}
		</SearchContext.Provider>
	)
}

export function useSearch() {
	const context = useContext(SearchContext)
	if (context === undefined) {
		throw new Error('useSearch must be used within a SearchProvider')
	}
	return context
}
