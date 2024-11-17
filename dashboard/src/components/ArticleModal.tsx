'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExternalLink, BookOpen, Users, Printer, Download, LockOpen, Zap, ArrowLeft, Sparkles, MessageSquare, Globe } from 'lucide-react'
import { Article } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { handlePrint, handleDownload, handleShare } from '@/utils/article'

interface ArticleModalProps {
	article: Article
	doiInfo: DoiInfo | null
	isOpen: boolean
	onClose: () => void
	isAiRecommended?: boolean
}

interface DoiInfo {
	journal: string
	authors: string[]
	pubdate: number
	score: number
	readers_count: number
	cited_by_posts_count: number
}

interface Citation {
	id: string
	citingArticleId: string
	citedArticleId: string | null
	citedSiteId: string | null
	citedDoi: string
	citedTitle: string
	citedAuthors: string[]
	citedJournal: string
	citedVolume: string | null
	citedIssue: string | null
	citedPages: string | null
	citedYear: number
	citedUrl: string
	createdAt: string
	updatedAt: string
}

export function ArticleModal({ article, doiInfo, isOpen, onClose, isAiRecommended = false }: ArticleModalProps) {
	const [aiSummary, setAiSummary] = useState<string | null>(null)
	const [translation, setTranslation] = useState<string | null>(null)
	const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
	const [isGeneratingTranslation, setIsGeneratingTranslation] = useState(false)
	const [citationsMade, setCitationsMade] = useState<Citation[]>([])
	const [citationsReceived, setCitationsReceived] = useState<Citation[]>([])
	const [error, setError] = useState<string | null>(null)
	const summaryRef = useRef<string>('')
	const translationRef = useRef<string>('')
	const [isDownloading, setIsDownloading] = useState(false)
	const { toast } = useToast()
	const [activeTab, setActiveTab] = useState('abstract')
	const [contentType, setContentType] = useState<'original' | 'summary' | 'translation'>('original')
	const [isJustOpened, setIsJustOpened] = useState(false)

	useEffect(() => {
		if (isOpen) {
			fetchCitations()
			setIsJustOpened(true)
			const timer = setTimeout(() => setIsJustOpened(false), 2000)
			return () => clearTimeout(timer)
		}
	}, [isOpen, article.id])

	const fetchCitations = async () => {
		try {
			const response = await fetch(`/api/articles/${article.id}/`)
			if (!response.ok) {
				throw new Error('Failed to fetch citations')
			}
			const data = await response.json()
			setCitationsMade(data.data.citationsMade)
			setCitationsReceived(data.data.citationsReceived)
		} catch (error) {
			console.error('Error fetching citations:', error)
			setError('Falha ao carregar citações. Por favor, tente novamente mais tarde.')
		}
	}

	const generateAISummary = async () => {
		if (summaryRef.current) {
			setAiSummary(summaryRef.current)
			return
		}

		setIsGeneratingSummary(true)
		setError(null)
		setAiSummary('')

		try {
			const response = await fetch('/api/generate-summary', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ abstract: article.abstract }),
			})

			if (!response.ok) {
				throw new Error('Failed to generate summary')
			}

			const reader = response.body?.getReader()
			if (!reader) {
				throw new Error('Failed to read response')
			}

			while (true) {
				const { done, value } = await reader.read()
				if (done) break
				const text = new TextDecoder().decode(value)
				summaryRef.current += text
				setAiSummary(summaryRef.current)
			}
		} catch (error) {
			console.error('Error generating summary:', error)
			setError('Falha ao gerar o resumo. Por favor, tente novamente mais tarde.')
		} finally {
			setIsGeneratingSummary(false)
		}
	}

	const generateTranslation = async () => {
		if (translationRef.current) {
			setTranslation(translationRef.current)
			return
		}

		setIsGeneratingTranslation(true)
		setError(null)
		setTranslation('')

		try {
			const response = await fetch('/api/translate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ article: article.abstract }),
			})

			if (!response.ok) {
				throw new Error('Failed to generate translation')
			}

			const reader = response.body?.getReader()
			if (!reader) {
				throw new Error('Failed to read response')
			}

			while (true) {
				const { done, value } = await reader.read()
				if (done) break
				const text = new TextDecoder().decode(value)
				translationRef.current += text
				setTranslation(translationRef.current)
			}
		} catch (error) {
			console.error('Error generating translation:', error)
			setError('Falha ao gerar a tradução. Por favor, tente novamente mais tarde.')
		} finally {
			setIsGeneratingTranslation(false)
		}
	}

	const handleContentTypeChange = (value: string) => {
		setContentType(value as 'original' | 'summary' | 'translation')
		if (value === 'summary' && !aiSummary) {
			generateAISummary()
		} else if (value === 'translation' && !translation) {
			generateTranslation()
		}
	}

	const getDisplayContent = () => {
		switch (contentType) {
			case 'summary':
				return aiSummary || 'Gerando resumo...'
			case 'translation':
				return translation || 'Gerando tradução...'
			default:
				return article.abstract
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[75vh] p-0 flex flex-col">
				<div className="p-4 sm:p-6 flex-shrink-0">
					<DialogHeader>
						<DialogTitle>
							<div className="flex items-center gap-2">
								{isAiRecommended && (
									<Badge variant="outline" className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
										<Sparkles className="w-3 h-3 mr-1" />
										Recomendado por IA
									</Badge>
								)}
								<TextGenerateEffect className="text-xl sm:text-2xl font-bold text-[#2E144D]">{article.title}</TextGenerateEffect>
							</div>
						</DialogTitle>
					</DialogHeader>
					<div className="mt-4">
						<div className="flex flex-wrap items-center gap-2 mb-4">
							{article.isOpenAccess && (
								<div className="flex items-center gap-1 text-sm">
									<LockOpen className="w-4 h-4 text-green-500" />
									<span>Acesso aberto</span>
								</div>
							)}
							{article.isPeerReviewed && (
								<Badge variant="outline" className="bg-orange-300">
									Revisado por pares
								</Badge>
							)}
							{article.id && <span className="text-sm text-muted-foreground">ID: {article.id}</span>}
							{article.doi && <span className="text-sm text-muted-foreground">DOI: {article.doi}</span>}
						</div>
						<p className="text-sm text-muted-foreground mb-2">{article.authors.join(', ')}</p>
						<p className="text-sm text-muted-foreground mb-4">
							{article.publicationYear}
							{article.institutions.length > 0 && ` - ${article.institutions.join(', ')}`}
							{article.publisherName && ` - ${article.publisherName}`}
							{article.journalName && ` - ${article.journalName}`}
							{article.language && ` - ${article.language}`}
						</p>
						{doiInfo && (
							<div className="flex flex-wrap gap-4 mb-4">
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
				</div>
				<div className="flex-grow overflow-hidden flex flex-col">
					<Tabs defaultValue={isAiRecommended ? 'aiReason' : 'abstract'} className="w-full flex flex-col h-full" onValueChange={setActiveTab}>
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 px-4 sm:px-6 mt-1">
							<TabsList className="mb-2 sm:mb-0">
								{isAiRecommended && <TabsTrigger value="aiReason">Motivo da Recomendação</TabsTrigger>}
								<TabsTrigger value="abstract">Resumo</TabsTrigger>
								<TabsTrigger value="references">Referências</TabsTrigger>
								{doiInfo && <TabsTrigger value="metrics">Métricas</TabsTrigger>}
							</TabsList>
							{activeTab === 'abstract' && (
								<Select onValueChange={handleContentTypeChange} defaultValue="original">
									<SelectTrigger className={`w-[180px] transition-all duration-300 ${isJustOpened ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}>
										<SelectValue placeholder="Selecione o tipo de conteúdo" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="original">Resumo Original</SelectItem>
										<SelectItem value="summary">Resumo IA</SelectItem>
										<SelectItem value="translation">Tradução</SelectItem>
									</SelectContent>
								</Select>
							)}
						</div>
						<div className="flex-grow overflow-y-auto px-4 sm:px-6 hide-content-scrollbar">
							<TabsContent value="abstract" className="h-full">
								<Card className="h-full">
									<CardContent className="pt-6 h-full overflow-y-auto">{error ? <p className="text-red-500">{error}</p> : <p>{getDisplayContent()}</p>}</CardContent>
								</Card>
							</TabsContent>
							<TabsContent value="references" className="h-full">
								<Card className="h-full">
									<CardContent className="pt-6 h-full overflow-y-auto">
										<h3 className="text-lg font-semibold mb-4">Citações Feitas</h3>
										{citationsMade.length > 0 ? (
											<ul className="list-disc pl-5 mb-6">
												{citationsMade.map((citation) => (
													<li key={citation.id} className="mb-2">
														<p>
															{citation.citedAuthors.join(', ')} ({citation.citedYear}). {citation.citedTitle}. {citation.citedJournal}.
														</p>
														<a href={citation.citedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
															{citation.citedDoi}
														</a>
													</li>
												))}
											</ul>
										) : (
											<p className="mb-6">Não há citações feitas por este artigo.</p>
										)}
										<h3 className="text-lg font-semibold mb-4">Citações Recebidas</h3>
										{citationsReceived.length > 0 ? (
											<ul className="list-disc pl-5">
												{citationsReceived.map((citation) => (
													<li key={citation.id} className="mb-2">
														<p>
															{citation.citedAuthors.join(', ')} ({citation.citedYear}). {citation.citedTitle}. {citation.citedJournal}.
														</p>
														<a href={citation.citedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
															{citation.citedDoi}
														</a>
													</li>
												))}
											</ul>
										) : (
											<p>Este artigo ainda não recebeu citações.</p>
										)}
									</CardContent>
								</Card>
							</TabsContent>
							{isAiRecommended && (
								<TabsContent value="aiReason" className="h-full">
									<Card className="h-full">
										<CardContent className="pt-6 h-full overflow-y-auto">
											<h3 className="text-lg font-semibold mb-4">Motivo da Recomendação pela IA</h3>
											<p>{article.aiResume || 'Não há informações disponíveis sobre o motivo da recomendação pela IA.'}</p>
										</CardContent>
									</Card>
								</TabsContent>
							)}
							{doiInfo && (
								<TabsContent value="metrics" className="h-full">
									<Card className="h-full">
										<CardContent className="pt-6 h-full overflow-y-auto">
											<h3 className="text-lg font-semibold mb-4">Métricas do Artigo</h3>
											<ul className="space-y-2">
												<li>
													<strong>Leitores:</strong> {doiInfo.readers_count}
												</li>
												<li>
													<strong>Citações:</strong> {doiInfo.cited_by_posts_count}
												</li>
												<li>
													<strong>Score:</strong> {doiInfo.score.toFixed(2)}
												</li>
												<li>
													<strong>Data de Publicação:</strong> {new Date(doiInfo.pubdate).toLocaleDateString()}
												</li>
												<li>
													<strong>Journal:</strong> {doiInfo.journal}
												</li>
												<li>
													<strong>Autores:</strong> {doiInfo.authors.join(', ')}
												</li>
											</ul>
										</CardContent>
									</Card>
								</TabsContent>
							)}
						</div>
					</Tabs>
				</div>
				<div className="flex flex-col sm:flex-row justify-between p-4 sm:p-6 gap-4 flex-shrink-0">
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" size="sm" onClick={() => handlePrint(article, toast)}>
							<Printer className="mr-2 h-4 w-4" />
							Imprimir
						</Button>
						<Button variant="outline" size="sm" onClick={() => handleDownload(article, toast)} disabled={isDownloading}>
							<Download className="mr-2 h-4 w-4" />
							{isDownloading ? 'Baixando...' : 'Download PDF'}
						</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" size="sm">
							<BookOpen className="mr-2 h-4 w-4" />
							Citar
						</Button>
						<Button variant="outline" size="sm" onClick={() => handleShare(article, toast)}>
							<Users className="mr-2 h-4 w-4" />
							Compartilhar
						</Button>
						<Button variant="outline" size="sm" onClick={() => window.open(`https://doi.org/${article.doi}`, '_blank')}>
							<ExternalLink className="mr-2 h-4 w-4" />
							Ver Completo
						</Button>
					</div>
				</div>
			</DialogContent>
			<style jsx global>{`
				.hide-scrollbar::-webkit-scrollbar {
					display: none;
				}
				.hide-scrollbar {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
				.hide-content-scrollbar {
					scrollbar-width: none;
					-ms-overflow-style: none;
				}
				.hide-content-scrollbar::-webkit-scrollbar {
					display: none;
				}
			`}</style>
		</Dialog>
	)
}
