'use client'

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface SearchContextType {
	isExpanded: boolean
	setIsExpanded: (value: boolean) => void
	query: string
	setQuery: (value: string) => void
	results: SearchResult[]
	setResults: (value: SearchResult[]) => void
	filters: Filters
	updateFilter: (category: keyof Filters, value: any) => void
	performSearch: () => void
	isLoading: boolean
}

interface SearchResult {
	id: number
	title: string
	authors: string[]
	journal: string
	year: number
	abstract: string
	isOpenAccess: boolean
	type: 'article' | 'review' | 'book' | 'letter'
	area: string
	language: string
	publisher: string
}

interface Filters {
	openAccess: boolean
	yearRange: { min: number; max: number }
	nationalProduction: boolean | null
	peerReviewed: boolean | null
	areas: string[]
	language: string[]
	publishers: string[]
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
	const [isExpanded, setIsExpanded] = useState(false)
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<SearchResult[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [filters, setFilters] = useState<Filters>({
		openAccess: false,
		yearRange: { min: 1969, max: new Date().getFullYear() },
		nationalProduction: null,
		peerReviewed: null,
		areas: [],
		language: [],
		publishers: [],
	})

	const updateFilter = useCallback((category: keyof Filters, value: any) => {
		setFilters((prev) => ({ ...prev, [category]: value }))
	}, [])

	const performSearch = useCallback(() => {
		setIsLoading(true)
		setTimeout(() => {
			const mockResults: SearchResult[] = Array.from({ length: 20 }, (_, i) => ({
				id: i + 1,
				title: `Artigo de exemplo ${i + 1}: ${query}`,
				authors: ['Autor A', 'Autor B'],
				journal: 'Revista Científica Brasileira',
				year: Math.floor(Math.random() * (2023 - 2000 + 1)) + 2000,
				abstract: 'Este é um resumo de exemplo para o artigo.',
				isOpenAccess: Math.random() > 0.5,
				type: ['article', 'review', 'book', 'letter'][Math.floor(Math.random() * 4)] as 'article' | 'review' | 'book' | 'letter',
				area: ['Ciências Humanas', 'Ciências Sociais Aplicadas', 'Linguística, Letras e Artes'][Math.floor(Math.random() * 3)],
				language: ['Português', 'Inglês', 'Espanhol'][Math.floor(Math.random() * 3)],
				publisher: ['Editora A', 'Editora B', 'Editora C'][Math.floor(Math.random() * 3)],
			}))

			// Apply filters
			const filteredResults = mockResults.filter((result) => {
				if (filters.openAccess && !result.isOpenAccess) return false
				if (result.year < filters.yearRange.min || result.year > filters.yearRange.max) return false
				if (filters.areas.length > 0 && !filters.areas.includes(result.area)) return false
				if (filters.language.length > 0 && !filters.language.includes(result.language)) return false
				if (filters.publishers.length > 0 && !filters.publishers.includes(result.publisher)) return false
				return true
			})

			setResults(filteredResults)
			setIsLoading(false)
		}, 1000)
	}, [query, filters])

	return (
		<SearchContext.Provider
			value={{
				isExpanded,
				setIsExpanded,
				query,
				setQuery,
				results,
				setResults,
				filters,
				updateFilter,
				performSearch,
				isLoading,
			}}
		>
			{children}
		</SearchContext.Provider>
	)
}

export const useSearch = () => {
	const context = useContext(SearchContext)
	if (context === undefined) {
		throw new Error('useSearch must be used within a SearchProvider')
	}
	return context
}
