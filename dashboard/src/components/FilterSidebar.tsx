'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FilterOptions {
	topics: string[]
	languages: string[]
	publicationTypes: string[]
	statuses: string[]
	journalNames: string[]
}

interface FilterSidebarProps {
	onFilterChange: (filters: any) => void
	onResetFilters: () => void
}

export function FilterSidebar({ onFilterChange, onResetFilters }: FilterSidebarProps) {
	const [filters, setFilters] = useState({
		title: '',
		authors: [],
		publicationYearRange: { from: null, to: null },
		topics: [],
		language: '',
		isOpenAccess: false,
		peerReviewed: false,
		publicationType: '',
		status: '',
		journalName: '',
	})

	const [filterOptions, setFilterOptions] = useState<FilterOptions>({
		topics: [],
		languages: [],
		publicationTypes: [],
		statuses: [],
		journalNames: [],
	})

	useEffect(() => {
		const fetchFilterOptions = async () => {
			try {
				const response = await fetch('/api/articles/filters')
				if (!response.ok) {
					throw new Error('Failed to fetch filter options')
				}
				const data = await response.json()
				setFilterOptions(data)
			} catch (error) {
				console.error('Error fetching filter options:', error)
			}
		}

		fetchFilterOptions()
	}, [])

	const handleFilterChange = useCallback((key: string, value: any) => {
		setFilters((prev) => ({ ...prev, [key]: value }))
	}, [])

	const applyFilters = useCallback(() => {
		onFilterChange(filters)
	}, [filters, onFilterChange])

	const resetFilters = useCallback(() => {
		setFilters({
			title: '',
			authors: [],
			publicationYearRange: { from: null, to: null },
			topics: [],
			language: '',
			isOpenAccess: false,
			peerReviewed: false,
			publicationType: '',
			status: '',
			journalName: '',
		})
		onResetFilters()
	}, [onResetFilters])

	return (
		<ScrollArea className="h-[calc(100vh-4rem)] w-80 rounded-md border p-4">
			<Accordion type="single" collapsible className="w-full">
				<AccordionItem value="search">
					<AccordionTrigger>Pesquisa</AccordionTrigger>
					<AccordionContent>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">Título ou Resumo</Label>
								<Input id="title" placeholder="Pesquisar por título ou resumo" value={filters.title} onChange={(e) => handleFilterChange('title', e.target.value)} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="authors">Autores</Label>
								<Input
									id="authors"
									placeholder="Adicionar autor"
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault()
											const value = e.currentTarget.value.trim()
											if (value) {
												handleFilterChange('authors', [...filters.authors, value])
												e.currentTarget.value = ''
											}
										}
									}}
								/>
								<div className="flex flex-wrap gap-2 mt-2">
									{filters.authors.map((author, index) => (
										<div key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center">
											{author}
											<button
												className="ml-2 text-secondary-foreground/50 hover:text-secondary-foreground"
												onClick={() =>
													handleFilterChange(
														'authors',
														filters.authors.filter((_, i) => i !== index)
													)
												}
											>
												×
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="publication">
					<AccordionTrigger>Publicação</AccordionTrigger>
					<AccordionContent>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>Ano de Publicação</Label>
								<DateRangePicker onChange={(range) => handleFilterChange('publicationYearRange', range)} value={filters.publicationYearRange} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="publicationType">Tipo de Publicação</Label>
								<Select onValueChange={(value) => handleFilterChange('publicationType', value)} value={filters.publicationType}>
									<SelectTrigger id="publicationType">
										<SelectValue placeholder="Selecione o tipo" />
									</SelectTrigger>
									<SelectContent>
										{filterOptions.publicationTypes.map((type) => (
											<SelectItem key={type} value={type}>
												{type}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="journalName">Nome do Periódico</Label>
								<Select onValueChange={(value) => handleFilterChange('journalName', value)} value={filters.journalName}>
									<SelectTrigger id="journalName">
										<SelectValue placeholder="Selecione o periódico" />
									</SelectTrigger>
									<SelectContent>
										{filterOptions.journalNames.map((journal) => (
											<SelectItem key={journal} value={journal}>
												{journal}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="topics">
					<AccordionTrigger>Tópicos</AccordionTrigger>
					<AccordionContent>
						<div className="space-y-2">
							{filterOptions.topics.map((topic) => (
								<div key={topic} className="flex items-center space-x-2">
									<Checkbox
										id={`topic-${topic}`}
										checked={filters.topics.includes(topic)}
										onCheckedChange={(checked) => {
											if (checked) {
												handleFilterChange('topics', [...filters.topics, topic])
											} else {
												handleFilterChange(
													'topics',
													filters.topics.filter((t) => t !== topic)
												)
											}
										}}
									/>
									<Label htmlFor={`topic-${topic}`}>{topic}</Label>
								</div>
							))}
						</div>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="attributes">
					<AccordionTrigger>Atributos</AccordionTrigger>
					<AccordionContent>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Label htmlFor="isOpenAccess">Acesso Aberto</Label>
								<Switch id="isOpenAccess" checked={filters.isOpenAccess} onCheckedChange={(checked) => handleFilterChange('isOpenAccess', checked)} />
							</div>
							<div className="flex items-center justify-between">
								<Label htmlFor="peerReviewed">Revisado por Pares</Label>
								<Switch id="peerReviewed" checked={filters.peerReviewed} onCheckedChange={(checked) => handleFilterChange('peerReviewed', checked)} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="language">Idioma</Label>
								<Select onValueChange={(value) => handleFilterChange('language', value)} value={filters.language}>
									<SelectTrigger id="language">
										<SelectValue placeholder="Selecione o idioma" />
									</SelectTrigger>
									<SelectContent>
										{filterOptions.languages.map((language) => (
											<SelectItem key={language} value={language}>
												{language}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="status">Status</Label>
								<Select onValueChange={(value) => handleFilterChange('status', value)} value={filters.status}>
									<SelectTrigger id="status">
										<SelectValue placeholder="Selecione o status" />
									</SelectTrigger>
									<SelectContent>
										{filterOptions.statuses.map((status) => (
											<SelectItem key={status} value={status}>
												{status}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
			<div className="mt-6 space-y-2">
				<Button onClick={applyFilters} className="w-full bg-[#2E144D] text-white hover:bg-[#2E144D]/90 transition-colors duration-200">
					Aplicar Filtros
				</Button>
				<Button onClick={resetFilters} variant="outline" className="w-full border-[#2E144D] text-[#2E144D] hover:bg-[#2E144D]/10 transition-colors duration-200">
					Limpar Filtros
				</Button>
			</div>
		</ScrollArea>
	)
}
