'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mic, ChevronLeft, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { useSearch } from '@/contexts/SearchContext'
import { cn } from '@/lib/utils'
import { Slider as NextUISlider } from '@nextui-org/slider'

const sliderThumbStyles =
	'block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

export function AdvancedSearch() {
	const { isExpanded, setIsExpanded, query, setQuery, filters, updateFilter, performSearch, isLoading, results } = useSearch()

	const [isListening, setIsListening] = useState(false)
	const [showFilters, setShowFilters] = useState(false)
	const [yearRange, setYearRange] = useState([filters.yearRange.min, filters.yearRange.max])

	const handleVoiceSearch = () => {
		setIsListening(true)
		setTimeout(() => {
			setIsListening(false)
			setQuery('exemplo de busca por voz')
			performSearch()
		}, 2000)
	}

	const toggleFilters = () => {
		setShowFilters(!showFilters)
	}

	useEffect(() => {
		if (isExpanded) {
			performSearch()
		}
	}, [isExpanded, performSearch])

	return (
		<div className="w-full h-full">
			<AnimatePresence>
				{!isExpanded ? (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-4xl mx-auto flex items-center gap-2">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
							<Input
								className="pl-10 pr-20 py-6 text-lg bg-white border-[#2E144D]"
								placeholder="Buscar artigos, periódicos..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onFocus={() => setIsExpanded(true)}
							/>
							<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
								<Button variant="ghost" size="icon" className={`transition-colors ${isListening ? 'text-red-500' : 'text-muted-foreground'}`} onClick={handleVoiceSearch}>
									<Mic className="h-5 w-5" />
								</Button>
							</div>
						</div>
						<Button onClick={() => setIsExpanded(true)} className="bg-[#2E144D] text-white">
							Buscar
						</Button>
					</motion.div>
				) : (
					<motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed inset-0 bg-white z-50 p-4 flex">
						<div className="w-64 mr-4">
							<Button variant="outline" className="w-full mb-4 flex items-center justify-center" onClick={toggleFilters}>
								<Filter className="h-4 w-4 mr-2" />
								{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
							</Button>
							<AnimatePresence>
								{showFilters && (
									<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
										<ScrollArea className="h-[calc(100vh-120px)]">
											<div className="space-y-6 pr-4">
												<div>
													<Label className="text-sm font-semibold">Acesso Aberto</Label>
													<div className="flex items-center space-x-2 mt-2">
														<Switch id="open-access" checked={filters.openAccess} onCheckedChange={(checked) => updateFilter('openAccess', checked)} />
														<Label htmlFor="open-access">Apenas acesso aberto</Label>
													</div>
												</div>

												<div>
													<Label className="text-sm font-semibold">Ano de Publicação</Label>
													<NextUISlider
														label="Selecione o intervalo de anos"
														step={1}
														minValue={1969}
														maxValue={new Date().getFullYear()}
														value={yearRange}
														onChange={(value) => {
															if (Array.isArray(value)) {
																setYearRange(value)
																updateFilter('yearRange', { min: value[0], max: value[1] })
															}
														}}
														className="max-w-md mt-2"
													/>
													<div className="flex justify-between mt-1 text-sm text-muted-foreground">
														<span>{yearRange[0]}</span>
														<span>{yearRange[1]}</span>
													</div>
												</div>

												<div>
													<Label className="text-sm font-semibold">Produção Nacional</Label>
													<RadioGroup
														value={filters.nationalProduction === null ? '' : filters.nationalProduction.toString()}
														onValueChange={(value) => updateFilter('nationalProduction', value === '' ? null : value === 'true')}
														className="mt-2"
													>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="true" id="national-yes" />
															<Label htmlFor="national-yes">Sim</Label>
														</div>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="false" id="national-no" />
															<Label htmlFor="national-no">Não</Label>
														</div>
													</RadioGroup>
												</div>

												<div>
													<Label className="text-sm font-semibold">Revisado por Pares</Label>
													<RadioGroup
														value={filters.peerReviewed === null ? '' : filters.peerReviewed.toString()}
														onValueChange={(value) => updateFilter('peerReviewed', value === '' ? null : value === 'true')}
														className="mt-2"
													>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="true" id="peer-yes" />
															<Label htmlFor="peer-yes">Sim</Label>
														</div>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="false" id="peer-no" />
															<Label htmlFor="peer-no">Não</Label>
														</div>
													</RadioGroup>
												</div>

												<div>
													<Label className="text-sm font-semibold">Áreas</Label>
													<div className="space-y-2 mt-2">
														{['Ciências Humanas', 'Ciências Sociais Aplicadas', 'Linguística, Letras e Artes', 'Multidisciplinar', 'Ciências da Saúde'].map((area) => (
															<div key={area} className="flex items-center space-x-2">
																<Checkbox
																	id={`area-${area}`}
																	checked={filters.areas.includes(area)}
																	onCheckedChange={(checked) => {
																		if (checked) {
																			updateFilter('areas', [...filters.areas, area])
																		} else {
																			updateFilter(
																				'areas',
																				filters.areas.filter((a) => a !== area)
																			)
																		}
																	}}
																/>
																<Label htmlFor={`area-${area}`}>{area}</Label>
															</div>
														))}
													</div>
												</div>

												<div>
													<Label className="text-sm font-semibold">Idioma</Label>
													<div className="space-y-2 mt-2">
														{['Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano'].map((lang) => (
															<div key={lang} className="flex items-center space-x-2">
																<Checkbox
																	id={`lang-${lang}`}
																	checked={filters.language.includes(lang)}
																	onCheckedChange={(checked) => {
																		if (checked) {
																			updateFilter('language', [...filters.language, lang])
																		} else {
																			updateFilter(
																				'language',
																				filters.language.filter((l) => l !== lang)
																			)
																		}
																	}}
																/>
																<Label htmlFor={`lang-${lang}`}>{lang}</Label>
															</div>
														))}
													</div>
												</div>
											</div>
										</ScrollArea>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						<div className="flex-1 flex flex-col">
							<div className="flex items-center gap-2 mb-4">
								<Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="shrink-0">
									<ChevronLeft className="h-5 w-5" />
								</Button>
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
									<Input
										className="pl-10 pr-10 py-6 text-lg bg-white border-[#2E144D]"
										placeholder="Ex: artigos recentes sobre IA na educação..."
										value={query}
										onChange={(e) => setQuery(e.target.value)}
									/>
									<Button
										variant="ghost"
										size="icon"
										className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-red-500' : 'text-muted-foreground'}`}
										onClick={handleVoiceSearch}
									>
										<Mic className="h-5 w-5" />
									</Button>
								</div>
								<Button onClick={performSearch} size="icon" className="bg-[#2E144D] text-white">
									<Search className="h-5 w-5" />
								</Button>
							</div>

							<div className="flex-1 bg-gray-100 rounded-lg p-4 overflow-auto">
								{isLoading ? (
									<p className="text-center text-muted-foreground">Carregando resultados...</p>
								) : results.length > 0 ? (
									<div className="space-y-4">
										{results.map((result) => (
											<div key={result.id} className="bg-white p-4 rounded-lg shadow">
												<h3 className="text-lg font-semibold text-[#2E144D]">{result.title}</h3>
												<p className="text-sm text-muted-foreground">
													{result.authors.join(', ')} - {result.year}
												</p>
												<p className="text-sm mt-2">{result.abstract}</p>
												<div className="mt-2 flex flex-wrap items-center gap-2">
													<span className={`text-xs px-2 py-1 rounded ${result.isOpenAccess ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
														{result.isOpenAccess ? 'Acesso Aberto' : 'Acesso Restrito'}
													</span>
													<span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">{result.type}</span>
													<span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">{result.area}</span>
													<span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">{result.language}</span>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-center text-muted-foreground">Nenhum resultado encontrado. Tente ajustar seus filtros ou termos de busca.</p>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
