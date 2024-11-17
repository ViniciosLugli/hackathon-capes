'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Article } from '@/types'

interface RecommendedArticlesProps {
	initialArticles: Article[]
	currentContent: string
}

export default function RecommendedArticles({ initialArticles, currentContent }: RecommendedArticlesProps) {
	const [articles, setArticles] = useState<Article[]>(initialArticles)
	const [isLoading, setIsLoading] = useState(false)
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
			setArticles(data)
			toast({
				title: 'Recomendações atualizadas',
				description: `Encontrados ${data.length} artigos recomendados.`,
			})
		} catch (error) {
			console.error('Error fetching recommended articles:', error)
			toast({
				title: 'Erro na busca',
				description: 'Ocorreu um erro ao buscar artigos recomendados. Por favor, tente novamente.',
				variant: 'destructive',
			})
		} finally {
			setIsLoading(false)
		}
	}, [currentContent, toast])

	return (
		<Card className="w-full">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle>Artigos Recomendados</CardTitle>
				<Button onClick={handleFindRecommended} disabled={isLoading} className="text-white">
					<Search className="w-4 h-4 mr-2" />
					{isLoading ? 'Buscando...' : 'Atualizar'}
				</Button>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[calc(100vh-200px)] pr-4">
					{articles.map((article) => (
						<div key={article.id} className="mb-4 p-4 border rounded-md">
							<h3 className="font-semibold mb-2">{article.title}</h3>
							<p className="text-sm text-gray-600 mb-2">
								{article.authors.join(', ')} ({article.publicationYear})
							</p>
							<p className="text-sm mb-2">{article.abstract.substring(0, 150)}...</p>
							<div className="flex flex-wrap gap-2">
								{article.topics.map((topic) => (
									<Badge key={topic.id} variant="secondary">
										{topic.name}
									</Badge>
								))}
							</div>
							{article.aiResume && (
								<div className="mt-2">
									<h4 className="font-semibold text-sm">Resumo IA:</h4>
									<p className="text-sm">{article.aiResume}</p>
								</div>
							)}
						</div>
					))}
				</ScrollArea>
			</CardContent>
		</Card>
	)
}
