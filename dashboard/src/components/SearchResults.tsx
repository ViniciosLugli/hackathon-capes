'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useSearch } from '@/contexts/SearchContext'

export function SearchResults() {
	const { results } = useSearch()

	return (
		<div className="space-y-4">
			{results.map((result) => (
				<motion.div key={`search-result-${result.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg p-6">
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
	)
}
