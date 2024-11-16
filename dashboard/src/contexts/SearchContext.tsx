'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { useArticle } from '@/hooks/useArticle'

interface SearchContextType {
	query: string
	setQuery: (query: string) => void
	performSearch: () => Promise<void>
	isLoading: boolean
	results: any[]
	isExpanded: boolean
	setIsExpanded: (expanded: boolean) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<any[]>([])
	const [isExpanded, setIsExpanded] = useState(false)
	const { getArticles, loading: isLoading } = useArticle()

	const performSearch = useCallback(async () => {
		try {
			const searchResults = await getArticles(query)
			setResults(searchResults)
			console.log('Search results:', searchResults)
		} catch (error) {
			console.error('Search error:', error)
			setResults([])
		}
	}, [query, getArticles])

	return (
		<SearchContext.Provider
			value={{
				query,
				setQuery,
				performSearch,
				isLoading,
				results,
				isExpanded,
				setIsExpanded,
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
