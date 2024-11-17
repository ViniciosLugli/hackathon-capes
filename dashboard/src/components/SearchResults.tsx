'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useSearch } from '@/contexts/SearchContext'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

export function SearchResults() {
	const { advancedResults, filterResults, isLoading, aiResponse } = useSearch()

	const results = advancedResults.length > 0 ? advancedResults : filterResults

	return (
		<ScrollArea className="h-[calc(100vh-200px)]">
			<div className="space-y-4 p-4">
				{aiResponse && (
					<Card className="bg-[#2E144D] text-white">
						<CardHeader>
							<CardTitle>Resposta personalizada</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{aiResponse}</p>
						</CardContent>
					</Card>
				)}

				{isLoading
					? Array.from({ length: 5 }).map((_, index) => (
							<Card key={`skeleton-${index}`}>
								<CardContent className="p-6">
									<Skeleton className="h-6 w-3/4 mb-2" />
									<Skeleton className="h-4 w-1/2 mb-4" />
									<Skeleton className="h-20 w-full mb-4" />
									<div className="flex items-center gap-2">
										<Skeleton className="h-4 w-1/4" />
										<Skeleton className="h-6 w-24 rounded-full" />
									</div>
								</CardContent>
							</Card>
					  ))
					: results.map((result) => (
							<motion.div key={`search-result-${result.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
								<Card>
									<CardContent className="p-6">
										<h3 className="text-lg font-semibold text-[#2E144D] hover:underline cursor-pointer">
											<a href={`/article/${result.id}`} className="focus:outline-none focus:ring-2 focus:ring-[#2E144D] focus:ring-offset-2 rounded">
												{result.title}
											</a>
										</h3>
										<p className="text-sm text-muted-foreground mt-1">{result.authors.join(', ')}</p>
										<p className="text-sm mt-2">{result.abstract}</p>
										<div className="flex items-center gap-2 mt-4">
											<span className="text-sm text-muted-foreground">
												{result.journal} • {result.year}
											</span>
											{result.isOpenAccess && (
												<Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
													Acesso Aberto
												</Badge>
											)}
										</div>
									</CardContent>
								</Card>
							</motion.div>
					  ))}
			</div>
		</ScrollArea>
	)
}
