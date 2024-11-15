'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdvancedSearch } from '@/components/AdvancedSearch'
import { FilterSidebar } from '@/components/FilterSidebar'
import { SearchResults } from '@/components/SearchResults'
import { useSearch } from '@/contexts/SearchContext'
import { ScrollArea } from '@/components/ui/scroll-area'

export function SearchPage() {
	const { isExpanded, setIsExpanded } = useSearch()

	return (
		<AnimatePresence>
			{isExpanded && (
				<motion.div className="fixed inset-0 bg-[#F1F1F1] z-50 overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center gap-4 mb-8">
							<Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="shrink-0">
								<ArrowLeft className="h-5 w-5" />
							</Button>
							<AdvancedSearch />
						</div>

						<div className="grid md:grid-cols-[300px,1fr] gap-8">
							<FilterSidebar />
							<ScrollArea className="h-[calc(100vh-200px)]">
								<SearchResults />
							</ScrollArea>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
