import React from 'react'
import { Article } from '@/types'
import { ArticleCard } from '@/components/ArticleCard'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

interface ArticleListProps {
	articles: Article[]
	isLoading: boolean
	totalResults: number
	currentPage: number
	pageSize: number
	onPageChange: (page: number) => void
}

export function ArticleList({ articles, isLoading, totalResults, currentPage, pageSize, onPageChange }: ArticleListProps) {
	const totalPages = Math.ceil(totalResults / pageSize)

	if (isLoading && articles.length === 0) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-[#5EC5E0]" />
			</div>
		)
	}

	if (articles.length === 0) {
		return <div className="text-center text-gray-500 p-4">Nenhum artigo encontrado. Tente ajustar seus filtros de pesquisa.</div>
	}

	return (
		<div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
			<div className="space-y-8 mb-8">
				{articles.map((article, index) => (
					<ArticleCard key={article.id} article={article} index={(currentPage - 1) * pageSize + index + 1} />
				))}
			</div>
			<div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0">
				<div className="text-sm text-gray-500 text-center sm:text-left">
					Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalResults)} de {totalResults} resultados
				</div>
				<div className="flex flex-wrap justify-center gap-2">
					<Button
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1 || isLoading}
						variant="outline"
						size="sm"
						className="px-2 bg-white text-[#2E144D] border-[#2E144D] hover:bg-[#F1F1F1]"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
						<Button
							key={page}
							onClick={() => onPageChange(page)}
							disabled={isLoading}
							variant={currentPage === page ? 'default' : 'outline'}
							size="sm"
							className={`px-3 ${currentPage === page ? 'bg-[#2E144D] text-white' : 'bg-white text-[#2E144D] border-[#2E144D] hover:bg-[#F1F1F1]'}`}
						>
							{page}
						</Button>
					))}
					<Button
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === totalPages || isLoading}
						variant="outline"
						size="sm"
						className="px-2 bg-white text-[#2E144D] border-[#2E144D] hover:bg-[#F1F1F1]"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	)
}
