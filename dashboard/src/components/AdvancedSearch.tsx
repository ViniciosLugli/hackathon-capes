'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mic, ChevronLeft, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useSearch } from '@/contexts/SearchContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const loadingMessages = [
	'Pesquisando o universo acadêmico...',
	'Conectando neurônios do conhecimento...',
	'Decodificando a linguagem da pesquisa...',
	'Explorando as fronteiras da ciência...',
	'Montando o quebra-cabeça da informação...',
]

export function AdvancedSearch() {
	const { isExpanded, setIsExpanded, query, setQuery, performSearch, advancedResults, filterResults, aiResponse, isLoading, filterOptions, performFilterSearch, isFilterLoading } = useSearch()

	const [isListening, setIsListening] = useState(false)
	const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
	const [filters, setFilters] = useState({
		topics: [],
		language: null,
		publicationType: null,
		status: null,
		isOpenAccess: null,
		peerReviewed: null,
		publicationYear: null,
		journalName: null,
	})
	const [showFilters, setShowFilters] = useState(false)

	const handleVoiceSearch = () => {
		setIsListening(true)
		setTimeout(() => {
			setIsListening(false)
			setQuery('exemplo de busca por voz')
		}, 2000)
	}

	const handleSearch = async () => {
		if (query.trim()) {
			await performSearch()
		}
	}

	const updateFilter = (key: string, value: any) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}))
	}

	const toggleFilter = (key: string, value: string) => {
		setFilters((prev) => ({
			...prev,
			[key]: prev[key].includes(value) ? prev[key].filter((item: string) => item !== value) : [...prev[key], value],
		}))
	}

	useEffect(() => {
		if (isLoading) {
			const interval = setInterval(() => {
				setLoadingMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length)
			}, 3000)
			return () => clearInterval(interval)
		}
	}, [isLoading])

	const handleApplyFilters = async () => {
		await performFilterSearch({ ...filters, title: query })
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSearch()
		}
	}

	return (
		<div className="w-full h-full flex flex-col">
			<AnimatePresence>
				{!isExpanded ? (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-4xl mx-auto flex items-center gap-2">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
							<Input
								className="pl-10 pr-20 py-6 text-lg bg-white border-gray-300"
								placeholder="Pesquisar artigos..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onFocus={() => setIsExpanded(true)}
								onKeyDown={handleKeyDown}
								aria-label="Pesquisar artigos"
							/>
							<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
								<Button
									variant="ghost"
									size="icon"
									className={`transition-colors ${isListening ? 'text-red-500' : 'text-gray-500'}`}
									onClick={handleVoiceSearch}
									aria-label="Busca por voz"
								>
									<Mic className="h-5 w-5" />
								</Button>
							</div>
						</div>
						<Button onClick={handleSearch} className="bg-[#2E144D] text-white">
							Pesquisar
						</Button>
					</motion.div>
				) : (
					<motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed inset-0 bg-white z-50 p-4 flex flex-col">
						<div className="flex items-center gap-2 mb-4">
							<Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="shrink-0" aria-label="Voltar">
								<ChevronLeft className="h-5 w-5" />
							</Button>
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
								<Input
									className="pl-10 pr-10 py-6 text-lg bg-white border-gray-300"
									placeholder="Ex: artigos recentes sobre IA na educação..."
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									onKeyDown={handleKeyDown}
									aria-label="Consulta de pesquisa"
								/>
								<Button
									variant="ghost"
									size="icon"
									className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-red-500' : 'text-gray-500'}`}
									onClick={handleVoiceSearch}
									aria-label="Busca por voz"
								>
									<Mic className="h-5 w-5" />
								</Button>
							</div>
							<Button onClick={() => setShowFilters(!showFilters)} size="icon" className="bg-gray-200 text-gray-700" aria-label="Filtros">
								<Filter className="h-5 w-5" />
							</Button>
							<Button onClick={handleSearch} size="icon" className="bg-[#2E144D] text-white" aria-label="Pesquisar">
								<Search className="h-5 w-5" />
							</Button>
						</div>

						<div className="flex-1 overflow-auto flex">
							{showFilters && (
								<motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="w-64 bg-gray-100 p-4 overflow-y-auto">
									<div className="flex justify-between items-center mb-4">
										<h2 className="text-lg font-bold">Filtros</h2>
										<Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} aria-label="Fechar filtros">
											<X className="h-5 w-5" />
										</Button>
									</div>
									{isFilterLoading ? (
										<p>Carregando filtros...</p>
									) : filterOptions ? (
										<>
											<div className="mb-4">
												<label className="block text-sm font-medium mb-2">Tópicos</label>
												{filterOptions.topics.map((topic) => (
													<div key={topic} className="flex items-center mb-2">
														<Checkbox id={`topic-${topic}`} checked={filters.topics.includes(topic)} onCheckedChange={() => toggleFilter('topics', topic)} />
														<label htmlFor={`topic-${topic}`} className="ml-2 text-sm">
															{topic}
														</label>
													</div>
												))}
											</div>
											<div className="mb-4">
												<label className="block text-sm font-medium mb-2">Idioma</label>
												<select className="w-full border-gray-300 rounded-lg" value={filters.language} onChange={(e) => updateFilter('language', e.target.value)}>
													<option value="">Todos</option>
													{filterOptions.languages.map((language) => (
														<option key={language} value={language}>
															{language}
														</option>
													))}
												</select>
											</div>
											<Button onClick={handleApplyFilters} className="bg-[#2E144D] text-white w-full">
												Aplicar Filtros
											</Button>
										</>
									) : (
										<p>Filtros não disponíveis.</p>
									)}
								</motion.div>
							)}

							<ScrollArea className="flex-1 pl-4">
								{aiResponse && (
									<Card className="mb-4">
										<CardHeader>
											<CardTitle>Resposta da IA</CardTitle>
										</CardHeader>
										<CardContent>
											<p>{aiResponse}</p>
										</CardContent>
									</Card>
								)}

								{isLoading ? (
									<div className="flex flex-col items-center justify-center h-full">
										<div className="w-16 h-16 border-t-4 border-[#2E144D] border-solid rounded-full animate-spin mb-4" />
										<p className="text-lg text-gray-600 text-center">{loadingMessages[loadingMessageIndex]}</p>
									</div>
								) : (
									<div className="space-y-4">
										{(advancedResults.length > 0 ? advancedResults : filterResults).map((result) => (
											<Card key={result.id}>
												<CardContent className="p-4">
													<h3 className="text-lg font-semibold text-[#2E144D] hover:underline cursor-pointer">{result.title}</h3>
													<p className="text-sm text-muted-foreground mt-1">{result.authors.join(', ')}</p>
													<p className="text-sm mt-2">{result.abstract}</p>
													<div className="flex items-center gap-2 mt-4">
														<span className="text-sm text-muted-foreground">
															{result.journal} • {result.year}
														</span>
														{result.isOpenAccess && (
															<span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
																Acesso Aberto
															</span>
														)}
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								)}
							</ScrollArea>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
