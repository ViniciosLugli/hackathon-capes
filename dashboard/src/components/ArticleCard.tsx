'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CircularProgress } from '@nextui-org/progress'
import { Article, DoiInfo } from '@/types'
import { Printer, Download, LockOpen, Share2, Sparkles, Users, MessageSquare } from 'lucide-react'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { ArticleModal } from '@/components/ArticleModal'
import { useToast } from '@/hooks/use-toast'
import { handlePrint, handleDownload, handleShare } from '@/utils/article'

interface ArticleCardProps {
	article: Article
	index: number
}

export function ArticleCard({ article, index }: ArticleCardProps) {
	const [isFocused, setIsFocused] = useState(false)
	const [doiInfo, setDoiInfo] = useState<DoiInfo | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const timerRef = useRef<NodeJS.Timeout | null>(null)
	const [progress, setProgress] = useState(0)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { toast } = useToast()

	const isAiRecommended = !!article.aiResume

	const fetchDoiInfo = async () => {
		try {
			const response = await fetch(`https://api.altmetric.com/v1/doi/${article.doi}`)
			if (!response.ok) {
				throw new Error('Failed to fetch DOI info')
			}
			const data = await response.json()
			setDoiInfo({
				journal: data.journal,
				authors: data.authors,
				pubdate: data.pubdate,
				score: data.score,
				readers_count: data.readers_count,
				cited_by_posts_count: data.cited_by_posts_count,
			})
		} catch (error) {
			console.log('Error fetching DOI info:', error)
			setError('Não foi possível obter informações adicionais sobre o artigo.')
		}
	}

	useEffect(() => {
		fetchDoiInfo()
	}, [])

	const handleMouseEnter = () => {
		if (!isAiRecommended) {
			setIsLoading(true)
			setProgress(0)
			timerRef.current = setInterval(() => {
				setProgress((prevProgress) => {
					if (prevProgress >= 100) {
						clearInterval(timerRef.current as NodeJS.Timeout)
						setIsFocused(true)
						setIsLoading(false)
						return 100
					}
					return prevProgress + 100 / 5
				})
			}, 100)
		}
	}

	const handleMouseLeave = () => {
		if (!isAiRecommended) {
			if (timerRef.current) {
				clearInterval(timerRef.current)
			}
			setIsFocused(false)
			setIsLoading(false)
			setProgress(0)
		}
	}

	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current)
			}
		}
	}, [])

	return (
		<>
			<motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} onClick={() => setIsModalOpen(true)} className="cursor-pointer">
				<BackgroundGradient className={`rounded-lg p-[1px] ${isAiRecommended ? 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500' : 'bg-white dark:bg-zinc-900'}`}>
					<Card
						className={`w-full shadow-lg overflow-hidden relative ${
							isAiRecommended ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900' : 'bg-white dark:bg-zinc-900'
						}`}
						onMouseEnter={handleMouseEnter}
						onMouseLeave={handleMouseLeave}
					>
						{isLoading && !isAiRecommended && (
							<div className="absolute top-2 right-2 z-10">
								<CircularProgress value={progress} className="w-8 h-8" />
							</div>
						)}
						<CardContent className="p-4 sm:p-6">
							<div className="flex flex-col sm:flex-row items-start gap-4">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										{!isAiRecommended && <span className="text-lg font-medium text-muted-foreground">{index}</span>}
										{article.isOpenAccess && (
											<div className="flex items-center gap-1 text-sm">
												<LockOpen className="w-4 h-4 text-green-500" />
												<span>Acesso aberto</span>
											</div>
										)}
										{isAiRecommended && (
											<Badge variant="outline" className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
												<Sparkles className="w-3 h-3 mr-1" />
												IA Destacado
											</Badge>
										)}
										{article.id && <span className="text-sm text-muted-foreground">ID: {article.id}</span>}
										{article.doi && <span className="text-sm text-muted-foreground">DOI: {article.doi}</span>}
									</div>
									<TextGenerateEffect
										className={`text-2xl font-semibold mb-2 ${isAiRecommended ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600' : 'text-[#2E144D]'}`}
									>
										{article.title}
									</TextGenerateEffect>
									<p className="text-sm text-muted-foreground mb-2">{article.authors.join(', ')}</p>
									<motion.div
										className="text-base text-gray-600 mb-4"
										initial={{ height: isAiRecommended ? 'auto' : '3em', overflow: 'hidden' }}
										animate={{ height: isAiRecommended || isFocused ? 'auto' : '3em' }}
										transition={{ duration: 0.3 }}
									>
										{isAiRecommended ? (
											<>
												<p className="font-medium mb-2">Resumo IA:</p>
												<p>{article.aiResume}</p>
											</>
										) : (
											<p>{article.abstract}</p>
										)}
									</motion.div>
									<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
										<span>{article.publicationYear}</span>
										{article.institutions.length > 0 && <span>- {article.institutions.join(', ')}</span>}
										{article.publisherName && <span>- {article.publisherName}</span>}
										{article.journalName && <span>- {article.journalName}</span>}
										{article.language && <span>- {article.language}</span>}
										{article.isPeerReviewed && (
											<Badge variant="outline" className="bg-orange-300">
												Revisado por pares
											</Badge>
										)}
									</div>
									{doiInfo && (
										<div className="mt-4 flex flex-wrap gap-4">
											<div className="flex items-center gap-2">
												<Users className="w-4 h-4" />
												<span>{doiInfo.readers_count} leitores</span>
											</div>
											<div className="flex items-center gap-2">
												<MessageSquare className="w-4 h-4" />
												<span>{doiInfo.cited_by_posts_count} citações</span>
											</div>
											<div className="flex items-center gap-2">
												<Sparkles className="w-4 h-4" />
												<span>Score: {doiInfo.score.toFixed(2)}</span>
											</div>
										</div>
									)}
								</div>
								<div className="flex sm:flex-col gap-2 mt-4 sm:mt-0">
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation()
											handlePrint(article, toast)
										}}
									>
										<Printer className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation()
											handleDownload(article, toast)
										}}
									>
										<Download className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation()
											handleShare(article, toast)
										}}
									>
										<Share2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</BackgroundGradient>
			</motion.div>

			<ArticleModal article={article} doiInfo={doiInfo} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isAiRecommended={isAiRecommended} />
		</>
	)
}
