'use client'

import { useState, useEffect, useCallback } from 'react'
import { FilterSidebar } from '@/components/FilterSidebar'
import { ArticleList } from '@/components/ArticleList'
import { ArticleListAi } from '@/components/ArticleListAi'
import { ArticleModal } from '@/components/ArticleModal'
import { ImportArticleModal } from '@/components/ImportArticleModal'
import { Article, DoiInfo } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Search, ImportIcon as FileImport } from 'lucide-react'
import { RainbowButton } from '@/components/ui/rainbow-button'
import WordRotate from '@/components/ui/word-rotate'
import { Button } from '@/components/ui/button'

const loadingMessages = [
	'Pesquisando o universo acadêmico',
	'Conectando neurônios do conhecimento',
	'Decodificando a linguagem da pesquisa',
	'Explorando as fronteiras da ciência',
	'Montando o quebra-cabeça da informação',
]

export function SearchEngine() {
	const [articles, setArticles] = useState<Article[]>([])
	const [aiArticles, setAiArticles] = useState<Article[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [isAiLoading, setIsAiLoading] = useState(false)
	const [totalResults, setTotalResults] = useState(0)
	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [currentFilters, setCurrentFilters] = useState({})
	const [loadingMessage, setLoadingMessage] = useState('')
	const [advancedQuery, setAdvancedQuery] = useState('')
	const [loadingTime, setLoadingTime] = useState(15)
	const { toast } = useToast()
	const [isImportModalOpen, setIsImportModalOpen] = useState(false)
	const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
	const [selectedDoiInfo, setSelectedDoiInfo] = useState<DoiInfo | null>(null)

	const handleImportArticle = async (siteId: string) => {
		try {
			const response = await fetch('/api/articles', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ siteId }),
			})
			const importedArticle = await response.json()

			if (!response.ok) {
				throw new Error(importedArticle.error || 'Erro ao importar artigo')
			}

			setSelectedArticle(importedArticle.article)

			const response_doi = await fetch(`https://api.altmetric.com/v1/doi/${importedArticle.article.doi}`)
			if (!response_doi.ok) {
				throw new Error('Failed to fetch DOI info')
			}
			const data = await response_doi.json()
			setSelectedDoiInfo({
				journal: data.journal,
				authors: data.authors,
				pubdate: data.pubdate,
				score: data.score,
				readers_count: data.readers_count,
				cited_by_posts_count: data.cited_by_posts_count,
			})

			setIsImportModalOpen(false)
			toast({
				title: 'Artigo importado com sucesso',
				description: 'O artigo foi adicionado ao banco de dados.',
			})
		} catch (error) {
			console.error('Error importing article:', error)
			if (error.message === 'Article with the given siteId already exists') {
				toast({
					title: 'Artigo já importado',
					description: 'O artigo já foi importado anteriormente.',
				})
				return
			}
			toast({
				title: 'Erro na importação',
				description: 'Ocorreu um erro ao importar o artigo. Por favor, tente novamente.',
				variant: 'destructive',
			})
		}
	}

	const handleSearch = useCallback(
		async (filters: any, page: number = 1, isNewSearch: boolean = true) => {
			setIsLoading(true)
			try {
				const queryParams = new URLSearchParams()

				if (filters.title) queryParams.append('title', filters.title)
				if (filters.authors && filters.authors.length > 0) filters.authors.forEach((author: string) => queryParams.append('authors', author))
				if (filters.publicationYearRange && filters.publicationYearRange.from) queryParams.append('publicationYearFrom', filters.publicationYearRange.from.getFullYear().toString())
				if (filters.publicationYearRange && filters.publicationYearRange.to) queryParams.append('publicationYearTo', filters.publicationYearRange.to.getFullYear().toString())
				if (filters.topics && filters.topics.length > 0) filters.topics.forEach((topic: string) => queryParams.append('topics', topic))
				if (filters.language) queryParams.append('language', filters.language)
				if (filters.isOpenAccess) queryParams.append('isOpenAccess', filters.isOpenAccess.toString())
				if (filters.peerReviewed) queryParams.append('peerReviewed', filters.peerReviewed.toString())
				if (filters.publicationType) queryParams.append('publicationType', filters.publicationType)
				if (filters.status) queryParams.append('status', filters.status)
				if (filters.journalName) queryParams.append('journalName', filters.journalName)

				queryParams.append('page', page.toString())
				queryParams.append('pageSize', pageSize.toString())

				const response = await fetch(`/api/articles/?${queryParams}`)
				const data = await response.json()

				setArticles(data.data)
				setTotalResults(data.total)
				setCurrentPage(data.page)
				setPageSize(data.pageSize)
				setCurrentFilters(filters)

				if (isNewSearch) {
					toast({
						title: 'Pesquisa realizada',
						description: `Encontrados ${data.total} resultados.`,
					})
				}
			} catch (error) {
				console.error('Error searching articles:', error)
				toast({
					title: 'Erro na pesquisa',
					description: 'Ocorreu um erro ao buscar os artigos. Por favor, tente novamente.',
					variant: 'destructive',
				})
			} finally {
				setIsLoading(false)
			}
		},
		[pageSize, toast]
	)

	const handleAdvancedSearch = useCallback(async () => {
		if (!advancedQuery.trim()) {
			toast({
				title: 'Consulta vazia',
				description: 'Por favor, insira uma consulta para a pesquisa avançada.',
				variant: 'destructive',
			})
			return
		}

		if (advancedQuery.length < 3) {
			toast({
				title: 'Consulta muito curta',
				description: 'Por favor, insira uma consulta com pelo menos 3 caracteres.',
				variant: 'destructive',
			})
			return
		}

		setIsAiLoading(true)
		setLoadingTime(10)
		try {
			const aiResponse = await fetch('/api/articles/advanced', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ query: advancedQuery }),
			})
			const aiData = await aiResponse.json()
			setAiArticles(aiData)
			toast({
				title: 'Pesquisa avançada concluída',
				description: `Encontrados ${aiData.length} resultados relevantes.`,
			})
		} catch (error) {
			console.error('Error in advanced search:', error)
			toast({
				title: 'Erro na pesquisa avançada',
				description: 'Ocorreu um erro ao realizar a pesquisa avançada. Por favor, tente novamente.',
				variant: 'destructive',
			})
		} finally {
			setIsAiLoading(false)
		}
	}, [advancedQuery, toast])

	useEffect(() => {
		handleSearch({})
	}, [handleSearch])

	useEffect(() => {
		if (isAiLoading) {
			const interval = setInterval(() => {
				setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)])
			}, 3000)

			const timer = setInterval(() => {
				setLoadingTime((prevTime) => {
					if (prevTime > 0) {
						return prevTime - 1
					} else {
						clearInterval(timer)
						return 0
					}
				})
			}, 1000)

			return () => {
				clearInterval(interval)
				clearInterval(timer)
			}
		}
	}, [isAiLoading])

	const handleResetFilters = useCallback(() => {
		handleSearch({})
	}, [handleSearch])

	const handlePageChange = useCallback(
		(newPage: number) => {
			handleSearch(currentFilters, newPage, false)
		},
		[handleSearch, currentFilters]
	)

	return (
		<div className="flex min-h-screen bg-[#F1F1F1]">
			<FilterSidebar onFilterChange={(filters) => handleSearch(filters)} onResetFilters={handleResetFilters} />
			<main className="flex-1 p-8">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-bold text-[#2E144D]">Resultados da Pesquisa</h1>

					<div className="flex items-center space-x-2">
						<Input
							type="text"
							placeholder="Explore o conhecimento com IA..."
							value={advancedQuery}
							onChange={(e) => setAdvancedQuery(e.target.value)}
							className="w-64 bg-white"
							aria-label="Pesquisa avançada com IA"
						/>

						<RainbowButton onClick={handleAdvancedSearch} disabled={isAiLoading} className="text-white font-semibold py-2 px-4 rounded-md shadow-lg">
							<Search className="w-4 h-4 mr-2" />
							Pesquisa IA
						</RainbowButton>
						<div className="flex justify-center my-4">
							<Button onClick={() => setIsImportModalOpen(true)} className="bg-[#2E144D] text-white hover:bg-[#2E144D]/90">
								<FileImport className="w-4 h-4 mr-2" />
								Importar artigo
							</Button>
						</div>
					</div>
				</div>
				{isAiLoading && (
					<div className="flex flex-col items-center justify-center mb-8 p-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg shadow-lg">
						<div className="mb-4 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 animate-pulse">
							<WordRotate words={loadingMessages} className="text-3xl font-extrabold" />
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-4 h-4 bg-purple-600 rounded-full animate-bounce" />
							<div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce delay-100" />
							<div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce delay-200" />
						</div>
						<p className="mt-4 text-lg text-gray-700">{loadingTime > 0 ? `Tempo estimado: ${loadingTime} segundos` : 'A pesquisa será concluída em instantes...'}</p>
					</div>
				)}
				<ArticleListAi articles={aiArticles} isLoading={isAiLoading} />
				<ArticleList articles={articles} isLoading={isLoading} totalResults={totalResults} currentPage={currentPage} pageSize={pageSize} onPageChange={handlePageChange} />
			</main>
			<ImportArticleModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleImportArticle} />
			{selectedArticle && <ArticleModal article={selectedArticle} doiInfo={selectedDoiInfo} isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} />}
		</div>
	)
}
