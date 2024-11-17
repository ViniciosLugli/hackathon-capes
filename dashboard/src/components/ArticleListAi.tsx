'use client'

import { Article } from '@/types'
import { motion } from 'framer-motion'
import { ArticleCard } from '@/components/ArticleCard'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { Sparkles } from 'lucide-react'

interface ArticleListAiProps {
	articles: Article[]
	isLoading: boolean
}

export function ArticleListAi({ articles, isLoading }: ArticleListAiProps) {
	if (isLoading) {
		return (
			<div className="mb-8 animate-pulse">
				<div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
				<div className="space-y-4">
					{[...Array(3)].map((_, index) => (
						<div key={index} className="bg-gray-200 h-24 rounded-lg"></div>
					))}
				</div>
			</div>
		)
	}

	if (articles.length === 0) {
		return null
	}

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
			<h2 className="flex items-center text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
				<Sparkles className="w-6 h-6 mr-2 text-purple-500" />
				<TextGenerateEffect>Resultados em Destaque pela IA</TextGenerateEffect>
			</h2>
			<ul className="space-y-4">
				{articles.map((article, index) => (
					<li key={article.id}>
						<ArticleCard article={article} index={index + 1} />
					</li>
				))}
			</ul>
		</motion.div>
	)
}
