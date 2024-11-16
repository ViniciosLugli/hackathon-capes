'uou client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mic, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSearch } from '@/contexts/SearchContext'

export function AdvancedSearch() {
	const { isExpanded, setIsExpanded, query, setQuery, performSearch, results } = useSearch()
	const [isListening, setIsListening] = useState(false)

	const handleVoiceSearch = () => {
		setIsListening(true)
		setTimeout(() => {
			setIsListening(false)
			setQuery('example voice search')
			performSearch()
		}, 2000)
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
								className="pl-10 pr-20 py-6 text-lg bg-white border-gray-300"
								placeholder="Search articles..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onFocus={() => setIsExpanded(true)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										performSearch()
									}
								}}
							/>
							<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
								<Button variant="ghost" size="icon" className={`transition-colors ${isListening ? 'text-red-500' : 'text-gray-500'}`} onClick={handleVoiceSearch}>
									<Mic className="h-5 w-5" />
								</Button>
							</div>
						</div>
						<Button onClick={() => setIsExpanded(true)} className="bg-[#2E144D] text-white">
							Search
						</Button>
					</motion.div>
				) : (
					<motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed inset-0 bg-white z-50 p-4 flex flex-col">
						<div className="flex items-center gap-2 mb-4">
							<Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="shrink-0">
								<ChevronLeft className="h-5 w-5" />
							</Button>
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
								<Input
									className="pl-10 pr-10 py-6 text-lg bg-white border-gray-300"
									placeholder="Ex: recent AI articles in education..."
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											performSearch()
										}
									}}
								/>
								<Button
									variant="ghost"
									size="icon"
									className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-red-500' : 'text-gray-500'}`}
									onClick={handleVoiceSearch}
								>
									<Mic className="h-5 w-5" />
								</Button>
							</div>
							<Button onClick={performSearch} size="icon" className="bg-[#2E144D] text-white">
								<Search className="h-5 w-5" />
							</Button>
						</div>

						{/* Display Results */}
						<div className="flex-1 overflow-auto">
							{results.length > 0 ? (
								<ul className="space-y-4">
									{results.map((result) => (
										<li key={result.id} className="bg-gray-100 p-4 rounded-lg">
											<h3 className="text-lg font-bold">{result.title}</h3>
											<p>{result.abstract}</p>
											<p className="text-sm text-gray-500">{result.authors.join(', ')}</p>
										</li>
									))}
								</ul>
							) : (
								<p className="text-center text-gray-500">No results found</p>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
