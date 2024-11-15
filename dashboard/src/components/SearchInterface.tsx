'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mic, Filter, ArrowLeft, BookOpen, FileText, Mail, Book, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface SearchResult {
	id: number
	title: string
	authors: string[]
	journal: string
	year: number
	abstract: string
	isOpenAccess: boolean
	type: 'article' | 'review' | 'book' | 'letter'
}

export function SearchInterface() {
	const [isExpanded, setIsExpanded] = React.useState(false)
	const [query, setQuery] = React.useState('')
	const [isListening, setIsListening] = React.useState(false)
	const [results, setResults] = React.useState<SearchResult[]>([])
	const [filters, setFilters] = React.useState({
		openAccess: false,
		type: {
			article: true,
			review: true,
			book: true,
			letter: true,
		},
	})

	const mockResults: SearchResult[] = [
		{
			id: 1,
			title: '(A Falta de) Indicadores de Empreendedorismo no Brasil',
			authors: ['Cândido Borges', 'Tales Andreassi', 'Vânia Maria Jorge Nassif'],
			journal: 'REGEPE Entrepreneurship and Small Business Journal',
			year: 2017,
			abstract: 'A participação destas no emprego (OCDE, 2009). Um exemplo de indicador utilizado nessa categoria é...',
			isOpenAccess: true,
			type: 'article',
		},
		// Add more mock results as needed
	]

	const handleSearch = () => {
		if (query.trim()) {
			setResults(mockResults)
			setIsExpanded(true)
		}
	}

	const handleVoiceSearch = () => {
		setIsListening(true)
		// Implement voice recognition logic here
		setTimeout(() => {
			setIsListening(false)
			setQuery('exemplo de busca por voz')
			handleSearch()
		}, 2000)
	}

	return (
		<AnimatePresence>
			<motion.div
				className={`fixed inset-0 bg-white z-50 ${isExpanded ? 'overflow-auto' : 'overflow-hidden'}`}
				initial={false}
				animate={isExpanded ? 'expanded' : 'collapsed'}
				variants={{
					expanded: {
						height: '100vh',
						backgroundColor: '#F1F1F1',
					},
					collapsed: {
						height: 'auto',
						backgroundColor: 'transparent',
					},
				}}
			>
				<div className="container mx-auto px-4">
					<motion.div
						className="flex items-center gap-4"
						variants={{
							expanded: { y: 16 },
							collapsed: { y: 0 },
						}}
					>
						{isExpanded && (
							<Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="shrink-0">
								<ArrowLeft className="h-5 w-5" />
							</Button>
						)}
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
							<Input
								className="pl-10 pr-20 py-6 text-lg bg-white border-[#2E144D] w-full"
								placeholder="Ex: artigos recentes sobre IA na educação..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onFocus={() => !isExpanded && handleSearch()}
							/>
							<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
								<Button variant="ghost" size="icon" className={`transition-colors ${isListening ? 'text-red-500' : 'text-muted-foreground'}`} onClick={handleVoiceSearch}>
									<Mic className="h-5 w-5" />
								</Button>
								<Sheet>
									<SheetTrigger asChild>
										<Button variant="ghost" size="icon" className="text-muted-foreground">
											<Filter className="h-5 w-5" />
										</Button>
									</SheetTrigger>
									<SheetContent>
										<SheetHeader>
											<SheetTitle>Filtros de Busca</SheetTitle>
										</SheetHeader>
										<div className="grid gap-4 py-4">
											<div className="flex items-center justify-between">
												<label htmlFor="open-access" className="text-sm font-medium">
													Acesso Aberto
												</label>
												<Switch id="open-access" checked={filters.openAccess} onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, openAccess: checked }))} />
											</div>
											<Collapsible>
												<CollapsibleTrigger className="flex w-full items-center justify-between py-2">
													<span className="text-sm font-medium">Tipo de Recurso</span>
													<ChevronDown className="h-4 w-4" />
												</CollapsibleTrigger>
												<CollapsibleContent className="space-y-2">
													{Object.entries(filters.type).map(([type, checked]) => (
														<div key={type} className="flex items-center gap-2">
															<Switch
																id={type}
																checked={checked}
																onCheckedChange={(checked) =>
																	setFilters((prev) => ({
																		...prev,
																		type: { ...prev.type, [type]: checked },
																	}))
																}
															/>
															<label htmlFor={type} className="text-sm">
																{type.charAt(0).toUpperCase() + type.slice(1)}
															</label>
														</div>
													))}
												</CollapsibleContent>
											</Collapsible>
										</div>
									</SheetContent>
								</Sheet>
							</div>
						</div>
					</motion.div>

					{isExpanded && (
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="mt-8 grid md:grid-cols-[300px,1fr] gap-8">
							<div className="space-y-6">
								<div className="bg-white rounded-lg p-4 space-y-4">
									<h3 className="font-semibold">Filtros</h3>
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<label className="text-sm">Acesso Aberto</label>
											<Switch checked={filters.openAccess} onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, openAccess: checked }))} />
										</div>
									</div>
									<div className="space-y-2">
										<h4 className="text-sm font-medium">Tipo de Recurso</h4>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<BookOpen className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">Artigo</span>
												<span className="text-sm text-muted-foreground ml-auto">36237</span>
											</div>
											<div className="flex items-center gap-2">
												<FileText className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">Editorial</span>
												<span className="text-sm text-muted-foreground ml-auto">136</span>
											</div>
											<div className="flex items-center gap-2">
												<Book className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">Revisão</span>
												<span className="text-sm text-muted-foreground ml-auto">108</span>
											</div>
											<div className="flex items-center gap-2">
												<Mail className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">Carta</span>
												<span className="text-sm text-muted-foreground ml-auto">24</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							<ScrollArea className="h-[calc(100vh-200px)]">
								<div className="space-y-4">
									{results.map((result) => (
										<motion.div key={result.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg p-6">
											<div className="flex items-start justify-between">
												<div>
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
												</div>
											</div>
										</motion.div>
									))}
								</div>
							</ScrollArea>
						</motion.div>
					)}
				</div>
			</motion.div>
		</AnimatePresence>
	)
}
