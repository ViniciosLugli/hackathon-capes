'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CircularProgress } from '@nextui-org/progress'
import { Search, Sparkles, LockOpen, Plus } from 'lucide-react'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { useToast } from '@/hooks/use-toast'
import { Article } from '@/types'
import { ArticleModal } from '@/components/ArticleModal'

interface RecommendedArticlesProps {
	initialArticles: Article[]
	currentContent: string
	onAddReference: (reference: string) => void
}

export default function RecommendedArticles({ initialArticles, currentContent, onAddReference }: RecommendedArticlesProps) {
	const [articles, setArticles] = useState<Article[]>(initialArticles)
	const [isLoading, setIsLoading] = useState(false)
	const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
	const { toast } = useToast()

	const handleFindRecommended = useCallback(async () => {
		if (!currentContent.trim()) {
			toast({
				title: 'Conteúdo vazio',
				description: 'Por favor, adicione algum conteúdo ao editor antes de buscar recomendações.',
				variant: 'destructive',
			})
			return
		}

		if (currentContent.length < 100) {
			toast({
				title: 'Conteúdo muito curto',
				description: 'Por favor, adicione mais conteúdo ao editor antes de buscar recomendações.',
				variant: 'destructive',
			})
			return
		}

		setIsLoading(true)
		try {
			const response = await fetch('/api/articles/advanced', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ query: currentContent }),
			})
			const data = await response.json()
			if (Array.isArray(data)) {
				setArticles(data)
				toast({
					title: 'Recomendações atualizadas',
					description: `Encontrados ${data.length} artigos recomendados.`,
				})
			} else {
				throw new Error('Received invalid data format')
			}
		} catch (error) {
			console.error('Error fetching recommended articles:', error)
			toast({
				title: 'Não foi possível encontrar recomendações',
				description: 'Ocorreu um erro ao buscar artigos recomendados. Por favor, tente novamente.',
				variant: 'destructive',
			})
			setArticles([])
		} finally {
			setIsLoading(false)
		}
	}, [currentContent, toast])

	const handleArticleClick = (article: Article) => {
		setSelectedArticle(article)
	}

	const handleAddReference = (article: Article) => {
		const reference = `${article.authors.join(', ')}. (${article.publicationYear}). ${article.title}. ${article.journalName || ''}.`
		onAddReference(reference)
		toast({
			title: 'Referência adicionada',
			description: 'A referência foi adicionada ao editor com sucesso.',
		})
	}

	return (
		<Card className="w-full">
			<CardContent className="p-4">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold">Artigos Recomendados</h2>
					<Button onClick={handleFindRecommended} disabled={isLoading} className="bg-purple-600 text-white hover:bg-purple-700">
						<Search className="w-4 h-4 mr-2" />
						{isLoading ? 'Buscando...' : 'Atualizar'}
					</Button>
				</div>
				<ScrollArea className="h-[calc(100vh-200px)] pr-2">
					{articles.length > 0 ? (
						articles.map((article, index) => (
							<motion.div key={article.id} whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }} className="mb-3 overflow-hidden">
								<BackgroundGradient className="rounded-lg p-[1px] bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
									<Card className="w-full shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
										<CardContent className="p-3">
											<div className="flex items-start gap-2">
												<span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														{article.isOpenAccess && <LockOpen className="w-3 h-3 text-green-500" />}
														{article.aiResume && (
															<Badge variant="outline" className="text-xs py-0 px-1 bg-gradient-to-r from-purple-400 to-pink-500 text-white">
																<Sparkles className="w-2 h-2 mr-1" />
																IA
															</Badge>
														)}
													</div>
													<h3 className="text-sm font-semibold text-[#2E144D] line-clamp-2 cursor-pointer" onClick={() => handleArticleClick(article)}>
														{article.title}
													</h3>
													<p className="text-xs text-muted-foreground mt-1 line-clamp-1">
														{article.authors.slice(0, 3).join(', ')}
														{article.authors.length > 3 && ' et al.'}
													</p>
												</div>
												<Button
													variant="ghost"
													size="icon"
													className="ml-2 flex-shrink-0"
													onClick={(e) => {
														e.stopPropagation()
														handleAddReference(article)
													}}
												>
													<Plus className="h-4 w-4" />
												</Button>
											</div>
										</CardContent>
									</Card>
								</BackgroundGradient>
							</motion.div>
						))
					) : (
						<div className="text-center text-gray-500">{isLoading ? <CircularProgress size="lg" aria-label="Loading..." /> : 'Nenhum artigo recomendado encontrado.'}</div>
					)}
				</ScrollArea>
			</CardContent>
			{selectedArticle && (
				<ArticleModal article={selectedArticle} isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} isAiRecommended={!!selectedArticle.aiResume} doiInfo={null} />
			)}
		</Card>
	)
}
